// views.js — renders the checklist, detail pane, roadmap, missables and settings views.

import { GRADE_ORDER, STAGE_TITLES, STAGE_BLURBS } from "./data.js";
import { isMasked } from "./filters.js";

export const MASKED_TEXT = "Hidden story trophy — earn it to reveal";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function medalSpan(grade) {
  const wrap = el("span");
  const dot = el("span", `medal medal-${grade}`);
  wrap.append(dot, document.createTextNode(grade));
  return wrap;
}

function buildCounter(trophy, state, onCounter) {
  const box = el("div", "counter-box");
  const current = state.counters[trophy.id] ?? 0;
  const minus = el("button", "", "−");
  minus.type = "button";
  minus.setAttribute("aria-label", `Decrease ${trophy.target.label}`);
  const plus = el("button", "", "+");
  plus.type = "button";
  plus.setAttribute("aria-label", `Increase ${trophy.target.label}`);
  const label = el("span", "", `${current} / ${trophy.target.count} ${trophy.target.label}`);
  minus.addEventListener("click", (event) => { event.stopPropagation(); onCounter(trophy, current - stepFor(trophy)); });
  plus.addEventListener("click", (event) => { event.stopPropagation(); onCounter(trophy, current + stepFor(trophy)); });
  box.append(minus, label, plus);
  if (current >= trophy.target.count && !state.earned.includes(trophy.id)) {
    box.append(el("span", "counter-hint", "Target reached — tick it off!"));
  }
  return box;
}

function stepFor(trophy) {
  return trophy.target.count >= 10000 ? 1000 : 1;
}

export function renderHeader(trophies, state) {
  const earnedIds = new Set(state.earned);
  document.getElementById("earned-count").textContent = `${earnedIds.size} of ${trophies.length}`;
  document.getElementById("progress-fill").style.width = `${(earnedIds.size / trophies.length) * 100}%`;
  const parts = GRADE_ORDER.map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && earnedIds.has(t.id)).length;
    return `${grade} ${got}/${total}`;
  });
  document.getElementById("grade-counts").textContent = parts.join(" · ");
}

export function renderChecklist(trophies, visible, state, selectedId, handlers) {
  const list = document.getElementById("trophy-list");
  list.replaceChildren();
  document.getElementById("result-count").textContent = `Showing ${visible.length} of ${trophies.length} trophies.`;
  for (const trophy of visible) {
    const masked = isMasked(trophy, state);
    const earned = state.earned.includes(trophy.id);
    const card = el("li");
    const button = el("button", "trophy-card" + (earned ? " is-earned" : "") + (trophy.id === selectedId ? " is-selected" : ""));
    button.type = "button";
    button.addEventListener("click", () => handlers.onSelect(trophy.id));

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned;
    box.setAttribute("aria-label", `Mark ${trophy.name} as earned`);
    box.addEventListener("click", (event) => event.stopPropagation());
    box.addEventListener("change", () => handlers.onToggle(trophy.id));

    const main = el("div", "card-main");
    main.append(el("p", "card-name" + (masked ? " masked" : ""), masked ? MASKED_TEXT : trophy.name));
    main.append(el("p", "card-desc" + (masked ? " masked" : ""), masked ? MASKED_TEXT : trophy.description));
    const meta = el("p", "card-meta");
    meta.append(medalSpan(trophy.grade));
    meta.append(el("span", "kind-tag", trophy.kind));
    meta.append(el("span", "", `Stage ${trophy.stage}`));
    if (trophy.missable) meta.append(el("span", "watch-flag", "Watch out"));
    main.append(meta);
    if (trophy.target && !masked) main.append(buildCounter(trophy, state, handlers.onCounter));

    button.append(box, main);
    card.append(button);
    list.append(card);
  }
}

