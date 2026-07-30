/* Therapist workload, prototype.
   Sample data throughout. Every client is a coded card: nickname, avatar,
   optional number. No identifier exists anywhere in this file by design.
   Dictation here is simulated; the point it demonstrates is the contract:
   the transcript is read once for its action items and discarded. */

(function () {
  'use strict';

  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(window.location.search);

  if (params.get('frame') === 'app') document.body.classList.add('frame-app');

  /* ---------- avatars: line marks, square caps, no fills ---------- */

  var AVATARS = {
    boat:    '<path d="M6 21 H28 L24 27 H10 Z M17 21 V8 L25 18 H17"/>',
    heron:   '<path d="M13 27 V17 C13 11 17 8 21 8 C25 8 27 11 25 14 L20 13 M13 27 H9 M13 22 C10 22 8 20 7 17"/>',
    kettle:  '<path d="M10 14 H24 L23 26 H11 Z M13 14 C13 9 21 9 21 14 M24 16 L28 14 V19 M10 17 H6"/>',
    maple:   '<path d="M17 28 V16 M17 16 L10 19 L12 13 L7 12 L17 5 L27 12 L22 13 L24 19 Z"/>',
    lantern: '<path d="M12 10 H22 M13 10 L12 24 H22 L21 10 M17 5 V10 M12 24 L11 28 H23 L22 24 M14 15 H20"/>'
  };

  function avatar(kind) {
    return '<svg class="avatar" viewBox="0 0 34 34" aria-hidden="true">' + AVATARS[kind] + '</svg>';
  }

  /* ---------- the sample caseload ---------- */

  var CLIENTS = {
    boat: {
      name: 'Boat', num: '#07', kind: 'boat',
      heldFor: 'low mood since the layoff',
      open: 3,
      map: {
        biological: [
          { n: 'sleep debt, the plant schedule outlasted the plant', w: 0.8 },
          { n: 'drinking up, three nights a week', w: 0.6 }
        ],
        psychological: [
          { n: 'self-worth tied to providing', w: 0.9 },
          { n: 'withdrawal from his crew', w: 0.7 }
        ],
        social: [
          { n: 'layoff, EI runs out in June', w: 0.9 },
          { n: 'daughter, close, calls Sundays. holds', w: 0.4 }
        ],
        spiritual: []
      },
      acts: [
        { a: 'Behavioural activation, the morning walk on old shift days', f: 'acts on: sleep debt, withdrawal. combined weight 1.5' },
        { a: 'Re-employment counselling referral', f: 'acts on: layoff. weight 0.9' },
        { a: 'Keep the Sunday call in the plan', f: 'acts on: daughter, protective. weight 0.4' }
      ],
      items: [
        'He asked about group options last time. Bring the schedule.',
        'Daughter’s birthday was Sunday. Ask how it went.',
        'Walk practised twice last week, up from none.'
      ]
    },
    heron: {
      name: 'Heron', num: '#03', kind: 'heron',
      heldFor: 'panic on the highway after the collision',
      open: 2,
      map: {
        biological: [{ n: 'startle response, horns and brake lights', w: 0.7 }],
        psychological: [
          { n: 'catastrophic images at the merge', w: 0.8 },
          { n: 'confidence coming back on side streets', w: 0.3 }
        ],
        social: [{ n: 'sister will ride along, offered twice', w: 0.4 }],
        spiritual: []
      },
      acts: [
        { a: 'Exposure ladder, holding at step four, the on-ramp', f: 'acts on: catastrophic images, startle. combined weight 1.5' },
        { a: 'Passenger-seat drive with the sister', f: 'acts on: sister, protective. weight 0.4' }
      ],
      items: [
        'Insurance letter owed by Friday.',
        'Breathing drill holds on the on-ramp, stalls at the merge.'
      ]
    },
    kettle: {
      name: 'Kettle', num: '#12', kind: 'kettle',
      heldFor: 'grief, the first year after her husband',
      open: 1,
      map: {
        biological: [{ n: 'appetite thin since the fall', w: 0.5 }],
        psychological: [{ n: 'guilt about the good days', w: 0.7 }],
        social: [
          { n: 'the house is quiet, evenings hardest', w: 0.8 },
          { n: 'choir on Thursdays, kept going', w: 0.3 }
        ],
        spiritual: [{ n: 'her faith reads the loss as a test, and it steadies her', w: 0.5 }]
      },
      acts: [
        { a: 'Evening structure, one planned thing after supper', f: 'acts on: the quiet house. weight 0.8' },
        { a: 'Name the good days as loyalty, not betrayal', f: 'acts on: guilt. weight 0.7' }
      ],
      items: ['The anniversary is in April. Plan the session before it, not after.']
    },
    maple: {
      name: 'Maple', num: '', kind: 'maple',
      heldFor: 'burnout, nursing rotation',
      open: 1,
      map: {
        biological: [{ n: 'twelve-hour rotations, sleep flipped weekly', w: 0.9 }],
        psychological: [{ n: 'nothing left for home, and she notices', w: 0.7 }],
        social: [{ n: 'unit short-staffed, guilt about booking off', w: 0.8 }],
        spiritual: []
      },
      acts: [
        { a: 'Boundaries script for the extra-shift calls', f: 'acts on: short-staffed unit. weight 0.8' }
      ],
      items: ['She is deciding on the LOA form by month end.']
    },
    lantern: {
      name: 'Lantern', num: '#21', kind: 'lantern',
      heldFor: 'anger at home he does not want his kids to see',
      open: 2,
      map: {
        biological: [{ n: 'runs hot after night shifts', w: 0.6 }],
        psychological: [
          { n: 'his father’s temper, named it himself', w: 0.8 },
          { n: 'catches the ramp-up earlier now', w: 0.3 }
        ],
        social: [{ n: 'partner signals him with a word they picked', w: 0.4 }],
        spiritual: []
      },
      acts: [
        { a: 'Time-out protocol, out the back door, twenty minutes', f: 'acts on: ramp-up, runs hot. combined weight 0.9' }
      ],
      items: ['Two clean weeks. Say it back to him.', 'Kids’ school meeting stress incoming, plan for it.']
    }
  };

  /* ---------- the day ---------- */

  var FEED = [
    {
      id: 'heron-9', time: '9:00', kind: 'recap',
      title: 'Session, hospital. ' + card('heron'),
      sub: 'ended 9:50. recap not taken',
      state: 'dictate it'
    },
    {
      id: 'boat-11', time: '11:00', kind: 'session',
      title: 'Session, clinic. ' + card('boat'),
      sub: 'fifty minutes',
      state: 'what you need',
      need: [
        { t: '<b>Bring the group schedule.</b> He asked about group options last time.', f: 'from: open item on Boat' },
        { t: '<b>Practice check:</b> the morning walk, twice last week, up from none.', f: 'from: the map. sleep debt, withdrawal' },
        { t: '<b>Ask about the birthday.</b> His daughter’s was Sunday.', f: 'from: memory prompt on Boat' }
      ]
    },
    {
      id: 'invoice', time: '12:30', kind: 'alert',
      title: 'Clinic invoice summary, March',
      sub: 'was due Monday',
      state: 'due yesterday',
      need: [
        { t: 'Counts only: sessions delivered, by program. Send it before the 1:00 intake block.', f: 'clinic reporting. nothing about any client leaves this board' }
      ]
    },
    {
      id: 'quarter', time: '1:30', kind: 'report',
      title: 'Quarterly counts, hospital program',
      sub: 'due Friday',
      state: 'on track',
      need: [
        { t: '<b>12 clients, 44 sessions</b> this quarter. Last quarter: 11 and 39.', f: 'counts leave the board. client content does not' }
      ]
    },
    {
      id: 'kettle-3', time: '3:00', kind: 'session',
      title: 'Session, clinic. ' + card('kettle'),
      sub: 'fifty minutes',
      state: 'what you need',
      need: [
        { t: '<b>The anniversary is in April.</b> Start placing the session before it.', f: 'from: open item on Kettle' },
        { t: '<b>Evening structure check:</b> one planned thing after supper.', f: 'from: the map. the quiet house' }
      ]
    },
    {
      id: 'super', time: '4:30', kind: 'session',
      title: 'Supervision, hospital, one hour',
      sub: 'bring the quarter counts',
      state: 'what you need',
      need: [
        { t: 'Two cases to raise: the merge plateau, and the LOA decision landing this month.', f: 'from: open items on Heron and Maple' }
      ]
    }
  ];

  function card(key) {
    var c = CLIENTS[key];
    return c.name + (c.num ? ' <span class="num">' + c.num + '</span>' : '');
  }

  /* ---------- state ---------- */

  var app = document.getElementById('app');
  var state = {
    view: params.get('view') || 'today',
    client: params.get('client') || 'boat',
    open: params.get('open') || '',
    recapDone: params.get('view') === 'recap-done'
  };
  if (state.recapDone) state.view = 'recap';

  /* ---------- renderers ---------- */

  function chrome(bodyHTML, tab) {
    return '' +
      '<div class="app-top">' +
        '<div class="app-day">' +
          '<p class="app-date">Tuesday, March 10</p>' +
          '<p class="app-count">6 on the board · 1 needs you</p>' +
        '</div>' +
        '<p class="app-context"><span class="dot"></span>calendar connected · quiet during sessions · next 11:00, clinic</p>' +
      '</div>' +
      '<div class="app-tabs" role="tablist">' +
        '<button class="app-tab" role="tab" data-go="today" aria-selected="' + (tab === 'today') + '">today</button>' +
        '<button class="app-tab" role="tab" data-go="clients" aria-selected="' + (tab === 'clients') + '">caseload</button>' +
      '</div>' +
      '<div class="app-body">' + bodyHTML + '</div>' +
      '<p class="app-foot">sample caseload · coded cards only · nothing here identifies anyone</p>';
  }

  function rowHTML(r) {
    var cls = 'row';
    if (r.kind === 'alert') cls += ' is-alert';
    if (r.kind === 'recap') cls += ' is-recap';
    if (r.done) cls += ' is-done';
    if (state.open === r.id) cls += ' is-open';

    var more = '';
    if (r.kind === 'recap' && !r.done) {
      more =
        '<div class="row-more"><div class="row-more-inner"><div class="row-more-pad">' +
          '<div class="need"><p class="need-label">the recap</p>' +
            '<p class="need-item">Dictate what happened while it is fresh. The board keeps the action items and nothing else.</p>' +
          '</div>' +
          '<div class="row-actions"><button class="btn btn-primary" data-go="recap">Dictate the recap</button></div>' +
        '</div></div></div>';
    } else if (r.need) {
      more =
        '<div class="row-more"><div class="row-more-inner"><div class="row-more-pad">' +
          '<div class="need"><p class="need-label">' + (r.kind === 'session' ? 'what you need' : 'the report') + '</p>' +
            r.need.map(function (n) {
              return '<p class="need-item">' + n.t + '<span class="need-from">' + n.f + '</span></p>';
            }).join('') +
          '</div>' +
        '</div></div></div>';
    }

    return '<div class="' + cls + '" data-row="' + r.id + '">' +
      '<button class="row-head" data-toggle="' + r.id + '" aria-expanded="' + (state.open === r.id) + '">' +
        '<span class="row-time">' + r.time + '</span>' +
        '<span><span class="row-title">' + r.title + '</span>' +
        '<span class="row-sub">' + r.sub + '</span></span>' +
        '<span class="row-state">' + r.state + '</span>' +
      '</button>' + more + '</div>';
  }

  function todayHTML() {
    return FEED.map(rowHTML).join('');
  }

  function clientsHTML() {
    var cards = Object.keys(CLIENTS).map(function (key) {
      var c = CLIENTS[key];
      return '<button class="card" data-client="' + key + '">' +
        avatar(c.kind) +
        '<span class="card-name">' + c.name + (c.num ? ' <span class="num">' + c.num + '</span>' : '') + '</span>' +
        '<span class="card-for">held for: ' + c.heldFor + '</span>' +
        '<span class="card-open">' + c.open + ' open item' + (c.open === 1 ? '' : 's') + '</span>' +
      '</button>';
    }).join('');

    return '<p class="case-note">Coded cards. A nickname, an avatar, a number if you want one. Who they are stays in your head, not in here.</p>' +
      '<div class="cards">' + cards + '</div>';
  }

  var DOMAINS = [
    ['biological', 'domain-bio', 'biological'],
    ['psychological', 'domain-psy', 'psychological'],
    ['social', 'domain-soc', 'social'],
    ['spiritual', 'domain-spi', 'spiritual']
  ];

  function clientHTML(key) {
    var c = CLIENTS[key];

    var map = DOMAINS.map(function (d) {
      var nodes = c.map[d[0]];
      var inner = nodes.length
        ? nodes.map(function (n) {
            return '<div class="node">' +
              '<div class="node-line"><span>' + n.n + '</span><span class="node-w">' + n.w.toFixed(1) + '</span></div>' +
              '<div class="node-bar"><i data-w="' + n.w + '"></i></div>' +
            '</div>';
          }).join('')
        : '<p class="domain-empty">nothing here bears on the concern yet, so nothing is here</p>';
      return '<div class="domain ' + d[1] + '"><p class="domain-name">' + d[2] + '</p>' + inner + '</div>';
    }).join('');

    var acts = c.acts.map(function (a) {
      return '<div class="act"><p class="act-name">' + a.a + '</p><p class="act-from">' + a.f + '</p></div>';
    }).join('');

    var items = c.items.map(function (i) {
      return '<p class="item"><span class="item-mark">→</span><span>' + i + '</span></p>';
    }).join('');

    return '<button class="back" data-go="clients">← caseload</button>' +
      '<div class="detail-head">' + avatar(c.kind) +
        '<span><span class="detail-name">' + c.name + (c.num ? ' <span class="num">' + c.num + '</span>' : '') + '</span><br>' +
        '<span class="detail-for">held for: ' + c.heldFor + '</span></span>' +
      '</div>' +
      '<div class="panel-block"><p class="panel-title">the map, weighted to the concern</p>' + map +
        '<p class="fence">The map holds what bears on the reason for counselling and the factors doing work on it. No life history, no intake. A domain stays empty until something in it matters.</p>' +
      '</div>' +
      '<div class="panel-block"><p class="panel-title">where to act, from the node weights</p>' + acts +
        '<p class="fence">Every suggestion traces to named nodes on this card. Nothing arrives detached from this client.</p>' +
      '</div>' +
      '<div class="panel-block"><p class="panel-title">open items</p>' + items + '</div>';
  }

  var TRANSCRIPT = 'Good hour. The breathing drill is holding on the on-ramp, still stalls at the merge, so the ladder stays at step four. She wants the passenger-seat drive with her sister before next time. And I owe her the insurance letter by Friday.';

  function recapHTML(stage) {
    var head = '<button class="back" data-go="today">← today</button>' +
      '<div class="detail-head">' + avatar('heron') +
        '<span><span class="detail-name">Recap, 9:00 session · Heron <span class="num">#03</span></span><br>' +
        '<span class="detail-for">it keeps the action items. the recording is not kept</span></span>' +
      '</div>';

    if (stage === 'idle') {
      return '<div class="recap">' + head +
        '<button class="talk" data-talk>hold to talk</button>' +
        '<p class="recap-sub" style="text-align:center">Say what happened while it is fresh. In this prototype the press plays a sample dictation.</p>' +
      '</div>';
    }

    if (stage === 'talking' || stage === 'pulled') {
      var pulled = stage === 'pulled'
        ? '<div class="pulled"><p class="need-label">pulled out of it. confirm what the board keeps</p>' +
            '<label class="pull"><input type="checkbox" checked> <span>Set up the passenger-seat drive with the sister<span class="need-from">to: Heron, open items</span></span></label>' +
            '<label class="pull"><input type="checkbox" checked> <span>Insurance letter due Friday<span class="need-from">to: the board, reports</span></span></label>' +
            '<label class="pull"><input type="checkbox" checked> <span>Ladder holds at step four, the merge still stalls<span class="need-from">to: Heron, the map</span></span></label>' +
          '</div>' +
          '<div class="row-actions"><button class="btn btn-primary" data-keep>Keep these three</button></div>'
        : '';
      return '<div class="recap">' + head +
        '<div class="transcript" data-transcript></div>' + pulled +
      '</div>';
    }

    /* done */
    return '<div class="recap">' + head +
      '<div class="transcript is-gone">' + TRANSCRIPT + '</div>' +
      '<div class="kept">' +
        '<p class="kept-line">3 items kept.</p>' +
        '<p class="kept-sub">The recording and transcript are gone. They were read once for the items above and never stored. The items landed on Heron’s card and today’s board.</p>' +
      '</div>' +
      '<div class="row-actions"><button class="btn btn-quiet" data-go="today">Back to today</button></div>' +
    '</div>';
  }

  /* ---------- wiring ---------- */

  function render() {
    var html;
    if (state.view === 'clients') html = chrome(clientsHTML(), 'clients');
    else if (state.view === 'client') html = chrome(clientHTML(state.client), 'clients');
    else if (state.view === 'recap') html = chrome(recapHTML(state.recapDone ? 'done' : 'idle'), 'today');
    else html = chrome(todayHTML(), 'today');

    app.innerHTML = html;
    growBars();
  }

  function growBars() {
    var bars = app.querySelectorAll('.node-bar i');
    if (!bars.length) return;
    requestAnimationFrame(function () {
      bars.forEach(function (b) { b.style.width = (parseFloat(b.dataset.w) * 100) + '%'; });
    });
  }

  function typeTranscript(el, done) {
    if (!motionOK) { el.textContent = TRANSCRIPT; done(); return; }
    var i = 0;
    var timer = window.setInterval(function () {
      i += 3;
      el.textContent = TRANSCRIPT.slice(0, i);
      if (i >= TRANSCRIPT.length) { window.clearInterval(timer); done(); }
    }, 24);
  }

  app.addEventListener('click', function (event) {
    var go = event.target.closest('[data-go]');
    if (go) {
      state.view = go.dataset.go;
      state.open = '';
      if (state.view !== 'recap') state.recapDone = false;
      render();
      return;
    }

    var cardBtn = event.target.closest('[data-client]');
    if (cardBtn) {
      state.client = cardBtn.dataset.client;
      state.view = 'client';
      render();
      return;
    }

    var toggle = event.target.closest('[data-toggle]');
    if (toggle) {
      var id = toggle.dataset.toggle;
      state.open = state.open === id ? '' : id;
      render();
      return;
    }

    var talk = event.target.closest('[data-talk]');
    if (talk) {
      talk.classList.add('is-live');
      talk.textContent = 'listening';
      window.setTimeout(function () {
        app.querySelector('.app-body').innerHTML = recapHTML('talking');
        var t = app.querySelector('[data-transcript]');
        typeTranscript(t, function () {
          app.querySelector('.app-body').innerHTML = recapHTML('pulled');
          var t2 = app.querySelector('[data-transcript]');
          if (t2) t2.textContent = TRANSCRIPT;
        });
      }, motionOK ? 500 : 0);
      return;
    }

    var keep = event.target.closest('[data-keep]');
    if (keep) {
      state.recapDone = true;
      FEED[0].done = true;
      FEED[0].sub = 'recap taken at 10:12';
      FEED[0].state = 'done';
      FEED[0].kind = 'session';
      render();
    }
  });

  render();
})();
