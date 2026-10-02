// Runs the test set against live Crossref, reports hits and misses, and shows
// how the title threshold separates real titles from invented ones.
// Usage: npm run eval

import { references } from "./references.mjs";
import { checkOne } from "../src/check.mjs";
import { resolveDoi, search } from "../src/crossref.mjs";
import { extractDoi, titleSimilarity, tokens, TITLE_THRESHOLD } from "../src/match.mjs";

let hits = 0;
const scored = [];
for (const ref of references) {
  const out = await checkOne({ text: ref.text });
  const ok = out.result === ref.expect;
  hits += ok ? 1 : 0;

  const doi = extractDoi(ref.text);
  const text = doi ? ref.text.replace(doi, " ") : ref.text;
  const records = await search(ref.text, 5);
  const byDoi = doi ? await resolveDoi(doi).catch(() => null) : null;
  if (byDoi) records.push(byDoi);
  // One and two word titles are left out here: they are decided by the author
  // rule in check.mjs, not by the threshold.
  const top = Math.max(
    0,
    ...records.filter((r) => tokens(r.title).length >= 3).map((r) => titleSimilarity(r.title, text))
  );
  scored.push({ ...ref, top });

  console.log(
    `${ok ? "HIT " : "MISS"} ${ref.id.padEnd(30)} expected ${ref.expect.padEnd(22)} got ${out.result.padEnd(22)} top title score ${top.toFixed(2)}${out.differs ? "  differs: " + out.differs.join(",") : ""}`
  );
}

console.log(`\n${hits} hits, ${references.length - hits} misses, of ${references.length} references at threshold ${TITLE_THRESHOLD}`);

const real = scored.filter((s) => s.titleInCrossref).map((s) => s.top);
const invented = scored.filter((s) => !s.titleInCrossref).map((s) => s.top);
console.log(`Lowest score for a title that is in Crossref:  ${Math.min(...real).toFixed(2)}`);
console.log(`Highest score for a title that is not:         ${Math.max(...invented).toFixed(2)}`);
console.log("\nthreshold  real titles missed  invented titles accepted");
for (let t = 0.5; t <= 0.96; t += 0.05) {
  const missed = real.filter((s) => s < t).length;
  const accepted = invented.filter((s) => s >= t).length;
  console.log(`  ${t.toFixed(2)}       ${String(missed).padStart(2)}                  ${String(accepted).padStart(2)}`);
}
process.exit(hits === references.length ? 0 : 1);
