import {
  DEFAULT_CAPTION_SETTINGS,
  type CaptionScript,
  type CaptionSettings,
  type ExportQuality,
} from "./caption-config";
import type { LocalProject } from "./local-store";
import type { OverlayKind, SfxPreset, TransitionPreset } from "./effects-registry";
import { createScriptVisualScenes, type ScriptVisualScene } from "./script-visuals";

export type EditPlanVersion = 1;
export type TimelineTrackKind = "video" | "caption" | "overlay" | "audio" | "sfx" | "effect" | "transition";

export type TimelineTrack = {
  id: string;
  name: string;
  kind: TimelineTrackKind;
  index: number;
  locked?: boolean;
  muted?: boolean;
};

export type BaseClip = {
  id: string;
  trackId: string;
  start: number;
  duration: number;
};

export type VideoClip = BaseClip & {
  type: "video";
  src: string;
  mediaStart?: number;
  volume?: number;
};

export type CaptionClip = BaseClip & {
  type: "caption";
  text: string;
  confidence?: number;
  script?: CaptionScript;
  positionX?: number;
  positionY?: number;
  highlightWords?: string[];
};

export type OverlayClip = BaseClip & {
  type: "overlay";
  kind: OverlayKind;
  text?: string;
  src?: string;
  positionX: number;
  positionY: number;
  scale?: number;
  opacity?: number;
};

export type ScriptVisualClip = BaseClip & {
  type: "script-visual";
  scene: ScriptVisualScene;
};

export type AudioClip = BaseClip & {
  type: "audio" | "sfx";
  src: string;
  volume: number;
  mediaStart?: number;
  preset?: SfxPreset;
};

export type EffectClip = BaseClip & {
  type: "effect";
  effect: string;
  intensity: number;
};

export type TransitionClip = BaseClip & {
  type: "transition";
  transition: TransitionPreset;
};

export type TimelineClip = VideoClip | CaptionClip | OverlayClip | ScriptVisualClip | AudioClip | EffectClip | TransitionClip;

export type EditPlan = {
  version: EditPlanVersion;
  projectId: string;
  duration: number;
  fps: 24 | 30 | 60;
  width: number;
  height: number;
  quality: ExportQuality;
  settings: CaptionSettings;
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
};

export type EditCommand =
  | { type: "caption.style"; params: Partial<CaptionSettings> }
  | { type: "caption.translate"; targetScript?: CaptionScript; params?: Partial<CaptionSettings> }
  | { type: "video.effect"; effect: string; start: number; end: number; intensity?: number }
  | { type: "overlay.add"; overlay: Omit<OverlayClip, "id" | "trackId" | "type"> & { id?: string } }
  | { type: "sfx.add"; sfx: Omit<AudioClip, "id" | "trackId" | "type"> & { id?: string; preset?: SfxPreset } }
  | { type: "transition.add"; transition: TransitionPreset; at: number; duration?: number };

const DEFAULT_TRACKS: TimelineTrack[] = [
  { id: "video-main", name: "A-Roll", kind: "video", index: 0 },
  { id: "script-visuals", name: "Script Visuals", kind: "overlay", index: 2 },
  { id: "video-effects", name: "Video Effects", kind: "effect", index: 1 },
  { id: "captions-main", name: "Captions", kind: "caption", index: 4 },
  { id: "overlays-main", name: "Overlays", kind: "overlay", index: 5 },
  { id: "audio-main", name: "Source Audio", kind: "audio", index: 0 },
  { id: "sfx-main", name: "SFX", kind: "sfx", index: 3 },
  { id: "transitions-main", name: "Transitions", kind: "transition", index: 6 },
  { id: "motion-main", name: "Motion", kind: "effect", index: 7 },
];

function roundTime(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Number(Math.max(0, value).toFixed(3));
}

