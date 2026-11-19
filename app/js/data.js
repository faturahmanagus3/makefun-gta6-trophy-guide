// data.js — loads the trophy catalogue and builds lookup indexes.
// The only request the app ever makes is the relative data/trophies.json fetch.

export const EXOPHASE_URL = "https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/";
export const PSNPROFILES_URL = "https://psnprofiles.com/trophies/43531-grand-theft-auto-vi";

export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

export const STAGE_TITLES = {
  1: "Stage 1 — Story run",
  2: "Stage 2 — Strangers & side stories",
  3: "Stage 3 — Leonida grind",
  4: "Stage 4 — 100% and the platinum",
};

export const STAGE_BLURBS = {
  1: "Campaign in order, finale last. Watch-outs inline: VCIA departure near the Takedown window, never skip a choice, sweep before the finale.",
  2: "Stranger strands — Andy, Kenton, Billy, Randy, Tyrone — plus Bret's hunt. Eight strands earn Strangers & Freaks.",
  3: "Everything countable: collectibles, stunts, races, robberies, spending, laundering. Use the card counters, region by region.",
  4: "Close the 100% counter; the platinum then lands on its own.",
};

export async function loadCatalogue() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) throw new Error("Could not load data/trophies.json");
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  return { doc, trophies, byId: indexById(trophies) };
}

export function indexById(trophies) {
  const map = new Map();
  for (const trophy of trophies) map.set(trophy.id, trophy);
  return map;
}

export function gradeCounts(trophies, earnedIds) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    counts[trophy.grade][1] += 1;
    if (earnedIds.has(trophy.id)) counts[trophy.grade][0] += 1;
  }
  return counts;
}
