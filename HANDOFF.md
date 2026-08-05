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
