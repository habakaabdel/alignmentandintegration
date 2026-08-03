# Alignment Integration, design system record

The look in one sentence: a serene organic sheet, warm linen ground with soft charcoal type and deep sage marks, that adapts its ground and accent to six audience pages through a `data-theme` token system while one grid, one type system, and one monogram hold it together. Structure carries the identity, not decoration. There are no shadows and no gradients.

---

## Colour & Themes

The site uses a context-adaptive theme system. The home page and demo pages use the serene default tokens. The six audience pages receive a tailored theme via a `data-theme` attribute on their `<body>` tag.

All ratios are measured against `--paper` unless noted. WCAG 2.2 AA needs 4.5:1 for body text, 3:1 for large text and for the boundary of a control that carries meaning.

The locked palette (measured, do not adjust):

| Theme key | --paper | --mark (accent) | Measured |
|---|---|---|---|
| `enterprise` | `#f2f4f5` | `#2f4e7a` slate blue | accent as text 7.6, white on accent 8.4 |
| `small-business` | `#ffffff` (panel `#fafaf9`) | `#0b5a44` emerald | 8.2 / 8.2 |
| `community` | `#f7f4ee` | `#2d4a3e` sage (site default) | 8.9 / 9.7 |
| `students` | `#f5f4f9` | `#5a3d9e` violet | 7.4 / 8.1 |
| `therapists` | `#f1f6f6` | `#1f5f5b` calm teal | 6.8 / 7.4 |
| `individuals` | `#f9f5f3` | `#7d3650` deep rose | 7.7 / 8.3 |

The default tokens, carried by the home page, the demo pages, and any page without a `data-theme`:

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f7f6f2` | page ground, warm linen |
| `--panel` | `#ffffff` | tiles, plot, form shell |
| `--panel-deep` | `#f0eee7` | the engine tile only |
| `--ink` | `#1c1d1c` | headings, body, focus ring |
| `--ink-muted` | `#5e605d` | secondary prose, labels |
| `--mark` | `#2d4a3e` | links, indices, primary button ground, live bars |
| `--mark-deep` | `#1d332a` | hover state for the above |
| `--second` | `#3a5a40` | form error text, figure strokes |
| `--line` | `#d8d6ce` | decorative hairlines, section rules |
| `--line-strong` | `#717d76` | tile borders, input borders, tick rules (3.95:1 boundary) |

Global on every theme: `--ink` and `--ink-muted` never move. A theme block reassigns tokens only, never component rules; the two documented exceptions are the bordered-card treatment below.

Rules a future editor keeps:
- Never put text on `--line` or `--line-strong`. They are boundary colours.
- No gold. The previous deck was near black with warm gold and this identity is not an evolution of it.
- Two looks are banned because they read as generated: cream ground with a high contrast serif and a terracotta accent, and near black with one acid accent.

## The bordered-card treatment

The `students` and `therapists` pages additionally carry a WhatsApp-web-style surface language:
- Cards/panels on these pages: `#ffffff` ground, `1px solid var(--ink)` border, `16px` radius.
- Primary buttons become pills (`border-radius: 999px`) with a `1px` border:
  - students: fill `#b9a7ec`, text `var(--ink)` (7.9:1), border `var(--ink)`.
  - therapists: fill `#1f5f5b`, text `#ffffff` (7.4:1), border same as fill.
- Quiet/secondary buttons on these two pages: transparent fill, `1px solid var(--ink)`, pill radius.
- The other four pages keep the site's existing button and card styling; only their tokens move.

## Type

Two families, loaded from Google Fonts with `display=swap`.

- `Plus Jakarta Sans` 400 / 500 / 600 / 700, all prose, with `IBM Plex Sans` as fallback.
- `IBM Plex Mono` 400 / 500, section indices, eyebrows, field labels, plot labels, footer meta.

Why: the sans is warm and open, which carries the serene ground, while the mono kept for measurement labels keeps the page reading as a drawn record rather than a brochure without introducing a second voice.

Scale, fluid where it needs to be:

