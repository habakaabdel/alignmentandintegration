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
  'pocket-portal':    '/demos/personal-pal/',
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

/* ---------- fig. 01 in three dimensions ----------
   The same drawing as the SVG, given depth: the raw trace scatters in z, the
   ordered staircase sits flat on the plane, and the camera answers the pointer
   by a few degrees. Everything is drawn by hand on a canvas, no library. The
   flat SVG stays in the markup and remains the rendering for reduced motion,
   print, no JavaScript, and any failure in here. */

function initPlot3D() {
  const figure = document.querySelector('.plot');
  if (!figure || !motionOK) return false;
  const svg = figure.querySelector('svg');
  if (!svg) return false;

  const canvas = document.createElement('canvas');
  canvas.className = 'plot-3d';
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  /* the flat plot's own coordinates, lifted into x (width), y (height), z (depth) */
  function lift(px, py, z) { return [px - 240, (300 - py) * 0.68, z]; }

  const RAW2D = [[20, 236], [44, 198], [62, 248], [86, 180], [104, 226], [128, 166], [150, 240], [172, 190], [196, 214], [220, 172]];
  const RAWZ = [-46, 30, -18, 44, -32, 22, -50, 12, -26, 38];
  const raw = RAW2D.map(function (p, i) { return lift(p[0], p[1], RAWZ[i]); });

  const CLEAN2D = [[240, 214], [274, 214], [274, 186], [308, 186], [308, 162], [342, 162], [342, 126], [376, 126], [376, 104], [410, 104], [410, 74], [452, 74]];
  const clean = CLEAN2D.map(function (p) { return lift(p[0], p[1], 0); });

  const nodes = [[274, 186], [308, 162], [342, 126], [376, 104], [410, 74], [452, 74]].map(function (p) { return lift(p[0], p[1], 0); });

  const gridLines = [];
  for (let gx = -240; gx <= 240; gx += 40) gridLines.push([[gx, 0, -70], [gx, 0, 70]]);
  for (let gz = -70; gz <= 70; gz += 35) gridLines.push([[-240, 0, gz], [240, 0, gz]]);

  const split = [[0, 0, -70], [0, 118, -70], [0, 118, 70], [0, 0, 70]];

  const COLOR = {
    line: '#c3ccd1', lineStrong: '#75838c',
    /* these mirror --trace-raw and --mark in styles.css so the canvas and the
       flat SVG fallback draw the same figure. The raw trace is a different hue,
       not a different shade: "objective reality" and "ones and zeros" are the
       two halves of the figure and have to read apart at a glance. */
    raw: '#2f4e7a', clean: '#2d4a3e', node: '#2d4a3e'
  };

  let az = 0, el = 0, azT = 0, elT = 0;
  let start = null, entered = false, visible = true, rafId = 0;
  let dpr = 1, w = 0, h = 0, unit = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.width * (300 / 480);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    unit = (w * dpr) / 480;
  }

  const BASE_AZ = 0.38, BASE_EL = 0.33, FOCAL = 780;

  function project(p, wobble) {
    const a = BASE_AZ + az + wobble, e = BASE_EL + el;
    const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
    const x1 = p[0] * ca + p[2] * sa;
    const z1 = p[2] * ca - p[0] * sa;
    const y1 = p[1] * ce - z1 * se;
    const z2 = z1 * ce + p[1] * se;
    const s = FOCAL / (FOCAL + z2);
    return [240 * unit + x1 * s * unit * 1.08, 226 * unit - y1 * s * unit * 1.08];
  }

  function stroke(pts, color, width, alpha, dash, wobble, frac) {
    const proj = pts.map(function (p) { return project(p, wobble); });
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width * unit;
    ctx.globalAlpha = alpha;
    ctx.setLineDash(dash ? dash.map(function (d) { return d * unit; }) : []);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (frac === undefined || frac >= 1) {
      proj.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
    } else {
      let total = 0;
      const lens = [];
      for (let i = 1; i < proj.length; i++) {
        const d = Math.hypot(proj[i][0] - proj[i - 1][0], proj[i][1] - proj[i - 1][1]);
        lens.push(d); total += d;
      }
      let budget = total * Math.max(0, frac);
      ctx.moveTo(proj[0][0], proj[0][1]);
      for (let i = 1; i < proj.length && budget > 0; i++) {
        const d = lens[i - 1];
        if (d <= budget) { ctx.lineTo(proj[i][0], proj[i][1]); budget -= d; }
        else {
          const t = budget / d;
          ctx.lineTo(proj[i - 1][0] + (proj[i][0] - proj[i - 1][0]) * t,
                     proj[i - 1][1] + (proj[i][1] - proj[i - 1][1]) * t);
          budget = 0;
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  function frame(ts) {
    rafId = 0;
    if (start === null) start = ts;
    const p = ease(clamp01((ts - start) / 1300));
    if (p >= 1) entered = true;

    az += (azT - az) * 0.06;
    el += (elT - el) * 0.06;
    const wobble = entered ? Math.sin(ts / 2400) * 0.012 : 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridA = clamp01(p / 0.35);
    gridLines.forEach(function (l) { stroke(l, COLOR.line, 1, 0.7 * gridA, null, wobble); });
    stroke(split, COLOR.lineStrong, 1, 0.9 * gridA, [3, 5], wobble);

    /* floor shadows first, so the traces read as standing above the plane */
    const rawFrac = clamp01((p - 0.12) / 0.5);
    const cleanFrac = clamp01((p - 0.48) / 0.5);
    stroke(raw.map(function (q) { return [q[0], 0, q[2]]; }), COLOR.lineStrong, 1, 0.28 * rawFrac, null, wobble, rawFrac);
    stroke(clean.map(function (q) { return [q[0], 0, q[2]]; }), COLOR.lineStrong, 1, 0.28 * cleanFrac, null, wobble, cleanFrac);

    /* risers tie the raw trace to the plane it refuses to sit on */
    raw.forEach(function (q, i) {
      const a = 0.16 * clamp01(rawFrac * raw.length - i);
      if (a > 0) stroke([[q[0], 0, q[2]], q], COLOR.raw, 1, a, [2, 4], wobble);
    });

    stroke(raw, COLOR.raw, 1.6, 0.85, null, wobble, rawFrac);
    stroke(clean, COLOR.clean, 2.4, 1, null, wobble, cleanFrac);

    nodes.forEach(function (q, i) {
      const a = clamp01((p - 0.82 - i * 0.028) / 0.1);
      if (a <= 0) return;
      const s = project(q, wobble);
      ctx.globalAlpha = a;
      ctx.fillStyle = COLOR.node;
      const r = 2.8 * unit;
      ctx.fillRect(s[0] - r, s[1] - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
    });

    if (visible && !document.hidden) rafId = window.requestAnimationFrame(frame);
  }

  function run() { if (!rafId) rafId = window.requestAnimationFrame(frame); }
  function halt() { if (rafId) { window.cancelAnimationFrame(rafId); rafId = 0; } }

  const overlay = document.createElement('div');
  overlay.className = 'plot-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<span class="plot-ov plot-ov-left">objective reality</span>' +
    '<span class="plot-ov plot-ov-right">ones and zeros</span>' +
    '<span class="plot-ov plot-ov-fig">fig. 01</span>';

  figure.appendChild(canvas);
  figure.appendChild(overlay);
  figure.classList.add('plot--dim');
  resize();

  figure.addEventListener('pointermove', function (event) {
    const rect = figure.getBoundingClientRect();
    azT = ((event.clientX - rect.left) / rect.width - 0.5) * 0.17;
    elT = ((event.clientY - rect.top) / rect.height - 0.5) * 0.11;
  });
  figure.addEventListener('pointerleave', function () { azT = 0; elT = 0; });

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) halt(); else if (visible) run();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) run(); else halt();
    }, { threshold: 0.1 }).observe(figure);
  }

  run();
  return true;
}

