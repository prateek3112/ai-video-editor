import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/local-store';
import { renderQueue } from '@/lib/queue';
import { DEFAULT_CAPTION_SETTINGS, type CaptionSettings, type ExportQuality } from '@/lib/caption-config';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const projectId = payload.projectId as string;
    const style = payload.style as string;
    const quality = (payload.quality ?? '4k') as ExportQuality;
    const settings = {
      ...DEFAULT_CAPTION_SETTINGS,
      ...(payload.settings as Partial<CaptionSettings> | undefined),
      style,
    };

    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    await renderQueue.add('render-video', { projectId, style, quality, settings });

    return NextResponse.json({ success: true, message: 'Render queued', quality });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to queue render' }, { status: 500 });
  }
}
