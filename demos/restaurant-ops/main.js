/* Fern & Halyard operations board.
   Everything in DATA is fiction. Edit these objects to change the demo.
   State lives in memory only. Nothing is stored, sent, or persisted. */

const DATA = {

  venue: {
    name: "Fern & Halyard",
    seats: 62,
    date: "Thursday, March 13, 2025",
    now: "18:40",
    lunchCovers: 38,
    walkins: "Walk-in capacity, 8 covers before 20:00 and 4 after 20:30. Two-tops only after 21:00."
  },

  /* Dinner book. status: confirmed, arrived, seated, finished, late, cancelled */
  book: [
    { id: "r1", time: "17:30", name: "Whitlock", size: 2, status: "finished", table: "6", section: "1", server: "Margot Fontaine", source: "Phone", history: "Second visit", note: "" },
    { id: "r2", time: "17:45", name: "Duarte", size: 4, status: "finished", table: "11", section: "2", server: "Ines Alvarado", source: "Online", history: "First visit", note: "" },
    { id: "r3", time: "18:00", name: "Marchetti", size: 2, status: "seated", table: "4", section: "1", server: "Margot Fontaine", source: "Online", history: "Ninth visit", note: "" },
    { id: "r4", time: "18:00", name: "Osei", size: 6, status: "seated", table: "18", section: "3", server: "Priya Raman", source: "Phone", history: "Fourth visit", note: "Nut allergy at the table. Kitchen has the ticket, expo confirmed at 18:04.", noteTag: "Allergy" },
    { id: "r5", time: "18:15", name: "Kovac", size: 3, status: "seated", table: "9", section: "2", server: "Margot Fontaine", source: "Online", history: "First visit", note: "" },
    { id: "r6", time: "18:30", name: "Belanger", size: 4, status: "late", table: "14", section: "2", server: "Margot Fontaine", source: "Online", history: "Third visit", note: "Ten minutes past. No answer on the number they left. Table held until 18:50.", noteTag: "Late" },
    { id: "r7", time: "18:30", name: "Trudel", size: 2, status: "arrived", table: "3", section: "1", server: "Margot Fontaine", source: "Walk-in", history: "First visit", note: "At the bar while table 3 turns." },
    { id: "r8", time: "18:45", name: "Ngo", size: 2, status: "confirmed", table: "7", section: "1", server: "Margot Fontaine", source: "Online", history: "Second visit", note: "" },
    { id: "r9", time: "19:00", name: "Farhadi", size: 8, status: "confirmed", table: "20 and 21", section: "3", server: "Priya Raman", source: "Phone", history: "Sixth visit", note: "Fortieth anniversary. Cake dropped at dessert, no candles, no singing. Guest asked for the quiet end of the room.", noteTag: "Occasion" },
    { id: "r10", time: "19:00", name: "Ashworth", size: 5, status: "cancelled", table: "16", section: "3", server: "Priya Raman", source: "Online", history: "Second visit", note: "Cancelled at 15:20 this afternoon. Table released back to the book." },
    { id: "r11", time: "19:15", name: "Sandoval", size: 2, status: "confirmed", table: "5", section: "1", server: "Margot Fontaine", source: "Online", history: "First visit", note: "" },
    { id: "r12", time: "19:30", name: "Iyer", size: 4, status: "confirmed", table: "12", section: "2", server: "Ines Alvarado", source: "Phone", history: "Eleventh visit", note: "Regulars. Usually take the corner banquette." },
    { id: "r13", time: "19:45", name: "Boucher", size: 2, status: "confirmed", table: "8", section: "1", server: "Margot Fontaine", source: "Online", history: "Third visit", note: "" },
    { id: "r14", time: "20:00", name: "Lindqvist", size: 6, status: "confirmed", table: "19", section: "3", server: "Priya Raman", source: "Online", history: "First visit", note: "" },
    { id: "r15", time: "20:15", name: "Petrov", size: 2, status: "confirmed", table: "2", section: "1", server: "Margot Fontaine", source: "Online", history: "Second visit", note: "" },
    { id: "r16", time: "20:30", name: "Chen", size: 4, status: "confirmed", table: "13", section: "2", server: "Ines Alvarado", source: "Phone", history: "Fifth visit", note: "" },
    { id: "r17", time: "21:00", name: "Moreau", size: 2, status: "confirmed", table: "1", section: "1", server: "Margot Fontaine", source: "Online", history: "First visit", note: "Late seating, kitchen closes the line at 21:30." }
  ],

  brief: [
    { tag: "Book", txt: "Saturday is pacing fuller than the last four Saturdays. 48 covers are on the book by Thursday morning, against 31 at the same point on an average week." },
    { tag: "Kitchen", txt: "Lake trout sold out before nine on Tuesday and Wednesday. Both nights it was the second special called." },
    { tag: "Supplier", txt: "The last two deliveries from Longbourne Meats arrived short. Three portions of striploin on Tuesday, one case of duck legs last Thursday." },
    { tag: "Floor", txt: "Section 3 turned tables slower than the rest of the room on Wednesday, 94 minutes on average against 71 in sections 1 and 2." },
    { tag: "Book", txt: "Two no-shows on Wednesday, both booked online the same afternoon. Neither answered the confirmation message." },
    { tag: "Bar", txt: "The dry Riesling is down to three bottles and the standing order does not land until Monday." }
  ],

  roster: [
    {
      service: "Lunch",
      hours: "11:00 to 15:00",
      crew: [
        { name: "Hattie Lowe", role: "Host, opens", hrs: "10:30 to 15:30" },
        { name: "Dez Okonjo", role: "Server, sections 1 and 2", hrs: "11:00 to 15:30" },
        { name: "Tobias Reyn", role: "Bar", hrs: "11:00 to 15:00" },
        { name: "Nikolai Brandt", role: "Sous, opens the kitchen", hrs: "09:00 to 16:00" },
        { name: "Corinne Aubry", role: "Line", hrs: "10:30 to 15:30" },
        { name: "Femi Adeyemi", role: "Prep and dish", hrs: "09:00 to 15:00" }
      ]
    },
    {
      service: "Dinner",
      hours: "16:00 to close",
      crew: [
        { name: "Priya Raman", role: "Floor, closes", hrs: "16:00 to close" },
        { name: "Margot Fontaine", role: "Server, sections 1 and 2", hrs: "16:00 to close" },
        { name: "Hattie Lowe", role: "Host", hrs: "17:00 to 22:00" },
        { name: "Tobias Reyn", role: "Bar", hrs: "16:00 to close" },
        { name: "Sam Achebe", role: "Chef, closes the kitchen", hrs: "15:00 to close" },
        { name: "Corinne Aubry", role: "Line", hrs: "16:00 to close" },
        { name: "Femi Adeyemi", role: "Dish", hrs: "17:00 to close" }
      ],
      gap: "Section 3 has no server tonight. Ines Alvarado called in sick at 14:10. A swap is waiting in your call."
    }
  ],

  eightySix: [
    { item: "Lake trout", at: "86'd 18:10" },
    { item: "Kusshi oysters", at: "86'd 18:25" },
    { item: "Sticky toffee pudding", at: "86'd from lunch" }
  ],

  par: [
    { item: "Beef striploin", unit: "portions", have: 6, par: 18 },
    { item: "Duck legs", unit: "portions", have: 4, par: 12 },
    { item: "Riesling, dry", unit: "bottles", have: 3, par: 12 },
    { item: "Butter, unsalted", unit: "blocks", have: 2, par: 8 }
  ],

  queue: [
    {
      id: "q1",
      tag: "No-show",
      meta: "Wednesday, 19:30, party of 4",
      label: "Send the follow-up to the Halvorsen table",
      doneLabel: "Sent the follow-up to the Halvorsen table",
      toggle: "View message",
      detail: "To: the number on the booking.\n\nHi Halvorsen, we held a table for four at 7:30 last night and did not hear from you. No trouble at all. If you would like to rebook, reply here and we will find you a night that works."
    },
    {
      id: "q2",
      tag: "No-show",
      meta: "Wednesday, 20:00, party of 2",
      label: "Send the follow-up to the Pruitt table",
      doneLabel: "Sent the follow-up to the Pruitt table",
      toggle: "View message",
      detail: "To: the number on the booking.\n\nHi Pruitt, we had a table for two waiting at 8:00 last night. We hope everything is all right. Reply here if you would like to rebook and we will sort it out."
    },
    {
      id: "q3",
      tag: "Supplier",
      meta: "Friday delivery, cut-off 20:00 tonight",
      label: "Place the Friday order with Longbourne Meats",
      doneLabel: "Placed the Friday order with Longbourne Meats",
      toggle: "View the order",
      detail: "Striploin, 12 portions.\nDuck legs, 8 portions.\n\nNote to the supplier: the last two deliveries arrived short (3 portions of striploin on Tuesday, one case of duck legs last Thursday). Please confirm the count against the packing slip on arrival."
    },
    {
      id: "q4",
      tag: "Roster",
      meta: "Dinner, tonight",
      label: "Confirm the dinner swap, Dez covers for Ines",
      doneLabel: "Confirmed the dinner swap, Dez covers for Ines",
      toggle: "View the swap",
      detail: "Ines Alvarado is off tonight, called in sick at 14:10.\nDez Okonjo has offered 16:00 to close.\n\nDez worked lunch, which puts them at eleven hours on the day. Section 3 is unassigned until this is confirmed."
    },
    {
      id: "q5",
      tag: "Book",
      meta: "Saturday, March 15",
      label: "Hold two tables at 20:15 Saturday for walk-ins",
      doneLabel: "Held two tables at 20:15 Saturday for walk-ins",
      toggle: "View the detail",
      detail: "Hold table 12 and table 14 at 20:15 on Saturday. Both are two-tops.\n\nThe book already shows 48 covers for Saturday. The last four Saturdays took between 9 and 14 walk-ins after eight."
    }
  ]
};

