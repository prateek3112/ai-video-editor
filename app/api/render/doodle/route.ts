import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { generateDoodleScript } from "@/lib/doodle-script-generator";
import { compileDoodleHtml } from "@/lib/doodle-composition";
import { createDoodlePlan, type DoodleScript } from "@/lib/doodle-plan";
import { resolveByobConfig } from "@/lib/byob-client";

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

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { topic, script, characterHeadSrc, settings, watermarkText } = payload;
    
    const projectId = crypto.randomUUID();
    const providerConfig = resolveByobConfig(req, payload);

    let doodleScript: DoodleScript;
    if (script) {
      doodleScript = script as DoodleScript;
    } else if (topic) {
      doodleScript = await generateDoodleScript(topic, {
        targetDuration: settings?.targetDuration,
        tone: settings?.tone,
        language: settings?.language,
        providerConfig,
      });
    } else {
      return NextResponse.json({ success: false, error: "topic or script is required" }, { status: 400 });
    }

    const plan = createDoodlePlan({
      projectId,
      topic: topic || doodleScript.title || "Doodle Explainer",
      script: doodleScript,
      characterHeadSrc: characterHeadSrc || '/default-character-head.png',
      watermarkText: watermarkText || 'BW',
      fps: settings?.fps ? Number(settings.fps) : 30,
    });

    const html = compileDoodleHtml(plan);

    const compositionDir = path.join(process.cwd(), 'public', 'compositions', `doodle-${projectId}`);
    await fs.mkdir(compositionDir, { recursive: true });
    await fs.writeFile(path.join(compositionDir, 'index.html'), html, 'utf-8');
    await fs.writeFile(path.join(compositionDir, 'doodle-plan.json'), JSON.stringify(plan, null, 2), 'utf-8');
    
    await fs.writeFile(
      path.join(compositionDir, "hyperframes.json"),
      JSON.stringify({
        $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
        media: { autoProxy: true },
      }, null, 2),
      "utf-8",
    );
    await fs.writeFile(
      path.join(compositionDir, "meta.json"), 
      JSON.stringify({ id: projectId, name: `Doodle Video ${projectId}` }, null, 2), 
      "utf-8"
    );
    await fs.copyFile(
      path.join(process.cwd(), "node_modules", "gsap", "dist", "gsap.min.js"), 
      path.join(compositionDir, "gsap.min.js")
    );

    const compBrandDir = path.join(compositionDir, "brand");
    await fs.mkdir(compBrandDir, { recursive: true });
    await fs.copyFile(
      path.join(process.cwd(), "public", "brand", "ai-character.png"),
      path.join(compBrandDir, "ai-character.png")
    );

    const rendersDir = path.join(process.cwd(), "public", "renders");
    await fs.mkdir(rendersDir, { recursive: true });
    const outputFilename = `doodle-${projectId}.mp4`;
    const outputPath = path.join(rendersDir, outputFilename);

    await runHyperframes(["lint", "."], compositionDir);
    await runHyperframes([
      "render",
      ".",
      "-c", "index.html",
      "-o", outputPath,
      "--fps", String(plan.fps || 30),
      "--quality", "standard",
    ], compositionDir);

    return NextResponse.json({
      success: true,
      engine: 'hyperframes-doodle',
      rendered: true,
      videoUrl: `/renders/${outputFilename}`,
      compositionUrl: `/compositions/doodle-${projectId}/index.html`,
      planUrl: `/compositions/doodle-${projectId}/doodle-plan.json`,
      plan,
      script: doodleScript,
    });

  } catch (error) {
    console.error("Failed to render doodle video", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to render doodle video: ${message}` },
      { status: 500 },
    );
  }
}
