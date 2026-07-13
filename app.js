(function startChecklistApp() {
  "use strict";

  const STORAGE_KEY = "ai-app-preflight-checklist-v1";
  const categories = window.PreflightChecklistData;
  const core = window.PreflightChecklistCore;
  const config = window.PREFLIGHT_SITE_CONFIG || {};
  const checklist = document.querySelector("#checklist");
  const categoryTemplate = document.querySelector("#category-template");
  const itemTemplate = document.querySelector("#item-template");

  let state = loadState();

  function loadState() {
    try {
      return core.normalizeState(categories, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return core.normalizeState(categories, {});
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderChecklist() {
    categories.forEach((category, categoryIndex) => {
      const categoryNode = categoryTemplate.content.firstElementChild.cloneNode(true);
      categoryNode.dataset.categoryId = category.id;
      categoryNode.querySelector(".category-number").textContent = `Section ${categoryIndex + 1}`;
      categoryNode.querySelector("h2").textContent = category.title;
      categoryNode.querySelector(".category-summary").textContent = category.summary;
      const rows = categoryNode.querySelector(".checklist-rows");

      category.items.forEach((item) => {
        const row = itemTemplate.content.firstElementChild.cloneNode(true);
        row.dataset.itemId = item.id;
        row.dataset.status = state[item.id];
        row.querySelector("h3").textContent = item.title;
        row.querySelector(".item-copy p").textContent = item.detail;
        const legend = row.querySelector("legend");
        legend.textContent = `${item.title} verification status`;

        row.querySelectorAll("input[type='radio']").forEach((input) => {
          input.name = `status-${item.id}`;
          input.checked = input.value === state[item.id];
          input.addEventListener("change", () => {
            state[item.id] = input.value;
            row.dataset.status = input.value;
            saveState();
            updateSummary();
          });
        });
        rows.append(row);
      });
      checklist.append(categoryNode);
    });
  }

  function updateSummary() {
    const summary = core.summarize(categories, state);
    document.querySelector("#confirmed-count").textContent = summary.confirmed;
    document.querySelector("#attention-count").textContent = summary.attention;
    document.querySelector("#unknown-count").textContent = summary.unknown;
    document.querySelector("#progress-label").textContent = `${summary.confirmed} of ${summary.total} confirmed`;
    document.querySelector("#progress-percent").textContent = `${summary.percent}%`;
    document.querySelector("#attention-label").textContent = `${summary.attention} item${summary.attention === 1 ? "" : "s"} need work`;
    document.querySelector("#progress-bar").value = summary.confirmed;
    document.querySelector("#progress-bar").textContent = `${summary.percent}%`;
    document.querySelector("#decision-message").textContent = core.decisionMessage(summary);
  }

  function downloadReport() {
    const content = core.renderTextReport(categories, state);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-app-preflight-checklist-summary.txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function resetChecklist() {
    if (!window.confirm("Reset every checklist item to Not checked?")) {
      return;
    }
    state = core.normalizeState(categories, {});
    saveState();
    document.querySelectorAll(".checklist-row").forEach((row) => {
      row.dataset.status = "unknown";
      row.querySelector("input[value='unknown']").checked = true;
    });
    updateSummary();
  }

  function configureProductLink() {
    const link = document.querySelector("#product-link");
    if (!config.checkoutUrl) {
      return;
    }
    link.href = config.checkoutUrl;
    link.textContent = `Get the offline preflight tool - ${config.priceLabel || "one-time purchase"}`;
    link.hidden = false;
  }

  renderChecklist();
  updateSummary();
  configureProductLink();
  document.querySelector("#download-report").addEventListener("click", downloadReport);
  document.querySelector("#print-report").addEventListener("click", () => window.print());
  document.querySelector("#reset-checklist").addEventListener("click", resetChecklist);
})();
