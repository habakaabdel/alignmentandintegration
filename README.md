# alignmentandintegration.com

Marketing and demo site for Alignment Integration, a software development and consultation company. Single static page, five sections, no build step.

## Stack

Plain HTML, CSS, and vanilla JavaScript. No framework, no dependencies, no build. The contact form posts to Netlify Forms.

## Run locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Deploy

Hosted on Netlify, publishing the repo root on push to `main`. Custom domain: alignmentandintegration.com.

## Demo tiles

Each demo tile reads its URL from the slot map at the top of `main.js`. A tile with an empty slot renders as "in development". Dropping a live demo URL into the map is the one-line change that activates the tile.
