# Alignment Integration, design record

What `styles.css` and the pages do today. When the code and this file disagree, the code is right and this file is out of date; fix it in the same change.

The look: a warm linen sheet, soft charcoal type, deep sage marks. One grid, one type system, one monogram. A page that wants its own ground moves only the ground and the accent through a `data-theme` token block. Soft background scenes move behind the content; the content never depends on them.

Since 2026-11-01 the site is one simple home page and one landing page per service (Brief 109): Reporting alignment at `/reporting/`, Video at `/video/`, Events at `/events/`, Software builds at `/demos/`. The doors are services, not audiences; clients are anyone. Every service page ends at its own contact section. The home page took comp G (his pick, 1 November 2026) on 2026-11-02: a deep sage band, seven cards and a start card, on the existing tokens and components; see The home page below. The service pages keep the earlier look until he picks for them.

---

## Pages and themes

| Page | `data-theme` | Background scene |
|---|---|---|
| `/` | none (`body.home`, which only widens `--measure`) | `#eco`, from `eco.js` (Three.js). The band (`.masthead` and `.home-hero` on `--mark-deep`), the `.home-card`s in two blocks (primary, then Other services), the proof strip (`#work`), contact |
| `/reporting/` | `organizations` | none. The Reporting alignment page; it was `/organizations/` until 2026-11-01 and keeps that theme block |
| `/organizations/sample-diagnosis/` | `organizations` | none; its own scoped styles. Reached from `/reporting/` |
| `/video/` | none | none; a small scoped `<style>` block. The Wolfe Retreat video (the short and the tour) and the Brain to AI reel, each a local 540 by 960 mp4, and a marked `.slot` for the case study that has no files yet |
| `/events/` | none | none. New on 2026-11-01; filled on 2026-11-05 except the proof slot, which stays a placeholder |
| `/demos/` | none | `#page-scene`, from its `scene.js`. The Software builds page; the five demos, the barbershop quote, the bounds line |
| `/privacy/` | none | none (the canvas is in the markup, no script loads) |
| `/about/` | none | none. Since 2026-11-01, five sections for a customer of any service: who we are, the four doors, how we work, the proof, contact. One small scoped `<style>` block for the portrait grid |
| `/community-social-services/`, `/ai-readiness/`, `/ai-readiness/start/` | Retired 2 November 2026 on Abdel's word; 301 to `/reporting/` and the home page in `netlify.toml`. | |

`/organizations/` and `/videos/` answer 301 to `/reporting/` and `/video/` from `netlify.toml`; the sample diagnosis keeps its old path, so the organizations rule is exact rather than a splat.

Every page that loads `main.js` also gets `#nature-canvas`, a fluid wave canvas `main.js` inserts behind everything. All three canvases are fixed, full viewport, `z-index: 0`, `pointer-events: none`; `main`, `header`, and `footer` sit above at `z-index: 1`.

The demos under `demos/<name>/` are self-contained. They carry their own stylesheets (two still load Google Fonts), their own scripts, and no site nav. Nothing in this file applies to them.

## Colour

Default tokens on `:root`:

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f7f6f2` | page ground |
| `--panel` | `#ffffff` | cards, offers, form inputs, figure plate |
| `--panel-deep` | `#f0eee7` | the about page photo band (at 70% via `color-mix`); the home bands moved to `--tint-sage` on 2026-10-12 |
| `--ink` | `#1c1d1c` | headings, body, focus ring |
| `--ink-muted` | `#5e605d` | secondary prose, labels |
| `--mark` | `#2d4a3e` | links, primary button, lead offer, indices |
| `--mark-deep` | `#1d332a` | hover for the above |
| `--second` | `#3a5a40` | monogram nodes, figure strokes |
| `--trace-raw` | `#2f4e7a` | the raw trace in the home hero figure only |
| `--line` | `#d8d6ce` | hairlines, card borders, input borders |
| `--line-strong` | `#717d76` | home segment cards, tick marks in the section rule |

Sage Garden additions, 2026-10-12. Taken from the Sage Garden theme on 21st.dev and added alongside the tokens above, which do not change. In use: `--tint-sage` on the home claim and engine bands (at 70% via `color-mix`). On the claim band `--ink` reads 12.3:1, `--mark` 7.1:1 and `--ink-muted` 4.6:1; the engine band's text sits on its frosted islands, not on the tint. The rest are available for new work.

