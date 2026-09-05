import path from "node:path";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

async function main() {
  console.log("Bundling Remotion composition for still preview...");
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundled,
    id: "FloatingGlowingVideo",
  });

  // Let's render frame 31 (around 1.0s, when "CHINA" is displayed)
  // and frame 125 (around 4.1s, when "ALTERNATIVE" or "CLAUDE" is displayed)
  // and frame 310 (around 10.3s, when "DEEPSEEK" is displayed)
  const testFrames = [
    { frame: 32, name: "preview_frame_china.png" },
    { frame: 140, name: "preview_frame_alternative.png" },
    { frame: 310, name: "preview_frame_deepseek.png" }
  ];

  for (const { frame, name } of testFrames) {
    const outputPath = path.join(process.cwd(), name);
    console.log(`Rendering still frame ${frame} to ${name}...`);
    await renderStill({
      composition,
      serveUrl: bundled,
      output: outputPath,
      frame,
      imageFormat: "png",
    });
    console.log(`Frame ${frame} rendered to ${outputPath}`);
  }
}

main().catch((err) => {
  console.error("Preview render failed:", err);
  process.exit(1);
});
