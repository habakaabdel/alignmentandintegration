// Crossref lookups for Reference Check: resolve a DOI, search by title and author.
// Ported from the citation-integrity verifier (verify, find, _fields).

const API = "https://api.crossref.org/works";
const CONTACT = "alignmentandintegration@gmail.com"; // Crossref "polite pool" contact
const USER_AGENT = `reference-check/1.0 (https://alignmentandintegration.com; mailto:${CONTACT})`;
const SELECT = "DOI,title,author,issued,published-print,published-online,container-title,type,volume,issue,page";
const TIMEOUT_MS = 12000;

const SPACING_MS = 350; // Crossref allows polite clients three requests a second
const RETRIES = 2;

export class LookupError extends Error {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let nextSlot = 0;
async function turn() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + SPACING_MS;
  if (wait) await sleep(wait);
}

async function get(url, fetchImpl) {
  for (let attempt = 0; ; attempt++) {
    if (!fetchImpl) await turn();
    let res;
    try {
      res = await (fetchImpl || fetch)(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new LookupError("Crossref did not answer");
    }
    if (res.status === 404) return null;
    if (res.status === 429 && attempt < RETRIES) {
      if (!fetchImpl) await sleep(1000 * (attempt + 1));
      continue;
    }
    if (res.status === 429) throw new LookupError("Crossref is busy");
    if (!res.ok) throw new LookupError(`Crossref answered ${res.status}`);
    return (await res.json()).message;
  }
}

function yearOf(part) {
  const y = part?.["date-parts"]?.[0]?.[0];
  return Number.isInteger(y) ? y : null;
}

export function toRecord(msg) {
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
export async function resolveDoi(doi, fetchImpl) {
  const msg = await get(`${API}/${encodeURIComponent(doi)}`, fetchImpl);
  return msg ? toRecord(msg) : null;
}

// The agency a DOI is registered with ("Crossref", "DataCite", ...), or null
// when Crossref knows of no registration for it.
export async function registrationAgency(doi, fetchImpl) {
  const msg = await get(`${API}/${encodeURIComponent(doi)}/agency`, fetchImpl);
  return msg?.agency?.label || null;
}

// The closest Crossref records for free reference text (title, authors, year).
export async function search(query, rows = 5, fetchImpl) {
  const q = encodeURIComponent(String(query).slice(0, 600));
  const msg = await get(
    `${API}?query.bibliographic=${q}&rows=${rows}&select=${SELECT}`,
    fetchImpl
  );
  return (msg?.items || []).map(toRecord);
}