| Token | Value | Use |
|---|---|---|
| `--sage` | `#7c9082` | dusty sage for fills, strokes, figure marks, the monogram; never text |
| `--sage-deep` | `#637468` | sage that carries text: links, button fills with paper text |
| `--tint-sage` | `#ced4bf` | the claim and engine bands on home; soft sage band or card fill |
| `--tint-moss` | `#bfc9bb` | a second, cooler sage fill |
| `--tint-stone` | `#e8e6e1` | neutral stone fill, quieter than `--panel-deep` |
| `--ink-navy` | `#1a1f2e` | navy-tinted text, an alternative to `--ink` |
| `--line-soft` | `#e8e6e1` | lighter hairline than `--line` |

Contrast, measured 2026-10-12 against the 4.5:1 floor for text:
- `--sage` is 3.4:1 on white and 3.15:1 on `--paper`, so it never carries text and never sits behind text.
- `--sage-deep` is 4.97:1 on white and 4.5:1 or better on every page `--paper` (4.59 default, 4.58 `individuals`, 4.50 `organizations`, 4.52 `community`, 4.57 `ai-readiness`). It drops to 4.28:1 on `--panel-deep` and below 4:1 on the tints, so no sage text on those.
- `--ink-navy` and `--ink` both clear 9.6:1 on every ground and tint above. Text on a tint uses one of them; `--ink-muted` falls to 3.72:1 on `--tint-moss`, so muted text stays off that fill.
- Text dimmed with `opacity` on a `--mark` fill stays at 0.8 or above: `--paper` at 0.8 on the `organizations` `--mark` reads 5.57:1, at 0.6 it read 3.9:1 (the reporting lead offer's tag until 2026-11-07). A rendered sweep of every page at 375 and 1280 on 2026-11-07 found no other text under 4.5:1.

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
- No text on `--line`, `--line-strong` or `--line-soft`; they are boundary colours.
- One ground per page. There is no dark mode and `prefers-color-scheme` is not read.
- No gold.

## Type

Self-hosted from `media/fonts/` with `@font-face` at the top of `styles.css`, `font-display: swap`, Latin subset. No Google Fonts request on any site page.

- `--sans`: Plus Jakarta Sans, variable 300 to 700. All prose, headings, buttons. `button` elements inherit it explicitly (browsers default them to a system font; the form submit buttons rendered in Arial until 2026-11-07).
- `--mono`: IBM Plex Mono 400 and 500. Indices, eyebrows, figure keys, offer tags, the nav toggle label, and the labels this file names on the home cards. Only these. Words a visitor reads to act (nav links, form labels, error lines, the footer legal line) are `--sans`; they moved off mono on 2026-11-07.
- Numbers that stack or sit in columns use tabular figures: mono numerals already are; a sans number in a column, counter or stacked comparison takes `font-variant-numeric: tabular-nums` (today `.step-n` and the sample diagnosis `.sd-key`). Numbers inside a sentence stay proportional.

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

Wrapping, since 2026-11-07: `h1`, `h2` and `h3` carry `text-wrap: balance` so a heading never ends on one word; `p`, `li`, `dd` and `figcaption` carry `text-wrap: pretty`. Browsers without support wrap as before.

## Space, radius, surfaces

- Spacing on a 4px base: `--s1` 0.25rem through `--s9` 6rem (4, 8, 12, 16, 24, 32, 48, 64, 96px).
- Container `--measure` 1100px, gutter `clamp(1.25rem, 4vw, 3rem)`. `body.home` sets `--measure` to 1240px (comp G's container), so every `.wrap` on the home page, masthead and footer included, lines up with the cards.
- `.section` padding `clamp(2.5rem, 6vw, 6rem)`; `.band` 6rem.
- Radii: `--radius` 12px, `--radius-card` 16px (offers, islands), `--radius-leaf` `24px 4px 24px 4px` (home segment cards, the hero bezel), `--radius-pill` 999px (buttons), and `--radius-sm` 6px (added 2026-10-12 from Sage Garden, unused so far, for tags, chips and small panels). Inputs are 10px.
- Nested radius, since 2026-11-07: a surface that sits inside another, inset by the outer one's padding, takes the outer radius minus that padding, floored at 0 (`max(0px, outer - padding)`), so the two curves stay parallel. Today that is `.bezel-core` inside `.bezel`: the 24px and 4px leaf minus `--bezel-pad` (10px, 6px on the sample diagnosis below 40rem) gives 14px and 0. Elements that do not fill their parent (the 42px icon squares, inputs, buttons) keep their own radius.
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

Four items on every site page: Services, Work, About, Contact. Services is a `.nav-group` holding a nested `details.nav-sub-disclosure` that opens the four service pages (Reporting alignment, Video, Events, Software builds), each with a one-line `.nav-sub-note`; on a phone it is a plain indented sublist, from 56rem up it is a hover and focus panel. Work goes to the proof strip on home (`#work` on home, `/#work` elsewhere). Contact (`.nav-cta`) goes to the page's own `#contact` on home, the four service pages and the about page, and to `/#contact` on every other page. Below 56rem the row lives in a `details` disclosure labelled "menu" whose toggle is a plus in two hairlines; from 56rem up the panel is held open with `::details-content` and the toggle is hidden. No script is needed. `main.js` sets `aria-current` for in-page anchors and closes the panel after a link is used; a service page hard codes `aria-current="page"` on its own entry (the about page does the same on About), and the group trigger carries the mark.

The landing page `/ai-readiness/start/` has no nav; the brand mark links home.

On the home page the masthead sits on the deep sage band (`body.home .masthead`): `--mark-deep` ground, no bottom hairline, paper brand and toggle, the monogram in paper with `--tint-sage` nodes. From 56rem the row's links are `--tint-sage` with paper on hover and current, the current rule is `--tint-sage`, and Contact's border is `--tint-sage` at 40 percent. Below 56rem the panel stays paper with its ink links, so only the brand and the toggle change. Focus rings on the band are paper; inside the paper panel and the white Services sheet they stay ink. Every colour is set explicitly because `--ink` and `--ink-muted` never move.

## Motion

Tokens: `--fast` 140ms, `--base` 240ms, ease `cubic-bezier(0.2, 0, 0, 1)`.

Two reveal systems, never mixed on one element:
- `data-reveal`, the shared one, used on the audience, sector, and demos pages. The hidden state exists only under `html.reveal-ready`, which `main.js` sets after confirming motion is welcome and IntersectionObserver exists. Elements rise 14px over 0.7s; stagger with `--rv` (70ms per step).
- `.rise`, used on home, gated on the `.js` class set inline in the head. 20px over 760ms. The children that stagger inside a risen group are `.step`, `.offer`, `.segment`, `.beat`, `.home-card` and `.status-row`.

Home also has the eco scene; the band and the cards carry no reveal of their own beyond `.rise` on the grid. The word split (`.wsplit`) and the hero figure (`initPlot3D()`, `drawPlot()`) are still in `main.js` and `styles.css` but no page carries their markup since 2026-11-01. The community page carries three `data-walk` walkthroughs driven by `wireWalkthroughs()`, with frames in `media/walk/`.

The landing page uses the vendored scroll-motion kit (`vendor/gsap.min.js`, `ScrollTrigger`, `ScrollSmoother`, `motion.js`, `motion.css`), tuned inline in its own `Motion.init()`. Its page classes are `lp-` prefixed so they never collide with sitewide names.

Under `prefers-reduced-motion: reduce` reveals render settled, smooth scrolling is off, background scenes draw one still frame or nothing, and the hero figure is static. Nothing is only legible after it moves.

## Monogram

The sprout and lens mark on a `0 0 48 48` grid: an open ring ending in a node, a stem, one solid leaf, one outlined leaf, and a node at the solid leaf's tip. `.mono-mark` and `.mono-mark-fill` take `--mark`; `.mono-node` takes `--second`, so the mark follows the page theme. The favicon is the same geometry as an inline SVG data URI on a `#f7f6f2` rounded square. The community and demos pages add a `.segment-mark` from `brand/<page>/mark.svg`. Master files live in `brand/alignmentandintegration/`.

## Forms

- Home, the four service pages and the about page: the same `name="contact"` form, `data-netlify="true"`, hidden `form-name` input, `netlify-honeypot="referral-source"`, and a hidden `service` input naming the page it was sent from (Home, Reporting alignment, Video, Events, Software builds, About). `wireForm()` submits in place and shows the confirmation. While the request is out the button is disabled, reads the form's `data-sending` word ("Starting") and carries `aria-busy="true"`, which draws a small turning ring after the word (still under reduced motion); on failure the button comes back as it was and the error line shows. Motion on this site is for feedback like this, not decoration.
- Landing page: `name="ai-readiness-consult"`, honeypot `company-site`, plain native POST.

## Structure rules

- One `h1` per page. Sections use `h2`, items `h3`. No skipped levels.
- A service page is: a `.section-segment-hero` (crumb, eyebrow, `.segment-lede`, `.segment-claim`, two buttons, the first to `#contact`), its sections, an `.also` list of the other three services, then the `.band.contact` section with the form. Every service page ends at contact. The about page follows the same shape, with the four doors in place of the `.also` list.
- The site works with no JavaScript: links navigate, the nav opens, forms post natively.
- Responsive from 360px with no horizontal overflow. Check 375px and 1280px on any change, 768px near a breakpoint. Tap targets are at least 44px; small links grow their hit area with a transparent `::after`.
- No analytics, no cookies, no third party requests from site pages. The booking link to cal.com is a plain link.

## The home page

Comp G, picked 1 November 2026, built 2 November on the existing tokens and components. Every rule is scoped on `body.home` or a `home-` class at the end of `styles.css`.

- **The band.** `.home-hero` on `--mark-deep` with paper type, 28px rounded bottom corners (20px on a phone), 88px of bottom padding. The masthead sits on it (above). Inside: `.home-pill`, an outlined `--mono` label at `--t-micro` in `--tint-sage` with a 40 percent `--tint-sage` border, reading "Reporting · Video · Events · Software builds"; the `h1` `.home-title` at `clamp(2.4rem, 6vw, 5.4rem)`, line height 1, `-0.04em`, capped at 13ch, "Align what matters." at 600 and "Integrate how you move forward." in a span at 300 in `--tint-sage`; then `.home-hero-foot`, the positioning sentence (`.home-claim`, `--t-body` in `--tint-stone`, 430px) on the left and `.btn.btn-paper` (a `--tint-sage` outline with paper text and the usual `.btn-well` arrow) on the right. Under 600px the foot stacks. The spacing above the pill and above the foot is `clamp(2rem, 8vh, 6rem)`.
- **The ghost.** `.home-ghost`, the monogram at 600px (340px on a phone) in `--tint-sage` at 0.09 opacity, positioned off the top right corner of the band, `pointer-events: none`, `aria-hidden`. His words: "that empty circle in top right should be the logo faded in background".
- **The cards.** `.home-cards`, a `ul` of eight `.home-card`s on `--panel` with a `--line` hairline and `--radius-card`, 16px gaps, padding 20px 22px 22px. One column by default, two from 601px, four from 1001px; from two columns up the grid overlaps the band by 56px, on a phone it sits 24px under it. The grid rises as one `.rise` group and the cards stagger. In order: 01 Reporting alignment, 02 Video, 03 Events, 04 Software builds, 05 Data, 06 Strategy, 07 Parts of systems (his words, 1 November), then the start card. Each card: `.home-card-top` holding `.home-card-icon` (a 42px square at `--radius` on `--tint-sage`, a 22px stroke icon at 1.6px in `--mark-deep`, matching what the card is) and `.home-card-n` (`--mono`, `--t-micro`, `--sage-deep`); the `h3` `.home-card-name` at 1.125rem; a visually hidden sentence saying what the drawing shows; the drawing `.home-card-join`, inline SVG, `aria-hidden`, pieces in `--ink-muted` and the result in `--mark` with `--mono` text; and `.home-card-go`, the one link, `--mono` at `--t-label` in `--mark` with the site's arrow, whose `::after` makes the whole card its hit area. Hover darkens the hairline to `--line-strong`; focus within turns it `--ink`.
- **The start card.** `.home-card-start` on `--tint-sage`: the label "Start here" in `--mark` (the comp's `--sage-deep` reads 3.26:1 on this tint), the `h3` "Tell us what needs to fit together." at 1.375rem, the line "A 30-minute call, then a proposal." in `--ink` (the comp's `--ink-muted` reads 4.17:1 here), and `.btn.btn-primary.btn-deep` to `#contact`, `--mark-deep` with `--mark` on hover.
- **Below the cards** the page is as before: the `#work` proof strip and the `.band.contact` form, both on their islands. The cards' heading, "What you can buy", is kept as an `h2` for the outline and hidden with `.visually-hidden`.
- Contrast on the band, measured 2026-11-02: paper 12.45:1, `--tint-sage` 8.85:1, `--tint-stone` 10.80:1. On a card: `--ink-muted` 6.35:1, `--mark` 9.72:1, `--sage-deep` 4.97:1. On the start card: `--mark` 6.38:1, `--ink` 11.11:1.
- `.visually-hidden` is the utility for text a screen reader gets and the page does not draw. `.offscreen-field` stays the honeypot's own rule.

## The about page

`/about/` is the company's page for a customer of any service, rebuilt on 2026-11-01 on the default tokens with the service-page components only. In order: a `.section-segment-hero` (crumb, eyebrow, the `h1` "One team for everything.", his translate-and-integrate line as the `.segment-claim`, Contact us and The services); 01 Who we are (`.section-head`, then three `.beats`: the method, complexity to simplicity, alignment and integration); 02 One team, four services (the positioning sentence, then the same four `.segments.doors` as home, word for word); 03 How we work (`.process-grid` with four `.steps`: the call, the deposit, the work, finishing the job); 04 Why trust the quality (the `.status` rows from the home proof strip plus the basketball league case study row, one sentence of the barbershop quote as a `.proof-quote` without the name or logo, and the `.offer-who` list beside the portrait in the page's own `.who` grid); then the `.band.contact` form with `service` set to About. The page loads `main.js` only; `about.css` and `about.js` went with the level map, the tabs, the ticker and the timeline.

His own sentences keep the first person singular; the company sentences (the positioning sentence, the deal path, the solutions-company line) say "we" or name the company. The employer's track record (the three case panels and the background timeline) is off the page until written clearance exists; PR 41 lists the removed sections. Photographs live in `about/media/`; only the portrait is on the page, the other files stay in the folder.

## The sample diagnosis page

`/organizations/sample-diagnosis/` was reworked on 2026-11-02 on his words of 1 November: "this page needs visuals throughout and less words after the first visual". Above and including the two process maps the page is as it was. Below them every section leads with a visual and the words are labels, numbers and at most one line of his per section; every word was already on the page. Everything is in the page's own `<style>` block on the existing tokens; no new colour, font or script, and `data-reveal` is the only motion.

- **The pull line** under the maps (`.sd-pull`): his "We will build within your systems..." sentence at `--t-lead` with a 3px `--mark` rule on the left.
- **02 The numbers**: three `.sd-measure` panels (Time, Data accuracy, Cost), one column below 62rem. Each is one inline SVG `role="img"` with an `aria-label` that states its numbers, plus a visually hidden table. The SVG has no `viewBox`: it is 100% wide with a fixed height and its geometry is in percentages of the width, so the text keeps its CSS size at every width. Before is `--ink-muted`, after is `--mark`, the empty dots in the grids are `--line`.
- **Hours, before and after**: two stacked bars on one scale (62 h is the full width, 18 h is 29 percent of it) with 2px `--panel` gaps between segments and the step number and hours in `--paper` inside each. `.sd-hours` is a size container: every segment is labelled from 760px, every segment of 3 h or more from 520px, below that every segment of 4 h or more carries its number and 6 h or more its hours. The key under each bar (`.sd-key`, two columns from 520px) carries every step name and its hours; the after key ends with the five steps deleted outright, struck through.
- **Pays back after 2.8 reports**: the saving per report ($1,848 each) as a `--mark` line with a dot at each report, the one-time fix ($5,180) as a dashed `--ink-muted` line, the crossing marked, a key with the fix broken out, and his "If you can set up something properly..." line as the caption (`.sd-say`).
- **03 What you receive**: three `.sd-card`s in the home card style (the 42px `--tint-sage` square, 22px icons at 1.6px in `--mark-deep`), each with its title and one existing line.
- **The two weeks**: `.sd-timeline`, four nodes (a 40px `--tint-sage` circle with the counter) on a `--line-strong` rail, vertical below 48rem and horizontal from it, each with its name and one phrase cut from his sentence.
- Contrast on the `organizations` theme, measured 2026-11-02: `--ink-muted` 6.35:1 on a panel and 5.76:1 on the paper; `--mark` 8.43:1 on a panel; `--paper` 5.76:1 on `--ink-muted` and 7.64:1 on `--mark` (the segment labels); `--mark-deep` 8.12:1 on `--tint-sage`; `--line-strong` 4.29:1 on a panel and 3.89:1 on the paper (the axis and the rail).

## Content rules

- Canadian English, sentence case, first person plural.
- Public sentences on this site are his. Reuse a sentence already on the site, a verbatim ruling, or a plain label; cut and reorder, but do not write new marketing sentences. Where a sentence does not exist yet, the page carries a visible `[NET-NEW n: what it must say]` placeholder until he says it.
- Exception, 5 November 2026, the four service pages only: he asked for each service explained in full with examples, written confidently. The "What it looks like" scenarios, the Data, Strategy and Parts of systems sections and the filled Events lines are new sentences under that ruling. Scenarios describe the kind of work, never a named client, a testimonial or a measured outcome.
- Never mention AI tools or automation in site text.
- No em dashes, and none of: "leverage", "seamless", "empower", "transform", "cutting-edge", "unlock", or hype adjectives. Comments and metadata included. This is why the CSS uses `translate`, and why this file says so.
- No client or employer names. Sectors only. Nothing from Kenora Chiefs Advisory (name, logo or work) until written clearance exists; no EMHware logo until the countersigned agreement is in hand. The barbershop quote on `/demos/` predates this rule and stands until ruled; `/about/` repeats one of its sentences without the name or logo and links to `/demos/#customer`.
- No outcome numbers, user counts, "in use", or "trusted by". Built things are described as built, not in service.
- Every audience page states what we are not claiming, in a `.bounds` paragraph.
- Prices, the only public ones (ruled 2026-11-01): diagnosis and intervention is $3,500 CAD flat on `/reporting/`, with the initial consultation free; video is from $300 for a one-off and from $800 a month for a package, with two rounds of revisions; events are quoted one at a time; everything else is quoted after a call. No other price or range anywhere.
- The deal path, where a page states next steps: a 30-minute call, then a proposal; a 50 percent deposit to start.
- The video proof is "the Wolfe Retreat video", never Wolfe Lodge.
- The positioning sentence on home, his words: "One team for everything: we align it and integrate it." (the price and quality claim was cut under the "remove fake stuff" ruling). The brand line stays as the `h1`.

## Known loose ends in `styles.css`

- `--slow` and `--ink-faint` are used but never defined.
- The old home hero and its figure (`.hero`, `.hero-title`, `.hero-grid`, `.hero-claim`, `.hero-actions`, `.bezel`, `.bezel-core`, `.figure-*`, `.stage`, `.pieces`, `.piece`, `.plot-*`, the `.wsplit` reveal) have no markup on any page since 2026-11-01. `.segments` still carries the about page's four doors.
- The header comment and a few section comments (the nav, the Student Pal embed) describe earlier versions.
- The unused theme blocks noted above, and `.tile` in the print rules, which no site page uses.

- **Home focus layout (November 2026).** The cards are split in two. `.home-cards-primary` leads: `.home-card-lead` (Reporting alignment, wide, 1.75rem name, `--mark` border), `.home-card-offer` (the diagnosis, on `--tint-sage`, with a `.btn-deep` Book the call), then Data and Strategy as ordinary cards numbered 02 and 03. `.home-cards-other` follows under the quiet label "Other services" (`.h-quiet`): `.home-card-compact` cards with no number and no line drawing. The start card is gone; the band carries Contact us and Book the call (`.home-hero-actions`).
