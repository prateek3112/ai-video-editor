import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { resolveGeminiApiKey } from "@/lib/byob-client";
import { createProject, setProjectCaptions, type LocalProject } from "@/lib/local-store";
import { createEditPlanFromProject } from "@/lib/edit-plan";
import { DEFAULT_CAPTION_SETTINGS, type CaptionLanguage } from "@/lib/caption-config";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { prompt, language = "hinglish", style = "hormozi", targetDuration = 15 } = payload;
    const engine = payload.engine === "hyperframes" ? "hyperframes" : "remotion";

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required to create an AI video" }, { status: 400 });
    }

    const apiKey = resolveGeminiApiKey(req, payload);
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini API Key is required. Please click 'BYOB API Key' at the top to enter your API key.",
        },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

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

    let generated: any = null;

    try {
      const geminiPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout (10s limit)")), 10000)
      );

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);
      generated = JSON.parse(response.text || "{}");
    } catch (apiErr) {
      console.warn("Gemini call timed out or failed, using synthetic video script fallback:", apiErr);
      const sampleWords = prompt.trim().split(/\s+/).slice(0, 12);
      const stepDuration = Math.max(0.5, Number((targetDuration / Math.max(1, sampleWords.length)).toFixed(2)));
      
      generated = {
        title: prompt.trim().slice(0, 30),
        transcription: sampleWords.map((w: string, i: number) => ({
          word: w,
          start: Number((i * stepDuration).toFixed(2)),
          end: Number(((i + 1) * stepDuration).toFixed(2)),
          confidence: 0.98,
          script: "roman",
        })),
        captionSettings: {
          style,
          animation: "word-pop",
          language,
          defaultScript: "roman",
          textColor: "#FFFFFF",
          activeWordColor: "#FFE600",
          positionX: 0.5,
          positionY: 0.75,
          capitalization: "uppercase",
        },
      };
    }

    const rawTranscription = Array.isArray(generated.transcription) ? generated.transcription : [];
    const duration = rawTranscription.length
      ? Math.max(targetDuration, Number(rawTranscription[rawTranscription.length - 1].end.toFixed(2)))
      : targetDuration;

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
    };

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
