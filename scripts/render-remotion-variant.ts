import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

async function main() {
  console.log("🚀 STARTING REMOTION CHAR.MP4 EDITORIAL VARIANT RENDER");

  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  console.log("📦 Bundling Remotion composition from:", entryPoint);
  
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config: any) => config,
  });

  console.log("🔍 Selecting composition DoodleExplainerReel");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "DoodleExplainerReel",
  });

  const rendersDir = path.join(process.cwd(), "public", "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const outputPath = path.join(rendersDir, "doodle-remotion-tencent.mp4");

  console.log("🎥 Rendering Remotion composition (1080x1920 @ 30fps) to:", outputPath);
  await renderMedia({
    composition,
    serveUrl: bundled,
    outputLocation: outputPath,
    codec: "h264",
    audioCodec: "aac",
    audioBitrate: "192k",
    onProgress: ({ progress }) => {
      process.stdout.write(`\rRender Progress: ${Math.round(progress * 100)}%`);
    }
  });

  console.log("\n🎉 REMOTION VARIANT READY: ", outputPath);
}

main().catch(console.error);
