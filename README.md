# alignmentandintegration.com

Marketing and demo site for Alignment Integration, a consultation and software development company. Static multi-page site, no build step.

## Pages

| Path | What it is |
|---|---|
| `/` | Home. Hero, claim, "Two ways in" (links to the two audience pages), the integrated response, what is built, and the contact form. |
| `/individuals/` | For individuals. Theme `individuals`. |
| `/organizations/` | For organizations. Theme `organizations`. Carries the process, the three offers, the engine, and where we have built. |
| `/community-social-services/` | Sector page for community and social services. Theme `community`. Not in the nav; linked from home, organizations, demos, and AI readiness. |
| `/ai-readiness/` | AI readiness page. Theme `ai-readiness`. Linked from the home footer. |
| `/ai-readiness/start/` | Landing page for the AI readiness free consultation. No nav, its own Netlify form. |
| `/privacy/` | Privacy notice. No other page links to it at present. |
| `/demos/` | Index of the demonstrations. |
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

Every site page (not the demos or the landing page) carries the same four links: For individuals, For organizations, Demos, Contact. Contact goes to the form on the home page (`/#contact`). Below 56rem the links sit in a `details` disclosure labelled "menu"; no script is needed for it.

## Stack

Plain HTML, CSS, and vanilla JavaScript. No framework, no build.

- `styles.css`: one sitewide stylesheet, tokens and themes included.
- `main.js`: progressive enhancement for the home, audience, sector, AI readiness, and demos index pages (nav state, reveals, hero figure, walkthroughs, contact form, background canvas).
- `eco.js`: the home page background scene (Three.js, from `vendor/`).
- `scene.js` in `community-social-services/`, `ai-readiness/`, and `demos/`: that page's own background scene.
- `vendor/`: Three.js and the scroll-motion kit used by `/ai-readiness/start/`.
- `media/`: self-hosted fonts and the captured frames for the walkthroughs on the community page.
- Forms post to Netlify Forms: `contact` on the home page, `ai-readiness-consult` on the landing page.

Design tokens, themes, and editing rules are in `design.md`.

## Run locally

Serve the folder from the repo root, because pages use root-relative paths:

```
npx serve .
```

## Deploy

Netlify deploys `main` automatically on every push, publishing the repo root. Redirects and security headers are in `netlify.toml`. Custom domain: alignmentandintegration.com.
