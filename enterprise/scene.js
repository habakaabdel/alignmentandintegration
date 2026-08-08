/* The blueprint resolving. One persistent Three.js world behind the
   enterprise page. A wide sparse field of faint node marks drifts in three
   dimensions at the top of the page, the raw sprawl of a large operation, and
   as the visitor scrolls the marks take their places on a layered schematic
   while orthogonal hairline runs draw themselves from the root outward. Every
   connection is a right angle and every position is snapped to a half unit,
   because this page's story is a measured drawing rather than a growth.

   Scroll is the conductor: the same scroll position always recreates the same
   state. A slow drift and a few degrees of pointer parallax are the only
   things that move at rest, which is what keeps the sheet from reading as a
   frozen image.

   Progressive enhancement only. The page is complete with this file absent,
   with WebGL unavailable, and under prefers-reduced-motion (one settled still
   frame is rendered instead of motion). Renderer is local:
   vendor/three.module.min.js */

(async function () {
  'use strict';

  var canvas = document.getElementById('page-scene');
  if (!canvas) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var THREE;
  try {
    THREE = await import('/vendor/three.module.min.js');
  } catch (err) {
    canvas.remove();
    return;
  }

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

  /* Nothing in this scene sits off the grid. Half a world unit is the sheet's
     smallest division and every settled position rounds to it. */
  var GRID = 0.5;
  function snap(v) { return Math.round(v / GRID) * GRID; }

  /* ---------- renderer ---------- */

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (err) {
    canvas.remove();
    return;
  }
  var DPR_CAP = coarse ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  var scene = new THREE.Scene();
  /* Fog in this page's paper colour, so depth reads as the sheet continuing
     past the edge of the drawing rather than as darkness. */
  var PAPER = 0xf2f4f5;
  scene.fog = new THREE.FogExp2(PAPER, 0.026);

  var camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 160);

  /* ---------- the schematic ---------- */

  /* Five ranks, widest at the bottom, one node at the top. Each rank lays its
     nodes out on a snapped grid, so the finished drawing reads as a hierarchy
     seen from a drafting table rather than as a cloud. Density scales with
     viewport area, the same rule the home page uses. */

  var areaK = clamp(Math.sqrt((window.innerWidth * window.innerHeight) / (1440 * 900)), 0.5, 1.3);

  var RANKS = [
    { n: 1, y: 6, spread: 0, mark: 0.42, tint: 0x1e3556 },
    { n: 4, y: 3, spread: 5.5, mark: 0.34, tint: 0x1e3556 },
    { n: 10, y: 0, spread: 11, mark: 0.28, tint: 0x2f4e7a },
    { n: Math.round(24 * areaK), y: -3, spread: 17, mark: 0.23, tint: 0x44618c },
    { n: Math.round(44 * areaK), y: -6, spread: 23.5, mark: 0.19, tint: 0x7288a8 }
  ];

  var slots = [];  /* every node, in rank order, with its settled place */

  RANKS.forEach(function (rank, ri) {
    var cols = Math.max(1, Math.round(Math.sqrt(rank.n * 1.7)));
    var rows = Math.ceil(rank.n / cols);
    var stepX = cols > 1 ? rank.spread / (cols - 1) : 0;
    var stepZ = rows > 1 ? (rank.spread * 0.52) / (rows - 1) : 0;
    for (var i = 0; i < rank.n; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      /* the jitter is itself snapped, so sprawl never costs the grid */
      var jx = snap((rand() - 0.5) * 1.6);
      var jz = snap((rand() - 0.5) * 1.6);
      slots.push({
        rank: ri,
        sx: snap(-rank.spread / 2 + c * stepX) + jx,
        sy: rank.y,
        sz: snap(-rank.spread * 0.26 + r * stepZ) + jz,
        mark: rank.mark,
        tint: rank.tint
      });
    }
  });

  /* ---------- the orthogonal runs ---------- */

  /* Every node below the root reports to its nearest node one rank up, and the
     route between them is drawn the way a schematic draws one: a riser, a run
     across, a run in depth, a riser. Nothing is diagonal in the world; a run in
     depth only reads as a slope because the camera has perspective, which is
     what an axonometric sheet does too. Each run is cut into short collinear
     pieces so that revealing the buffer by draw range reads as a line
     extending rather than a line appearing. */

  var segPositions = [];
  var PIECE = 0.45;

  function runTo(ax, ay, az, bx, by, bz) {
    var d = Math.hypot(bx - ax, by - ay, bz - az);
    if (d < 1e-4) return;
    var steps = Math.max(1, Math.round(d / PIECE));
    for (var s = 0; s < steps; s++) {
      var t0 = s / steps, t1 = (s + 1) / steps;
      segPositions.push(
        lerp(ax, bx, t0), lerp(ay, by, t0), lerp(az, bz, t0),
        lerp(ax, bx, t1), lerp(ay, by, t1), lerp(az, bz, t1)
      );
    }
  }

  (function route() {
    var byRank = RANKS.map(function () { return []; });
    slots.forEach(function (s) { byRank[s.rank].push(s); });

    for (var ri = 1; ri < byRank.length; ri++) {
      var parents = byRank[ri - 1];
      /* inner nodes first, so the drawing grows outward from the root */
      var kids = byRank[ri].slice().sort(function (a, b) {
        return (Math.abs(a.sx) + Math.abs(a.sz)) - (Math.abs(b.sx) + Math.abs(b.sz));
      });
      kids.forEach(function (k) {
        var best = parents[0], bestD = Infinity;
        parents.forEach(function (p) {
          var d = Math.abs(p.sx - k.sx) + Math.abs(p.sz - k.sz);
          if (d < bestD) { bestD = d; best = p; }
        });
        var midY = snap((k.sy + best.sy) / 2);
        runTo(k.sx, k.sy, k.sz, k.sx, midY, k.sz);
        runTo(k.sx, midY, k.sz, best.sx, midY, k.sz);
        runTo(best.sx, midY, k.sz, best.sx, midY, best.sz);
        runTo(best.sx, midY, best.sz, best.sx, best.sy, best.sz);
      });
    }
  })();

  var segCount = segPositions.length / 6;

  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(segPositions, 3));
  var lineMat = new THREE.LineBasicMaterial({ color: 0x2f4e7a, transparent: true, opacity: 0 });
  var lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.geometry.setDrawRange(0, 0);
  scene.add(lines);

  /* ---------- the sheet under the drawing ---------- */

  /* A plain reference grid below the lowest rank. It arrives with the runs and
     never gets brighter than a whisper, because its job is to say the drawing
     is sitting on something measured. */

  var sheetPositions = [];
  var EXT = 26, STEP = 4, SHEET_Y = -9;
  for (var g = -EXT; g <= EXT; g += STEP) {
    sheetPositions.push(g, SHEET_Y, -EXT, g, SHEET_Y, EXT);
    sheetPositions.push(-EXT, SHEET_Y, g, EXT, SHEET_Y, g);
  }
  var sheetGeo = new THREE.BufferGeometry();
  sheetGeo.setAttribute('position', new THREE.Float32BufferAttribute(sheetPositions, 3));
  var sheetMat = new THREE.LineBasicMaterial({ color: 0x7f8f9c, transparent: true, opacity: 0 });
  scene.add(new THREE.LineSegments(sheetGeo, sheetMat));

  /* ---------- the node marks ---------- */

  /* One drafting mark: a thin square with a filled centre. Alpha tested, so a
     few hundred of them sort correctly at any angle without a per-frame depth
     sort, and held square to the screen so the field always reads as notation
     rather than as confetti. */

  function markTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g2 = c.getContext('2d');
    g2.strokeStyle = '#fff';
    g2.lineWidth = 5;
    g2.strokeRect(13, 13, 38, 38);
    g2.fillStyle = '#fff';
    g2.fillRect(27, 27, 10, 10);
    var tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }

  var COUNT = slots.length;
  var markGeo = new THREE.PlaneGeometry(1, 1);
  var markMat = new THREE.MeshBasicMaterial({
    map: markTexture(), alphaTest: 0.35, transparent: true, opacity: 0.55, fog: true
  });
  var marks = new THREE.InstancedMesh(markGeo, markMat, COUNT);
  marks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(marks);

  var N = [];
  var color = new THREE.Color();
  for (var i = 0; i < COUNT; i++) {
    var s = slots[i];
    N.push({
      /* the sprawl: wide, three dimensional, nothing lined up with anything */
      bx: (rand() - 0.5) * 52,
      by: (rand() - 0.5) * 20 + 1,
      bz: (rand() - 0.5) * 34 - 3,
      r1: 0.04 + rand() * 0.07, p1: rand() * Math.PI * 2,
      r2: 0.03 + rand() * 0.06, p2: rand() * Math.PI * 2,
      r3: 0.04 + rand() * 0.06, p3: rand() * Math.PI * 2,
      /* the settled place on the schematic */
      sx: s.sx, sy: s.sy, sz: s.sz,
      /* the root resolves first and the widest rank last, so the sheet reads
         as being drafted outward rather than snapping into place at once */
      aOff: (s.rank / RANKS.length) * 0.34 + rand() * 0.06,
      scale: s.mark,
      breath: 0.04 + rand() * 0.06
    });
    color.setHex(s.tint);
    marks.setColorAt(i, color);
  }
  if (marks.instanceColor) marks.instanceColor.needsUpdate = true;

  /* ---------- chapters ---------- */

  /* Anchored to the tagged sections in document order.
     assemble: how much of the field has taken its place.
     link: how much of the schematic's own routing is drawn.
     calm: slows the drift and settles the sheet.
     The camera angle answers the same conductor, moving from a distant
     elevation, through a raised three quarter view, to the drafting table
     looking down on the finished ranks. */
  var CH = [
    { cam: [0, 2.0, 34], tgt: [0, 0.6, 0], world: { assemble: 0, link: 0, calm: 0 } },
    { cam: [9.5, 6.5, 29], tgt: [0, 0.8, 0], world: { assemble: 0.44, link: 0.16, calm: 0.2 } },
    { cam: [-8.5, 11, 24], tgt: [0, -0.6, 0], world: { assemble: 0.86, link: 0.62, calm: 0.55 } },
    { cam: [0, 4.2, 26], tgt: [0, 0.2, 0], world: { assemble: 1, link: 1, calm: 0.92 } }
  ];
  /* On a phone the same compositions pull back rather than crop. */
  var MOBILE_Z = 12, MOBILE_FOV = 46;

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
    for (var j = 1; j < anchors.length; j++) anchors[j] = Math.max(anchors[j], anchors[j - 1] + 1);
  }

  function progressAt(y) {
    if (!anchors.length) return 0;
    y = clamp(y, 0, maxScrollV);
    if (y <= anchors[0]) return 0;
    for (var j = 0; j < anchors.length - 1; j++) {
      if (y <= anchors[j + 1]) {
        return j + clamp((y - anchors[j]) / Math.max(1, anchors[j + 1] - anchors[j]), 0, 1);
      }
    }
    return anchors.length - 1;
  }

  var exact = 0, smoothP = 0;

  /* ---------- per-frame state ---------- */

  var pos = new THREE.Vector3();
  var sc = new THREE.Vector3();
  var mat4 = new THREE.Matrix4();
  var camTarget = new THREE.Vector3();
  var mouseX = 0, mouseY = 0, parX = 0, parY = 0;

  function worldAt(p) {
    var i = clamp(Math.floor(p), 0, CH.length - 1);
    var n = Math.min(CH.length - 1, i + 1);
    var t = smooth01(p - i);
    var a = CH[i], b = CH[n];
    return {
      assemble: lerp(a.world.assemble, b.world.assemble, t),
      link: lerp(a.world.link, b.world.link, t),
      calm: lerp(a.world.calm, b.world.calm, t),
      cx: lerp(a.cam[0], b.cam[0], t),
      cy: lerp(a.cam[1], b.cam[1], t),
      cz: lerp(a.cam[2], b.cam[2], t),
      tx: lerp(a.tgt[0], b.tgt[0], t),
      ty: lerp(a.tgt[1], b.tgt[1], t),
      tz: lerp(a.tgt[2], b.tgt[2], t)
    };
  }

  function render(T, w) {
    var narrow = window.innerWidth < 720;
    camera.fov = narrow ? MOBILE_FOV : 36;
    camera.position.set(w.cx + parX, w.cy + parY, w.cz + (narrow ? MOBILE_Z : 0));
    camTarget.set(w.tx, w.ty, w.tz);
    camera.lookAt(camTarget);
    camera.updateProjectionMatrix();

    var driftMul = lerp(1, 0.18, w.calm);

    for (var i = 0; i < COUNT; i++) {
      var m = N[i];
      var la = smooth01((w.assemble - m.aOff) / 0.66);

      /* loose: the wide slow wander of an operation nobody has drawn yet */
      var dx = m.bx + Math.sin(T * m.r1 + m.p1) * 2.4 * driftMul;
      var dy = m.by + Math.sin(T * m.r2 + m.p2) * 1.7 * driftMul;
      var dz = m.bz + Math.cos(T * m.r3 + m.p3) * 2.0 * driftMul;

      /* placed: its slot on the schematic, breathing just enough to stay alive */
      var gx = m.sx + Math.sin(T * 0.24 + m.p1) * m.breath;
      var gy = m.sy + Math.sin(T * 0.19 + m.p2) * m.breath;
      var gz = m.sz + Math.cos(T * 0.21 + m.p3) * m.breath;

      pos.set(lerp(dx, gx, la), lerp(dy, gy, la), lerp(dz, gz, la));
      sc.setScalar(m.scale * (0.72 + la * 0.28));
      mat4.compose(pos, camera.quaternion, sc);
      marks.setMatrixAt(i, mat4);
    }
    marks.instanceMatrix.needsUpdate = true;

    var linkEase = smooth01(w.link);
    lines.geometry.setDrawRange(0, Math.floor(segCount * linkEase) * 2);
    lineMat.opacity = Math.min(1, w.link * 2.2) * 0.27;
    sheetMat.opacity = Math.min(1, w.link * 1.6) * 0.10;

    renderer.render(scene, camera);
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  measure();

  if (reduce) {
    var still = worldAt(CH.length - 1);
    render(14, still);
    window.addEventListener('resize', function () {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      render(14, still);
    }, { passive: true });
    return;
  }

  /* ---------- live loop ---------- */

  function readScroll() {
    exact = progressAt(window.scrollY || 0);
  }
  readScroll();
  smoothP = exact;

  /* Anchors go stale as fonts and media settle layout; re-measure when the
     document is actually done, and once more after everything has painted. */
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
    parX = damp(parX, mouseX * 0.9, 4, dt);
    parY = damp(parY, mouseY * -0.5, 4, dt);
    render(now / 1000, worldAt(smoothP));
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', readScroll, { passive: true });

  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
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
