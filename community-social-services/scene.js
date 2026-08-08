/* The network that was always there. One 2D canvas world behind the community
   and social services page.

   Small points sit in separate huddles across a warm field: each huddle is a
   service holding its own people, its own records, its own part of the story.
   As the visitor scrolls, hairline links draw inside each huddle first, then
   curved bridges reach between the huddles, until the field resolves into one
   connected map. Nothing new arrives while this happens. The links were always
   possible; the page is only drawing them. Scroll is the conductor, so the
   same scroll position always recreates the same state.

   Progressive enhancement only. The page is complete and correct with this
   file absent, with canvas unavailable, and under prefers-reduced-motion,
   where one settled still frame is drawn and no loop ever starts. */

(function () {
  'use strict';

  var canvas = document.getElementById('page-scene');
  if (!canvas) return;

  var ctx = canvas.getContext ? canvas.getContext('2d') : null;
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

  /* ---------- colour ----------
     Depth is carried by fading toward the page ground rather than toward
     darkness, so distance reads as paper. Sage greens hold the field and the
     amber and teal accents stay sparse, matching the ramp on the home page. */

  var PAPER = [247, 244, 238];
  var MARK = [45, 74, 62];
  var SECOND = [58, 90, 64];
  var SAGE = [111, 143, 102];
  var SAGE_PALE = [135, 160, 122];
  var AMBER = [169, 129, 74];
  var TEAL = [31, 95, 91];

  /* An "rgba(r,g,b," prefix, already fogged for this depth. Depth never
     changes after the field is built, so the string is built once and only
     the alpha is appended per frame. */
  function fogPrefix(rgb, z) {
    var k = 0.58 * z;
    return 'rgba(' +
      Math.round(lerp(rgb[0], PAPER[0], k)) + ',' +
      Math.round(lerp(rgb[1], PAPER[1], k)) + ',' +
      Math.round(lerp(rgb[2], PAPER[2], k)) + ',';
  }

  /* ---------- canvas sizing ---------- */

  var w = 0, h = 0;
  var DPR_CAP = coarse ? 1.5 : 2;

  function sizeCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    /* Assigning width resets the drawing matrix, so the scale is fresh here. */
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  sizeCanvas();

  /* ---------- the field ----------
     Density scales with viewport area so a quiet field on a desktop does not
     arrive as a crowd on a phone. */

  var areaK = clamp(Math.sqrt((w * h) / (1440 * 900)), 0.5, 1.3);
  var CLUSTER_N = Math.max(5, Math.round(9 * areaK));

  var clusters = [];
  for (var c = 0; c < CLUSTER_N; c++) {
    var u = 0.5, v = 0.5, placed = false;
    for (var tries = 0; tries < 48 && !placed; tries++) {
      u = -0.06 + rand() * 1.12;
      v = -0.06 + rand() * 1.12;
      placed = true;
      for (var q = 0; q < clusters.length; q++) {
        /* x is weighted because a landscape viewport reads wider than tall,
           so huddles need more room sideways before they look separate. */
        var du = (u - clusters[q].u) * 1.5;
        var dv = v - clusters[q].v;
        if (du * du + dv * dv < 0.055) { placed = false; break; }
      }
    }
    clusters.push({ u: u, v: v, z: rand(), pts: [], cu: u, cv: v });
  }

  var pts = [];
  clusters.forEach(function (cl, ci) {
    var n = 4 + Math.floor(rand() * 5);
    for (var i = 0; i < n; i++) {
      var a = rand() * Math.PI * 2;
      /* square root of a uniform draw spreads points evenly through the disc
         instead of piling them at the centre */
      var r = 0.30 + Math.sqrt(rand()) * 1.05;
      var pick = rand();
      var rgb = pick < 0.08 ? AMBER
        : pick < 0.15 ? TEAL
        : pick < 0.42 ? MARK
        : pick < 0.62 ? SECOND
        : pick < 0.84 ? SAGE
        : SAGE_PALE;
      var z = clamp(cl.z + (rand() - 0.5) * 0.18, 0, 1);
      pts.push({
        c: ci,
        ox: Math.cos(a) * r,
        oy: Math.sin(a) * r * 0.86,
        z: z,
        r1: 0.09 + rand() * 0.13, p1: rand() * Math.PI * 2,
        r2: 0.08 + rand() * 0.12, p2: rand() * Math.PI * 2,
        amp: 0.10 + rand() * 0.13,
        breath: rand() * Math.PI * 2,
        size: 0.85 + rand() * 0.65,
        fill: fogPrefix(rgb, z),
        x: 0, y: 0
      });
      cl.pts.push(pts.length - 1);
    }
  });

  /* ---------- the links ----------
     Topology is built once, from the layout at load, and then only re-mapped
     on resize. The world keeps the same shape when a window changes size. */

  var U0 = unitPx();

  function baseXY(p) {
    var cl = clusters[p.c];
    return [cl.u * w + p.ox * U0, cl.v * h + p.oy * U0];
  }
  var basePos = pts.map(baseXY);

  function dist(i, j) {
    var dx = basePos[i][0] - basePos[j][0];
    var dy = basePos[i][1] - basePos[j][1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  var intra = [];
  var seen = {};

  clusters.forEach(function (cl) {
    cl.pts.forEach(function (a) {
      var others = cl.pts.filter(function (b) { return b !== a; });
      others.sort(function (m, n) { return dist(a, m) - dist(a, n); });
      /* two nearest neighbours each: enough for a huddle to read as one
         body, sparse enough to stay a drawing rather than a mesh */
      others.slice(0, 2).forEach(function (b) {
        var key = Math.min(a, b) + ':' + Math.max(a, b);
        if (seen[key]) return;
        seen[key] = 1;
        intra.push({
          a: a, b: b,
          len: dist(a, b),
          k: (0.10 + rand() * 0.10) * (rand() < 0.5 ? -1 : 1),
          fill: fogPrefix(MARK, clusters[pts[a].c].z),
          ord: 0
        });
      });
    });
  });

  /* Shortest bonds first, so every huddle knits at once and the field never
     looks like one cluster is being favoured. */
  intra.sort(function (m, n) { return m.len - n.len; });
  intra.forEach(function (l, i) { l.ord = intra.length > 1 ? i / (intra.length - 1) : 0; });

  var bridges = [];
  var bseen = {};

  clusters.forEach(function (cl, ci) {
    var order = clusters.map(function (o, oi) { return oi; }).filter(function (oi) { return oi !== ci; });
    order.sort(function (m, n) {
      var dm = Math.hypot((clusters[m].u - cl.u) * w, (clusters[m].v - cl.v) * h);
      var dn = Math.hypot((clusters[n].u - cl.u) * w, (clusters[n].v - cl.v) * h);
      return dm - dn;
    });
    order.slice(0, 2).forEach(function (oi) {
      var key = Math.min(ci, oi) + ':' + Math.max(ci, oi);
      if (bseen[key]) return;
      bseen[key] = 1;
      /* the bridge leaves from the two points that already face each other */
      var bestA = cl.pts[0], bestB = clusters[oi].pts[0], best = Infinity;
      cl.pts.forEach(function (a) {
        clusters[oi].pts.forEach(function (b) {
          var d = dist(a, b);
          if (d < best) { best = d; bestA = a; bestB = b; }
        });
      });
      var pick = rand();
      var rgb = pick < 0.12 ? AMBER : pick < 0.30 ? TEAL : MARK;
      bridges.push({
        a: bestA, b: bestB,
        len: best,
        k: (0.14 + rand() * 0.12) * (rand() < 0.5 ? -1 : 1),
        fill: fogPrefix(rgb, (clusters[ci].z + clusters[oi].z) * 0.5),
        ord: 0
      });
    });
  });

  /* Near bridges first, the long reach across the page last. */
  bridges.sort(function (m, n) { return m.len - n.len; });
  bridges.forEach(function (l, i) { l.ord = bridges.length > 1 ? i / (bridges.length - 1) : 0; });

  /* ---------- chapters ----------
     weave: how much of the inside of each huddle is drawn.
     bridge: how much of the between is drawn.
     settle: damps the drift, so a connected field holds still.
     pull: the huddles lean a little toward each other once linked.
     lift: the whole field rises slowly as the page is read. */

  var CH = [
    { weave: 0.06, bridge: 0.00, settle: 0.00, pull: 0.00, zoom: 1.000, lift: 0 },
    { weave: 0.92, bridge: 0.20, settle: 0.40, pull: 0.30, zoom: 1.030, lift: 14 },
    { weave: 1.00, bridge: 1.00, settle: 0.88, pull: 0.62, zoom: 1.062, lift: 26 }
  ];

  var sections = document.querySelectorAll('[data-scene]');
  var anchors = [];
  var maxScrollV = 1;

  function measure() {
    maxScrollV = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    anchors = Array.prototype.map.call(sections, function (el, idx) {
      if (idx === 0) return 0;
      if (idx === sections.length - 1) return maxScrollV;
      return clamp(el.offsetTop + el.offsetHeight * 0.5 - window.innerHeight * 0.5, 0, maxScrollV);
    });
    if (anchors.length < 2) anchors = [0, maxScrollV];
    for (var j = 1; j < anchors.length; j++) anchors[j] = Math.max(anchors[j], anchors[j - 1] + 1);
  }

  function progressAt(y) {
    y = clamp(y, 0, maxScrollV);
    var span = CH.length - 1;
    var steps = anchors.length - 1;
    if (y <= anchors[0]) return 0;
    for (var j = 0; j < steps; j++) {
      if (y <= anchors[j + 1]) {
        var t = clamp((y - anchors[j]) / Math.max(1, anchors[j + 1] - anchors[j]), 0, 1);
        return (j + t) * (span / steps);
      }
    }
    return span;
  }

  function worldAt(p) {
    var i = clamp(Math.floor(p), 0, CH.length - 1);
    var n = Math.min(CH.length - 1, i + 1);
    var t = smooth01(p - i);
    var a = CH[i], b = CH[n];
    return {
      weave: lerp(a.weave, b.weave, t),
      bridge: lerp(a.bridge, b.bridge, t),
      settle: lerp(a.settle, b.settle, t),
      pull: lerp(a.pull, b.pull, t),
      zoom: lerp(a.zoom, b.zoom, t),
      lift: lerp(a.lift, b.lift, t)
    };
  }

  /* ---------- drawing ---------- */

  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  /* Text sits in a 1100px column down the middle of the page, so the field
     quiets there and keeps its life in the margins. Contrast in the reading
     column is left alone. */
  function columnMul(x) {
    var half = Math.min(1100, w) * 0.5;
    var d = clamp(Math.abs(x - w * 0.5) / Math.max(1, half), 0, 1);
    return lerp(0.5, 1, smooth01(d));
  }

  /* A phone has no margin to hold the field, so every huddle sits behind the
     copy. There the world opens up and quiets down rather than crowding in. */
  function unitPx() {
    return clamp(Math.min(w, h) * (w < 720 ? 0.118 : 0.085), 34, 96);
  }
  function quietMul() { return w < 720 ? 0.6 : 1; }

  function place(T, world) {
    var U = unitPx();
    var driftK = lerp(1, 0.28, world.settle);
    var fx = w * 0.5, fy = h * 0.5;

    clusters.forEach(function (cl) {
      cl.cu = lerp(cl.u, 0.5, world.pull * 0.10);
      cl.cv = lerp(cl.v, 0.5, world.pull * 0.08);
    });

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cl = clusters[p.c];
      var x = cl.cu * w + p.ox * U + Math.sin(T * p.r1 + p.p1) * p.amp * U * driftK;
      var y = cl.cv * h + p.oy * U + Math.cos(T * p.r2 + p.p2) * p.amp * U * driftK - world.lift;
      /* parallax is a few pixels, weighted by depth, and only on a fine pointer */
      var dep = 1 - 0.55 * p.z;
      x += parX * dep;
      y += parY * dep;
      p.x = fx + (x - fx) * world.zoom;
      p.y = fy + (y - fy) * world.zoom;
    }
  }

  var SAMPLES = 14;

  function strokeLink(l, t, base) {
    var a = pts[l.a], b = pts[l.b];
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    /* The control point sits off the midpoint, so every link is a curve that
       could have been drawn by hand and never a blueprint straight. The offset
       is capped, so a long reach across the page bows rather than sweeps. */
    var off = Math.min(Math.abs(len * l.k), 74) * (l.k < 0 ? -1 : 1);
    var qx = (a.x + b.x) * 0.5 + (-dy / len) * off;
    var qy = (a.y + b.y) * 0.5 + (dx / len) * off;

    var alpha = base * quietMul() * columnMul((a.x + b.x) * 0.5) * (0.35 + 0.65 * t);
    if (alpha < 0.01) return;

    ctx.strokeStyle = l.fill + alpha.toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    if (t >= 1) {
      ctx.quadraticCurveTo(qx, qy, b.x, b.y);
    } else {
      for (var s = 1; s <= SAMPLES; s++) {
        var e = (s / SAMPLES) * t;
        var ie = 1 - e;
        ctx.lineTo(
          ie * ie * a.x + 2 * ie * e * qx + e * e * b.x,
          ie * ie * a.y + 2 * ie * e * qy + e * e * b.y
        );
      }
    }
    ctx.stroke();
  }

  var BAND = 0.24;

  function drawGroup(list, prog, base) {
    for (var i = 0; i < list.length; i++) {
      var l = list[i];
      var t = clamp((prog - l.ord * (1 - BAND)) / BAND, 0, 1);
      if (t <= 0) continue;
      strokeLink(l, t, base);
    }
  }

  function render(T, world) {
    place(T, world);
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    drawGroup(intra, smooth01(world.weave), 0.26);
    drawGroup(bridges, smooth01(world.bridge), 0.34);

    var U = unitPx();
    var lit = lerp(0.74, 1, world.weave);
    var quiet = quietMul();

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var r = U * 0.026 * p.size * (1.15 - 0.45 * p.z) * (1 + Math.sin(T * 0.4 + p.breath) * 0.05);
      var alpha = 0.42 * lit * quiet * columnMul(p.x);
      if (alpha < 0.01) continue;
      ctx.fillStyle = p.fill + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  measure();

  if (reduce) {
    var still = worldAt(CH.length - 1);
    render(24, still);
    var sT;
    window.addEventListener('resize', function () {
      clearTimeout(sT);
      sT = setTimeout(function () {
        sizeCanvas();
        measure();
        render(24, still);
      }, 140);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  var exact = 0, smoothP = 0;

  function readScroll() { exact = progressAt(window.scrollY || 0); }
  readScroll();
  smoothP = exact;

  /* Anchors go stale while fonts and images settle the layout, so the page is
     measured again once it is actually done and once more after it paints. */
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
    render(now / 1000, worldAt(smoothP));
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', readScroll, { passive: true });

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      sizeCanvas();
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
