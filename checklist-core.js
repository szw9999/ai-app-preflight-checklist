(function attachChecklistCore(root, factory) {
  const core = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = core;
  }
  if (root) {
    root.PreflightChecklistCore = core;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createChecklistCore() {
  "use strict";

  const VALID_STATUSES = new Set(["unknown", "confirmed", "attention"]);

  function flattenItems(categories) {
    return categories.flatMap((category) => category.items.map((item) => ({
      ...item,
      categoryId: category.id,
      categoryTitle: category.title
    })));
  }

  function normalizeState(categories, candidate) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    return Object.fromEntries(flattenItems(categories).map((item) => {
      const status = VALID_STATUSES.has(source[item.id]) ? source[item.id] : "unknown";
      return [item.id, status];
    }));
  }

  function summarize(categories, state) {
    const normalized = normalizeState(categories, state);
    const counts = { confirmed: 0, attention: 0, unknown: 0 };
    Object.values(normalized).forEach((status) => {
      counts[status] += 1;
    });
    const total = Object.keys(normalized).length;
    const percent = total === 0 ? 0 : Math.round((counts.confirmed / total) * 100);
    return { ...counts, total, percent, state: normalized };
  }

  function decisionMessage(summary) {
    if (summary.attention > 0) {
      return `${summary.attention} item${summary.attention === 1 ? "" : "s"} need work before release.`;
    }
    if (summary.unknown > 0) {
      return `${summary.unknown} item${summary.unknown === 1 ? "" : "s"} remain unverified. Unknown is not the same as safe.`;
    }
    return "All items are recorded as confirmed. Keep the evidence and review the limits before release.";
  }

  function renderTextReport(categories, state, generatedAt = new Date()) {
    const summary = summarize(categories, state);
    const lines = [
      "AI App Preflight Checklist Summary",
      "==================================",
      "",
      `Generated: ${generatedAt.toISOString()}`,
      `Confirmed: ${summary.confirmed}/${summary.total}`,
      `Needs work: ${summary.attention}`,
      `Not checked: ${summary.unknown}`,
      ""
    ];

    categories.forEach((category) => {
      lines.push(category.title, "-".repeat(category.title.length));
      category.items.forEach((item) => {
        const status = summary.state[item.id];
        const label = status === "confirmed" ? "CONFIRMED" : status === "attention" ? "NEEDS WORK" : "NOT CHECKED";
        lines.push(`[${label}] ${item.title}`);
      });
      lines.push("");
    });

    lines.push("Decision note", "-------------", decisionMessage(summary), "");
    lines.push("This checklist is a planning aid, not a penetration test, security certification, or guarantee that an application is defect-free.");
    return lines.join("\n");
  }

  return Object.freeze({
    VALID_STATUSES,
    flattenItems,
    normalizeState,
    summarize,
    decisionMessage,
    renderTextReport
  });
});
