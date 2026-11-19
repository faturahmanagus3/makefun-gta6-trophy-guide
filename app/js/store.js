// store.js — progress persistence: earned set, per-trophy counters, spoiler shield.
// Everything lives in one localStorage record and can be exported / imported as JSON.

export const STORAGE_KEY = "leonida-atlas-progress-v1";

export function defaultState() {
  return { earned: [], counters: {}, spoilerShield: true };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counters: parsed.counters && typeof parsed.counters === "object" ? parsed.counters : {},
      spoilerShield: parsed.spoilerShield !== false,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleEarned(state, id) {
  const set = new Set(state.earned);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  state.earned = [...set];
  saveState(state);
  return set.has(id);
}

export function setCounter(state, id, value, targetCount) {
  const clamped = Math.max(0, Math.min(value, targetCount));
  state.counters[id] = clamped;
  saveState(state);
  return clamped;
}

export function exportState(state) {
  const payload = JSON.stringify(
    { app: "leonida-atlas", version: 1, exportedAt: new Date().toISOString(), ...state },
    null,
    2,
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "leonida-atlas-progress.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.earned)) throw new Error("Not a Leonida Atlas progress file.");
  return {
    earned: parsed.earned.filter((id) => Number.isInteger(id)),
    counters: parsed.counters && typeof parsed.counters === "object" ? parsed.counters : {},
    spoilerShield: parsed.spoilerShield !== false,
  };
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState();
}