| Token | Value | Use |
|---|---|---|
| `--t-micro` | 0.75rem | hints, tile market labels |
| `--t-label` | 0.8125rem | mono labels, nav, indices |
| `--t-small` | 0.9375rem | secondary prose, buttons |
| `--t-body` | 1.0625rem | body, form inputs |
| `--t-lead` | clamp 1.125 to 1.3125rem | the claim paragraph |
| `--t-h3` | clamp 1.125 to 1.3125rem | tile names, step and idea headings |
| `--t-h2` | clamp 1.5 to 2rem | section headings |
| `--t-h1` | clamp 1.9375 to 3.375rem | the positioning line, once |

Body line height 1.65, headings 1.2. Headings carry `-0.01em` tracking, the h1 carries `-0.022em`. Mono labels carry positive tracking, 0.06em to 0.14em.
Measure caps: 22ch on the h1, 54ch on the claim, 62 to 68ch on prose.

Sentence case everywhere, including headings and buttons. The only capitalised words are proper nouns.

## Space, border, radius

4px base: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 24, `--s6` 32, `--s7` 48, `--s8` 64, `--s9` 96. Page gutter `clamp(1.25rem, 4vw, 3rem)`, container 1100px.

Radius is 12px on buttons, inputs, and tiles (`--radius`), 16px on the bordered cards of the students and therapists pages, and 999px on their pill buttons. The focus ring stays square: 2px `--ink` at 2px offset.

Border language, in three weights:
1. `1px --line`, quiet division inside a section.
2. `1px --line-strong`, anything with a boundary that matters: tiles, inputs.
3. The tick rule between sections: a 1px `--line` line with a 5px row of `--line-strong` ticks repeating every 9px under it, at 0.75 opacity. This is the page's signature. Every section except the first carries one on its top edge.

## Motion

Two durations, `--fast` 140ms and `--base` 240ms, one curve, `cubic-bezier(0.2, 0, 0, 1)`. The vocabulary is three moves and nothing else:

1. 1px lift on buttons, 2px on live tiles, plus a border darken.
2. Nav underline fade for hover and the current section.
3. The hero plot draws its two traces once on load, 900ms, then the step nodes appear.

There is deliberately no fade up on scroll. The first build had one and it left every section below the hero invisible whenever the intersection callback did not run: full page rendering, print, and any context that does not scroll. Content that is only visible after a scroll event is a defect, so the page renders whole, always. Do not add it back.

Motion uses the `translate` property, not a compound shorthand. Under `prefers-reduced-motion: reduce` every animation and transition collapses to 1ms, smooth scrolling is off, and the plot renders complete and static. All of it is non-essential by construction: nothing is only legible after it moves.

## The monogram

Interim mark, an A and I with the ampersand rendered as a registration tick, so the join between the two letters is a measurement, not a flourish. One logo everywhere across all themes.

- Grid `0 0 32 32`. Stroke 2.6, `stroke-linecap: square`, no fills.
- A: `M5 25 L12 7 L19 25` with crossbar `M8.4 19 H15.6`, stroke `--ink`.
- Tick: `M21.4 16 H24.2`, stroke `--mark`.
- I: `M27 7 V25`, stroke `--mark`.
- Header at 30px, footer at 24px. Below 24px the crossbar closes up, so do not use it smaller.
- The favicon is the same geometry as an inline SVG data URI in `index.html`, with a `--paper` square behind it. Any change to the paths gets mirrored there.

## Content rules that outlive this build

These are claim limits, not style preferences. They win over voice, and voice
wins over design.

- The hero line is verbatim and cannot be edited (amended by Abdel 2026-07-31, plain
  language, replacing the 2026-07-26 we-voice line):
  "We build software shaped like the way your operation already works."
  The retired phrasing survives only as the two axis labels on the hero plot,
  "objective reality" and "ones and zeros". It is a drawing there, not a claim.
- The claim paragraph under it is verbatim. Same rule. Current canonical text:
  "Software built specifically for you used to be out of reach. That is the only reason
  organizations settle for tools that were never built for them. Not anymore."
- Site voice is first person plural (we/us) everywhere, per the same amendment. No
  "millions" phrasing anywhere; the cost claim stays qualitative until a measured
  number exists.