/* ---------- State ---------- */

const clone = (v) => JSON.parse(JSON.stringify(v));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let state;
let liveTimer = null;
let toastTimer = null;

function initState() {
  state = {
    book: clone(DATA.book),
    queue: clone(DATA.queue),
    done: [],
    clock: DATA.venue.now,
    openDetail: null,
    flashId: null
  };
}

/* ---------- Helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const STATUS_WORD = {
  confirmed: "Confirmed",
  arrived: "Arrived",
  seated: "Seated",
  finished: "Finished",
  late: "Late",
  cancelled: "Cancelled"
};

function announce(msg) {
  const live = $("#live");
  live.textContent = "";
  window.setTimeout(() => { live.textContent = msg; }, 60);
}

function addMinute(hhmm, mins) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + mins) % 1440;
  return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/* ---------- Render ---------- */

function renderService() {
  const live = state.book.filter((r) => r.status !== "cancelled");
  const sum = (st) => live.filter((r) => r.status === st).reduce((n, r) => n + r.size, 0);
  const booked = live.reduce((n, r) => n + r.size, 0);
  const seated = sum("seated");
  const waiting = sum("arrived");
  const finished = sum("finished");
  const late = live.filter((r) => r.status === "late").length;

  let line = "Lunch closed at <strong>" + DATA.venue.lunchCovers + " covers</strong>. " +
    "Dinner is <strong>" + booked + " booked</strong> against " + DATA.venue.seats + " seats. " +
    "On the floor now, " + seated + " seated, " + waiting + " waiting at the bar, " + finished + " finished.";
  if (late === 1) line += " One table is running late.";
  if (late > 1) line += " " + late + " tables are running late.";

  $("#serviceLine").innerHTML = line;

  const tiles = [
    { k: "Covers booked", v: booked, tone: "" },
    { k: "Seated now", v: seated, tone: seated > 0 ? "live" : "" },
    { k: "At the bar", v: waiting, tone: "" },
    { k: "Finished", v: finished, tone: "" },
    { k: "Tables late", v: late, tone: late > 0 ? "late" : "" }
  ];
  $("#floor").innerHTML = tiles.map((t) =>
    '<div class="tile' + (t.tone ? " tile--" + t.tone : "") + '">' +
      '<span class="tile__n num">' + t.v + "</span>" +
      '<span class="tile__k">' + esc(t.k) + "</span>" +
    "</div>"
  ).join("");

  $("#paceFill").style.width = Math.min(100, Math.round((booked / DATA.venue.seats) * 100)) + "%";
  $("#paceNum").textContent = booked + " / " + DATA.venue.seats + " seats booked";
  $("#clock").textContent = state.clock;
}

