(function () {
  "use strict";

  var D = window.CL_DATA;
  var STEPS = ["The idea", "Search the region", "Follow a referral", "Update the registry", "What it is not"];
  var DUE_DAYS = 60;
  var STATUS = { open: "Open", waitlist: "Waitlist", paused: "Paused" };

  var current = 0;
  var refAt = 0;
  var editing = null;

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function daysText(d) {
    if (d === 0) return "checked today";
    if (d === 1) return "checked yesterday";
    return "checked " + d + " days ago";
  }

  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }

  /* ---------- tour ---------- */

  function buildDots() {
    var wrap = $("dots");
    STEPS.forEach(function (label, i) {
      var b = el("button", "dot");
      b.type = "button";
      b.setAttribute("aria-label", label);
      b.addEventListener("click", function () { go(i); });
      wrap.appendChild(b);
    });
  }

  function go(i) {
    if (i < 0 || i >= STEPS.length) return;
    current = i;
    document.querySelectorAll(".step").forEach(function (s) {
      s.classList.toggle("is-open", Number(s.getAttribute("data-step")) === i);
    });
    document.querySelectorAll(".dot").forEach(function (d, j) {
      d.classList.toggle("active", j === i);
      if (j === i) d.setAttribute("aria-current", "step");
      else d.removeAttribute("aria-current");
    });
    $("tour-label").textContent = STEPS[i];
    $("back").disabled = i === 0;
    $("next").disabled = i === STEPS.length - 1;
    window.scrollTo(0, 0);
    if (i === 1) renderResults();
  }

  /* ---------- system map ---------- */

  function showSystem(key) {
    var s = D.systems[key];
    document.querySelectorAll(".sys").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-sys") === key));
    });
    var box = $("sys-detail");
    box.innerHTML = "";
    box.appendChild(el("p", "sys-detail-h", s.name + ", unchanged"));
    var r = el("p", "sys-detail-b");
    r.appendChild(el("b", null, "The layer reads: "));
    r.appendChild(document.createTextNode(s.reads));
    box.appendChild(r);
    var n = el("p", "sys-detail-b");
    n.appendChild(el("b", null, "Never touches: "));
    n.appendChild(document.createTextNode(s.never));
    box.appendChild(n);
  }

  /* ---------- search ---------- */

  function haystack(s) {
    return [s.name, s.agency, s.town, s.desc, s.tags.join(" ")].join(" ").toLowerCase();
  }

  function matches(s, words, town, openOnly) {
    if (town && s.town !== town) return false;
    if (openOnly && s.status !== "open") return false;
    var h = haystack(s).split(/[^a-z0-9]+/);
    return words.every(function (w) {
      return h.some(function (word) { return word.indexOf(w) === 0; });
    });
  }

  function renderResults() {
    var q = $("q").value.trim().toLowerCase();
    var words = q.split(/\s+/).filter(function (w) { return w && w !== "in" && w !== "the"; })
      .map(function (w) { return w.replace(/s$/, ""); });
    var town = $("town").value;
    var openOnly = $("open-only").checked;
    var list = D.services.filter(function (s) { return matches(s, words, town, openOnly); });

    var ul = $("results");
    ul.innerHTML = "";
    list.forEach(function (s) {
      var li = el("li", "res");
      var head = el("div", "res-head");
      head.appendChild(el("span", "res-name", s.name));
      head.appendChild(el("span", "status status-" + s.status, STATUS[s.status]));
      li.appendChild(head);
      li.appendChild(el("p", "res-agency", s.agency + " · " + s.town));
      li.appendChild(el("p", "res-desc", s.desc));
      var meta = el("p", "res-meta");
      meta.appendChild(el("span", null, s.hours));
      meta.appendChild(el("span", null, s.phone + " (sample)"));
      var c = el("span", s.checked > DUE_DAYS ? "stale" : "fresh", "Listing " + daysText(s.checked));
      meta.appendChild(c);
      li.appendChild(meta);
      if (s.justUpdated) li.classList.add("res-updated");
      ul.appendChild(li);
    });

    var agencies = {};
    list.forEach(function (s) { agencies[s.agency] = true; });
    var na = Object.keys(agencies).length;
    $("count").textContent = list.length === 0
      ? "No listings match. Try a shorter word."
      : list.length + (list.length === 1 ? " service" : " services") + " from " + na + (na === 1 ? " agency" : " agencies");
  }

  function setupSearch() {
    var sel = $("town");
    D.towns.forEach(function (t) {
      var o = el("option", null, t);
      o.value = t;
      sel.appendChild(o);
    });
    $("q").addEventListener("input", renderResults);
    sel.addEventListener("change", renderResults);
    $("open-only").addEventListener("change", renderResults);
    document.querySelectorAll("#suggest .chip").forEach(function (b) {
      b.addEventListener("click", function () {
        $("q").value = b.getAttribute("data-q");
        renderResults();
      });
    });
  }

  /* ---------- referral ---------- */

  function renderReferral() {
    var steps = D.referral.steps;
    var ol = $("path");
    ol.innerHTML = "";
    steps.forEach(function (st, i) {
      var state = i < refAt ? "done" : i === refAt ? "now" : "next";
      var li = el("li", "node node-" + state);
      li.appendChild(el("span", "node-mark", i < refAt ? "✓" : String(i + 1)));
      var body = el("div", "node-body");
      body.appendChild(el("p", "node-role", st.role));
      body.appendChild(el("p", "node-agency", st.agency));
      body.appendChild(el("p", "node-act", st.act));
      if (state === "done") body.appendChild(el("p", "node-time", "Done " + st.time));
      if (state === "now") {
        body.appendChild(el("p", "node-owner", "Owner right now"));
        var b = el("button", "btn btn-primary btn-sm", st.button);
        b.type = "button";
        b.addEventListener("click", advanceReferral);
        body.appendChild(b);
      }
      li.appendChild(body);
      ol.appendChild(li);
    });

    var now = $("ref-now");
    now.innerHTML = "";
    var notice = $("notice");
    if (refAt < steps.length) {
      var s = steps[refAt];
      now.appendChild(el("p", "ref-now-l", "Where it stands"));
      now.appendChild(el("p", "ref-now-v", "Step " + (refAt + 1) + " of " + steps.length + ", with the " + s.role.toLowerCase() + " at " + s.agency));
      notice.textContent = refAt === 0
        ? "Nothing sent yet. The referral is still being opened at Ashgrove."
        : "A " + D.referral.service.toLowerCase() + " referral is waiting for you (" + s.role.toLowerCase() + "). Open it in your own records system.";
    } else {
      now.appendChild(el("p", "ref-now-l", "Where it stands"));
      now.appendChild(el("p", "ref-now-v", "Closed. Four steps, two agencies, three days, and no one had to chase it."));
      notice.textContent = "Your housing intake referral from Day 1 is complete. Nothing else is needed.";
      var again = el("button", "btn btn-quiet btn-sm", "Run it again");
      again.type = "button";
      again.addEventListener("click", function () { refAt = 0; renderReferral(); });
      now.appendChild(again);
    }
  }

  function advanceReferral() {
    var steps = D.referral.steps;
    var done = steps[refAt];
    refAt += 1;
    renderReferral();
    toast(refAt < steps.length
      ? "Handed to the " + steps[refAt].role.toLowerCase() + ". Notice sent."
      : "Loop closed. " + done.agency + " knows it landed.");
  }

  /* ---------- registry ---------- */

  function owned() { return D.services.filter(function (s) { return s.owned; }); }

  function renderHealth() {
    var fresh = D.services.filter(function (s) { return s.checked <= DUE_DAYS; }).length;
    var total = D.services.length;
    $("health-fill").style.width = Math.round(fresh / total * 100) + "%";
    $("health-text").textContent = fresh + " of " + total + " listings in the region checked in the last " + DUE_DAYS + " days";
  }

  function renderOwned() {
    var ul = $("own");
    ul.innerHTML = "";
    owned().forEach(function (s) {
      var li = el("li", "own-item" + (editing === s.id ? " is-editing" : ""));
      var head = el("div", "res-head");
      head.appendChild(el("span", "res-name", s.name));
      head.appendChild(el("span", "status status-" + s.status, STATUS[s.status]));
      li.appendChild(head);
      li.appendChild(el("p", "res-meta-line", s.hours + " · " + s.phone));
      var foot = el("div", "own-foot");
      foot.appendChild(el("span", s.checked > DUE_DAYS ? "stale" : "fresh",
        (s.checked > DUE_DAYS ? "Due for a check, " : "") + daysText(s.checked)));
      var b = el("button", "btn btn-quiet btn-sm", editing === s.id ? "Editing" : "Edit");
      b.type = "button";
      b.addEventListener("click", function () { openEdit(s.id); });
      foot.appendChild(b);
      li.appendChild(foot);
      ul.appendChild(li);
    });
    renderHealth();
  }

  function find(id) {
    for (var i = 0; i < D.services.length; i++) if (D.services[i].id === id) return D.services[i];
    return null;
  }

  function openEdit(id) {
    var s = find(id);
    editing = id;
    $("edit-h").textContent = s.name;
    $("f-hours").value = s.hours;
    $("f-phone").value = s.phone;
    $("f-status").value = s.status;
    $("edit").hidden = false;
    renderOwned();
    if (window.matchMedia("(max-width: 760px)").matches) $("edit").scrollIntoView({ behavior: "smooth", block: "start" });
    $("f-hours").focus({ preventScroll: true });
  }

  function logLine(text) {
    var li = el("li", null, text);
    $("log-list").insertBefore(li, $("log-list").firstChild);
    $("log").hidden = false;
  }

  function save(e) {
    e.preventDefault();
    var s = find(editing);
    if (!s) return;
    var changes = [];
    var hours = $("f-hours").value.trim() || s.hours;
    var phone = $("f-phone").value.trim() || s.phone;
    var status = $("f-status").value;
    if (hours !== s.hours) changes.push("hours " + s.hours + " → " + hours);
    if (phone !== s.phone) changes.push("phone " + s.phone + " → " + phone);
    if (status !== s.status) changes.push("status " + STATUS[s.status] + " → " + STATUS[status]);
    s.hours = hours; s.phone = phone; s.status = status;
    s.checked = 0;
    D.services.forEach(function (x) { x.justUpdated = false; });
    s.justUpdated = true;
    logLine(s.name + ": " + (changes.length ? changes.join("; ") : "checked, no changes") + ". Today, by Program lead.");
    lastSaved = s.name;
    editing = null;
    $("edit").hidden = true;
    renderOwned();
    toast("Saved. Live in the regional search now.");
  }

  function confirmSame() {
    var s = find(editing);
    if (!s) return;
    s.checked = 0;
    logLine(s.name + ": checked, still correct. Today, by Program lead.");
    lastSaved = s.name;
    editing = null;
    $("edit").hidden = true;
    renderOwned();
    toast("Marked as checked today.");
  }

  var lastSaved = null;

  function setupRegistry() {
    $("edit").addEventListener("submit", save);
    $("confirm").addEventListener("click", confirmSame);
    $("see-live").addEventListener("click", function () {
      $("q").value = lastSaved ? lastSaved.toLowerCase() : "";
      $("town").value = "";
      $("open-only").checked = false;
      go(1);
    });
  }

  /* ---------- start ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    buildDots();
    document.querySelectorAll(".sys").forEach(function (b) {
      b.addEventListener("click", function () { showSystem(b.getAttribute("data-sys")); });
    });
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { go(Number(b.getAttribute("data-go"))); });
    });
    $("back").addEventListener("click", function () { go(current - 1); });
    $("next").addEventListener("click", function () { go(current + 1); });
    setupSearch();
    setupRegistry();
    renderResults();
    renderReferral();
    renderOwned();

    var start = Number((location.hash.match(/^#step-(\d)$/) || [])[1] || 0);
    go(start);
  });
})();
