import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createDoodlePlan } from "../lib/doodle-plan";
import { compileDoodleHtml } from "../lib/doodle-composition";

function runCommand(command: string, args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd: cwd || process.cwd(), shell: false });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Command ${command} failed with code ${code}: ${stderr}`));
    });
  });
}

async function main() {
  console.log("🚀 STARTING SNAPPY HYPERFRAMES CHAR.MP4 EDITORIAL VARIANT RENDER");

  const compDir = path.join(process.cwd(), "public", "compositions", "tencent-hy4-editorial-hf");
  fs.mkdirSync(compDir, { recursive: true });

  const tencentScript = {
    title: "Tencent HY4 - 770B Open Weights Model",
    narration: "Stop scrolling! Tencent just dropped the biggest AI bombshell of the year. Meet HY4: a 770-billion parameter open-weights monster. It packs a one million token context window for repos. Handling everything from software engineering to 3D game dev! While closed models charge, HY4 is 100% free! Comment INSTALL for the full setup guide & alpha!",
    scenes: [
      {
        narration: "Stop scrolling! Tencent just dropped the biggest AI bombshell of the year.",
        sceneType: "hook-intro" as const,
        pose: "walking" as const,
        expression: "excited" as const,
        props: [],
      },
      {
        narration: "Meet HY4: a 770-billion parameter open-weights monster.",
        sceneType: "tech-explainer" as const,
        pose: "thinking" as const,
        expression: "happy" as const,
        props: [],
      },
      {
        narration: "It packs a one million token context window for repos.",
        sceneType: "data-stats" as const,
        pose: "arms-spread" as const,
        expression: "excited" as const,
        props: [],
      },
      {
        narration: "Handling everything from software engineering to 3D game dev!",
        sceneType: "concept-illustration" as const,
        pose: "holding" as const,
        expression: "happy" as const,
        props: [],
      },
      {
        narration: "While closed models charge, HY4 is 100% free!",
        sceneType: "company-showcase" as const,
        pose: "pointing" as const,
        expression: "surprised" as const,
        props: [],
      },
      {
        narration: "Comment INSTALL for the full setup guide & alpha!",
        sceneType: "celebration-cta" as const,
        pose: "celebrating" as const,
        expression: "excited" as const,
        props: [],
      },
    ],
  };

  // Snappy silence-trimmed durations
  const sceneDurations = [4.77, 5.03, 4.53, 4.20, 5.17, 3.95];
  const totalAudioDuration = sceneDurations.reduce((a, b) => a + b, 0);

  const plan = createDoodlePlan({
    topic: tencentScript.title,
    script: tencentScript,
    fps: 30,
  });

  let currentStart = 0;
  plan.scenes.forEach((scene, i) => {
    scene.start = currentStart;
    scene.duration = sceneDurations[i];
    currentStart += sceneDurations[i];
  });
  plan.duration = totalAudioDuration;

  console.log("🎨 COMPILING HYPERFRAMES COMPOSITION HTML");
  const html = compileDoodleHtml(plan);
  fs.writeFileSync(path.join(compDir, "index.html"), html, "utf-8");
  fs.writeFileSync(path.join(compDir, "doodle-plan.json"), JSON.stringify(plan, null, 2), "utf-8");
  fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify({
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    media: { autoProxy: true }
  }, null, 2), "utf-8");
  fs.writeFileSync(path.join(compDir, "meta.json"), JSON.stringify({ id: "tencent-hy4-editorial-hf", name: plan.topic }, null, 2), "utf-8");
  fs.copyFileSync(path.join(process.cwd(), "node_modules", "gsap", "dist", "gsap.min.js"), path.join(compDir, "gsap.min.js"));

  console.log("🎥 RENDERING HYPERFRAMES FRAMES");
  const rawMp4 = path.join(compDir, "raw_render.mp4");
  await runCommand("node", [
    "node_modules/hyperframes/bin/hyperframes.mjs",
    "render",
    compDir,
    "-c", "index.html",
    "-o", rawMp4,
    "--fps", "30",
    "--quality", "standard"
  ], process.cwd());

  console.log("🎧 MUXING SNAPPY AUDIO");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const finalMp4 = path.join(rendersDir, "doodle-hyperframes-tencent.mp4");
  const fullVoicePath = path.join(process.cwd(), "public", "compositions", "tencent-hy4-reel", "audio_snappy", "full_voice_snappy.wav");
  const bgMusicPath = path.join(process.cwd(), "public", "bg_music.wav");

  await runCommand('ffmpeg', [
    '-i', rawMp4,
    '-i', fullVoicePath,
    '-stream_loop', '-1',
    '-i', bgMusicPath,
    '-filter_complex', '[1:a]volume=1.3[v];[2:a]volume=0.14,afade=t=out:st=24:d=3[bg];[v][bg]amix=inputs=2:duration=first[a]',
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalMp4,
    '-y'
  ], process.cwd());

  console.log("🎉 SNAPPY HYPERFRAMES VARIANT READY: ", finalMp4);
}

main().catch(console.error);
