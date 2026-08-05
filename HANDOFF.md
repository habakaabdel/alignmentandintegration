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
