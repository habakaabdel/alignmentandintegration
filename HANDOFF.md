## What changed
- Rebased redesign onto current `main` branch preserving all shipped work (`demos/index.html`, `Demos` nav item on all 7 pages, `therapist-workload/main.js` registration block, and `bpss-ses/index.html` heading fix).
- Redesigned site design tokens in `styles.css` to Serene Organic Minimalist palette (`--paper: #f7f6f2`, `--panel: #ffffff`, `--ink: #1c1d1c`, `--mark: #2d4a3e`, `--line-strong: #717d76`).
- Darkened `--line-strong` to `#717d76`, achieving a measured **3.95:1** contrast ratio against `--paper` (`#f7f6f2`), comfortably clearing the WCAG 3:1 boundary floor.
- Removed all 3rd-party CDN dependencies (`cdnjs`, `jsdelivr`, Lenis, GSAP, Font Awesome). Built fluid organic wave canvas shader natively in Vanilla JS.
- Added comprehensive reduced-motion handling under `@media (prefers-reduced-motion: reduce)` in CSS and `motionOK` JS checks to disable canvas animations and force static rendering.
- Removed redundant `demos/showcase.html` demo file in favor of the live shipped `demos/index.html`.

## What to verify before deploying
- Load `index.html` and click through to `/demos/`, `/enterprise/`, `/small-business/`, `/community-social-services/`, `/students/`, `/therapists/`, and `/individuals/` to confirm font rendering and nav current-state indicators.
- Test with `prefers-reduced-motion: reduce` enabled in browser devtools to verify that `#nature-canvas` is hidden and no smooth scroll or transform animations run.
- Inspect network panel in browser devtools to verify zero 3rd-party CDN requests are made (only `fonts.googleapis.com` / `fonts.gstatic.com` requested).
- Inspect mobile viewport at 375px width to verify no horizontal overflow occurs and container padding scales cleanly to `1.25rem`.

## What I could not do
- Did not deploy to production (deployments are handled by reviewer / Claude Code).

## Secrets check
- Confirmed no API keys, tokens, or credentials were added to source or commit history.
