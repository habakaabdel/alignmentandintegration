(function () {
  'use strict';

  var TABS = ['find-services', 'plan-progress', 'about-plan'];
  var BREADCRUMB_LABEL = {
    'find-services': 'Find Services',
    'plan-progress': 'Plan Progress',
    'about-plan': 'About The Plan'
  };

  var state = {
    query: '',
    needs: new Set(),
    indigenousOnly: false
  };

  var searchInput = document.getElementById('service-search');
  var needChipsWrap = document.getElementById('need-chips');
  var indigenousChip = document.getElementById('indigenous-chip');
  var resultsList = document.getElementById('results-list');
  var resultCount = document.getElementById('result-count');
  var emptyState = document.getElementById('empty-state');
  var clearFiltersBtn = document.getElementById('clear-filters-btn');
  var breadcrumbCurrent = document.getElementById('breadcrumb-current');

  // Phosphor renders through a pseudo-element, which some screen readers announce.
  // Every icon here is decorative and paired with visible text.
  function icon(name) {
    var el = document.createElement('i');
    el.className = 'ph ' + name;
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  function isPresent(value) {
    if (!value) return false;
    var trimmed = String(value).trim();
    if (trimmed === '' || trimmed.toUpperCase() === 'N/A') return false;
    return true;
  }

  function isValidWebsite(value) {
    if (!isPresent(value)) return false;
    var trimmed = value.trim();
    if (/n\/a/i.test(trimmed)) return false;
    return /^https?:\/\//i.test(trimmed);
  }

  function getPreview(text) {
    var clean = String(text || '').trim();
    var sentenceEnd = /[.!?](\s|\n|$)/g;
    var count = 0;
    var cut = -1;
    var match;
    while ((match = sentenceEnd.exec(clean)) !== null) {
      count++;
      cut = match.index + 1;
      if (count >= 2 || cut > 260) break;
    }
    if (cut === -1 || cut < 20) {
      if (clean.length <= 220) {
        return { preview: clean, hasMore: false };
      }
      var trimmed = clean.slice(0, 220);
      var lastSpace = trimmed.lastIndexOf(' ');
      if (lastSpace > 0) trimmed = trimmed.slice(0, lastSpace);
      return { preview: trimmed + '…', hasMore: true };
    }
    var preview = clean.slice(0, cut).trim();
    return { preview: preview, hasMore: preview.length < clean.length };
  }

  function buildNeedChips() {
    var needs = DB.needs;
    needs.forEach(function (need) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip';
      
      var chipIcon = icon('ph-plus');
      btn.appendChild(chipIcon);
      
      var textNode = document.createTextNode(' ' + need);
      btn.appendChild(textNode);
      
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.need = need;
      btn.addEventListener('click', function () {
        if (state.needs.has(need)) {
          state.needs.delete(need);
          btn.setAttribute('aria-pressed', 'false');
          chipIcon.className = 'ph ph-plus';
        } else {
          state.needs.add(need);
          btn.setAttribute('aria-pressed', 'true');
          chipIcon.className = 'ph ph-check';
        }
        renderResults();
      });
      needChipsWrap.appendChild(btn);
    });
  }

  function serviceMatchesQuery(service, query) {
    if (!query) return true;
    var haystack = [
      service.name,
      service.services,
      (service.categories || []).join(' '),
      (service.needs || []).join(' ')
    ].join(' ').toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function serviceMatchesNeeds(service) {
    if (state.needs.size === 0) return true;
    var serviceNeeds = service.needs || [];
    for (var need of state.needs) {
      if (serviceNeeds.indexOf(need) !== -1) return true;
    }
    return false;
  }

  function serviceMatchesIndigenous(service) {
    if (!state.indigenousOnly) return true;
    return service.indigenous === true;
  }

  function getFilteredServices() {
    var query = state.query.trim().toLowerCase();
    return DB.services.filter(function (service) {
      return serviceMatchesQuery(service, query) &&
        serviceMatchesNeeds(service) &&
        serviceMatchesIndigenous(service);
    });
  }

  function buildPhoneButtons(service, actionsRow) {
    var phones = service.phones || [];
    phones.forEach(function (phone, index) {
      var link = document.createElement('a');
      link.className = index === 0 ? 'btn-primary' : 'btn-call-secondary';
      link.href = 'tel:' + phone.tel;
      
      var isUrgent = /crisis/i.test(phone.label || '') || /toll.free/i.test(phone.label || '');
      link.appendChild(icon(isUrgent ? 'ph-phone-call' : 'ph-phone'));
      
      var label = phones.length > 1 && phone.label ? phone.label + ': ' : '';
      var span = document.createElement('span');
      span.textContent = 'Call ' + label + phone.display;
      link.appendChild(span);
      
      actionsRow.appendChild(link);
    });
  }

  function buildResultCard(service, index) {
    var li = document.createElement('li');
    li.className = 'result-card';
    li.style.animationDelay = (index * 40) + 'ms'; // staggered enter effect

    var inner = document.createElement('div');
    inner.className = 'result-card-inner';
    li.appendChild(inner);

    var name = document.createElement('h3');
    name.className = 'result-name';
    name.textContent = service.name;
    inner.appendChild(name);

    if (isPresent(service.services)) {
      var descP = document.createElement('p');
      descP.className = 'result-desc';
      var previewData = getPreview(service.services);

      var shortSpan = document.createElement('span');
      shortSpan.className = 'desc-short';
      shortSpan.textContent = previewData.preview;
      descP.appendChild(shortSpan);

      if (previewData.hasMore) {
        var fullSpan = document.createElement('span');
        fullSpan.className = 'desc-full';
        fullSpan.textContent = service.services.trim();
        fullSpan.hidden = true;
        descP.appendChild(fullSpan);

        var expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'expand-btn';
        expandBtn.setAttribute('aria-expanded', 'false');
        expandBtn.textContent = 'Read more';
        expandBtn.addEventListener('click', function () {
          var expanded = expandBtn.getAttribute('aria-expanded') === 'true';
          expandBtn.setAttribute('aria-expanded', String(!expanded));
          expandBtn.textContent = expanded ? 'Read more' : 'Show less';
          
          // Smooth swap
          shortSpan.hidden = !expanded;
          fullSpan.hidden = expanded;
        });
        descP.appendChild(expandBtn);
      }
      inner.appendChild(descP);
    }

    if (isPresent(service.address)) {
      var addressP = document.createElement('p');
      addressP.className = 'result-address';
      
      addressP.appendChild(icon('ph-map-pin'));
      
      var textSpan = document.createElement('span');
      textSpan.textContent = service.address.trim();
      addressP.appendChild(textSpan);
      
      inner.appendChild(addressP);
    }

    if (isPresent(service.eligibility)) {
      var eligP = document.createElement('p');
      eligP.className = 'result-eligibility';
      
      eligP.appendChild(icon('ph-shield-check'));
      
      var textSpan = document.createElement('span');
      var eligStrong = document.createElement('strong');
      eligStrong.textContent = 'Eligibility: ';
      textSpan.appendChild(eligStrong);
      textSpan.appendChild(document.createTextNode(service.eligibility.trim()));
      eligP.appendChild(textSpan);
      
      inner.appendChild(eligP);
    }

    var needs = service.needs || [];
    if (needs.length > 0 || service.indigenous) {
      var tagsList = document.createElement('ul');
      tagsList.className = 'need-tags';
      needs.forEach(function (need) {
        var tagLi = document.createElement('li');
        tagLi.className = 'need-tag';
        tagLi.textContent = need;
        tagsList.appendChild(tagLi);
      });
      if (service.indigenous) {
        var indigLi = document.createElement('li');
        indigLi.className = 'need-tag need-tag-indigenous';
        indigLi.textContent = 'Indigenous-led / Indigenous-serving';
        tagsList.appendChild(indigLi);
      }
      inner.appendChild(tagsList);
    }

    var actionsRow = document.createElement('div');
    actionsRow.className = 'actions-row';
    buildPhoneButtons(service, actionsRow);

    if (isValidWebsite(service.website)) {
      var webLink = document.createElement('a');
      webLink.className = 'btn-website';
      webLink.href = service.website.trim();
      webLink.target = '_blank';
      webLink.rel = 'noopener';
      
      webLink.appendChild(icon('ph-globe'));
      
      var span = document.createElement('span');
      span.textContent = 'Website';
      webLink.appendChild(span);
      
      actionsRow.appendChild(webLink);
    }

    if (isPresent(service.email)) {
      var emailLink = document.createElement('a');
      emailLink.className = 'btn-email';
      emailLink.href = 'mailto:' + service.email.trim();
      
      emailLink.appendChild(icon('ph-envelope'));
      
      var span = document.createElement('span');
      span.textContent = 'Email';
      emailLink.appendChild(span);
      
      actionsRow.appendChild(emailLink);
    }

    inner.appendChild(actionsRow);

    var note = document.createElement('p');
    note.className = 'result-note';
    
    note.appendChild(icon('ph-warning-circle'));

    var textSpan = document.createElement('span');
    textSpan.textContent = 'Information can change. Confirm by phone.';
    note.appendChild(textSpan);
    
    inner.appendChild(note);

    return li;
  }

  function renderResults() {
    var filtered = getFilteredServices();
    var total = DB.services.length; // DB count correction

    resultsList.innerHTML = '';
    filtered.forEach(function (service, idx) {
      resultsList.appendChild(buildResultCard(service, idx));
    });

    resultCount.textContent = 'Showing ' + filtered.length + ' of ' + total + ' services';
    emptyState.hidden = filtered.length !== 0;
    resultsList.hidden = filtered.length === 0;
  }

  function clearFilters() {
    state.query = '';
    state.needs.clear();
    state.indigenousOnly = false;
    searchInput.value = '';
    indigenousChip.setAttribute('aria-pressed', 'false');
    
    var indigIcon = indigenousChip.querySelector('i');
    if (indigIcon) indigIcon.className = 'ph ph-users';
    
    needChipsWrap.querySelectorAll('.filter-chip').forEach(function (btn) {
      btn.setAttribute('aria-pressed', 'false');
      var chipIcon = btn.querySelector('i');
      if (chipIcon) chipIcon.className = 'ph ph-plus';
    });
    renderResults();
  }

  function initFindServices() {
    buildNeedChips();

    searchInput.addEventListener('input', function () {
      state.query = searchInput.value;
      renderResults();
    });

    indigenousChip.addEventListener('click', function () {
      state.indigenousOnly = !state.indigenousOnly;
      indigenousChip.setAttribute('aria-pressed', String(state.indigenousOnly));
      var indigIcon = indigenousChip.querySelector('i');
      if (indigIcon) {
        indigIcon.className = state.indigenousOnly ? 'ph ph-check' : 'ph ph-users';
      }
      renderResults();
    });

    clearFiltersBtn.addEventListener('click', clearFilters);

    renderResults();
  }

  function activateTab(tabId, options) {
    options = options || {};
    if (TABS.indexOf(tabId) === -1) tabId = TABS[0];

    TABS.forEach(function (id) {
      var panel = document.getElementById(id);
      var tabBtn = document.getElementById('tab-' + id);
      var isActive = id === tabId;
      
      panel.hidden = !isActive;
      tabBtn.setAttribute('aria-selected', String(isActive));
      tabBtn.tabIndex = isActive ? 0 : -1;
      
      if (isActive) {
        panel.classList.add('active-panel');
        // trigger animation redraw
        panel.style.animation = 'none';
        panel.offsetHeight; // trigger reflow
        panel.style.animation = 'fadeUpCard 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      } else {
        panel.classList.remove('active-panel');
      }
    });

    breadcrumbCurrent.textContent = BREADCRUMB_LABEL[tabId];

    if (!options.skipHash && window.location.hash !== '#' + tabId) {
      window.location.hash = tabId;
    }

    if (options.focusPanel) {
      document.getElementById(tabId).focus();
    }
  }

  function initTabs() {
    var tabButtons = document.querySelectorAll('.tab-link');
    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateTab(btn.dataset.tab, { focusPanel: true });
      });
    });

    tabButtons.forEach(function (btn, index) {
      btn.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = TABS.length - 1;
        if (next === null) return;
        event.preventDefault();
        activateTab(TABS[next]);
        document.getElementById('tab-' + TABS[next]).focus();
      });
    });

    window.addEventListener('hashchange', function () {
      var tabId = window.location.hash.replace('#', '');
      activateTab(tabId, { skipHash: true });
    });

    var initialTab = window.location.hash.replace('#', '') || TABS[0];
    activateTab(initialTab, { skipHash: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initFindServices();
  });
})();
