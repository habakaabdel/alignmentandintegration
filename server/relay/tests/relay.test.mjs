// Offline tests for the webhook relay at netlify/functions/relay.mjs.
// Run with `npm test` (every test in the repo) or `node --test server/relay/tests/*.test.mjs`.
// Every secret and token below is a fake value for these tests only.

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import handler, { retryAfterMs, shape } from "../../../netlify/functions/relay.mjs";

const FAKE_ENV = {
  NETLIFY_FORMS_SECRET: "test-only-netlify-forms-secret",
  CALCOM_WEBHOOK_SECRET: "test-only-calcom-secret",
  VISITOR_WEBHOOK_SECRET: "test-only-visitor-secret",
  ROUTINE_FIRE_URL: "https://api.example.invalid/v1/claude_code/routines/trig_test/fire",
  ROUTINE_FIRE_TOKEN: "sk-test-only-not-a-real-token",
};

const realFetch = globalThis.fetch;
const realLog = console.log;
const realError = console.error;
let logged = [];

beforeEach(() => {
  Object.assign(process.env, FAKE_ENV);
  logged = [];
  console.log = (...a) => logged.push(a.join(" "));
  console.error = (...a) => logged.push(a.join(" "));
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.log = realLog;
  console.error = realError;
});

// A fetch stand-in that answers from a queue and records every call.
function mockFetch(queue) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, text: JSON.parse(init.body).text });
    if (queue.length === 0) throw new Error("fetch called more times than expected");
    const next = queue.shift();
    if (next instanceof Error) throw next;
    return new Response(next.body ?? "{}", { status: next.status, headers: next.headers ?? {} });
  };
  return calls;
}

const b64u = (s) => Buffer.from(s).toString("base64url");

function netlifyJws(raw, secret, { alg = "HS256", iss = "netlify", sha256 } = {}) {
  const h = b64u(JSON.stringify({ alg, typ: "JWT" }));
  const p = b64u(JSON.stringify({ iss, sha256: sha256 ?? createHash("sha256").update(raw).digest("hex") }));
  const s = createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${s}`;
}

const calHmac = (raw, secret) => createHmac("sha256", secret).update(raw).digest("hex");

function post(body, headers = {}, query = "") {
  return new Request(`https://alignmentandintegration.com/relay${query}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

const contactBody = JSON.stringify({
  number: 12,
  form_name: "contact",
  created_at: "2026-10-17T20:55:01.123Z",
  site_url: "https://alignmentandintegration.com",
  data: {
    name: "Test Person",
    email: "test.person@example.com",
    organization: "Example Clinic",
    situation: "We want to map intake before the new year.",
    "referral-source": "",
    "form-name": "contact",
    ip: "203.0.113.9",
    user_agent: "Mozilla/5.0 (test agent)",
    referrer: "https://alignmentandintegration.com/",
  },
});

const consultBody = JSON.stringify({
  form_name: "ai-readiness-consult",
  created_at: "2026-10-18T09:10:11Z",
  data: {
    name: "Second Person",
    email: "second.person@example.com",
    work: "Restaurant owner",
    focus: "Scheduling and the weekly order.",
    "company-site": "",
    ip: "203.0.113.10",
  },
});

const bookingBody = JSON.stringify({
  triggerEvent: "BOOKING_CREATED",
  createdAt: "2026-10-17T21:00:00.000Z",
  payload: {
    title: "Free consultation between Abdel and Booker Person",
    eventTitle: "Free consultation",
    startTime: "2026-10-21T14:00:00Z",
    endTime: "2026-10-21T14:30:00Z",
    uid: "abc123",
    attendees: [{ name: "Booker Person", email: "booker.person@example.com", timeZone: "America/Toronto" }],
    organizer: { name: "Abdel", email: "owner@example.com", timeZone: "America/Winnipeg" },
    responses: {
      name: { label: "Your name", value: "Booker Person" },
      email: { label: "Email", value: "booker.person@example.com" },
      notes: { label: "Anything to cover", value: "Two clinics, one intake form." },
      guests: { label: "Guests", value: [] },
      location: { label: "Location", value: { optionValue: "", value: "integrations:daily" } },
    },
  },
});

const visitorBody = JSON.stringify({
  company: { name: "Example Health Network", domain: "example-health.test", country: "Canada" },
  pages: ["/ai-readiness/", "/organizations/", { url: "/demos/community-hub-portal/" }],
  timestamp: "2026-10-17T22:15:00Z",
});

function assertPlain(text) {
  assert.ok(!/[{}[\]]/.test(text), `text looks like a JSON dump: ${text}`);
  assert.ok(!/"\w+":/.test(text), `text carries JSON keys: ${text}`);
}

function assertNothingLeaked(fields) {
  const all = logged.join("\n");
  for (const f of [...fields, ...Object.values(FAKE_ENV)]) {
    assert.ok(!all.includes(f), `log leaked ${f}`);
  }
}

// Netlify Forms

test("Netlify Forms: a correct JWS fires the routine with a plain summary", async () => {
  const calls = mockFetch([{ status: 200 }]);
  const res = await handler(post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, source: "netlify-forms" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, FAKE_ENV.ROUTINE_FIRE_URL);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.authorization, `Bearer ${FAKE_ENV.ROUTINE_FIRE_TOKEN}`);
  assert.equal(calls[0].init.headers["anthropic-version"], "2023-06-01");
  assert.equal(calls[0].init.headers["content-type"], "application/json");
  assert.deepEqual(Object.keys(JSON.parse(calls[0].init.body)), ["text"]);

  const text = calls[0].text;
  assert.equal(
    text,
    [
      "Source: Netlify Forms",
      "Event: form submission",
      "Time: 2026-10-17T20:55:01Z",
      "Who: Test Person, test.person@example.com, Example Clinic",
      "What: We want to map intake before the new year.",
      "Form: contact",
    ].join("\n")
  );
  assertPlain(text);
  for (const hidden of ["203.0.113.9", "Mozilla", "referrer", "referral-source", "site_url"]) {
    assert.ok(!text.includes(hidden), `summary carries ${hidden}`);
  }
  assertNothingLeaked(["Test Person", "test.person@example.com", "Example Clinic", "map intake"]);
  assert.match(logged[0], /^relay netlify-forms 200 \d+ms$/);
});

