"use client";

import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Scissors,
  Wand2,
  Plus,
  Download,
  ChevronLeft,
  Loader2,
  Languages,
  Sparkles,
  BadgeCheck,
  Clapperboard,
  Film,
  Move,
  Palette,
  Type,
  Zap,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ByobKeyDialog } from "@/components/byob-key-dialog";
import { AiCreateDialog } from "@/components/ai-create-dialog";
import { useSearchParams } from "next/navigation";
import { RemotionPlayerPreview } from "@/components/remotion/RemotionPlayerPreview";
import { getAuthHeaders } from "@/lib/byob-client";
import { createEditPlanFromProject } from "@/lib/edit-plan";
import {
  FONT_FAMILIES,
  LANGUAGE_SAMPLE_TEXT,
  STYLE_PRESETS,
  type CaptionAnimation,
  type CaptionCapitalization,
  type CaptionEffect,
  type CaptionLayout,
  type CaptionScript,
  type CaptionSettings,
  type CaptionTransition,
  type ExportFormat,
  type ExportQuality,
  type MotionPreset,
  type VideoEffect,
} from "@/lib/caption-config";
import { parseSubtitleText, renderCaptionWord, type ParsedSubtitleCaption } from "@/lib/subtitle-utils";
import { createScriptVisualScenes } from "@/lib/script-visuals";
import type { ScriptVisualScene } from "@/lib/script-visuals";
import { BRAND_THEMES, getBrandTheme } from "@/lib/brand-themes";

const ANIMATIONS: CaptionAnimation[] = ["fade", "slide-up", "zoom", "bounce", "shake", "pulse", "flicker", "typewriter", "karaoke", "word-pop"];
const EFFECTS: CaptionEffect[] = ["shadow", "outline", "glow", "glass", "sticker", "none"];
const TRANSITIONS: CaptionTransition[] = ["smooth", "snappy"];
const QUALITIES: ExportQuality[] = ["720p", "1080p", "4k"];
const EXPORT_FORMATS: Array<Exclude<ExportFormat, "mp4">> = ["srt", "vtt", "txt"];
const CAPITALIZATION_MODES: CaptionCapitalization[] = ["normal", "uppercase", "title"];
const VIDEO_EFFECTS: VideoEffect[] = ["none", "cinematic", "vibrant", "noir", "warm", "cool", "sharpen", "vintage"];
const MOTION_PRESETS: MotionPreset[] = ["none", "punch-in", "drift", "float", "handheld"];
const CAPTION_SYNC_TOLERANCE = 0.18;
const CAPTION_GAP_TOLERANCE = 0.24;
const LOW_CONFIDENCE_THRESHOLD = 0.76;
const MAX_HISTORY_ENTRIES = 80;

const HINGLISH_WORD_MAP: Record<string, string> = {
  this: "ye",
  clip: "clip",
  is: "hai",
  ready: "ready",
  for: "ke liye",
  captions: "captions",
};

function localizeWord(word: string, language: "english" | "hinglish" | "hindi"): string {
  if (language === "english") return word;
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  return HINGLISH_WORD_MAP[clean] ?? word;
}

function toRgba(hex: string, opacity: number): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return `rgba(0,0,0,${opacity})`;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function readSliderValue(value: number | readonly number[]): number {
  if (typeof value === "number") {
    return value;
  }

  return value[0] ?? 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeKeyword(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]/g, "");
}

function parseHighlightWords(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((word) => word.trim())
        .filter(Boolean),
    ),
  ).slice(0, 8);
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 30;
      URL.revokeObjectURL(video.src);
      resolve(Math.max(1, duration));
    };
    video.onerror = () => resolve(30);
  });
}

type TimelineCaption = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  script?: CaptionScript;
  highlightWords?: string[];
  positionX?: number;
  positionY?: number;
};
type PreviewCaptionToken = { word: string; active: boolean; highlighted: boolean; lowConfidence: boolean; pop: boolean; fadeAlpha: number };
type TimelineDragState = {
  index: number;
  mode: "move" | "resize-start" | "resize-end";
  originX: number;
  originStart: number;
  originEnd: number;
};
type PreviewInteraction = {
  mode: "move" | "resize";
  originClientX: number;
  originClientY: number;
  originX: number;
  originY: number;
  originScale: number;
};

const CAPCUT_LOOKS: Array<{
  id: string;
  name: string;
  description: string;
  settings: Partial<CaptionSettings>;
}> = [
  {
    id: "viral-pop",
    name: "Viral Pop",
    description: "Big creator captions with punchy movement.",
    settings: {
      style: "creator-pop",
      fontFamily: "Avenir Next",
      fontWeight: 900,
      fontScale: 1.18,
      layout: "bottom",
      positionY: 0.8,
      maxWordsPerLine: 3,
      effectPreset: "sticker",
      animation: "word-pop",
      transition: "snappy",
      capitalization: "uppercase",
      textColor: "#ffffff",
      activeWordColor: "#facc15",
      emphasisColor: "#facc15",
      strokeColor: "#000000",
      strokeWidth: 3.4,
      shadowStrength: 0.72,
      highlightEnabled: false,
      videoEffect: "vibrant",
      motionPreset: "punch-in",
      effectIntensity: 0.72,
    },
  },
  {
    id: "clean-pro",
    name: "Clean Pro",
    description: "Minimal captions for polished talking-head edits.",
    settings: {
      style: "clean-minimal",
      fontFamily: "Inter",
      fontWeight: 700,
      fontScale: 0.92,
      layout: "bottom",
      positionY: 0.84,
      maxWordsPerLine: 5,
      effectPreset: "shadow",
      animation: "slide-up",
      transition: "smooth",
      capitalization: "normal",
      textColor: "#f8fafc",
      activeWordColor: "#38bdf8",
      emphasisColor: "#38bdf8",
      strokeWidth: 1.2,
      shadowStrength: 0.52,
      videoEffect: "cinematic",
      motionPreset: "drift",
      effectIntensity: 0.5,
    },
  },
  {
    id: "neon-reel",
    name: "Neon Reel",
    description: "Flicker glow captions and energetic color.",
    settings: {
      style: "reel-neon",
      fontFamily: "Sora",
      fontWeight: 850,
      fontScale: 1.08,
      layout: "center",
      positionY: 0.54,
      maxWordsPerLine: 4,
      effectPreset: "glow",
      animation: "flicker",
      transition: "snappy",
      capitalization: "title",
      textColor: "#ffffff",
      activeWordColor: "#2dd4bf",
      emphasisColor: "#2dd4bf",
      strokeColor: "#07111f",
      strokeWidth: 1.8,
      shadowStrength: 0.86,
      videoEffect: "cool",
      motionPreset: "float",
      effectIntensity: 0.74,
    },
  },
  {
    id: "meme-cut",
    name: "Meme Cut",
    description: "Bold top text with a sharper handheld feel.",
    settings: {
      style: "meme",
      fontFamily: "Impact",
      fontWeight: 900,
      fontScale: 1.1,
      layout: "top",
      positionY: 0.13,
      maxWordsPerLine: 4,
      effectPreset: "outline",
      animation: "shake",
      transition: "snappy",
      capitalization: "uppercase",
      textColor: "#ffffff",
      activeWordColor: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 3.2,
      shadowStrength: 0.4,
      videoEffect: "sharpen",
      motionPreset: "handheld",
      effectIntensity: 0.64,
    },
  },
];

function layoutToPositionY(layout: CaptionLayout): number {
  if (layout === "top") return 0.18;
  if (layout === "center") return 0.5;
  return 0.82;
}

function normalizeTimelineCaptions(captions: TimelineCaption[]): TimelineCaption[] {
  if (!captions.length) return [];

  const normalizeCaption = (caption: TimelineCaption): TimelineCaption => {
    const confidence = Number(caption.confidence);
    const script = caption.script === "roman" || caption.script === "devanagari" ? caption.script : undefined;
    const positionX = Number(caption.positionX);
    const positionY = Number(caption.positionY);
    return {
      word: caption.word.trim(),
      start: Number(caption.start.toFixed(2)),
      end: Number(caption.end.toFixed(2)),
      confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, Number(confidence.toFixed(3)))) : undefined,
      script,
      highlightWords: Array.isArray(caption.highlightWords) ? caption.highlightWords.map((word) => word.trim()).filter(Boolean).slice(0, 8) : undefined,
      positionX: Number.isFinite(positionX) ? clamp(Number(positionX.toFixed(3)), 0.05, 0.95) : undefined,
      positionY: Number.isFinite(positionY) ? clamp(Number(positionY.toFixed(3)), 0.05, 0.95) : undefined,
    };
  };

  const hasPhraseCaptions = captions.some((caption) => caption.word.trim().includes(" "));
  if (hasPhraseCaptions) {
    return captions
      .map((caption) => normalizeCaption(caption))
      .filter((caption) => caption.word.length > 0 && caption.end > caption.start)
      .sort((a, b) => a.start - b.start);
  }

  const grouped: TimelineCaption[] = [];
  let bucket: TimelineCaption[] = [];

  const flush = () => {
    if (!bucket.length) return;
    const confidences = bucket
      .map((caption) => caption.confidence)
      .filter((value): value is number => Number.isFinite(value));
    const avgConfidence = confidences.length
      ? Number((confidences.reduce((sum, value) => sum + value, 0) / confidences.length).toFixed(3))
      : undefined;

    grouped.push({
      word: bucket.map((caption) => caption.word).join(" "),
      start: Number(bucket[0].start.toFixed(2)),
      end: Number(bucket[bucket.length - 1].end.toFixed(2)),
      confidence: avgConfidence,
      script: bucket.find((caption) => caption.script)?.script,
    });
    bucket = [];
  };

  for (const caption of captions) {
    const cleanWord = caption.word.trim();
    if (!cleanWord) continue;

    if (!bucket.length) {
      bucket.push({ ...caption, word: cleanWord });
      continue;
    }

    const nextDuration = caption.end - bucket[0].start;
    const prev = bucket[bucket.length - 1];
    const gap = caption.start - prev.end;

    if (bucket.length >= 5 || nextDuration > 2.2 || gap > 0.45) {
      flush();
    }

    bucket.push({ ...caption, word: cleanWord });
  }

  flush();
  return grouped;
}

