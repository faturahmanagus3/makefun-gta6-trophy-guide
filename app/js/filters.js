// filters.js — kind / grade / status / search filtering, plus the spoiler rule.

export function isMasked(trophy, state) {
  // Spoiler shield: an unearned story trophy stays hidden while the shield is on.
  if (!state.spoilerShield) return false;
  if (trophy.kind !== "story") return false;
  return !state.earned.includes(trophy.id);
}

export function matchesKind(trophy, kind) {
  if (kind === "all") return true;
  if (kind === "missable") return trophy.missable === true;
  if (kind === "online") return trophy.kind === "online";
  return trophy.kind === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === "all" || trophy.grade === grade;
}

export function matchesStatus(trophy, status, earnedIds) {
  if (status === "all") return true;
  if (status === "earned") return earnedIds.has(trophy.id);
  return !earnedIds.has(trophy.id);
}

export function matchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.kind} ${trophy.grade}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function applyFilters(trophies, filters, earnedIds) {
  return trophies.filter(
    (trophy) =>
      matchesKind(trophy, filters.kind) &&
      matchesGrade(trophy, filters.grade) &&
      matchesStatus(trophy, filters.status, earnedIds) &&
      matchesSearch(trophy, filters.search),
  );
}
