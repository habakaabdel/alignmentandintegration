# alignmentandintegration.com

Marketing and demo site for Alignment Integration, a consultation and software development company. Static multi-page site, no build step.

## Pages

One simple home page and one landing page per service, since November 2026 (Brief 109). Every service page ends at its own contact section.

| Path | What it is |
|---|---|
| `/` | Home. The brand line and the positioning sentence on a deep sage band, seven cards (Reporting alignment, Video, Events, Software builds, Data, Strategy, Parts of systems) and a start card, the proof strip (`#work`), and the contact form. Comp G, picked November 2026. |
| `/reporting/` | Reporting alignment, on any platform. Theme `organizations`. The process, the three offers (the $3,500 diagnosis is the only priced one), the two weeks, the engine, where we have built, contact. Was `/organizations/`, which now redirects here. |
| `/organizations/sample-diagnosis/` | The sample diagnosis, on fictional data. Reached from `/reporting/`. |
| `/video/` | Video. The Wolfe Retreat video (the short and the tour), the Brain to AI reel, the prices (from $300 one-off, from $800 a month), a marked slot for the case study, contact. Was `/videos/`, which now redirects here. |
| `/events/` | Events. The six things we do at an event, how it works, a proof slot, contact. Its sentences are `[NET-NEW n]` placeholders until the owner says them. |
| `/demos/` | Software builds. The five demonstrations, the barbershop quote, the bounds line, contact. |
| `/about/` | About, for a customer of any service: who we are, the four services, how we work, why trust the quality, contact. Ends at the same contact form as the service pages. |
| `/privacy/` | Privacy notice. Linked from the footer and the form. |
| `/community-social-services/` | Sector page for community and social services. Theme `community`. Live but unlinked from the nav and footer since November 2026, awaiting a ruling. |
| `/ai-readiness/` | AI readiness page. Theme `ai-readiness`. Live but unlinked from the nav and footer since November 2026, awaiting a ruling. |
| `/ai-readiness/start/` | Landing page for the AI readiness consultation. No nav, its own Netlify form. |
| `/brand/` | Logo system preview. Not linked from the site. |

## Demos

Each demo is a self-contained folder under `demos/` with its own markup, and most carry their own stylesheet and scripts. They do not share `main.js` or the site nav.

| Folder | Demo |
|---|---|
| `demos/bpss-ses/` | Diagnostic and intervention map |
| `demos/restaurant-ops/` | Restaurant operations board |
| `demos/community-hub-portal/` | Community hub portal |
| `demos/emr-portal/` | Staff portal over a clinical record |
| `demos/cswb-portal/` | Community safety and well-being portal (linked from the organizations and community pages, not listed on `/demos/`) |

## Navigation

Every site page (not the demos or the landing page) carries the same four items: Services, Work, About, Contact. Services opens the four service pages (a nested `details` on a phone, a hover panel from 56rem up). Work goes to the proof strip on the home page (`/#work`). Contact goes to the page's own contact section on home, the service pages and the about page, and to `/#contact` elsewhere. Below 56rem the links sit in a `details` disclosure labelled "menu"; no script is needed for it.

## Stack

Plain HTML, CSS, and vanilla JavaScript. No framework, no build.

- `styles.css`: one sitewide stylesheet, tokens and themes included.
- `main.js`: progressive enhancement for the home, audience, sector, AI readiness, and demos index pages (nav state, reveals, hero figure, walkthroughs, contact form, background canvas).
- `eco.js`: the home page background scene (Three.js, from `vendor/`).
- `scene.js` in `community-social-services/`, `ai-readiness/`, and `demos/`: that page's own background scene.
- `vendor/`: Three.js and the scroll-motion kit used by `/ai-readiness/start/`.
- `media/`: self-hosted fonts and the captured frames for the walkthroughs on the community page.
- Forms post to Netlify Forms: `contact` on the home page, the four service pages and the about page (a hidden `service` field names the page), `ai-readiness-consult` on the landing page.

Design tokens, themes, and editing rules are in `design.md`.

## Run locally

Serve the folder from the repo root, because pages use root-relative paths:

```
npx serve .
```

## Deploy

Netlify deploys `main` automatically on every push, publishing the repo root. Redirects and security headers are in `netlify.toml`. Custom domain: alignmentandintegration.com.
