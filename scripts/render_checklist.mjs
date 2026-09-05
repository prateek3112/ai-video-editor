import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

async function main() {
  console.log("Starting Viral Checklist Render for edit.mov...");
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  const rendersDir = path.join(process.cwd(), "public", "renders");
  await fs.mkdir(rendersDir, { recursive: true });

  const outputPath = path.join(rendersDir, "edit_viral_checklist.mp4");

  console.log("Bundling Remotion composition...");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log("Selecting composition ViralChecklist...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "ViralChecklist",
  });

  console.log(`Rendering ${composition.durationInFrames} frames (${composition.fps} fps) to ${outputPath}...`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    outputLocation: outputPath,
    codec: "h264",
    audioCodec: "aac",
    audioBitrate: "192k",
    onProgress: ({ progress }) => {
      process.stdout.write(`\rProgress: ${(progress * 100).toFixed(1)}%`);
    },
  });

  console.log("\nRender completed successfully!");
  console.log("Output saved to:", outputPath);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