export default function EditorPage() {
  const {
    project,
    setProject,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    selectedStyle,
    setSelectedStyle,
    captionSettings,
    updateCaptionSettings,
    setCaptionLanguage,
    exportQuality,
    setExportQuality,
    setTranscription,
  } = useEditorStore();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCompilingHyperframes, setIsCompilingHyperframes] = useState(false);
  const [compositionUrl, setCompositionUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubtitleExporting, setIsSubtitleExporting] = useState(false);
  const [subtitleFormat, setSubtitleFormat] = useState<Exclude<ExportFormat, "mp4">>("srt");
  const [globalOffsetSeconds, setGlobalOffsetSeconds] = useState(0);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState<number | null>(null);
  const [isSavingCaptions, setIsSavingCaptions] = useState(false);
  const [engineMode, setEngineMode] = useState<"remotion" | "hyperframes" | "canvas">(() => {
    if (typeof window === "undefined") return "canvas";
    const requested = new URLSearchParams(window.location.search).get("engine");
    return requested === "hyperframes" ? "hyperframes" : requested === "remotion" ? "remotion" : "canvas";
  });
  const [suppliedCaptions, setSuppliedCaptions] = useState<ParsedSubtitleCaption[]>([]);
  const [suppliedCaptionName, setSuppliedCaptionName] = useState("");
  const [inlineEditingIndex, setInlineEditingIndex] = useState<number | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [dragState, setDragState] = useState<TimelineDragState | null>(null);
  const [previewInteraction, setPreviewInteraction] = useState<PreviewInteraction | null>(null);
  const [isRenderingRemotion, setIsRenderingRemotion] = useState(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const undoHistoryRef = useRef<TimelineCaption[][]>([]);
  const redoHistoryRef = useRef<TimelineCaption[][]>([]);
  const unmountedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const activeVideoSrc = localPreviewUrl ?? project?.videoUrl ?? null;

  const visualScenes = project?.visualScenes;
  const themedVisualScenes = useMemo(() => {
    if (!visualScenes?.length) return undefined;
    const theme = getBrandTheme(captionSettings.brandThemeId);
    return visualScenes.map((scene) => ({
      ...scene,
      palette: {
        background: theme.background,
        accent: theme.accent,
        secondary: theme.secondary,
      },
    }));
  }, [captionSettings.brandThemeId, visualScenes]);

  const applyApiProject = useCallback((
    apiProject: {
      id: string;
      videoUrl: string;
      duration: number;
      status: "processing" | "transcribing" | "ready" | "rendering" | "completed" | "failed";
      captions?: Array<{
        text: string;
        start: number;
        end: number;
        confidence?: number;
        script?: CaptionScript;
        highlightWords?: string[];
        positionX?: number;
        positionY?: number;
      }>;
      visualScenes?: ScriptVisualScene[];
    },
    styleFallback: string,
  ) => {
    const currentStyle = useEditorStore.getState().project?.style ?? styleFallback;
    setProject({
      id: apiProject.id,
      videoUrl: apiProject.videoUrl,
      duration: apiProject.duration,
      status: apiProject.status,
      transcription: normalizeTimelineCaptions(
        (apiProject.captions ?? []).map((caption) => ({
          word: caption.text,
          start: caption.start,
          end: caption.end,
          confidence: caption.confidence,
          script: caption.script,
          highlightWords: caption.highlightWords,
          positionX: caption.positionX,
          positionY: caption.positionY,
        })),
      ),
      style: currentStyle,
      visualScenes: apiProject.visualScenes,
    });
  }, [setProject]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get("id");
      if (projectId) {
        fetch(`/api/projects/${projectId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.project) {
              const requestedTheme = params.get("theme");
              if (requestedTheme) {
                const theme = getBrandTheme(requestedTheme);
                updateCaptionSettings({
                  brandThemeId: theme.id,
                  emphasisColor: theme.accent,
                  activeWordColor: theme.accent,
                  textColor: theme.text,
                  fontFamily: theme.fontFamily,
                });
              }
              applyApiProject(data.project, "hormozi");
            }
          })
          .catch((err) => console.error("Failed to load project from URL ID:", err));
      }
    }
  }, [applyApiProject, updateCaptionSettings]);

  const persistCaptionChanges = useCallback(async (nextCaptions: TimelineCaption[], silent = false) => {
    if (!project) return;

    setIsSavingCaptions(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captions: nextCaptions.map((caption) => ({
            text: caption.word,
            start: Number(caption.start.toFixed(2)),
            end: Number(caption.end.toFixed(2)),
            confidence: caption.confidence,
            script: caption.script,
            highlightWords: caption.highlightWords,
            positionX: caption.positionX,
            positionY: caption.positionY,
          })),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error ?? "Failed to save captions");
      }

      applyApiProject(data.project, selectedStyle);
      if (!silent) {
        toast.success("Caption timeline updated");
      }
    } catch {
      toast.error("Failed to save caption edits");
    } finally {
      setIsSavingCaptions(false);
    }
  }, [applyApiProject, project, selectedStyle]);

  const cloneCaptions = useCallback((captions: TimelineCaption[]): TimelineCaption[] => captions.map((caption) => ({ ...caption })), []);

  const pushUndoSnapshot = useCallback((snapshot?: TimelineCaption[]) => {
    const base = snapshot ?? useEditorStore.getState().project?.transcription;
    if (!base?.length) return;

    undoHistoryRef.current.push(cloneCaptions(base));
    if (undoHistoryRef.current.length > MAX_HISTORY_ENTRIES) {
      undoHistoryRef.current.shift();
    }
    redoHistoryRef.current = [];
  }, [cloneCaptions]);

  const applyLocalCaptionUpdate = useCallback((nextCaptions: TimelineCaption[], persist = true, silent = true) => {
    const normalized = normalizeTimelineCaptions(nextCaptions);
    setTranscription(normalized);

    if (persist) {
      void persistCaptionChanges(normalized, silent);
    }

    return normalized;
  }, [persistCaptionChanges, setTranscription]);

  const resolveTargetCaptionIndex = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    const captions = activeProject?.transcription ?? [];
    if (!captions.length) return null;

    if (selectedCaptionIndex !== null && captions[selectedCaptionIndex]) {
      return selectedCaptionIndex;
    }

    const active = captions.findIndex(
      (caption) =>
        currentTime + CAPTION_SYNC_TOLERANCE >= caption.start && currentTime - CAPTION_SYNC_TOLERANCE <= caption.end,
    );
    return active >= 0 ? active : 0;
  }, [currentTime, selectedCaptionIndex]);

  const undoTimelineChange = useCallback(() => {
    const previous = undoHistoryRef.current.pop();
    const activeProject = useEditorStore.getState().project;
    if (!previous || !activeProject) return;

    redoHistoryRef.current.push(cloneCaptions(activeProject.transcription));
    setTranscription(cloneCaptions(previous));
    void persistCaptionChanges(previous, true);
    setSelectedCaptionIndex((value) => (value === null ? null : Math.min(value, Math.max(0, previous.length - 1))));
  }, [cloneCaptions, persistCaptionChanges, setTranscription]);

  const redoTimelineChange = useCallback(() => {
    const next = redoHistoryRef.current.pop();
    const activeProject = useEditorStore.getState().project;
    if (!next || !activeProject) return;

    undoHistoryRef.current.push(cloneCaptions(activeProject.transcription));
    setTranscription(cloneCaptions(next));
    void persistCaptionChanges(next, true);
    setSelectedCaptionIndex((value) => (value === null ? null : Math.min(value, Math.max(0, next.length - 1))));
  }, [cloneCaptions, persistCaptionChanges, setTranscription]);

  const splitSelectedCaption = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    if (!activeProject) return;

    const index = resolveTargetCaptionIndex();
    if (index === null) return;

    const target = activeProject.transcription[index];
    if (!target) return;

    const words = target.word.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      toast.message("Split needs at least two words");
      return;
    }

    const splitAt = clamp(currentTime, target.start + 0.05, target.end - 0.05);
    if (splitAt <= target.start + 0.04 || splitAt >= target.end - 0.04) {
      toast.message("Move playhead inside the caption to split");
      return;
    }

    const ratio = (splitAt - target.start) / Math.max(0.05, target.end - target.start);
    const midpoint = Math.max(1, Math.min(words.length - 1, Math.round(words.length * ratio)));

    const first: TimelineCaption = {
      ...target,
      word: words.slice(0, midpoint).join(" "),
      end: Number(splitAt.toFixed(2)),
    };
    const second: TimelineCaption = {
      ...target,
      word: words.slice(midpoint).join(" "),
      start: Number(splitAt.toFixed(2)),
    };

    const updated = cloneCaptions(activeProject.transcription);
    updated.splice(index, 1, first, second);
    pushUndoSnapshot(activeProject.transcription);
    applyLocalCaptionUpdate(updated, true, true);
    setSelectedCaptionIndex(index + 1);
    toast.success("Caption split");
  }, [applyLocalCaptionUpdate, cloneCaptions, currentTime, pushUndoSnapshot, resolveTargetCaptionIndex]);

  const mergeWithNextCaption = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    if (!activeProject) return;

    const index = resolveTargetCaptionIndex();
    if (index === null) return;

    const current = activeProject.transcription[index];
    const next = activeProject.transcription[index + 1];
    if (!current || !next) {
      toast.message("Select a caption that has a next segment");
      return;
    }

    const leftConfidence = Number.isFinite(current.confidence) ? (current.confidence as number) : undefined;
    const rightConfidence = Number.isFinite(next.confidence) ? (next.confidence as number) : undefined;
    const mergedConfidence =
      leftConfidence !== undefined && rightConfidence !== undefined
        ? Number(((leftConfidence + rightConfidence) / 2).toFixed(3))
        : leftConfidence ?? rightConfidence;

    const merged: TimelineCaption = {
      ...current,
      word: `${current.word} ${next.word}`.trim(),
      end: next.end,
      confidence: mergedConfidence,
      script: current.script ?? next.script,
    };

    const updated = cloneCaptions(activeProject.transcription);
    updated.splice(index, 2, merged);
    pushUndoSnapshot(activeProject.transcription);
    applyLocalCaptionUpdate(updated, true, true);
    setSelectedCaptionIndex(index);
    toast.success("Segments merged");
  }, [applyLocalCaptionUpdate, cloneCaptions, pushUndoSnapshot, resolveTargetCaptionIndex]);

  const addCaptionAfterSelection = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    if (!activeProject) return;

    const index = resolveTargetCaptionIndex();
    if (index === null) return;

    const current = activeProject.transcription[index];
    const next = activeProject.transcription[index + 1];
    if (!current) return;

    const startCandidate = current.end + 0.05;
    const maxEnd = next ? next.start - 0.01 : activeProject.duration;
    const start = Math.min(startCandidate, Math.max(0, maxEnd - 0.4));
    const end = Math.min(activeProject.duration, Math.max(start + 0.35, Math.min(maxEnd, start + 1.2)));

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error("Not enough room to add a caption here");
      return;
    }

    const inserted: TimelineCaption = {
      word: "New caption",
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      confidence: 0.88,
      script: current.script ?? captionSettings.defaultScript,
    };

    const updated = cloneCaptions(activeProject.transcription);
    updated.splice(index + 1, 0, inserted);
    pushUndoSnapshot(activeProject.transcription);
    applyLocalCaptionUpdate(updated, true, true);
    setSelectedCaptionIndex(index + 1);
    toast.success("Caption added");
  }, [applyLocalCaptionUpdate, captionSettings.defaultScript, cloneCaptions, pushUndoSnapshot, resolveTargetCaptionIndex]);

  const deleteSelectedCaption = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    if (!activeProject?.transcription.length) return;

    const index = resolveTargetCaptionIndex();
    if (index === null) return;

    const updated = cloneCaptions(activeProject.transcription);
    updated.splice(index, 1);

    if (!updated.length) {
      toast.error("Cannot delete the last caption segment");
      return;
    }

    pushUndoSnapshot(activeProject.transcription);
    applyLocalCaptionUpdate(updated, true, true);
    setSelectedCaptionIndex(Math.max(0, index - 1));
    toast.success("Caption deleted");
  }, [applyLocalCaptionUpdate, cloneCaptions, pushUndoSnapshot, resolveTargetCaptionIndex]);

  const toggleSelectedScript = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    if (!activeProject?.transcription.length) return;

    const index = resolveTargetCaptionIndex();
    if (index === null) return;

    const updated = cloneCaptions(activeProject.transcription);
    const current = updated[index];
    if (!current) return;

    const currentScript = current.script ?? captionSettings.defaultScript;
    updated[index] = {
      ...current,
      script: currentScript === "roman" ? "devanagari" : "roman",
    };

    pushUndoSnapshot(activeProject.transcription);
    applyLocalCaptionUpdate(updated, true, true);
    toast.success(`Script switched to ${updated[index].script}`);
  }, [applyLocalCaptionUpdate, captionSettings.defaultScript, cloneCaptions, pushUndoSnapshot, resolveTargetCaptionIndex]);

  const shiftAllCaptions = useCallback(() => {
    const activeProject = useEditorStore.getState().project;
    if (!activeProject?.transcription.length) return;

    if (Math.abs(globalOffsetSeconds) < 0.001) {
      toast.message("Set a timing offset first");
      return;
    }

    const shifted = cloneCaptions(activeProject.transcription)
      .map((caption) => {
        const start = Math.max(0, Math.min(activeProject.duration - 0.05, caption.start + globalOffsetSeconds));
        const end = Math.max(start + 0.05, Math.min(activeProject.duration, caption.end + globalOffsetSeconds));
        return {
          ...caption,
          start: Number(start.toFixed(2)),
          end: Number(end.toFixed(2)),
        };
      })
      .sort((a, b) => a.start - b.start);

    pushUndoSnapshot(activeProject.transcription);
    applyLocalCaptionUpdate(shifted, true, true);
    toast.success(`Shifted all captions by ${globalOffsetSeconds.toFixed(2)}s`);
  }, [applyLocalCaptionUpdate, cloneCaptions, globalOffsetSeconds, pushUndoSnapshot]);

  const handleSubtitleExport = useCallback(async () => {
    if (!project) {
      toast.error("Upload a video before exporting subtitles");
      return;
    }

    setIsSubtitleExporting(true);
    try {
      const params = new URLSearchParams({
        format: subtitleFormat,
        language: captionSettings.language,
        script: captionSettings.defaultScript,
      });

      const response = await fetch(`/api/projects/${project.id}?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Subtitle export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `captionai-${project.id}.${subtitleFormat}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(`${subtitleFormat.toUpperCase()} downloaded`);
    } catch {
      toast.error(`Failed to export ${subtitleFormat.toUpperCase()}`);
    } finally {
      setIsSubtitleExporting(false);
    }
  }, [captionSettings.defaultScript, captionSettings.language, project, subtitleFormat]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoSrc) return;

    if (isPlaying) {
      void video.play().catch(() => {
        setIsPlaying(false);
      });
      return;
    }

    video.pause();
  }, [activeVideoSrc, isPlaying, setIsPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const drift = Math.abs(video.currentTime - currentTime);
    if (drift > 0.3) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    let rafId = 0;
    const tick = () => {
      const time = video.currentTime;
      const storeTime = useEditorStore.getState().currentTime;
      if (Math.abs(time - storeTime) > 0.01) {
        setCurrentTime(time);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isPlaying, setCurrentTime]);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    if (!dragState) return;

    const onMouseMove = (event: MouseEvent) => {
      const activeProject = useEditorStore.getState().project;
      if (!activeProject) return;

      const track = timelineTrackRef.current;
      if (!track || track.clientWidth <= 0 || !activeProject.duration) return;

      const captions = activeProject.transcription;
      const target = captions[dragState.index];
      if (!target) return;

      const deltaSeconds = ((event.clientX - dragState.originX) / track.clientWidth) * activeProject.duration;
      const prevEnd = captions[dragState.index - 1]?.end ?? 0;
      const nextStart = captions[dragState.index + 1]?.start ?? activeProject.duration;
      const minLength = 0.08;

      let start = dragState.originStart;
      let end = dragState.originEnd;

      if (dragState.mode === "move") {
        const clipLength = dragState.originEnd - dragState.originStart;
        const minStart = Math.max(0, prevEnd + 0.01);
        const maxStart = Math.min(activeProject.duration - clipLength, nextStart - clipLength - 0.01);
        const boundedMax = Math.max(minStart, maxStart);
        start = Math.min(Math.max(dragState.originStart + deltaSeconds, minStart), boundedMax);
        end = start + clipLength;
      } else if (dragState.mode === "resize-start") {
        const minStart = Math.max(0, prevEnd + 0.01);
        const maxStart = dragState.originEnd - minLength;
        start = Math.min(Math.max(dragState.originStart + deltaSeconds, minStart), maxStart);
      } else {
        const minEnd = dragState.originStart + minLength;
        const maxEnd = Math.min(activeProject.duration, nextStart - 0.01);
        const boundedMax = Math.max(minEnd, maxEnd);
        end = Math.min(Math.max(dragState.originEnd + deltaSeconds, minEnd), boundedMax);
      }

      const updated = [...captions];
      updated[dragState.index] = {
        ...target,
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
      };
      setTranscription(updated);
    };

    const onMouseUp = () => {
      const latest = useEditorStore.getState().project?.transcription;
      if (latest?.length) {
        void persistCaptionChanges(latest, true);
      }
      setDragState(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState, persistCaptionChanges, setTranscription]);

  useEffect(() => {
    if (!previewInteraction) return;

    const onMouseMove = (event: MouseEvent) => {
      const frame = previewFrameRef.current;
      if (!frame) return;

      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const deltaX = event.clientX - previewInteraction.originClientX;
      const deltaY = event.clientY - previewInteraction.originClientY;

      if (previewInteraction.mode === "move") {
        const nextX = Number(clamp(previewInteraction.originX + deltaX / rect.width, 0.05, 0.95).toFixed(3));
        const nextY = Number(clamp(previewInteraction.originY + deltaY / rect.height, 0.05, 0.95).toFixed(3));
        const activeProject = useEditorStore.getState().project;
        if (activeProject?.transcription.length) {
          const updated = cloneCaptions(activeProject.transcription).map((caption) => ({
            ...caption,
            positionX: nextX,
            positionY: nextY,
          }));
          setTranscription(updated);
        }
        updateCaptionSettings({
          positionX: nextX,
          positionY: nextY,
        });
        return;
      }

      const deltaScale = (deltaX / rect.width) * 1.2 - (deltaY / rect.height) * 1.4;
      const nextScale = clamp(previewInteraction.originScale + deltaScale, 0.1, 2.4);
      updateCaptionSettings({ fontScale: Number(nextScale.toFixed(2)) });
    };

    const onMouseUp = () => {
      const latest = useEditorStore.getState().project?.transcription;
      if (latest?.length) {
        void persistCaptionChanges(latest, true);
      }
      setPreviewInteraction(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [cloneCaptions, currentTime, persistCaptionChanges, previewInteraction, setTranscription, updateCaptionSettings]);

  const handleUpload = async (file: File) => {
    setUploadProgress(8);
    setIsUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });

    try {
      const duration = await getVideoDuration(file);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error ?? "Upload failed");
      }
      setUploadProgress(55);

      const projectResponse = await fetch("/api/projects", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          videoUrl: uploadData.publicUrl,
          duration,
          captions: suppliedCaptions,
          brandThemeId: captionSettings.brandThemeId,
        }),
      });

      const projectData = await projectResponse.json();
      if (!projectData.success) {
        throw new Error(projectData.error ?? "Project creation failed");
      }

      setProject({
        id: projectData.project.id,
        videoUrl: projectData.project.videoUrl,
        duration: projectData.project.duration,
        status: projectData.project.status ?? "processing",
        transcription: [],
        style: selectedStyle,
      });
      setUploadProgress(75);

      const poll = async (attempt = 0): Promise<void> => {
        if (unmountedRef.current) return;
        if (attempt > 120) {
          toast.error("Caption generation timed out. Please try again.");
          return;
        }
        const res = await fetch(`/api/projects/${projectData.project.id}`);
        const data = await res.json();
        if (!data.success || unmountedRef.current) return;

        applyApiProject(data.project, selectedStyle);

        if (data.project.status !== "ready" && data.project.status !== "completed") {
          if (data.project.status === "failed") {
            toast.error(data.project.error || "Caption generation failed");
            return;
          }
          setUploadProgress(Math.min(95, 75 + attempt));
          window.setTimeout(() => {
            void poll(attempt + 1);
          }, 700);
          return;
        }

        setUploadProgress(100);
        toast.success(suppliedCaptions.length ? "Video and supplied captions are ready" : "Video uploaded and captions generated");
        setCurrentTime(0);
        setIsPlaying(false);
      };

      await poll();
    } catch {
      toast.error("Failed to upload video locally");
      setUploadProgress(0);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubtitleFile = async (file: File) => {
    try {
      const parsed = parseSubtitleText(await file.text());
      if (!parsed.length) throw new Error("No timed captions found");
      setSuppliedCaptions(parsed);
      setSuppliedCaptionName(file.name);
      toast.success(`${parsed.length} caption cues loaded`);
    } catch (error) {
      setSuppliedCaptions([]);
      setSuppliedCaptionName("");
      toast.error(error instanceof Error ? error.message : "Could not read captions");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "video/*": [] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        void handleUpload(acceptedFiles[0]);
      }
    },
  });

  const handleAiEdit = async () => {
    if (!prompt) return;
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai-edit", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          prompt,
          currentStyle: selectedStyle,
          currentLanguage: captionSettings.language,
          currentAnimation: captionSettings.animation,
        }),
      });
      const data = await res.json();

      if (data.success && data.editCommand) {
        const params = data.editCommand.params ?? {};
        if (params.style) setSelectedStyle(params.style);

        const nextLanguage =
          params.language === "english" || params.language === "hinglish" || params.language === "hindi"
            ? params.language
            : captionSettings.language;
        const nextAnimation =
          params.animation && ANIMATIONS.includes(params.animation as CaptionAnimation)
            ? (params.animation as CaptionAnimation)
            : captionSettings.animation;
        const nextCapitalization =
          params.capitalization === "normal" || params.capitalization === "uppercase" || params.capitalization === "title"
            ? (params.capitalization as CaptionCapitalization)
            : captionSettings.capitalization;
        const speed = Number(params.animationSpeed);

        updateCaptionSettings({
          animation: nextAnimation,
          effectPreset:
            params.effectPreset && EFFECTS.includes(params.effectPreset as CaptionEffect)
              ? (params.effectPreset as CaptionEffect)
              : captionSettings.effectPreset,
          videoEffect:
            params.videoEffect && VIDEO_EFFECTS.includes(params.videoEffect as VideoEffect)
              ? (params.videoEffect as VideoEffect)
              : captionSettings.videoEffect,
          motionPreset:
            params.motionPreset && MOTION_PRESETS.includes(params.motionPreset as MotionPreset)
              ? (params.motionPreset as MotionPreset)
              : captionSettings.motionPreset,
          textColor: params.textColor ?? params.color ?? captionSettings.textColor,
          activeWordColor: params.activeWordColor ?? captionSettings.activeWordColor,
          emphasisColor: params.activeWordColor ?? params.emphasisColor ?? captionSettings.emphasisColor,
          capitalization: nextCapitalization,
          animationSpeed: Number.isFinite(speed) ? clamp(speed, 0.6, 2.2) : captionSettings.animationSpeed,
          effectIntensity: Number.isFinite(Number(params.effectIntensity))
            ? clamp(Number(params.effectIntensity), 0, 1)
            : captionSettings.effectIntensity,
          highlightEnabled:
            typeof params.highlightEnabled === "boolean" ? params.highlightEnabled : captionSettings.highlightEnabled,
          language: nextLanguage,
        });
        setCaptionLanguage(nextLanguage);
        toast.success(`AI Applied: ${data.editCommand.action}`);
      } else {
        toast.error("AI edit could not be applied");
      }
    } catch {
      toast.error("AI edit failed");
    } finally {
      setIsAiLoading(false);
      setPrompt("");
    }
  };

  const applyLook = useCallback((look: (typeof CAPCUT_LOOKS)[number]) => {
    if (look.settings.style) {
      setSelectedStyle(look.settings.style);
    }

    updateCaptionSettings({
      ...look.settings,
      positionX: look.settings.positionX ?? captionSettings.positionX,
      positionY:
        look.settings.positionY ??
        (look.settings.layout ? layoutToPositionY(look.settings.layout) : captionSettings.positionY),
    });

    toast.success(`${look.name} applied`);
  }, [captionSettings.positionX, captionSettings.positionY, setSelectedStyle, updateCaptionSettings]);

  const applyInstantPolish = useCallback(() => {
    const look = CAPCUT_LOOKS[0];
    applyLook(look);
    updateCaptionSettings({
      language: captionSettings.language,
      animationSpeed: 1.18,
      maxLines: 2,
      activeWordBackgroundOpacity: 0.76,
    });
    toast.success("Auto polish applied");
  }, [applyLook, captionSettings.language, updateCaptionSettings]);

  const updateSelectedCaption = useCallback(
    (updater: (caption: TimelineCaption) => TimelineCaption, persist = true) => {
      const activeProject = useEditorStore.getState().project;
      const index = resolveTargetCaptionIndex();
      if (!activeProject || index === null || !activeProject.transcription[index]) return;

      const updated = cloneCaptions(activeProject.transcription);
      updated[index] = updater(updated[index]);
      if (persist) {
        pushUndoSnapshot(activeProject.transcription);
      }
      applyLocalCaptionUpdate(updated, persist, true);
      setSelectedCaptionIndex(index);
    },
    [applyLocalCaptionUpdate, cloneCaptions, pushUndoSnapshot, resolveTargetCaptionIndex],
  );

  const handleExport = async () => {
    if (!project) {
      toast.error("Upload a video before exporting");
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          style: selectedStyle,
          quality: exportQuality,
          settings: captionSettings,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error ?? "Failed to queue render");

      const pollRender = async (attempt = 0): Promise<void> => {
        if (unmountedRef.current) return;
        if (attempt > 100) {
          toast.message("Export is still processing in background");
          return;
        }

        const res = await fetch(`/api/projects/${project.id}`);
        const result = await res.json();
        if (!result.success || unmountedRef.current) return;

        if (result.project.status === "completed") {
          setLocalPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          applyApiProject(result.project, selectedStyle);
          if (result.project.videoUrl) {
            setRenderedVideoUrl(result.project.videoUrl);
          }
          toast.success(`${exportQuality.toUpperCase()} export complete: ${result.project.videoUrl}`);
          return;
        }

        if (result.project.status === "failed") {
          toast.error("Render failed");
          return;
        }

        window.setTimeout(() => {
          void pollRender(attempt + 1);
        }, 900);
      };

      void pollRender();
      toast.success(`Export queued in ${exportQuality.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleHyperframesCompile = async () => {
    if (!project) {
      toast.error("Upload a video before generating Hyperframes");
      return;
    }

    setIsCompilingHyperframes(true);
    try {
      const response = await fetch("/api/render/hyperframes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          quality: exportQuality,
          settings: captionSettings,
          fps: 30,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error ?? "Hyperframes compile failed");

      setCompositionUrl(data.compositionUrl);
      setEngineMode("hyperframes");
      toast.success(`HyperFrames render complete: ${data.videoUrl}`);
    } catch {
      toast.error("Failed to generate Hyperframes composition");
    } finally {
      setIsCompilingHyperframes(false);
    }
  };

  const handleRemotionRender = async () => {
    if (!project) {
      toast.error("Upload or create a video before rendering with Remotion");
      return;
    }

    setIsRenderingRemotion(true);
    try {
      const response = await fetch("/api/render/remotion", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          projectId: project.id,
          quality: exportQuality,
          settings: captionSettings,
          fps: 30,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error ?? "Remotion render failed");

      if (data.videoUrl) {
        setRenderedVideoUrl(data.videoUrl);
      }
      toast.success(`Remotion render complete: ${data.videoUrl}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to render Remotion composition");
    } finally {
      setIsRenderingRemotion(false);
    }
  };

  const localProjectForPlan = useMemo(() => {
    if (!project) return null;
    return {
      id: project.id,
      videoUrl: project.videoUrl ?? "",
      sourceVideoUrl: project.videoUrl ?? "",
      duration: project.duration,
      status: (project.status ?? "ready") as any,
      createdAt: new Date().toISOString(),
      captions: (project.transcription ?? []).map((c, i) => ({
        id: `cap-${i}`,
        projectId: project.id,
        start: c.start,
        end: c.end,
        text: c.word,
        confidence: c.confidence,
        script: c.script,
        highlightWords: c.highlightWords,
      })),
      visualScenes: themedVisualScenes,
    };
  }, [project, themedVisualScenes]);

  const activeEditPlan = useMemo(() => {
    if (!localProjectForPlan) return null;
    return createEditPlanFromProject({
      project: localProjectForPlan,
      settings: captionSettings,
      quality: exportQuality,
      fps: 30,
      width: 1080,
      height: 1920,
    });
  }, [localProjectForPlan, captionSettings, exportQuality]);

  const localizedTimelineCaptions = useMemo(
    () =>
      (project?.transcription ?? []).map((caption) => ({
        ...caption,
        word: caption.word
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => renderCaptionWord(localizeWord(token, captionSettings.language), captionSettings.language, caption.script, captionSettings.defaultScript))
          .join(" "),
      })),
    [project?.transcription, captionSettings.defaultScript, captionSettings.language],
  );

  const shouldShowSamplePreview = useMemo(() => {
    if (!project) return false;
    if (!localizedTimelineCaptions.length) return true;
    return project.status === "processing" || project.status === "transcribing";
  }, [localizedTimelineCaptions.length, project]);

  const previewTimelineCaptions = useMemo(() => {
    if (!shouldShowSamplePreview) return localizedTimelineCaptions;

    const sampleText = LANGUAGE_SAMPLE_TEXT[captionSettings.language].join(" ");
    const sampleEnd = Math.max(project?.duration ?? 8, 8);
    return [{ word: sampleText, start: 0, end: sampleEnd, script: captionSettings.defaultScript, confidence: 1 }];
  }, [captionSettings.defaultScript, captionSettings.language, localizedTimelineCaptions, project?.duration, shouldShowSamplePreview]);

  const scriptVisualScenes = useMemo(
    () =>
      themedVisualScenes?.length
        ? themedVisualScenes
        : createScriptVisualScenes(
        (project?.transcription ?? []).map((caption) => ({
          text: caption.word,
          start: caption.start,
          end: caption.end,
        })),
        project?.duration ?? 0,
        captionSettings.brandThemeId,
      ),
    [captionSettings.brandThemeId, project?.duration, project?.transcription, themedVisualScenes],
  );

  const activeScriptVisualScene = useMemo(() => {
    if (!scriptVisualScenes.length) return null;

    return (
      scriptVisualScenes.find((scene) => currentTime >= scene.start && currentTime <= scene.end) ??
      scriptVisualScenes.find((scene) => currentTime < scene.start) ??
      scriptVisualScenes[scriptVisualScenes.length - 1]
    );
  }, [currentTime, scriptVisualScenes]);

  const visibleCaptions = useMemo(() => {
    if (!project) return previewTimelineCaptions;
    return previewTimelineCaptions.filter(
      (caption) =>
        shouldShowSamplePreview ||
        (currentTime + CAPTION_SYNC_TOLERANCE >= caption.start &&
          currentTime - CAPTION_SYNC_TOLERANCE <= caption.end),
    );
  }, [currentTime, previewTimelineCaptions, project, shouldShowSamplePreview]);

  const activeCaption = visibleCaptions[0] ?? null;
  const activeCaptionProgress = useMemo(() => {
    if (!activeCaption) return 0;
    const duration = Math.max(0.05, activeCaption.end - activeCaption.start);
    return Math.min(1, Math.max(0, (currentTime - activeCaption.start) / duration));
  }, [activeCaption, currentTime]);

  const maxWordsPerLine = captionSettings.maxWordsPerLine;
  const maxLines = captionSettings.maxLines;
  const maxVisibleWords = maxWordsPerLine * maxLines;

  const displayTokens = useMemo(() => {
    const tokens: PreviewCaptionToken[] = [];

    for (const caption of visibleCaptions) {
      const active =
        shouldShowSamplePreview ||
        (currentTime + CAPTION_SYNC_TOLERANCE >= caption.start && currentTime - CAPTION_SYNC_TOLERANCE <= caption.end);
      const lowConfidence = Number.isFinite(caption.confidence)
        ? Number(caption.confidence) < LOW_CONFIDENCE_THRESHOLD
        : false;
      const words = caption.word.split(/\s+/).filter(Boolean);
      const highlightSet = new Set((caption.highlightWords ?? []).map((word) => normalizeKeyword(word)).filter(Boolean));
      if (!words.length) continue;
      const duration = Math.max(0.05, caption.end - caption.start);
      const elapsed = clamp(currentTime - caption.start, 0, duration);
      const progress = active || shouldShowSamplePreview ? clamp(elapsed / duration, 0, 1) : 0;
      const activeWordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
      const windowStart =
        words.length > maxVisibleWords
          ? Math.min(
              Math.max(0, words.length - maxVisibleWords),
              Math.max(0, activeWordIndex - Math.floor(maxVisibleWords / 2)),
            )
          : 0;
      const visibleWords = words.slice(windowStart, windowStart + maxVisibleWords);

      if ((captionSettings.animation === "karaoke" || captionSettings.animation === "word-pop") && active && !shouldShowSamplePreview) {
        visibleWords.forEach((word, index) => {
          const originalIndex = windowStart + index;
          const isActiveWord = originalIndex === activeWordIndex;
          const highlighted = highlightSet.has(normalizeKeyword(word));
          tokens.push({
            word,
            active: isActiveWord,
            highlighted,
            lowConfidence,
            pop: (captionSettings.animation === "word-pop" && isActiveWord) || highlighted,
            fadeAlpha: isActiveWord || highlighted ? 1 : 0.68,
          });
        });
        continue;
      }

      if (captionSettings.animation === "typewriter" && active && !shouldShowSamplePreview) {
        const reveal = Math.max(1, Math.ceil(words.length * activeCaptionProgress));
        const revealedWords = words.slice(Math.max(0, reveal - maxVisibleWords), reveal);
        revealedWords.forEach((word) => {
          const highlighted = highlightSet.has(normalizeKeyword(word));
          tokens.push({ word, active: true, highlighted, lowConfidence, pop: highlighted, fadeAlpha: 1 });
        });
        continue;
      }

      visibleWords.forEach((word) => {
        const highlighted = highlightSet.has(normalizeKeyword(word));
        const fadeAlpha = captionSettings.animation === "fade" ? (active ? 1 : 0.45) : 1;
        tokens.push({ word, active, highlighted, lowConfidence, pop: highlighted, fadeAlpha });
      });
    }

    return tokens;
  }, [activeCaptionProgress, captionSettings.animation, currentTime, maxVisibleWords, shouldShowSamplePreview, visibleCaptions]);

  const displayLines = useMemo(() => {
    if (!displayTokens.length) return [];

    const lines: PreviewCaptionToken[][] = [];
    for (let index = 0; index < displayTokens.length; index += maxWordsPerLine) {
      lines.push(displayTokens.slice(index, index + maxWordsPerLine));
    }

    return lines;
  }, [displayTokens, maxWordsPerLine]);

  const effectiveSelectedCaptionIndex =
    selectedCaptionIndex !== null && project?.transcription[selectedCaptionIndex]
      ? selectedCaptionIndex
      : project?.transcription.length
        ? 0
        : null;

  const selectedCaption =
    effectiveSelectedCaptionIndex !== null && project?.transcription[effectiveSelectedCaptionIndex]
      ? project.transcription[effectiveSelectedCaptionIndex]
      : null;
  const currentPositionPercent = project ? Math.min(100, (currentTime / project.duration) * 100) : 0;
  const effectiveCaptionPositionX = captionSettings.positionX;
  const effectiveCaptionPositionY = captionSettings.positionY;
  const positionXPercent = Math.round(clamp(effectiveCaptionPositionX, 0.05, 0.95) * 100);
  const positionYPercent = Math.round(clamp(effectiveCaptionPositionY, 0.05, 0.95) * 100);
  const previewFontScale = clamp(captionSettings.fontScale ?? 1, 0.1, 2.4);
  const previewAnchorY =
    captionSettings.layout === "top" ? "0%" : captionSettings.layout === "center" ? "-50%" : "-100%";

  const styleClass =
    selectedStyle === "classic"
      ? "text-2xl font-semibold"
      : selectedStyle === "bold-white"
        ? "text-5xl font-black uppercase tracking-tight"
        : selectedStyle === "dark-box"
          ? "text-3xl font-bold"
          : selectedStyle === "outline-only"
            ? "text-4xl font-black uppercase"
            : selectedStyle === "minimal"
              ? "text-xl font-medium"
              : selectedStyle === "hormozi"
                ? "text-5xl font-black uppercase"
                : selectedStyle === "karaoke"
                  ? "text-3xl font-bold"
                  : selectedStyle === "karaoke-box"
                    ? "text-3xl font-bold"
                    : selectedStyle === "word-pop"
                      ? "text-4xl font-extrabold"
                      : selectedStyle === "word-fade"
                        ? "text-3xl font-semibold"
                        : selectedStyle === "bounce-pop"
                          ? "text-4xl font-black"
                          : selectedStyle === "typewriter-pro"
                            ? "text-2xl font-semibold"
                            : selectedStyle === "neon-glow"
                              ? "text-3xl font-black"
                              : selectedStyle === "gradient-reveal"
                                ? "text-3xl font-bold"
                                : selectedStyle === "wave"
                                  ? "text-3xl font-bold"
                                  : selectedStyle === "keyword-highlight"
                                    ? "text-3xl font-bold"
                                    : selectedStyle === "speaker-color"
                                      ? "text-3xl font-semibold"
                                      : selectedStyle === "emoji-punch"
                                        ? "text-3xl font-black"
    : selectedStyle === "bold-viral"
      ? "text-4xl font-black uppercase tracking-tight"
      : selectedStyle === "clean-minimal"
        ? "text-2xl font-medium"
        : selectedStyle === "creator-pop"
          ? "text-4xl font-black tracking-tight"
          : selectedStyle === "kinetic-news"
            ? "text-3xl font-semibold uppercase tracking-wide"
            : selectedStyle === "luxury"
              ? "text-3xl italic"
              : selectedStyle === "cinema-wide"
                ? "text-2xl font-semibold uppercase tracking-[0.25em]"
                : selectedStyle === "podcast"
                  ? "text-2xl font-semibold"
                  : selectedStyle === "meme"
                    ? "text-4xl font-black uppercase"
                    : selectedStyle === "gaming-flash"
                      ? "text-3xl font-extrabold"
                      : selectedStyle === "reel-neon"
                        ? "text-3xl font-bold"
                        : selectedStyle === "story-board"
                          ? "text-2xl font-semibold"
                          : selectedStyle === "documentary"
                            ? "text-2xl font-medium"
                            : selectedStyle === "subway-bold"
                              ? "text-3xl font-black uppercase"
                              : "text-4xl font-black uppercase";

  const styleVisual =
    selectedStyle === "bold-viral"
      ? { WebkitTextStroke: "2px black" }
      : selectedStyle === "hormozi"
        ? { letterSpacing: "0.06em" }
        : selectedStyle === "karaoke"
          ? { letterSpacing: "0.02em" }
          : selectedStyle === "karaoke-box"
            ? { letterSpacing: "0.02em" }
      : selectedStyle === "meme"
        ? { WebkitTextStroke: "2px black" }
        : selectedStyle === "subway-bold"
          ? { textShadow: "0 0 0 #000, 0 2px 0 #000, 0 4px 12px rgba(0,0,0,0.65)" }
          : selectedStyle === "reel-neon"
            ? { textShadow: "0 0 8px rgba(45,212,191,0.95), 0 0 22px rgba(45,212,191,0.45)" }
            : selectedStyle === "cinema-wide"
              ? { letterSpacing: "0.18em" }
              : {};

  const textTransformStyle =
    captionSettings.capitalization === "uppercase"
      ? "uppercase"
      : captionSettings.capitalization === "title"
        ? "capitalize"
        : "none";

  const resolvedStroke =
    captionSettings.effectPreset === "outline"
      ? `${Math.max(2, captionSettings.strokeWidth)}px ${captionSettings.strokeColor}`
      : captionSettings.strokeWidth > 0
        ? `${captionSettings.strokeWidth}px ${captionSettings.strokeColor}`
        : "0px transparent";

  const effectVisual =
    captionSettings.effectPreset === "none"
      ? { textShadow: "none" }
      : captionSettings.effectPreset === "outline"
        ? { textShadow: "none" }
        : captionSettings.effectPreset === "glow"
          ? {
              textShadow: `0 0 10px ${toRgba(captionSettings.activeWordColor, 0.9)}, 0 0 28px ${toRgba(captionSettings.activeWordColor, 0.58)}`,
            }
          : {
              textShadow: `0 5px 14px rgba(0,0,0,${Math.max(0.22, captionSettings.shadowStrength)})`,
            };

  const stickerVisual =
    captionSettings.effectPreset === "sticker"
      ? {
          filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.88)) drop-shadow(0 15px 22px rgba(0,0,0,0.5))",
        }
      : {};

  const effectBoxVisual =
    captionSettings.effectPreset === "glass"
      ? {
          backgroundColor: toRgba(captionSettings.backgroundColor, Math.max(0.12, captionSettings.backgroundOpacity)),
          backdropFilter: "blur(4px)",
          border: `1px solid ${toRgba(captionSettings.backgroundColor, Math.max(0.3, captionSettings.backgroundOpacity))}`,
        }
      : captionSettings.backgroundOpacity > 0.01
        ? {
            backgroundColor: toRgba(captionSettings.backgroundColor, captionSettings.backgroundOpacity),
            border: "none",
          }
      : {
            backgroundColor: "transparent",
            border: "none",
          };

  const previewCaptionScale =
    captionSettings.animation === "zoom"
      ? previewFontScale * (1 + Math.max(0, 1 - activeCaptionProgress) * 0.18)
      : captionSettings.animation === "pulse"
        ? previewFontScale * (1 + Math.sin(activeCaptionProgress * Math.PI) * 0.08)
        : previewFontScale;
  const previewCaptionTranslateY =
    captionSettings.animation === "slide-up"
      ? Math.max(0, 1 - activeCaptionProgress) * 28
      : captionSettings.animation === "bounce"
        ? -Math.sin(activeCaptionProgress * Math.PI) * 12
        : 0;
  const previewCaptionTranslateX =
    captionSettings.animation === "shake"
      ? Math.sin(currentTime * 46 * captionSettings.animationSpeed) * 4
      : captionSettings.animation === "flicker"
        ? Math.sin(currentTime * 58 * captionSettings.animationSpeed) > 0.72
          ? 3
          : 0
        : 0;
  const previewCaptionOpacity =
    captionSettings.animation === "flicker"
      ? Math.sin(currentTime * 48 * captionSettings.animationSpeed) > 0.82
        ? 0.32
        : captionSettings.textOpacity
      : captionSettings.textOpacity;

  const videoPreviewFilter =
    captionSettings.videoEffect === "cinematic"
      ? `contrast(${1 + captionSettings.effectIntensity * 0.12}) saturate(${0.94 + captionSettings.effectIntensity * 0.1}) brightness(${1 - captionSettings.effectIntensity * 0.04})`
      : captionSettings.videoEffect === "vibrant"
        ? `contrast(${1 + captionSettings.effectIntensity * 0.1}) saturate(${1 + captionSettings.effectIntensity * 0.42}) brightness(${1 + captionSettings.effectIntensity * 0.02})`
        : captionSettings.videoEffect === "noir"
          ? `grayscale(1) contrast(${1 + captionSettings.effectIntensity * 0.25})`
          : captionSettings.videoEffect === "warm"
            ? `sepia(${captionSettings.effectIntensity * 0.22}) saturate(${1 + captionSettings.effectIntensity * 0.12})`
            : captionSettings.videoEffect === "cool"
              ? `hue-rotate(${captionSettings.effectIntensity * 12}deg) saturate(${1 + captionSettings.effectIntensity * 0.08})`
              : captionSettings.videoEffect === "sharpen"
                ? `contrast(${1 + captionSettings.effectIntensity * 0.12})`
                : captionSettings.videoEffect === "vintage"
                  ? `sepia(${captionSettings.effectIntensity * 0.32}) contrast(${1 + captionSettings.effectIntensity * 0.08}) saturate(${1 - captionSettings.effectIntensity * 0.2})`
                  : "none";
  const videoPreviewScale =
    captionSettings.motionPreset === "punch-in"
      ? 1.04 + activeCaptionProgress * 0.035
      : captionSettings.motionPreset === "none"
        ? 1
        : 1.055;
  const videoPreviewTranslateX =
    captionSettings.motionPreset === "drift"
      ? Math.sin(currentTime * 0.45) * 8
      : captionSettings.motionPreset === "handheld"
        ? Math.sin(currentTime * 9) * 5
        : 0;
  const videoPreviewTranslateY =
    captionSettings.motionPreset === "float"
      ? Math.sin(currentTime * 0.75) * 9
      : captionSettings.motionPreset === "handheld"
        ? Math.cos(currentTime * 8) * 4
        : captionSettings.motionPreset === "drift"
          ? Math.cos(currentTime * 0.38) * 5
          : 0;

  const updateCaptionAtIndex = (
    index: number,
    updater: (caption: TimelineCaption, context: { previous?: TimelineCaption; next?: TimelineCaption }) => TimelineCaption,
  ): TimelineCaption[] | null => {
    if (!project?.transcription[index]) return null;

    const previous = project.transcription[index - 1];
    const next = project.transcription[index + 1];
    const updated = [...project.transcription];
    const nextCaption = updater(updated[index], { previous, next });

    updated[index] = {
      ...nextCaption,
      word: nextCaption.word.trim(),
      start: Number(nextCaption.start.toFixed(2)),
      end: Number(nextCaption.end.toFixed(2)),
      confidence: Number.isFinite(nextCaption.confidence)
        ? Math.min(1, Math.max(0, Number(nextCaption.confidence?.toFixed(3))))
        : undefined,
      script: nextCaption.script === "roman" || nextCaption.script === "devanagari" ? nextCaption.script : undefined,
      highlightWords: Array.isArray(nextCaption.highlightWords)
        ? nextCaption.highlightWords.map((word) => word.trim()).filter(Boolean).slice(0, 8)
        : undefined,
      positionX: Number.isFinite(nextCaption.positionX) ? clamp(Number(nextCaption.positionX), 0.05, 0.95) : undefined,
      positionY: Number.isFinite(nextCaption.positionY) ? clamp(Number(nextCaption.positionY), 0.05, 0.95) : undefined,
    };

    if (!updated[index].word) return null;
    if (updated[index].end <= updated[index].start) return null;

    setTranscription(updated);
    return updated;
  };

  const updateSharedCaptionPosition = (next: Partial<Pick<TimelineCaption, "positionX" | "positionY">>, persist = false) => {
    const positionX = Number.isFinite(next.positionX)
      ? clamp(Number(next.positionX), 0.05, 0.95)
      : clamp(captionSettings.positionX, 0.05, 0.95);
    const positionY = Number.isFinite(next.positionY)
      ? clamp(Number(next.positionY), 0.05, 0.95)
      : clamp(captionSettings.positionY, 0.05, 0.95);

    updateCaptionSettings({ positionX, positionY });

    if (!project?.transcription.length) return;

    const updated = cloneCaptions(project.transcription).map((caption) => ({
      ...caption,
      positionX,
      positionY,
    }));
    setTranscription(updated);

    if (persist) {
      void persistCaptionChanges(updated, true);
    }
  };

  const beginCaptionDrag = (
    event: ReactMouseEvent<HTMLDivElement>,
    index: number,
    mode: "move" | "resize-start" | "resize-end",
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const caption = project?.transcription[index];
    if (!caption) return;

    if (project?.transcription.length) {
      pushUndoSnapshot(project.transcription);
    }

    setSelectedCaptionIndex(index);
    setDragState({
      index,
      mode,
      originX: event.clientX,
      originStart: caption.start,
      originEnd: caption.end,
    });
  };

  const beginPreviewInteraction = (event: ReactMouseEvent<HTMLDivElement>, mode: "move" | "resize") => {
    event.preventDefault();
    event.stopPropagation();

    setPreviewInteraction({
      mode,
      originClientX: event.clientX,
      originClientY: event.clientY,
      originX: clamp(effectiveCaptionPositionX, 0.05, 0.95),
      originY: clamp(effectiveCaptionPositionY, 0.05, 0.95),
      originScale: previewFontScale,
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || target.isContentEditable) {
          return;
        }
      }

      const key = event.key.toLowerCase();
      const isMeta = event.metaKey || event.ctrlKey;

      if (isMeta && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoTimelineChange();
          return;
        }

        undoTimelineChange();
        return;
      }

      if (isMeta && key === "y") {
        event.preventDefault();
        redoTimelineChange();
        return;
      }

      if (!project) return;

      if (key === "k") {
        event.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      if (key === "j") {
        event.preventDefault();
        setCurrentTime(Math.max(0, currentTime - 1));
        return;
      }

      if (key === "l") {
        event.preventDefault();
        setCurrentTime(Math.min(project.duration, currentTime + 1));
        return;
      }

      if (key === "s") {
        event.preventDefault();
        splitSelectedCaption();
        return;
      }

      if (key === "m") {
        event.preventDefault();
        mergeWithNextCaption();
        return;
      }

      if (key === "n") {
        event.preventDefault();
        addCaptionAfterSelection();
        return;
      }

      if (key === "t") {
        event.preventDefault();
        toggleSelectedScript();
        return;
      }

      if (key === "backspace" || key === "delete") {
        event.preventDefault();
        deleteSelectedCaption();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    addCaptionAfterSelection,
    currentTime,
    deleteSelectedCaption,
    isPlaying,
    mergeWithNextCaption,
    project,
    redoTimelineChange,
    setCurrentTime,
    setIsPlaying,
    splitSelectedCaption,
    toggleSelectedScript,
    undoTimelineChange,
  ]);

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-white">
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="font-semibold text-sm text-gray-200">AI Studio</span>

          {/* Engine Selector */}
          <div className="flex rounded-lg border border-white/10 overflow-hidden bg-black/40 p-0.5 ml-2">
            {(["remotion", "hyperframes", "canvas"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setEngineMode(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  engineMode === mode ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {mode === "remotion" ? "Remotion Engine" : mode === "hyperframes" ? "HyperFrames Engine" : "Canvas Player"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BYOB & AI Create */}
          <ByobKeyDialog />
          <AiCreateDialog />

          {/* Qualities */}
          <div className="flex rounded-md border border-white/10 overflow-hidden">
            {QUALITIES.map((quality) => (
              <button
                key={quality}
                onClick={() => setExportQuality(quality)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  exportQuality === quality ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {quality.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Remotion Render */}
          <Button
            variant="outline"
            size="sm"
            className="bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-200 shadow-none gap-1.5"
            onClick={handleRemotionRender}
            disabled={isRenderingRemotion || !project}
          >
            {isRenderingRemotion ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5 text-indigo-400" />}
            Render Remotion
          </Button>

          {/* Hyperframes Render */}
          <Button
            variant="outline"
            size="sm"
            className="bg-emerald-600/20 border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-200 shadow-none gap-1.5"
            onClick={handleHyperframesCompile}
            disabled={isCompilingHyperframes || !project}
          >
            {isCompilingHyperframes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />}
            Render HyperFrames
          </Button>

          <Button
            size="sm"
            className="bg-white text-black hover:bg-white/90 font-medium ml-1"
            onClick={handleExport}
            disabled={isExporting || !project}
          >
            {isExporting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
            Export {exportQuality.toUpperCase()}
          </Button>

          {renderedVideoUrl && (
            <a
              href={renderedVideoUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-green-400" />
              Download MP4
            </a>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 border-r border-white/10 bg-[#0A0A0A] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption Controls</h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-7">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Smart Looks</h3>
                  <BadgeCheck className="h-4 w-4 text-blue-300" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CAPCUT_LOOKS.map((look) => {
                    const isActive =
                      selectedStyle === look.settings.style &&
                      captionSettings.animation === look.settings.animation &&
                      captionSettings.videoEffect === look.settings.videoEffect;

                    return (
                      <button
                        key={look.id}
                        onClick={() => applyLook(look)}
                        className={`min-h-24 rounded-lg border p-3 text-left transition-colors ${
                          isActive
                            ? "border-blue-400 bg-blue-500/15 text-white"
                            : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
                          <Clapperboard className="h-3.5 w-3.5 text-blue-300" />
                          {look.name}
                        </span>
                        <span className="block text-[11px] leading-4 text-gray-400">{look.description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand Theme</h3>
                <div className="grid grid-cols-2 gap-2">
                  {BRAND_THEMES.map((theme) => {
                    const active = captionSettings.brandThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          const selectedTheme = getBrandTheme(theme.id);
                          updateCaptionSettings({
                            brandThemeId: selectedTheme.id,
                            emphasisColor: selectedTheme.accent,
                            activeWordColor: selectedTheme.accent,
                            textColor: selectedTheme.text,
                            fontFamily: selectedTheme.fontFamily,
                          });
                        }}
                        className={`rounded-lg border p-2.5 text-left transition-colors ${
                          active ? "border-blue-400 bg-blue-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <span className="mb-2 flex gap-1.5">
                          {[theme.background, theme.accent, theme.secondary].map((color) => (
                            <span key={color} className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                          ))}
                        </span>
                        <span className="block text-xs font-semibold text-white">{theme.name}</span>
                        <span className="mt-1 block text-[10px] leading-4 text-gray-500">{theme.description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Customize</h3>
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: "top", label: "Top" },
                      { key: "center", label: "Center" },
                      { key: "bottom", label: "Bottom" },
                    ] as const).map((position) => (
                      <button
                        key={position.key}
                        onClick={() => {
                          const positionY = layoutToPositionY(position.key);
                          updateCaptionSettings({ layout: position.key, positionY });
                          updateSharedCaptionPosition({ positionY }, true);
                        }}
                        className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                          captionSettings.layout === position.key
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-white/10 bg-black/20 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {position.label}
                      </button>
                    ))}
                  </div>

                  {project && shouldShowSamplePreview && (
                    <p className="text-[11px] text-blue-300/90">
                      Showing sample text while real subtitles are being generated.
                    </p>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Size</span>
                      <span>{Math.round(previewFontScale * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(previewFontScale * 100)]}
                      min={10}
                      max={240}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ fontScale: readSliderValue(value) / 100 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Words per line</span>
                      <span>{maxWordsPerLine}</span>
                    </div>
                    <Slider
                      value={[maxWordsPerLine]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ maxWordsPerLine: readSliderValue(value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Max lines</span>
                      <span>{maxLines}</span>
                    </div>
                    <Slider
                      value={[maxLines]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ maxLines: readSliderValue(value) })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {ANIMATIONS.map((animation) => (
                      <button
                        key={`quick-${animation}`}
                        onClick={() => updateCaptionSettings({ animation })}
                        className={`rounded-md border px-2 py-1.5 text-xs capitalize ${
                          captionSettings.animation === animation
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-white/10 bg-black/20 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {animation}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {EFFECTS.map((effect) => (
                      <button
                        key={effect}
                        onClick={() => updateCaptionSettings({ effectPreset: effect })}
                        className={`rounded-md border px-2 py-1.5 text-xs capitalize ${
                          captionSettings.effectPreset === effect
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-white/10 bg-black/20 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {effect}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-gray-300">
                    <span>Colors</span>
                    <div className="flex items-center gap-2">
                      <input
                        title="Text color"
                        type="color"
                        value={captionSettings.textColor}
                        onChange={(event) => updateCaptionSettings({ textColor: event.target.value })}
                        className="h-7 w-8 bg-transparent"
                      />
                      <input
                        title="Accent color"
                        type="color"
                        value={captionSettings.emphasisColor}
                        onChange={(event) =>
                          updateCaptionSettings({
                            emphasisColor: event.target.value,
                            activeWordColor: event.target.value,
                          })
                        }
                        className="h-7 w-8 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <Type className="h-3.5 w-3.5 text-blue-300" />
                  Styles and Fonts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedStyle(style.id);
                        updateCaptionSettings({
                          fontFamily: style.fontFamily,
                          layout: style.layout,
                          positionY: layoutToPositionY(style.layout),
                        });
                      }}
                      className={`relative p-3 rounded-xl border text-left transition-all ${
                        selectedStyle === style.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm font-medium block mb-1">{style.name}</span>
                      <span className="text-xs text-gray-500">{style.fontFamily}</span>
                      {selectedStyle === style.id && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-black/25 p-3">
                  <label className="space-y-1 block">
                    <span className="text-[11px] text-gray-400">Font family</span>
                    <select
                      value={captionSettings.fontFamily}
                      onChange={(event) => updateCaptionSettings({ fontFamily: event.target.value })}
                      className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      {FONT_FAMILIES.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Font weight</span>
                      <span>{Math.round(captionSettings.fontWeight)}</span>
                    </div>
                    <Slider
                      value={[captionSettings.fontWeight]}
                      min={300}
                      max={900}
                      step={100}
                      onValueChange={(value) => updateCaptionSettings({ fontWeight: readSliderValue(value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Text opacity</span>
                      <span>{Math.round(captionSettings.textOpacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.textOpacity * 100)]}
                      min={25}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ textOpacity: readSliderValue(value) / 100 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Letter spacing</span>
                      <span>{captionSettings.letterSpacing.toFixed(1)}px</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.letterSpacing * 10)]}
                      min={-20}
                      max={120}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ letterSpacing: readSliderValue(value) / 10 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Line height</span>
                      <span>{captionSettings.lineHeight.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.lineHeight * 100)]}
                      min={80}
                      max={220}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ lineHeight: readSliderValue(value) / 100 })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {CAPITALIZATION_MODES.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateCaptionSettings({ capitalization: mode })}
                        className={`rounded-md border px-2 py-1.5 text-[11px] capitalize transition-colors ${
                          captionSettings.capitalization === mode
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-white/10 bg-black/20 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Position</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {([
                    { key: "top", label: "Top" },
                    { key: "center", label: "Center" },
                    { key: "bottom", label: "Bottom" },
                  ] as const).map((position) => (
                    <button
                      key={position.key}
                      onClick={() => {
                        const positionY = layoutToPositionY(position.key);
                        updateCaptionSettings({ layout: position.key, positionY });
                        updateSharedCaptionPosition({ positionY }, true);
                      }}
                      className={`rounded-md border px-3 py-2 text-xs transition-colors ${
                        captionSettings.layout === position.key
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {position.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Horizontal</span>
                      <span>{positionXPercent}%</span>
                    </div>
                    <Slider
                      value={[positionXPercent]}
                      min={5}
                      max={95}
                      step={1}
                      onValueChange={(value) => updateSharedCaptionPosition({ positionX: readSliderValue(value) / 100 })}
                      onValueCommitted={(value) => updateSharedCaptionPosition({ positionX: readSliderValue(value) / 100 }, true)}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Vertical</span>
                      <span>{positionYPercent}%</span>
                    </div>
                    <Slider
                      value={[positionYPercent]}
                      min={5}
                      max={95}
                      step={1}
                      onValueChange={(value) => updateSharedCaptionPosition({ positionY: readSliderValue(value) / 100 })}
                      onValueCommitted={(value) => updateSharedCaptionPosition({ positionY: readSliderValue(value) / 100 }, true)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Language</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "english", label: "English" },
                    { key: "hinglish", label: "Hinglish" },
                    { key: "hindi", label: "Hindi" },
                  ].map((language) => (
                    <button
                      key={language.key}
                      onClick={() => {
                        setCaptionLanguage(language.key as "english" | "hinglish" | "hindi");
                      }}
                      className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                        captionSettings.language === language.key
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Languages className="h-3.5 w-3.5 inline mr-1" />
                      {language.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  {([
                    { key: "roman", label: "Roman" },
                    { key: "devanagari", label: "Devanagari" },
                  ] as const).map((script) => (
                    <button
                      key={script.key}
                      onClick={() => updateCaptionSettings({ defaultScript: script.key })}
                      className={`rounded-md border px-3 py-2 text-xs transition-colors ${
                        captionSettings.defaultScript === script.key
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {script.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 text-yellow-300" />
                  Animation and Transition
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {ANIMATIONS.map((animation) => (
                    <button
                      key={animation}
                      onClick={() => updateCaptionSettings({ animation })}
                      className={`rounded-md border px-2 py-2 text-xs capitalize transition-colors ${
                        captionSettings.animation === animation
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {animation}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {TRANSITIONS.map((transition) => (
                    <button
                      key={transition}
                      onClick={() => updateCaptionSettings({ transition })}
                      className={`rounded-md border px-3 py-2 text-xs capitalize ${
                        captionSettings.transition === transition
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {transition}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Animation speed</span>
                    <span>{captionSettings.animationSpeed.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[Math.round(captionSettings.animationSpeed * 100)]}
                    min={60}
                    max={220}
                    step={1}
                    onValueChange={(value) => updateCaptionSettings({ animationSpeed: readSliderValue(value) / 100 })}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Video Effects and Motion</h3>
                <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Film className="h-3.5 w-3.5 text-blue-300" />
                      Filter
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {VIDEO_EFFECTS.map((effect) => (
                        <button
                          key={effect}
                          onClick={() => updateCaptionSettings({ videoEffect: effect })}
                          className={`rounded-md border px-2 py-2 text-xs capitalize transition-colors ${
                            captionSettings.videoEffect === effect
                              ? "border-blue-500 bg-blue-500/10 text-blue-300"
                              : "border-white/10 bg-black/20 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {effect.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Move className="h-3.5 w-3.5 text-emerald-300" />
                      Camera Motion
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {MOTION_PRESETS.map((motion) => (
                        <button
                          key={motion}
                          onClick={() => updateCaptionSettings({ motionPreset: motion })}
                          className={`rounded-md border px-2 py-2 text-xs capitalize transition-colors ${
                            captionSettings.motionPreset === motion
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                              : "border-white/10 bg-black/20 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {motion.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Effect intensity</span>
                      <span>{Math.round(captionSettings.effectIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.effectIntensity * 100)]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ effectIntensity: readSliderValue(value) / 100 })}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <Palette className="h-3.5 w-3.5 text-pink-300" />
                  Visual Effects and Colors
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <label>Text color</label>
                    <input
                      type="color"
                      value={captionSettings.textColor}
                      onChange={(event) => updateCaptionSettings({ textColor: event.target.value })}
                      className="w-10 h-8 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <label>Background</label>
                    <input
                      type="color"
                      value={captionSettings.backgroundColor}
                      onChange={(event) => updateCaptionSettings({ backgroundColor: event.target.value })}
                      className="w-10 h-8 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <label>Emphasis</label>
                    <input
                      type="color"
                      value={captionSettings.emphasisColor}
                      onChange={(event) =>
                        updateCaptionSettings({
                          emphasisColor: event.target.value,
                          activeWordColor: event.target.value,
                        })
                      }
                      className="w-10 h-8 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <label>Active word</label>
                    <input
                      type="color"
                      value={captionSettings.activeWordColor}
                      onChange={(event) => updateCaptionSettings({ activeWordColor: event.target.value })}
                      className="w-10 h-8 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <label>Active BG</label>
                    <input
                      type="color"
                      value={captionSettings.activeWordBackground}
                      onChange={(event) => updateCaptionSettings({ activeWordBackground: event.target.value })}
                      className="w-10 h-8 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Background opacity</span>
                      <span>{Math.round(captionSettings.backgroundOpacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.backgroundOpacity * 100)]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ backgroundOpacity: readSliderValue(value) / 100 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Active BG opacity</span>
                      <span>{Math.round(captionSettings.activeWordBackgroundOpacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.activeWordBackgroundOpacity * 100)]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ activeWordBackgroundOpacity: readSliderValue(value) / 100 })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <label>Stroke color</label>
                    <input
                      type="color"
                      value={captionSettings.strokeColor}
                      onChange={(event) => updateCaptionSettings({ strokeColor: event.target.value })}
                      className="w-10 h-8 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Stroke width</span>
                      <span>{captionSettings.strokeWidth.toFixed(1)}px</span>
                    </div>
                    <Slider
                      value={[Math.round(captionSettings.strokeWidth * 10)]}
                      min={0}
                      max={120}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ strokeWidth: readSliderValue(value) / 10 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Shadow strength</span>
                      <span>{captionSettings.shadowStrength.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[captionSettings.shadowStrength * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateCaptionSettings({ shadowStrength: readSliderValue(value) / 100 })}
                    />
                  </div>
                  <button
                    onClick={() => updateCaptionSettings({ highlightEnabled: !captionSettings.highlightEnabled })}
                    className={`w-full rounded-md border px-3 py-2 text-xs transition-colors ${
                      captionSettings.highlightEnabled
                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                    {captionSettings.highlightEnabled ? "Highlight On" : "Highlight Off"}
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Timeline Edit</h3>
                {!project?.transcription.length ? (
                  <p className="text-xs text-gray-500">Generate captions to edit timeline clips.</p>
                ) : selectedCaption && effectiveSelectedCaptionIndex !== null ? (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Clip {effectiveSelectedCaptionIndex + 1}</span>
                      <button
                        onClick={() => setCurrentTime(selectedCaption.start)}
                        className="rounded border border-white/10 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
                      >
                        Jump
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400">
                      <span
                        className={
                          Number.isFinite(selectedCaption.confidence) && Number(selectedCaption.confidence) < LOW_CONFIDENCE_THRESHOLD
                            ? "text-yellow-300"
                            : "text-emerald-300"
                        }
                      >
                        Confidence {Number.isFinite(selectedCaption.confidence) ? `${Math.round(Number(selectedCaption.confidence) * 100)}%` : "N/A"}
                      </span>

                      <div className="flex rounded-md border border-white/10 overflow-hidden">
                        {([
                          { key: "roman", label: "Roman" },
                          { key: "devanagari", label: "Devanagari" },
                        ] as const).map((scriptOption) => {
                          const activeScript = selectedCaption.script ?? captionSettings.defaultScript;
                          return (
                            <button
                              key={scriptOption.key}
                              onClick={() => {
                                const updated =
                                  updateCaptionAtIndex(effectiveSelectedCaptionIndex, (caption) => ({
                                    ...caption,
                                    script: scriptOption.key,
                                  })) ?? null;
                                if (updated) {
                                  void persistCaptionChanges(updated, true);
                                }
                              }}
                              className={`px-2 py-1 text-[10px] transition-colors ${
                                activeScript === scriptOption.key
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-black/30 text-gray-300 hover:bg-white/10"
                              }`}
                            >
                              {scriptOption.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                      <span>Caption Text</span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={effectiveSelectedCaptionIndex <= 0}
                          onClick={() => setSelectedCaptionIndex(effectiveSelectedCaptionIndex - 1)}
                          className="rounded px-1.5 py-0.5 border border-white/10 bg-black/40 text-[10px] hover:bg-white/10 disabled:opacity-30"
                        >
                          ← Prev
                        </button>
                        <span className="text-[10px] text-gray-500">
                          {effectiveSelectedCaptionIndex + 1} / {project.transcription.length}
                        </span>
                        <button
                          disabled={effectiveSelectedCaptionIndex >= project.transcription.length - 1}
                          onClick={() => setSelectedCaptionIndex(effectiveSelectedCaptionIndex + 1)}
                          className="rounded px-1.5 py-0.5 border border-white/10 bg-black/40 text-[10px] hover:bg-white/10 disabled:opacity-30"
                        >
                          Next →
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={selectedCaption.word}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateCaptionAtIndex(effectiveSelectedCaptionIndex, (caption) => ({ ...caption, word: value })) ?? null;
                      }}
                      onBlur={() => {
                        if (project?.transcription.length) {
                          void persistCaptionChanges(project.transcription, true);
                        }
                      }}
                      className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-white resize-none focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Type caption text..."
                    />

                    <label className="block space-y-1 text-xs text-gray-400">
                      <span>Highlight words</span>
                      <input
                        value={(selectedCaption.highlightWords ?? []).join(", ")}
                        placeholder="e.g. ChatGPT, ghatiya, details"
                        onChange={(event) => {
                          const highlightWords = parseHighlightWords(event.target.value);
                          updateCaptionAtIndex(effectiveSelectedCaptionIndex, (caption) => ({ ...caption, highlightWords })) ?? null;
                        }}
                        onBlur={() => {
                          if (project?.transcription.length) {
                            void persistCaptionChanges(project.transcription, true);
                          }
                        }}
                        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </label>

                    <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Caption position</span>
                        <button
                          onClick={() => {
                            updateSharedCaptionPosition(
                              {
                                positionX: captionSettings.positionX,
                                positionY: captionSettings.positionY,
                              },
                              true,
                            );
                          }}
                          className="rounded border border-white/10 px-2 py-1 text-gray-300 hover:bg-white/10"
                        >
                          Apply global
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>X</span>
                          <span>{Math.round(captionSettings.positionX * 100)}%</span>
                        </div>
                        <Slider
                          value={[Math.round(captionSettings.positionX * 100)]}
                          min={5}
                          max={95}
                          step={1}
                          onValueChange={(value) => {
                            const positionX = readSliderValue(value) / 100;
                            updateSharedCaptionPosition({ positionX });
                          }}
                          onValueCommitted={(value) => {
                            updateSharedCaptionPosition({ positionX: readSliderValue(value) / 100 }, true);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>Y</span>
                          <span>{Math.round(captionSettings.positionY * 100)}%</span>
                        </div>
                        <Slider
                          value={[Math.round(captionSettings.positionY * 100)]}
                          min={5}
                          max={95}
                          step={1}
                          onValueChange={(value) => {
                            const positionY = readSliderValue(value) / 100;
                            updateSharedCaptionPosition({ positionY });
                          }}
                          onValueCommitted={(value) => {
                            updateSharedCaptionPosition({ positionY: readSliderValue(value) / 100 }, true);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={splitSelectedCaption}
                        className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-xs text-gray-200 hover:bg-white/10"
                      >
                        Split (S)
                      </button>
                      <button
                        onClick={mergeWithNextCaption}
                        className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-xs text-gray-200 hover:bg-white/10"
                      >
                        Merge (M)
                      </button>
                      <button
                        onClick={addCaptionAfterSelection}
                        className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-xs text-gray-200 hover:bg-white/10"
                      >
                        Add (N)
                      </button>
                      <button
                        onClick={deleteSelectedCaption}
                        className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="space-y-1 text-xs text-gray-400">
                        <span>Start (s)</span>
                        <input
                          type="number"
                          step="0.05"
                          value={selectedCaption.start}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            updateCaptionAtIndex(effectiveSelectedCaptionIndex, (caption, context) => {
                              if (!Number.isFinite(value)) return caption;
                              const minStart = context.previous ? context.previous.end + 0.01 : 0;
                              const maxStart = caption.end - 0.05;
                              return {
                                ...caption,
                                start: Math.min(Math.max(value, minStart), maxStart),
                              };
                            });
                          }}
                          onBlur={() => {
                            if (project?.transcription.length) {
                              void persistCaptionChanges(project.transcription, true);
                            }
                          }}
                          className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs text-gray-400">
                        <span>End (s)</span>
                        <input
                          type="number"
                          step="0.05"
                          value={selectedCaption.end}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            updateCaptionAtIndex(effectiveSelectedCaptionIndex, (caption, context) => {
                              if (!Number.isFinite(value)) return caption;
                              const minEnd = caption.start + 0.05;
                              const maxEnd = context.next ? context.next.start - 0.01 : project?.duration ?? caption.end + 5;
                              return {
                                ...caption,
                                end: Math.max(minEnd, Math.min(value, maxEnd)),
                              };
                            });
                          }}
                          onBlur={() => {
                            if (project?.transcription.length) {
                              void persistCaptionChanges(project.transcription, true);
                            }
                          }}
                          className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                      </label>
                    </div>

                    <Button
                      onClick={() => void persistCaptionChanges(project.transcription)}
                      disabled={isSavingCaptions}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSavingCaptions ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save timeline changes"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Select a caption clip in the timeline below to edit.</p>
                )}

                {project?.transcription.length ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.05"
                        value={globalOffsetSeconds}
                        onChange={(event) => setGlobalOffsetSeconds(Number(event.target.value) || 0)}
                        className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Global timing offset in seconds"
                      />
                      <button
                        onClick={shiftAllCaptions}
                        className="rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-500/20"
                      >
                        Shift
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={undoTimelineChange}
                        className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-[11px] text-gray-200 hover:bg-white/10"
                      >
                        Undo
                      </button>
                      <button
                        onClick={redoTimelineChange}
                        className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-[11px] text-gray-200 hover:bg-white/10"
                      >
                        Redo
                      </button>
                      <button
                        onClick={toggleSelectedScript}
                        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                      >
                        Toggle Script
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prompt AI</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleAiEdit();
                    }
                  }}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. 'Make captions bounce in Hinglish with yellow emphasis'"
                />
                <Button onClick={handleAiEdit} disabled={isAiLoading || !prompt} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply AI Edit"}
                </Button>
              </section>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col relative bg-black">
          {!project && !activeVideoSrc && !compositionUrl && !activeEditPlan && (
            <div
              {...getRootProps()}
              className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-8 transition-colors ${isDragActive ? "bg-blue-900/10" : ""}`}
            >
              <input {...getInputProps()} />
              <div className={`max-w-md w-full glass-panel rounded-2xl p-8 text-center border-white/10 shadow-2xl ${isDragActive ? "border-blue-500 bg-blue-500/10" : "bg-[#111]"}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDragActive ? "bg-blue-500 text-white" : "bg-blue-500/20 text-blue-400"}`}>
                  <Plus className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{isDragActive ? "Drop to Upload" : "Upload Video"}</h3>
                <p className="text-sm text-gray-400 mb-6">Drag and drop your raw footage, then customize captions with effects.</p>
                {uploadProgress > 0 ? (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-500 text-left">Processing {uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button disabled={isUploading} className="w-full h-12 bg-white text-black hover:bg-gray-200">
                      {isUploading ? "Uploading..." : "Select raw footage"}
                    </Button>
                    <label
                      className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-gray-300 hover:bg-white/10"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {suppliedCaptionName || "Optional: attach SRT or VTT"}
                      <input
                        type="file"
                        accept=".srt,.vtt,text/vtt,application/x-subrip"
                        className="sr-only"
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void handleSubtitleFile(file);
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-gray-500">
                      No caption file? The selected AI provider will transcribe automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center p-8">
            <div
              ref={previewFrameRef}
              className="aspect-[9/16] h-full max-h-[70vh] bg-gray-900 rounded-lg overflow-hidden relative shadow-2xl border border-white/10"
            >
              {engineMode === "remotion" && activeEditPlan ? (
                <RemotionPlayerPreview plan={activeEditPlan} />
              ) : engineMode === "hyperframes" && compositionUrl ? (
                <iframe src={compositionUrl} className="w-full h-full border-0 bg-black" title="Hyperframes Preview" />
              ) : engineMode === "hyperframes" && !compositionUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3 px-8 text-center">
                  <ExternalLink className="h-10 w-10 text-emerald-500/50" />
                  <p className="text-sm font-medium text-gray-300">HyperFrames Engine Selected</p>
                  <p className="text-xs text-gray-500">Click &quot;Render HyperFrames&quot; in the toolbar to compile the composition. The preview will appear here once ready.</p>
                </div>
              ) : activeVideoSrc ? (
                <video
                  ref={videoRef}
                  src={activeVideoSrc}
                  className={`absolute inset-x-0 w-full object-cover transition-all duration-300 ${
                    activeScriptVisualScene ? "bottom-0 h-1/2" : "inset-0 h-full"
                  }`}
                  style={{
                    filter: videoPreviewFilter,
                    transform: `translate(${videoPreviewTranslateX.toFixed(1)}px, ${videoPreviewTranslateY.toFixed(1)}px) scale(${videoPreviewScale.toFixed(3)})`,
                  }}
                  playsInline
                  preload="auto"
                  onTimeUpdate={(event) => {
                    if (!project) return;
                    setCurrentTime(event.currentTarget.currentTime);
                  }}
                  onLoadedMetadata={(event) => {
                    const mediaDuration = event.currentTarget.duration;
                    if (!project || !Number.isFinite(mediaDuration)) return;
                    if (Math.abs(mediaDuration - project.duration) > 0.2) {
                      useEditorStore.getState().setProject({
                        ...project,
                        duration: mediaDuration,
                      });
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  <span>No video loaded</span>
                </div>
              )}

              {activeScriptVisualScene ? (
                <div
                  className="absolute inset-x-0 top-0 z-10 flex h-1/2 flex-col justify-between overflow-hidden p-6 text-white"
                  style={{
                    backgroundColor: activeScriptVisualScene.palette.background,
                    backgroundImage: `radial-gradient(ellipse at 80% 0%, ${toRgba(activeScriptVisualScene.palette.accent, 0.18)}, transparent 60%), radial-gradient(ellipse at 10% 100%, ${toRgba(activeScriptVisualScene.palette.secondary, 0.15)}, transparent 50%)`,
                  }}
                >
                  {/* Brand Header */}
                  <div className="flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                      {getBrandTheme(captionSettings.brandThemeId).logoUrl ? (
                        <img
                          src={getBrandTheme(captionSettings.brandThemeId).logoUrl}
                          alt="Brand Logo"
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: activeScriptVisualScene.palette.accent }}
                        />
                      )}
                      <span
                        className="text-xs font-semibold uppercase tracking-wider opacity-80"
                        style={{ color: getBrandTheme(captionSettings.brandThemeId).text }}
                      >
                        {getBrandTheme(captionSettings.brandThemeId).name}
                      </span>
                    </div>

                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{
                        backgroundColor: toRgba(activeScriptVisualScene.palette.accent, 0.18),
                        color: activeScriptVisualScene.palette.accent,
                        border: `1px solid ${toRgba(activeScriptVisualScene.palette.accent, 0.35)}`,
                      }}
                    >
                      {activeScriptVisualScene.motif}
                    </span>
                  </div>

                  {/* Center Card Content */}
                  <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center px-4 py-3">
                    <div
                      className="w-full max-w-xs rounded-2xl p-5 shadow-2xl backdrop-blur-xl border border-white/10"
                      style={{
                        backgroundColor: toRgba(getBrandTheme(captionSettings.brandThemeId).surface, 0.88),
                        boxShadow: `0 20px 40px ${toRgba("#000000", 0.4)}, 0 0 30px ${toRgba(activeScriptVisualScene.palette.accent, 0.12)}`,
                      }}
                    >
                      <h3
                        className="text-xl font-extrabold tracking-tight leading-snug mb-2"
                        style={{ color: getBrandTheme(captionSettings.brandThemeId).text }}
                      >
                        {activeScriptVisualScene.title}
                      </h3>

                      {activeScriptVisualScene.motif === "warning" ? (
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <span className="text-lg">⚠️</span>
                          <span className="text-xs font-semibold">Important Notice</span>
                        </div>
                      ) : activeScriptVisualScene.motif === "money" ? (
                        <div className="mt-3 flex items-center justify-between rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-xs text-emerald-300 font-medium">Revenue Impact</span>
                          <span className="text-base font-extrabold text-emerald-400">+100%</span>
                        </div>
                      ) : activeScriptVisualScene.motif === "growth" ? (
                        <div className="mt-3 flex items-end justify-between gap-1.5 h-12 px-2">
                          {[30, 50, 75, 100].map((height, i) => (
                            <div
                              key={i}
                              className="w-1/4 rounded-t-md transition-all"
                              style={{
                                height: `${height}%`,
                                backgroundColor: i === 3 ? activeScriptVisualScene.palette.accent : toRgba(activeScriptVisualScene.palette.accent, 0.3),
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className="mt-3 h-1 w-16 mx-auto rounded-full"
                          style={{ backgroundColor: activeScriptVisualScene.palette.accent }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              {engineMode === "canvas" && project && displayLines.length > 0 && (
                <div
                  className={`absolute z-20 px-4 text-center select-none ${previewInteraction?.mode === "move" ? "cursor-grabbing" : "cursor-grab"}`}
                  onMouseDown={(event) => beginPreviewInteraction(event, "move")}
                  style={{
                    left: `${positionXPercent}%`,
                    top: `${positionYPercent}%`,
                    transform: `translate(-50%, ${previewAnchorY})`,
                    maxWidth: "96%",
                    width: "min(96%, 760px)",
                  }}
                >
                  <div
                    key={`${selectedStyle}-${captionSettings.animation}-${captionSettings.language}`}
                    className={`relative inline-flex flex-col justify-end rounded-xl px-4 py-2 leading-tight ${styleClass}`}
                    style={{
                      color: captionSettings.textColor,
                      fontFamily: captionSettings.fontFamily,
                      fontWeight: captionSettings.fontWeight,
                      opacity: previewCaptionOpacity,
                      letterSpacing: `${captionSettings.letterSpacing}px`,
                      lineHeight: captionSettings.lineHeight,
                      textTransform: textTransformStyle,
                      WebkitTextStroke: resolvedStroke,
                      transform: `translate(${previewCaptionTranslateX.toFixed(1)}px, ${previewCaptionTranslateY.toFixed(1)}px) scale(${previewCaptionScale.toFixed(2)})`,
                      transformOrigin: "center bottom",
                      ...styleVisual,
                      ...effectVisual,
                      ...stickerVisual,
                      ...effectBoxVisual,
                      minHeight: `${maxLines * 1.25}em`,
                    }}
                  >
                    {displayLines.map((line, lineIndex) => (
                      <div key={`line-${lineIndex}`} className="whitespace-normal break-words">
                        {line.map((token, tokenIndex) => (
                          <span
                            key={`${token.word}-${lineIndex}-${tokenIndex}`}
                            style={{
                              color: token.active
                                ? captionSettings.activeWordColor
                                : token.highlighted
                                  ? captionSettings.emphasisColor
                                : token.lowConfidence
                                  ? "#fbbf24"
                                  : captionSettings.textColor,
                              backgroundColor:
                                (captionSettings.highlightEnabled && token.active) || token.highlighted
                                  ? toRgba(captionSettings.activeWordBackground, captionSettings.activeWordBackgroundOpacity)
                                  : "transparent",
                              padding:
                                (captionSettings.highlightEnabled && token.active) || token.highlighted
                                  ? "0.08em 0.24em"
                                  : "0",
                              borderRadius:
                                (captionSettings.highlightEnabled && token.active) || token.highlighted
                                  ? "0.24em"
                                  : "0",
                              textDecoration: token.lowConfidence && !token.active ? "underline" : "none",
                              textDecorationColor: token.lowConfidence ? "#fbbf24" : "transparent",
                              opacity: token.fadeAlpha,
                              transform:
                                token.pop
                                  ? "scale(1.22)"
                                  : captionSettings.animation === "bounce" && token.active
                                    ? "translateY(-0.18em)"
                                    : "scale(1)",
                              transformOrigin: "center bottom",
                              transition: `transform ${Math.round(140 / Math.max(0.6, captionSettings.animationSpeed))}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 130ms ease`,
                              display: "inline-block",
                            }}
                          >
                            {token.word}{" "}
                          </span>
                        ))}
                      </div>
                    ))}
                    <div
                      className={`absolute -right-2 -bottom-2 h-4 w-4 rounded-full border border-blue-200/80 bg-blue-500/75 ${previewInteraction?.mode === "resize" ? "cursor-nwse-resize" : "cursor-se-resize"}`}
                      onMouseDown={(event) => beginPreviewInteraction(event, "resize")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-16 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-400 hover:text-white"
              onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
            >
              <Rewind className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full h-10 w-10 bg-white text-black hover:bg-gray-200"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!project}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-400 hover:text-white"
              onClick={() => setCurrentTime(Math.min(project?.duration ?? 0, currentTime + 1))}
            >
              <FastForward className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <span className="font-mono text-xs text-gray-400">
              {formatDuration(currentTime)} / {formatDuration(project?.duration ?? 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 border-t border-white/10 bg-[#0A0A0A] flex flex-col">
        <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-white" onClick={splitSelectedCaption}>
            <Scissors className="h-3 w-3 mr-1" /> Split (S)
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-white" onClick={mergeWithNextCaption}>
            Merge (M)
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-white" onClick={addCaptionAfterSelection}>
            Add (N)
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-300 hover:text-red-200" onClick={deleteSelectedCaption}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-white" onClick={undoTimelineChange}>
            Undo
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-white" onClick={redoTimelineChange}>
            Redo
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => setIsTranscriptOpen(true)}>
            <FileText className="h-3 w-3 mr-1" /> Transcript Editor
          </Button>
          <div className="flex-1" />
          <Slider
            value={[currentPositionPercent]}
            max={100}
            step={1}
            className="w-32"
            onValueChange={(value) => {
              if (!project) return;
              setCurrentTime((readSliderValue(value) / 100) * project.duration);
            }}
          />
        </div>

        <div className="flex-1 overflow-auto relative p-4 gap-2 flex flex-col">
          <div className="absolute top-0 bottom-0" style={{ left: `${Math.max(6, currentPositionPercent)}%` }}>
            <div className="w-px h-full bg-red-500 z-20" />
            <div className="w-3 h-3 bg-red-500 rounded-sm -ml-1.5 -mt-[calc(100%+8px)]" />
          </div>

          <div className="flex h-16 w-full items-center gap-4">
            <span className="w-16 text-xs text-gray-500 font-medium">Video 1</span>
            <div className="flex-1 h-full bg-blue-900/30 border border-blue-500/30 rounded-md overflow-hidden flex relative">
              <div className="absolute inset-y-0 left-0 right-0 bg-blue-600/20 border-x border-blue-500/50" />
            </div>
          </div>

          <div className="flex h-14 w-full items-center gap-4">
            <span className="w-16 text-xs text-gray-500 font-medium">Captions</span>
            <div
              ref={timelineTrackRef}
              className="flex-1 h-full bg-white/5 rounded-md relative overflow-hidden border border-white/10"
              onMouseDown={(event) => {
                if (!project || !timelineTrackRef.current) return;
                const rect = timelineTrackRef.current.getBoundingClientRect();
                const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
                setCurrentTime(ratio * project.duration);
              }}
            >
              {project?.transcription.map((caption, index) => {
                const duration = Math.max(project.duration, 0.01);
                const left = (caption.start / duration) * 100;
                const width = Math.max(1.2, ((caption.end - caption.start) / duration) * 100);
                const isSelected = effectiveSelectedCaptionIndex === index;
                const isActive = currentTime >= caption.start && currentTime <= caption.end;
                const isLowConfidence =
                  Number.isFinite(caption.confidence) && Number(caption.confidence) < LOW_CONFIDENCE_THRESHOLD;
                const isEditingInline = inlineEditingIndex === index;

                return (
                  <div
                    key={`${caption.start}-${caption.end}-${index}`}
                    className={`absolute top-1 bottom-1 rounded-sm border flex items-center overflow-hidden ${
                      isSelected
                        ? "border-blue-400 bg-blue-500/35"
                        : isActive
                          ? "border-yellow-400 bg-yellow-500/30"
                          : isLowConfidence
                            ? "border-orange-400 bg-orange-500/25"
                            : "border-yellow-500/60 bg-yellow-500/20"
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onMouseDown={(event) => beginCaptionDrag(event, index, "move")}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedCaptionIndex(index);
                      setCurrentTime(caption.start);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      setInlineEditingIndex(index);
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/30 hover:bg-white/70"
                      onMouseDown={(event) => beginCaptionDrag(event, index, "resize-start")}
                    />
                    
                    {isEditingInline ? (
                      <input
                        autoFocus
                        value={caption.word}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCaptionAtIndex(index, (c) => ({ ...c, word: val }));
                        }}
                        onBlur={() => {
                          setInlineEditingIndex(null);
                          if (project?.transcription) {
                            void persistCaptionChanges(project.transcription, true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setInlineEditingIndex(null);
                            if (project?.transcription) {
                              void persistCaptionChanges(project.transcription, true);
                            }
                          }
                        }}
                        className="w-full bg-black/80 px-1 py-0.5 text-[10px] text-white outline-none rounded"
                      />
                    ) : (
                      <span className="px-2 text-[10px] text-yellow-100 truncate w-full text-center pointer-events-none">
                        {caption.word}{isLowConfidence ? " • low" : ""}
                      </span>
                    )}

                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/30 hover:bg-white/70"
                      onMouseDown={(event) => beginCaptionDrag(event, index, "resize-end")}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full Transcript Editor Modal */}
      {isTranscriptOpen && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#141414] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">Full Transcript Editor</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  {project.transcription.length} clips
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-gray-400 hover:text-white"
                onClick={() => setIsTranscriptOpen(false)}
              >
                Close ✕
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {project.transcription.map((caption, index) => (
                <div
                  key={`transcript-${index}`}
                  className={`flex items-start gap-4 rounded-xl border p-3.5 transition-colors ${
                    currentTime >= caption.start && currentTime <= caption.end
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <button
                    onClick={() => setCurrentTime(caption.start)}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs font-mono text-gray-400 hover:border-white/20 hover:text-white"
                  >
                    <Play className="h-2.5 w-2.5" />
                    {caption.start.toFixed(2)}s
                  </button>

                  <div className="flex-1 space-y-1">
                    <textarea
                      rows={2}
                      value={caption.word}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCaptionAtIndex(index, (c) => ({ ...c, word: val }));
                      }}
                      onBlur={() => {
                        if (project?.transcription) {
                          void persistCaptionChanges(project.transcription, true);
                        }
                      }}
                      className="w-full rounded-lg border border-white/10 bg-black/50 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>End: {caption.end.toFixed(2)}s</span>
                      {caption.highlightWords?.length ? (
                        <span className="text-amber-400 font-medium">
                          Highlights: {caption.highlightWords.join(", ")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-black/30 px-6 py-4">
              <p className="text-xs text-gray-400">Edits auto-save when you click away or close.</p>
              <Button
                onClick={() => {
                  if (project?.transcription) {
                    void persistCaptionChanges(project.transcription, false);
                  }
                  setIsTranscriptOpen(false);
                }}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Done Editing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
