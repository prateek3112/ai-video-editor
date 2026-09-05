import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, renderStill } from "@remotion/renderer";

async function main() {
  console.log("🎬 Starting Render for BOTH Vietnam Reel Versions (NoSplit & Split)...");
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  const downloadsDir = path.join(process.env.HOME || "/Users/prateekguglani", "Downloads", "vietnam");
  await fs.mkdir(rendersDir, { recursive: true });
  await fs.mkdir(downloadsDir, { recursive: true });

  console.log("📦 Bundling Remotion compositions...");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const targets = [
    {
      id: "VietnamPostcardsNoSplit",
      name: "nosplit",
      projectFile: "vietnam_postcards_nosplit.mp4",
      downloadsFile: "vietnam_postcards_nosplit.mp4",
    },
  ];

  const previewFrames = [20, 80, 180, 275, 295, 315, 330, 350, 440];

  for (const target of targets) {
    console.log(`\n======================================================`);
    console.log(`🎯 Processing Composition '${target.id}'...`);
    console.log(`======================================================`);

    const composition = await selectComposition({
      serveUrl: bundled,
      id: target.id,
    });

    console.log(`🎥 Composition info: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`);

    // Preview Stills
    console.log(`📸 Generating preview stills for ${target.name}...`);
    for (const f of previewFrames) {
      const stillPath = path.join(rendersDir, `preview_${target.name}_${f}.png`);
      await renderStill({
        composition,
        serveUrl: bundled,
        output: stillPath,
        frame: f,
        imageFormat: "png",
      });
      console.log(`  ✓ Saved ${target.name} frame ${f}`);
    }

    // Full Render
    const projectOutputPath = path.join(rendersDir, target.projectFile);
    const downloadsOutputPath = path.join(downloadsDir, target.downloadsFile);

    console.log(`🚀 Rendering video to ${projectOutputPath}...`);
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
        process.stdout.write(`\r[${target.name} Progress]: ${(progress * 100).toFixed(1)}%`);
      },
    });

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✨ Rendered ${target.name} in ${durationSec}s!`);

    try {
      await fs.copyFile(projectOutputPath, downloadsOutputPath);
      console.log(`✅ Saved to Downloads: ${downloadsOutputPath}`);
    } catch (err) {
      console.warn(`⚠️ Warning: Could not copy to Downloads: ${err.message}`);
    }
  }

  // Also copy the NoSplit version to the default filename vietnam_postcards_final.mp4 for convenience
  try {
    await fs.copyFile(
      path.join(rendersDir, "vietnam_postcards_nosplit.mp4"),
      path.join(downloadsDir, "vietnam_postcards_final.mp4")
    );
    console.log(`✅ Also updated default: ${path.join(downloadsDir, "vietnam_postcards_final.mp4")}`);
  } catch (err) {}

  console.log("\n🎉 Both versions (NoSplit & Split) rendered and ready!");
}

main().catch((err) => {
  console.error("❌ Render failed:", err);
  process.exit(1);
});
