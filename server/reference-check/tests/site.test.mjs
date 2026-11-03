import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const siteFile = (path) => readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");

function formHarness(fetchImpl) {
  const source = siteFile("main.js");
  const error = { hidden: true };
  const button = { disabled: false, innerHTML: "Original button" };
  const confirmation = { hidden: true };
  let submit;
  let timeout;
  let cleared = false;
  const form = {
    hidden: false,
    getAttribute(name) { return { "data-confirm": "#confirm", "data-sending": "Starting" }[name]; },
    querySelector(selector) { return selector === "[data-form-error]" ? error : button; },
    reportValidity() { return true; },
    addEventListener(_name, callback) { submit = callback; },
  };
  const context = {
    document: { querySelectorAll() { return [form]; }, querySelector() { return confirmation; } },
    window: {
      location: { pathname: "/" }, fetch: fetchImpl,
      setTimeout(callback, delay) { assert.equal(delay, 20000); timeout = callback; return 1; },
      clearTimeout() { cleared = true; },
    },
    URLSearchParams, AbortController,
    FormData: class { *[Symbol.iterator]() { yield ["form-name", "contact"]; yield ["name", "A & B"]; } },
  };
  vm.runInNewContext(source.slice(source.indexOf("function wireForm()"), source.indexOf("\ntrackSections();")) + "\nwireForm();", context);
  return { form, button, error, confirmation, submit: () => submit({ preventDefault() {} }), expire: () => timeout(), cleared: () => cleared };
}

test("contact form timeout restores controls and preserves entered data without retrying", async () => {
  let calls = 0;
  const harness = formHarness((_url, options) => {
    calls++;
    assert.equal(options.body, "form-name=contact&name=A+%26+B");
    return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(options.signal.reason)));
  });
  harness.submit();
  harness.submit();
  assert.equal(calls, 1);
  assert.equal(harness.button.disabled, true);
  harness.expire();
  await new Promise(setImmediate);
  assert.equal(harness.button.disabled, false);
  assert.equal(harness.button.innerHTML, "Original button");
  assert.equal(harness.error.hidden, false);
  assert.equal(harness.form.hidden, false);
  assert.equal(harness.cleared(), true);
  assert.equal(calls, 1);
});

test("contact form success still shows the existing confirmation and clears its timer", async () => {
  const harness = formHarness(async () => ({ ok: true }));
  harness.submit();
  await new Promise(setImmediate);
  assert.equal(harness.form.hidden, true);
  assert.equal(harness.confirmation.hidden, false);
  assert.equal(harness.error.hidden, true);
  assert.equal(harness.cleared(), true);
});

test("demo goal and indicator inputs are escaped at HTML sinks", () => {
  const source = siteFile("demos/bpss-ses/index.html");
  const elements = new Map();
  const payload = '<img src=x onerror="alert(1)">&';
  const context = {
    GOAL: { name: payload, ind: [payload] },
    document: { getElementById(id) { if (!elements.has(id)) elements.set(id, {}); return elements.get(id); } },
    baseAlign() { return 0; }, renderMapCenter() {},
  };
  vm.runInNewContext(source.slice(source.indexOf("function escapeHtml("), source.indexOf("function openGoal(")) + "\nsetGauge = () => {}; renderGoal();", context);
  assert.equal(elements.get("goalName").textContent, payload);
  for (const id of ["goalInds", "mapCap"]) {
    assert.doesNotMatch(elements.get(id).innerHTML, /<img/);
    assert.match(elements.get(id).innerHTML, /&lt;img/);
  }
  assert.ok(source.includes("${escapeHtml(GOAL.name)}</b>.</div>"));
});

test("portal preferences work for the current visit when storage access throws", () => {
  const source = siteFile("demos/emr-portal/app.js");
  const storage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("full"); }, removeItem() { throw new Error("blocked"); } };
  const context = vm.createContext({ localStorage: storage });
  vm.runInContext(source.slice(source.indexOf("  const memoryStorage"), source.indexOf("  /* ---------------- theme")), context);
  assert.equal(vm.runInContext("readPreference('test')", context), null);
  vm.runInContext("writePreference('test', 'dark')", context);
  assert.equal(vm.runInContext("readPreference('test')", context), "dark");
  vm.runInContext("writePreference('test', '')", context);
  assert.equal(vm.runInContext("readPreference('test')", context), "");
});

test("portal first-paint theme survives disabled storage", () => {
  const source = siteFile("demos/emr-portal/index.html");
  let theme;
  vm.runInNewContext(source.match(/<script>([\s\S]*?)<\/script>/)[1], {
    get localStorage() { throw new Error("blocked"); },
    window: { matchMedia() { return { matches: true }; } },
    document: { documentElement: { setAttribute(_name, value) { theme = value; } } },
  });
  assert.equal(theme, "dark");
});
