# alignmentandintegration.com

Marketing and demo site for Alignment Integration, a consultation and software development company. Static multi-page site, no build step.

## Pages

Since 27 November 2026 the home page is two doors: organizations and agencies, and small businesses. One landing page per service sits under the doors (Brief 109). Every service page ends at its own contact section. The structure and its rules are in `design.md` under "Structure, ruled 11 November 2026".

| Path | What it is |
|---|---|
| `/` | Home. Two doors on the first screen (organizations on deep sage, small businesses on clay), the three small business packages (`#small-business`), a customer's words and who does the work, The Alignment Brief sign-up, and the contact form. Comp D, picked 27 November 2026. |
| `/reporting/` | Reporting alignment, on any platform. Theme `organizations`. What it looks like (four scenarios and the platform partner panel), the process, the three offers (the $3,500 diagnosis is the only priced one), the two weeks, the engine, Data (`#data`) and Strategy (`#strategy`), where we have built, the bounds line, contact. Was `/organizations/`, which now redirects here. |
| `/reporting/readiness-check/` | The reporting readiness check. Twelve questions in four groups, scored in the browser out of 24 into three levels, with the three lowest-scoring questions shown as gaps. Reached from `/reporting/`. The mental health and addictions question set is the first; another set is another page of markup. |
| `/organizations/sample-diagnosis/` | The sample diagnosis, on fictional data. Reached from `/reporting/`. |
| `/video/` | Closed 27 November 2026; 301 to the home page in `netlify.toml`. |
| `/events/` | Events. The six things we do at an event, what it looks like (four scenarios), how it works, a proof slot (still a placeholder), contact. |
| `/demos/` | Software builds. The five demonstrations, the barbershop quote, the bounds line, what we build (five scenarios), how a build runs, Parts of systems (`#parts-of-systems`), contact. |
| `/about/` | About, for a visitor from any door: who we are, the four doors, how we work, Work with us as a partner (`#partners`, linked from every footer), why trust the quality, contact. Ends at the same contact form as the service pages. |
| `/privacy/` | Privacy notice. Linked from the footer and the form. |
| `/community-social-services/`, `/ai-readiness/`, `/ai-readiness/start/` | Retired 2 November 2026 on Abdel's word; 301 to `/reporting/` and the home page in `netlify.toml`. |
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

Every site page (not the demos) carries the same four items: Organizations (`/reporting/`), Small business (`/#small-business`), About, Contact. Contact goes to the page's own contact section where it has one, and to `/#contact` elsewhere. Below 56rem the links sit in a `details` disclosure labelled "menu"; no script is needed for it.

## Stack

Plain HTML, CSS, and vanilla JavaScript. No framework, no build.

- `styles.css`: one sitewide stylesheet, tokens and themes included.
- `main.js`: progressive enhancement for the home, audience, sector, AI readiness, and demos index pages (nav state, hero figure, walkthroughs, contact form).
- `vendor/`: the scroll-motion kit used by `/ai-readiness/start/`.
- `media/`: self-hosted fonts and the captured frames for the walkthroughs on the community page.
- Forms post to Netlify Forms: `contact` on the home page, the four service pages and the about page (a hidden `service` field names the page), `readiness-check` on the readiness check (the twelve answers, the score, the level, the gaps, an email and an unticked newsletter box), `ai-readiness-consult` on the landing page.

Design tokens, themes, and editing rules are in `design.md`.

## Run locally

Serve the folder from the repo root, because pages use root-relative paths:

```
npx serve .
```

## Deploy

Netlify deploys `main` automatically on every push, publishing the repo root. Redirects and security headers are in `netlify.toml`. Custom domain: alignmentandintegration.com.
