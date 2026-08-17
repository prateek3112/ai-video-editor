import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/local-store";
import { DEFAULT_CAPTION_SETTINGS, QUALITY_CONFIG, type CaptionSettings, type ExportQuality } from "@/lib/caption-config";
import { applyEditCommands, createEditPlanFromProject, type EditCommand } from "@/lib/edit-plan";
import { compileHyperframesHtml } from "@/lib/composition-compiler";
import { spawn } from "node:child_process";

function runHyperframes(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cli = path.join(process.cwd(), "node_modules", "hyperframes", "bin", "hyperframes.mjs");
    const child = spawn(process.execPath, [cli, ...args], {
      cwd,
      env: {
        ...process.env,
        HYPERFRAMES_SKIP_SKILLS: "1",
        HYPERFRAMES_NO_TELEMETRY: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`HyperFrames timed out after 5 minutes: ${output.slice(-2000)}`));
    }, 5 * 60_000);
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (code === 0) resolve(output);
      else reject(new Error(`HyperFrames exited with code ${code}: ${output.slice(-2000)}`));
    });
  });
}

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
    await fs.writeFile(
      path.join(compositionDir, "hyperframes.json"),
      JSON.stringify({
        $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
        media: { autoProxy: true },
      }, null, 2),
      "utf-8",
    );
    await fs.writeFile(path.join(compositionDir, "meta.json"), JSON.stringify({ id: projectId, name: `AI Video ${projectId}` }, null, 2), "utf-8");
    await fs.copyFile(path.join(process.cwd(), "node_modules", "gsap", "dist", "gsap.min.js"), path.join(compositionDir, "gsap.min.js"));

    const rendersDir = path.join(process.cwd(), "public", "renders");
    await fs.mkdir(rendersDir, { recursive: true });
    const outputFilename = `${projectId}-hyperframes.mp4`;
    const outputPath = path.join(rendersDir, outputFilename);

    await runHyperframes(["lint", "."], compositionDir);
    await runHyperframes([
      "render",
      ".",
      "-c", "index.html",
      "-o", outputPath,
      "--fps", String(plan.fps),
      "--quality", quality === "4k" ? "high" : "standard",
    ], compositionDir);

    return NextResponse.json({
      success: true,
      engine: "hyperframes",
      rendered: true,
      message: "HyperFrames MP4 render complete.",
      videoUrl: `/renders/${outputFilename}`,
      compositionUrl: `/compositions/${projectId}/index.html`,
      editPlanUrl: `/compositions/${projectId}/edit-plan.json`,
      plan,
    });
  } catch (error) {
    console.error("Failed to compile Hyperframes composition", error);
    const message = error instanceof Error ? error.message : "Unknown HyperFrames error";
    return NextResponse.json(
      { success: false, error: `Failed to render HyperFrames composition: ${message}` },
      { status: 500 },
    );
  }
}
