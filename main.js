/* Alignment Integration
   Progressive enhancement only. The page is complete and usable with this file
   absent: anchors navigate natively, the form posts natively, every demo tile
   renders its in development state. */

/* ---------------------------------------------------------------------------
   DEMO URLS. This is the slot.

   A tile shows "in development" while its value here is an empty string. Put a
   URL in and that tile becomes a link on the next deploy. One line, no other
   edit needed. A data-demo-url attribute on the tile in index.html wins over
   this map, if you would rather keep the URL in the markup.
   --------------------------------------------------------------------------- */

const DEMO_URLS = {
  'small-business':       '',
  'enterprise':           '',
  'community-safety':     '',
  'student-portal':       '',
  'pocket-portal':        '',
  'third-cortex-harness': ''
};

const LIVE_LABEL = 'open demo';

const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- demo tiles ---------- */

function activateTiles() {
  document.querySelectorAll('.tile[data-demo]').forEach(function (tile) {
    const key = tile.dataset.demo;
    const url = (tile.dataset.demoUrl || DEMO_URLS[key] || '').trim();
    if (!url) return;

    const link = document.createElement('a');
    link.className = 'tile-link';
    link.href = url;

    while (tile.firstChild) link.appendChild(tile.firstChild);
    tile.appendChild(link);
    tile.classList.add('tile-live');

    const state = link.querySelector('[data-tile-state]');
    if (state) state.textContent = LIVE_LABEL;
  });
}

/* ---------- current section in the nav ---------- */

function trackSections() {
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const map = new Map();

  links.forEach(function (link) {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target) map.set(target, link);
  });

  if (!map.size || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (link) { link.removeAttribute('aria-current'); });
      const active = map.get(entry.target);
      if (active) active.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  map.forEach(function (_link, section) { observer.observe(section); });
}

/* ---------- the hero plot draws itself once ---------- */

function drawPlot() {
  const plot = document.querySelector('.plot svg');
  if (!plot || !motionOK) return;

  plot.querySelectorAll('.trace-raw, .trace-clean').forEach(function (path) {
    if (typeof path.getTotalLength !== 'function') return;
    const length = Math.ceil(path.getTotalLength());
    path.style.setProperty('--len', length);
  });

  plot.parentElement.classList.add('plot-ready');
}

/* ---------- contact form ---------- */

function wireForm() {
  const form = document.getElementById('contact-form');
  const confirmation = document.getElementById('contact-confirm');
  if (!form || !confirmation) return;

  const error = form.querySelector('[data-form-error]');
  const button = form.querySelector('[data-submit]');
  let sending = false;

  form.addEventListener('submit', function (event) {
    if (typeof window.fetch !== 'function' || !form.reportValidity()) return;

    event.preventDefault();
    if (sending) return;
    sending = true;

    if (error) error.hidden = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Starting';
    }

    const body = new URLSearchParams(new FormData(form)).toString();

    window.fetch(form.getAttribute('action') || window.location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (response) {
      if (!response.ok) throw new Error('rejected');
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus && confirmation.focus();
    }).catch(function () {
      sending = false;
      if (button) {
        button.disabled = false;
        button.textContent = 'Start the conversation';
      }
      if (error) error.hidden = false;
    });
  });
}

activateTiles();
trackSections();
drawPlot();
wireForm();
