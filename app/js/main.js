// main.js — boots Leonida Atlas: loads data, wires tabs, filters and progress actions.

import { loadCatalogue } from "./data.js";
import { loadState, saveState, toggleEarned, setCounter, exportState, parseImportedState, resetState } from "./store.js";
import { applyFilters } from "./filters.js";
import { renderHeader, renderChecklist, renderDetail, renderRoadmap, renderMissables, renderSettings } from "./views.js";

const state = loadState();
const filters = { kind: "all", grade: "all", status: "all", search: "" };
let trophies = [];
let byId = new Map();
let selectedId = null;
let activeView = "checklist";

const handlers = {
  onToggle(id) {
    toggleEarned(state, id);
    refresh();
  },
  onSelect(id) {
    selectedId = id;
    if (activeView !== "checklist") switchView("checklist");
    refresh();
  },
  onCounter(trophy, value) {
    setCounter(state, trophy.id, value, trophy.target.count);
    refresh();
  },
  onShield(enabled) {
    state.spoilerShield = enabled;
    saveState(state);
    refresh();
  },
  onExport() {
    exportState(state);
  },
  async onImport(file) {
    try {
      const imported = parseImportedState(await file.text());
      state.earned = imported.earned;
      state.counters = imported.counters;
      state.spoilerShield = imported.spoilerShield;
      saveState(state);
      refresh();
    } catch {
      window.alert("That file could not be imported as Leonida Atlas progress.");
    }
  },
  onReset() {
    const fresh = resetState();
    state.earned = fresh.earned;
    state.counters = fresh.counters;
    state.spoilerShield = fresh.spoilerShield;
    selectedId = null;
    refresh();
  },
};

function switchView(name) {
  activeView = name;
  for (const tab of document.querySelectorAll(".tab")) {
    tab.classList.toggle("is-active", tab.dataset.view === name);
  }
  for (const view of document.querySelectorAll(".view")) {
    view.hidden = view.id !== `view-${name}`;
  }
  document.getElementById("filters").hidden = name !== "checklist";
  refresh();
}

function refresh() {
  const earnedIds = new Set(state.earned);
  renderHeader(trophies, state);
  const visible = applyFilters(trophies, filters, earnedIds);
  document.getElementById("online-note").hidden = filters.kind !== "online";
  renderChecklist(trophies, visible, state, selectedId, handlers);
  renderDetail(selectedId ? byId.get(selectedId) : null, state, handlers);
  renderRoadmap(trophies, state, handlers);
  renderMissables(trophies);
  renderSettings(state, handlers);
  const toggle = document.getElementById("spoiler-toggle");
  if (toggle) toggle.checked = state.spoilerShield;
}

function wireControls() {
  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  }
  for (const chip of document.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => {
      filters.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll(".chip")) {
        other.classList.toggle("is-active", other === chip);
      }
      refresh();
    });
  }
  document.getElementById("grade-filter").addEventListener("change", (event) => {
    filters.grade = event.target.value;
    refresh();
  });
  document.getElementById("status-filter").addEventListener("change", (event) => {
    filters.status = event.target.value;
    refresh();
  });
  document.getElementById("search-box").addEventListener("input", (event) => {
    filters.search = event.target.value.trim();
    refresh();
  });
}

async function boot() {
  const catalogue = await loadCatalogue();
  trophies = catalogue.trophies;
  byId = catalogue.byId;
  selectedId = trophies[0]?.id ?? null;
  wireControls();
  refresh();
}

boot();
