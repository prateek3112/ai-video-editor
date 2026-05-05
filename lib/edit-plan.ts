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
  const visualClips: ScriptVisualClip[] = createScriptVisualScenes(
    input.project.captions.map((caption) => ({
      text: caption.text,
      start: caption.start,
      end: caption.end,
    })),
    duration,
  ).map((scene) => ({
    id: scene.id,
    type: "script-visual",
    trackId: "script-visuals",
    start: scene.start,
    duration: clipDuration(scene.start, scene.end),
    scene,
  }));

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
    notes: ["Generated from the current CaptionAI project state."],
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