- Naming is locked: "the engine", "student portal", "pocket portal". Never "the
  Harness", "Pocket", or "Pocket Student". The engine's former product name was
  retired on 26 July 2026 and must not appear anywhere on this site in any form,
  including comments and metadata. Refer to it in plain words: the engine.
- The systems map has no brand name yet. Call it "the systems map" and nothing
  else until one is decided.
- No outcome numbers, no user counts, no "in use", no "trusted by". The deployed
  application is built and demonstrable. It is not running.
- No client or employer names anywhere. Sectors only.
- No pricing beyond the free initial consultation. No numbers, no ranges, no
  "affordable". The service menu is deliberately unpriced and its three offers
  are deliberately unordered: nothing in the copy may imply that one costs more
  than another, or that they are tiers.
- No future phases promised, no vendor or agency commentary.
- Banned words anywhere in the deliverable, comments and metadata included: em
  dashes, "leverage", "seamless", "empower", "transform", "cutting-edge",
  "unlock", and hype adjectives. This is why the CSS uses `translate` rather
  than the property whose name is on that list.
- Canadian English. Short declarative sentences. First person singular is fine.
- Test every new sentence against "is this measurably true today". If a sentence
  needs a banned claim to work, the sentence is wrong, not the rule.

## The canonical content of section 01

Section 01 carries four blocks in this order, and the order is load bearing:
the h1 and the claim, the process, the two axes, then the menu.

1. **The process, four beats.** Research and consultation, development and
   planning, building, keeping it working. One heading and one short paragraph
   each. The wording of the four beats is settled; do not re-cut them into three
   or five.
2. **The two axes.** Who you are, a small business or an enterprise. What you
   buy, one of the three offers. They are decided separately and the copy says
   so outright: a small business might buy only the map, an enterprise might buy
   everything. Never present the axes as a single ladder.
3. **The menu, three offers.** Diagnosis and intervention. The systems map. The
   full build. Same measured language as the rest of the sheet. The menu lives
   inside section 01 as its own labelled block. It never becomes a sixth nav
   section, because five sections indexed 01 to 05 is a structure invariant.

## Structure invariants

- Exactly one `h1` per page: the positioning line on the main page, the artifact
  name on the demonstration page. Section headings are `h2`, items are `h3`.
  Nothing skips a level. The demonstration page's `h1` uses `--t-h2`, because
  `--t-h1` belongs to the positioning line alone.
- Five sections in order, indexed 01 to 05 in the margin: what we do, demos, how
  it works, what is built, contact.
- Section 3 states exactly three ideas. Not two, not four.
- Every interactive element has a visible focus ring, 2px `--ink` at 2px offset.
- No JavaScript is required. Anchors and the form work natively. `main.js` adds
  the nav current state, the reveal, the plot draw, the in place form
  confirmation, and it turns a demo tile into a link when a URL exists.
- The form contract with Netlify: `name="contact"`, `data-netlify="true"`, a
  hidden `form-name` input matching the name, and `netlify-honeypot`
  pointing at the offscreen `referral-source` field. The submit button and the
  confirmation share a verb: start, then started.
- Responsive from 360px with no horizontal overflow. No fixed viewport heights,
  no content trapped behind a hidden overflow.
- No analytics, no cookies, no third party requests other than the two Google
  Fonts stylesheets.

## Responsive verification, locked 2026-07-27

This site is one responsive codebase. There is no separate mobile build. Every
change, however small, accounts for both the phone and the desktop rendering of
the page it touches, and is verified at both before it deploys:

- Minimum check: 375px and 1280px, full-page, zero horizontal overflow
  (`scrollWidth` equals `innerWidth`). Add 768px whenever a change lands near a
  breakpoint.
- Both screenshots accompany any change presented for approval.
- Tap targets keep a hit area of at least 44px in their smallest dimension.
- A change verified at only one viewport is an unfinished change.

### The masthead nav on a phone

Below 68rem the seven links live in a `details` disclosure labelled "menu", so
the sticky masthead stays one row and 69px tall instead of wrapping to two. The
panel is absolutely positioned under the masthead, so opening it moves nothing
on the page. From 68rem up the panel is held open with
`::details-content { content-visibility: visible }`, the toggle is hidden, and
the row is the same one it has always been: same widths, same positions, same
56px masthead.

