/* The individuals page scene: a life coming into balance.

   Small organic marks, petals and rounded motes, sit scattered across the warm
   field at the top of the page. As the visitor scrolls they gather into slow
   concentric orbits around one quiet centre, each ring turning and breathing on
   its own period so the composition settles without ever locking into a
   mechanism. Scroll is the conductor: the same scroll position always recreates
   the same arrangement, and only the breathing and the slow turn come from time.

   Progressive enhancement only. The page is complete with this file absent, with
   the 2D context unavailable, and under prefers-reduced-motion, where one settled
   still frame is drawn instead of a loop.

   Plain 2D canvas by choice. The forms here are soft and few, so a renderer is
   more machinery than the drawing needs. */

(function () {
  'use strict';

  var canvas = document.getElementById('page-scene');
  if (!canvas) return;

  var ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) { canvas.remove(); return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- deterministic random ---------- */

  /* Seeded so the field is the same drawing on every visit and on every
     machine. Never Math.random. */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(20260808);

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function smooth01(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function damp(cur, tgt, lambda, dt) { return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt)); }

  /* ---------- palette ---------- */

  /* Deep rose carries the page, sage is sparse, and every mark is mixed toward
     the paper by its depth so distance reads as the page ground rather than as
     darkness. Page tokens only: no colour is invented here. */
  var PAPER = [249, 245, 243];
  var RAMP = [
    [[125, 54, 80], 5.0],   /* --mark, deep rose */
    [[89, 36, 55], 2.4],    /* --mark-deep */
    [[45, 74, 62], 0.9],    /* the site sage */
    [[58, 90, 64], 0.7],    /* --second */
    [[113, 125, 118], 0.8]  /* --line-strong, the quietest marks */
  ];
  var rampBag = [];
  RAMP.forEach(function (entry) {
    for (var i = 0; i < Math.round(entry[1] * 10); i++) rampBag.push(entry[0]);
  });

  function fogged(rgb, k) {
    return Math.round(lerp(rgb[0], PAPER[0], k)) + ',' +
           Math.round(lerp(rgb[1], PAPER[1], k)) + ',' +
           Math.round(lerp(rgb[2], PAPER[2], k));
  }

  /* ---------- the rings ---------- */

  /* Five orbits. Each turns on its own long period and breathes on another, so
     they drift apart instead of holding formation. The vertical squash gives the
     rings a shallow tilt without asking for a camera. */
  var RING_K = [0.30, 0.46, 0.62, 0.80, 0.98];
  var RING_TURN = [58, 74, 92, 116, 143];   /* seconds for one revolution */
  var RING_BREATH = [41, 33, 52, 37, 61];   /* seconds for one breath */
  var RING_AMP = [0.020, 0.026, 0.030, 0.034, 0.038];
  var FLAT = 0.68;

  /* ---------- the field ---------- */

  /* Density follows viewport area, so a loose drift on a desktop does not arrive
     as a crowd on a phone. */
  var areaK = clamp(Math.sqrt((window.innerWidth * window.innerHeight) / (1440 * 900)), 0.5, 1.3);
  var COUNT = Math.round(150 * areaK);

  var M = [];
  for (var i = 0; i < COUNT; i++) {
    /* Outer rings hold more marks because they have more room to hold them. */
    var pick = rand() * 17;
    var ring = pick < 2 ? 0 : pick < 5 ? 1 : pick < 9 ? 2 : pick < 13 ? 3 : 4;
    var depth = 0.25 + rand() * 0.75;
    M.push({
      ring: ring,
      /* the scattered life, in viewport fractions with a little overscan */
      bx: -0.15 + rand() * 1.3,
      by: -0.12 + rand() * 1.28,
      r1: 0.045 + rand() * 0.055, p1: rand() * Math.PI * 2,
      r2: 0.040 + rand() * 0.050, p2: rand() * Math.PI * 2,
      /* the settled place on its ring */
      a0: rand() * Math.PI * 2,
      rj: (rand() - 0.5) * 0.055,
      rPhase: rand() * Math.PI * 2,
      /* form: a little over half are petals, the rest rounded motes */
      petal: rand() < 0.58,
      aspect: 0.52 + rand() * 0.26,
      size: (3.4 + rand() * 4.6) * (0.6 + depth * 0.7),
      rot: rand() * Math.PI * 2,
      spin: (0.10 + rand() * 0.24) * (rand() < 0.5 ? -1 : 1),
      /* how late this mark answers the gathering */
      gOff: rand() * 0.82,
      depth: depth,
      alpha: (0.16 + rand() * 0.26) * (0.45 + depth * 0.55),
      rgb: ''
    });
    M[i].rgb = fogged(rampBag[Math.floor(rand() * rampBag.length)], (1 - depth) * 0.62);
  }

  /* ---------- layout ---------- */

  var W = 1, H = 1, cx = 0, cy = 0, base = 1, dpr = 1;
  var DPR_CAP = coarse ? 1.5 : 2;

  function layout() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    var narrow = W < 720;
    cx = W * (narrow ? 0.50 : 0.62);
    cy = H * (narrow ? 0.50 : 0.48);
    base = Math.min(W, H) * (narrow ? 0.48 : 0.50);
  }

  /* ---------- scroll, the conductor ---------- */

  var maxScroll = 0, exact = 0, smoothP = 0;

  function measure() {
    maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function readScroll() {
    /* A page with nothing to scroll shows the settled composition rather than a
       scatter it can never resolve. */
    exact = maxScroll < 240 ? 1 : clamp((window.scrollY || 0) / maxScroll, 0, 1);
  }

  /* ---------- drawing ---------- */

  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  function mark(m, x, y, size, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = 'rgba(' + m.rgb + ',' + alpha.toFixed(3) + ')';
    ctx.beginPath();
    if (m.petal) {
      var a = size * m.aspect;
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(a, -size * 0.42, a, size * 0.46, 0, size);
      ctx.bezierCurveTo(-a, size * 0.46, -a, -size * 0.42, 0, -size);
    } else {
      ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  function render(T, p) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var ox = cx + parX;
    var oy = cy + parY;
    var settle = smooth01(p);

    /* The ring guides arrive after the marks that ride them, so the order reads
       as marks finding a path rather than a path being filled in. */
    for (var r = 0; r < RING_K.length; r++) {
      var fade = smooth01((p - 0.20 - r * 0.06) / 0.38);
      if (fade <= 0.001) continue;
      var rad = ringRadius(r, T);
      ctx.beginPath();
      ctx.ellipse(ox, oy, rad, rad * FLAT, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(125,54,80,' + (fade * 0.055).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (var i = 0; i < COUNT; i++) {
      var m = M[i];
      /* The first marks settle a third of the way down and the last of them by
         about three quarters, so the closing sections of the page are read
         against a composition that has already come to rest. */
      var g = smooth01((p * 1.75 - m.gOff) / 0.50);

      var sx = (m.bx * W) + Math.sin(T * m.r1 + m.p1) * W * 0.035;
      var sy = (m.by * H) + Math.cos(T * m.r2 + m.p2) * H * 0.040;

      var ang = m.a0 + (T / RING_TURN[m.ring]) * Math.PI * 2;
      var rad2 = ringRadius(m.ring, T) + m.rj * base;
      var gx = ox + Math.cos(ang) * rad2;
      var gy = oy + Math.sin(ang) * rad2 * FLAT;

      var x = lerp(sx, gx, g);
      var y = lerp(sy, gy, g);

      /* Free tumble while scattered, tangent to the ring once settled. */
      var free = m.rot + T * m.spin * 0.5;
      var tangent = ang + Math.PI / 2;
      var rot = lerp(free, tangent, g);

      mark(m, x, y, m.size * (0.86 + g * 0.30), rot, m.alpha * (0.55 + g * 0.45));
    }

    /* The quiet centre. It is the last thing to appear and the smallest mark on
       the page. */
    if (settle > 0.02) {
      var cr = base * 0.052 * (1 + Math.sin(T / 29 * Math.PI * 2) * 0.06);
      ctx.beginPath();
      ctx.ellipse(ox, oy, cr, cr * FLAT, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(89,36,55,' + (settle * 0.10).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ox, oy, 2.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(89,36,55,' + (settle * 0.22).toFixed(3) + ')';
      ctx.fill();
    }
  }

  function ringRadius(r, T) {
    var breath = Math.sin((T / RING_BREATH[r]) * Math.PI * 2 + r * 1.7) * RING_AMP[r];
    return base * RING_K[r] * (1 + breath);
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  layout();
  measure();
  readScroll();

  if (reduce) {
    render(0, 1);
    var stillT;
    window.addEventListener('resize', function () {
      clearTimeout(stillT);
      stillT = setTimeout(function () { layout(); render(0, 1); }, 140);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  smoothP = exact;

  /* Document height moves as fonts settle and the walkthrough images land, so
     the scroll range is measured again once the page is genuinely done. */
  function remeasure() { measure(); readScroll(); }
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  setTimeout(remeasure, 1600);

  var last = 0, running = true, frame = 0;

  function tick(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    smoothP = damp(smoothP, exact, 3.4, dt);
    if (Math.abs(smoothP - exact) < 0.0002) smoothP = exact;
    parX = damp(parX, mouseX * 12, 3, dt);
    parY = damp(parY, mouseY * 8, 3, dt);
    render(now / 1000, smoothP);
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', readScroll, { passive: true });

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { layout(); measure(); readScroll(); }, 140);
  }, { passive: true });

  /* A few pixels of parallax, and only where there is a pointer to answer. */
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
