import { processVideoRender, processTranscription } from './video-processor';
import { type CaptionSettings, type ExportQuality } from './caption-config';
import { setProjectCaptions, setProjectVisualScenes, updateProject } from './local-store';
import type { ByobConfig } from './byob-client';
import { directVisualScenes } from './visual-director';
import type { ScriptVisualScene } from './script-visuals';

// In-memory async queue — works without Redis for local/Azure VM deployments.
// Jobs run immediately via queueMicrotask with proper error recovery.

type TranscriptionJob = {
  projectId: string;
  providerConfig: ByobConfig;
  captions?: Array<{ start: number; end: number; text: string; confidence?: number }>;
  brandThemeId?: string;
};

async function safeUpdateProject(projectId: string, update: Record<string, unknown>): Promise<void> {
  try {
    await updateProject(projectId, update);
  } catch (err) {
    console.error(`[Queue] Failed to update project ${projectId}:`, err);
  }
}

export const transcriptionQueue = {
  add: async (name: string, data: TranscriptionJob) => {
    // Never log BYOB credentials. Provider config is intentionally memory-only.
    console.log(`[Queue] Transcription: Added "${name}" for ${data.projectId} via ${data.providerConfig.provider}`);

    queueMicrotask(async () => {
      const startTime = Date.now();
      try {
        await safeUpdateProject(data.projectId, { status: 'transcribing' });

        console.log(`[Queue] Transcription: Starting for ${data.projectId}...`);
        const captions = data.captions?.length
          ? data.captions.map((caption) => ({ ...caption, word: caption.text, script: 'roman' as const }))
          : await processTranscription(data.projectId, data.providerConfig);

        console.log(`[Queue] Transcription: Got ${captions.length} caption tokens for ${data.projectId}`);

        const updatedProject = await setProjectCaptions(
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

        console.log(`[Queue] Visual scenes: Generating for ${data.projectId}...`);
        let visualScenes: ScriptVisualScene[] = [];
        try {
          visualScenes = await directVisualScenes({
            captions: updatedProject.captions.map((caption) => ({ text: caption.text, start: caption.start, end: caption.end })),
            duration: updatedProject.duration,
            config: data.providerConfig,
            brandThemeId: data.brandThemeId,
          });
        } catch (visualErr) {
          // Visual scene generation is non-critical — captions alone are enough
          console.warn(`[Queue] Visual scene generation failed (non-critical):`, visualErr);
          visualScenes = [];
        }

        if (visualScenes.length) {
          await setProjectVisualScenes(data.projectId, visualScenes);
        }

        await safeUpdateProject(data.projectId, { status: 'ready', error: undefined });
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Queue] Transcription: Completed ${data.projectId} in ${elapsed}s`);
      } catch (e) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const message = e instanceof Error ? e.message : 'Transcription failed';
        console.error(`[Queue] Transcription FAILED for ${data.projectId} after ${elapsed}s:`, message);
        await safeUpdateProject(data.projectId, {
          status: 'failed',
          error: message,
        });
      }
    });
  }
};

export const renderQueue = {
  add: async (name: string, data: Record<string, unknown> & { projectId: string }) => {
    console.log(`[Queue] Render: Added "${name}" for ${data.projectId}`);

    queueMicrotask(async () => {
      const startTime = Date.now();
      try {
        await safeUpdateProject(data.projectId, { status: 'rendering' });

        console.log(`[Queue] Render: Starting for ${data.projectId}...`);
        const outputUrl = await processVideoRender(
          data.projectId,
          data.style as string,
          data.settings as CaptionSettings,
          (data.quality ?? '4k') as ExportQuality,
        );

        await safeUpdateProject(data.projectId, { status: 'completed', videoUrl: outputUrl });
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Queue] Render: Completed ${data.projectId} in ${elapsed}s → ${outputUrl}`);
      } catch (e) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const message = e instanceof Error ? e.message : 'Render failed';
        console.error(`[Queue] Render FAILED for ${data.projectId} after ${elapsed}s:`, message);
        await safeUpdateProject(data.projectId, {
          status: 'failed',
          error: message,
        });
      }
    });
  }
};
