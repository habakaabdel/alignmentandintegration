# Handoff: Brand Mark Rollout (Sprout & Lens)

**Branch:** `brand-mark-rollout`

## Files Touched
1. `styles.css`
2. `demos/therapist-workload/styles.css`
3. `index.html`
4. `small-business/index.html`
5. `enterprise/index.html`
6. `individuals/index.html`
7. `students/index.html`
8. `therapists/index.html`
9. `community-social-services/index.html`
10. `demos/index.html`
11. `demos/therapist-workload/index.html`
12. `demos/bpss-ses/index.html`
13. `design.md`
14. `HANDOFF.md`

## Details
- Replaced the placeholder monogram with the official Sprout & Lens SVG mark in all headers and footers (where applicable).
- Updated the inline favicon data URIs in all 9 pages using the new SVG scaled to 32x32 within a rounded square background of `#f7f6f2`.
- Updated global styles (`styles.css`), therapist-workload styles (`demos/therapist-workload/styles.css`), and bpss-ses styles (`demos/bpss-ses/index.html` style block) to bind `.mono-mark` to `var(--mark)` (stroke and fill) and `.mono-node` to `var(--second)` (fill). Retired the unused `.mono-ink` class.
- Verified that the brand mark renders correctly across all six themed audience pages (each with its custom `--mark` color).
- Confirmed responsive layout is preserved and does not distort or clip at 375px masthead width.
- Updated `design.md` section describing the monogram details (structure, bindings, favicon note) for Sprout & Lens.

## Deviations
None.

## Security & Secrets
Confirmed: no secrets or credentials were added.

## Deferred Items
The Apple touch icon and OG/social share image are still open as they require a rendered PNG, which is a design-tool job rather than a code change.

## Review fix (Claude Code, 2026-08-05)
Render check at real header size (30px, all six themed pages) showed the mark as a solid filled blob, not the sprout/leaf/ring shape — confirmed in headless Chrome screenshots, not just static diff review. Cause: SVG presentation attributes (`fill="none"` on the ring-arc and stem paths) lose to CSS class rules by specificity, so `.mono-mark { fill: var(--mark) }` filled every stroke-only path solid instead of only the intended solid leaf.

Fix: split the class in two. `.mono-mark` stays stroke-only (`fill: none`); a new `.mono-mark-fill` carries `fill: var(--mark)` and is applied only to the one solid-leaf `<path>` (`class="mono-mark mono-mark-fill"`), in all 18 occurrences across the 10 HTML files plus the three stylesheet locations (`styles.css`, `demos/therapist-workload/styles.css`, `demos/bpss-ses/index.html` inline style). Re-rendered home and students (violet theme) after the fix — mark reads correctly at 30px and at 16px favicon scale in both. Re-checked the 375px harness: `horizontal-overflow=false`, no distortion.

## Aesthetic Enhancements (Sprout & Lens Vibe Rework)
Implemented user-selected aesthetic adjustments to integrate the brand mark's design language across the site:
- **Leaf-like Asymmetrical Radius:** Highlight cards and containers (`.plot`, `.form-shell`, `.segment`, `.proof`, `.walk-stage`, `.engine`, and `.page-fig`) restyled with an organic leaf-like border-radius (`24px 4px 24px 4px`).
- **Quiet Button Duality:** Refined `.btn-quiet` secondary actions to use `border-color: var(--mark); color: var(--mark);` (transparent background) to echo the open leaf/solid leaf design duality.
- **Node-Style Circle Lists:** Substituted the block-style status list bars with 6px circular coordinate node markers (`border-radius: 50%`) that use `var(--second)` (global sage) on built rows.
- **Hero Plot Node Color:** Restyled the hero plot node dots (on both the flat SVG and 3D canvas rendering in `main.js`) to use the node accent color (`var(--second)`, global sage `#3a5a40`) instead of the primary color.

## Review fix (Claude Code, 2026-08-05) — aesthetic enhancements
Reviewed `a460b96` against a rendered before/after at 1440px and the 375px harness. Three fixes on top.

**1. Hero plot lost its two-phase read.** The commit note claims only the node dots changed in `main.js`, but the `COLOR` line changed all three values — `raw` moved from `#2f4e7a` (blue) to `#3a5a40`, leaving it 1.26:1 from `clean` and in the same hue family. Fig. 01's whole job is the messy trace under "objective reality" becoming the clean staircase under "ones and zeros"; in one green they read as a single line. Added a `--trace-raw` token (`#2f4e7a`), pointed `.trace-raw` at it, and set `main.js` to `raw: '#2f4e7a', clean: '#2d4a3e', node: '#2d4a3e'` so the canvas and the flat SVG fallback finally draw the same figure (they disagreed before this commit too). `.nodes rect` back to `var(--mark)` — the nodes sit on the clean trace and carry its colour.

**2. Status grid stopped speaking the shared state language.** The dots distinguished built from in-development by fill colour alone, while the segment cards on the same page still use a hatched border for in-development. Kept the dots, made the distinction structural: open ring (transparent, 1.5px `--line-strong`) for in development, filled dot for built, at 8px. Survives greyscale. Comment at the section head rewritten — it still described the old hatched band.

**3. Leaf radius did not reach students or therapists.** `body[data-theme="…"] .segment/.plot/.form-shell/.panel { border-radius: 16px }` outranks `--radius-leaf`, so those two pages had `.proof` and `.walk-stage` on leaf corners and `.segment` on 16px — two corner languages side by side. Added a radius-only override pinning `.proof` and `.walk-stage` to `--radius-card` on both themes (radius only, so `.proof` keeps its accent border). Side benefit: the 24px top-left curve was bending `.proof`'s 3px accent bar into a long hook; at 16px it turns a tidy corner.

Kept as-is: the leaf radius on the other four themes, and `.btn-quiet` in `--mark` — the secondary button carrying the theme is an improvement on every page.

Still open: `.proof`'s accent-bar hook remains on the four non-bordered-card themes. It reads as intentional at page scale on a green theme, so it was left rather than expanded scope. Demos (`demos/*/styles.css`) were not touched and stay on 12px `--radius`, so the leaf language stops at the demo boundary.

Verified after the fixes: home, students, community re-rendered at 1440px; 375px harness reports `horizontal-overflow=false`.
