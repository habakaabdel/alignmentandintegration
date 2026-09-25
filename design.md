# Alignment Integration, design record

What `styles.css` and the pages do today. When the code and this file disagree, the code is right and this file is out of date; fix it in the same change.

The look: a warm linen sheet, soft charcoal type, deep sage marks. One grid, one type system, one monogram. Each audience page moves only the ground and the accent through a `data-theme` token block. Soft background scenes move behind the content; the content never depends on them.

---

## Pages and themes

| Page | `data-theme` | Background scene |
|---|---|---|
| `/` | none (default tokens) | `#eco`, from `eco.js` (Three.js) |
| `/individuals/` | `individuals` | none |
| `/organizations/` | `organizations` | none |
| `/community-social-services/` | `community` | `#page-scene`, from its `scene.js` |
| `/ai-readiness/` | `ai-readiness` | `#page-scene`, from its `scene.js` |
| `/ai-readiness/start/` | `ai-readiness` | none; uses the scroll-motion kit instead |
| `/demos/` | none | `#page-scene`, from its `scene.js` |
| `/privacy/` | none | none (the canvas is in the markup, no script loads) |
| `/about/` | none | none; loads `/about/about.css` and `/about/about.js` after the site files |

Every page that loads `main.js` also gets `#nature-canvas`, a fluid wave canvas `main.js` inserts behind everything. All three canvases are fixed, full viewport, `z-index: 0`, `pointer-events: none`; `main`, `header`, and `footer` sit above at `z-index: 1`.

The demos under `demos/<name>/` are self-contained. They carry their own stylesheets (two still load Google Fonts), their own scripts, and no site nav. Nothing in this file applies to them.

## Colour

Default tokens on `:root`:

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f7f6f2` | page ground |
| `--panel` | `#ffffff` | cards, offers, form inputs, figure plate |
| `--panel-deep` | `#f0eee7` | the claim and engine bands on home (at 70% via `color-mix`) |
| `--ink` | `#1c1d1c` | headings, body, focus ring |
| `--ink-muted` | `#5e605d` | secondary prose, labels |
| `--mark` | `#2d4a3e` | links, primary button, lead offer, indices |
| `--mark-deep` | `#1d332a` | hover for the above |
| `--second` | `#3a5a40` | monogram nodes, figure strokes |
| `--trace-raw` | `#2f4e7a` | the raw trace in the home hero figure only |
| `--line` | `#d8d6ce` | hairlines, card borders, input borders |
| `--line-strong` | `#717d76` | home segment cards, tick marks in the section rule |

Theme blocks on `body[data-theme="..."]` in use today:

| Theme | `--paper` | `--mark` | `--mark-deep` |
|---|---|---|---|
| `individuals` | `#f9f5f3` | `#7d3650` | `#592437` |
| `organizations` | `#f2f4f5` | `#2f4e7a` | `#1e3556` |
| `community` | `#f7f4ee` | `#2d4a3e` | `#1d332a` |
| `ai-readiness` | `#f8f5f0` | `#8a5420` | `#5e3812` |

`ai-readiness` also sets `--row-tint` inline on its page, and the landing page sets the motion kit's `--fill` and `--stroke` on its `body[data-theme]`.

`styles.css` still holds `enterprise`, `small-business`, and `students` theme blocks, plus a `students` bordered-card treatment. No page uses them; those URLs now redirect in `netlify.toml`.

Rules:
- A theme block reassigns tokens only. `--ink` and `--ink-muted` never move.
- No text on `--line` or `--line-strong`; they are boundary colours.
- One ground per page. There is no dark mode and `prefers-color-scheme` is not read.
- No gold.

## Type

Self-hosted from `media/fonts/` with `@font-face` at the top of `styles.css`, `font-display: swap`, Latin subset. No Google Fonts request on any site page.

- `--sans`: Plus Jakarta Sans, variable 300 to 700. All prose, headings, buttons.
- `--mono`: IBM Plex Mono 400 and 500. Indices, eyebrows, figure keys, offer tags, the nav toggle label.

| Token | Value |
|---|---|
| `--t-micro` | 0.75rem |
| `--t-label` | 0.8125rem |
| `--t-small` | 0.9375rem |
| `--t-body` | 1.0625rem |
| `--t-lead` | clamp(1.125rem, 0.98rem + 0.55vw, 1.3125rem) |
| `--t-h3` | clamp(1.125rem, 1.02rem + 0.4vw, 1.3125rem) |
| `--t-h2` | clamp(1.5rem, 1.24rem + 1.05vw, 2rem) |
| `--t-h1` | clamp(2rem, 1.45rem + 2.5vw, 3.5rem) |

Body line height 1.65, headings 1.2 at weight 600 with `-0.01em` tracking. The page `h1` (`.hero-title` on home, `.segment-lede` on the audience pages) uses `--t-h1`; `.segment-lede` adds `-0.022em` and caps at 20ch. Mono labels carry positive tracking, 0.04em to 0.14em.

Sentence case everywhere, headings and buttons included.

## Space, radius, surfaces

- Spacing on a 4px base: `--s1` 0.25rem through `--s9` 6rem (4, 8, 12, 16, 24, 32, 48, 64, 96px).
- Container `--measure` 1100px, gutter `clamp(1.25rem, 4vw, 3rem)`.
- `.section` padding `clamp(2.5rem, 6vw, 6rem)`; `.band` 6rem.
- Radii: `--radius` 12px, `--radius-card` 16px (offers, islands), `--radius-leaf` `24px 4px 24px 4px` (home segment cards, the hero bezel), `--radius-pill` 999px (buttons). Inputs are 10px.
- Surfaces:
  - `.island`: prose on home sits on frosted paper, `--panel` at 88% with a 3px backdrop blur, 1px `--line`, card radius. Keeps the eco scene behind the words, not through them.
  - `.bezel` / `.bezel-core`: the hero figure's double frame, a faint tray around a white plate with a soft lift shadow.
  - `.offer` in a `.bento` grid: the lead offer spans two rows on `--mark` with paper text; the other two stack beside it. One column below 58rem.
  - `.build` rows and `.proof` panels carry the audience pages.
