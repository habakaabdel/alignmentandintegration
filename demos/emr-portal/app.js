/* Riverbend Family Services staff portal - static demonstration.
   Plain HTML, CSS and JavaScript. No build step, no framework, no network
   request of any kind: the portal renders entirely from data.js.
   The original of this pattern is a single page app with a hash router; the
   router, the search index, the guide tab shell and the theme handling are
   all reproduced here in vanilla JavaScript. */

(function () {
  'use strict';

  /* ---------------- helpers ---------------- */

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function icon(name, size, extra) {
    const body = ICON[name] || ICON.FileText;
    const s = size || 18;
    const fill = name === 'Play' ? 'currentColor' : 'none';
    const stroke = name === 'Play' ? 'none' : 'currentColor';
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="' + fill +
      '" stroke="' + stroke + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"' +
      (extra ? ' style="' + extra + '"' : '') + ' aria-hidden="true">' + body + '</svg>';
  }

  const LOGO = '<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="22" fill="var(--primary)"/>' +
    '<path d="M8 32c6 0 6-8 12-8s6 8 12 8 8-4 8-4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M10 20c5 0 5-6 10-6s5 6 10 6 6-3 6-3" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>' +
    '</svg>';

  const HERO_PATTERN = '<svg class="hero-pattern" viewBox="0 0 400 400" fill="none" aria-hidden="true">' +
    (function () {
      let out = '';
      for (let i = 0; i < 7; i++) {
        const r = 60 + i * 26;
        out += '<circle cx="200" cy="200" r="' + r + '" stroke="currentColor" stroke-width="1.4" fill="none"/>';
      }
      for (let i = 0; i < 5; i++) {
        const y = 130 + i * 36;
        out += '<path d="M20 ' + y + 'c50 0 50-26 100-26s50 26 100 26 60-14 160-14" stroke="currentColor" stroke-width="1.2" fill="none"/>';
      }
      return out;
    })() + '</svg>';

  const PROGRAMS_AVAILABLE = () => GUIDE_PROGRAMS.filter((p) => p.status === 'available');

  const MY_PROGRAM_KEY = 'riverbend-portal-my-program';
  const getMyProgram = () => localStorage.getItem(MY_PROGRAM_KEY) || '';
  const setMyProgram = (v) => {
    if (v) localStorage.setItem(MY_PROGRAM_KEY, v);
    else localStorage.removeItem(MY_PROGRAM_KEY);
  };

  /* ---------------- theme ---------------- */

  const THEME_KEY = 'riverbend-portal-theme';
  const applyTheme = (mode) => {
    const dark = mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  };
  let themeMode = localStorage.getItem(THEME_KEY) || 'system';
  applyTheme(themeMode);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (themeMode === 'system') applyTheme('system');
  });

  const THEME_ICON = {
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
    dark: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    system: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  };
  const THEME_LABEL = { system: 'Theme follows the device', light: 'Theme is light', dark: 'Theme is dark' };

  /* ---------------- modal ---------------- */

  let lastFocus = null;
  function openModal(title, bodyHtml) {
    closeModal();
    lastFocus = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'modal-overlay';
    wrap.id = 'modal-root';
    wrap.innerHTML =
      '<div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">' +
        '<button class="modal-close" data-close aria-label="Close">' + icon('X', 18) + '</button>' +
        '<h2 id="modal-title">' + esc(title) + '</h2>' + bodyHtml +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('.modal-panel').focus();
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.closest('[data-close]')) closeModal();
    });
  }
  function closeModal() {
    const el = document.getElementById('modal-root');
    if (el) el.remove();
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  const DEMO_NOTICE =
    '<p>This is a demonstration build. It is a faithful copy of the portal\'s screens with ' +
    'fictional programs and fictional content, and it runs entirely in the browser with no ' +
    'connection to any case management system.</p>' +
    '<div style="margin-top:18px"><button class="btn btn-primary" data-close>Back to the portal</button></div>';

  /* ---------------- chrome ---------------- */

  const NAV = [
    { id: 'home', label: 'Home', href: '#/' },
    { id: 'program-guides', label: 'Program Guides', href: '#/program-guides' },
    { id: 'videos', label: 'Videos', href: '#/videos' },
    { id: 'onboarding', label: 'Onboarding', href: '#/onboarding' },
    { id: 'faq', label: 'FAQ', href: '#/faq' },
    { id: 'news', label: 'News', href: '#/news' },
  ];

  function headerHtml(current) {
    return '' +
    '<div class="demo-strip">' +
      '<div class="demo-strip-inner">' +
        '<p>DEMONSTRATION. FICTIONAL AGENCIES, FICTIONAL DATA.</p>' +
        '<span>A staff portal pattern by Alignment Integration</span>' +
      '</div>' +
    '</div>' +
    '<header class="topbar">' +
      '<a href="#main" class="skip-link" data-skip>Skip to content</a>' +
      '<div class="container topbar-inner">' +
        '<a href="#/" class="brand">' +
          '<div class="brand-logo">' + LOGO + '</div>' +
          '<div class="brand-text">' +
            '<div class="brand-title">EMR <span style="color:var(--accent-deep)">·</span> Staff Portal</div>' +
            '<div class="brand-sub">' + esc(AGENCY.name) + '</div>' +
          '</div>' +
        '</a>' +
        '<nav class="topnav" id="topnav">' +
          NAV.map((n) => '<a href="' + n.href + '"' + (current === n.id ? ' class="active"' : '') + '>' + esc(n.label) + '</a>').join('') +
        '</nav>' +
        '<div class="topbar-cta">' +
          '<button class="theme-toggle" data-theme-toggle title="' + THEME_LABEL[themeMode] + ', click to change" aria-label="' + THEME_LABEL[themeMode] + ', click to change">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + THEME_ICON[themeMode] + '</svg>' +
          '</button>' +
          '<button class="btn btn-primary" data-signin>Sign in<span class="hide-narrow"> to the EMR</span> ' + icon('ArrowRight', 16) + '</button>' +
          '<button class="nav-toggle" data-navtoggle aria-label="Open menu" aria-expanded="false">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</header>';
  }

  function footerHtml() {
    return '' +
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-col">' +
            '<div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">' +
              '<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;flex-shrink:0">' + LOGO + '</div>' +
              '<div>' +
                '<div style="font-family:var(--ff-display);font-size:17px;color:#fff">' + esc(AGENCY.name) + '</div>' +
                '<div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute)">' + esc(AGENCY.sub) + '</div>' +
              '</div>' +
            '</div>' +
            '<p style="font-size:13px;line-height:1.6;opacity:0.75;max-width:280px;margin:0">' +
              'The staff portal is an internal reference for Riverbend teams across ' + esc(AGENCY.region) + '. ' +
              'Every screen here is a demonstration.' +
            '</p>' +
          '</div>' +
          '<div class="footer-col"><h4>Resources</h4><ul>' +
            '<li><a href="#/program-guides">Program guides</a></li>' +
            '<li><a href="#/videos">Video tutorials</a></li>' +
            '<li><a href="#/faq">FAQ</a></li>' +
          '</ul></div>' +
          '<div class="footer-col"><h4>Get support</h4><ul>' +
            '<li><a href="#/troubleshoot">Fix a problem</a></li>' +
            '<li><a href="#/onboarding">People and IT process</a></li>' +
            '<li><a href="#/news">What changed recently</a></li>' +
          '</ul></div>' +
          '<div class="footer-col"><h4>About this demo</h4><ul>' +
            '<li><a href="#/program-guides">How the EMR works</a></li>' +
            '<li><a href="../../">Alignment Integration</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<div>Demonstration build · fictional agency · no live data</div>' +
          '<div>EMR staff portal pattern</div>' +
        '</div>' +
      '</div>' +
    '</footer>';
  }

  function pageHeader(o) {
    const crumbs = (o.breadcrumb || []).map((b, i) =>
      (i > 0 ? '<span class="breadcrumb-sep">›</span>' : '') +
      (b.href ? '<a href="' + b.href + '">' + esc(b.label) + '</a>' : '<span>' + esc(b.label) + '</span>')
    ).join('');
    return '<div class="pageheader"><div class="container">' +
      (crumbs ? '<div class="breadcrumb">' + crumbs + '</div>' : '') +
      (o.eyebrow ? '<div class="eyebrow" style="margin-bottom:12px">' + esc(o.eyebrow) + '</div>' : '') +
      (o.title ? '<h1 class="display-lg" style="margin-bottom:12px;max-width:760px">' + esc(o.title) + '</h1>' : '') +
      (o.lede ? '<p class="lede" style="max-width:680px;margin:0">' + esc(o.lede) + '</p>' : '') +
      (o.children || '') +
      '</div></div>';
  }

  function supportCallout() {
    return '<section class="section-tight"><div class="container">' +
      '<div style="background:var(--surface-subtle);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px 32px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:space-between">' +
        '<div style="min-width:240px;flex:1">' +
          '<div class="eyebrow" style="margin-bottom:6px">Cannot find what you need?</div>' +
          '<div style="font-family:var(--ff-display);font-size:18px;color:var(--ink-heading);font-weight:600;line-height:1.4">' +
            'Send anything this portal does not answer to the support desk.</div>' +
        '</div>' +
        '<a href="#/troubleshoot" class="btn btn-primary">' + icon('LifeBuoy', 16) + ' Fix a problem</a>' +
      '</div>' +
    '</div></section>';
  }

  function programSelect(value) {
    return '<select class="select-custom" data-myprogram aria-label="Select your program" style="max-width:100%">' +
      '<option value="">My program: not set</option>' +
      PROGRAMS_AVAILABLE().map((p) =>
        '<option value="' + p.slug + '"' + (p.slug === value ? ' selected' : '') + '>' + esc(p.title) + '</option>'
      ).join('') +
    '</select>';
  }

  /* ---------------- search ---------------- */

  function buildIndex() {
    const out = [];
    PROGRAMS_AVAILABLE().forEach((p) => out.push({
      type: 'Program guide', title: p.title, desc: p.desc, href: '#/program-guides/' + p.slug, icon: 'BookOpen',
    }));
    VIDEOS.forEach((v) => out.push({ type: 'Video', title: v.title, desc: v.category, href: '#/videos', icon: 'Video' }));
    FAQ.forEach((f, i) => out.push({ type: 'FAQ', title: f.q, desc: f.a.slice(0, 90) + '…', href: '#/faq/' + i, icon: 'HelpCircle' }));
    SECTIONS.forEach((s) => out.push({ type: 'Section', title: s.title, desc: s.desc, href: s.href, icon: s.icon }));
    out.push({ type: 'Section', title: 'Fix a problem', desc: 'Troubleshooting, organised by symptom', href: '#/troubleshoot', icon: 'AlertTriangle' });
    PROGRAMS_AVAILABLE().forEach((p) => {
      const g = GUIDE_DATA[p.slug];
      if (!g) return;
      const base = '#/program-guides/' + p.slug;
      GUIDE_SECTION_LABELS.forEach((s) => out.push({ type: p.title, title: s.label, desc: 'Guide section', href: base + '/' + s.id, icon: 'BookOpen' }));
      (g.caseForms || []).forEach((f) => out.push({ type: p.title, title: f.form, desc: 'Case data form', href: base + '/case-forms', icon: 'FileText' }));
      g.activities.clientContact.filter((a) => a.unique).forEach((a) => out.push({ type: p.title, title: a.name, desc: 'Program specific activity', href: base + '/activities', icon: 'FileText' }));
      (g.reports || []).forEach((r) => out.push({ type: p.title, title: r.name, desc: 'Report', href: base + '/reports', icon: 'FileText' }));
    });
    return out;
  }
  const SEARCH_INDEX = buildIndex();

  function searchBar(big, placeholder) {
    return '<div class="search-holder" style="position:relative">' +
      '<div class="search-wrap"' + (big ? ' style="padding:4px 4px 4px 26px"' : '') + '>' +
        icon('Search', big ? 22 : 18, 'color:var(--ink-mute);flex-shrink:0') +
        '<input type="text" class="search-input" data-search placeholder="' + esc(placeholder) + '" aria-label="Search the portal"' +
          (big ? ' style="font-size:18px;padding:18px 0"' : '') + '>' +
        '<div class="search-kbd"><span class="kbd">Ctrl</span><span class="kbd">K</span></div>' +
      '</div>' +
      '<div class="search-results" data-results hidden></div>' +
    '</div>';
  }

  function runSearch(q) {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const scored = [];
    SEARCH_INDEX.forEach((r) => {
      const t = r.title.toLowerCase();
      if (t.indexOf(needle) === 0) scored.push([0, r]);
      else if (t.indexOf(needle) > -1) scored.push([1, r]);
      else if (r.desc && r.desc.toLowerCase().indexOf(needle) > -1) scored.push([2, r]);
    });
    scored.sort((a, b) => a[0] - b[0]);
    return scored.slice(0, 8).map((s) => s[1]);
  }

  /* ---------------- home ---------------- */

  function homePage() {
    const mySlug = getMyProgram();
    const mine = GUIDE_PROGRAMS.filter((p) => p.slug === mySlug)[0];
    const liveGuides = PROGRAMS_AVAILABLE().length;
    const meta = {
      'program-guides': liveGuides + ' program guides',
      videos: VIDEOS.length + ' modules',
      faq: FAQ.length + ' questions',
      news: 'Latest ' + NEWS[0].date.replace(', 2027', ''),
    };
    const tasks = [
      { icon: 'FileText', label: 'Document a client contact', href: mine ? '#/program-guides/' + mine.slug + '/document-contact' : '#/program-guides' },
      { icon: 'Clock', label: 'Log my workload time', href: mine ? '#/program-guides/' + mine.slug + '/document-workload' : '#/program-guides' },
      { icon: 'Paperclip', label: 'Add an attachment', href: mine ? '#/program-guides/' + mine.slug + '/attachments' : '#/program-guides' },
      { icon: 'BookOpen', label: mine ? 'Open the ' + mine.title.replace(/\s*\(.*\)$/, '') + ' guide' : 'Find my program guide', href: mine ? '#/program-guides/' + mine.slug : '#/program-guides' },
      { icon: 'AlertTriangle', label: 'Fix a problem', href: '#/troubleshoot' },
      { icon: 'KeyRound', label: 'Sign in to the EMR', signin: true },
    ];

    return '' +
    '<section class="hero">' +
      '<div class="hero-clip">' + HERO_PATTERN + '</div>' +
      '<div class="container"><div class="hero-grid">' +
        '<div>' +
          '<div class="eyebrow" style="margin-bottom:18px">Welcome, team</div>' +
          '<h1 class="display-xl">Everything <span class="hero-ani">EMR</span>, in one place.</h1>' +
          '<p class="lede" style="margin-top:20px;max-width:560px">Program guides, videos, and step by step help for the case management system. The working reference for every Riverbend program.</p>' +
          '<div style="margin-top:28px;max-width:600px">' + searchBar(true, 'Try "contact note" or "referral"…') + '</div>' +
          '<div style="margin-top:18px;display:flex;gap:20px;align-items:center;font-size:13px;color:var(--ink-mute);flex-wrap:wrap">' +
            '<span>Popular:</span>' +
            '<a href="#/program-guides" style="color:var(--primary);text-decoration:none;font-weight:600">My program guide</a>' +
            '<a href="#/videos" style="color:var(--primary);text-decoration:none;font-weight:600">Training videos</a>' +
            '<a href="#/troubleshoot" style="color:var(--primary);text-decoration:none;font-weight:600">Fix a problem</a>' +
          '</div>' +
        '</div>' +
        '<div><div class="signin-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">' +
            '<div>' +
              '<div class="signin-label">Riverbend EMR</div>' +
              '<div class="signin-date">Live across<br>all programs</div>' +
            '</div>' +
            '<div style="width:72px;height:72px;flex-shrink:0">' + LOGO + '</div>' +
          '</div>' +
          '<div style="margin-top:20px;padding:18px 16px;background:rgba(255,255,255,0.08);border-radius:var(--r-md);border:1px solid rgba(255,255,255,0.12);text-align:center">' +
            '<div style="font-family:var(--ff-display);font-size:24px;font-weight:500;color:#fff;margin-bottom:6px">One sign in</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.75)">Use your Riverbend work account.</div>' +
          '</div>' +
          '<button class="btn btn-primary" data-signin style="margin-top:16px;width:100%;justify-content:center">' + icon('KeyRound', 18) + ' Sign in to the EMR</button>' +
          '<div class="signin-note">' + icon('Sparkles', 16, 'color:var(--accent);flex-shrink:0') +
            '<span>This portal is the working reference: program guides, videos, FAQ, and support.</span></div>' +
        '</div></div>' +
      '</div></div>' +
    '</section>' +

    '<section class="section-tight" style="padding-top:0"><div class="container">' +
      '<div class="section-head" style="margin-bottom:18px">' +
        '<div class="section-head-left"><div class="eyebrow">I need to…</div></div>' +
        programSelect(mySlug) +
      '</div>' +
      '<div class="task-strip">' + tasks.map((t) =>
        (t.signin
          ? '<button class="task-card" data-signin style="text-align:left;width:100%">'
          : '<a href="' + t.href + '" class="task-card">') +
        '<span class="task-card-icon">' + icon(t.icon, 18) + '</span><span>' + esc(t.label) + '</span>' +
        icon('ArrowRight', 16, 'margin-left:auto;color:var(--ink-mute);flex-shrink:0') +
        (t.signin ? '</button>' : '</a>')
      ).join('') + '</div>' +
    '</div></section>' +

    '<section class="section reveal" style="padding-top:24px"><div class="container">' +
      '<div class="section-head"><div class="section-head-left">' +
        '<div class="eyebrow">Browse the portal</div>' +
        '<h2 class="display-md" style="margin-top:8px">Find what you need</h2>' +
      '</div></div>' +
      '<div class="tile-grid">' + SECTIONS.map((s) =>
        '<a href="' + s.href + '" class="tile tile-accent-' + s.accent + '">' +
          '<div class="tile-icon">' + icon(s.icon, 24) + '</div>' +
          '<div class="tile-title">' + esc(s.title) + '</div>' +
          '<div class="tile-desc">' + esc(s.desc) + '</div>' +
          '<div class="tile-meta"><span>' + esc(meta[s.id] || s.meta) + '</span>' +
          '<span class="tile-arrow">' + icon('ArrowRight', 16) + '</span></div>' +
        '</a>').join('') + '</div>' +
    '</div></section>' +

    '<section class="section-tight"><div class="container">' +
      '<div class="card" style="padding:0;overflow:hidden;background:var(--surface-subtle);border:1px solid var(--border);max-width:680px;margin:0 auto">' +
        '<div style="padding:24px 28px">' +
          '<div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-mute);font-weight:600;margin-bottom:8px">Fastest path</div>' +
          '<div style="font-family:var(--ff-display);font-size:22px;font-weight:700;margin-bottom:14px;line-height:1.2;color:var(--ink-heading)">New to the EMR? Start here.</div>' +
          '<div style="display:flex;flex-direction:column;gap:2px">' +
          [['1', 'Sign in with your Riverbend work account', '#/faq/0'],
           ['2', 'Watch the first four training modules', '#/videos'],
           ['3', 'Open your program guide', '#/program-guides'],
           ['4', 'Write your first contact note, steps are in your guide', '#/program-guides']]
            .map((s) => '<a href="' + s[2] + '" style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);text-decoration:none;color:var(--ink)">' +
              '<div style="width:26px;height:26px;border-radius:50%;background:var(--surface);border:1px solid var(--border);display:grid;place-items:center;font-size:12px;font-weight:600;flex-shrink:0;color:var(--primary)">' + s[0] + '</div>' +
              '<span style="flex:1;font-size:14px">' + esc(s[1]) + '</span>' + icon('ArrowRight', 16, 'color:var(--ink-mute)') +
            '</a>').join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></section>' +

    '<section class="section reveal"><div class="container">' +
      '<div class="section-head">' +
        '<div class="section-head-left"><div class="eyebrow">Latest news</div>' +
        '<h2 class="display-md" style="margin-top:8px">News & updates</h2></div>' +
        '<a href="#/news" class="btn btn-secondary">All announcements ' + icon('ArrowRight', 16) + '</a>' +
      '</div>' +
      '<div class="news-rail">' + NEWS.slice(0, 3).map((n) =>
        '<a href="#/news" class="news-item">' +
          '<span class="chip chip-cedar" style="align-self:flex-start">' + esc(n.tag) + '</span>' +
          '<div class="news-date">' + esc(n.date) + '</div>' +
          '<div class="news-title">' + esc(n.title) + '</div>' +
          '<div class="news-excerpt">' + esc(n.excerpt.slice(0, 150)) + '…</div>' +
        '</a>').join('') + '</div>' +
    '</div></section>' +

    '<section class="section-tight"><div class="container">' +
      '<div class="two-col-stack" style="background:var(--surface-subtle);border:1px solid var(--border);border-radius:var(--r-lg);padding:36px 40px;grid-template-columns:1fr auto;align-items:center">' +
        '<div>' +
          '<div class="eyebrow" style="margin-bottom:8px">Stuck on something?</div>' +
          '<h3 class="display-sm" style="margin-bottom:8px">Your question is not too small. Ask.</h3>' +
          '<p style="color:var(--ink-soft);margin:0;max-width:540px">The central intake team watches the support queue. Every question asked once gets answered here for the next person.</p>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><a href="#/troubleshoot" class="btn btn-primary">' + icon('LifeBuoy', 16) + ' Fix a problem</a></div>' +
      '</div>' +
    '</div></section>';
  }

  /* ---------------- program guides index ---------------- */

  function guidesIndexPage() {
    const mySlug = getMyProgram();
    const mine = GUIDE_PROGRAMS.filter((p) => p.slug === mySlug)[0];
    const liveCount = PROGRAMS_AVAILABLE().length;
    const H = (t) => '<h2 class="display-sm" style="margin-bottom:18px;padding-bottom:8px;border-bottom:2px solid var(--primary);display:inline-block">' + esc(t) + '</h2>';
    const tag = (kind) => 'font-size:9.5px;font-weight:800;letter-spacing:.05em;padding:2px 6px;border-radius:5px;flex-shrink:0;' +
      (kind === 'start'
        ? 'background:var(--primary-subtle);color:var(--primary-subtle-ink);border:1px solid var(--primary-subtle-border)'
        : 'background:var(--surface-subtle);color:var(--ink-mute);border:1px solid var(--border)');
    const lane = (sys, fnd, strm) =>
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:13px;text-align:center">' +
        '<div style="font-family:var(--ff-display);font-size:15px;font-weight:700;color:var(--ink)">' + esc(sys) + '</div>' +
        '<div style="font-size:12.5px;color:var(--ink-mute);margin-top:3px">' + esc(fnd) + '</div>' +
        '<div style="font-size:11.5px;color:var(--primary);font-weight:600;margin-top:6px">' + esc(strm) + '</div>' +
      '</div>';
    const spine = (t, d) =>
      '<div style="background:var(--surface-dark);border:1px solid var(--border-strong);border-radius:10px;padding:12px">' +
        '<div style="font-family:var(--ff-display);font-size:13.5px;font-weight:700;color:#fff;margin-bottom:3px">' + esc(t) + '</div>' +
        '<div style="font-size:12px;color:#A9B6BB;line-height:1.45">' + esc(d) + '</div>' +
      '</div>';

    return pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'Program Guides' }],
      eyebrow: 'The EMR · how it works',
      title: 'How the EMR Works',
      lede: 'Twenty one programs are really eight streams of the same handful of services, separated mostly by who funds them. Staff deliver one service to a client, the system records it once and reports it to each funder. Pick your program below to open its guide.',
    }) +
    '<section class="section"><div class="container">' +

      H('Every client moves through five stages of care') +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:48px">' +
        OVERVIEW_STAGES.map((s) =>
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px">' +
            '<div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.06em">' + esc(s.n) + '</div>' +
            '<div style="font-family:var(--ff-display);font-size:16px;font-weight:700;margin:2px 0 9px;color:var(--ink)">' + esc(s.t) + '</div>' +
            '<div style="font-size:12.5px;color:var(--ink-soft);display:flex;gap:6px;margin-bottom:5px;align-items:flex-start;line-height:1.35"><span style="' + tag('start') + '">START</span>' + esc(s.s) + '</div>' +
            '<div style="font-size:12.5px;color:var(--ink-soft);display:flex;gap:6px;align-items:flex-start;line-height:1.35"><span style="' + tag('end') + '">END</span>' + esc(s.e) + '</div>' +
          '</div>').join('') +
      '</div>' +

      H('Front doors, then central intake') +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:48px">' +
        '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 18px">' +
          '<div style="font-family:var(--ff-display);font-size:15px;font-weight:700;margin-bottom:10px">Front doors</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:7px">' +
          ['Walk in', 'Phone or verbal', 'Crisis line', 'Family and community',
           'Partners: Cedarline · Harbourlight · Northgate', 'Justice: probation, parole, court']
            .map((c) => '<span class="chip">' + esc(c) + '</span>').join('') +
          '</div></div>' +
        '<div style="background:var(--primary-subtle);border:2px solid var(--primary);border-radius:var(--r-lg);padding:16px 18px">' +
          '<div style="font-size:12px;font-weight:700;color:var(--primary-subtle-ink);letter-spacing:.04em;margin-bottom:6px">CENTRAL INTAKE</div>' +
          '<div style="font-family:var(--ff-display);font-size:15px;font-weight:700;margin-bottom:8px">One referral form, triage, route</div>' +
          '<div style="font-size:13.5px;color:var(--ink-soft);line-height:1.5">Verbal referrals are accepted and transcribed. Two programs keep their own direct intake: <strong>the HART Hub and residential youth treatment</strong>.</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between;background:var(--surface-subtle);border:1px solid var(--border-strong);border-radius:var(--r-lg);padding:18px 22px;margin-bottom:40px">' +
        (mine
          ? '<div style="min-width:220px;flex:1"><div class="eyebrow" style="margin-bottom:4px">Your program</div>' +
            '<div style="font-family:var(--ff-display);font-size:20px;color:var(--ink-heading);font-weight:700">' + esc(mine.title) + '</div></div>' +
            '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
            '<a href="#/program-guides/' + mine.slug + '" class="btn btn-primary">Open your guide ' + icon('ArrowRight', 16) + '</a>' + programSelect(mySlug) + '</div>'
          : '<div style="min-width:220px;flex:1"><div class="eyebrow" style="margin-bottom:4px">Make this page yours</div>' +
            '<div style="font-size:14px;color:var(--ink-soft)">Pick your program once and the portal opens your guide first, on every visit from this device.</div></div>' +
            programSelect(mySlug)) +
      '</div>' +

      H('The eight streams, pick your program') +
      '<p style="font-size:14px;color:var(--ink-mute);margin-top:-4px;margin-bottom:20px">' + liveCount +
        ' guides are live now, highlighted below. The rest open a placeholder until their guide is written.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:48px">' +
        STREAMS.map((st) => {
          const progs = GUIDE_PROGRAMS.filter((p) => p.stream === st.id);
          return '<div data-stream="' + st.id + '" class="stream-card" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 18px">' +
            '<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">' +
              '<span class="stream-letter" style="font-family:var(--ff-display);font-size:20px;font-weight:800;line-height:1">' + st.id + '</span>' +
              '<span style="font-family:var(--ff-display);font-size:15px;font-weight:700;color:var(--ink);line-height:1.2">' + esc(st.name) + '</span>' +
            '</div>' +
            '<div class="stream-chip" style="font-size:11px;border-radius:6px;padding:3px 8px;display:inline-block;margin-bottom:14px;letter-spacing:.02em">Reports to ' + esc(st.report) + '</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px">' +
              progs.map((p) =>
                '<a href="#/program-guides/' + p.slug + '" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:10px;text-decoration:none;border:1px solid var(--border);background:' +
                  (p.status === 'available' ? 'var(--primary-subtle)' : 'var(--surface)') + '">' +
                  '<span style="font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.35">' + esc(p.title) + '</span>' +
                  (p.status === 'available'
                    ? '<span style="font-size:10px;font-weight:700;color:var(--primary-subtle-ink);display:inline-flex;align-items:center;gap:3px;flex-shrink:0;letter-spacing:.04em">GUIDE READY ' + icon('ArrowRight', 12) + '</span>'
                    : '<span style="font-size:10px;font-weight:600;color:var(--ink-faint);flex-shrink:0;letter-spacing:.04em">SOON ›</span>') +
                '</a>').join('') +
            '</div></div>';
        }).join('') +
      '</div>' +

      H('Every program runs on the same spine') +
      '<div style="background:var(--surface-dark);border-radius:var(--r-lg);padding:20px 22px;margin-bottom:48px">' +
        '<div style="font-family:var(--ff-display);font-size:15px;font-weight:700;color:#fff;margin-bottom:4px">The shared spine</div>' +
        '<div style="font-size:13.5px;color:#A9B6BB;margin-bottom:16px">This is what makes twenty one programs teachable as one system.</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">' +
          spine('Layered activities', 'A global library plus program specific additions, and each lead trims down.') +
          spine('Time, two ways', 'Client contact against workload, with direct and indirect minutes on every contact.') +
          spine('One note style', 'One structured contact note, a critical flag, and an auto numbered session.') +
          spine('One referral form', 'A global referral at the front door, with program forms collapsing into it.') +
          spine('Consent split', 'Sharing consents are global, consent to service stays with the program.') +
        '</div>' +
      '</div>' +

      H('Document once, report to each funder') +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:40px">' +
        lane('Health PDS', 'Provincial health', 'Streams A·B·C·D') +
        lane('Child & Youth BI', 'Child and youth ministry', 'Streams A·F·G') +
        lane('Schedule G', 'Justice', 'Stream E') +
        lane('Community transfer', 'Community wellness funding', 'Stream H') +
      '</div>' +

      '<div style="background:linear-gradient(100deg,#0F4152,#17566B);border-radius:var(--r-lg);padding:24px 28px;color:#fff">' +
        '<div style="font-family:var(--ff-display);font-size:21px;font-weight:800;line-height:1.3">Staff deliver one service, not twenty one.</div>' +
        '<div style="font-size:15px;margin-top:8px;color:#CFE6EE;line-height:1.55;max-width:880px">The programs differ mostly by funder, not by what a worker actually does in the room. The EMR lets a worker deliver one service to one person, then splits the data underneath so every funder gets its report.</div>' +
      '</div>' +

    '</div></section>';
  }

  /* ---------------- guide detail ---------------- */

  function guideTable(headers, rows) {
    return '<div style="overflow-x:auto;border-radius:var(--r-lg);border:1px solid var(--border)">' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:var(--surface-subtle)">' +
      headers.map((h) => '<th style="padding:10px 16px;text-align:left;font-weight:700;color:var(--ink-heading);border-bottom:1px solid var(--border);white-space:nowrap;font-family:var(--ff-display)">' + esc(h) + '</th>').join('') +
      '</tr></thead><tbody>' +
      rows.map((row, ri) =>
        '<tr style="background:' + (ri % 2 ? 'var(--surface-2)' : 'var(--surface)') + ';border-bottom:1px solid var(--border)">' +
        row.map((c) => '<td style="padding:10px 16px;color:var(--ink-soft);vertical-align:top;line-height:1.5">' + c + '</td>').join('') +
        '</tr>').join('') +
      '</tbody></table></div>';
  }

  function uniqueTag(label) {
    return '<span style="display:inline-flex;align-items:center;gap:3px;background:var(--accent-subtle);color:var(--accent-deep);border:1px solid var(--accent-subtle-border);border-radius:var(--r-pill);font-size:11px;font-weight:600;padding:2px 7px;margin-left:6px;vertical-align:middle;letter-spacing:.04em">' + esc(label) + '</span>';
  }

  function callout(variant, title, body) {
    const map = {
      info: ['var(--primary-subtle)', 'var(--primary-subtle-border)', 'var(--primary)', 'var(--primary-subtle-ink)'],
      warning: ['var(--accent-subtle)', 'var(--accent-subtle-border)', 'var(--accent-deep)', 'var(--accent-deep)'],
      neutral: ['var(--surface-subtle)', 'var(--border)', 'var(--ink-heading)', 'var(--ink-heading)'],
    };
    const s = map[variant] || map.neutral;
    return '<div style="background:' + s[0] + ';border:1px solid ' + s[1] + ';border-left:4px solid ' + s[2] + ';border-radius:var(--r-lg);padding:16px 20px">' +
      (title ? '<div style="font-family:var(--ff-display);font-size:15px;font-weight:600;color:' + s[3] + ';margin-bottom:8px">' + esc(title) + '</div>' : '') +
      body + '</div>';
  }

  function steps(list) {
    return '<div class="steps">' + list.map((s, i) =>
      '<div class="step"><div class="step-num">' + (i + 1) + '</div><div>' +
        '<div class="step-title" style="font-size:18px;line-height:1.4">' + esc(s.title) + '</div>' +
        (s.detail ? '<div class="step-body" style="margin-top:4px"><p>' + esc(s.detail) + '</p></div>' : '') +
      '</div></div>').join('') + '</div>';
  }

  function sectionTitle(t) {
    return '<h2 class="display-sm" style="margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid var(--primary);display:inline-block;scroll-margin-top:96px">' + esc(t) + '</h2>';
  }

  let activeStage = null;

  function guideDetailPage(slug, section) {
    const guide = GUIDE_DATA[slug];
    const prog = GUIDE_PROGRAMS.filter((p) => p.slug === slug)[0];

    if (!guide) {
      return pageHeader({
        breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'Program Guides', href: '#/program-guides' }, { label: prog ? prog.title : 'Not found' }],
        title: 'Guide being built',
        lede: prog
          ? 'The ' + prog.title + ' guide is still being written. It follows the same nine section shape as the guides that are live, and it opens here once the program lead signs off on the configuration.'
          : 'That guide does not exist. Pick a program from the index.',
      }) + '<section class="section"><div class="container">' +
        '<a href="#/program-guides" class="btn btn-secondary">' + icon('ArrowLeft', 16) + ' Back to all programs</a>' +
        '</div></section>';
    }

    const stream = prog ? STREAMS.filter((s) => s.id === prog.stream)[0] : null;
    const uniqueLabel = guide.uniqueLabel;
    const uniqueCount = guide.activities.clientContact.filter((a) => a.unique).length;

    const stageFlow =
      '<div style="overflow-x:auto;padding-bottom:4px;margin-bottom:24px"><div style="display:flex;align-items:flex-start;min-width:540px">' +
      guide.stages.map((st, i) => {
        const on = st.id === activeStage;
        return '<button data-stage="' + st.id + '" style="flex:1 1 0;min-width:96px;display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 8px;border:none;cursor:pointer;border-radius:var(--r-lg);background:' + (on ? 'var(--primary-subtle)' : 'transparent') + '">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:' + (on ? 'var(--primary)' : 'var(--surface)') + ';border:' + (on ? 'none' : '2px solid var(--border)') + ';color:' + (on ? '#fff' : 'var(--ink-mute)') + ';display:flex;align-items:center;justify-content:center;font-family:var(--ff-display);font-size:17px;font-weight:700;flex-shrink:0">' + (i + 1) + '</div>' +
          '<div style="text-align:center">' +
            '<div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:3px">' + esc(st.label) + '</div>' +
            '<div style="font-size:13px;font-weight:600;color:' + (on ? 'var(--primary)' : 'var(--ink)') + ';line-height:1.3">' + esc(st.title) + '</div>' +
          '</div></button>' +
          (i < guide.stages.length - 1 ? '<div style="align-self:flex-start;margin-top:28px;color:var(--ink-faint);font-size:20px;flex-shrink:0;line-height:1">›</div>' : '');
      }).join('') + '</div></div>';

    const stageData = guide.stages.filter((s) => s.id === activeStage)[0];
    const stageDetail = stageData
      ? '<div style="background:var(--surface-subtle);border:1px solid var(--border);border-left:4px solid var(--primary);border-radius:var(--r-lg);padding:20px 24px;margin-bottom:24px">' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:baseline;margin-bottom:10px">' +
          '<span class="chip chip-forest">' + esc(stageData.label) + ': ' + esc(stageData.title) + '</span>' +
          '<span style="font-size:13px;color:var(--ink-mute)">Who: ' + esc(stageData.who) + '</span>' +
        '</div><p style="margin:0;font-size:15px;color:var(--ink-soft);line-height:1.65">' + esc(stageData.desc) + '</p></div>'
      : '<div style="color:var(--ink-faint);font-size:14px;margin-bottom:16px;text-align:center;padding:8px 0">Select a stage above to see the detail.</div>';

    const sections = [
      { id: 'client-journey', label: 'Client Journey', content:
        sectionTitle('Client Journey') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:24px">Press any stage to see who does what and what to expect.</p>' +
        stageFlow + stageDetail +
        '<div style="margin-top:24px">' + callout('neutral', 'Discharge reasons',
          '<ul style="margin:4px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:4px">' +
          guide.discharge.map((r) => '<li style="font-size:14px;color:var(--ink-soft);line-height:1.5">' + esc(r) + '</li>').join('') +
          '</ul>') + '</div>' },

      { id: 'document-contact', label: 'Document a Contact', content:
        sectionTitle('How to Document a Contact') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:24px;line-height:1.65">Most of what you record is a <strong>client contact</strong>: a service that already happened.</p>' +
        steps(guide.docSteps) +
        '<div style="margin-top:20px">' + callout('info', null,
          '<p style="margin:0;font-size:14px;color:var(--primary-subtle-ink);line-height:1.6">' + esc(guide.docTip) + '</p>') + '</div>' +
        '<div style="margin-top:20px">' + callout('neutral', 'Locations picklist',
          '<p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.6">' + esc(guide.locations) + '</p>') + '</div>' },

      { id: 'document-workload', label: 'Workload Time', content:
        sectionTitle('How to Document Workload Time') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:24px;line-height:1.65">' + esc(guide.workloadIntro) + '</p>' +
        steps(guide.workloadSteps) },

      { id: 'activities', label: 'Activities', content:
        sectionTitle('Activities') +
        '<div style="font-family:var(--ff-display);font-size:16px;font-weight:700;color:var(--ink-heading);margin-bottom:6px;margin-top:4px">Client contact activities</div>' +
        '<p style="font-size:14px;color:var(--ink-mute);margin-bottom:12px">Direct service, linked to a client file.</p>' +
        guideTable(['Activity', 'When to use'], guide.activities.clientContact.map((a) =>
          [esc(a.name) + (a.unique ? uniqueTag(uniqueLabel) : ''), esc(a.when)])) +
        (uniqueCount
          ? '<div style="margin-top:10px;font-size:13px;color:var(--ink-mute);display:flex;align-items:center;gap:6px">' +
            uniqueTag(uniqueLabel) + '<span>These activities exist only in this program.</span></div>'
          : '') +
        '<div style="font-family:var(--ff-display);font-size:16px;font-weight:700;color:var(--ink-heading);margin:28px 0 6px">Workload activities</div>' +
        '<p style="font-size:14px;color:var(--ink-mute);margin-bottom:12px">' + esc(guide.workloadNote) + '</p>' +
        guideTable(['Activity', 'When to use'], guide.activities.workload.map((a) =>
          [esc(a.name) + (a.unique ? uniqueTag(uniqueLabel) : ''), esc(a.when)])) },

      { id: 'attachments', label: 'Attachments', content:
        sectionTitle('Attachments') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:18px">When adding a file to a contact, a case note, or a case data record, pick the matching attachment type. The type is what makes a file findable a year later.</p>' +
        guideTable(['Attachment type', 'Example'], guide.attachments.map((a) =>
          [esc(a.type) + (a.unique ? uniqueTag(uniqueLabel) : ''), esc(a.example)])) },

      { id: 'case-forms', label: 'Case Data Forms', content:
        sectionTitle('Case Data Forms') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:18px">Case data holds the structured program forms. Not narrative notes, but trackable fields that the reports read.</p>' +
        guideTable(['Form', 'When to complete', 'Who'], guide.caseForms.map((f) => [esc(f.form), esc(f.when), esc(f.who)])) +
        '<div style="margin-top:20px">' + callout('neutral', 'Referral sources picklist',
          '<p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.6">' + esc(guide.referralSources) + '</p>') + '</div>' },

      { id: 'goal-planning', label: 'Goal Planning', content:
        sectionTitle('Goal Planning') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:24px">Goal planning tracks care goals and progress over time. One goal record per focus area.</p>' +
        steps(guide.goalPlanning) },

      { id: 'critical-flag', label: 'Critical Flag', content:
        sectionTitle('When to Use the Critical Flag') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:18px">Check the <strong>critical</strong> box on any contact or case note when the content involves:</p>' +
        callout('warning', 'Flag as critical for any of these',
          '<ul style="margin:4px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:6px">' +
          guide.criticalFlag.map((c) => '<li style="font-size:14px;color:var(--accent-deep);line-height:1.55">' + esc(c) + '</li>').join('') +
          '</ul>') +
        '<p style="font-size:14px;color:var(--ink-mute);margin-top:14px">Critical notes land in the critical note summary, which supervisors read weekly across every active client.</p>' },

      { id: 'reports', label: 'Reports', content:
        sectionTitle('Reports') +
        '<p style="font-size:15px;color:var(--ink-soft);margin-bottom:18px">Each report below is run by the program lead unless the guide says otherwise. Numbers shown anywhere in this demonstration are invented.</p>' +
        guideTable(['Report', 'How often', 'Why'], guide.reports.map((r) => [esc(r.name), esc(r.freq), esc(r.why)])) },
    ];

    const activeId = section && sections.some((s) => s.id === section) ? section : sections[0].id;
    const activeIndex = sections.map((s) => s.id).indexOf(activeId);
    const prev = sections[activeIndex - 1];
    const next = sections[activeIndex + 1];
    const others = PROGRAMS_AVAILABLE().filter((p) => p.slug !== slug);

    const head = pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'Program Guides', href: '#/program-guides' }]
        .concat(stream ? [{ label: 'Stream ' + stream.id + ' · ' + stream.name, href: '#/program-guides' }] : [])
        .concat([{ label: guide.title }]),
      children:
        '<div class="guide-meta" style="margin-top:20px">' +
          (stream ? '<span class="chip stream-chip" data-stream="' + stream.id + '">Stream ' + stream.id + ' · ' + esc(stream.name) + '</span>' : '') +
          '<span class="chip chip-forest">' + esc(guide.category) + '</span>' +
          '<span class="chip">' + icon('Building2', 12) + ' ' + esc(guide.funder) + '</span>' +
          '<span class="chip">' + icon('User', 12) + ' ' + esc(guide.who) + '</span>' +
        '</div>' +
        '<h1 class="guide-title" style="margin-top:14px">' + esc(guide.title) + '</h1>' +
        '<p class="guide-lede">' + esc(guide.lede) + '</p>' +
        '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">' +
          '<button class="btn btn-secondary" data-print>' + icon('Download', 16) + ' Print guide</button>' +
          '<a href="#/program-guides" class="btn btn-ghost">' + icon('ArrowLeft', 16) + ' All programs</a>' +
        '</div>',
    });

    return head +
    '<section class="section"><div class="container">' +
      '<div class="mobile-toc"><details><summary>In this guide: ' + esc(sections[activeIndex].label) + '</summary><nav>' +
        sections.map((s) => '<a href="#/program-guides/' + slug + '/' + s.id + '"' + (s.id === activeId ? ' class="active"' : '') + '>' + esc(s.label) + '</a>').join('') +
      '</nav></details></div>' +
      '<div class="guide-layout">' +

        '<aside class="guide-sidebar"><h5>In this guide</h5><ul>' +
          sections.map((s, i) => '<li><a href="#/program-guides/' + slug + '/' + s.id + '"' + (s.id === activeId ? ' class="active"' : '') + '>' +
            '<span style="opacity:.55;margin-right:6px">' + (i + 1) + '</span>' + esc(s.label) + '</a></li>').join('') +
        '</ul>' +
        (others.length
          ? '<div style="height:1px;background:var(--border);margin:12px 0"></div><h5>Other programs</h5><ul>' +
            others.map((p) => '<li><a href="#/program-guides/' + p.slug + '">' + esc(p.title) + '</a></li>').join('') + '</ul>'
          : '') +
        '</aside>' +

        '<div class="guide-content">' +
          '<div class="guide-section-head"><span class="guide-section-count">Section ' + (activeIndex + 1) + ' of ' + sections.length + '</span></div>' +
          (guide.notice
            ? '<div style="margin-bottom:24px">' + callout('info', null,
              '<div style="font-size:14px;color:var(--primary-subtle-ink);line-height:1.55"><strong>Note:</strong> ' + esc(guide.notice) + '</div>') + '</div>'
            : '') +
          sections.map((s) => '<div id="' + s.id + '" class="guide-tab-panel' + (s.id === activeId ? ' is-active' : '') + '">' + s.content + '</div>').join('') +
          '<div class="guide-pager">' +
            (prev ? '<a href="#/program-guides/' + slug + '/' + prev.id + '" class="btn btn-secondary">' + icon('ArrowLeft', 16) + ' ' + esc(prev.label) + '</a>' : '<span></span>') +
            (next ? '<a href="#/program-guides/' + slug + '/' + next.id + '" class="btn btn-primary">' + esc(next.label) + ' ' + icon('ArrowRight', 16) + '</a>' : '') +
          '</div>' +
          '<div style="border-top:1px solid var(--border);padding-top:20px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">' +
            '<div style="font-size:13px;color:var(--ink-faint)">Guide content follows the configuration sheet for this fictional program. Demonstration build.</div>' +
            '<a href="#/program-guides" class="btn btn-ghost" style="font-size:13px">' + icon('ArrowLeft', 16) + ' All programs</a>' +
          '</div>' +
        '</div>' +

        '<aside class="guide-toc"><h5>Program at a glance</h5>' +
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;display:flex;flex-direction:column;gap:14px">' +
            '<div><div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:3px">Funder</div>' +
              '<div style="font-size:13px;color:var(--ink);font-weight:500">' + esc(guide.funder) + '</div></div>' +
            '<div><div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:3px">Who documents</div>' +
              '<div style="font-size:13px;color:var(--ink);font-weight:500">' + esc(guide.who) + '</div></div>' +
            '<div style="height:1px;background:var(--border)"></div>' +
            [['Stages of care', guide.stages.length],
             ['Client activities', guide.activities.clientContact.length],
             ['Case data forms', guide.caseForms.length],
             ['Attachment types', guide.attachments.length]]
              .map((r) => '<div style="display:flex;justify-content:space-between;font-size:13px">' +
                '<span style="color:var(--ink-mute)">' + r[0] + '</span>' +
                '<span style="font-weight:600;color:var(--ink-heading)">' + r[1] + '</span></div>').join('') +
            '<div style="height:1px;background:var(--border)"></div>' +
            '<button data-signin style="font-size:13px;color:var(--primary);font-weight:600;display:inline-flex;align-items:center;gap:4px;padding:0">Sign in to the EMR ' + icon('ArrowRight', 16) + '</button>' +
          '</div>' +
        '</aside>' +

      '</div>' +
    '</div></section>';
  }

  /* ---------------- other pages ---------------- */

  function videosPage(activeCat) {
    const cats = [];
    VIDEOS.forEach((v) => { if (cats.indexOf(v.category) < 0) cats.push(v.category); });
    const active = activeCat || 'All';
    const list = active === 'All' ? VIDEOS : VIDEOS.filter((v) => v.category === active);
    return pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'Videos' }],
      eyebrow: 'Watch and learn',
      title: 'Video tutorials',
      lede: 'The training series recorded during the rollout. In this demonstration the tiles are present but playback is switched off, because a static demo makes no network requests.',
    }) +
    '<section class="section"><div class="container">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:24px">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          ['All'].concat(cats).map((c) => '<button class="tweaks-opt' + (c === active ? ' active' : '') + '" data-vidcat="' + esc(c) + '">' + esc(c) + '</button>').join('') +
        '</div>' +
        '<span style="font-size:13px;color:var(--ink-mute)">' + list.length + ' of ' + VIDEOS.length + ' modules</span>' +
      '</div>' +
      '<div class="video-grid">' + list.map((v, i) =>
        '<button class="video-card" data-video="' + esc(v.title) + '" style="text-align:left;padding:0;width:100%">' +
          '<div class="video-thumb"><div class="video-thumb-flat"></div>' +
            '<div class="video-module">Module ' + (VIDEOS.map((x) => x.id).indexOf(v.id) + 1) + '</div>' +
            '<div class="video-play" style="position:relative;z-index:2">' + icon('Play', 20) + '</div>' +
            '<div class="video-duration" style="z-index:2">' + esc(v.len) + '</div>' +
          '</div>' +
          '<div class="video-body"><div class="video-title">' + esc(v.title) + '</div>' +
            '<div class="video-meta"><span class="chip" style="font-size:11px;padding:2px 8px">' + esc(v.category) + '</span>' +
            '<span>Demonstration tile</span></div>' +
          '</div>' +
        '</button>').join('') + '</div>' +
    '</div></section>';
  }

  function faqPage(open) {
    const openI = typeof open === 'number' && FAQ[open] ? open : 0;
    return pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'FAQ' }],
      eyebrow: 'Answers to common questions',
      title: 'Frequently asked questions',
      lede: 'Collected from the questions staff actually asked during the rollout. If yours is not here, send it to the support desk and it gets added.',
    }) +
    '<section class="section"><div class="container-narrow">' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:8px 32px">' +
        FAQ.map((f, i) =>
          '<div id="faq-item-' + i + '" class="faq-item' + (i === openI ? ' open' : '') + '" style="scroll-margin-top:96px">' +
            '<button class="faq-q" data-faq="' + i + '" aria-expanded="' + (i === openI) + '" aria-controls="faq-answer-' + i + '">' +
              '<span>' + esc(f.q) + '</span><span class="faq-toggle" aria-hidden="true">' + icon('Plus', 16) + '</span>' +
            '</button>' +
            '<div class="faq-a" id="faq-answer-' + i + '"><p>' + esc(f.a) + '</p></div>' +
          '</div>').join('') +
      '</div>' +
      '<div style="margin-top:40px;text-align:center;padding:40px 20px">' +
        '<div class="eyebrow" style="margin-bottom:8px">Did not find it?</div>' +
        '<div style="font-family:var(--ff-display);font-size:26px;color:var(--ink-heading);margin-bottom:16px;font-weight:600">Ask, and it gets added here.</div>' +
        '<a href="#/troubleshoot" class="btn btn-primary">' + icon('LifeBuoy', 16) + ' Fix a problem</a>' +
      '</div>' +
    '</div></section>';
  }

  function newsPage() {
    return pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'News & Updates' }],
      eyebrow: 'Announcements',
      title: 'News & updates',
      lede: 'Announcements and system updates from the rollout team. Every item below is invented for this demonstration.',
    }) +
    '<section class="section"><div class="container-narrow">' +
      '<div style="display:flex;flex-direction:column;gap:4px">' +
        NEWS.map((n) =>
          '<div class="card" style="padding:28px 32px">' +
            '<div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">' +
              '<span class="chip chip-cedar">' + esc(n.tag) + '</span>' +
              '<span style="font-size:12px;color:var(--ink-mute);font-weight:500;letter-spacing:0.08em;text-transform:uppercase">' + esc(n.date) + '</span>' +
            '</div>' +
            '<h3 class="display-sm" style="margin-bottom:10px">' + esc(n.title) + '</h3>' +
            '<p style="color:var(--ink-soft);font-size:15px;line-height:1.6;margin:0;text-wrap:pretty">' + esc(n.excerpt) + '</p>' +
          '</div>').join('') +
      '</div>' +
    '</div></section>';
  }

  function onboardingPage() {
    return pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'Onboarding & Offboarding' }],
      eyebrow: 'People · IT · intake, internal process',
      title: 'EMR account onboarding and offboarding',
      lede: 'What happens when a staff member arrives or leaves. Twenty one programs, 84 staff with access in this fictional agency.',
    }) +
    '<section class="section"><div class="container">' +
      '<div style="margin-bottom:48px">' +
        '<div class="eyebrow" style="margin-bottom:12px">The process</div>' +
        '<h2 class="display-md" style="margin-bottom:32px">Three steps, start to finish</h2>' +
        '<div class="process">' +
          '<div class="process-step"><h4>The people team hears first</h4>' +
            '<p style="color:var(--ink-soft);font-size:14px;line-height:1.6;margin:0">Human resources is the first to know that someone is arriving or leaving. They own the trigger for the whole process, which is why nothing here starts with IT.</p></div>' +
          '<div class="process-step"><h4>Check the role guide</h4>' +
            '<p style="color:var(--ink-soft);font-size:14px;line-height:1.6;margin:0 0 10px">The role guide decides whether the role needs an EMR account at all.</p>' +
            '<ul style="font-size:13px;color:var(--ink-soft);padding-left:16px;margin:0;line-height:1.5">' +
              '<li><strong>No</strong>, the standard IT account setup runs on its own.</li>' +
              '<li><strong>Yes</strong>, two parallel requests go out: IT for single sign on, support desk for the account.</li>' +
            '</ul></div>' +
          '<div class="process-step"><h4>Sign on and account, in parallel</h4>' +
            '<p style="color:var(--ink-soft);font-size:14px;line-height:1.6;margin:0">IT sets up single sign on while the support desk creates the account and the program access. Both have to finish before the person can sign in, and the second one is usually what is missing.</p></div>' +
        '</div>' +
      '</div>' +

      '<div class="two-col-stack" style="grid-template-columns:1.3fr 1fr">' +
        '<div class="card">' +
          '<div class="eyebrow" style="margin-bottom:8px">Request to the support desk</div>' +
          '<h3 class="display-sm" style="margin-bottom:16px">What to include</h3>' +
          '<table class="field-table" style="margin-top:4px"><tbody>' +
            '<tr><th>Name</th><td>As it appears on the personnel record.</td></tr>' +
            '<tr><th>Role</th><td>The job title as assigned, for example case manager, counsellor, outreach worker.</td></tr>' +
            '<tr><th>Program</th><td>Which program the person will be working in.</td></tr>' +
            '<tr><th>Supervisor</th><td>The direct supervisor, used for access scoping and chart routing.</td></tr>' +
            '<tr><th>Designation</th><td>Any regulatory designation, where the role has one.</td></tr>' +
            '<tr><th>Start date</th><td>Access is dated, not opened early.</td></tr>' +
          '</tbody></table>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:16px">' +
          '<div class="card" style="background:var(--primary);color:#fff;border:none">' +
            '<div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:8px">At a glance</div>' +
            '<div class="stat-grid">' +
              '<div><div class="stat-num">21</div><div class="stat-lab">Programs</div></div>' +
              '<div><div class="stat-num">84</div><div class="stat-lab">Staff with access</div></div>' +
              '<div><div class="stat-num">2</div><div class="stat-lab">Business days to set up</div></div>' +
            '</div>' +
            '<div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px;font-size:13px;color:rgba(255,255,255,0.85)">Program rosters are held by the people team. Program leads confirm their own team before each onboarding cycle. All figures on this page are invented.</div>' +
          '</div>' +
          '<div class="demo-note">' + icon('AlertTriangle', 16, 'flex-shrink:0;margin-top:2px') +
            '<div><strong>Offboarding runs the same two requests in reverse.</strong> The account closes the same day the person leaves, and open notes are reassigned to the supervisor rather than left authenticated under a closed account.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></section>' +

    '<section class="section-tight"><div class="container">' +
      '<div class="eyebrow" style="margin-bottom:12px">Behind the queue</div>' +
      '<h2 class="display-md" style="margin-bottom:24px">Your support team</h2>' +
      '<div class="two-col-stack" style="grid-template-columns:1fr 1fr">' +
        '<div class="card">' +
          '<div style="font-family:var(--ff-display);font-size:24px;color:var(--ink-heading);margin-bottom:6px;font-weight:700">Central intake</div>' +
          '<div class="eyebrow" style="margin-bottom:12px">System owner</div>' +
          '<p style="font-size:14px;color:var(--ink-soft);margin:0;line-height:1.6">Central intake owns the system: day to day support, configuration changes, and reporting questions. One team, so the answer does not change depending on who picks it up.</p>' +
        '</div>' +
        '<div class="card">' +
          '<div style="font-family:var(--ff-display);font-size:24px;color:var(--ink-heading);margin-bottom:6px;font-weight:700">Program leads</div>' +
          '<div class="eyebrow" style="margin-bottom:12px">Working partners</div>' +
          '<p style="font-size:14px;color:var(--ink-soft);margin:0;line-height:1.6">Each program lead approves the configuration for their own program and confirms the activity list their staff see. Nothing is added to a picklist without a lead asking for it.</p>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  }

  function troubleshootPage() {
    const items = TROUBLESHOOT_RAW.map((t) => ({
      symptom: t.symptom,
      links: t.links,
      faq: t.faq.map((sub) => {
        for (let i = 0; i < FAQ.length; i++) {
          if (FAQ[i].q.toLowerCase().indexOf(sub.toLowerCase()) > -1) return i;
        }
        return -1;
      }).filter((i) => i >= 0),
    }));
    return pageHeader({
      breadcrumb: [{ label: 'Home', href: '#/' }, { label: 'Fix a problem' }],
      eyebrow: 'Troubleshooting',
      title: 'Fix a problem',
      lede: 'Start from what you are seeing. Each answer comes from the same source as the FAQ, reorganised by symptom rather than by topic.',
    }) +
    '<section class="section"><div class="container-narrow">' +
      '<div style="display:flex;flex-direction:column;gap:12px">' +
        items.map((t) =>
          '<details class="trouble-item"><summary><span class="trouble-icon">' + icon('AlertTriangle', 16) + '</span>' + esc(t.symptom) + '</summary>' +
          '<div class="trouble-body">' +
            t.faq.map((fi) =>
              '<div style="margin-bottom:14px">' +
                '<div style="font-weight:600;font-size:14px;color:var(--ink-heading);margin-bottom:4px">' + esc(FAQ[fi].q) + '</div>' +
                '<p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.6">' + esc(FAQ[fi].a) + '</p>' +
              '</div>').join('') +
            t.links.map((l) => '<a href="' + l.href + '" style="display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--primary);font-weight:600;text-decoration:none;margin-right:16px">' + esc(l.label) + ' ' + icon('ArrowRight', 14) + '</a>').join('') +
          '</div></details>').join('') +
      '</div>' +
      '<div style="margin-top:32px;text-align:center;padding:24px 20px">' +
        '<div style="font-size:14px;color:var(--ink-soft)">Not listed here? Send it to the support desk. Every question asked once gets added to this page for the next person.</div>' +
      '</div>' +
    '</div></section>';
  }

  /* ---------------- router ---------------- */

  function parseRoute(hash) {
    const path = (hash || '').replace(/^#/, '') || '/';
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return { name: 'home' };
    const a = parts[0], b = parts[1], c = parts[2];
    if (a === 'program-guides' && b) return { name: 'program-guide', slug: b, section: c };
    if (a === 'program-guides') return { name: 'program-guides' };
    if (a === 'videos') return { name: 'videos' };
    if (a === 'faq') return { name: 'faq', item: b !== undefined ? parseInt(b, 10) : undefined };
    if (a === 'troubleshoot') return { name: 'troubleshoot' };
    if (a === 'news') return { name: 'news' };
    if (a === 'onboarding') return { name: 'onboarding' };
    return { name: 'home' };
  }

  let videoCat = 'All';
  let lastRouteKey = '';

  function render() {
    const route = parseRoute(window.location.hash);
    let content, current = 'home';
    switch (route.name) {
      case 'program-guides': content = guidesIndexPage(); current = 'program-guides'; break;
      case 'program-guide': content = guideDetailPage(route.slug, route.section); current = 'program-guides'; break;
      case 'videos': content = videosPage(videoCat); current = 'videos'; break;
      case 'faq': content = faqPage(route.item); current = 'faq'; break;
      case 'troubleshoot': content = troubleshootPage(); current = 'faq'; break;
      case 'news': content = newsPage(); current = 'news'; break;
      case 'onboarding': content = onboardingPage(); current = 'onboarding'; break;
      default: content = homePage();
    }

    document.getElementById('app').innerHTML =
      headerHtml(current) +
      '<main id="main">' + content + '</main>' +
      (current !== 'home' ? supportCallout() : '') +
      footerHtml();

    const key = route.name + ':' + (route.slug || '');
    if (key !== lastRouteKey) { window.scrollTo(0, 0); lastRouteKey = key; }

    revealOn();
    if (route.name === 'faq' && typeof route.item === 'number' && FAQ[route.item]) {
      const el = document.getElementById('faq-item-' + route.item);
      if (el) el.scrollIntoView({ block: 'start' });
    }
  }

  function revealOn() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------------- events ---------------- */

  document.addEventListener('click', function (e) {
    const t = e.target;

    if (t.closest('[data-signin]')) {
      e.preventDefault();
      openModal('Sign in is switched off in this demonstration', DEMO_NOTICE);
      return;
    }
    const vid = t.closest('[data-video]');
    if (vid) {
      e.preventDefault();
      openModal(vid.getAttribute('data-video'),
        '<p>Video playback is switched off in this demonstration, because a static demo makes no network requests of any kind. In the live portal this tile opens the recorded training module.</p>' +
        '<div style="margin-top:18px"><button class="btn btn-primary" data-close>Close</button></div>');
      return;
    }
    if (t.closest('[data-print]')) { e.preventDefault(); window.print(); return; }

    const themeBtn = t.closest('[data-theme-toggle]');
    if (themeBtn) {
      const next = { system: 'light', light: 'dark', dark: 'system' };
      themeMode = next[themeMode];
      localStorage.setItem(THEME_KEY, themeMode);
      applyTheme(themeMode);
      render();
      return;
    }

    const navBtn = t.closest('[data-navtoggle]');
    if (navBtn) {
      const nav = document.getElementById('topnav');
      const open = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(open));
      navBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      return;
    }

    const cat = t.closest('[data-vidcat]');
    if (cat) { videoCat = cat.getAttribute('data-vidcat'); render(); return; }

    const stage = t.closest('[data-stage]');
    if (stage) {
      const id = stage.getAttribute('data-stage');
      activeStage = activeStage === id ? null : id;
      render();
      return;
    }

    const faqBtn = t.closest('[data-faq]');
    if (faqBtn) {
      const item = faqBtn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((x) => {
        x.classList.remove('open');
        const b = x.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('open'); faqBtn.setAttribute('aria-expanded', 'true'); }
      return;
    }

    if (t.closest('[data-skip]')) {
      e.preventDefault();
      const m = document.getElementById('main');
      if (m) { m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView(); }
      return;
    }

    const res = t.closest('.search-result');
    if (res) { hideResults(); return; }

    if (!t.closest('.search-holder')) hideResults();
  });

  document.addEventListener('change', function (e) {
    const sel = e.target.closest('[data-myprogram]');
    if (sel) { setMyProgram(sel.value); render(); }
  });

  function hideResults() {
    document.querySelectorAll('[data-results]').forEach((r) => { r.hidden = true; });
  }

  document.addEventListener('input', function (e) {
    const input = e.target.closest('[data-search]');
    if (!input) return;
    const box = input.closest('.search-holder').querySelector('[data-results]');
    const results = runSearch(input.value);
    if (!input.value.trim()) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = results.length
      ? results.map((r) =>
        '<a href="' + r.href + '" class="search-result">' +
          '<div class="search-result-icon">' + icon(r.icon, 16) + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="search-result-title">' + esc(r.title) + '</div>' +
            '<div class="search-result-meta">' + esc(r.type) + ' · ' + esc(r.desc) + '</div>' +
          '</div>' + icon('ArrowUpRight', 14, 'color:var(--ink-faint);flex-shrink:0;margin-top:8px') +
        '</a>').join('')
      : '<div class="search-empty">No matches for "' + esc(input.value) + '". Try a different term.</div>';
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
      const input = document.querySelector('[data-search]');
      if (input) { e.preventDefault(); input.focus(); }
    }
    const input = e.target.closest && e.target.closest('[data-search]');
    if (input && e.key === 'Enter') {
      const first = input.closest('.search-holder').querySelector('.search-result');
      if (first) { e.preventDefault(); window.location.hash = first.getAttribute('href').replace(/^#/, ''); hideResults(); }
    }
    if (input && e.key === 'Escape') hideResults();
  });

  window.addEventListener('hashchange', render);

  /* ---------------- boot ---------------- */

  render();

  /* The source portal opened the latest announcement as a first-visit modal.
     A public demonstration should open on the portal itself, so the news
     stays where the nav already points. */
})();
