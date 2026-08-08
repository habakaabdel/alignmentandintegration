/* The ecosystem. One persistent Three.js world behind the home page.
   Hundreds of organic motes drift as a scattered field at the top of the
   page and assemble, chapter by chapter, into one calm branching structure
   as the visitor scrolls: the raw complexity of an operation resolving into
   the thing that gets built. Scroll is the only conductor; the same scroll
   position always recreates the same state.

   Progressive enhancement only. The page is complete with this file absent,
   with WebGL unavailable, and under prefers-reduced-motion (one settled
   still frame is rendered instead of motion).

   Scroll-conductor pattern adapted from MengTo/Skills
   build-threejs-scroll-worlds (MIT). Renderer is local: vendor/three.module.min.js */

(async function () {
  'use strict';

  var canvas = document.getElementById('eco');
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
  /* Fog in the paper colour: depth reads as the field fading into the page
     ground rather than into darkness. */
  var PAPER = 0xf7f6f2;
  scene.fog = new THREE.FogExp2(PAPER, 0.030);

  var camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 120);

  /* ---------- the branching structure ---------- */

  /* A deterministic organic skeleton: one trunk, recursive limbs. Its sampled
     points are where motes settle; its segments are the paths that get drawn
     as connections while the page tells the assembly story. */

  var skelPts = [];      /* Vector3 sample points along every branch */
  var segPositions = []; /* flat xyz pairs, recursion order = trunk outward */

  (function grow() {
    var up = new THREE.Vector3(0, 1, 0);

    function branch(origin, dir, len, width, depth) {
      var steps = Math.max(3, Math.round(len / 0.5));
      var p = origin.clone();
      var d = dir.clone().normalize();
      var prev = p.clone();
      for (var i = 0; i < steps; i++) {
        /* wander, with a gentle pull upward so the whole thing reads as growth */
        d.x += (rand() - 0.5) * 0.34;
        d.z += (rand() - 0.5) * 0.34;
        d.y += 0.10;
        d.normalize();
        p.addScaledVector(d, len / steps);
        skelPts.push(p.clone());
        segPositions.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
        prev = p.clone();
      }
      if (depth >= 3) return;
      var kids = depth === 0 ? 4 : (rand() < 0.6 ? 2 : 3);
      for (var k = 0; k < kids; k++) {
        var axis = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
        var child = d.clone().applyAxisAngle(axis, 0.55 + rand() * 0.75);
        if (child.dot(up) < -0.1) child.y = Math.abs(child.y) * 0.4;
        branch(p, child, len * (0.55 + rand() * 0.2), width * 0.6, depth + 1);
      }
    }

    branch(new THREE.Vector3(0, -4, 0), up, 7.5, 1, 0);
  })();

  var segCount = segPositions.length / 6;

  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(segPositions, 3));
  var lineMat = new THREE.LineBasicMaterial({ color: 0x2d4a3e, transparent: true, opacity: 0 });
  var lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.geometry.setDrawRange(0, 0);
  scene.add(lines);

  /* ---------- the motes ---------- */

  /* Leaf sprite: one white silhouette, tinted per instance. Alpha-tested so
     the field sorts correctly at any angle without a per-frame depth sort. */
  function leafTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(32, 2);
    g.bezierCurveTo(54, 18, 56, 44, 32, 62);
    g.bezierCurveTo(8, 44, 10, 18, 32, 2);
    g.fill();
    var tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }

  /* Density scales with viewport area so a drift on desktop does not arrive
     as a blizzard on a phone. */
  var areaK = clamp(Math.sqrt((window.innerWidth * window.innerHeight) / (1440 * 900)), 0.5, 1.3);
  var COUNT = Math.round(560 * areaK);

  /* The organic ramp: sage greens carry it, dry amber and deep rose are sparse. */
  var RAMP = [
    [0x2d4a3e, 3], [0x3a5a40, 2.4], [0x6f8f66, 2], [0x87a07a, 1.4],
    [0xa9814a, 1.4], [0x7d3650, 0.6], [0x1f5f5b, 1]
  ];
  var rampBag = [];
  RAMP.forEach(function (r) { for (var i = 0; i < r[1] * 10; i++) rampBag.push(r[0]); });

  var leafGeo = new THREE.PlaneGeometry(1, 1.35);
  var leafMat = new THREE.MeshBasicMaterial({
    map: leafTexture(), alphaTest: 0.5, side: THREE.DoubleSide, fog: true
  });
  var motes = new THREE.InstancedMesh(leafGeo, leafMat, COUNT);
  motes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(motes);

  var M = [];
  var color = new THREE.Color();
  for (var i = 0; i < COUNT; i++) {
    var sp = skelPts[Math.floor(rand() * skelPts.length)];
    M.push({
      /* the scattered life */
      bx: (rand() - 0.5) * 30 + 2.5,
      by: (rand() - 0.5) * 13 + 2.5,
      bz: (rand() - 0.5) * 20 - 2,
      r1: 0.05 + rand() * 0.09, p1: rand() * Math.PI * 2,
      r2: 0.04 + rand() * 0.08, p2: rand() * Math.PI * 2,
      r3: 0.05 + rand() * 0.07, p3: rand() * Math.PI * 2,
      /* the settled place */
      sx: sp.x + (rand() - 0.5) * 0.9,
      sy: sp.y + (rand() - 0.5) * 0.9,
      sz: sp.z + (rand() - 0.5) * 0.9,
      /* tumble: spin turns the leaf through the plane (it thins to an edge),
         roll turns it within the plane, slip rides the spin angle */
      spinR: (0.35 + rand() * 0.9) * (rand() < 0.5 ? -1 : 1),
      rollR: (0.2 + rand() * 0.6) * (rand() < 0.5 ? -1 : 1),
      yaw: rand() * Math.PI * 2,
      phase: rand() * Math.PI * 2,
      slip: 0.5 + rand() * 1.3,
      scale: 0.10 + rand() * 0.13,
      aOff: rand() * 0.3,
      breath: 0.05 + rand() * 0.10
    });
    color.setHex(rampBag[Math.floor(rand() * rampBag.length)]);
    motes.setColorAt(i, color);
  }
  if (motes.instanceColor) motes.instanceColor.needsUpdate = true;

  /* ---------- chapters ---------- */

  /* Anchored to the tagged sections in document order.
     assemble: how much of the field has settled onto the structure.
     link: how much of the structure's own paths are drawn.
     calm: slows the tumble and shrinks the drift. */
  var CH = [
    { cam: [0, 2.2, 27],    tgt: [0, 1.6, 0], fov: 38, world: { assemble: 0,    link: 0.02, calm: 0   } },
    { cam: [6, 3.2, 22.5],  tgt: [0, 2.0, 0], fov: 38, world: { assemble: 0.16, link: 0.2,  calm: 0.1 } },
    { cam: [-7.5, 4.4, 19], tgt: [0, 2.4, 0], fov: 38, world: { assemble: 0.45, link: 0.45, calm: 0.3 } },
    { cam: [7, 5.2, 16],    tgt: [0, 3.0, 0], fov: 38, world: { assemble: 0.72, link: 0.72, calm: 0.5 } },
    { cam: [0, 4.8, 14],    tgt: [0, 4.4, 0], fov: 38, world: { assemble: 1,    link: 1,    calm: 0.85} },
    { cam: [0, 7.5, 21],    tgt: [0, 4.2, 0], fov: 38, world: { assemble: 1,    link: 0.9,  calm: 1   } }
  ];
  /* On a phone the same compositions pull back rather than crop. */
  var MOBILE_Z = 7, MOBILE_FOV = 46;

  var sections = document.querySelectorAll('[data-eco]');
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

  var euler = new THREE.Euler();
  var quat = new THREE.Quaternion();
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
    camera.fov = narrow ? MOBILE_FOV : 38;
    camera.position.set(w.cx + parX, w.cy + parY, w.cz + (narrow ? MOBILE_Z : 0));
    camTarget.set(w.tx, w.ty, w.tz);
    camera.lookAt(camTarget);
    camera.updateProjectionMatrix();

    var calmMul = lerp(1, 0.22, w.calm);

    for (var i = 0; i < COUNT; i++) {
      var m = M[i];
      var la = smooth01((w.assemble - m.aOff) / 0.7);

      var spin = m.spinR * T * calmMul + m.phase;
      var roll = m.rollR * T * calmMul + m.phase * 0.7;

      /* scattered: drift plus the sideways slip a leaf takes edge-on */
      var dx = m.bx + Math.sin(T * m.r1 + m.p1) * 2.0 + Math.sin(spin) * m.slip * 0.55 * (1 - w.calm);
      var dy = m.by + Math.sin(T * m.r2 + m.p2) * 1.5;
      var dz = m.bz + Math.cos(T * m.r3 + m.p3) * 1.8;

      /* settled: its place on the structure, breathing */
      var gx = m.sx + Math.sin(T * 0.35 + m.p1) * m.breath;
      var gy = m.sy + Math.sin(T * 0.28 + m.p2) * m.breath;
      var gz = m.sz + Math.cos(T * 0.31 + m.p3) * m.breath;

      pos.set(lerp(dx, gx, la), lerp(dy, gy, la), lerp(dz, gz, la));
      euler.set(spin, m.yaw, roll);
      quat.setFromEuler(euler);
      sc.setScalar(m.scale * (1 + la * 0.35));
      mat4.compose(pos, quat, sc);
      motes.setMatrixAt(i, mat4);
    }
    motes.instanceMatrix.needsUpdate = true;

    var linkEase = smooth01(w.link);
    lines.geometry.setDrawRange(0, Math.floor(segCount * linkEase) * 2);
    lineMat.opacity = Math.min(1, w.link * 2.2) * 0.5;

    renderer.render(scene, camera);
  }

  /* ---------- reduced motion: one settled still frame ---------- */

  measure();

  if (reduce) {
    var stillState = worldAt(CH.length - 1);
    render(20, stillState);
    window.addEventListener('resize', function () {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      render(20, stillState);
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
    parX = damp(parX, mouseX * 0.7, 4, dt);
    parY = damp(parY, mouseY * -0.4, 4, dt);
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
