import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function runCommand(command: string, args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`[CMD] ${command} ${args.join(" ")}`);
    const proc = spawn(command, args, { cwd: cwd || process.cwd(), shell: false });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => {
      stdout += d.toString();
      process.stdout.write(d.toString());
    });
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      process.stderr.write(d.toString());
    });
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Command ${command} failed with code ${code}: ${stderr}`));
    });
  });
}

async function main() {
  console.log("🚀 STARTING LINKEDIN CLAUDE SKILLS 4K REEL RENDER (ACCURATE SCREENSHOT CAPTURE)");

  const compDir = path.join(process.cwd(), "public", "compositions", "linkedin-claude-skills-4k");
  const rawMp4 = path.join(compDir, "raw_render.mp4");
  if (fs.existsSync(rawMp4)) {
    fs.unlinkSync(rawMp4);
  }

  const rendersDir = path.join(process.cwd(), "public", "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const finalMp4 = path.join(rendersDir, "linkedin-claude-skills-4k.mp4");

  console.log("🎥 STEP 1: RENDERING 4K FRAMES VIA HYPERFRAMES (Page.captureScreenshot)");
  await runCommand("node", [
    "node_modules/hyperframes/bin/hyperframes.mjs",
    "render",
    compDir,
    "-c", "index.html",
    "-o", rawMp4,
    "--fps", "30",
    "--quality", "standard",
    "--experimental-fast-capture=false"
  ], process.cwd());

  console.log("🎧 STEP 2: MUXING CLEAN MASTER AUDIO (VOICE.WAV)");
  const voiceWav = path.join(compDir, "assets", "voice.wav");

  await runCommand("ffmpeg", [
    "-i", rawMp4,
    "-i", voiceWav,
    "-map", "0:v",
    "-map", "1:a",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "256k",
    "-shortest",
    finalMp4,
    "-y"
  ], process.cwd());

  console.log("🎉 FINAL MASTER 4K REEL READY: ", finalMp4);
}

main().catch((err) => {
  console.error("❌ Render failed:", err);
  process.exit(1);
});
