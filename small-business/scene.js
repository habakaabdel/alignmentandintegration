/* The day's numbers settling into order. One persistent 2D world behind the
   small business page.

   A few hundred small marks drift across the upper page: hairline strokes at
   loose angles, short stubs, a scatter of filled squares. They are the tallies,
   tickets and receipts of a working day, before anyone has made sense of them.
   As the visitor scrolls they turn onto one steady rising line and lie down
   along it end to end, drawing the line they were always part of. The noise
   marks thin out on the way; the record marks stay. Scroll is the conductor,
   so the same scroll position always recreates the same state.

   Progressive enhancement only. The page is complete with this file absent,
   with 2D canvas unavailable, and under prefers-reduced-motion, where one
   settled still frame is rendered instead of motion. */

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
  var rand = mulberry32(20260808);

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function clamp01(v) { return clamp(v, 0, 1); }
  function smooth01(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function damp(cur, tgt, lambda, dt) { return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt)); }

  /* ---------- the palette ----------
     The page's own tokens, written as numbers because a canvas cannot read a
     custom property. Paper is the fog colour: depth fades a mark into the sheet
     rather than into darkness. */

  var PAPER = [255, 255, 255];
  var MARK = [11, 90, 68];        /* --mark, the kept number */
  var MARK_DEEP = [8, 64, 47];    /* --mark-deep, the spine */
  var WARM = [155, 129, 88];      /* the sparse warm neutral: paper stock, not ink */
  var NOISE = [113, 125, 118];    /* --line-strong, the marks that do not survive the day */

  function mix(a, b, t) {
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' +
                    Math.round(lerp(a[1], b[1], t)) + ',' +
                    Math.round(lerp(a[2], b[2], t)) + ')';
  }

  /* ---------- the field ----------
     Density scales with viewport area so a quiet drift on a desktop does not
     arrive as a swarm on a phone. */

  var areaK = clamp(Math.sqrt((window.innerWidth * window.innerHeight) / (1440 * 900)), 0.5, 1.25);
  var COUNT = Math.round(240 * areaK);

  var M = [];
  for (var i = 0; i < COUNT; i++) {
    var t = i / Math.max(1, COUNT - 1);
    var roll = rand();
    /* three kinds of mark: the stroke of a tally, the stub of a torn ticket,
       the small filled square this sheet already uses for a filed record */
    var kind = roll < 0.7 ? 0 : (roll < 0.9 ? 1 : 2);
    var hueRoll = rand();
    M.push({
      /* the loose day */
      bx: 0.03 + rand() * 0.95,
      by: 0.04 + rand() * 0.62,
      ang: rand() * Math.PI * 2,
      len: 5 + rand() * 13,
      r1: 0.05 + rand() * 0.09, p1: rand() * Math.PI * 2,
      r2: 0.04 + rand() * 0.08, p2: rand() * Math.PI * 2,
      /* the place on the line, left end first so the line fills as it forms */
      t: clamp01(t + (rand() - 0.5) * 0.035),
      off: (rand() - 0.5) * 2.6,
      lift: kind === 2 ? 5 + rand() * 4 : 0,
      kind: kind,
      /* depth drives fog, size and parallax together */
      z: rand(),
      /* a tenth of the field is warm paper stock, a fifth is noise that thins
         out once the day is counted */
      hue: hueRoll < 0.1 ? WARM : (hueRoll < 0.32 ? NOISE : MARK),
      keeps: hueRoll >= 0.32,
      breath: 0.4 + rand() * 0.8,
      phase: rand() * Math.PI * 2
    });
    /* fog depends only on depth, which never changes, so each mark's paper
       mixed colour is resolved once here rather than per frame */
    var mk = M[M.length - 1];
    mk.ink = mix(mk.hue, PAPER, (1 - mk.z) * 0.55);
  }
  /* settle order runs along the line, so the marks lie down left to right */
  M.sort(function (a, b) { return a.t - b.t; });

  /* ---------- the one line ----------
     A steady rise with a slight bow, in viewport units. Steady is the point:
     this is the number line the page promises, not a curve that flatters. */

  var w = 0, h = 0, dpr = 1;

  function linePoint(u) {
    u = clamp01(u);
    var x = lerp(0.07, 0.95, u) * w;
    var y = (0.80 - 0.50 * u) * h - Math.sin(Math.PI * u) * 0.035 * h;
    return [x, y];
  }

  function lineAngle(u) {
    var a = linePoint(clamp01(u - 0.01));
    var b = linePoint(clamp01(u + 0.01));
    return Math.atan2(b[1] - a[1], b[0] - a[0]);
  }

  /* The upper left of the viewport is where the heading and the claim sit, so
     marks thin out there and never compete with reading. On a narrow viewport
     the reading column is the whole width, so only the vertical band counts. */
  function guard(x, y, narrow) {
    var gy = 1 - smooth01((0.56 - y / h) / 0.42);
    if (narrow) return 0.34 + 0.66 * gy;
    var gx = 1 - smooth01((0.56 - x / w) / 0.36);
    return 0.36 + 0.64 * Math.max(gx, gy);
  }

  /* ---------- sizing ---------- */

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  /* ---------- scroll, the conductor ---------- */

  var maxScrollV = 1;
  function measure() {
    maxScrollV = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  var exact = 0, smoothP = 0;
  function readScroll() {
    /* the field is fully settled a little before the foot of the page, so the
       last screen rests on the finished line rather than still arriving */
    exact = clamp01((window.scrollY || 0) / maxScrollV / 0.78);
  }

  /* ---------- drawing ---------- */

  var ALPHA = 0.36;
  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  function render(T, p) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    /* A phone holds the same field in a quarter of the area, so the whole
       scene steps back a further quarter rather than crowding the column. */
    var narrow = w < 720;
    var A = ALPHA * (narrow ? 0.74 : 1);

    var drawn = smooth01((p - 0.14) / 0.62);

    /* the spine, drawn only as far as the field has settled */
    if (drawn > 0.001) {
      ctx.save();
      ctx.globalAlpha = A * 0.5 * smooth01(p / 0.3);
      ctx.strokeStyle = mix(MARK_DEEP, PAPER, 0.25);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      var steps = 48;
      for (var s = 0; s <= steps; s++) {
        var u = (s / steps) * drawn;
        var q = linePoint(u);
        var qx = q[0] + parX * 0.6, qy = q[1] + parY * 0.6;
        if (s === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
      }
      ctx.stroke();
      ctx.restore();

      /* the reading points along it, appearing behind the drawn head */
      var NODES = [0.12, 0.28, 0.44, 0.6, 0.76, 0.92];
      for (var n = 0; n < NODES.length; n++) {
        var na = clamp01((drawn - NODES[n]) / 0.08);
        if (na <= 0) continue;
        var np = linePoint(NODES[n]);
        ctx.globalAlpha = A * 0.85 * na;
        ctx.fillStyle = mix(MARK, PAPER, 0.1);
        var r = 2.4;
        ctx.fillRect(np[0] + parX * 0.6 - r, np[1] + parY * 0.6 - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    }

    for (var i = 0; i < COUNT; i++) {
      var m = M[i];
      var la = smooth01((p - m.t * 0.62) / 0.34);

      /* the loose day: a slow wander that stills as the mark finds its place */
      var wander = 1 - la;
      var dx = m.bx * w + Math.sin(T * m.r1 + m.p1) * 16 * wander;
      var dy = m.by * h + Math.sin(T * m.r2 + m.p2) * 11 * wander;

      /* the place on the line, breathing along its own tangent */
      var lp = linePoint(m.t);
      var ang = lineAngle(m.t);
      var breathe = Math.sin(T * 0.4 + m.phase) * m.breath;
      var gx = lp[0] + Math.cos(ang) * breathe - Math.sin(ang) * m.off * 0.5;
      var gy = lp[1] + Math.sin(ang) * breathe + Math.cos(ang) * m.off * 0.5 - m.lift * la;

      var px = lerp(dx, gx, la);
      var py = lerp(dy, gy, la);

      var depth = 0.45 + m.z * 0.55;
      px += parX * depth;
      py += parY * depth;

      /* the angle turns onto the line; the length settles to one tick */
      var a = m.ang + (T * 0.06 + m.phase) * 0.12 * wander;
      var turn = lerp(a, ang, smooth01(la));
      var len = lerp(m.len, m.kind === 1 ? 5 : 8, la) * lerp(0.8, 1.1, m.z);

      /* the noise marks thin out once the day is counted; the records hold */
      var keep = m.keeps ? 1 : lerp(1, 0.22, la);
      var alpha = A * lerp(0.5, 1, m.z) * keep * guard(px, py, narrow);
      if (alpha < 0.004) continue;

      ctx.globalAlpha = alpha;

      if (m.kind === 2) {
        var sq = lerp(2.6, 2.2, la) * lerp(0.85, 1.15, m.z);
        ctx.fillStyle = m.ink;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(lerp(a, 0, smooth01(la)));
        ctx.fillRect(-sq, -sq, sq * 2, sq * 2);
        ctx.restore();
      } else {
        ctx.strokeStyle = m.ink;
        ctx.lineWidth = (m.kind === 1 ? 1.9 : 1) * lerp(0.85, 1.15, m.z);
        var hx = Math.cos(turn) * len * 0.5;
        var hy = Math.sin(turn) * len * 0.5;
        ctx.beginPath();
        ctx.moveTo(px - hx, py - hy);
        ctx.lineTo(px + hx, py + hy);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  resize();
  measure();

  if (reduce) {
    var still = function () { resize(); render(24, 1); };
    still();
    var rTs;
    window.addEventListener('resize', function () {
      clearTimeout(rTs);
      rTs = setTimeout(still, 140);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  readScroll();
  smoothP = exact;

  /* Layout settles after fonts and the walkthrough frames arrive, so the
     scroll range is measured again once the document is genuinely done. */
  function remeasure() { measure(); readScroll(); }
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  setTimeout(remeasure, 1600);

  var last = 0, running = true, frame = 0;

  function tick(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    smoothP = damp(smoothP, exact, 5.2, dt);
    if (Math.abs(smoothP - exact) < 0.0002) smoothP = exact;
    parX = damp(parX, mouseX * 9, 4, dt);
    parY = damp(parY, mouseY * -6, 4, dt);
    render(now / 1000, smoothP);
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', readScroll, { passive: true });

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      resize();
      measure();
      readScroll();
    }, 140);
  }, { passive: true });

  /* Pointer parallax on a fine pointer only, and only a few pixels of it. */
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
