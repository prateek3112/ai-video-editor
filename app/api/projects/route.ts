import { NextResponse } from 'next/server';
import { createProject } from '@/lib/local-store';
import { transcriptionQueue } from '@/lib/queue';
import { resolveByobConfig } from '@/lib/byob-client';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { videoUrl, duration } = payload;

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: 'videoUrl is required' }, { status: 400 });
    }

    const project = await createProject({
      videoUrl,
      duration: Number(duration) || 0,
      status: 'processing',
    });

    const captions = Array.isArray(payload.captions)
      ? payload.captions
          .map((caption: { text?: unknown; start?: unknown; end?: unknown }) => ({
            text: String(caption.text ?? '').trim(),
            start: Number(caption.start),
            end: Number(caption.end),
            confidence: 1,
          }))
          .filter((caption: { text: string; start: number; end: number }) =>
            Boolean(caption.text) && Number.isFinite(caption.start) && Number.isFinite(caption.end) && caption.end > caption.start,
          )
      : undefined;

    // Credentials stay in this in-memory job only and are never persisted with the project.
    await transcriptionQueue.add('transcribe', {
      projectId: project.id,
      providerConfig: resolveByobConfig(req, payload),
      captions,
      brandThemeId: String(payload.brandThemeId ?? "electric-lime"),
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}