function renderBook() {
  const nowMin = toMinutes(DATA.venue.now);
  const list = $("#book");
  let html = "";
  let markerDropped = false;

  state.book.forEach((r) => {
    if (!markerDropped && toMinutes(r.time) > nowMin) {
      markerDropped = true;
      html += '<li class="now"><span class="now__time num">' + esc(DATA.venue.now) + " now</span><span class=\"now__rule\"></span></li>";
    }

    const flash = state.flashId === r.id ? " res--flash" : "";
    const mod = r.status === "cancelled" ? " res--cancelled"
      : (r.status === "late" ? " res--late"
      : (r.status === "seated" ? " res--seated" : ""));

    html +=
      '<li class="book__row">' +
        '<button type="button" class="res' + mod + flash + '" data-action="detail" data-id="' + esc(r.id) + '">' +
          '<span class="res__rail">' +
            '<span class="res__time num">' + esc(r.time) + "</span>" +
            '<span class="res__size num" aria-hidden="true">' + r.size + "</span>" +
          "</span>" +
          '<span class="res__main">' +
            '<span class="res__name">' + esc(r.name) + "</span>" +
            '<span class="res__meta">Party of ' + r.size + ", table " + esc(r.table) + ", section " + esc(r.section) + "</span>" +
          "</span>" +
          '<span class="res__end">' +
            '<span class="chip chip--' + esc(r.status) + '">' + esc(STATUS_WORD[r.status]) + "</span>" +
          "</span>" +
          (r.note ? '<span class="res__note' + (r.noteTag ? " res__note--flag" : "") + '">' + (r.noteTag ? '<span class="tag tag--flag">' + esc(r.noteTag) + "</span>" : "") + "<span>" + esc(r.note) + "</span></span>" : "") +
        "</button>" +
      "</li>";
  });

  list.innerHTML = html;
  $("#walkins").textContent = DATA.venue.walkins;
  state.flashId = null;
}