test("Netlify Forms: the ai-readiness-consult fields land in Who and What", async () => {
  const calls = mockFetch([{ status: 200 }]);
  const res = await handler(post(consultBody, { "X-Webhook-Signature": netlifyJws(consultBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 200);
  const text = calls[0].text;
  assert.ok(text.includes("Who: Second Person, second.person@example.com, Restaurant owner"));
  assert.ok(text.includes("What: Scheduling and the weekly order."));
  assert.ok(text.includes("Form: ai-readiness-consult"));
  assert.ok(!text.includes("203.0.113.10"));
  assertPlain(text);
});

test("Netlify Forms: an unsigned call is refused with 401 and nothing is fired", async () => {
  const calls = mockFetch([]);
  const res = await handler(post(contactBody));
  assert.equal(res.status, 401);
  assert.equal(calls.length, 0);
  assertNothingLeaked(["Test Person", "test.person@example.com"]);
});

test("Netlify Forms: a JWS with the wrong secret, a tampered body or alg none is refused", async () => {
  const calls = mockFetch([]);
  const wrongSecret = netlifyJws(contactBody, "some-other-secret");
  assert.equal((await handler(post(contactBody, { "X-Webhook-Signature": wrongSecret }))).status, 401);
  const good = netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET);
  assert.equal((await handler(post(contactBody.replace("Example Clinic", "Other Org"), { "X-Webhook-Signature": good }))).status, 401);
  const none = netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET, { alg: "none" });
  assert.equal((await handler(post(contactBody, { "X-Webhook-Signature": none }))).status, 401);
  const otherIssuer = netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET, { iss: "someone" });
  assert.equal((await handler(post(contactBody, { "X-Webhook-Signature": otherIssuer }))).status, 401);
  assert.equal((await handler(post(contactBody, { "X-Webhook-Signature": "not.a.jws" }))).status, 401);
  assert.equal(calls.length, 0);
});

test("Netlify Forms: a correctly signed body that is not a submission is refused with 400", async () => {
  const calls = mockFetch([]);
  const notJson = "name=Test&email=test%40example.com";
  assert.equal((await handler(post(notJson, { "X-Webhook-Signature": netlifyJws(notJson, FAKE_ENV.NETLIFY_FORMS_SECRET) }))).status, 400);
  const noData = JSON.stringify({ form_name: "contact" });
  assert.equal((await handler(post(noData, { "X-Webhook-Signature": netlifyJws(noData, FAKE_ENV.NETLIFY_FORMS_SECRET) }))).status, 400);
  assert.equal(calls.length, 0);
});

