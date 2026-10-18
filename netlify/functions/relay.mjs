// Webhook relay at /relay: takes a signed notification from Netlify Forms,
// Cal.com or a visitor identification tool, shapes one short plain-text
// summary, and fires the A&I inbox routine with it. Nothing is stored.
// Logs carry only the source, the status and the timing, never a field or a secret.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const FIRE_ENV = ["ROUTINE_FIRE_URL", "ROUTINE_FIRE_TOKEN"];
const SOURCES = {
  "netlify-forms": { secret: "NETLIFY_FORMS_SECRET" },
  calcom: { secret: "CALCOM_WEBHOOK_SECRET" },
  visitor: { secret: "VISITOR_WEBHOOK_SECRET" },
};
const MAX_BODY = 256 * 1024;
const MAX_TEXT = 65_000;
const MAX_FIELD = 2_000;
const DEFAULT_RETRY_MS = 1_000;
const RETRY_CAP_MS = 20_000;

// Netlify adds these to every submission's data; none of them belongs in the summary.
const FORM_META = new Set(["form-name", "ip", "user_agent", "referrer", "subject"]);
const FORM_WHO = ["name", "email", "organization", "organisation", "company", "work"];
const FORM_WHAT = ["message", "situation", "focus"];
const CAL_EVENTS = {
  BOOKING_CREATED: "booking created",
  BOOKING_RESCHEDULED: "booking rescheduled",
  BOOKING_CANCELLED: "booking cancelled",
};

// Comparisons

function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ""));
  const y = Buffer.from(String(b ?? ""));
  return x.length === y.length && timingSafeEqual(x, y);
}

const sha256Hex = (s) => createHash("sha256").update(s).digest("hex");
const hmac = (secret, s, enc) => createHmac("sha256", secret).update(s).digest(enc);