Rules a future editor keeps:

- No script is involved. `details` opens on its own. `main.js` only closes the
  panel after a link is used, which is a convenience and not a requirement.
- The toggle's mark is a plus drawn in two hairlines that loses its upright when
  the panel opens. It does not rotate or slide. There is no drawer, no overlay
  dim, and no shadow.
- Inside the panel the current section is a solid 2px `--mark` rule down the
  left edge of the row, which is the same marker a built status row uses. The
  underline belongs to the desktop row.
- The breakpoint is 68rem because that is where all seven links plus the brand
  fit on one line, measured at 1088px with a 56px single-row masthead. It moved
  from 48rem at five anchors, 62rem at six destinations, 68rem at seven. Do not
  lower it without measuring.
- Anything that resets a `.nav a` property at 48rem has to leave the CTA's own
  padding and border alone, which is why that rule is written `.nav a.nav-cta`.

### Tap targets

44px is a hit area, not a visual box. Where the type is small and has to stay
that way, the hit area grows with a transparent absolutely positioned `::after`
on the link: status row names, and the back to top link in the footer. Nothing
about the drawn sheet changes. Padding based growth is confined to the phone,
because a desktop pointer does not need it and the row heights are load bearing.

### The hero plot labels

`.plot-label` and `.plot-caption` are SVG user units on a 480 wide viewBox that
scales with its column, so their rendered size moves with the viewport. They are
sized with a clamp that holds the rendered size near 12px on a phone and returns
to the sheet's 11 units at 640px and above. Set a fixed size there again and the
labels fall to about 7px on a phone.

## The figures, added 1 August 2026

The page became one numbered sheet of figures. Rules a future editor keeps:

- **fig. 01 in three dimensions.** `initPlot3D()` in `main.js` draws the hero
  plot on a canvas by hand, no library: the raw trace scatters in z, the
  staircase sits flat on the plane, the camera answers the pointer by a few
  degrees with a slow drift at rest. The flat SVG stays in the markup and is
  the rendering for reduced motion, print, no JavaScript, and any failure in
  the canvas path; `drawPlot()` remains as that fallback's entrance. The
  rendering loop only runs while the figure is on screen and the document is
  visible. Labels are HTML in `.plot-overlay`, not canvas text, so they stay
  crisp and readable at every size.
- **fig. 02, the engine schematic**, lives in section 03: capture, the
  overnight funnel that holds noise back, the confirmation tick, the filed
  record. Two cuts of the same drawing, `.engine-svg-h` wide and
  `.engine-svg-v` stacked, switched at 46rem; the stacked cut exists because
  SVG user-unit labels fall below readable size on a phone. The markup is the
  complete resting drawing; `.engine-live` (added by `wireEngine()` on view,
  motion permitting) replays it once. Raw records are `--second`, kept records
  are `--mark`, noise is `--line-strong` at reduced opacity.