- Shadows exist but stay soft: `--lift` on the primary button and the bezel plate only.
- The section rule: every `.section` that follows another gets a 1px `--line` hairline with a row of `--line-strong` ticks every 9px under it, at 0.75 opacity.

## Buttons and focus

- `.btn`: pill, `--t-small` at 600, with an optional round `.btn-well` holding an arrow that nudges 2px up and right on hover. Press scales to 0.98.
- `.btn-primary`: `--mark` ground, paper text, `--lift`; hover goes to `--mark-deep`.
- `.btn-quiet`: transparent with a `--line` border.
- Focus ring on everything: 2px `--ink` at 2px offset. Inputs use 2px `--mark` at 1px offset instead.

## Masthead and nav

Five links on every site page: For individuals, For organizations, Demos, About, Contact (`.nav-cta`, to `/#contact`). Below 56rem they live in a `details` disclosure labelled "menu" whose toggle is a plus in two hairlines; from 56rem up the panel is held open with `::details-content` and the toggle is hidden. No script is needed. `main.js` sets `aria-current` for in-page anchors and closes the panel after a link is used.

The landing page `/ai-readiness/start/` has no nav; the brand mark links home.

## Motion

Tokens: `--fast` 140ms, `--base` 240ms, ease `cubic-bezier(0.2, 0, 0, 1)`.

Two reveal systems, never mixed on one element:
- `data-reveal`, the shared one, used on the audience, sector, and demos pages. The hidden state exists only under `html.reveal-ready`, which `main.js` sets after confirming motion is welcome and IntersectionObserver exists. Elements rise 14px over 0.7s; stagger with `--rv` (70ms per step).
- `.rise`, used on home, gated on the `.js` class set inline in the head. 20px over 760ms.

Home also has a word split on the hero line (`.wsplit`), the hero figure (`initPlot3D()` on canvas with the flat `drawPlot()` fallback), and the eco scene. The community page carries three `data-walk` walkthroughs driven by `wireWalkthroughs()`, with frames in `media/walk/`.

The landing page uses the vendored scroll-motion kit (`vendor/gsap.min.js`, `ScrollTrigger`, `ScrollSmoother`, `motion.js`, `motion.css`), tuned inline in its own `Motion.init()`. Its page classes are `lp-` prefixed so they never collide with sitewide names.

Under `prefers-reduced-motion: reduce` reveals render settled, smooth scrolling is off, background scenes draw one still frame or nothing, and the hero figure is static. Nothing is only legible after it moves.

## Monogram

The sprout and lens mark on a `0 0 48 48` grid: an open ring ending in a node, a stem, one solid leaf, one outlined leaf, and a node at the solid leaf's tip. `.mono-mark` and `.mono-mark-fill` take `--mark`; `.mono-node` takes `--second`, so the mark follows the page theme. The favicon is the same geometry as an inline SVG data URI on a `#f7f6f2` rounded square. The community and demos pages add a `.segment-mark` from `brand/<page>/mark.svg`. Master files live in `brand/alignmentandintegration/`.

## Forms

- Home: `name="contact"`, `data-netlify="true"`, hidden `form-name` input, `netlify-honeypot="referral-source"`. `wireForm()` submits in place and shows the confirmation.
- Landing page: `name="ai-readiness-consult"`, honeypot `company-site`, plain native POST.

## Structure rules

- One `h1` per page. Sections use `h2`, items `h3`. No skipped levels.
- The site works with no JavaScript: links navigate, the nav opens, forms post natively.
- Responsive from 360px with no horizontal overflow. Check 375px and 1280px on any change, 768px near a breakpoint. Tap targets are at least 44px; small links grow their hit area with a transparent `::after`.
- No analytics, no cookies, no third party requests from site pages. The booking link to cal.com is a plain link.

## The about page

`/about/` is Abdel's page, first person singular, on the default tokens. The first screen is a stage: the four-level map (person, program, agency, region) on the left, a tab strip and one panel on the right; nodes and tabs are one control (`about.js`), the selected node fills with `--mark`, cases fold open with native `details`, and `#agency` style hashes deep-link. Below it a slow ticker of his lines, the hire list as `.builds`, a contained photograph, background as a timeline, and a contact block that points at the home page form. Photographs live in `about/media/`. Until launch the page carries a review banner and `mark.nn` highlights on sentences not yet in his words; both go at launch.

## Content rules

- Canadian English, sentence case, first person plural.
- No em dashes, and none of: "leverage", "seamless", "empower", "transform", "cutting-edge", "unlock", or hype adjectives. Comments and metadata included. This is why the CSS uses `translate`, and why this file says so.
- No client or employer names. Sectors only.
- No outcome numbers, user counts, "in use", or "trusted by". Built things are described as built, not in service.
- Every audience page states what we are not claiming, in a `.bounds` paragraph.
- Prices: the initial consultation is free, and diagnosis and intervention is $3,500 CAD flat on `/organizations/`. No other prices.

## Known loose ends in `styles.css`

- `--slow` and `--ink-faint` are used but never defined.
- The header comment and a few section comments (the nav, the Student Pal embed) describe earlier versions.
- The unused theme blocks noted above, and `.tile` in the print rules, which no site page uses.
