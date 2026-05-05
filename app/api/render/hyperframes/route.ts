import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/local-store";
import { DEFAULT_CAPTION_SETTINGS, QUALITY_CONFIG, type CaptionSettings, type ExportQuality } from "@/lib/caption-config";
import { applyEditCommands, createEditPlanFromProject, type EditCommand } from "@/lib/edit-plan";
import { compileHyperframesHtml } from "@/lib/composition-compiler";

function normalizeQuality(value: unknown): ExportQuality {
  return value === "720p" || value === "1080p" || value === "4k" ? value : "1080p";
}

function normalizeFps(value: unknown): 24 | 30 | 60 {
  return value === 24 || value === 60 ? value : 30;
}

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

    const quality = normalizeQuality(payload.quality);
    const dimensions = QUALITY_CONFIG[quality];
    const settings: CaptionSettings = {
      ...DEFAULT_CAPTION_SETTINGS,
      ...(payload.settings as Partial<CaptionSettings> | undefined),
    };
    const commands = Array.isArray(payload.commands) ? (payload.commands as EditCommand[]) : [];
    const basePlan = createEditPlanFromProject({
      project,
      settings,
      quality,
      fps: normalizeFps(payload.fps),
      width: Number(payload.width) || dimensions.width,
      height: Number(payload.height) || dimensions.height,
    });
    const plan = commands.length ? applyEditCommands(basePlan, commands) : basePlan;
    const html = compileHyperframesHtml(plan);

    const compositionDir = path.join(process.cwd(), "public", "compositions", projectId);
    await fs.mkdir(compositionDir, { recursive: true });
    await fs.writeFile(path.join(compositionDir, "index.html"), html, "utf-8");
    await fs.writeFile(path.join(compositionDir, "edit-plan.json"), JSON.stringify(plan, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      compositionUrl: `/compositions/${projectId}/index.html`,
      editPlanUrl: `/compositions/${projectId}/edit-plan.json`,
      nextCommand: `cd public/compositions/${projectId} && npx hyperframes render --output ../../renders/${projectId}-hyperframes.mp4 --fps ${plan.fps} --quality standard`,
      plan,
    });
  } catch (error) {
    console.error("Failed to compile Hyperframes composition", error);
    return NextResponse.json({ success: false, error: "Failed to compile Hyperframes composition" }, { status: 500 });
  }
}
