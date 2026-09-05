export type CrtBrand =
  | 'anthropic'
  | 'openai'
  | 'deepseek'
  | 'google'
  | 'apple'
  | 'meta'
  | 'github'
  | 'cursor'
  | 'tencent'
  | 'huggingface'
  | 'terminal';

export type PixelEmote =
  | 'lightbulb'
  | 'sparkle'
  | 'trophy'
  | 'exclamation'
  | 'fire'
  | 'gear';

export interface CardItem {
  num: string;
  title: string;
  desc: string;
  tag?: string;
  tagColor?: string;
}

export interface KineticCaptionChunk {
  text: string;
  fromFrame: number;
  durationInFrames: number;
  isHighlight?: boolean;
}

export interface EightBitScene {
  id: string;
  type: 'intro-workstation' | 'editorial-card' | 'cta-card' | 'pipeline-visualizer' | 'tool-matrix' | 'bento-cta';
  durationInFrames: number;
  // Intro Workstation fields
  headline?: string;
  subheadline?: string;
  terminalText?: string;
  // Editorial Card fields
  tabLabel?: string;
  tabColor?: string;
  title?: string;
  subtitle?: string;
  items?: CardItem[];
  footerNote?: string;
  emote?: PixelEmote;
  customVisualizer?: 'speech-correction' | 'speed-gauge' | 'marker-loop';
  hasMarkerLoop?: boolean;
  // Captions
  captions: KineticCaptionChunk[];
}

export interface EightBitReelProps {
  topic: string;
  tagBucket?: string;
  authorHandle?: string;
  crtBrand?: CrtBrand;
  crtSubtitle?: string;
  audioSrc?: string;
  bgMusicSrc?: string;
  scenes: EightBitScene[];
}
