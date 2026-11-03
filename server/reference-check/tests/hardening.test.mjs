import { test, after } from "node:test";
import assert from "node:assert/strict";
import handler from "../../../netlify/functions/mcp.mjs";
import { readJsonBody, BodyTooLargeError } from "../src/body.mjs";
import { search, resolveDoi, LookupError } from "../src/crossref.mjs";
import { checkReferences } from "../src/check.mjs";

// Any accidental live call fails the test before leaving this process.
const unexpectedRequests = [];
globalThis.fetch = async (url) => {
  unexpectedRequests.push(url);
  throw new Error("Network access forbidden in tests");
};
after(() => assert.deepEqual(unexpectedRequests, []));

function request(body, headers = {}) {
  return new Request("https://mcp.example/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
    body: JSON.stringify(body),
  });
}

const call = (name, args, id = 1) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });

test("MCP initialization, discovery, notifications and method rejection still work", async () => {
  const init = await handler(request({ jsonrpc: "2.0", id: 1, method: "initialize", params: {
    protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "offline-test", version: "1" },
  } }));
  assert.equal(init.status, 200);
  assert.equal((await init.json()).result.serverInfo.name, "reference-check");
  const list = await handler(request({ jsonrpc: "2.0", id: 2, method: "tools/list" }));
  assert.equal((await list.json()).result.tools.length, 2);
  assert.equal((await handler(request({ jsonrpc: "2.0", method: "notifications/initialized" }))).status, 202);
  const get = await handler(new Request("https://mcp.example/mcp"));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST");
});

test("MCP rejects JSON-RPC batches before any Crossref work", async () => {
  const response = await handler(request([call("find_reference", { title: "x" }), call("find_reference", { title: "x" }, 2)]));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, -32600);
});

test("MCP rejects oversized reference collections before schema validation", async () => {
  const response = await handler(request(call("check_references", { references: Array(10000).fill(null) })));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, -32602);
});

test("MCP rejects invalid fields and blank searches without fetching", async () => {
  for (const [name, args] of [
    ["find_reference", { title: "   " }],
    ["find_reference", { title: "x".repeat(501) }],
    ["check_references", { references: [{ text: "\n " }] }],
    ["check_references", { references: [{ text: "x", doi: 123 }] }],
    ["check_references", { references: [] }],
  ]) {
    const body = await (await handler(request(call(name, args)))).json();
    assert.ok(body.error || body.result?.isError);
  }
});

test("MCP rejects cross-origin calls, non-JSON content and malformed JSON", async () => {
  assert.equal((await handler(request({}, { origin: "https://untrusted.example" }))).status, 403);
  assert.equal((await handler(request({}, { "content-type": "text/plain" }))).status, 415);
  const malformed = new Request("https://mcp.example/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
  assert.equal((await handler(malformed)).status, 400);
  assert.equal((await handler(request({ jsonrpc: "2.0", id: 1, method: "ping" }, { origin: "https://mcp.example" }))).status, 200);
});

test("MCP caps actual body bytes without trusting Content-Length", async () => {
  for (const headers of [{}, { "content-length": "1" }]) {
    assert.equal((await handler(request({ data: "x".repeat(512 * 1024) }, headers))).status, 413);
  }
});

test("MCP accepts a maximally sized escaped reference list", async () => {
  // Only discovery is requested: this verifies the byte allowance without network I/O.
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping", params: {
    arguments: { references: Array.from({ length: 25 }, () => ({ text: "\u0001".repeat(2000), doi: "\u0001".repeat(300) })) },
  } });
  const response = await handler(new Request("https://mcp.example/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body,
  }));
  assert.equal(response.status, 200);
});

test("all MCP responses have their own security and no-store headers", async () => {
  for (const req of [request({ jsonrpc: "2.0", id: 1, method: "ping" }), new Request("https://mcp.example/mcp"), request([])]) {
    const res = await handler(req);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.match(res.headers.get("content-security-policy"), /frame-ancestors 'none'/);
    assert.equal(res.headers.get("referrer-policy"), "no-referrer");
  }
});

test("bounded body reader handles split UTF-8 and cancels oversized streams", async () => {
  const bytes = new TextEncoder().encode('"é"');
  const stream = new ReadableStream({ start(c) { for (const byte of bytes) c.enqueue(Uint8Array.of(byte)); c.close(); } });
  assert.equal(await readJsonBody(new Response(stream), 4), "é");
  let cancelled = false;
  const large = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(10)); }, cancel() { cancelled = true; } });
  await assert.rejects(readJsonBody(new Response(large), 5), BodyTooLargeError);
  assert.equal(cancelled, true);
});

test("aborting a stalled body read cancels it promptly", async () => {
  const controller = new AbortController();
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const reading = readJsonBody(new Response(stream), 100, controller.signal);
  controller.abort();
  await assert.rejects(reading, { name: "AbortError" });
  assert.equal(cancelled, true);
});

