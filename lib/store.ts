import { create } from 'zustand';
import {
  type CaptionLanguage,
  type CaptionScript,
  type CaptionSettings,
  DEFAULT_CAPTION_SETTINGS,
  type ExportQuality,
} from './caption-config';

export interface TranscriptionToken {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  script?: CaptionScript;
  highlightWords?: string[];
  positionX?: number;
  positionY?: number;
}

interface VideoProject {
  id: string;
  videoUrl: string | null;
  duration: number;
  status: 'uploading' | 'processing' | 'transcribing' | 'ready' | 'rendering' | 'completed' | 'failed';
  transcription: TranscriptionToken[];
  style: string;
}

interface EditorState {
  project: VideoProject | null;
  currentTime: number;
  isPlaying: boolean;
  selectedStyle: string;
  captionSettings: CaptionSettings;
  exportQuality: ExportQuality;
  setProject: (project: VideoProject) => void;
  updateStatus: (status: VideoProject['status']) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSelectedStyle: (style: string) => void;
  setCaptionLanguage: (language: CaptionLanguage) => void;
  updateCaptionSettings: (settings: Partial<CaptionSettings>) => void;
  setExportQuality: (quality: ExportQuality) => void;
  setTranscription: (transcription: TranscriptionToken[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  currentTime: 0,
  isPlaying: false,
  selectedStyle: 'creator-pop',
  captionSettings: DEFAULT_CAPTION_SETTINGS,
  exportQuality: '4k',
  setProject: (project) => set({ project }),
  updateStatus: (status) => set((state) => ({ project: state.project ? { ...state.project, status } : null })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSelectedStyle: (style) =>
    set((state) => ({
      selectedStyle: style,
      captionSettings: { ...state.captionSettings, style },
    })),
  setCaptionLanguage: (language) =>
    set((state) => ({
      captionSettings: { ...state.captionSettings, language },
    })),
  updateCaptionSettings: (settings) =>
    set((state) => ({
      captionSettings: { ...state.captionSettings, ...settings },
    })),
  setExportQuality: (quality) => set({ exportQuality: quality }),
  setTranscription: (transcription) => set((state) => ({ project: state.project ? { ...state.project, transcription } : null })),
}));
