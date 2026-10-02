// The two operations behind the Reference Check tools.

import { resolveDoi, registrationAgency, search, LookupError } from "./crossref.mjs";
import { compare, extractDoi, titleSimilarity, tokens, TITLE_THRESHOLD } from "./match.mjs";

export const MAX_REFERENCES = 25;
const CONCURRENCY = 3; // Crossref asks polite clients to stay at three at a time

function publicRecord(r) {
  return {
    doi: r.doi,
    title: r.title,
    authors: r.authors.map((a) => [a.family, a.given].filter(Boolean).join(", ")),
    year: r.year,
    published_in: r.container,
    volume: r.volume,
    issue: r.issue,
    pages: r.page,
    type: r.type,
  };
}

function differing(c) {
  return ["title", "author", "year"].filter((f) => c[f] === false);
}

// The Crossref record whose title is found in the pasted text. When several
// carry the title, the one that agrees on the most fields wins.
async function closest(text, fetchImpl) {
  const candidates = await search(text, 5, fetchImpl);
  const doi = extractDoi(text);
  let best = null;
  for (const record of candidates) {
    const comparison = compare(record, text, doi);
    if (!comparison.title) continue;
    // A one or two word title ("10", "Editorial") turns up inside unrelated
    // references, so it only counts when the author agrees as well.
    if (tokens(record.title).length < 3 && comparison.author !== true) continue;
    const rank = [differing(comparison).length, -comparison.title_similarity];
    if (!best || rank[0] < best.rank[0] || (rank[0] === best.rank[0] && rank[1] < best.rank[1])) {
      best = { record, comparison, rank };
    }
  }
  return best;
}

export async function checkOne(reference, fetchImpl) {
  const text = String(reference.text || "").trim();
  const doi = (reference.doi || "").trim() || extractDoi(text);
  const base = { reference: text, doi_given: doi || null };

  try {
    if (doi) {
      const record = await resolveDoi(doi, fetchImpl);
      if (record) {
        const c = compare(record, text, doi);
        const differs = differing(c);
        if (!differs.length) {
          return { ...base, result: "match", crossref_record: publicRecord(record) };
        }
        const out = {
          ...base,
          result: "mismatch",
          differs,
          crossref_record: publicRecord(record),
          note: differs.includes("title")
            ? "The DOI resolves to a different work than the one pasted."
            : `The DOI resolves to this work, but the pasted ${differs.join(" and ")} differs from the Crossref record.`,
        };
        if (differs.includes("title")) {
          const found = await closest(text, fetchImpl);
          if (found) out.closest_by_title = publicRecord(found.record);
        }
        return out;
      }
      // The DOI is not in Crossref. A DOI registered elsewhere is real, only
      // out of reach of this check.
      const agency = await registrationAgency(doi, fetchImpl);
      if (agency && agency !== "Crossref") {
        return {
          ...base,
          result: "not_found_in_crossref",
          note: `The DOI is registered with ${agency}, not Crossref, so this check cannot confirm the reference either way.`,
        };
      }
      const found = await closest(text, fetchImpl);
      if (found) {
        return {
          ...base,
          result: "mismatch",
          differs: ["doi", ...differing(found.comparison)],
          crossref_record: publicRecord(found.record),
          note: "The pasted DOI is not in Crossref. A work with this title is, under a different DOI.",
        };
      }
      return {
        ...base,
        result: "not_found_in_crossref",
        note: "The DOI is not in Crossref and no close title match was found. Books, reports, theses and DOIs registered with other agencies such as DataCite are outside Crossref.",
      };
    }

    const found = await closest(text, fetchImpl);
    if (!found) {
      return {
        ...base,
        result: "not_found_in_crossref",
        note: "No close title match was found. Books, reports, theses and works without a Crossref DOI are outside Crossref.",
      };
    }
    const differs = differing(found.comparison);
    if (!differs.length) {
      return { ...base, result: "match", crossref_record: publicRecord(found.record) };
    }
    return {
      ...base,
      result: "mismatch",
      differs,
      crossref_record: publicRecord(found.record),
      note: `A work with this title is in Crossref, but the pasted ${differs.join(" and ")} differs from the Crossref record.`,
    };
  } catch (err) {
    if (err instanceof LookupError) {
      return { ...base, result: "could_not_check", note: `${err.message}. Try this reference again.` };
    }
    throw err;
  }
}

export async function checkReferences(references, fetchImpl) {
  const results = new Array(references.length);
  let next = 0;
  async function worker() {
    while (next < references.length) {
      const i = next++;
      results[i] = await checkOne(references[i], fetchImpl);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, references.length) }, worker));

  const count = (r) => results.filter((x) => x.result === r).length;
  return {
    summary: {
      checked: results.length,
      match: count("match"),
      mismatch: count("mismatch"),
      not_found_in_crossref: count("not_found_in_crossref"),
      could_not_check: count("could_not_check"),
    },
    results,
  };
}

export async function findReference({ title, author }, fetchImpl) {
  const query = [title, author].filter(Boolean).join(" ");
  const records = await search(query, 5, fetchImpl);
  const candidates = records
    .map((r) => ({ ...publicRecord(r), title_similarity: titleSimilarity(r.title, title) }))
    .sort((a, b) => b.title_similarity - a.title_similarity);
  return {
    candidates,
    close_match_found: candidates.some((c) => c.title_similarity >= TITLE_THRESHOLD),
  };
}
