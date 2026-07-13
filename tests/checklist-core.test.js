const test = require("node:test");
const assert = require("node:assert/strict");

const categories = require("../checklist-data.js");
const core = require("../checklist-core.js");

test("contains fifteen evidence checks across three categories", () => {
  assert.equal(categories.length, 3);
  assert.equal(core.flattenItems(categories).length, 15);
});

test("normalizes missing and invalid statuses to unknown", () => {
  const state = core.normalizeState(categories, {
    lockfile: "confirmed",
    readme: "unsafe-value",
    ignored: "attention"
  });
  assert.equal(state.lockfile, "confirmed");
  assert.equal(state.readme, "unknown");
  assert.equal(Object.hasOwn(state, "ignored"), false);
});

test("summarizes confirmed attention and unknown statuses", () => {
  const state = core.normalizeState(categories, {
    lockfile: "confirmed",
    readme: "attention",
    license: "confirmed"
  });
  const summary = core.summarize(categories, state);
  assert.deepEqual(
    { confirmed: summary.confirmed, attention: summary.attention, unknown: summary.unknown, total: summary.total, percent: summary.percent },
    { confirmed: 2, attention: 1, unknown: 12, total: 15, percent: 13 }
  );
});

test("report includes recorded status and scope disclaimer", () => {
  const state = core.normalizeState(categories, {
    "no-live-secrets": "attention",
    "server-authorization": "confirmed"
  });
  const report = core.renderTextReport(categories, state, new Date("2026-07-13T00:00:00.000Z"));
  assert.match(report, /\[NEEDS WORK\] Source files contain no working credentials/);
  assert.match(report, /\[CONFIRMED\] Authorization is enforced on the server/);
  assert.match(report, /not a penetration test/);
});
