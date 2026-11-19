// Leonida Atlas — hand-in program for the gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// What lives in this repository:
//   app/          the guide itself: plain static files (ES modules + CSS, no build step) that a browser
//                 opens at app/index.html and runs fully offline. Its only runtime request is the
//                 relative fetch of app/data/trophies.json.
//   screenshots/  four JPEG renders of the app, taken by the maker in a real browser.
//   vendor/       the kit's make.fun frontend library. It MUST stay byte-identical: the scorer rebuilds
//                 the dossier with its own copy and compares the two byte for byte.
//
// What this program does: copy app/ and screenshots/ into the output directory, refuse early if the
// screenshots break the scorer's caps, then write dossier.json with buildDossier using exactly the
// options the gate expects. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The scorer's caps, mirrored here so a bad hand-in fails loudly at build time instead of at grading.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const screenshotsDir = join(repoRoot, 'screenshots');

// Guard: the gate allows at most 4 screenshots, each at most 256 KiB. Check before copying anything
// so the failure message names the offending file instead of surfacing as a dossier mismatch later.
function guardScreenshots(): void {
  if (!existsSync(screenshotsDir)) return;
  const shots = readdirSync(screenshotsDir).filter((name) => !name.startsWith('.'));
  if (shots.length > DOSSIER_OPTIONS.screenshots.max) {
    throw new Error(`screenshots/: ${shots.length} files, over the cap of ${DOSSIER_OPTIONS.screenshots.max}`);
  }
  for (const name of shots) {
    const size = statSync(join(screenshotsDir, name)).size;
    if (size > DOSSIER_OPTIONS.screenshots.max_bytes) {
      throw new Error(`screenshots/${name}: ${size} bytes, over the cap of ${DOSSIER_OPTIONS.screenshots.max_bytes}`);
    }
  }
}

guardScreenshots();

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(screenshotsDir)) {
  cpSync(screenshotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_OPTIONS));

// Post-write verification: re-read the dossier we just wrote and print a one-line summary, so a
// hand-in run leaves evidence of what it produced. Determinism note: buildDossier derives every byte
// from the copied app/ and screenshots/ trees alone (no timestamps, no randomness), so two runs over
// the same repository write byte-identical output — the entry relies on that, and this summary is the
// same on both runs.
const dossier = JSON.parse(readFileSync(join(outputDir, 'dossier.json'), 'utf8'));
const appFiles = readdirSync(join(outputDir, 'app'), { recursive: true }).length;
const shotCount = readdirSync(join(outputDir, 'screenshots')).filter((name) => !name.startsWith('.')).length;
const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
console.log(`leonida-atlas: dossier.json ok — ${appFiles} app entries, ${shotCount} screenshots, ${dossierBytes} dossier bytes, ${Object.keys(dossier).length} top-level keys`);