/* ---------- fig. 02 runs once each time it is looked at ----------
   The schematic in section 03 is complete in the markup. This only replays its
   drawing when it comes into view, and only when motion is welcome. */

function wireEngine() {
  const engine = document.querySelector('.engine');
  if (!engine || !motionOK || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(function (entries) {
    const entry = entries[0];
    if (entry.isIntersecting) engine.classList.add('engine-live');
    else if (entry.intersectionRatio === 0) engine.classList.remove('engine-live');
  }, { threshold: [0, 0.4] }).observe(engine);
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

/* ---------- shared reveals ----------
   Elements tagged data-reveal rise into place the first time they are seen.
   The hidden state in styles.css is scoped under html.reveal-ready, which is
   only set here once motion is welcome and IntersectionObserver exists, so
   nothing is ever hidden without a way to reveal it. */

function wireReveals() {
  const tagged = document.querySelectorAll('[data-reveal]');
  if (!tagged.length || !motionOK || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  tagged.forEach(function (el) {
    const rect = el.getBoundingClientRect();
    /* anything already in view, or above it after a deep link or restored
       scroll, arrives settled, not late; only what is still below waits */
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('reveal-in');
    } else {
      observer.observe(el);
    }
  });
}

/* ---------- contact form ---------- */

function wireForm() {
  document.querySelectorAll('form[data-netlify][data-confirm]').forEach(function (form) {
    const confirmation = document.querySelector(form.getAttribute('data-confirm'));
    if (!confirmation) return;

    const error = form.querySelector('[data-form-error]');
    const button = form.querySelector('[data-submit]');
    const idle = button ? button.innerHTML : '';
    const busy = form.getAttribute('data-sending') || 'Sending';
    let sending = false;

    form.addEventListener('submit', function (event) {
      if (typeof window.fetch !== 'function' || !form.reportValidity()) return;

      event.preventDefault();
      if (sending) return;
      sending = true;

      if (error) error.hidden = true;
      if (button) {
        button.disabled = true;
        button.textContent = busy;
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
          button.innerHTML = idle;
        }
        if (error) error.hidden = false;
      });
    });
  });
}

activateTiles();
trackSections();
wireNav();
wireReveals();

let dimensional = false;
try { dimensional = initPlot3D(); } catch (err) { dimensional = false; }
if (!dimensional) drawPlot();

wireEngine();
wireWalkthroughs();
wireForm();

/* ---------- nature organic fluid wave canvas ---------- */
function initNatureCanvas() {
  if (!motionOK) return;

  let canvas = document.getElementById('nature-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'nature-canvas';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  let animId = null;

  window.addEventListener('resize', function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let step = 0;

  function drawOrganicWaves() {
    if (!motionOK) {
      if (animId) cancelAnimationFrame(animId);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    step += 0.005;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(226, 232, 228, 0.4)';
    ctx.moveTo(0, height * 0.45);
    for (let x = 0; x <= width + 12; x += 12) {
      const y = Math.sin(x * 0.002 + step) * 35 + Math.cos(x * 0.001 + step * 0.5) * 25 + height * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(212, 163, 115, 0.05)';
    ctx.moveTo(0, height * 0.55);
    for (let x = 0; x <= width + 12; x += 12) {
      const y = Math.cos(x * 0.003 - step * 0.8) * 45 + Math.sin(x * 0.0015 + step) * 20 + height * 0.48;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    animId = requestAnimationFrame(drawOrganicWaves);
  }

  drawOrganicWaves();
}

initNatureCanvas();

