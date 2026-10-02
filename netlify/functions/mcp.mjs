// Reference Check: a public, read-only MCP server at /mcp.
// Stateless Streamable HTTP; nothing is stored between or during requests.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import {
  checkReferences,
  findReference,
  MAX_REFERENCES,
} from "../../server/reference-check/src/check.mjs";

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: true };
const NO_SIGN_IN = { securitySchemes: [{ type: "noauth" }] };

function reply(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function getServer() {
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
              text: z.string().min(1).max(2000).describe("One reference, exactly as written in the list."),
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
    async ({ references }) => reply(await checkReferences(references))
  );

  server.registerTool(
    "find_reference",
    {
      title: "Find a reference in Crossref",
      description:
        "Searches Crossref by title, and author when given, and returns up to five of the closest records with their DOIs, authors, year and where they were published, each with a title similarity from 0 to 1. Use it to find the DOI or the correct details of a single work. It returns only records Crossref holds.",
      inputSchema: {
        title: z.string().min(1).max(500).describe("The title of the work."),
        author: z.string().max(200).optional().describe("An author's surname, when known."),
      },
      annotations: READ_ONLY,
      _meta: NO_SIGN_IN,
    },
    async ({ title, author }) => reply(await findReference({ title, author }))
  );

  return server;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }
  const server = getServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    await server.connect(transport);
    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP error:", error?.message);
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/mcp",
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
