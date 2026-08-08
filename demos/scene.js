/* The drafting table. A quiet 2D world behind the demos index.

   The page's only job is to send a visitor onward to a tile, so this is the
   most restrained scene of the set: a sheet of empty schematic frames, small
   rectangles carrying hairline corner ticks and nothing inside them. At the
   top of the page they sit loose and slightly off square, drifting the way
   paper drifts on a table. Scroll squares them up onto an implied grid, one
   after another, and the grid's own tick marks come up under them as they
   land. Nothing is ever labelled, because the labels are the demo cards.

   Progressive enhancement only. The page is complete with this file absent
   and with JavaScript off. Under prefers-reduced-motion one settled still
   frame is drawn and no loop runs. Scroll is the conductor: the same scroll
   position always produces the same arrangement. */

(function () {
  'use strict';

  var canvas = document.getElementById('page-scene');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- deterministic random ---------- */

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var SEED = 20260808;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function smooth01(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function damp(cur, tgt, lambda, dt) { return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt)); }

  var TAU = Math.PI * 2;

  /* Ink weights. The frame edge is the boundary colour and the corner ticks
     are the page's mark, both kept low enough that they read as pencil under
     the sheet rather than as content. Depth scales both toward the paper, so
     the far frames fade into the ground instead of into shadow. */
  var EDGE_A = 0.09;
  var TICK_A = 0.40;
  var GRID_A = 0.5;

  /* ---------- layout ---------- */

  var W = 0, H = 0, DPR = 1;
  var U = 0, COLS = 0, ROWS = 0, OFFX = 0, OFFY = 0;
  var frames = [];
  var maxScroll = 1;

  /* Frame proportions read as drawing frames on a sheet: mostly landscape,
     one upright, none of them square enough to look like a button. */
  var MODULES = [[3, 2], [2, 2], [4, 2], [2, 1], [3, 2], [2, 3], [4, 3], [3, 1]];

  function build() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    /* One module unit, sized so the sheet reads at roughly nine units across
       its short side at every viewport. */
    U = Math.max(54, Math.min(W, H) / 9);
    COLS = Math.max(3, Math.floor(W / U));
    ROWS = Math.max(3, Math.floor(H / U));
    OFFX = (W - COLS * U) / 2;
    OFFY = (H - ROWS * U) / 2;

    /* Density scales with viewport area so a calm sheet on a desktop does not
       arrive as clutter on a phone. */
    var areaK = clamp(Math.sqrt((W * H) / (1440 * 900)), 0.5, 1.3);
    var target = Math.round(13 * areaK);

    var rand = mulberry32(SEED);
    var occ = new Uint8Array(COLS * ROWS);
    frames = [];

    function isFree(gx, gy, gw, gh) {
      if (gx < 0 || gy < 0 || gx + gw > COLS || gy + gh > ROWS) return false;
      /* the ring is scanned too, which keeps one clear unit between frames */
      for (var y = gy - 1; y <= gy + gh; y++) {
        for (var x = gx - 1; x <= gx + gw; x++) {
          if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
          if (occ[y * COLS + x]) return false;
        }
      }
      return true;
    }

    var attempts = target * 60;
    while (frames.length < target && attempts-- > 0) {
      var mod = MODULES[Math.floor(rand() * MODULES.length)];
      var gw = mod[0], gh = mod[1];
      var gx = Math.floor(rand() * COLS);
      var gy = Math.floor(rand() * ROWS);
      if (!isFree(gx, gy, gw, gh)) continue;

      for (var oy = gy; oy < gy + gh; oy++) {
        for (var ox = gx; ox < gx + gw; ox++) occ[oy * COLS + ox] = 1;
      }

      frames.push({
        /* where it squares up to */
        cx: OFFX + (gx + gw / 2) * U,
        cy: OFFY + (gy + gh / 2) * U,
        w: gw * U,
        h: gh * U,
        /* how far off true it starts, and how it wanders while it is loose */
        ox: (rand() - 0.5) * U * 1.9,
        oy: (rand() - 0.5) * U * 1.4,
        rot: (rand() - 0.5) * 0.26,
        r1: 0.05 + rand() * 0.07, p1: rand() * TAU,
        r2: 0.04 + rand() * 0.06, p2: rand() * TAU,
        r3: 0.03 + rand() * 0.05, p3: rand() * TAU,
        depth: rand(),
        squareAt: rand() * 0.34
      });
    }
  }

  function measure() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  /* ---------- drawing ---------- */

  function drawGrid(a) {
    if (a <= 0.002) return;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(216, 214, 206, ' + (a * GRID_A).toFixed(3) + ')';
    ctx.beginPath();
    var k = 3;
    for (var gy = 1; gy < ROWS; gy++) {
      for (var gx = 1; gx < COLS; gx++) {
        var px = Math.round(OFFX + gx * U) + 0.5;
        var py = Math.round(OFFY + gy * U) + 0.5;
        ctx.moveTo(px - k, py); ctx.lineTo(px + k, py);
        ctx.moveTo(px, py - k); ctx.lineTo(px, py + k);
      }
    }
    ctx.stroke();
  }

  function drawFrame(x, y, w, h, rot, a) {
    var hw = w / 2, hh = h / 2;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.lineWidth = 1;

    ctx.strokeStyle = 'rgba(113, 125, 118, ' + (a * EDGE_A).toFixed(3) + ')';
    ctx.strokeRect(-hw, -hh, w, h);

    /* The corner ticks carry the drawing. They sit on the corner and run a
       short way down each edge, the way an unlabelled frame is marked out
       before anything is drawn inside it. */
    var t = Math.min(22, Math.min(w, h) * 0.26);
    ctx.strokeStyle = 'rgba(45, 74, 62, ' + (a * TICK_A).toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(-hw, -hh + t); ctx.lineTo(-hw, -hh); ctx.lineTo(-hw + t, -hh);
    ctx.moveTo(hw - t, -hh); ctx.lineTo(hw, -hh); ctx.lineTo(hw, -hh + t);
    ctx.moveTo(hw, hh - t); ctx.lineTo(hw, hh); ctx.lineTo(hw - t, hh);
    ctx.moveTo(-hw + t, hh); ctx.lineTo(-hw, hh); ctx.lineTo(-hw, hh - t);
    ctx.stroke();

    ctx.restore();
  }

  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  function render(T, P) {
    ctx.clearRect(0, 0, W, H);

    /* The grid comes up under the frames once most of them are settling. */
    drawGrid(smooth01((P - 0.28) / 0.5));

    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      var s = smooth01((P - f.squareAt) / 0.6);
      /* a settled frame keeps a trace of the drift so the sheet stays alive */
      var loose = lerp(1, 0.16, s);

      var near = 1 - f.depth * 0.65;
      var x = f.cx + f.ox * (1 - s) + Math.sin(T * f.r1 + f.p1) * U * 0.19 * loose + parX * near;
      var y = f.cy + f.oy * (1 - s) + Math.sin(T * f.r2 + f.p2) * U * 0.14 * loose + parY * near;
      var rot = f.rot * (1 - s) + Math.sin(T * f.r3 + f.p3) * 0.03 * loose;

      var scl = lerp(1, 0.74, f.depth);
      var a = lerp(1, 0.35, f.depth);
      drawFrame(x, y, f.w * scl, f.h * scl, rot, a);
    }
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  build();
  measure();

  if (reduce) {
    render(0, 1);
    var stillT;
    window.addEventListener('resize', function () {
      clearTimeout(stillT);
      stillT = setTimeout(function () { build(); measure(); render(0, 1); }, 140);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  var exact = 0, smoothP = 0;

  function readScroll() {
    /* The squaring completes a little before the foot of the page, so the
       last screen is a settled sheet rather than one still arriving. */
    exact = clamp((window.scrollY || 0) / (maxScroll * 0.85), 0, 1);
  }
  readScroll();
  smoothP = exact;

  /* Document height moves as fonts and images settle, so the scroll range is
     taken again once the page is genuinely done. */
  function remeasure() { measure(); readScroll(); }
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  setTimeout(remeasure, 1600);

  var last = 0, running = true, frame = 0;

  function tick(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    smoothP = damp(smoothP, exact, 5, dt);
    if (Math.abs(smoothP - exact) < 0.0002) smoothP = exact;
    parX = damp(parX, mouseX * 7, 3.5, dt);
    parY = damp(parY, mouseY * -5, 3.5, dt);
    render(now / 1000, smoothP);
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', readScroll, { passive: true });

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { build(); measure(); readScroll(); }, 140);
  }, { passive: true });

  if (!coarse) {
    window.addEventListener('pointermove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frame);
      last = 0;
    } else {
      running = true;
      frame = requestAnimationFrame(tick);
    }
  });

  frame = requestAnimationFrame(tick);
})();
