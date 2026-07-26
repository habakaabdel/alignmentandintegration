# Alignment Integration, design system record

The look in one sentence: a measured engineering sheet, cool paper with ink slate
type, spruce green marks, hairline tick rules and monospace coordinates in the
margin.

The identity is doing a job. The company turns operational reality into working
software, so the page is built like the drawing that sits between those two
states: measured, ruled, indexed, and plotted. Structure carries the identity,
not decoration. There are no shadows, no gradients, no rounded cards, and one
piece of data texture on the whole page.

---

## Colour

All ratios are measured against `--paper` (#edefee) unless noted. WCAG 2.2 AA
needs 4.5:1 for body text, 3:1 for large text and for the boundary of a control
that carries meaning.

| Token | Value | Use | Ratio on paper |
|---|---|---|---|
| `--paper` | `#edefee` | page ground | n/a |
| `--panel` | `#f6f7f7` | tiles, plot, form shell | n/a |
| `--panel-deep` | `#e3e7e7` | the engine tile only | n/a |
| `--ink` | `#101d26` | headings, body, focus ring | 14.8:1 |
| `--ink-muted` | `#4a5a66` | secondary prose, labels | 6.1:1 (6.7:1 on panel) |
| `--mark` | `#0b5a44` | links, indices, primary button ground, live tile bar | 7.1:1 (white on it: 8.2:1) |
| `--mark-deep` | `#08402f` | hover state for the above | 9.6:1 |
| `--second` | `#2f4e7a` | the raw trace in the plot, form error text | 7.3:1 |
| `--line` | `#c3ccd1` | decorative hairlines, section rules | 1.4:1, decorative only |
| `--line-strong` | `#75838c` | tile borders, input borders, tick rules | 3.4:1, clears the control boundary floor |

Rules a future editor keeps:

- Never put text on `--line` or `--line-strong`. They are boundary colours.
- Two accents, and that is the ceiling. `--mark` is the company's colour and
  `--second` exists so the plot can show two different kinds of line.
- No gold. The previous deck was near black with warm gold and this identity is
  not an evolution of it.
- Two looks are banned because they read as generated: cream ground with a high
  contrast serif and a terracotta accent, and near black with one acid accent.

## Type

Two families, both IBM Plex, loaded from Google Fonts with `display=swap`.

- `IBM Plex Sans` 400 / 500 / 600, all prose.
- `IBM Plex Mono` 400 / 500, section indices, eyebrows, field labels, tile
  markets, plot labels, footer meta.

Why: Plex was drawn for engineering and machine contexts, and the sans and mono
share skeletons, so using the mono strictly for measurement labels makes the page
read as a drawn sheet rather than a brochure without introducing a second voice.

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

Body line height 1.65, headings 1.2. Headings carry `-0.01em` tracking, the h1
carries `-0.022em`. Mono labels carry positive tracking, 0.06em to 0.14em.
Measure caps: 22ch on the h1, 54ch on the claim, 62 to 68ch on prose.

Sentence case everywhere, including headings and buttons. The only capitalised
words are proper nouns.

## Space, border, radius

4px base: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 24, `--s6` 32,
`--s7` 48, `--s8` 64, `--s9` 96. Page gutter `clamp(1.25rem, 4vw, 3rem)`,
container 1100px.

Radius is 2px on everything except the focus ring, which is square. Corners stay
near square because a drawn sheet has square corners. `--radius-pill` exists but
is unused; if a status chip ever needs it, that is the only permitted use.

Border language, in three weights:

1. `1px --line`, quiet division inside a section.
2. `1px --line-strong`, anything with a boundary that matters: tiles, inputs.
3. The tick rule between sections: a 1px `--line` line with a 5px row of
   `--line-strong` ticks repeating every 9px under it, at 0.75 opacity. This is
   the page's signature. Every section except the first carries one on its top
   edge.

The hatched band on a demo tile means in development. A solid 3px `--mark` bar
means the tile is live. State is never carried by colour alone; the tile's footer
label says which it is in words.

## Motion

Two durations, `--fast` 140ms and `--base` 240ms, one curve,
`cubic-bezier(0.2, 0, 0, 1)`. The vocabulary is three moves and nothing else:

1. 1px lift on buttons, 2px on live tiles, plus a border darken.
2. Nav underline fade for hover and the current section.
3. The hero plot draws its two traces once on load, 900ms, then the step nodes
   appear.

There is deliberately no fade up on scroll. The first build had one and it left
every section below the hero invisible whenever the intersection callback did not
run: full page rendering, print, and any context that does not scroll. Content
that is only visible after a scroll event is a defect, so the page renders whole,
always. Do not add it back.

Motion uses the `translate` property, not a compound shorthand. Under
`prefers-reduced-motion: reduce` every animation and transition collapses to
1ms, smooth scrolling is off, and the plot renders complete and static. All of
it is non-essential by construction: nothing is only legible after it moves.

## The monogram

Interim mark, an A and I with the ampersand rendered as a registration tick, so
the join between the two letters is a measurement, not a flourish. A full logo
comes later.

- Grid `0 0 32 32`. Stroke 2.6, `stroke-linecap: square`, no fills.
- A: `M5 25 L12 7 L19 25` with crossbar `M8.4 19 H15.6`, stroke `--ink`.
- Tick: `M21.4 16 H24.2`, stroke `--mark`.
- I: `M27 7 V25`, stroke `--mark`.
- Header at 30px, footer at 24px. Below 24px the crossbar closes up, so do not
  use it smaller.
- The favicon is the same geometry as an inline SVG data URI in `index.html`,
  with a `--paper` square behind it. Any change to the paths gets mirrored there.

## Content rules that outlive this build

These are claim limits, not style preferences. They win over voice, and voice
wins over design.

- The hero line is verbatim and cannot be edited:
  "I turn objective reality into ones and zeros and solve problems with software."
- The claim paragraph under it is verbatim. Same rule.
- Naming is locked: "Third Cortex harness", "student portal", "pocket portal".
  Never "the Harness", "Pocket", or "Pocket Student".
- No outcome numbers, no user counts, no "in use", no "trusted by". The deployed
  application is built and demonstrable. It is not running.
- No client or employer names anywhere. Sectors only.
- No pricing beyond the free initial consultation. No numbers, no ranges, no
  "affordable".
- No future phases promised, no vendor or agency commentary.
- Banned words anywhere in the deliverable, comments and metadata included: em
  dashes, "leverage", "seamless", "empower", "transform", "cutting-edge",
  "unlock", and hype adjectives. This is why the CSS uses `translate` rather
  than the property whose name is on that list.
- Canadian English. Short declarative sentences. First person singular is fine.
- Test every new sentence against "is this measurably true today". If a sentence
  needs a banned claim to work, the sentence is wrong, not the rule.

## Structure invariants

- Exactly one `h1`, the positioning line. Section headings are `h2`, items are
  `h3`. Nothing skips a level.
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

## Adding a demo

Open `main.js`, put the URL in `DEMO_URLS` against the tile's key, deploy. The
tile turns into a link, the band turns solid, and the footer label changes from
"in development" to "open demo". Alternatively set `data-demo-url` on the tile in
`index.html`, which takes priority over the map. A tile that has no URL renders
the in development state, which is the honest default and the reason a broken
tile cannot ship by accident.