test("the 12-second Crossref timeout covers a stalled response body", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let cancelled = false;
  const work = search("title", 5, async () => new Response(new ReadableStream({
    cancel() { cancelled = true; },
  })));
  await new Promise(setImmediate);
  t.mock.timers.tick(12000);
  await assert.rejects(work, LookupError);
  assert.equal(cancelled, true);
});

test("the 45-second MCP deadline stops active and subsequent reference lookups", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return new Response(new ReadableStream());
  });
  const work = handler(request(call("check_references", {
    references: Array.from({ length: 25 }, () => ({ text: "A reference" })),
  })));
  await new Promise(setImmediate);
  t.mock.timers.tick(45000);
  const body = await (await work).json();
  assert.equal(body.result.structuredContent.summary.could_not_check, 25);
  assert.ok(calls <= 3);
});

test("Crossref malformed JSON, missing results and malformed records are lookup failures", async () => {
  for (const makeResponse of [
    () => new Response("private upstream text"),
    () => Response.json({}),
    () => Response.json({ message: {} }),
    () => Response.json({ message: { items: "not an array" } }),
    () => Response.json({ message: { items: [{ author: "not an array" }] } }),
    () => Response.json({ message: { items: [null] } }),
    () => new Response("x".repeat(2 * 1024 * 1024 + 1)),
  ]) {
    const result = await checkReferences([{ text: "A reference" }], async () => makeResponse());
    assert.equal(result.results[0].result, "could_not_check");
    assert.doesNotMatch(JSON.stringify(result), /private upstream text/);
  }
});

test("Crossref URLs stay on the fixed origin and redirects are refused", async () => {
  await resolveDoi("https://untrusted.example/?secret=value", async (url, options) => {
    assert.equal(new URL(url).origin, "https://api.crossref.org");
    assert.equal(new URL(url).searchParams.get("mailto"), "alignmentandintegration@gmail.com");
    assert.equal(options.redirect, "error");
    return new Response(null, { status: 404 });
  });
});

test("429 retries are bounded and unused response bodies are cancelled", async () => {
  let calls = 0;
  let cancelled = 0;
  await assert.rejects(search("title", 5, async () => {
    calls++;
    return new Response(new ReadableStream({ cancel() { cancelled++; } }), { status: 429 });
  }), LookupError);
  assert.equal(calls, 3);
  assert.equal(cancelled, 3);
});

test("long Retry-After values stop retries and pause the warm instance", async (t) => {
  const client = await import("../src/crossref.mjs?cooldown-test");
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return new Response(null, { status: 429, headers: { "retry-after": "120" } });
  });
  await assert.rejects(client.search("one"), /Crossref is busy/);
  await assert.rejects(client.search("two"), /Crossref is busy/);
  assert.equal(calls, 1);
});

test("HTTP-date Retry-After values are respected", async () => {
  let calls = 0;
  await assert.rejects(search("title", 5, async () => {
    calls++;
    return new Response(null, { status: 429, headers: { "retry-after": new Date(Date.now() + 120000).toUTCString() } });
  }), /Crossref is busy/);
  assert.equal(calls, 1);
});

test("one instance permits at most three Crossref operations, including waiting calls", async (t) => {
  const client = await import("../src/crossref.mjs?concurrency-test");
  const pending = [];
  const starts = [];
  let ready;
  const allStarted = new Promise((resolve) => { ready = resolve; });
  t.mock.method(globalThis, "fetch", () => new Promise((resolve) => {
    starts.push(Date.now());
    pending.push(resolve);
    if (pending.length === 3) ready();
  }));
  const work = Array.from({ length: 3 }, () => client.search("title"));
  await assert.rejects(client.search("overflow"), /Crossref is busy/);
  await allStarted;
  assert.ok(starts[1] - starts[0] >= 300);
  assert.ok(starts[2] - starts[1] >= 300);
  for (const resolve of pending) resolve(Response.json({ message: { items: [] } }));
  await Promise.all(work);
});

test("one deadline cancels active fetches and prevents later references starting network work", async () => {
  const controller = new AbortController();
  let calls = 0;
  const work = checkReferences(Array.from({ length: 25 }, () => ({ text: "A reference" })), async (_url, { signal }) => {
    calls++;
    return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
  }, controller.signal);
  controller.abort();
  const out = await work;
  assert.equal(calls, 3);
  assert.equal(out.summary.could_not_check, 25);
});

test("upstream error text never reaches MCP responses or application logs", async (t) => {
  const logs = [];
  t.mock.method(console, "error", (...args) => logs.push(args));
  t.mock.method(globalThis, "fetch", async () => new Response('private upstream text: "pasted reference"'));
  const response = await handler(request(call("find_reference", { title: "An ordinary title" })));
  const body = await response.json();
  assert.equal(body.result.isError, true);
  assert.doesNotMatch(JSON.stringify(body), /private upstream text|pasted reference/);
  assert.deepEqual(logs, []);
});