- **figs 03 to 09, the segment figures.** Every tile in section 02 opens with
  a small drawing of its product's key screen, on the shared `minigrid`
  pattern (defined once in the first tile's SVG). Numbering continues from the
  hero because the page is one sheet. Static resting state; each figure
  performs one hover move, defined with the rest of the motion. Main-sheet
  palette only: the two accents, ink, and the line colours. The category ramp
  does not migrate here.
- **Page figures on the audience pages** (`.page-fig`, currently enterprise
  and individuals): one drawn figure that proves the page's own headline, in
  the same two-cut pattern (`.pf-h` / `.pf-v` at 46rem). Static by design;
  each audience page restarts its own figure numbering at fig. 01 because each
  page is its own sheet. A page that gains a real product walkthrough should
  prefer captured frames over a drawing, per the walk figures.
- New figures reuse the drawing vocabulary that exists: `engine-base`,
  `engine-tick`, `engine-drop`, `engine-label`, `engine-caption`, the square
  record mark, hairline flows at reduced opacity. Do not invent a second
  vocabulary.

## Adding a demo

Open `main.js`, put the URL in `DEMO_URLS` against the tile's key, deploy. The
tile turns into a link, the band turns solid, and the footer label changes from
"in development" to "open demo". Alternatively set `data-demo-url` on the tile in
`index.html`, which takes priority over the map. A tile that has no URL renders
the in development state, which is the honest default and the reason a broken
tile cannot ship by accident.

Two tiles are live: `small-business` points at an external demo, and
`community-safety` points at `demos/bpss-ses/`, which is served from this repo.
When a demo lands, add its row to the section 04 status grid too, and link it.

## The demonstration page, `demos/bpss-ses/`

A working diagnostic and intervention map: two tabs, clickable segments, a live
detail panel, and a small simulation. It was built elsewhere in a different
visual language and was reskinned, not rebuilt. The interaction logic is
untouched and should stay that way.

What the reskin did, and what a future editor keeps doing:

- Its custom properties were repointed to this sheet's tokens. `--bg` became
  `--paper`, `--muted` became `--ink-muted`, `--accent` became `--ink`, and
  `--gold` was removed outright because no gold appears on this site. The gold
  jobs were reassigned: annotation rings and the point-of-action marker to
  `--ink`, the primary button to `--mark`, meter fills to `--mark`, secondary
  bars to `--ink-muted`.
- Radius 18px to 2px, pills to 2px, IBM Plex in place of the system stack,
  weights 700 and 800 down to 500 and 600, no gradients, no shadows, no
  uppercase, sentence case throughout.
- The dark theme and its toggle were removed. This site has one ground and it is
  paper. `prefers-color-scheme` is not honoured anywhere here by design.
- **The category ramp.** A data visual needs hue separation, so four categories
  each carry a dark hue for type and boundaries and a light tint for area fill.
  Areas are filled with the tint and outlined with the hue at 1px, which keeps
  the wheel light like the rest of the sheet instead of turning it into a dark
  mass. The ramp exists only on this page and never migrates to the main sheet.

  | Category | Hue | Tint | Hue on panel |
  |---|---|---|---|
  | biological | `#0b5a44` (`--mark`) | `#cfe0d9` | 7.6:1 |
  | psychological | `#2f4e7a` (`--second`) | `#d3dbe8` | 7.9:1 |
  | social | `#7d4a10` | `#e7dcc6` | 6.8:1 |
  | spiritual | `#6b3566` | `#e0d3de` | 8.4:1 |

  Edge polarity reuses two of these: reinforcing `#9c3b2c`, balancing `--mark`.
  Balancing edges are also dashed, so polarity never rests on hue alone.
- The page carries the slim bar and nothing else: the monogram, the company
  name, a link back to the main page, and the word "Demonstration". No nav, no
  footer chrome beyond the source note.

## The prototype page, `demos/therapist-workload/`

A working prototype of the therapist workload board, added 29 July 2026 with
the `/therapists/` audience page. Built directly in this sheet's language, not
reskinned: same tokens, same motion vocabulary, the category ramp for the four
map domains (the documented demo-page exception). Rules a future editor keeps:

- The product has no brand name on the site. The audience page, the nav, and
  the status grid say "Therapist workload" and "the board", descriptive words
  only, until a name is decided. Same discipline as the systems map.
- Every client in the sample data is a coded card: nickname, avatar, optional
  number. No real names, no session notes, no recordings anywhere in the data,
  markup, or comments. The dictation flow exists to demonstrate the contract
  that the transcript is read once for action items and discarded.
- Each card's map is fenced to the reason for counselling. At least one sample
  card keeps an empty domain with the honest-empty line, because the fence is
  the point.
- One red row at most. Red means the reader must act, and the sample day is
  built so exactly one thing qualifies.
- `?frame=app` renders the app alone, full viewport; the walk frames on
  `/therapists/` are captured from it at 430x900 and device scale 2, into
  `media/walk/therapist-workload/`. Recapture after any visual change to the
  prototype: the five states are `?frame=app`, `&open=boat-11`, `&view=recap`,
  `&view=recap-done`, and `&view=client&client=boat`.
- The page predates the content rules, so it was swept for them. Em dashes are
  gone. "Leverage point" became "point of action", because the banned word list
  has no technical exemption. Named programs and agencies were removed and
  replaced with sector language, per the no client or employer names rule.
