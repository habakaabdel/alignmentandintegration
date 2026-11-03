// Reference Check: a public, read-only MCP server at /mcp.
// Stateless Streamable HTTP; references are not persisted.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { readJsonBody, BodyTooLargeError } from "../../server/reference-check/src/body.mjs";
import { LookupError } from "../../server/reference-check/src/crossref.mjs";
import {
  checkReferences,
  findReference,
  MAX_REFERENCES,
} from "../../server/reference-check/src/check.mjs";

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: true };
const NO_SIGN_IN = { securitySchemes: [{ type: "noauth" }] };
const MAX_BODY_BYTES = 512 * 1024;
const MAX_BATCH_MESSAGES = 10;
const REQUEST_TIMEOUT_MS = 45000;
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000",
};

function rpcError(status, code, message) {
  return Response.json({ jsonrpc: "2.0", error: { code, message }, id: null }, { status });
}

async function runTool(operation) {
  try {
    return reply(await operation());
  } catch (error) {
    // Never log reference text, URLs, upstream bodies or arbitrary error messages.
    if (!(error instanceof LookupError)) console.error("MCP tool failed");
    return {
      isError: true,
      content: [{ type: "text", text: error instanceof LookupError ? error.message : "Internal server error" }],
    };
  }
}

function reply(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function getServer(signal) {
  const server = new McpServer({ name: "reference-check", version: "1.0.0" });

  server.registerTool(
    "check_references",
    {
      title: "Check references against Crossref",
      description:
        `Looks up each reference in a list (up to ${MAX_REFERENCES}) in Crossref and reports one result per reference: "match" (the Crossref record agrees with the pasted title, first author and year), "mismatch" (a record exists but the DOI, title, first author or year differs; the Crossref record is returned beside it), "not_found_in_crossref" (no record found), or "could_not_check" (Crossref did not answer). "not_found_in_crossref" does not mean a reference is fake: books, reports, theses and DOIs registered with other agencies such as DataCite are outside Crossref. Pass each reference exactly as written. This tool does not write, format or invent references.`,
      inputSchema: {
        references: z
          .array(
            z.object({
              text: z.string().min(1).max(2000).refine((s) => s.trim().length > 0).describe("One reference, exactly as written in the list."),
              doi: z.string().max(300).optional().describe("The DOI of this reference, when it has one."),
            })
          )
          .min(1)
          .max(MAX_REFERENCES)
          .describe("The references to check, one entry each."),
      },
      annotations: READ_ONLY,
      _meta: NO_SIGN_IN,
    },
    async ({ references }) => runTool(() => checkReferences(references, undefined, signal))
  );

  server.registerTool(
    "find_reference",
    {
      title: "Find a reference in Crossref",
      description:
        "Searches Crossref by title, and author when given, and returns up to five of the closest records with their DOIs, authors, year and where they were published, each with a title similarity from 0 to 1. Use it to find the DOI or the correct details of a single work. It returns only records Crossref holds.",
      inputSchema: {
        title: z.string().min(1).max(500).refine((s) => s.trim().length > 0).describe("The title of the work."),
        author: z.string().max(200).optional().describe("An author's surname, when known."),
      },
      annotations: READ_ONLY,
      _meta: NO_SIGN_IN,
    },
    async ({ title, author }) => runTool(() => findReference({ title, author }, undefined, signal))
  );

  return server;
}

async function handle(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return rpcError(403, -32000, "Origin not allowed");
  }
  if (req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return rpcError(415, -32000, "Content-Type must be application/json");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const signal = AbortSignal.any([req.signal, controller.signal]);
  let server;
  try {
    let body;
    try {
      body = await readJsonBody(req, MAX_BODY_BYTES, signal);
    } catch (error) {
      if (signal.aborted) return rpcError(408, -32000, "Request timed out");
      if (error instanceof BodyTooLargeError) return rpcError(413, -32000, "Request body too large");
      return rpcError(400, -32700, "Invalid JSON");
    }
    // Protocol 2025-03-26 allows batches, so keep them, but bound them: one
    // HTTP request may not do more Crossref work than one full check.
    const messages = Array.isArray(body) ? body : [body];
    if (messages.length > MAX_BATCH_MESSAGES) return rpcError(400, -32600, "Batch too large");
    let lookups = 0;
    for (const message of messages) {
      const references = message?.params?.arguments?.references;
      lookups += Array.isArray(references) ? references.length : message?.method === "tools/call" ? 1 : 0;
    }
    // Reject oversized collections before Zod allocates per-element issues.
    if (lookups > MAX_REFERENCES) return rpcError(400, -32602, "Too many references");
    server = getServer(signal);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      maxRequestBodySize: MAX_BODY_BYTES,
    });
    await server.connect(transport);
    return await transport.handleRequest(req, { parsedBody: body });
  } catch {
    console.error("MCP request failed");
    return rpcError(500, -32603, "Internal server error");
  } finally {
    clearTimeout(timeout);
    await server?.close();
  }
}

export default async (req) => {
  const response = await handle(req);
  for (const [key, value] of Object.entries(RESPONSE_HEADERS)) response.headers.set(key, value);
  return response;
};

export const config = {
  path: "/mcp",
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
