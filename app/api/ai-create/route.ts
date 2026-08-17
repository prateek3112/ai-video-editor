import { NextResponse } from "next/server";
import { resolveByobConfig } from "@/lib/byob-client";
import { generateStructuredJson } from "@/lib/structured-ai";
import { createProject, setProjectCaptions, setProjectVisualScenes, type LocalProject } from "@/lib/local-store";
import { createEditPlanFromProject } from "@/lib/edit-plan";
import { DEFAULT_CAPTION_SETTINGS, type CaptionLanguage } from "@/lib/caption-config";
import { directVisualScenes } from "@/lib/visual-director";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { prompt, language = "hinglish", style = "hormozi", targetDuration = 15 } = payload;
    const engine = payload.engine === "hyperframes" ? "hyperframes" : "remotion";

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required to create an AI video" }, { status: 400 });
    }

    const providerConfig = resolveByobConfig(req, payload);

    const systemPrompt = `You are an expert AI Video Creator and Editor specialized in short-form content (Reels/Shorts/TikTok).
Given a user prompt, generate a complete video project structure.

User Request: "${prompt}"
Language: ${language} (english, hinglish, or hindi)
Requested Style: ${style}
Target Duration: ${targetDuration} seconds

Return ONLY a valid JSON object matching this schema:
{
  "title": "Catchy Title",
  "transcription": [
    {
      "word": "word or phrase",
      "start": 0.0,
      "end": 0.8,
      "confidence": 0.98,
      "script": "roman"
    }
  ],
  "captionSettings": {
    "style": "${style}",
    "animation": "word-pop",
    "language": "${language}",
    "defaultScript": "roman",
    "textColor": "#FFFFFF",
    "activeWordColor": "#FFE600",
    "positionX": 0.5,
    "positionY": 0.75,
    "capitalization": "uppercase"
  }
}

Generate engaging, high-retention transcript words for a ${targetDuration}s video with word-level timestamps covering 0.0 to ${targetDuration}.0s. For Hinglish, use Romanized Hindi words mixed naturally with English.`;

    const generated = await generateStructuredJson<{
      title?: string;
      transcription?: Array<{ word?: string; start?: number; end?: number; confidence?: number; script?: string }>;
      captionSettings?: Record<string, unknown>;
    }>(providerConfig, systemPrompt);

    const rawTranscription = Array.isArray(generated.transcription) ? generated.transcription : [];
    if (!rawTranscription.length) {
      return NextResponse.json({ success: false, error: "The AI provider returned no timed script." }, { status: 502 });
    }
    const lastEnd = Number(rawTranscription[rawTranscription.length - 1]?.end ?? targetDuration);
    const duration = Math.max(targetDuration, Number((Number.isFinite(lastEnd) ? lastEnd : targetDuration).toFixed(2)));

    // Create local project in store
    let project: LocalProject = await createProject({
      videoUrl: "",
      duration,
      status: "ready",
    });

    const formattedCaptions = rawTranscription.map((t: any) => ({
      start: Number(t.start ?? 0),
      end: Number(t.end ?? 0),
      text: String(t.word ?? ""),
      confidence: Number(t.confidence ?? 0.95),
      script: t.script === "devanagari" ? ("devanagari" as const) : ("roman" as const),
    }));

    project = await setProjectCaptions(project.id, formattedCaptions);

    const captionSettings = {
      ...DEFAULT_CAPTION_SETTINGS,
      ...(generated.captionSettings || {}),
      language: (language as CaptionLanguage) || "hinglish",
      style: style || "hormozi",
      brandThemeId: String(payload.brandThemeId ?? "electric-lime"),
    };

    const visualScenes = await directVisualScenes({
      captions: project.captions.map((caption) => ({ text: caption.text, start: caption.start, end: caption.end })),
      duration: project.duration,
      config: providerConfig,
      brandThemeId: String(payload.brandThemeId ?? captionSettings.brandThemeId),
    });
    project = await setProjectVisualScenes(project.id, visualScenes);

    const plan = createEditPlanFromProject({
      project,
      settings: captionSettings,
      quality: "1080p",
      fps: 30,
      width: 1080,
      height: 1920,
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      engine,
      project,
      plan,
      message: `AI video project created successfully with ${engine} engine`,
    });
  } catch (error: any) {
    console.error("AI Create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create AI video project",
      },
      { status: 500 }
    );
  }
}
