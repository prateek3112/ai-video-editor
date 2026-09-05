import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, renderStill } from "@remotion/renderer";

async function main() {
  console.log("🎬 Starting Render for ChatGPT 6 Astra Reel (GptAstraReel)...");
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  const downloadsDir = path.join(process.env.HOME || "/Users/prateekguglani", "Downloads", "gpt");
  await fs.mkdir(rendersDir, { recursive: true });
  await fs.mkdir(downloadsDir, { recursive: true });

  console.log("📦 Bundling Remotion compositions...");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "GptAstraReel",
  });

  console.log(`🎥 Composition info: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames (~${(composition.durationInFrames/composition.fps).toFixed(1)}s)`);

  const previewFrames = [60, 180, 330, 480, 660, 850, 990, 1260, 1380];

  console.log("📸 Generating checkpoint preview stills...");
  for (const f of previewFrames) {
    const stillPath = path.join(rendersDir, `preview_gpt_${f}.png`);
    await renderStill({
      composition,
      serveUrl: bundled,
      output: stillPath,
      frame: f,
      imageFormat: "png",
    });
    console.log(`  ✓ Saved frame ${f}`);
  }

  const projectOutputPath = path.join(rendersDir, "gpt_astra_final.mp4");
  const downloadsOutputPath = path.join(downloadsDir, "gpt_astra_final.mp4");

  console.log(`\n🚀 Starting full video render (1080x1920 @ 30fps)...`);
  const startTime = Date.now();

  await renderMedia({
    composition,
    serveUrl: bundled,
    outputLocation: projectOutputPath,
    codec: "h264",
    crf: 17,
    pixelFormat: "yuv420p",
    audioCodec: "aac",
    audioBitrate: "256k",
    concurrency: 4,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r[Progress]: ${(progress * 100).toFixed(1)}%`);
    },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✨ Rendered GptAstraReel in ${durationSec}s!`);

  await fs.copyFile(projectOutputPath, downloadsOutputPath);
  console.log(`✅ Saved to Downloads: ${downloadsOutputPath}`);
}

main().catch((err) => {
  console.error("❌ Render failed:", err);
  process.exit(1);
});
