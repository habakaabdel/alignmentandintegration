// Text comparison for Reference Check. Pure functions, no network.

// Set from the test set in ../tests/references.mjs (run `npm run eval`).
export const TITLE_THRESHOLD = 0.85;

const DOI_PATTERN = /\b10\.\d{4,9}\/[^\s"<>]+/i;

export function extractDoi(text) {
  const m = String(text || "").match(DOI_PATTERN);
  if (!m) return null;
  let doi = m[0].replace(/[.,;:]+$/, "");
  // A closing bracket belongs to the DOI only when it has an opening partner.
  while (/[)\]]$/.test(doi) && unbalanced(doi)) doi = doi.slice(0, -1).replace(/[.,;:]+$/, "");
  return doi;
}

function unbalanced(s) {
  const count = (ch) => s.split(ch).length - 1;
  return count(")") > count("(") || count("]") > count("[");
}

export function normalize(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokens(text) {
  const n = normalize(text);
  return n ? n.split(" ") : [];
}

function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// A typo is the same word; a different word is not. Short words must be exact.
export function sameToken(a, b) {
  if (a === b) return true;
  const len = Math.min(a.length, b.length);
  if (len < 5 || /\d/.test(a) || /\d/.test(b)) return false;
  return editDistance(a, b, len >= 9 ? 2 : 1) <= (len >= 9 ? 2 : 1);
}

// Pasted text cut at punctuation and at years, so a title can be told from what surrounds it.
function segments(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\b((?:1[5-9]|20)\d\d)\b/g, ", $1 ,")
    .split(/[.,:;?!()\[\]"\u201c\u201d]+/)
    .map(tokens)
    .filter((s) => s.length);
}

function sharedInOrder(a, b) {
  let prev = new Uint16Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Uint16Array(b.length + 1);
    for (let j = 1; j <= b.length; j++) {
      cur[j] = sameToken(a[i - 1], b[j - 1])
        ? prev[j - 1] + 1
        : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[b.length];
}

// How well a Crossref title is found inside pasted reference text, 0 to 1.
// The title is compared with every run of neighbouring segments; the score is
// the shared in-order words against the length of both, so a typo costs
// nothing, and missing or extra words in the pasted title both cost.
export function titleSimilarity(recordTitle, pastedText) {
  const segs = segments(pastedText);
  const full = windowScore(tokens(recordTitle), segs);
  // References often leave the subtitle off, so the main title alone counts
  // when it is long enough to be distinctive.
  const main = tokens(String(recordTitle || "").split(/[:?.]\s/)[0]);
  return Math.max(full, main.length >= 4 ? windowScore(main, segs) : 0);
}

function windowScore(title, segs) {
  if (!title.length || !segs.length) return 0;

  let best = 0;
  for (let start = 0; start < segs.length; start++) {
    let window = [];
    for (let end = start; end < segs.length; end++) {
      window = window.concat(segs[end]);
      if (window.length > title.length * 2 + 3) break;
      const score = (2 * sharedInOrder(title, window)) / (title.length + window.length);
      if (score > best) best = score;
    }
  }
  return Math.round(best * 100) / 100;
}

export function hasWord(word, pastedText) {
  const parts = tokens(word);
  if (!parts.length) return false;
  const text = tokens(pastedText);
  for (let i = 0; i + parts.length <= text.length; i++) {
    if (parts.every((p, k) => sameToken(p, text[i + k]))) return true;
  }
  return false;
}

export function yearsIn(text) {
  return (String(text || "").match(/\b(1[5-9]\d\d|20\d\d)\b/g) || []).map(Number);
}

// Compare one Crossref record with the pasted text. Each field is true (agrees),
// false (differs) or null (nothing to compare on one side).
export function compare(record, pastedText, pastedDoi) {
  const text = pastedDoi ? String(pastedText).replace(pastedDoi, " ") : String(pastedText);
  const similarity = titleSimilarity(record.title, text);
  const title = record.title ? similarity >= TITLE_THRESHOLD : null;

  const families = record.authors.map((a) => a.family).filter(Boolean);
  const author = families.length ? hasWord(families[0], text) : null;

  const pastedYears = yearsIn(text);
  const year =
    record.years.length && pastedYears.length
      ? record.years.some((y) => pastedYears.includes(y))
      : null;

  return { title, author, year, title_similarity: similarity };
}
