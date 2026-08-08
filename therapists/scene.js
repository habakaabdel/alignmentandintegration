/* The week finding its rhythm. One 2D canvas behind the therapists page.

   At the top of the page several hairline traces run across the sheet, each
   with its own irregular shape and its own phase: the overloaded week, where
   every commitment keeps its own time. As the visitor scrolls the traces lose
   their jitter, slide into one phase, and settle onto a single slow baseline
   that breathes on an eleven second cycle, about the pace of one slow breath.
   Scroll is the conductor, so the same scroll position always gives the same
   state; time only supplies the breath.

   The vocabulary is deliberately tidal rather than clinical. The irregular
   state is built from long wavelength noise, never from spikes, and there is
   no grid, no marker, no sweep and no readout anywhere in the drawing. This
   page is read by therapists and nothing in the background may suggest a
   chart of a person.

   Progressive enhancement only. The page is complete with this file absent,
   with canvas unavailable, and under prefers-reduced-motion, where one
   settled still frame is drawn instead of a loop. */

(function () {
  'use strict';

  var canvas = document.getElementById('page-scene');
  if (!canvas) return;

  var ctx = canvas.getContext && canvas.getContext('2d');
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
  function smooth01(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function damp(cur, tgt, lambda, dt) { return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt)); }

  /* Value noise on a seeded lattice, smoothstep interpolated. This is what
     makes a trace irregular without making it spiky: the shortest wavelength
     in the drawing is still tens of pixels wide. */
  function makeNoise(n) {
    var v = [];
    for (var i = 0; i < n; i++) v.push(rand() * 2 - 1);
    return function (u) {
      u = u % n;
      if (u < 0) u += n;
      var i0 = Math.floor(u);
      var f = u - i0;
      var i1 = (i0 + 1) % n;
      return lerp(v[i0], v[i1], f * f * (3 - 2 * f));
    };
  }

  /* ---------- the traces ---------- */

  /* Density scales with viewport area, so a full sheet on a desktop does not
     arrive as a thicket on a phone. */
  var areaK = clamp(Math.sqrt((window.innerWidth * window.innerHeight) / (1440 * 900)), 0.5, 1.25);
  var COUNT = Math.max(4, Math.round(7 * areaK));

  var BREATH = 11;                        /* seconds for one full breath */
  var OMEGA = (Math.PI * 2) / BREATH;
  var REST = 0.54;                        /* where the settled baseline sits */
  var CENTRE = Math.floor(COUNT / 2);     /* the trace that carries the line */

  var TRACES = [];
  for (var i = 0; i < COUNT; i++) {
    var spread = COUNT > 1 ? i / (COUNT - 1) : 0.5;
    TRACES.push({
      /* the scattered lane, spread down the sheet */
      lane: lerp(0.20, 0.84, spread) + (rand() - 0.5) * 0.05,
      /* the residual offset once everything has settled: under a pixel each,
         so the group reads as one drawn line rather than a ribbon */
      rest: (i - (COUNT - 1) / 2) * 0.6,
      phase: rand() * Math.PI * 2,
      /* three long components per trace, each its own length and drift */
      comps: [
        { len: 180 + rand() * 180, amp: 13 + rand() * 13, drift: 0.16 + rand() * 0.16, ph: rand() * Math.PI * 2 },
        { len: 420 + rand() * 380, amp: 9 + rand() * 11, drift: 0.09 + rand() * 0.12, ph: rand() * Math.PI * 2 },
        { len: 74 + rand() * 56, amp: 4 + rand() * 5, drift: 0.20 + rand() * 0.18, ph: rand() * Math.PI * 2 }
      ],
      n1: makeNoise(48), n2: makeNoise(72),
      jag: 9 + rand() * 7,
      /* how far into the settling this one lets go, so they do not all
         arrive together */
      hold: rand() * 0.26
    });
  }

  /* Teal on cool paper. The centre trace carries the deeper value once the
     week has resolved; the rest fade back until they read as its aura. */
  var MARK = '31,95,91';
  var MARK_DEEP = '20,64,61';

  /* ---------- sizing ---------- */

  var DPR_CAP = coarse ? 1.5 : 2;
  var W = 0, H = 0;

  function size() {
    W = window.innerWidth;
    H = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();

  /* ---------- the conductor ---------- */

  var maxScrollV = 1;
  function measure() {
    maxScrollV = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  measure();

  /* A page too short to scroll has no story to tell, so it opens settled. */
  function settleAt(y) {
    if (maxScrollV < 240) return 1;
    return smooth01(clamp(y / (maxScrollV * 0.82), 0, 1));
  }

  /* ---------- drawing ---------- */

  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  function traceY(tr, x, T, s) {
    /* each trace releases its own irregularity a little after the last */
    var own = smooth01((s - tr.hold) / (1 - tr.hold));
    var loose = 1 - own;

    var base = lerp(tr.lane * H, REST * H + tr.rest, own);

    /* the shared breath: one long wave across the sheet, its phase pulled
       into line with every other trace as the week resolves */
    var sharedLen = Math.max(520, W * 1.35);
    var y = base + (10 + 5 * own) *
      Math.sin((x / sharedLen) * Math.PI * 2 + T * OMEGA + tr.phase * loose);

    if (loose > 0.001) {
      var wob = 0;
      for (var c = 0; c < tr.comps.length; c++) {
        var k = tr.comps[c];
        wob += k.amp * Math.sin((x / k.len) * Math.PI * 2 + k.ph + T * k.drift);
      }
      wob += tr.jag * tr.n1(x / 82 + T * 0.05);
      wob += tr.jag * 0.55 * tr.n2(x / 31 + T * 0.09);
      y += wob * loose;
    }
    return y;
  }

  function draw(T, s) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var step = W > 900 ? 5 : 4;

    for (var i = 0; i < COUNT; i++) {
      var tr = TRACES[i];
      var own = smooth01((s - tr.hold) / (1 - tr.hold));
      var centre = i === CENTRE;

      /* Fog, in the page's own terms: a trace fades into the paper at both
         margins rather than being cut by the viewport edge, so depth reads
         as sheet and not as darkness. */
      var a = centre ? lerp(0.15, 0.22, own) : lerp(0.12, 0.055, own);
      var rgb = centre ? MARK_DEEP : MARK;
      var g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(' + rgb + ',0)');
      g.addColorStop(0.14, 'rgba(' + rgb + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.86, 'rgba(' + rgb + ',' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');

      ctx.strokeStyle = g;
      ctx.lineWidth = centre ? 1.1 : 1;
      ctx.beginPath();
      for (var x = -step; x <= W + step; x += step) {
        var y = traceY(tr, x + parX, T, s) + parY;
        if (x <= -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  if (reduce) {
    var still = function () { size(); measure(); draw(0, 1); };
    still();
    var stillT;
    window.addEventListener('resize', function () {
      clearTimeout(stillT);
      stillT = setTimeout(still, 140);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  var exact = settleAt(window.scrollY || 0);
  var smoothS = exact;

  function readScroll() { exact = settleAt(window.scrollY || 0); }
  window.addEventListener('scroll', readScroll, { passive: true });

  /* The document height moves as fonts and the walkthrough images settle, so
     the conductor is measured again once the page is genuinely done. */
  function remeasure() { measure(); readScroll(); }
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  setTimeout(remeasure, 1600);

  var last = 0, running = true, frame = 0;

  function tick(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    smoothS = damp(smoothS, exact, 2.6, dt);
    if (Math.abs(smoothS - exact) < 0.0004) smoothS = exact;
    parX = damp(parX, mouseX * 6, 3, dt);
    parY = damp(parY, mouseY * 4, 3, dt);
    draw(now / 1000, smoothS);
    frame = requestAnimationFrame(tick);
  }

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { size(); measure(); readScroll(); }, 140);
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