function decodeJson(b64url) {
  try {
    return JSON.parse(Buffer.from(b64url, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// Netlify signs with a JWS (HS256) whose claims are iss "netlify" and the
// hex SHA-256 of the raw body.
function verifyNetlify(token, raw, secret) {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  const header = decodeJson(h);
  if (!header || header.alg !== "HS256") return false;
  if (!safeEqual(hmac(secret, `${h}.${p}`, "base64url"), s.replace(/=+$/, ""))) return false;
  const claims = decodeJson(p);
  return !!claims && claims.iss === "netlify" && safeEqual(claims.sha256, sha256Hex(raw));
}

// Cal.com sends the hex HMAC SHA-256 of the raw body.
function verifyCal(signature, raw, secret) {
  return safeEqual(String(signature ?? "").trim().toLowerCase(), hmac(secret, raw, "hex"));
}

// The visitor tool sends a shared secret, as a header or a query string.
function verifyVisitor(req, secret) {
  const given = req.headers.get("x-relay-secret") || new URL(req.url).searchParams.get("secret") || "";
  return safeEqual(given, secret);
}

function detectSource(req) {
  if (req.headers.has("x-webhook-signature")) return "netlify-forms";
  if (req.headers.has("x-cal-signature-256")) return "calcom";
  if (req.headers.has("x-relay-secret") || new URL(req.url).searchParams.has("secret")) return "visitor";
  return null;
}

// Shaping

function isoUtc(value) {
  let d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) d = new Date();
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// One trimmed line, capped. Cal.com wraps answers as { label, value }.
function clean(v, depth = 0) {
  if (v == null || depth > 2) return "";
  if (Array.isArray(v)) return v.map((x) => clean(x, depth + 1)).filter(Boolean).join(", ");
  if (typeof v === "object") return clean(v.value ?? v.optionValue ?? "", depth + 1);
  return String(v).replace(/\s+/g, " ").trim().slice(0, MAX_FIELD);
}

const join = (parts) => parts.filter(Boolean).join(", ");
const pairs = (entries) => entries.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);

function shapeNetlify(body) {
  const data = body.data;
  if (!data || typeof data !== "object") return null;
  const form = clean(body.form_name ?? data["form-name"]) || "unknown";
  const who = join([clean(data.name), clean(data.email), clean(FORM_WHO.slice(2).map((k) => data[k]).find(Boolean))]);
  const what = clean(FORM_WHAT.map((k) => data[k]).find(Boolean));
  const known = new Set([...FORM_WHO, ...FORM_WHAT, ...FORM_META]);
  const rest = pairs(
    Object.entries(data)
      .filter(([k, v]) => !known.has(k) && typeof v !== "object")
      .map(([k, v]) => [k, clean(v)])
  );
  return [
    "Source: Netlify Forms",
    "Event: form submission",
    `Time: ${isoUtc(body.created_at)}`,
    `Who: ${who || "(not given)"}`,
    `What: ${[what || "(no message)", ...rest].join("; ")}`,
    `Form: ${form}`,
  ];
}

function shapeCal(body) {
  const p = body.payload;
  const trigger = body.triggerEvent;
  if (!p || typeof p !== "object" || typeof trigger !== "string" || !trigger) return null;
  const event = CAL_EVENTS[trigger] || trigger.toLowerCase().replace(/_/g, " ");
  const attendee = (Array.isArray(p.attendees) && p.attendees[0]) || {};
  const responses = p.responses && typeof p.responses === "object" ? p.responses : {};
  const who = join([clean(attendee.name) || clean(responses.name), clean(attendee.email) || clean(responses.email)]);
  const when = p.startTime || p.endTime ? `${isoUtc(p.startTime)} to ${isoUtc(p.endTime)}` : "";
  const zone = clean(attendee.timeZone);
  const answers = pairs(
    Object.entries(responses)
      .filter(([k]) => k !== "name" && k !== "email")
      .map(([k, v]) => [clean(v?.label) || k, clean(v)])
  );
  const what = [
    join([clean(p.title ?? p.eventTitle), when, zone && `time zone ${zone}`]),
    answers.length ? `responses: ${answers.join("; ")}` : "",
    p.cancellationReason ? `reason: ${clean(p.cancellationReason)}` : "",
  ].filter(Boolean);
  return [
    "Source: Cal.com",
    `Event: ${event}`,
    `Time: ${isoUtc(body.createdAt)}`,
    `Who: ${who || "(not given)"}`,
    `What: ${what.join(". ") || "(no detail)"}`,
  ];
}

// Generic visitor JSON: company name, domain, pages viewed, country. Nested
// under "company" or flat.
function shapeVisitor(body) {
  const c = body.company && typeof body.company === "object" ? body.company : {};
  const company = clean([c.name, body.company_name, typeof body.company === "string" ? body.company : "", body.organization].find(Boolean));
  const domain = clean(c.domain ?? body.domain ?? c.website ?? body.website);
  const country = clean(c.country ?? body.country ?? body.location?.country);
  if (!company && !domain) return null;
  const raw = body.pages ?? body.pages_viewed ?? body.page_views ?? [];
  const pages = (Array.isArray(raw) ? raw : [raw])
    .map((x) => (typeof x === "string" ? clean(x) : clean(x?.url ?? x?.path ?? x?.page)))
    .filter(Boolean)
    .slice(0, 20);
  return [
    "Source: Visitor identification",
    "Event: company visit",
    `Time: ${isoUtc(body.timestamp ?? body.last_visit ?? body.visited_at)}`,
    `Who: ${join([company, domain, country])}`,
    `What: ${pages.length ? `pages viewed: ${pages.join(", ")}` : "(no pages listed)"}`,
  ];
}

const SHAPERS = { "netlify-forms": shapeNetlify, calcom: shapeCal, visitor: shapeVisitor };

export function shape(source, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const lines = SHAPERS[source]?.(body);
  if (!lines) return null;
  const text = lines.join("\n");
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)} [truncated]` : text;
}

// Firing

export function retryAfterMs(value) {
  if (!value) return DEFAULT_RETRY_MS;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds, 0) * 1000, RETRY_CAP_MS);
  const at = Date.parse(value);
  if (Number.isNaN(at)) return DEFAULT_RETRY_MS;
  return Math.min(Math.max(at - Date.now(), 0), RETRY_CAP_MS);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fire(text) {
  const attempt = () =>
    fetch(process.env.ROUTINE_FIRE_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.ROUTINE_FIRE_TOKEN}`,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
  let res = await attempt();
  if (res.status === 429) {
    await sleep(retryAfterMs(res.headers.get("retry-after")));
    res = await attempt();
  }
  return res.ok;
}

// Handler

export default async (req) => {
  const started = Date.now();
  const finish = (status, source, body) => {
    console.log(`relay ${source ?? "unknown"} ${status} ${Date.now() - started}ms`);
    return typeof body === "string"
      ? new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } })
      : Response.json(body, { status });
  };

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }
  const source = detectSource(req);
  if (!source) return finish(401, null, "unsigned");
  if ([SOURCES[source].secret, ...FIRE_ENV].some((k) => !process.env[k])) {
    return finish(503, source, "relay not configured");
  }

  let raw;
  try {
    raw = await req.text();
  } catch {
    return finish(400, source, "malformed");
  }
  if (!raw || raw.length > MAX_BODY) return finish(400, source, "malformed");

  const secret = process.env[SOURCES[source].secret];
  const signed =
    source === "netlify-forms"
      ? verifyNetlify(req.headers.get("x-webhook-signature"), raw, secret)
      : source === "calcom"
        ? verifyCal(req.headers.get("x-cal-signature-256"), raw, secret)
        : verifyVisitor(req, secret);
  if (!signed) return finish(401, source, "bad signature");

  let body = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  const text = shape(source, body);
  if (!text) return finish(400, source, "malformed");

  try {
    if (!(await fire(text))) return finish(502, source, "routine fire failed");
  } catch (error) {
    // The error name only: a message could carry the URL.
    console.error(`relay ${source} fire error ${error?.name ?? "Error"}`);
    return finish(502, source, "routine fire failed");
  }
  return finish(200, source, { ok: true, source });
};

export const config = {
  path: "/relay",
};
