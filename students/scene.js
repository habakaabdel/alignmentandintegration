/* Loose notes snapping into an outline. One 2D canvas world behind the
   students page.

   Short dashes and small bullet marks sit scattered across the viewport like
   fragments of jotted notes. As the visitor scrolls they justify to a single
   left margin, then indent tier by tier into a nested outline, which is the
   thing this product does to a course outline. Scroll is the only conductor,
   so the same scroll position always recreates the same state, and every
   fragment arrives on a short snap rather than a slow drift.

   Progressive enhancement only. The page is complete and correct with this
   file absent, and under prefers-reduced-motion one settled still frame is
   drawn instead of a loop. */

(function () {
  'use strict';

  var canvas = document.getElementById('page-scene');
  if (!canvas || typeof canvas.getContext !== 'function') return;

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

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function smooth01(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function damp(cur, tgt, lambda, dt) { return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt)); }

  /* A quartic settle. Over a scroll window this narrow it reads as a snap
     against a stop, which is the gesture the page is about. It never
     overshoots, because nothing on this site bounces. */
  function snapEase(t) { t = clamp(t, 0, 1); var u = 1 - t; return 1 - u * u * u * u; }

  /* ---------- palette ---------- */

  /* Depth is tonal here rather than geometric: a far mark is washed toward the
     page ground so the field fades into paper, never into darkness, while the
     settled outline keeps its exact measured positions. */
  var PAPER = [245, 244, 249];
  var MARK = [90, 61, 158];
  var DEEP = [67, 43, 120];
  var LILAC = [185, 167, 236];

  function washed(rgb, depth) {
    var k = depth * 0.55;
    return Math.round(lerp(rgb[0], PAPER[0], k)) + ',' +
           Math.round(lerp(rgb[1], PAPER[1], k)) + ',' +
           Math.round(lerp(rgb[2], PAPER[2], k));
  }

  /* ---------- layout ---------- */

  var W = 0, H = 0, dpr = 1;
  var marks = [];
  var x0 = 0, indent = 0, ruleTop = 0, ruleBottom = 0;
  var tierGuides = [];

  function sizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    var rand = mulberry32(20260808);
    var narrow = W < 720;

    /* Density scales with viewport area so a field on a desktop does not
       arrive as a blizzard on a phone. */
    var areaK = clamp(Math.sqrt((W * H) / (1440 * 900)), 0.5, 1.3);

    x0 = narrow ? Math.round(W * 0.12) : Math.round(clamp(W * 0.10, 84, 180));
    indent = narrow ? clamp(W * 0.055, 16, 28) : clamp(W * 0.028, 20, 40);
    var colRight = narrow ? W * 0.86 : W * 0.58;

    var rowCount = Math.round(clamp(H / 32, 14, 28));
    var rowH = (H * 0.84) / rowCount;
    var top = H * 0.08 + rowH * 0.6;

    /* The outline skeleton: top level items, each with a short run of children
       and the occasional grandchild. Depth stops at three tiers because a
       reader has to be able to see the shape at a glance. */
    var rows = [];
    while (rows.length < rowCount) {
      rows.push(0);
      var kids = 1 + Math.floor(rand() * 3);
      for (var k = 0; k < kids && rows.length < rowCount; k++) {
        rows.push(1);
        var grand = rand() < 0.45 ? 1 + Math.floor(rand() * 2) : 0;
        for (var g = 0; g < grand && rows.length < rowCount; g++) rows.push(2);
      }
    }

    var tierTotal = [0, 0, 0];
    var tierSeen = [0, 0, 0];
    for (var r = 0; r < rows.length; r++) tierTotal[rows[r]]++;

    /* Indentation happens tier by tier, after every fragment has justified. */
    var INDENT_START = [0, 0.54, 0.66];

    marks = [];
    ruleTop = top - rowH * 0.7;
    ruleBottom = top + (rows.length - 1) * rowH + rowH * 0.7;
    tierGuides = [
      { x: x0 + indent, start: INDENT_START[1] },
      { x: x0 + indent * 2, start: INDENT_START[2] }
    ];

    /* One fragment: where it lies loose, where it lands when it justifies, and
       where it ends up once its tier indents. */
    function place(row, kind, jx, fx, w, th, rgb, alpha, order) {
      var depth = rand();
      marks.push({
        kind: kind,
        jx: jx, fx: fx, ty: row.y, tw: w, th: th,
        hasB: row.tier > 0,
        rgb: washed(rgb, depth),
        alpha: alpha * (1 - depth * 0.4),
        depth: depth,
        sx: W * 0.05 + rand() * W * 0.90,
        sy: H * 0.03 + rand() * H * 0.94,
        sw: Math.max(6, w * (0.26 + rand() * 0.40)),
        srot: (rand() - 0.5) * 1.4,
        r1: 0.05 + rand() * 0.09, p1: rand() * Math.PI * 2, ax: 8 + rand() * 14,
        r2: 0.04 + rand() * 0.08, p2: rand() * Math.PI * 2, ay: 6 + rand() * 10,
        breath: 0.3 + rand() * 0.5,
        trigA: row.trigA + order * 0.012,
        winA: 0.05 + rand() * 0.03,
        trigB: row.trigB,
        winB: 0.05
      });
    }

    for (var i = 0; i < rows.length; i++) {
      var tier = rows[i];
      var bullet = x0 + tier * indent;
      var avail = Math.max(70, colRight - bullet - 14);
      var rowT = i / Math.max(1, rows.length - 1);
      var ordT = tierTotal[tier] > 1 ? tierSeen[tier] / (tierTotal[tier] - 1) : 0;
      tierSeen[tier]++;

      var row = {
        tier: tier,
        y: top + i * rowH,
        trigA: 0.05 + rowT * 0.40 + (rand() - 0.5) * 0.03,
        trigB: tier === 0 ? 0 : INDENT_START[tier] + ordT * 0.11 + (rand() - 0.5) * 0.02
      };

      /* The bullet: a filled record square at the top tier, a dot below it, a
         hairline tick at the third. The same three weights the sheet uses. */
      if (tier === 0) place(row, 'square', x0, bullet, 4.6, 4.6, DEEP, 0.40, 0);
      else if (tier === 1) place(row, 'dot', x0, bullet, 3.2, 3.2, DEEP, 0.36, 0);
      else place(row, 'dash', x0, bullet, 6, 1.6, LILAC, 0.34, 0);

      /* The text of the row, drawn as a run of short rules. */
      var count = tier === 0 ? 2 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 3);
      var fill = avail * (tier === 0 ? 0.72 + rand() * 0.22 : 0.42 + rand() * 0.36);
      var gap = 9;
      var body = Math.max(30, fill - gap * (count - 1));
      var weights = [];
      var sum = 0;
      for (var c = 0; c < count; c++) { var wv = 0.7 + rand() * 0.6; weights.push(wv); sum += wv; }

      var th = tier === 0 ? 2.2 : (tier === 1 ? 1.9 : 1.6);
      var run = bullet + 12;
      for (var d = 0; d < count; d++) {
        var w = (weights[d] / sum) * body;
        var tone = rand() < 0.26 ? LILAC : MARK;
        place(row, 'dash', run - tier * indent, run, w, th, tone, tone === LILAC ? 0.30 : 0.26, d + 1);
        run += w + gap;
      }
    }

    /* A phone gets the same composition at a lighter weight, because the field
       sits closer to the eye there. */
    if (areaK < 0.7) {
      for (var m = 0; m < marks.length; m++) marks[m].alpha *= 0.85;
    }
  }

  /* ---------- the scroll conductor ---------- */

  var maxScrollV = 1;
  function measure() {
    maxScrollV = Math.max(1, (document.documentElement.scrollHeight - window.innerHeight) * 0.88);
  }

  function progressNow() {
    if (maxScrollV < 240) return 1;
    return clamp((window.scrollY || 0) / maxScrollV, 0, 1);
  }

  /* ---------- render ---------- */

  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  function render(T, p) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';

    /* The margin itself draws down the page while the fragments are still
       finding it. */
    var mrule = snapEase((p - 0.04) / 0.34);
    if (mrule > 0.001) {
      ctx.strokeStyle = 'rgba(90,61,158,' + (0.15 * mrule).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(x0 + 0.5 + parX * 0.5, ruleTop);
      ctx.lineTo(x0 + 0.5 + parX * 0.5, lerp(ruleTop, ruleBottom, mrule));
      ctx.stroke();
    }

    for (var g = 0; g < tierGuides.length; g++) {
      var gp = smooth01((p - tierGuides[g].start) / 0.16);
      if (gp <= 0.001) continue;
      ctx.strokeStyle = 'rgba(185,167,236,' + (0.22 * gp).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(tierGuides[g].x + 0.5 + parX * 0.5, ruleTop + 6);
      ctx.lineTo(tierGuides[g].x + 0.5 + parX * 0.5, lerp(ruleTop + 6, ruleBottom - 6, gp));
      ctx.stroke();
    }

    ctx.lineCap = 'round';

    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      var A = snapEase((p - m.trigA) / m.winA);
      var B = m.hasB ? snapEase((p - m.trigB) / m.winB) : 0;
      var loose = 1 - A;

      var px = parX * (1 - m.depth * 0.6);
      var py = parY * (1 - m.depth * 0.6);

      var dx = m.sx + Math.sin(T * m.r1 + m.p1) * m.ax;
      var dy = m.sy + Math.cos(T * m.r2 + m.p2) * m.ay;

      var sx = lerp(dx, m.jx, A) + (m.fx - m.jx) * B;
      var sy = lerp(dy, m.ty, A) + Math.sin(T * 0.3 + m.p1) * m.breath * A;
      var rot = m.srot * loose;
      var w = lerp(m.sw, m.tw, A);
      var a = m.alpha * lerp(0.68, 1, A);

      if (a < 0.004) continue;
      ctx.save();
      ctx.translate(sx + px, sy + py);
      if (rot) ctx.rotate(rot);
      ctx.fillStyle = ctx.strokeStyle = 'rgba(' + m.rgb + ',' + a.toFixed(3) + ')';

      if (m.kind === 'dash') {
        ctx.lineWidth = m.th;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);
        ctx.stroke();
      } else if (m.kind === 'square') {
        var s = m.tw * lerp(0.7, 1, A);
        ctx.fillRect(-s / 2, -s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, (m.tw / 2) * lerp(0.7, 1, A), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  sizeCanvas();
  build();
  measure();

  if (reduce) {
    render(8, 1);
    var stillT;
    window.addEventListener('resize', function () {
      clearTimeout(stillT);
      stillT = setTimeout(function () {
        sizeCanvas();
        build();
        measure();
        render(8, 1);
      }, 140);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  var exact = progressNow();
  var smoothP = exact;
  var last = 0, running = true, frame = 0;

  function readScroll() { exact = progressNow(); }

  function tick(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    smoothP = damp(smoothP, exact, 7.5, dt);
    if (Math.abs(smoothP - exact) < 0.0002) smoothP = exact;
    parX = damp(parX, mouseX * 6, 4, dt);
    parY = damp(parY, mouseY * 4, 4, dt);
    render(now / 1000, smoothP);
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', readScroll, { passive: true });

  /* Document height goes stale while fonts, the embedded frame and the
     walkthrough images settle, and the conductor reads from it. */
  function remeasure() { measure(); readScroll(); }
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  setTimeout(remeasure, 1600);

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      sizeCanvas();
      build();
      measure();
      readScroll();
    }, 140);
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
