# Reference Check

A ChatGPT plugin published by Alignment Integration. It checks a pasted reference list against Crossref and reports, for each reference, `match`, `mismatch` or `not_found_in_crossref`.

- `../../netlify/functions/mcp.mjs`: the MCP server, one Netlify Function at `/mcp`. Stateless Streamable HTTP, no sign-in, rate limited in the function's config. Two read-only tools, `check_references` and `find_reference`.
- `src/crossref.mjs`: the Crossref lookups (DOI, title and author search, registration agency).
- `src/match.mjs`: the comparison and the title threshold.
- `src/check.mjs`: the result for each reference.
- `tests/match.test.mjs`: offline tests, `npm test`.
- `tests/references.mjs` and `tests/eval.mjs`: the test set the threshold was set from, run against live Crossref with `npm run eval`.
- `plugin/`: the submission package (`plugin.json`, `mcp.json`, logo). Zip the contents of this folder to submit.

Nothing in this folder is served: `netlify.toml` returns 404 for `/server/*`, `/netlify/*`, `/node_modules/*` and the package files. The public pages are in `/reference-check/`.

The server stores nothing. A reference that Crossref does not hold is reported as not found in Crossref, never as fake.
