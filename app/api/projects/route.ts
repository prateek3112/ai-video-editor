import { NextResponse } from 'next/server';
import { createProject } from '@/lib/local-store';
import { transcriptionQueue } from '@/lib/queue';

export async function POST(req: Request) {
  try {
    const { videoUrl, duration } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: 'videoUrl is required' }, { status: 400 });
    }

    const project = await createProject({
      videoUrl,
      duration: Number(duration) || 0,
      status: 'processing',
    });

    // Enqueue BullMQ job for transcription
    await transcriptionQueue.add('transcribe', { projectId: project.id });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}
