import fs from "fs";

// Cues precisely mapped to the 48.72s audio
const kineticCues = [
  // Scene 1 (0.0s - 3.5s)
  { start: 0.35, end: 0.95, text: "CHATGPT", emphasis: true },
  { start: 0.95, end: 1.50, text: "JUST DESTROYED", emphasis: false },
  { start: 1.50, end: 2.30, text: "THE AI", emphasis: false },
  { start: 2.30, end: 3.40, text: "BENCHMARKS.", emphasis: true },

  // Scene 2 (3.4s - 8.8s)
  { start: 3.50, end: 4.30, text: "OPENAI NE", emphasis: false },
  { start: 4.30, end: 5.20, text: "LAUNCH KAR DIYA", emphasis: false },
  { start: 5.20, end: 6.10, text: "DUNIYA KA", emphasis: false },
  { start: 6.10, end: 7.20, text: "SABSE SMART MODEL", emphasis: true },
  { start: 7.20, end: 8.80, text: "CHATGPT 6 ASTRA.", emphasis: true },

  // Scene 3 (8.8s - 13.5s)
  { start: 8.90, end: 9.80, text: "OPENAI PRESIDENT", emphasis: false },
  { start: 9.80, end: 10.90, text: "GREG BROCKMAN", emphasis: true },
  { start: 10.90, end: 11.60, text: "NE KHUD KAHA", emphasis: false },
  { start: 11.60, end: 13.50, text: '"WELCOME TO AGI"', emphasis: true },

  // Scene 4 (13.5s - 26.5s)
  { start: 13.60, end: 14.60, text: "ARC-AGI-3 SCORE", emphasis: false },
  { start: 14.60, end: 16.50, text: "99.9%!", emphasis: true },
  { start: 16.80, end: 18.20, text: "UNKNOWN ENVIRONMENT", emphasis: false },
  { start: 18.20, end: 19.80, text: "MEIN DALA JATA HAI", emphasis: false },
  { start: 19.80, end: 21.20, text: "WITHOUT INSTRUCTIONS", emphasis: true },
  { start: 21.20, end: 23.00, text: "RULES FIGURE OUT", emphasis: false },
  { start: 23.00, end: 24.80, text: "KARKE GOAL", emphasis: false },
  { start: 24.80, end: 26.50, text: "ACHIEVE KARNA PADTA HAI", emphasis: true },

  // Scene 5 (26.5s - 36.5s)
  { start: 26.60, end: 28.00, text: "EXPLOIT BENCHMARK:", emphasis: false },
  { start: 28.00, end: 30.20, text: "100% SCORE!", emphasis: true },
  { start: 30.50, end: 31.80, text: "ITNA DANGEROUS HAI", emphasis: false },
  { start: 31.80, end: 33.20, text: "SAFETY FRAMEWORK", emphasis: false },
  { start: 33.20, end: 34.60, text: "PEHLI BAAR", emphasis: false },
  { start: 34.60, end: 36.50, text: "CRITICAL RISK LEVEL 3!", emphasis: true },

  // Scene 6 (36.5s - 48.7s)
  { start: 36.80, end: 38.20, text: "YE TEST SCORES", emphasis: false },
  { start: 38.20, end: 39.40, text: "NAHI HAIN", emphasis: false },
  { start: 39.40, end: 40.50, text: "ITNA POWERFUL HAI", emphasis: true },
  { start: 40.60, end: 41.80, text: "SPREADSHEET BHAR SAKTA HAI", emphasis: true },
  { start: 41.80, end: 43.00, text: "FORM FILL KAR SAKTA HAI", emphasis: true },
  { start: 43.00, end: 44.50, text: "WEB NAVIGATE KAR SAKTA HAI", emphasis: true },
  { start: 44.60, end: 46.20, text: "THIS IS TRULY AGI.", emphasis: true },
  { start: 46.20, end: 48.70, text: "WHAT DO YOU THINK? 👇", emphasis: true },
];

fs.writeFileSync("data/gpt_cues.json", JSON.stringify(kineticCues, null, 2), "utf8");
console.log(`Saved ${kineticCues.length} cues to data/gpt_cues.json`);
