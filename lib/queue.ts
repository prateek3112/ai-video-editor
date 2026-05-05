import { processVideoRender, processTranscription } from './video-processor';
import { type CaptionSettings, type ExportQuality } from './caption-config';
import { setProjectCaptions, updateProject } from './local-store';

// Mock in-memory queue to avoid Redis dependency for local testing
export const transcriptionQueue = {
  add: async (name: string, data: any) => {
    console.log(`Mock transcriptionQueue: Added ${name}`, data);

    queueMicrotask(async () => {
      try {
        await updateProject(data.projectId, { status: 'transcribing' });

        const captions = await processTranscription(data.projectId);

        await setProjectCaptions(
          data.projectId,
          captions.map((cap) => ({
            start: cap.start,
            end: cap.end,
            text: cap.word,
            confidence: cap.confidence,
            script: cap.script,
            highlightWords: [],
          })),
        );

        await updateProject(data.projectId, { status: 'ready' });
        console.log(`Mock transcriptionQueue: Finished ${data.projectId}`);
      } catch (e) {
        console.error("Transcription failed", e);
        await updateProject(data.projectId, { status: 'failed' });
      }
    });
  }
};

export const renderQueue = {
  add: async (name: string, data: any) => {
    console.log(`Mock renderQueue: Added ${name}`, data);

    queueMicrotask(async () => {
      try {
        await updateProject(data.projectId, { status: 'rendering' });

        const outputUrl = await processVideoRender(
          data.projectId,
          data.style,
          data.settings as CaptionSettings,
          (data.quality ?? '4k') as ExportQuality,
        );
        
        await updateProject(data.projectId, { status: 'completed', videoUrl: outputUrl });
        console.log(`Mock renderQueue: Finished ${data.projectId}`);
      } catch (e) {
        console.error("Render failed", e);
        await updateProject(data.projectId, { status: 'failed' });
      }
    });
  }
};
