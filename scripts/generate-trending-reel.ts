import { createDoodlePlan, type DoodleScript } from '../lib/doodle-plan';
import { compileDoodleHtml } from '../lib/doodle-composition';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

function runCommand(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, HYPERFRAMES_SKIP_SKILLS: "1", HYPERFRAMES_NO_TELEMETRY: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    child.stdout.on("data", (c) => { output += c.toString(); });
    child.stderr.on("data", (c) => { output += c.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Command ${command} exited with code ${code}: ${output}`));
    });
  });
}

export const trendingScript: DoodleScript = {
  title: "NVIDIA's $1 Trillion Physical AI Secret",
  scenes: [
    {
      id: "scene-1-hook",
      narration: "Stop scrolling! NVIDIA is no longer just a chip company.",
      sceneType: "hook-intro",
      pose: "pointing",
      expression: "excited",
      headline: "NVIDIA'S $1T SECRET",
      props: [
        { type: "company-logo", logoName: "nvidia" },
        { type: "glow-lines" }
      ],
      speechBubble: "Wait what?!"
    },
    {
      id: "scene-2-shift",
      narration: "Jensen Huang just confirmed their next massive bet is NOT chatbots.",
      sceneType: "tech-explainer",
      pose: "thinking",
      expression: "surprised",
      headline: "BEYOND CHATBOTS",
      props: [
        { type: "brain" },
        { type: "x-mark" }
      ],
      speechBubble: "Not software!"
    },
    {
      id: "scene-3-robots",
      narration: "It is Physical AI: millions of autonomous humanoid robots.",
      sceneType: "product-factory",
      pose: "waving",
      expression: "happy",
      headline: "PHYSICAL AI IS HERE",
      props: [
        { type: "robot" },
        { type: "conveyor-belt" }
      ],
      speechBubble: "Hello Future!"
    },
    {
      id: "scene-4-gears",
      narration: "And 70% of every robot's cost goes to precision harmonic gears!",
      sceneType: "data-stats",
      pose: "shrugging",
      expression: "excited",
      headline: "70% OF ROBOT COST",
      props: [
        { type: "pie-chart", value: 70 },
        { type: "gear" }
      ],
      speechBubble: "Huge margin!"
    },
    {
      id: "scene-5-money",
      narration: "Micro-motor suppliers are already seeing 400% revenue explosions.",
      sceneType: "excited-reveal",
      pose: "holding",
      expression: "excited",
      headline: "+400% REVENUE",
      props: [
        { type: "coin-stack", value: 34180 },
        { type: "line-chart" }
      ],
      speechBubble: "$$$"
    },
    {
      id: "scene-6-cta",
      narration: "Follow right now for daily AI alpha before the rest of the world!",
      sceneType: "celebration-cta",
      pose: "celebrating",
      expression: "excited",
      headline: "JOIN THE ALPHA",
      props: [
        { type: "sparkle" },
        { type: "glow-lines" }
      ],
      speechBubble: "Follow us!"
    }
  ]
};

async function main() {
  console.log("=== STEP 1: SCRIPT VALIDATION ===");
  console.log("Title:", trendingScript.title);
  console.log("Total Scenes:", trendingScript.scenes.length);

  trendingScript.scenes.forEach((s, idx) => {
    const wordCount = s.narration.trim().split(/\s+/).length;
    console.log(`[Scene ${idx + 1}] (${s.sceneType}): "${s.narration}" (${wordCount} words, headline: ${s.headline})`);
    if (wordCount < 4 || wordCount > 25) {
      console.warn(`⚠️ Warning: Scene ${idx + 1} narration word count (${wordCount}) may need adjustment.`);
    }
  });

  console.log("\n=== STEP 2: CREATING DOODLE PLAN ===");
  const plan = createDoodlePlan({
    projectId: "trending-ai-physical-robots",
    topic: trendingScript.title,
    script: trendingScript,
    characterImageSrc: "/brand/ai-character.png",
    watermarkText: "AI ALPHA",
    fps: 30,
  });

  console.log(`Total Composition Duration: ${plan.duration}s across ${plan.scenes.length} scenes`);

  console.log("\n=== STEP 3: COMPILING HYPERFRAMES COMPOSITION ===");
  const html = compileDoodleHtml(plan);
  const compDir = path.join(process.cwd(), "public", "compositions", "trending-ai-reel");
  fs.mkdirSync(compDir, { recursive: true });
  fs.writeFileSync(path.join(compDir, "index.html"), html, "utf-8");
  fs.writeFileSync(path.join(compDir, "doodle-plan.json"), JSON.stringify(plan, null, 2), "utf-8");
  fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify({
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    media: { autoProxy: true }
  }, null, 2), "utf-8");
  fs.copyFileSync(path.join(process.cwd(), "node_modules", "gsap", "dist", "gsap.min.js"), path.join(compDir, "gsap.min.js"));
  
  // Copy brand assets for standalone composition self-containment
  const compBrandDir = path.join(compDir, "brand");
  fs.mkdirSync(compBrandDir, { recursive: true });
  fs.copyFileSync(path.join(process.cwd(), "public", "brand", "ai-character.png"), path.join(compBrandDir, "ai-character.png"));

  console.log("HTML compiled to:", path.join(compDir, "index.html"));

  console.log("\n=== STEP 4: LINTING HYPERFRAMES COMPOSITION ===");
  const lintOutput = await runCommand("node", ["node_modules/hyperframes/bin/hyperframes.mjs", "lint", compDir], process.cwd());
  console.log(lintOutput);

  console.log("\n=== STEP 5: RENDERING HIGH-QUALITY VIDEO ===");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const outputMp4 = path.join(rendersDir, "trending-ai-physical-robots.mp4");

  const renderOutput = await runCommand("node", [
    "node_modules/hyperframes/bin/hyperframes.mjs",
    "render",
    compDir,
    "-c", "index.html",
    "-o", outputMp4,
    "--fps", "30",
    "--quality", "standard"
  ], process.cwd());

  console.log(renderOutput);
  console.log("🎉 SUCCESS! Video rendered to:", outputMp4);
}

main().catch((err) => {
  console.error("Failed to generate trending AI reel:", err);
  process.exit(1);
});