function renderBrief() {
  $("#brief").innerHTML = DATA.brief.map((b, i) =>
    "<li>" +
      '<span class="brief__n">' + String(i + 1).padStart(2, "0") + "</span>" +
      '<span class="brief__txt"><span class="brief__tag"><span class="tag">' + esc(b.tag) + "</span></span>" + esc(b.txt) + "</span>" +
    "</li>"
  ).join("");
}

function renderRoster() {
  $("#roster").innerHTML = DATA.roster.map((s) =>
    '<div class="svc">' +
      '<div class="svc__head"><h3>' + esc(s.service) + '</h3><span class="svc__hours">' + esc(s.hours) + "</span></div>" +
      '<ul class="crew">' + s.crew.map((c) =>
        "<li><span class=\"crew__name\">" + esc(c.name) + '<span class="crew__role">' + esc(c.role) + "</span></span>" +
        '<span class="crew__hrs">' + esc(c.hrs) + "</span></li>"
      ).join("") + "</ul>" +
      (s.gap ? '<p class="gap">' + esc(s.gap) + "</p>" : "") +
    "</div>"
  ).join("");
}

function renderStock() {
  $("#eighty").innerHTML = DATA.eightySix.map((e) =>
    "<li><span>" + esc(e.item) + '</span><span class="eighty__at">' + esc(e.at) + "</span></li>"
  ).join("");

  $("#par").innerHTML = DATA.par.map((p) => {
    const pct = Math.round((p.have / p.par) * 100);
    const low = pct <= 33 ? " par__fill--low" : "";
    return "<li>" +
      '<div class="par__top"><span>' + esc(p.item) + '</span><span class="par__count">' + p.have + " of " + p.par + " " + esc(p.unit) + "</span></div>" +
      '<div class="par__track"><span class="par__fill' + low + '" style="width:' + pct + '%"></span></div>' +
    "</li>";
  }).join("");
}

function renderQueue() {
  const list = $("#calls");
  list.innerHTML = state.queue.map((q) => {
    const open = state.openDetail === q.id;
    return '<li data-id="' + esc(q.id) + '">' +
      '<div class="call__head"><span class="tag">' + esc(q.tag) + '</span><span class="call__meta">' + esc(q.meta) + "</span></div>" +
      '<p class="call__label">' + esc(q.label) + "</p>" +
      '<button type="button" class="call__toggle" data-action="toggle" data-id="' + esc(q.id) + '" aria-expanded="' + open + '" aria-controls="d-' + esc(q.id) + '">' + esc(open ? "Hide" : q.toggle) + "</button>" +
      '<div class="call__detail" id="d-' + esc(q.id) + '"' + (open ? "" : " hidden") + ">" + esc(q.detail) + "</div>" +
      '<div class="call__actions">' +
        '<button type="button" class="btn btn--primary" data-action="approve" data-id="' + esc(q.id) + '">Approve</button>' +
        '<button type="button" class="btn btn--quiet" data-action="dismiss" data-id="' + esc(q.id) + '">Dismiss</button>' +
      "</div>" +
    "</li>";
  }).join("");

  $("#callCount").textContent = state.queue.length;
  $("#callsEmpty").hidden = state.queue.length > 0;
}

