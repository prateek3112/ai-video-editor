import { NextResponse } from "next/server";
import { getProjectById, setProjectCaptions } from "@/lib/local-store";
import { DEFAULT_CAPTION_SETTINGS, type CaptionLanguage, type CaptionScript } from "@/lib/caption-config";
import { serializeSubtitles } from "@/lib/subtitle-utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (format === "srt" || format === "vtt" || format === "txt") {
      const languageQuery = searchParams.get("language");
      const language: CaptionLanguage =
        languageQuery === "hinglish" || languageQuery === "hindi" || languageQuery === "english"
          ? languageQuery
          : DEFAULT_CAPTION_SETTINGS.language;

      const scriptQuery = searchParams.get("script");
      const fallbackScript: CaptionScript = scriptQuery === "devanagari" ? "devanagari" : "roman";

      const fileText = serializeSubtitles(
        format,
        project.captions.map((caption) => ({
          word: caption.text,
          start: caption.start,
          end: caption.end,
          confidence: caption.confidence,
          script: caption.script,
          highlightWords: caption.highlightWords,
          positionX: caption.positionX,
          positionY: caption.positionY,
        })),
        language,
        fallbackScript,
      );

      const contentType =
        format === "srt"
          ? "application/x-subrip"
          : format === "vtt"
            ? "text/vtt; charset=utf-8"
            : "text/plain; charset=utf-8";

      return new NextResponse(fileText, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename=captionai-${id}.${format}`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await req.json();

    if (!Array.isArray(payload?.captions)) {
      return NextResponse.json({ success: false, error: "captions array is required" }, { status: 400 });
    }

    const normalized: Array<{
      start: number;
      end: number;
      text: string;
      confidence?: number;
      script?: CaptionScript;
      highlightWords?: string[];
      positionX?: number;
      positionY?: number;
    }> = payload.captions
      .map((caption: {
        start: number;
        end: number;
        text: string;
        confidence?: number;
        script?: string;
        highlightWords?: unknown;
        positionX?: unknown;
        positionY?: unknown;
      }) => {
          const start = Number(caption.start);
          const end = Number(caption.end);
          const text = String(caption.text ?? "").trim();
          const confidence = Number(caption.confidence);
          const positionX = Number(caption.positionX);
          const positionY = Number(caption.positionY);
          const script: CaptionScript | undefined =
            caption.script === "roman" || caption.script === "devanagari" ? caption.script : undefined;
          const highlightWords = Array.isArray(caption.highlightWords)
            ? caption.highlightWords.map((word) => String(word).trim()).filter(Boolean).slice(0, 8)
            : undefined;

          if (!Number.isFinite(start) || !Number.isFinite(end) || !text) {
            return null;
          }

          const safeStart = Math.max(0, Number(start.toFixed(2)));
          const safeEnd = Math.max(Number((safeStart + 0.05).toFixed(2)), Number(end.toFixed(2)));

          return {
            start: safeStart,
            end: safeEnd,
            text,
            confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, Number(confidence.toFixed(3)))) : undefined,
            script,
            highlightWords,
            positionX: Number.isFinite(positionX) ? Math.min(0.95, Math.max(0.05, Number(positionX.toFixed(3)))) : undefined,
            positionY: Number.isFinite(positionY) ? Math.min(0.95, Math.max(0.05, Number(positionY.toFixed(3)))) : undefined,
          };
        })
        .filter(
          (
            caption: {
              start: number;
              end: number;
              text: string;
              confidence?: number;
              script?: CaptionScript;
              highlightWords?: string[];
              positionX?: number;
              positionY?: number;
            } | null,
          ): caption is {
            start: number;
            end: number;
            text: string;
            confidence?: number;
            script?: CaptionScript;
            highlightWords?: string[];
            positionX?: number;
            positionY?: number;
          } => Boolean(caption),
        )
        .sort((a: { start: number }, b: { start: number }) => a.start - b.start);

    if (!normalized.length) {
      return NextResponse.json({ success: false, error: "No valid captions provided" }, { status: 400 });
    }

    await setProjectCaptions(id, normalized);
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to update captions" }, { status: 500 });
  }
}
