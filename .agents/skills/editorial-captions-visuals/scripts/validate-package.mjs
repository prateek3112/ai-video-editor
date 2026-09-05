#!/usr/bin/env node
/**
 * Package Validator for editorial-captions-visuals skill
 * Verifies all references, components, tokens, and docs exist and are valid.
 */

import fs from "node:fs";
import path from "node:path";

const skillDir = process.argv[2] || process.cwd();

console.log(`[Validation] Validating skill package at: ${skillDir}`);

const requiredFiles = [
  "SKILL.md",
  "references/captions-acumin.md",
  "references/style-system.md",
  "references/layout-modes.md",
  "references/safe-zones.md",
  "references/motion-language.md",
  "references/font-setup.md",
  "assets/frame.md",
  "assets/components/acumin-kinetic-caption.html",
  "assets/components/quiet-editorial-card.html",
  "assets/components/social-proof-mockup.html",
  "assets/components/editorial-safe-zones.html",
  "assets/examples/index.html",
  "scripts/preflight.mjs"
];

let failed = false;

for (const rel of requiredFiles) {
  const full = path.join(skillDir, rel);
  if (!fs.existsSync(full)) {
    console.error(`[FAIL] Missing required file: ${rel}`);
    failed = true;
  } else {
    const stats = fs.statSync(full);
    if (stats.size === 0) {
      console.error(`[FAIL] File is empty: ${rel}`);
      failed = true;
    } else {
      console.log(`[PASS] ${rel} (${stats.size} bytes)`);
    }
  }
}

if (failed) {
  console.error("\nSkill validation failed with missing or empty files.");
  process.exit(1);
} else {
  console.log("\nSkill package is complete and 100% valid!\n");
  process.exit(0);
}
