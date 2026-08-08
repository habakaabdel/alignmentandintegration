/* Personal Pal (Aura) prototype.
   Simulates transient voice inputs, structured insights extraction,
   cognitive privacy shredding, and adapting personal life map domains. */

(function () {
  'use strict';

  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initial well-being map data with labels and explanations
  var MAP_DOMAINS = {
    biological: {
      name: 'biological',
      desc: 'measures energy levels, physical activity, and sleep quality',
      value: 0.60,
      label: 'Energy & Sleep',
      status: 'Moderate: feeling slightly fatigued, sleep was adequate'
    },
    psychological: {
      name: 'psychological',
      desc: 'measures mental focus, focus capacity, and emotional calm',
      value: 0.70,
      label: 'Focus & Calm',
      status: 'Focused: mental clarity is good, mind is active'
    },
    social: {
      name: 'social',
      desc: 'measures connection frequency and relationship support',
      value: 0.50,
      label: 'Connections',
      status: 'Stable: connected with coworker yesterday'
    },
    spiritual: {
      name: 'spiritual',
      desc: 'measures sense of purpose, mindfulness, and values alignment',
      value: 0.55,
      label: 'Purpose & Mindfulness',
      status: 'Centered: basic routines are holding'
    }
  };

  // Initial timeline feed data
  var TIMELINE_ITEMS = [
    {
      id: 'meditation-7', time: '07:00', category: 'spiritual', catLabel: 'Spiritual',
      title: 'Morning reflection',
      desc: '15 mins mindfulness sitting',
      state: 'pending', stateLabel: 'Pending'
    },
    {
      id: 'focus-10', time: '10:30', category: 'psychological', catLabel: 'Psychological',
      title: 'Focus work block',
      desc: 'Coding session, phone off',
      state: 'pending', stateLabel: 'Pending'
    },
    {
      id: 'sync-1', time: '13:00', category: 'social', catLabel: 'Social',
      title: 'Team sync meeting',
      desc: 'Weekly project update check-in',
      state: 'pending', stateLabel: 'Pending'
    },
    {
      id: 'run-6', time: '18:00', category: 'biological', catLabel: 'Biological',
      title: 'Daily run',
      desc: '5km outdoor run, zone 2 pacing',
      state: 'pending', stateLabel: 'Pending'
    },
    {
      id: 'read-8', time: '20:00', category: 'spiritual', catLabel: 'Spiritual',
      title: 'Evening reading',
      desc: 'Read Atomic Habits chapter 4',
      state: 'pending', stateLabel: 'Pending'
    }
  ];

  // Scenarios text and extracted data
  var SCENARIOS = {
    exhausted: {
      dictation: "I'm exhausted and need to reschedule my run.",
      extractions: [
        { id: 'ex-bio', text: 'Adjust Biological (Energy) status from 60% to 20% (Low)', dest: 'to: Life Map' },
        { id: 'ex-sched-1', text: 'Reschedule 18:00 Daily run to tomorrow morning', dest: 'to: Day Flow' },
        { id: 'ex-sched-2', text: 'Suggest 18:00 Warm tea & reading routine (replacing run)', dest: 'to: Day Flow' }
      ]
    },
    sarah: {
      dictation: "Met Sarah for coffee, she mentioned a job opening at her company.",
      extractions: [
        { id: 'ex-soc', text: 'Increase Social (Connections) value from 50% to 75% (Connected)', dest: 'to: Life Map' },
        { id: 'ex-spi', text: 'Increase Spiritual (Purpose) value from 55% to 80% (High)', dest: 'to: Life Map' },
        { id: 'ex-task', text: 'Add task at 14:00: Follow up with Sarah J. about job details', dest: 'to: Day Flow' }
      ]
    },
    meditation: {
      dictation: "Had a great meditation session, feeling very centered.",
      extractions: [
        { id: 'ex-med-1', text: 'Mark 07:00 Morning reflection as Done', dest: 'to: Day Flow' },
        { id: 'ex-psy', text: 'Increase Psychological (Calm) value from 70% to 85% (Peaceful)', dest: 'to: Life Map' },
        { id: 'ex-spi-2', text: 'Increase Spiritual (Mindfulness) value from 55% to 80% (Mindful)', dest: 'to: Life Map' }
      ]
    }
  };

  // State
  var state = {
    view: 'today',      // 'today' | 'map' | 'dictation'
    scenario: null,     // null | 'exhausted' | 'sarah' | 'meditation'
    recapState: 'idle', // 'idle' | 'listening' | 'typing' | 'extracted' | 'shredding' | 'shredded'
    lastDictated: '',
    appliedScenarios: {} // Keeps track of applied scenarios
  };

  // Render components
  var app = document.getElementById('app');

  function chrome(bodyHTML, tab) {
    var totalCount = TIMELINE_ITEMS.length;
    var completedCount = TIMELINE_ITEMS.filter(function(item) { return item.state === 'done'; }).length;
    var contextText = state.view === 'dictation' ? 'listening for input...' : 'quiet during flow blocks';

    return '' +
      '<div class="app-top">' +
        '<div class="app-day">' +
          '<p class="app-date">Tuesday, March 10</p>' +
          '<p class="app-count">' + totalCount + ' on day flow · ' + completedCount + ' completed</p>' +
        '</div>' +
        '<p class="app-context"><span class="dot"></span>Aura active · local processing only · ' + contextText + '</p>' +
      '</div>' +
      '<div class="app-tabs" role="tablist">' +
        '<button class="app-tab" role="tab" data-go="today" aria-selected="' + (tab === 'today') + '">day flow</button>' +
        '<button class="app-tab" role="tab" data-go="map" aria-selected="' + (tab === 'map') + '">life map</button>' +
        '<button class="app-tab" role="tab" data-go="dictation" aria-selected="' + (tab === 'dictation') + '">talk to aura</button>' +
      '</div>' +
      '<div class="app-body">' + bodyHTML + '</div>' +
      '<p class="app-foot">transient inputs · shredded raw transcript · cognitive privacy first</p>';
  }

  function timelineRowHTML(item) {
    var rowClass = 'row';
    if (item.state === 'done') rowClass += ' is-done';
    if (item.state === 'rescheduled') rowClass += ' is-scheduled';

    var badgeHTML = '<span class="row-tag ' + item.category.slice(0, 3) + '">' + item.catLabel + '</span>';
    var stateHTML = '<span class="row-time" style="color: ' + (item.state === 'done' ? 'var(--mark)' : item.state === 'rescheduled' ? 'var(--second)' : 'var(--ink-muted)') + '">' + item.stateLabel + '</span>';

    return '' +
      '<div class="' + rowClass + '" id="row-' + item.id + '">' +
        '<div class="row-head">' +
          '<span class="row-time">' + item.time + '</span>' +
          '<div class="row-details">' +
            '<span class="row-title">' + item.title + '</span>' +
            '<span class="row-desc">' + item.desc + '</span>' +
            badgeHTML +
          '</div>' +
          stateHTML +
        '</div>' +
      '</div>';
  }

  function todayHTML() {
    return '' +
      '<p class="map-intro">Your day flow shows chronological routines and tasks. Extracted items appear here once committed.</p>' +
      '<div class="timeline">' +
        TIMELINE_ITEMS.map(timelineRowHTML).join('') +
      '</div>';
  }

  function domainCardHTML(key) {
    var d = MAP_DOMAINS[key];
    var pct = Math.round(d.value * 100);

    return '' +
      '<div class="domain-card ' + key.slice(0, 3) + '">' +
        '<div class="domain-header">' +
          '<span class="domain-title">' + d.label + '</span>' +
          '<span class="domain-value">' + pct + '% weight</span>' +
        '</div>' +
        '<p class="domain-desc">' + d.desc + '</p>' +
        '<div class="bar-bg" aria-hidden="true">' +
          '<div class="bar-fill" data-w="' + d.value + '"></div>' +
        '</div>' +
        '<p class="domain-status">' + d.status + '</p>' +
      '</div>';
  }

  function mapHTML() {
    return '' +
      '<p class="map-intro">The life map measures well-being across four domains, showing their current balance percentage. Weights increase or decrease dynamically based on actions committed.</p>' +
      domainCardHTML('biological') +
      domainCardHTML('psychological') +
      domainCardHTML('social') +
      domainCardHTML('spiritual');
  }

  function dictationHTML() {
    var metadata = 'transient dictation · aura assistant';

    if (state.recapState === 'idle') {
      return '' +
        '<div class="recap-panel">' +
          '<div class="recap-header">' +
            '<p class="recap-meta">' + metadata + '</p>' +
            '<h2 class="recap-title">Talk to Aura</h2>' +
          '</div>' +
          '<div class="listening-box">' +
            '<button class="btn-talk" id="talk-btn">talk</button>' +
            '<p class="row-desc" style="margin-top: 16px;">Tap the scenario buttons in the sidebar on the left to simulate dictating to Aura.</p>' +
          '</div>' +
        '</div>';
    }

    if (state.recapState === 'listening') {
      return '' +
        '<div class="recap-panel">' +
          '<div class="recap-header">' +
            '<p class="recap-meta">listening...</p>' +
            '<h2 class="recap-title">Aura is listening</h2>' +
          '</div>' +
          '<div class="listening-box">' +
            '<button class="btn-talk is-listening" disabled>rec</button>' +
            '<div class="transcript-display is-typing">Listening to voice note...</div>' +
          '</div>' +
        '</div>';
    }

    if (state.recapState === 'typing' || state.recapState === 'extracted' || state.recapState === 'shredding') {
      var isShreddingClass = state.recapState === 'shredding' ? ' is-shredding' : '';
      var contentHTML = '';

      if (state.recapState === 'extracted') {
        var s = SCENARIOS[state.scenario];
        contentHTML = '' +
          '<div class="extraction-results">' +
            '<p class="extraction-title">extracted structured insights</p>' +
            s.extractions.map(function (ext) {
              return '' +
                '<div class="extracted-item">' +
                  '<input type="checkbox" id="' + ext.id + '" checked>' +
                  '<div class="extracted-content">' +
                    '<span class="extracted-text">' + ext.text + '</span>' +
                    '<span class="extracted-dest">' + ext.dest + '</span>' +
                  '</div>' +
                '</div>';
            }).join('') +
          '</div>' +
          '<div class="recap-actions">' +
            '<button class="btn btn-primary" id="keep-btn" style="flex: 1;">Keep items & shred raw input</button>' +
          '</div>';
      }

      return '' +
        '<div class="recap-panel">' +
          '<div class="recap-header">' +
            '<p class="recap-meta">processing dictation</p>' +
            '<h2 class="recap-title">Aura Transcription</h2>' +
          '</div>' +
          '<div class="transcript-display' + isShreddingClass + '" id="transcript-txt">' +
            state.lastDictated +
          '</div>' +
          contentHTML +
        '</div>';
    }

    // Shredded state
    return '' +
      '<div class="recap-panel">' +
        '<div class="shredder-overlay">' +
          '<h3>Shredded for cognitive privacy</h3>' +
          '<p>Raw voice recording and transcript deleted. Only the verified structured items have been added to your day flow and life map.</p>' +
        '</div>' +
        '<div class="recap-actions">' +
          '<button class="btn btn-primary" data-go="today" style="flex: 1;">View day flow</button>' +
          '<button class="btn btn-quiet" data-go="map" style="flex: 1;">View life map</button>' +
        '</div>' +
      '</div>';
  }

  function render() {
    var html;
    if (state.view === 'map') html = chrome(mapHTML(), 'map');
    else if (state.view === 'dictation') html = chrome(dictationHTML(), 'dictation');
    else html = chrome(todayHTML(), 'today');

    app.innerHTML = html;
    animateBars();
  }

  function animateBars() {
    var fills = app.querySelectorAll('.bar-fill');
    if (!fills.length) return;
    requestAnimationFrame(function () {
      fills.forEach(function (bar) {
        bar.style.width = (parseFloat(bar.dataset.w) * 100) + '%';
      });
    });
  }

  function typeText(scenarioKey, onDone) {
    state.recapState = 'typing';
    render();
    var fullText = SCENARIOS[scenarioKey].dictation;
    var el = document.getElementById('transcript-txt');
    var i = 0;

    if (!motionOK) {
      state.lastDictated = fullText;
      state.recapState = 'extracted';
      render();
      onDone();
      return;
    }

    var interval = setInterval(function () {
      i += 2;
      state.lastDictated = fullText.slice(0, i);
      if (el) el.textContent = state.lastDictated;

      if (i >= fullText.length) {
        clearInterval(interval);
        state.recapState = 'extracted';
        render();
        onDone();
      }
    }, 24);
  }

  function startScenario(scenarioKey) {
    state.view = 'dictation';
    state.scenario = scenarioKey;
    state.recapState = 'listening';
    state.lastDictated = '';
    render();

    setTimeout(function () {
      typeText(scenarioKey, function () {
        // Typing complete
      });
    }, motionOK ? 1000 : 0);
  }

  // Apply actual adjustments based on scenarios
  function applyAdjustments(scenarioKey) {
    if (state.appliedScenarios[scenarioKey]) return; // Only apply once
    state.appliedScenarios[scenarioKey] = true;

    if (scenarioKey === 'exhausted') {
      // Bio drops
      MAP_DOMAINS.biological.value = 0.20;
      MAP_DOMAINS.biological.status = 'Low: energy severely depleted, scheduling rest';

      // Move run-6
      var runItem = TIMELINE_ITEMS.find(function (item) { return item.id === 'run-6'; });
      if (runItem) {
        runItem.state = 'rescheduled';
        runItem.stateLabel = 'Rescheduled';
        runItem.desc = 'Daily run (moved to tomorrow 07:00)';
      }

      // Add suggested routine
      TIMELINE_ITEMS.push({
        id: 'tea-6', time: '18:00', category: 'biological', catLabel: 'Biological',
        title: 'Warm tea & reading',
        desc: 'Focus on recovery and rest',
        state: 'done', stateLabel: 'Suggested'
      });
    }

    if (scenarioKey === 'sarah') {
      // Social and Spiritual go up
      MAP_DOMAINS.social.value = 0.75;
      MAP_DOMAINS.social.status = 'Connected: shared coffee with Sarah';
      MAP_DOMAINS.spiritual.value = 0.80;
      MAP_DOMAINS.spiritual.status = 'Inspired: exploring new career path opportunities';

      // Add task
      TIMELINE_ITEMS.push({
        id: 'sarah-task', time: '14:00', category: 'social', catLabel: 'Social',
        title: 'Follow up with Sarah',
        desc: 'Send note about the job description details',
        state: 'pending', stateLabel: 'Pending'
      });

      // Sort timeline items chronologically
      TIMELINE_ITEMS.sort(function (a, b) {
        return a.time.localeCompare(b.time);
      });
    }

    if (scenarioKey === 'meditation') {
      // Spiritual and Psychological go up
      MAP_DOMAINS.spiritual.value = 0.80;
      MAP_DOMAINS.spiritual.status = 'Mindful: morning reflection completed, focused state';
      MAP_DOMAINS.psychological.value = 0.85;
      MAP_DOMAINS.psychological.status = 'Peaceful: feeling grounded and stable';

      // Mark morning reflection done
      var medItem = TIMELINE_ITEMS.find(function (item) { return item.id === 'meditation-7'; });
      if (medItem) {
        medItem.state = 'done';
        medItem.stateLabel = 'Done';
      }
    }
  }

  // Set up event listeners
  document.addEventListener('click', function (event) {
    var go = event.target.closest('[data-go]');
    if (go) {
      state.view = go.dataset.go;
      if (state.view !== 'dictation') {
        state.recapState = 'idle';
        state.scenario = null;
      }
      render();
      return;
    }

    // Scenario buttons inside the Try sidebar
    var scenarioBtn = event.target.closest('[data-scenario]');
    if (scenarioBtn) {
      startScenario(scenarioBtn.dataset.scenario);
      return;
    }

    // Talk button in mobile app
    var talkBtn = event.target.closest('#talk-btn');
    if (talkBtn) {
      // Default to exhausted scenario if clicked directly
      startScenario('exhausted');
      return;
    }

    // Keep items & shred button
    var keepBtn = event.target.closest('#keep-btn');
    if (keepBtn) {
      state.recapState = 'shredding';
      render();

      setTimeout(function () {
        applyAdjustments(state.scenario);
        state.recapState = 'shredded';
        render();
      }, motionOK ? 1000 : 0);
    }
  });

  render();
})();
