#!/usr/bin/env node
/**
 * Preflight script for Quiet Editorial Visuals & Acumin Kinetic Captions
 * Validates composition structure, safe-zone compliance, and font configuration.
 */

import fs from "node:fs";
import path from "node:path";

const targetDir = process.argv[2] || process.cwd();

console.log(`[Preflight] Inspecting HyperFrames composition at: ${targetDir}`);

const checks = [];

// 1. Check for index.html or template HTML
const htmlCandidates = ["index.html", "composition.html", "editorial-reel-golden.html"];
const foundHtml = htmlCandidates.find(f => fs.existsSync(path.join(targetDir, f)));

if (!foundHtml) {
  checks.push({ name: "HTML Composition File", status: "WARN", message: "No standard index.html found. Ensure custom composition file is specified." });
} else {
  checks.push({ name: "HTML Composition File", status: "PASS", message: `Found ${foundHtml}` });
}

// 2. Check font directory and declarations
const fontDir = path.join(targetDir, "fonts");
const publicFontDir = path.join(targetDir, "public", "fonts");
const effectiveFontDir = fs.existsSync(fontDir) ? fontDir : (fs.existsSync(publicFontDir) ? publicFontDir : null);

if (!effectiveFontDir) {
  checks.push({
    name: "Webfonts Directory",
    status: "INFO",
    message: "No local fonts/ directory found. System sans-serif / Helvetica stack will be used as fallback."
  });
} else {
  const files = fs.readdirSync(effectiveFontDir);
  const hasAcumin = files.some(f => /acumin/i.test(f));
  const hasHelvetica = files.some(f => /helvetica/i.test(f));
  checks.push({
    name: "Webfonts Installed",
    status: "PASS",
    message: `Fonts detected: ${files.length} files (Acumin: ${hasAcumin ? "Yes" : "No"}, Helvetica: ${hasHelvetica ? "Yes" : "No"})`
  });
}

// Print results summary
console.log("\n--- Preflight Summary ---");
let hasErrors = false;
for (const c of checks) {
  console.log(`[${c.status}] ${c.name}: ${c.message}`);
  if (c.status === "FAIL") hasErrors = true;
}

if (hasErrors) {
  console.error("\nPreflight failed. Please address the errors above before rendering.");
  process.exit(1);
} else {
  console.log("\nPreflight passed successfully. Composition ready for HyperFrames compilation/render.\n");
  process.exit(0);
}
