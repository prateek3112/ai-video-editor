import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

async function main() {
  console.log("Starting Render for Floating Glowing Captions...");
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  await fs.mkdir(rendersDir, { recursive: true });

  const projectOutputPath = path.join(rendersDir, "toedit_captioned.mp4");
  const downloadsOutputPath = "/Users/prateekguglani/Downloads/toedit_captioned.mp4";

  console.log("Bundling Remotion composition...");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log("Selecting composition FloatingGlowingVideo...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "FloatingGlowingVideo",
  });

  console.log(`Rendering ${composition.durationInFrames} frames (${composition.fps} fps) to ${projectOutputPath}...`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    outputLocation: projectOutputPath,
    codec: "h264",
    audioCodec: "aac",
    audioBitrate: "256k",
    crf: 16,
    onProgress: ({ progress }) => {
      process.stdout.write(`\rProgress: ${(progress * 100).toFixed(1)}%`);
    },
  });

  console.log("\nRender finished! Copying to Downloads directory...");
  try {
    await fs.copyFile(projectOutputPath, downloadsOutputPath);
    console.log(`Successfully saved to Downloads: ${downloadsOutputPath}`);
  } catch (err) {
    console.warn(`Could not copy to Downloads directly: ${err.message}`);
  }

  console.log("Render completed successfully!");
  console.log("Workspace output:", projectOutputPath);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