export function renderDetail(trophy, state, handlers) {
  const pane = document.getElementById("detail-pane");
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el("p", "note", "Select a trophy to read its full guide and sources."));
    return;
  }
  const masked = isMasked(trophy, state);
  const earned = state.earned.includes(trophy.id);
  pane.append(el("h2", masked ? "masked" : "", masked ? MASKED_TEXT : trophy.name));
  pane.append(el("p", "detail-desc" + (masked ? " masked" : ""), masked ? MASKED_TEXT : trophy.description));

  const meta = el("p", "card-meta");
  meta.append(medalSpan(trophy.grade));
  meta.append(el("span", "kind-tag", trophy.kind));
  meta.append(el("span", "", STAGE_TITLES[trophy.stage]));
  meta.append(el("span", "", earned ? "Earned" : "To do"));
  pane.append(meta);

  if (trophy.missable) {
    pane.append(el("p", "watch-note", `Watch out — plan ahead. ${trophy.watch}`));
  }
  if (trophy.target && !masked) {
    pane.append(el("h3", "", "Progress"));
    pane.append(buildCounter(trophy, state, handlers.onCounter));
  }

  pane.append(el("h3", "", "Guide"));
  pane.append(el("p", masked ? "masked" : "", masked ? MASKED_TEXT : trophy.guide));
  pane.append(el("p", "note", "Guide text is our own advice written from the official description; facts are cited below. The game released on 2026-11-19, so steps are not yet verified in game."));

  pane.append(el("h3", "", "Sources"));
  const sourceList = el("ul", "source-list");
  for (const source of trophy.sources) {
    const item = el("li");
    const link = el("a", "", source.label);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.append(link);
    sourceList.append(item);
  }
  pane.append(sourceList);
}

export function renderRoadmap(trophies, state, handlers) {
  const body = document.getElementById("roadmap-body");
  body.replaceChildren();
  const earnedIds = new Set(state.earned);
  for (const stage of [1, 2, 3, 4]) {
    const inStage = trophies.filter((t) => t.stage === stage);
    const done = inStage.filter((t) => earnedIds.has(t.id)).length;
    const block = el("div", "stage-block");
    block.append(el("h3", "", `${STAGE_TITLES[stage]} — ${done}/${inStage.length} earned`));
    block.append(el("p", "note", STAGE_BLURBS[stage]));
    const list = el("div", "stage-chips");
    for (const trophy of inStage) {
      const link = el("a", "stage-chip", `${earnedIds.has(trophy.id) ? "✓ " : ""}${trophy.name}${trophy.missable ? " — watch out" : ""}`);
      link.href = "#";
      link.addEventListener("click", (event) => { event.preventDefault(); handlers.onSelect(trophy.id); });
      list.append(link);
    }
    block.append(list);
    body.append(block);
  }
}

export function renderMissables(trophies) {
  const body = document.getElementById("missables-body");
  body.replaceChildren();
  body.append(el("p", "note",
    "Honesty note: these four flags are plan-ahead warnings built from the official descriptions, not confirmed missables — the game released on 2026-11-19 and no flag here is verified in game. Every other trophy shows no missable signal in its official description, and the official list contains no online trophies."));
  for (const trophy of trophies.filter((t) => t.missable)) {
    const card = el("div", "miss-card");
    card.append(el("h3", "", trophy.name));
    const meta = el("p", "card-meta");
    meta.append(medalSpan(trophy.grade));
    meta.append(el("span", "", STAGE_TITLES[trophy.stage]));
    card.append(meta);
    card.append(el("p", "detail-desc", trophy.description));
    card.append(el("p", "watch-note", trophy.watch));
    card.append(el("p", "", trophy.guide));
    body.append(card);
  }
}

export function renderSettings(state, handlers) {
  const body = document.getElementById("settings-body");
  body.replaceChildren();

  const spoilerCard = el("div", "settings-card");
  spoilerCard.append(el("h3", "", "Spoiler shield"));
  const row = el("label", "switch-row");
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.id = "spoiler-toggle";
  toggle.checked = state.spoilerShield;
  toggle.addEventListener("change", () => handlers.onShield(toggle.checked));
  row.append(toggle, document.createTextNode("Hide unearned story trophies (names, descriptions and guides stay masked until earned)"));
  spoilerCard.append(row);
  body.append(spoilerCard);

  const dataCard = el("div", "settings-card");
  dataCard.append(el("h3", "", "Progress data"));
  dataCard.append(el("p", "note", "Progress is stored in this browser (localStorage). Export it to a JSON file to back it up or move it, import it back here, or reset everything."));
  const exportBtn = el("button", "btn", "Export progress");
  exportBtn.type = "button";
  exportBtn.id = "export-btn";
  exportBtn.addEventListener("click", () => handlers.onExport());
  const importLabel = el("label", "btn secondary", "Import progress");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "import-file";
  fileInput.accept = "application/json,.json";
  fileInput.hidden = true;
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handlers.onImport(fileInput.files[0]);
  });
  importLabel.append(fileInput);
  const resetBtn = el("button", "btn danger", "Reset progress");
  resetBtn.type = "button";
  resetBtn.id = "reset-btn";
  resetBtn.addEventListener("click", () => handlers.onReset());
  const controls = el("p");
  controls.append(exportBtn, importLabel, resetBtn);
  dataCard.append(controls);
  body.append(dataCard);
}
