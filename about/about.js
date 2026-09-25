// The map, the tabs and the panels are one control. Without script every panel shows, stacked.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var levels = ['person', 'program', 'agency', 'region'];
  var panels = {}, tabs = {}, nodes = {};
  levels.forEach(function (l) {
    panels[l] = document.getElementById(l);
    tabs[l] = document.getElementById('tab-' + l);
    nodes[l] = document.querySelector('.map .node[data-level="' + l + '"]');
  });
  if (!panels.person || !tabs.person || !nodes.person) return;
  var current = null;

  function show(level, opts) {
    opts = opts || {};
    if (levels.indexOf(level) < 0) return;
    levels.forEach(function (l) {
      var on = l === level;
      panels[l].hidden = !on;
      tabs[l].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[l].tabIndex = on ? 0 : -1;
      nodes[l].classList.toggle('on', on);
    });
    current = level;
    if (opts.hash !== false && history.replaceState) history.replaceState(null, '', '#' + level);
    if (opts.focus) panels[level].focus({ preventScroll: true });
    if (opts.scroll) document.querySelector('.panels').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  var start = location.hash.replace('#', '');
  show(levels.indexOf(start) >= 0 ? start : 'agency', { hash: false });

  levels.forEach(function (l) {
    tabs[l].addEventListener('click', function () { show(l, { focus: true }); });
    nodes[l].addEventListener('click', function (ev) {
      ev.preventDefault();
      var narrow = window.matchMedia('(max-width: 56rem)').matches;
      show(l, { focus: !narrow, scroll: narrow });
    });
  });
  document.querySelector('.tabs').addEventListener('keydown', function (ev) {
    var i = levels.indexOf(current);
    if (ev.key === 'ArrowRight') { show(levels[(i + 1) % 4]); tabs[current].focus(); }
    if (ev.key === 'ArrowLeft') { show(levels[(i + 3) % 4]); tabs[current].focus(); }
  });
  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if (levels.indexOf(h) >= 0) show(h, { hash: false });
  });
})();
