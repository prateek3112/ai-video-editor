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
      else reject(new Error(`Command ${command} ${args.join(' ')} exited with code ${code}: ${output}`));
    });
  });
}

async function getAudioDuration(filePath: string): Promise<number> {
  const output = await runCommand('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], process.cwd());
  const dur = parseFloat(output.trim());
  return isNaN(dur) ? 4.5 : dur;
}

export const tencentHy4Script: DoodleScript = {
  title: "Tencent HY4: 770B Open-Source AI Monster",
  scenes: [
    {
      id: "scene-1-bombshell",
      narration: "Stop scrolling! Tencent just dropped the biggest AI bombshell of the year.",
      sceneType: "hook-intro",
      pose: "pointing",
      expression: "excited",
      headline: "TENCENT'S AI BOMBSHELL",
      props: [
        { type: "company-logo", logoName: "tencent", x: 505, y: 440, scale: 1.0 }
      ],
      speechBubble: "Wait what?!"
    },
    {
      id: "scene-2-moe",
      narration: "Meet HY4: a colossal 770-billion parameter open-weights monster.",
      sceneType: "tech-explainer",
      pose: "thinking",
      expression: "surprised",
      headline: "770B OPEN-WEIGHTS MONSTER",
      props: [
        { type: "moe-network", x: 505, y: 440, scale: 1.0 }
      ],
      speechBubble: "100% Open!"
    },
    {
      id: "scene-3-context",
      narration: "It runs a mind-bending 1 Million token context window for massive codebases.",
      sceneType: "data-stats",
      pose: "arms-spread",
      expression: "excited",
      headline: "1,000,000 TOKEN CONTEXT",
      props: [
        { type: "context-meter", x: 505, y: 440, scale: 1.0 }
      ],
      speechBubble: "Entire repos!"
    },
    {
      id: "scene-4-coding",
      narration: "Built specifically for long-horizon software engineering and full game development.",
      sceneType: "concept-illustration",
      pose: "waving",
      expression: "happy",
      headline: "AUTONOMOUS DEV & GAMES",
      props: [
        { type: "game-controller", x: 505, y: 440, scale: 1.0 }
      ],
      speechBubble: "Zero limits!"
    },
    {
      id: "scene-5-huggingface",
      narration: "And unlike closed AI giants, the full model weights are completely free on HuggingFace!",
      sceneType: "company-showcase",
      pose: "holding",
      expression: "excited",
      headline: "FREE ON HUGGINGFACE",
      props: [
        { type: "company-logo", logoName: "huggingface", x: 505, y: 440, scale: 1.0 }
      ],
      speechBubble: "Download now!"
    },
    {
      id: "scene-6-cta",
      narration: "Follow Bytes with Bittu right now for daily AI alpha before anyone else!",
      sceneType: "celebration-cta",
      pose: "celebrating",
      expression: "excited",
      headline: "BYTES WITH BITTU ⚡",
      props: [
        { type: "celebration-cta", x: 360, y: 310, scale: 1.0 }
      ],
      speechBubble: "Follow Bittu!"
    }
  ]
};

async function main() {
  console.log("==================================================");
  console.log("🎬 BYTES WITH BITTU: TENCENT HY4 PREVIEW REEL");
  console.log("==================================================");

  const compDir = path.join(process.cwd(), "public", "compositions", "tencent-hy4-reel");
  const audioDir = path.join(compDir, "audio");
  fs.mkdirSync(audioDir, { recursive: true });

  const edgeTtsBin = "/Users/prateekguglani/Library/Python/3.9/bin/edge-tts";

  console.log("\n🔊 STEP 1: GENERATING JARVIS AI VOICE PER SCENE");
  const sceneDurations: number[] = [];
  const sceneAudioFiles: string[] = [];

  for (let i = 0; i < tencentHy4Script.scenes.length; i++) {
    const scene = tencentHy4Script.scenes[i];
    const audioPath = path.join(audioDir, `scene-${i + 1}.mp3`);
    console.log(`🎙️ Scene ${i + 1} Narration: "${scene.narration}"`);

    await runCommand(edgeTtsBin, [
      '--text', scene.narration,
      '--write-media', audioPath,
      '--voice', 'en-US-ChristopherNeural',
      '--rate', '+6%'
    ], process.cwd());

    const dur = await getAudioDuration(audioPath);
    const paddedDur = Math.max(3.5, Math.ceil((dur + 0.6) * 10) / 10);

    const paddedAudioPath = path.join(audioDir, `scene-${i + 1}-padded.wav`);
    await runCommand('ffmpeg', [
      '-i', audioPath,
      '-af', `apad=whole_dur=${paddedDur}`,
      '-c:a', 'pcm_s16le',
      paddedAudioPath,
      '-y'
    ], process.cwd());

    sceneDurations.push(paddedDur);
    sceneAudioFiles.push(paddedAudioPath);
    console.log(`   ⏱️ Audio: ${dur.toFixed(2)}s -> Scene Window: ${paddedDur.toFixed(1)}s`);
  }

  console.log("\n🎼 STEP 2: CONCATENATING AUDIO TRACK & MUXING SOUNDTRACK");
  const concatListPath = path.join(audioDir, "concat_list.txt");
  const concatContent = sceneAudioFiles.map(f => `file '${f}'`).join("\n");
  fs.writeFileSync(concatListPath, concatContent, "utf-8");

  const fullVoicePath = path.join(audioDir, "full_voice.wav");
  await runCommand('ffmpeg', [
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c:a', 'pcm_s16le',
    fullVoicePath,
    '-y'
  ], process.cwd());

  const totalAudioDuration = sceneDurations.reduce((a, b) => a + b, 0);
  console.log(`Total Composition Duration: ${totalAudioDuration.toFixed(1)}s`);

  console.log("\n📐 STEP 3: CREATING DOODLE PLAN");
  const plan = createDoodlePlan({
    projectId: "tencent-hy4-preview",
    topic: tencentHy4Script.title,
    script: tencentHy4Script,
    watermarkText: "BYTES WITH BITTU ⚡",
    fps: 30,
  });

  // Assign precise calculated scene durations
  let currentStart = 0;
  plan.scenes.forEach((scene, i) => {
    scene.start = currentStart;
    scene.duration = sceneDurations[i];
    currentStart += sceneDurations[i];
  });
  plan.duration = totalAudioDuration;

  console.log("\n🎨 STEP 4: COMPILING HYPERFRAMES COMPOSITION");
  const html = compileDoodleHtml(plan);
  fs.writeFileSync(path.join(compDir, "index.html"), html, "utf-8");
  fs.writeFileSync(path.join(compDir, "doodle-plan.json"), JSON.stringify(plan, null, 2), "utf-8");
  fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify({
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    media: { autoProxy: true }
  }, null, 2), "utf-8");
  fs.writeFileSync(path.join(compDir, "meta.json"), JSON.stringify({ id: "tencent-hy4-reel", name: plan.topic }, null, 2), "utf-8");
  fs.copyFileSync(path.join(process.cwd(), "node_modules", "gsap", "dist", "gsap.min.js"), path.join(compDir, "gsap.min.js"));

  console.log("\n🔍 STEP 5: HYPERFRAMES LINT CHECK");
  const lintOutput = await runCommand("node", ["node_modules/hyperframes/bin/hyperframes.mjs", "lint", compDir], process.cwd());
  console.log(lintOutput);

  console.log("\n🎥 STEP 6: RENDERING HYPERFRAMES VIDEO FRAMES");
  const rawMp4 = path.join(compDir, "raw_render.mp4");
  const renderOutput = await runCommand("node", [
    "node_modules/hyperframes/bin/hyperframes.mjs",
    "render",
    compDir,
    "-c", "index.html",
    "-o", rawMp4,
    "--fps", "30",
    "--quality", "standard"
  ], process.cwd());
  console.log(renderOutput);

  console.log("\n🎧 STEP 7: MUXING REAL NARRATION + AMBIENT SOUNDTRACK");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const finalMp4 = path.join(rendersDir, "bytes-with-bittu-tencent-hy4.mp4");

  const bgMusicPath = path.join(process.cwd(), "public", "bg_music.wav");

  await runCommand('ffmpeg', [
    '-i', rawMp4,
    '-i', fullVoicePath,
    '-stream_loop', '-1',
    '-i', bgMusicPath,
    '-filter_complex', '[1:a]volume=1.25[v];[2:a]volume=0.15,afade=t=out:st=24:d=3[bg];[v][bg]amix=inputs=2:duration=first[a]',
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    finalMp4,
    '-y'
  ], process.cwd());

  console.log("\n🎉 ALL DONE! Final Reel Produced:");
  console.log("➡️ Video File:", finalMp4);
}

main().catch(err => {
  console.error("Pipeline error:", err);
  process.exit(1);
});
