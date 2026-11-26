// Crossref lookups for Reference Check: resolve a DOI, search by title and author.
// Ported from the citation-integrity verifier (verify, find, _fields).

import { setTimeout as sleep } from "node:timers/promises";
import { readJsonBody } from "./body.mjs";

const API = "https://api.crossref.org/works";
const CONTACT = "alignmentandintegration@gmail.com"; // Crossref "polite pool" contact
const USER_AGENT = `reference-check/1.0 (https://alignmentandintegration.com; mailto:${CONTACT})`;
const SELECT = "DOI,title,author,issued,published-print,published-online,container-title,type,volume,issue,page";
const TIMEOUT_MS = 12000;

const SPACING_MS = 350; // Conservative pacing for the three-per-second list limit.
const MAX_IN_FLIGHT = 3;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const RETRIES = 2;

export class LookupError extends Error {}

// These safeguards cover one warm instance only. A shared limiter is still
// required to enforce the email-wide Crossref budget across Netlify instances.
let nextSlot = 0;
let inFlight = 0;
let cooldownUntil = 0;
async function turn(signal) {
  signal?.throwIfAborted();
  const now = Date.now();
  if (now < cooldownUntil) throw new LookupError("Crossref is busy");
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + SPACING_MS;
  if (wait) await sleep(wait, undefined, { signal });
  if (Date.now() < cooldownUntil) throw new LookupError("Crossref is busy");
}

function retryDelay(res, attempt) {
  const value = res.headers.get("retry-after");
  const seconds = value && /^\d+(\.\d+)?$/.test(value) ? Number(value) : NaN;
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();
  return Math.max(1000 * (attempt + 1), Number.isFinite(delay) ? delay : 0);
}

async function get(url, fetchImpl, signal) {
  if (!fetchImpl && inFlight >= MAX_IN_FLIGHT) throw new LookupError("Crossref is busy");
  if (!fetchImpl) inFlight++;
  try {
    for (let attempt = 0; ; attempt++) {
      signal?.throwIfAborted();
      if (!fetchImpl) await turn(signal);
      const timeout = new AbortController();
      const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
      const attemptSignal = signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal;
      let res;
      try {
        const target = new URL(url);
        target.searchParams.set("mailto", CONTACT);
        res = await (fetchImpl || fetch)(target.href, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          redirect: "error",
          signal: attemptSignal,
        });
        if (res.status === 404) return null;
        if (res.status === 429) {
          const delay = retryDelay(res, attempt);
          if (!fetchImpl) cooldownUntil = Math.max(cooldownUntil, Date.now() + delay);
          // Long Retry-After values must not keep a synchronous function alive.
          if (attempt >= RETRIES || delay > 3000) throw new LookupError("Crossref is busy");
        } else {
          if (!res.ok) throw new LookupError(`Crossref answered ${res.status}`);
          const data = await readJsonBody(res, MAX_RESPONSE_BYTES, attemptSignal);
          if (!data?.message || typeof data.message !== "object" || Array.isArray(data.message)) {
            throw new LookupError("Crossref returned an invalid response");
          }
          return data.message;
        }
      } finally {
        clearTimeout(timer);
        if (res?.body && !res.bodyUsed) void res.body.cancel().catch(() => {});
      }
      if (!fetchImpl) await sleep(Math.max(0, cooldownUntil - Date.now()), undefined, { signal });
    }
  } catch (error) {
    if (error instanceof LookupError) throw error;
    throw new LookupError(signal?.aborted ? "Reference check timed out or was cancelled" : "Crossref did not answer or returned an invalid response");
  } finally {
    if (!fetchImpl) inFlight--;
  }
}

function yearOf(part) {
  const y = part?.["date-parts"]?.[0]?.[0];
  return Number.isInteger(y) ? y : null;
}

export function toRecord(msg) {
  const stringList = (value) => value === undefined || (Array.isArray(value) && value.every((s) => typeof s === "string"));
  if (!msg || typeof msg !== "object" || Array.isArray(msg) ||
      !stringList(msg.title) || !stringList(msg["container-title"]) ||
      (msg.author !== undefined && (!Array.isArray(msg.author) || msg.author.some((a) =>
        !a || typeof a !== "object" || [a.family, a.given, a.name].some((s) => s !== undefined && typeof s !== "string")))) ||
      [msg.DOI, msg.volume, msg.issue, msg.page, msg.type].some((s) => s !== undefined && typeof s !== "string")) {
    throw new LookupError("Crossref returned an invalid record");
  }
  const authors = (msg.author || []).map((a) => ({
    family: a.family || a.name || "",
    given: a.given || "",
  }));
  const years = [
    ...new Set(
      [msg.issued, msg["published-print"], msg["published-online"]].map(yearOf).filter(Boolean)
    ),
  ];
  return {
    doi: msg.DOI || null,
    title: (msg.title || [])[0] || "",
    authors,
    year: yearOf(msg.issued),
    years,
    container: (msg["container-title"] || [])[0] || "",
    volume: msg.volume || "",
    issue: msg.issue || "",
    page: msg.page || "",
    type: msg.type || "",
  };
}

// The record a DOI resolves to in Crossref, or null when Crossref does not hold it.
export async function resolveDoi(doi, fetchImpl, signal) {
  const msg = await get(`${API}/${encodeURIComponent(doi)}`, fetchImpl, signal);
  return msg ? toRecord(msg) : null;
}

// The agency a DOI is registered with ("Crossref", "DataCite", ...), or null
// when Crossref knows of no registration for it.
export async function registrationAgency(doi, fetchImpl, signal) {
  const msg = await get(`${API}/${encodeURIComponent(doi)}/agency`, fetchImpl, signal);
  if (msg?.agency?.label !== undefined && typeof msg.agency.label !== "string") {
    throw new LookupError("Crossref returned an invalid response");
  }
  return msg?.agency?.label || null;
}

// The closest Crossref records for free reference text (title, authors, year).
export async function search(query, rows = 5, fetchImpl, signal) {
  const q = encodeURIComponent(String(query).slice(0, 600));
  const msg = await get(
    `${API}?query.bibliographic=${q}&rows=${rows}&select=${SELECT}`,
    fetchImpl,
    signal
  );
  if (!msg || !Array.isArray(msg.items) || msg.items.length > rows) {
    throw new LookupError("Crossref returned an invalid response");
  }
  return msg.items.map(toRecord);
}
