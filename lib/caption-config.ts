export type CaptionLanguage = "english" | "hinglish" | "hindi";
export type CaptionScript = "roman" | "devanagari";
export type CaptionAnimation = "fade" | "bounce" | "typewriter" | "karaoke" | "word-pop" | "slide-up" | "zoom" | "shake" | "pulse" | "flicker";
export type CaptionLayout = "bottom" | "center" | "top";
export type CaptionTransition = "smooth" | "snappy";
export type CaptionEffect = "shadow" | "outline" | "glow" | "glass" | "sticker" | "none";
export type CaptionCapitalization = "normal" | "uppercase" | "title";
export type ExportQuality = "720p" | "1080p" | "4k";
export type ExportFormat = "mp4" | "srt" | "vtt" | "txt";
export type VideoEffect = "none" | "cinematic" | "vibrant" | "noir" | "warm" | "cool" | "sharpen" | "vintage";
export type MotionPreset = "none" | "punch-in" | "drift" | "float" | "handheld";

export interface CaptionSettings {
  brandThemeId: string;
  style: string;
  fontFamily: string;
  fontWeight: number;
  fontScale: number;
  layout: CaptionLayout;
  positionX: number;
  positionY: number;
  maxWordsPerLine: number;
  maxLines: number;
  effectPreset: CaptionEffect;
  animation: CaptionAnimation;
  animationSpeed: number;
  transition: CaptionTransition;
  language: CaptionLanguage;
  defaultScript: CaptionScript;
  capitalization: CaptionCapitalization;
  textColor: string;
  textOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  emphasisColor: string;
  activeWordColor: string;
  activeWordBackground: string;
  activeWordBackgroundOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  letterSpacing: number;
  lineHeight: number;
  shadowStrength: number;
  highlightEnabled: boolean;
  videoEffect: VideoEffect;
  motionPreset: MotionPreset;
  effectIntensity: number;
}

export const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  brandThemeId: "electric-lime",
  style: "creator-pop",
  fontFamily: "Avenir Next",
  fontWeight: 800,
  fontScale: 1,
  layout: "bottom",
  positionX: 0.5,
  positionY: 0.82,
  maxWordsPerLine: 4,
  maxLines: 3,
  effectPreset: "shadow",
  animation: "fade",
  animationSpeed: 1,
  transition: "smooth",
  language: "english",
  defaultScript: "roman",
  capitalization: "normal",
  textColor: "#ffffff",
  textOpacity: 1,
  backgroundColor: "#000000",
  backgroundOpacity: 0,
  emphasisColor: "#facc15",
  activeWordColor: "#facc15",
  activeWordBackground: "#000000",
  activeWordBackgroundOpacity: 0.72,
  strokeColor: "#000000",
  strokeWidth: 2,
  letterSpacing: 0,
  lineHeight: 1.2,
  shadowStrength: 0.6,
  highlightEnabled: false,
  videoEffect: "none",
  motionPreset: "none",
  effectIntensity: 0.65,
};

export const FONT_FAMILIES = [
  "Anton",
  "Avenir Next",
  "Bebas Neue",
  "Futura",
  "Georgia",
  "Garamond",
  "Helvetica Neue",
  "Impact",
  "Inter",
  "Lora",
  "Manrope",
  "Montserrat",
  "Poppins",
  "Roboto Slab",
  "Sora",
  "Tahoma",
  "Trebuchet MS",
] as const;

export const STYLE_PRESETS: Array<{
  id: string;
  name: string;
  fontFamily: string;
  layout: CaptionLayout;
}> = [
  { id: "classic", name: "Classic", fontFamily: "Montserrat", layout: "bottom" },
  { id: "bold-white", name: "Bold White", fontFamily: "Anton", layout: "bottom" },
  { id: "dark-box", name: "Dark Box", fontFamily: "Poppins", layout: "bottom" },
  { id: "outline-only", name: "Outline Only", fontFamily: "Impact", layout: "bottom" },
  { id: "minimal", name: "Minimal", fontFamily: "Lora", layout: "bottom" },
  { id: "hormozi", name: "Hormozi", fontFamily: "Anton", layout: "center" },
  { id: "karaoke", name: "Karaoke", fontFamily: "Montserrat", layout: "bottom" },
  { id: "karaoke-box", name: "Karaoke Box", fontFamily: "Montserrat", layout: "bottom" },
  { id: "word-pop", name: "Word Pop", fontFamily: "Bebas Neue", layout: "center" },
  { id: "word-fade", name: "Word Fade", fontFamily: "Poppins", layout: "center" },
  { id: "bounce-pop", name: "Bounce", fontFamily: "Bebas Neue", layout: "center" },
  { id: "typewriter-pro", name: "Typewriter", fontFamily: "Roboto Slab", layout: "bottom" },
  { id: "neon-glow", name: "Neon Glow", fontFamily: "Sora", layout: "bottom" },
  { id: "gradient-reveal", name: "Gradient Reveal", fontFamily: "Manrope", layout: "bottom" },
  { id: "wave", name: "Wave", fontFamily: "Manrope", layout: "center" },
  { id: "keyword-highlight", name: "Keyword Highlight", fontFamily: "Poppins", layout: "bottom" },
  { id: "speaker-color", name: "Speaker Color", fontFamily: "Montserrat", layout: "bottom" },
  { id: "emoji-punch", name: "Emoji Punch", fontFamily: "Poppins", layout: "bottom" },
  { id: "bold-viral", name: "TikTok Bold", fontFamily: "Impact", layout: "bottom" },
  { id: "clean-minimal", name: "Minimal Clean", fontFamily: "Inter", layout: "bottom" },
  { id: "creator-pop", name: "Caption Pop", fontFamily: "Avenir Next", layout: "bottom" },
  { id: "kinetic-news", name: "Broadcast", fontFamily: "Helvetica Neue", layout: "center" },
  { id: "podcast", name: "Podcast Lower Third", fontFamily: "Georgia", layout: "bottom" },
  { id: "cinema-wide", name: "Cinematic Wide", fontFamily: "Futura", layout: "bottom" },
  { id: "meme", name: "Meme Classic", fontFamily: "Arial Black", layout: "top" },
  { id: "gaming-flash", name: "Gaming Flash", fontFamily: "Trebuchet MS", layout: "center" },
  { id: "reel-neon", name: "Veed Neon", fontFamily: "Verdana", layout: "bottom" },
  { id: "story-board", name: "Story Subtitle", fontFamily: "Tahoma", layout: "top" },
  { id: "documentary", name: "Documentary", fontFamily: "Garamond", layout: "bottom" },
  { id: "subway-bold", name: "Karaoke Pro", fontFamily: "Franklin Gothic Medium", layout: "center" },
  { id: "luxury", name: "Luxury Serif", fontFamily: "Times New Roman", layout: "center" },
];

export const LANGUAGE_SAMPLE_TEXT: Record<CaptionLanguage, string[]> = {
  english: ["This", "feature", "looks", "insane"],
  hinglish: ["Ye", "edit", "bahut", "crazy", "hai"],
  hindi: ["ye", "feature", "bahut", "accha", "hai"],
};

export const QUALITY_CONFIG: Record<ExportQuality, { width: number; height: number; bitrate: number }> = {
  "720p": { width: 720, height: 1280, bitrate: 4200 },
  "1080p": { width: 1080, height: 1920, bitrate: 8000 },
  "4k": { width: 2160, height: 3840, bitrate: 35000 },
};
