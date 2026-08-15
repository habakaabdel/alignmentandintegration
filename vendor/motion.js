/* ============================================================================
   scroll-motion-kit -- the JS half
   Requires gsap, ScrollTrigger, ScrollSmoother (all free since GSAP 3.13).

   Everything editable lives in MOTION below. Change values there, never in the
   body of the functions. Call Motion.init() after the DOM is ready, or pass an
   override object: Motion.init({ smooth: 2, reveal: { stagger: .2 } }).
   ========================================================================== */

var MOTION = {

  /* -- ScrollSmoother ------------------------------------------------------ */
  smooth: 1.5,              // seconds of catch-up. 1 is brisk, 2 is syrup, 0 disables
  effects: true,            // read data-speed / data-lag straight off the markup
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',

  /* -- Section reveal ------------------------------------------------------ */
  reveal: {
    enabled: true,
    scope: 'section',       // one timeline per match
    targets: '.head > *, [data-reveal], .card, .btn, h2, h3, p, li, blockquote, pre',
    start: 'top 75%',       // ScrollTrigger start. 'top 90%' fires later and calmer
    y: 25,                  // px travel. above ~40 it starts to read as thrown
    opacity: 0,
    duration: .5,
    stagger: .125,          // between siblings. 0 fires them as one block
    ease: 'power4.out',
    skipNestedIn: '.animating'  // guard: never animate inside an animating ancestor
  },

  /* -- Indexed lag on a card grid ------------------------------------------ */
  cardLag: {
    enabled: true,
    selector: '.card',
    speed: 1,
    lagStep: .125           // card N lags N * lagStep. This is the liquid-grid feel
  },

  /* -- Blob morph ---------------------------------------------------------- */
  blob: {
    enabled: true,
    selector: '[data-blob]',
    points: 8,              // anchors around the ring. 6 is lumpy, 12 is nearly round
    radius: [58, 98],       // min/max radius within a 220 viewBox
    duration: [2, 5],       // randomised PER BLOB. sharing one duration reads as a spinner
    ease: 'power1.inOut',
    size: 220               // viewBox edge; centre is size/2
  },

  /* -- Ghost type ---------------------------------------------------------- */
  ghost: {
    // CSS owns the animation. These only matter if you retune at runtime.
    offsetEm: .125,
    strokePx: 2
  }
};

