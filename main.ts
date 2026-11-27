// Gobble Dash hand-in: copy game/ and screenshots/ to the output
// directory and write dossier.json with the kit's buildDossier.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "game"), join(outputDir, "game"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outputDir, { text_max_bytes: 163840 });
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log("wrote game, screenshots and dossier.json to " + outputDir);
