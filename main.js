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
  'small-business':   '/demos/restaurant-ops/',
  'enterprise':       '',
  'community-safety': '/demos/bpss-ses/',
  'student-portal':   'https://pocket-student.netlify.app',
  'pocket-portal':    '',
  'engine':           ''
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

/* ---------- the sections panel closes behind you on a phone ----------
   The disclosure works without this. It just stops the open panel sitting over
   the section you asked for. On a desktop the panel is held open by CSS and
   never carries the open attribute, so this is a no-op there. */

function wireNav() {
  const disclosure = document.querySelector('.nav-disclosure');
  if (!disclosure) return;

  disclosure.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () { disclosure.open = false; });
  });
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

/* ---------- demo walkthroughs ----------
   Cross-fades captured frames of a real running demo and swaps the caption with
   them. Every frame is already in the markup with its caption on data-cap, so
   with this file absent the visitor still sees the first frame and can read the
   whole sequence in the .walk-list. The timer only runs while the figure is on
   screen, and it never starts at all when the visitor asked for reduced motion. */

function wireWalkthroughs() {
  document.querySelectorAll('[data-walk]').forEach(function (walk) {
    const frames = Array.from(walk.querySelectorAll('.walk-stage img'));
    if (frames.length < 2) return;

    const caption = walk.querySelector('[data-walk-cap]');
    const dots = Array.from(walk.querySelectorAll('.walk-dots li'));
    const button = walk.querySelector('[data-walk-toggle]');

    let index = 0;
    let timer = null;
    let onScreen = false;
    let playing = motionOK;

    function show(next) {
      frames[index].classList.remove('is-on');
      if (dots[index]) dots[index].classList.remove('is-on');
      index = next;
      frames[index].classList.add('is-on');
      if (dots[index]) dots[index].classList.add('is-on');
      if (caption) caption.textContent = frames[index].dataset.cap || '';
    }

    function run() {
      if (timer || !playing || !onScreen) return;
      timer = window.setInterval(function () {
        show((index + 1) % frames.length);
      }, 2600);
    }

    function halt() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    if (button) {
      button.hidden = !motionOK;
      button.addEventListener('click', function () {
        playing = !playing;
        button.textContent = playing ? 'pause' : 'play';
        button.setAttribute('aria-pressed', playing ? 'false' : 'true');
        if (playing) run(); else halt();
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) run(); else halt();
      }, { threshold: 0.25 }).observe(walk);
    } else {
      onScreen = true;
      run();
    }
  });
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
wireNav();
drawPlot();
wireWalkthroughs();
wireForm();