var Motion = (function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function merge(base, over) {
    if (!over) return base;
    var out = {}, k;
    for (k in base) out[k] = base[k];
    for (k in over) {
      out[k] = (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]))
        ? merge(base[k] || {}, over[k]) : over[k];
    }
    return out;
  }

  /* ---- blob geometry: both paths share a command structure, so a plain
     attr tween on d interpolates them. No MorphSVG needed. --------------- */
  function ring(n, min, max, seed) {
    var r = [], s = seed;
    for (var i = 0; i < n; i++) {
      s = (s * 9301 + 49297) % 233280;
      r.push(min + (s / 233280) * (max - min));
    }
    return r;
  }

  function blobPath(radii, cx, cy) {
    var n = radii.length, pts = [], i;
    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * radii[i], cy + Math.sin(a) * radii[i]]);
    }
    var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' +
                   c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' +
                   p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d + ' Z';
  }

  /* Build an <svg> blob. seed makes it deterministic, so a rebuild does not
     reshuffle the page. */
  function makeBlob(cfg, seed) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + cfg.size + ' ' + cfg.size);
    var path = document.createElementNS(ns, 'path');
    var c = cfg.size / 2;
    path.setAttribute('d', blobPath(ring(cfg.points, cfg.radius[0], cfg.radius[1], seed), c, c));
    svg.appendChild(path);
    return { svg: svg, path: path, to: ring(cfg.points, cfg.radius[0], cfg.radius[1], seed * 7 + 13) };
  }

  /* Live handles, so every knob stays adjustable after init instead of being
     frozen at whatever was passed in. */
  var live = { config: null, smoother: null, blobTweens: [], lagTriggers: [] };

  function morphBlob(made, cfg) {
    if (reduced) return;
    var tw = gsap.to(made.path, {
      attr: { d: blobPath(made.to, cfg.size / 2, cfg.size / 2) },
      duration: gsap.utils.random(cfg.duration[0], cfg.duration[1]),
      repeat: -1, yoyo: true, ease: cfg.ease
    });
    live.blobTweens.push(tw);
    return tw;
  }

  function init(overrides) {
    var C = merge(MOTION, overrides);
    live.config = C;
    document.documentElement.classList.add('js-motion');

    /* blobs first: they render with or without scroll motion */
    if (C.blob.enabled) {
      Array.prototype.forEach.call(document.querySelectorAll(C.blob.selector), function (host, i) {
        var seed = parseInt(host.getAttribute('data-blob'), 10) || (i + 1) * 17;
        var made = makeBlob(C.blob, seed);
        host.appendChild(made.svg);
        morphBlob(made, C.blob);
      });
    }

    if (reduced) return { smoother: null, reduced: true };

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    gsap.config({ nullTargetWarn: false });

    var smoother = null;
    try {
      smoother = ScrollSmoother.create({
        wrapper: C.wrapper, content: C.content,
        smooth: C.smooth, effects: C.effects
      });
    } catch (err) {
      /* wrapper missing or plugin unavailable: fall through to native scroll */
    }

    live.smoother = smoother;
    applyCardLag(C);

    if (C.reveal.enabled) {
      Array.prototype.forEach.call(document.querySelectorAll(C.reveal.scope), function (scope) {
        var items = Array.prototype.slice.call(scope.querySelectorAll(C.reveal.targets))
          .filter(function (el) { return !el.closest(C.reveal.skipNestedIn); });
        if (!items.length) return;
        gsap.from(items, {
          y: C.reveal.y, opacity: C.reveal.opacity,
          duration: C.reveal.duration, stagger: C.reveal.stagger, ease: C.reveal.ease,
          scrollTrigger: { trigger: scope, start: C.reveal.start }
        });
      });
    }

    return { smoother: smoother, reduced: false, config: C };
  }

  /* ---- everything below keeps the knobs live after init ------------------ */

  function applyCardLag(C) {
    live.lagTriggers.forEach(function (st) { st.kill(); });
    live.lagTriggers = [];
    if (!live.smoother || !C.cardLag.enabled) return;
    if (!document.querySelector(C.cardLag.selector)) return;
    var made = live.smoother.effects(C.cardLag.selector, {
      speed: C.cardLag.speed,
      lag: function (i) { return i * C.cardLag.lagStep; }
    });
    live.lagTriggers = made || [];
  }

  /* Retune ghost type. Pass a selector or element; omit it to retune every
     ghost line on the page. Values are em and px. */
  function tuneGhost(target, offsetEm, strokePx) {
    var els = typeof target === 'string' ? document.querySelectorAll(target)
            : target ? [target] : document.querySelectorAll('.ghost-line');
    Array.prototype.forEach.call(els, function (el) {
      if (offsetEm != null) el.style.setProperty('--ghost-offset', offsetEm + 'em');
      if (strokePx != null) el.style.setProperty('--ghost-stroke-w', strokePx + 'px');
    });
  }

  /* The main runtime knob. Pass any slice of the config; it merges into the
     live one and applies immediately where the mechanic allows it.

       Motion.tune({ smooth: 2.4 });
       Motion.tune({ blob: { duration: [1, 3] } });
       Motion.tune({ cardLag: { lagStep: .25 } });
       Motion.tune({ ghost: { offsetEm: .2, strokePx: 3 } });

     Reveal values (y, duration, stagger, start) take effect on the next
     replay or on timelines built after the call -- already-played timelines
     are done and are not rewound. */
  function tune(partial) {
    if (!live.config) live.config = merge(MOTION, null);
    var C = live.config = merge(live.config, partial);

    if (partial && partial.smooth != null && live.smoother) live.smoother.smooth(C.smooth);
    if (partial && partial.cardLag) applyCardLag(C);
    if (partial && partial.ghost) tuneGhost(null, C.ghost.offsetEm, C.ghost.strokePx);
    if (partial && partial.blob && partial.blob.duration) {
      live.blobTweens.forEach(function (tw) {
        tw.duration(gsap.utils.random(C.blob.duration[0], C.blob.duration[1]));
      });
    }
    return C;
  }

  /* Replay a reveal on demand -- after a filter change, a tab switch, a route
     change, or just to see the current numbers land. */
  function replay(selector, overrides) {
    var base = (live.config || MOTION).reveal;
    var C = merge(base, overrides);
    gsap.fromTo(selector,
      { y: C.y, opacity: C.opacity },
      { y: 0, opacity: 1, duration: C.duration, stagger: C.stagger, ease: C.ease, overwrite: true });
  }

  function config() { return live.config || MOTION; }

  /* Emit the current tuning as an Motion.init() call, ready to paste into a
     build. Only the knobs that moved off the starting values are included. */
  function snippet() {
    var C = config(), out = {}, changed = false;
    function diff(path, now, then) {
      if (Array.isArray(now) ? now.join() !== then.join() : now !== then) {
        var seg = path.split('.'), node = out, i;
        for (i = 0; i < seg.length - 1; i++) node = (node[seg[i]] = node[seg[i]] || {});
        node[seg[seg.length - 1]] = now;
        changed = true;
      }
    }
    diff('smooth', C.smooth, MOTION.smooth);
    ['y', 'duration', 'stagger', 'start'].forEach(function (k) {
      diff('reveal.' + k, C.reveal[k], MOTION.reveal[k]);
    });
    diff('cardLag.lagStep', C.cardLag.lagStep, MOTION.cardLag.lagStep);
    diff('blob.duration', C.blob.duration, MOTION.blob.duration);
    diff('ghost.offsetEm', C.ghost.offsetEm, MOTION.ghost.offsetEm);
    diff('ghost.strokePx', C.ghost.strokePx, MOTION.ghost.strokePx);
    return changed
      ? 'Motion.init(' + JSON.stringify(out, null, 2) + ');'
      : 'Motion.init();';
  }

  return {
    init: init, tune: tune, tuneGhost: tuneGhost, replay: replay,
    config: config, snippet: snippet,
    blobPath: blobPath, ring: ring, reduced: reduced
  };
})();
