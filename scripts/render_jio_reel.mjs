import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, renderStill } from "@remotion/renderer";

async function main() {
  console.log("🎬 Starting Render for Jio AI Course Reel (Remotion)...");
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  await fs.mkdir(rendersDir, { recursive: true });

  const projectOutputPath = path.join(rendersDir, "jio_instagram_final.mp4");
  const downloadsOutputPath = "/Users/prateekguglani/Downloads/jio_instagram_final.mp4";

  console.log("📦 Bundling Remotion composition...");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log("🔍 Selecting composition 'JioCourseReel'...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "JioCourseReel",
  });

  console.log(`🎥 Composition info: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames (~${(composition.durationInFrames / composition.fps).toFixed(1)}s)`);

  // Render preview stills to verify visual layers
  console.log("📸 Generating preview frame stills for verification...");
  const previewFrames = [60, 250, 615, 760, 850];
  for (const f of previewFrames) {
    const stillPath = path.join(rendersDir, `jio_preview_frame_${f}.png`);
    await renderStill({
      composition,
      serveUrl: bundled,
      output: stillPath,
      frame: f,
      imageFormat: "png",
    });
    console.log(`  ✓ Saved preview frame ${f} -> ${stillPath}`);
  }

  console.log(`\n🚀 Rendering full video to ${projectOutputPath}...`);
  const startTime = Date.now();
  await renderMedia({
    composition,
    serveUrl: bundled,
    outputLocation: projectOutputPath,
    codec: "h264",
    audioCodec: "aac",
    audioBitrate: "256k",
    crf: 16,
    concurrency: 4,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r[Render Progress]: ${(progress * 100).toFixed(1)}%`);
    },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✨ Render finished in ${durationSec}s!`);

  console.log("💾 Copying final video to Downloads directory...");
  try {
    await fs.copyFile(projectOutputPath, downloadsOutputPath);
    console.log(`✅ Successfully saved to: ${downloadsOutputPath}`);
  } catch (err) {
    console.warn(`⚠️ Warning: Could not copy directly to Downloads: ${err.message}`);
  }

  console.log("🎉 Done! Ready for Instagram Reels posting.");
}

main().catch((err) => {
  console.error("❌ Render failed:", err);
  process.exit(1);
});
