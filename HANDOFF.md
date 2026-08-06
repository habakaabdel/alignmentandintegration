# Handoff: Home Page Composition Redesign

**Branch:** `redesign-home-composition`

## Files Touched
1. `styles.css` - Custom typography (clamp h1), local variables for custom tokens, bezel and bento layouts, CSS step list counters, mechanism beats styling, and reveal animations.
2. `index.html` - Recomposited Hero section with `<canvas id="plot">` element, split steps and offers into separate layout bands, asymmetric bento offers layout, inline JS initialization for '.js' class, and bottom JS block for IntersectionObserver scroll reveal + deterministic pseudo-random canvas plot drawings.
3. `.gitignore` - Replaced em dash in comments with hyphen.
4. Google Fonts removals (link and preconnect tags deleted) across all 8 canonical files:
   - `index.html`
   - `small-business/index.html`
   - `enterprise/index.html`
   - `individuals/index.html`
   - `students/index.html`
   - `therapists/index.html`
   - `community-social-services/index.html`
   - `demos/index.html`

## Details

- **Self-Hosted Font Loading:** Configured three `@font-face` rules for `IBM Plex Mono` (400, 500) and `Plus Jakarta Sans` (300 700 variable) referencing local woff2 files in `media/fonts/...` with `font-display: swap` at the top of `styles.css`. Removed Google Fonts preconnect and style link tags from all 8 canonical pages. Removed the unused `"IBM Plex Sans"` font fallback.
- **Hero Recomposition:** Updated the hero structure to move the main `<h1>` title to full width at the top. Below it, a two-column `.hero-grid` contains the claim copy and CTAs on the left, and the double bezel container (`.bezel` tray and `.bezel-core` plate) on the right containing a `<canvas id="plot">` element.
- **Section Index Numerals:** Removed index numerals (`01` through `05`) and their styles (`.index` class rules) from the page.
- **Process Steps Counter:** Removed the static `step one` through `step four` labels. Implemented counter increment logic in `styles.css` using `steps` and `step-n` counter reset, showing step numbers as two-digit leading zero numbers (`01` to `04`) in the mark color.
- **Asymmetric Bento Offers:** Replaced the static menu sequence labels with categories (`the full build`, `start here`, `stands alone`). Styled the `.bento` grid where `the full build` spans two rows on the left with custom mark theme color background and light text, and the other two cards stack on the right. Below `58rem` width, it resets to a single column.
- **Scroll Reveal Animations:** Added `.rise` class reveal transition styles gated on `.js` class and prefers-reduced-motion media query. Included inline initialization script immediately after the opening `<body>` tag, and copied the IntersectionObserver viewport entrance logic verbatim at the bottom of the home page.
- **Deterministic Canvas Plot:** Replaced the static SVG path figure with a custom HTML5 canvas graph drawing. Added JavaScript drawing function with deterministic pseudo-noise generated from sine wave offsets, matching the live site color schemes (`--trace-raw` for raw operation trace, and `--mark` for final clean staircase trace).

## Verification

- Took headless Chrome screenshots at both 1440px desktop width and 375px mobile viewport widths (using the iframe harness at `.verify/harness.html`).
- Confirmed that the hero title occupies two lines at desktop size and both primary/quiet CTAs are positioned above the fold.
- Confirmed that the mobile layout is responsive, does not trigger horizontal overflow, and the bento cards collapse correctly into a single column.
- Verified that local fonts are loading and rendering correctly, and that themed audience pages continue to display their specific custom color accents correctly.
- Confirmed that there are zero em dashes used anywhere in the codebase modifications and in this handoff document.

## Security & Secrets
Confirmed: no secrets or credentials were added.