function renderDone() {
  $("#done").innerHTML = state.done.map((d) =>
    '<li><span class="done__tick" aria-hidden="true">&#10003;</span><span>' + esc(d.label) + '</span><span class="done__at">' + esc(d.at) + "</span></li>"
  ).join("");
  $("#doneEmpty").hidden = state.done.length > 0;
}

function render() {
  renderService();
  renderBook();
  renderQueue();
  renderDone();
}

function renderStatic() {
  renderBrief();
  renderRoster();
  renderStock();
}

/* ---------- Detail sheet ---------- */

function openSheet(id) {
  const r = state.book.find((x) => x.id === id);
  if (!r) return;

  $("#sheetKicker").textContent = r.time + ", " + STATUS_WORD[r.status].toLowerCase();
  $("#sheetTitle").textContent = r.name + ", party of " + r.size;

  const rows = [
    ["Table", r.table],
    ["Section", r.section],
    ["Server", r.server],
    ["Booked by", r.source],
    ["History", r.history],
    ["Note", r.note || "None on file."]
  ];

  $("#sheetBody").innerHTML = '<div class="sheet__rows">' + rows.map(([k, v]) =>
    '<div class="sheet__row"><span class="sheet__k">' + esc(k) + '</span><span class="sheet__v">' + esc(v) + "</span></div>"
  ).join("") + "</div>";

  const dlg = $("#sheet");
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "");
}

/* ---------- Actions ---------- */

/* Branded confirmation. Supplementary only, the Done today list is the record. */
function showToast(label, at) {
  const t = $("#toast");
  $("#toastMsg").textContent = label;
  $("#toastAt").textContent = at;
  t.hidden = false;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { t.hidden = true; }, 4500);
}

function hideToast() {
  if (toastTimer) window.clearTimeout(toastTimer);
  $("#toast").hidden = true;
}

function approve(id) {
  const i = state.queue.findIndex((q) => q.id === id);
  if (i === -1) return;
  const item = state.queue[i];
  state.clock = addMinute(state.clock, 1);
  state.done.unshift({ label: item.doneLabel, at: state.clock });
  state.queue.splice(i, 1);
  if (state.openDetail === id) state.openDetail = null;
  render();
  showToast(item.doneLabel, state.clock);
  announce(item.doneLabel + ".");
}

function dismiss(id) {
  const i = state.queue.findIndex((q) => q.id === id);
  if (i === -1) return;
  const item = state.queue[i];
  state.queue.splice(i, 1);
  if (state.openDetail === id) state.openDetail = null;
  render();
  announce("Dismissed. " + item.label + ".");
}

function toggleDetail(id) {
  state.openDetail = state.openDetail === id ? null : id;
  renderQueue();
  const btn = document.querySelector('[data-action="toggle"][data-id="' + id + '"]');
  if (btn) btn.focus();
}

function resetDemo() {
  if (liveTimer) window.clearTimeout(liveTimer);
  hideToast();
  initState();
  render();
  scheduleLiveEvent();
  announce("Demo reset. The board is back to its opening state.");
}

/* ---------- One simulated live event ---------- */

function scheduleLiveEvent() {
  if (reduceMotion) return;
  liveTimer = window.setTimeout(() => {
    const r = state.book.find((x) => x.id === "r7");
    if (!r || r.status !== "arrived") return;
    r.status = "seated";
    r.note = "Sat at table 3 at 18:41, straight from the bar.";
    state.flashId = r.id;
    render();
    announce(r.name + ", party of " + r.size + ", seated at table " + r.table + ".");
  }, 6000);
}

/* ---------- Wiring ---------- */

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const id = el.dataset.id;

  switch (el.dataset.action) {
    case "detail": openSheet(id); break;
    case "toggle": toggleDetail(id); break;
    case "approve": approve(id); break;
    case "dismiss": dismiss(id); break;
    case "reset": resetDemo(); break;
    case "close-sheet": $("#sheet").close(); break;
  }
});

$("#sheet").addEventListener("click", (e) => {
  if (e.target.id === "sheet") $("#sheet").close();
});

initState();
renderStatic();
render();
scheduleLiveEvent();