// Cal.com

test("Cal.com: a correct HMAC fires the routine with the booking summary", async () => {
  const calls = mockFetch([{ status: 200 }]);
  const res = await handler(post(bookingBody, { "X-Cal-Signature-256": calHmac(bookingBody, FAKE_ENV.CALCOM_WEBHOOK_SECRET) }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, source: "calcom" });
  const text = calls[0].text;
  assert.ok(text.includes("Source: Cal.com"));
  assert.ok(text.includes("Event: booking created"));
  assert.ok(text.includes("Time: 2026-10-17T21:00:00Z"));
  assert.ok(text.includes("Who: Booker Person, booker.person@example.com"));
  assert.ok(text.includes("2026-10-21T14:00:00Z to 2026-10-21T14:30:00Z"));
  assert.ok(text.includes("time zone America/Toronto"));
  assert.ok(text.includes("Anything to cover: Two clinics, one intake form."));
  assert.ok(text.includes("Location: integrations:daily"));
  assert.ok(!text.includes("Form:"));
  assert.ok(!text.includes("abc123"));
  assert.ok(!text.includes("owner@example.com"));
  assertPlain(text);
  assertNothingLeaked(["Booker Person", "booker.person@example.com"]);
});

test("Cal.com: a cancellation carries the event and the reason", async () => {
  const calls = mockFetch([{ status: 200 }]);
  const body = JSON.stringify({
    ...JSON.parse(bookingBody),
    triggerEvent: "BOOKING_CANCELLED",
    payload: { ...JSON.parse(bookingBody).payload, cancellationReason: "Rescheduling next month" },
  });
  const res = await handler(post(body, { "X-Cal-Signature-256": calHmac(body, FAKE_ENV.CALCOM_WEBHOOK_SECRET) }));
  assert.equal(res.status, 200);
  assert.ok(calls[0].text.includes("Event: booking cancelled"));
  assert.ok(calls[0].text.includes("reason: Rescheduling next month"));
});

test("Cal.com: a wrong HMAC is refused with 401", async () => {
  const calls = mockFetch([]);
  assert.equal((await handler(post(bookingBody, { "X-Cal-Signature-256": calHmac(bookingBody, "wrong-secret") }))).status, 401);
  assert.equal((await handler(post(bookingBody, { "X-Cal-Signature-256": "deadbeef" }))).status, 401);
  assert.equal((await handler(post(bookingBody, { "X-Cal-Signature-256": "" }))).status, 401);
  assert.equal(calls.length, 0);
});

test("Cal.com: a signed body without triggerEvent is refused with 400", async () => {
  const calls = mockFetch([]);
  const body = JSON.stringify({ payload: { title: "x" } });
  assert.equal((await handler(post(body, { "X-Cal-Signature-256": calHmac(body, FAKE_ENV.CALCOM_WEBHOOK_SECRET) }))).status, 400);
  assert.equal(calls.length, 0);
});

// Visitor identification

test("Visitor: the right secret in the header or the query string fires the routine", async () => {
  const calls = mockFetch([{ status: 200 }, { status: 200 }]);
  const byHeader = await handler(post(visitorBody, { "X-Relay-Secret": FAKE_ENV.VISITOR_WEBHOOK_SECRET }));
  assert.equal(byHeader.status, 200);
  assert.deepEqual(await byHeader.json(), { ok: true, source: "visitor" });
  const byQuery = await handler(post(visitorBody, {}, `?secret=${FAKE_ENV.VISITOR_WEBHOOK_SECRET}`));
  assert.equal(byQuery.status, 200);
  const text = calls[0].text;
  assert.ok(text.includes("Source: Visitor identification"));
  assert.ok(text.includes("Time: 2026-10-17T22:15:00Z"));
  assert.ok(text.includes("Who: Example Health Network, example-health.test, Canada"));
  assert.ok(text.includes("What: pages viewed: /ai-readiness/, /organizations/, /demos/community-hub-portal/"));
  assertPlain(text);
  assertNothingLeaked(["Example Health Network", "example-health.test"]);
});

test("Visitor: a wrong or missing secret is refused with 401", async () => {
  const calls = mockFetch([]);
  assert.equal((await handler(post(visitorBody, { "X-Relay-Secret": "wrong" }))).status, 401);
  assert.equal((await handler(post(visitorBody, {}, "?secret=wrong"))).status, 401);
  assert.equal((await handler(post(visitorBody))).status, 401);
  assert.equal(calls.length, 0);
});

