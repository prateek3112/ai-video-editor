import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { getProjectById } from "@/lib/local-store";
import { createEditPlanFromProject, applyEditCommands, type EditCommand } from "@/lib/edit-plan";
import { DEFAULT_CAPTION_SETTINGS, QUALITY_CONFIG, type CaptionSettings, type ExportQuality } from "@/lib/caption-config";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const projectId = String(payload.projectId ?? "");

    if (!projectId) {
      return NextResponse.json({ success: false, error: "projectId is required" }, { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const quality = (payload.quality ?? "1080p") as ExportQuality;
    const dimensions = QUALITY_CONFIG[quality] ?? QUALITY_CONFIG["1080p"];
    const settings: CaptionSettings = {
      ...DEFAULT_CAPTION_SETTINGS,
      ...(payload.settings as Partial<CaptionSettings> | undefined),
    };
    const commands = Array.isArray(payload.commands) ? (payload.commands as EditCommand[]) : [];

    const basePlan = createEditPlanFromProject({
      project,
      settings,
      quality,
      fps: payload.fps === 60 || payload.fps === 24 ? payload.fps : 30,
      width: Number(payload.width) || dimensions.width,
      height: Number(payload.height) || dimensions.height,
    });

    const plan = commands.length ? applyEditCommands(basePlan, commands) : basePlan;

    // Save Remotion composition payload file
    const compositionDir = path.join(process.cwd(), "public", "compositions", projectId);
    await fs.mkdir(compositionDir, { recursive: true });
    await fs.writeFile(path.join(compositionDir, "remotion-plan.json"), JSON.stringify(plan, null, 2), "utf-8");

    const rendersDir = path.join(process.cwd(), "public", "renders");
    await fs.mkdir(rendersDir, { recursive: true });
    const outputFilename = `${projectId}-remotion.mp4`;
    const outputPath = path.join(rendersDir, outputFilename);

    let renderedViaRenderer = false;

    try {
      // Dynamic import to allow server runtime execution
      const { bundle } = await import("@remotion/bundler");
      const { renderMedia, selectComposition } = await import("@remotion/renderer");

      const entryPoint = path.join(process.cwd(), "components", "remotion", "Composition.tsx");
      const bundled = await bundle({
        entryPoint,
        webpackOverride: (config: any) => config,
      });

      const composition = await selectComposition({
        serveUrl: bundled,
        id: "RemotionComposition",
        inputProps: { plan },
      });

      await renderMedia({
        composition,
        serveUrl: bundled,
        outputLocation: outputPath,
        inputProps: { plan },
        codec: "h264",
      });

      renderedViaRenderer = true;
    } catch (renderError) {
      console.warn("Direct @remotion/renderer call fell back to CLI command format:", renderError);
    }

    return NextResponse.json({
      success: true,
      engine: "remotion",
      renderedViaRenderer,
      videoUrl: `/renders/${outputFilename}`,
      editPlanUrl: `/compositions/${projectId}/remotion-plan.json`,
      cliCommand: `npx remotion render components/remotion/Composition.tsx RemotionComposition public/renders/${outputFilename} --props='${JSON.stringify({ plan })}'`,
      plan,
    });
  } catch (error) {
    console.error("Failed to execute Remotion render endpoint", error);
    return NextResponse.json({ success: false, error: "Failed to render Remotion composition" }, { status: 500 });
  }
}
