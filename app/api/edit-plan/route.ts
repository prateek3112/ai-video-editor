import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/local-store";
import { applyEditCommands, createEditPlanFromProject, type EditCommand } from "@/lib/edit-plan";
import { DEFAULT_CAPTION_SETTINGS, QUALITY_CONFIG, type CaptionSettings, type ExportQuality } from "@/lib/caption-config";

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

    const basePlan = createEditPlanFromProject({
      project,
      settings,
      quality,
      fps: normalizeFps(payload.fps),
      width: Number(payload.width) || dimensions.width,
      height: Number(payload.height) || dimensions.height,
    });

    const commands = Array.isArray(payload.commands) ? (payload.commands as EditCommand[]) : [];
    const plan = commands.length ? applyEditCommands(basePlan, commands) : basePlan;

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Failed to create edit plan", error);
    return NextResponse.json({ success: false, error: "Failed to create edit plan" }, { status: 500 });
  }
}
