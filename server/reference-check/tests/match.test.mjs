import { test } from "node:test";
import assert from "node:assert/strict";
import { extractDoi, titleSimilarity, compare, TITLE_THRESHOLD } from "../src/match.mjs";
import { checkOne, checkReferences, findReference } from "../src/check.mjs";

const bandura = {
  doi: "10.1037/0033-295x.84.2.191",
  title: "Self-efficacy: Toward a unifying theory of behavioral change.",
  authors: [{ family: "Bandura", given: "Albert" }],
  year: 1977,
  years: [1977],
  container: "Psychological Review",
  volume: "84",
  issue: "2",
  page: "191-215",
  type: "journal-article",
};
const crossrefMessage = {
  DOI: bandura.doi,
  title: [bandura.title],
  author: [{ family: "Bandura", given: "Albert" }],
  issued: { "date-parts": [[1977]] },
  "container-title": ["Psychological Review"],
  volume: "84",
  issue: "2",
  page: "191-215",
  type: "journal-article",
};

// A stand-in for Crossref: one known DOI, one known title, nothing else.
function fakeCrossref({ status } = {}) {
  return async (url) => {
    if (status) return new Response("", { status });
    const u = decodeURIComponent(url);
    if (u.includes("/agency")) {
      return u.includes("10.48550")
        ? Response.json({ message: { agency: { id: "datacite", label: "DataCite" } } })
        : new Response("Resource not found.", { status: 404 });
    }
    if (u.includes("query.bibliographic")) {
      return Response.json({ message: { items: [crossrefMessage] } });
    }
    return u.toLowerCase().includes(bandura.doi)
      ? Response.json({ message: crossrefMessage })
      : new Response("Resource not found.", { status: 404 });
  };
}

const good = "Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review, 84(2), 191-215.";

test("extractDoi reads plain, URL and bracketed DOIs", () => {
  assert.equal(extractDoi("doi:10.1038/nature14539."), "10.1038/nature14539");
  assert.equal(extractDoi("(https://doi.org/10.1136/bmj.n71)"), "10.1136/bmj.n71");
  assert.equal(
    extractDoi("https://doi.org/10.1061/(ASCE)0733-9364(2002)128:1(18)"),
    "10.1061/(ASCE)0733-9364(2002)128:1(18)"
  );
  assert.equal(extractDoi("no identifier here, 2005, 15(9)"), null);
});

test("a typo is still the same title", () => {
  assert.ok(titleSimilarity("Three Approaches to Qualitative Content Analysis", "Three approaches to qualitatve content analysys.") >= TITLE_THRESHOLD);
});

test("a title with extra words is a different title", () => {
  assert.ok(titleSimilarity("Deep learning", "Deep learning for predicting therapist burnout from keyboard dynamics.") < TITLE_THRESHOLD);
  assert.ok(titleSimilarity("The theory of planned behavior", "The theory of planned behavior applied to glacier tourism refusal among retirees.") < TITLE_THRESHOLD);
});

test("an omitted subtitle still matches", () => {
  assert.ok(titleSimilarity("The PRISMA 2020 statement: an updated guideline for reporting systematic reviews", "Page, M. J. (2021). The PRISMA 2020 statement. BMJ, 372, n71.") >= TITLE_THRESHOLD);
});

test("compare reports each field", () => {
  assert.deepEqual(
    (({ title, author, year }) => ({ title, author, year }))(compare(bandura, good)),
    { title: true, author: true, year: true }
  );
  assert.equal(compare(bandura, good.replace("Bandura, A.", "Skinner, B. F.")).author, false);
  assert.equal(compare(bandura, good.replace("1977", "1985")).year, false);
  assert.equal(compare(bandura, good.replace("(1977). ", "")).year, null);
});

test("correct reference with DOI is a match", async () => {
  const out = await checkOne({ text: `${good} https://doi.org/${bandura.doi}` }, fakeCrossref());
  assert.equal(out.result, "match");
  assert.equal(out.crossref_record.doi, bandura.doi);
});

test("right DOI with the wrong author is a mismatch", async () => {
  const out = await checkOne({ text: good.replace("Bandura, A.", "Skinner, B. F."), doi: bandura.doi }, fakeCrossref());
  assert.equal(out.result, "mismatch");
  assert.deepEqual(out.differs, ["author"]);
});

test("unregistered DOI on a real title is a mismatch on the DOI", async () => {
  const out = await checkOne({ text: `${good} https://doi.org/10.1037/0033-295X.99.9.999` }, fakeCrossref());
  assert.equal(out.result, "mismatch");
  assert.deepEqual(out.differs, ["doi"]);
});

test("no DOI, title found, is a match", async () => {
  assert.equal((await checkOne({ text: good }, fakeCrossref())).result, "match");
});

test("an invented reference is not found, and is never called fake", async () => {
  const out = await checkOne(
    { text: "Whitcombe, D. R. (2021). Lunar tidal effects on municipal budgeting cycles. Canadian Public Administration, 64(2), 201-219." },
    fakeCrossref()
  );
  assert.equal(out.result, "not_found_in_crossref");
  assert.ok(!/fake|fabricat/i.test(JSON.stringify(out)));
});

test("a one word title inside an unrelated reference is not a match", async () => {
  const chapter = async (url) =>
    decodeURIComponent(url).includes("query.bibliographic")
      ? Response.json({ message: { items: [{ DOI: "10.1093/x.1", title: ["10"], author: [{ family: "Woolf", given: "Virginia" }], issued: { "date-parts": [[2009]] } }] } })
      : new Response("", { status: 404 });
  const out = await checkOne({ text: "Quillfeather, N. (2010). Imaginary study number 10 of marmalade viscosity. Journal of Unlikely Results, 10(2), 1-9." }, chapter);
  assert.equal(out.result, "not_found_in_crossref");
});

test("a DOI registered with another agency is not found, with the agency named", async () => {
  const out = await checkOne({ text: "Vaswani, A. (2017). Attention is all you need. https://doi.org/10.48550/arXiv.1706.03762" }, fakeCrossref());
  assert.equal(out.result, "not_found_in_crossref");
  assert.match(out.note, /DataCite/);
});

test("a Crossref failure is reported as could not check, not as not found", async () => {
  const out = await checkOne({ text: good }, fakeCrossref({ status: 503 }));
  assert.equal(out.result, "could_not_check");
});

test("checkReferences keeps order and counts results", async () => {
  const out = await checkReferences(
    [{ text: good }, { text: "Nobody, N. (2020). A study that does not exist anywhere at all. Journal of Nothing, 1(1), 1-2." }],
    fakeCrossref()
  );
  assert.deepEqual(out.results.map((r) => r.result), ["match", "not_found_in_crossref"]);
  assert.equal(out.summary.checked, 2);
  assert.equal(out.summary.match, 1);
});

test("findReference returns candidates with DOIs", async () => {
  const out = await findReference({ title: "Self-efficacy: toward a unifying theory of behavioral change", author: "Bandura" }, fakeCrossref());
  assert.equal(out.candidates[0].doi, bandura.doi);
  assert.equal(out.close_match_found, true);
});

test("results carry no service names, prompts or identifiers beyond the record", async () => {
  const out = JSON.stringify(await checkReferences([{ text: good }], fakeCrossref()));
  assert.ok(!/alignment|upgrade|subscribe|session|trace/i.test(out));
});