test("Visitor: a body with no company or domain is refused with 400", async () => {
  const calls = mockFetch([]);
  const res = await handler(post(JSON.stringify({ pages: ["/"] }), { "X-Relay-Secret": FAKE_ENV.VISITOR_WEBHOOK_SECRET }));
  assert.equal(res.status, 400);
  assert.equal(calls.length, 0);
});

// Firing

test("429 then 200: waits Retry-After once and retries once", async () => {
  const calls = mockFetch([{ status: 429, headers: { "retry-after": "0" } }, { status: 200 }]);
  const res = await handler(post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].text, calls[1].text);
});

test("429 twice: gives up after one retry with 502 and a one-line body", async () => {
  const calls = mockFetch([{ status: 429, headers: { "retry-after": "0" } }, { status: 429, headers: { "retry-after": "0" } }]);
  const res = await handler(post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 502);
  assert.equal(calls.length, 2);
  const body = await res.text();
  assert.equal(body, "routine fire failed");
  assert.ok(!body.includes("\n"));
});

test("Retry-After is honoured in seconds or as a date and capped at 20 seconds", () => {
  assert.equal(retryAfterMs("3"), 3000);
  assert.equal(retryAfterMs("0"), 0);
  assert.equal(retryAfterMs("99"), 20000);
  assert.equal(retryAfterMs(new Date(Date.now() + 120000).toUTCString()), 20000);
  assert.equal(retryAfterMs(new Date(Date.now() - 1000).toUTCString()), 0);
  assert.equal(retryAfterMs("garbage"), 1000);
  assert.equal(retryAfterMs(null), 1000);
});

test("any other non-2xx from the fire endpoint returns 502 without retrying or leaking", async () => {
  const calls = mockFetch([{ status: 400, body: '{"type":"error","error":{"type":"invalid_request_error","message":"routine paused"}}' }]);
  const res = await handler(post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 502);
  assert.equal(calls.length, 1);
  const body = await res.text();
  assert.equal(body, "routine fire failed");
  assert.ok(!body.includes("trig_test"));
  assertNothingLeaked(["Test Person", "routine paused"]);
});

test("a network failure on the fire returns 502 and logs only the error name", async () => {
  mockFetch([new TypeError("fetch failed: https://api.example.invalid/secret-in-url")]);
  const res = await handler(post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 502);
  assert.ok(logged.some((l) => l === "relay netlify-forms fire error TypeError"));
  assert.ok(!logged.join("\n").includes("secret-in-url"));
});

// Configuration

test("missing env: 503 relay not configured when the fire URL, the token or the source secret is absent", async () => {
  const calls = mockFetch([]);
  const signed = () => post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) });

  delete process.env.ROUTINE_FIRE_URL;
  let res = await handler(signed());
  assert.equal(res.status, 503);
  assert.equal(await res.text(), "relay not configured");

  Object.assign(process.env, FAKE_ENV);
  delete process.env.ROUTINE_FIRE_TOKEN;
  assert.equal((await handler(signed())).status, 503);

  Object.assign(process.env, FAKE_ENV);
  delete process.env.NETLIFY_FORMS_SECRET;
  assert.equal((await handler(signed())).status, 503);
  assert.equal(calls.length, 0);
});

test("missing env for another source does not block this one", async () => {
  const calls = mockFetch([{ status: 200 }]);
  delete process.env.VISITOR_WEBHOOK_SECRET;
  const res = await handler(post(contactBody, { "X-Webhook-Signature": netlifyJws(contactBody, FAKE_ENV.NETLIFY_FORMS_SECRET) }));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
});

test("only POST is accepted", async () => {
  const res = await handler(new Request("https://alignmentandintegration.com/relay", { method: "GET" }));
  assert.equal(res.status, 405);
});

// Payload shape

test("shape: long fields are capped and the text stays under the fire limit", () => {
  const text = shape("netlify-forms", {
    form_name: "contact",
    data: { name: "N", email: "n@example.com", situation: "x".repeat(100_000) },
  });
  assert.ok(text.length < 65_536);
  assert.ok(text.includes("Form: contact"));
  assertPlain(text);
});

test("shape: a non-object body or an unknown source gives nothing", () => {
  assert.equal(shape("netlify-forms", null), null);
  assert.equal(shape("netlify-forms", []), null);
  assert.equal(shape("netlify-forms", "text"), null);
  assert.equal(shape("other", { data: {} }), null);
});