function clipDuration(start: number, end: number): number {
  return roundTime(Math.max(0.05, end - start));
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

export function createEditPlanFromProject(input: {
  project: LocalProject;
  settings?: Partial<CaptionSettings>;
  quality?: ExportQuality;
  fps?: 24 | 30 | 60;
  width?: number;
  height?: number;
}): EditPlan {
  const settings: CaptionSettings = {
    ...DEFAULT_CAPTION_SETTINGS,
    ...input.settings,
  };
  const now = new Date().toISOString();
  const duration = roundTime(input.project.duration || 0);

  const videoClip: VideoClip = {
    id: "video-0001",
    type: "video",
    trackId: "video-main",
    start: 0,
    duration,
    src: input.project.sourceVideoUrl || input.project.videoUrl,
    volume: 1,
  };

  const captionClips: CaptionClip[] = input.project.captions.map((caption, index) => ({
    id: makeId("caption", index),
    type: "caption",
    trackId: "captions-main",
    start: roundTime(caption.start),
    duration: clipDuration(caption.start, caption.end),
    text: caption.text,
    confidence: caption.confidence,
    script: caption.script,
    positionX: caption.positionX,
    positionY: caption.positionY,
    highlightWords: caption.highlightWords,
  }));
  const plannedScenes = input.project.visualScenes?.length
    ? input.project.visualScenes
    : createScriptVisualScenes(
        input.project.captions.map((caption) => ({
          text: caption.text,
          start: caption.start,
          end: caption.end,
        })),
        duration,
        settings.brandThemeId,
      );
  const visualClips: ScriptVisualClip[] = plannedScenes.map((scene) => ({
    id: scene.id,
    type: "script-visual",
    trackId: "script-visuals",
    start: scene.start,
    duration: clipDuration(scene.start, scene.end),
    scene,
  }));
  const sfxClips: AudioClip[] = [];
  visualClips.forEach((clip, index) => {
    if (clip.start <= 0.15) return;
    
    // Skip some for pacing (e.g. every other, except for key moments)
    const isKeyMoment = clip.scene.layout === "full-visual" || clip.scene.visualType === "meme" || clip.scene.motif === "warning" || clip.scene.layout === "overlay";
    if (!isKeyMoment && index % 2 !== 0) return;

    const prevClip = visualClips[index - 1];
    
    let preset: SfxPreset = "whoosh";
    if (clip.scene.layout === "full-visual") {
      preset = "sub-hit"; // For impactful visual reveals
      
      // Add a riser *before* the full-visual scene if possible
      if (clip.start > 1.5) { // Needs some time for a riser
         sfxClips.push({
           id: makeId("sfx-riser", index),
           type: "sfx",
           trackId: "sfx-main",
           start: clip.start - 1.0,
           duration: 1.0,
           src: "/sfx/riser.wav",
           preset: "riser",
           volume: 0.15,
         });
      }
    } else if (clip.scene.layout === "overlay") {
      preset = "camera-shutter";
    } else if (prevClip?.scene.layout === "speaker" && clip.scene.layout === "split") {
      preset = "pop";
    } else if (clip.scene.visualType === "meme") {
      preset = "pop";
    } else if (clip.scene.motif === "warning") {
      preset = "impact";
    } else if (clip.scene.motif === "money") {
      preset = "click";
    } else {
      preset = "whoosh";
    }

    const duration = preset === "impact" ? 0.55 : preset === "whoosh" ? 0.35 : (preset as string) === "notification" ? 0.32 : preset === "click" ? 0.09 : preset === "sub-hit" ? 0.8 : preset === "camera-shutter" ? 0.2 : preset === "pop" ? 0.15 : 0.18;
    
    sfxClips.push({
      id: makeId("sfx", index),
      type: "sfx",
      trackId: "sfx-main",
      start: clip.start,
      duration,
      src: `/sfx/${preset}.wav`,
      preset,
      volume: preset === "impact" || preset === "sub-hit" ? 0.12 : 0.18,
    });
  });

  const transitionClips: TransitionClip[] = [];
  visualClips.forEach((clip, index) => {
    if (clip.start <= 0.15) return;
    const prevClip = visualClips[index - 1];
    if (prevClip && prevClip.scene.layout === clip.scene.layout) return;

    let transitionPreset: TransitionPreset = "fade";
    let duration = 0.12;

    if (clip.scene.visualType === "meme") {
      transitionPreset = "glitch";
      duration = 0.2;
    } else if (clip.scene.layout === "full-visual") {
      transitionPreset = "zoom-cut";
      duration = 0.15;
    } else if (["rocket", "fire", "trophy"].includes(clip.scene.motif)) {
      transitionPreset = "flash-white";
      duration = 0.18;
    }

    transitionClips.push({
      id: makeId("transition", index),
      type: "transition",
      trackId: "transitions-main",
      start: clip.start,
      duration,
      transition: transitionPreset,
    });
  });

  const clips: TimelineClip[] = [
    videoClip,
    {
      id: "effect-base-grade",
      type: "effect",
      trackId: "video-effects",
      start: 0,
      duration,
      effect: settings.videoEffect,
      intensity: settings.effectIntensity,
    },
    ...visualClips,
    ...sfxClips,
    ...transitionClips,
    ...captionClips,
  ];

  return {
    version: 1,
    projectId: input.project.id,
    duration,
    fps: input.fps ?? 30,
    width: input.width ?? 1080,
    height: input.height ?? 1920,
    quality: input.quality ?? "1080p",
    settings,
    tracks: DEFAULT_TRACKS,
    clips,
    notes: [
      "Generated from the current AI Video Editor project state.",
      "Visual copy is constrained to English and scene layouts alternate between speaker, split, overlay, and full-screen visual moments.",
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function applyEditCommands(plan: EditPlan, commands: EditCommand[]): EditPlan {
  let next: EditPlan = {
    ...plan,
    settings: { ...plan.settings },
    tracks: plan.tracks.map((track) => ({ ...track })),
    clips: plan.clips.map((clip) => ({ ...clip })),
    notes: [...plan.notes],
    updatedAt: new Date().toISOString(),
  };

  commands.forEach((command, commandIndex) => {
    if (command.type === "caption.style") {
      next = {
        ...next,
        settings: {
          ...next.settings,
          ...command.params,
        },
      };
      return;
    }

    if (command.type === "caption.translate") {
      next = {
        ...next,
        settings: {
          ...next.settings,
          ...command.params,
          defaultScript: command.targetScript ?? command.params?.defaultScript ?? next.settings.defaultScript,
        },
      };
      return;
    }

    if (command.type === "video.effect") {
      const start = roundTime(command.start);
      const end = roundTime(command.end);
      next.clips.push({
        id: `effect-command-${commandIndex + 1}`,
        type: "effect",
        trackId: "video-effects",
        start,
        duration: clipDuration(start, end),
        effect: command.effect,
        intensity: Math.min(1, Math.max(0, command.intensity ?? 0.65)),
      });
      return;
    }

    if (command.type === "overlay.add") {
      next.clips.push({
        id: command.overlay.id ?? `overlay-command-${commandIndex + 1}`,
        type: "overlay",
        trackId: "overlays-main",
        ...command.overlay,
        start: roundTime(command.overlay.start),
        duration: roundTime(command.overlay.duration),
      });
      return;
    }

    if (command.type === "sfx.add") {
      next.clips.push({
        id: command.sfx.id ?? `sfx-command-${commandIndex + 1}`,
        type: "sfx",
        trackId: "sfx-main",
        ...command.sfx,
        start: roundTime(command.sfx.start),
        duration: roundTime(command.sfx.duration),
        volume: Math.min(1, Math.max(0, command.sfx.volume)),
      });
      return;
    }

    if (command.type === "transition.add") {
      const duration = command.duration ?? 0.25;
      next.clips.push({
        id: `transition-command-${commandIndex + 1}`,
        type: "transition",
        trackId: "transitions-main",
        start: roundTime(command.at),
        duration: roundTime(duration),
        transition: command.transition,
      });
    }
  });

  next.clips.sort((a, b) => a.start - b.start || a.trackId.localeCompare(b.trackId));
  return next;
}
