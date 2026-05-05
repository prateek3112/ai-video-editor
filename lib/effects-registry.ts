import type { CaptionAnimation, CaptionEffect, MotionPreset, VideoEffect } from "./caption-config";

export type OverlayKind = "image" | "text" | "lower-third" | "shape" | "social" | "logo";
export type TransitionPreset = "cut" | "fade" | "flash-white" | "blur-dissolve" | "whip-pan" | "zoom-cut" | "glitch";
export type SfxPreset = "whoosh" | "pop" | "impact" | "camera-shutter" | "riser" | "sub-hit" | "click" | "notification";

export type EffectRegistryItem<T extends string> = {
  id: T;
  name: string;
  description: string;
  defaultDuration?: number;
  intensityRange?: [number, number];
};

export const CAPTION_ANIMATION_REGISTRY: Array<EffectRegistryItem<CaptionAnimation>> = [
  { id: "fade", name: "Fade", description: "Clean opacity ramp for calmer edits.", defaultDuration: 0.18 },
  { id: "slide-up", name: "Slide Up", description: "Captions rise into place like social reels.", defaultDuration: 0.26 },
  { id: "zoom", name: "Zoom", description: "Subtle scale emphasis on active caption moments.", defaultDuration: 0.2 },
  { id: "bounce", name: "Bounce", description: "Playful vertical impact for short-form captions.", defaultDuration: 0.32 },
  { id: "shake", name: "Shake", description: "Short jitter for meme or emphasis beats.", defaultDuration: 0.18 },
  { id: "pulse", name: "Pulse", description: "Breathing emphasis without changing the text layout.", defaultDuration: 0.28 },
  { id: "flicker", name: "Flicker", description: "Neon-style unstable brightness and micro-jitter.", defaultDuration: 0.18 },
  { id: "typewriter", name: "Typewriter", description: "Progressively reveals caption text.", defaultDuration: 0.5 },
  { id: "karaoke", name: "Karaoke", description: "Keeps the sentence visible while highlighting active words." },
  { id: "word-pop", name: "Word Pop", description: "Pops each active word for retention-first edits.", defaultDuration: 0.14 },
];

export const CAPTION_EFFECT_REGISTRY: Array<EffectRegistryItem<CaptionEffect>> = [
  { id: "shadow", name: "Shadow", description: "Readable social-video caption shadow.", intensityRange: [0, 1] },
  { id: "outline", name: "Outline", description: "Thick stroke for busy footage.", intensityRange: [0, 1] },
  { id: "glow", name: "Glow", description: "Colored aura for gaming, music, and night looks.", intensityRange: [0, 1] },
  { id: "glass", name: "Glass", description: "Soft translucent panel behind text.", intensityRange: [0, 1] },
  { id: "sticker", name: "Sticker", description: "Chunky outlined creator captions.", intensityRange: [0, 1] },
  { id: "none", name: "None", description: "No caption treatment beyond text color." },
];

export const VIDEO_EFFECT_REGISTRY: Array<EffectRegistryItem<VideoEffect>> = [
  { id: "none", name: "None", description: "Original footage." },
  { id: "cinematic", name: "Cinematic", description: "Contrast, mild desaturation, and vignette.", intensityRange: [0, 1] },
  { id: "vibrant", name: "Vibrant", description: "Higher saturation and punch.", intensityRange: [0, 1] },
  { id: "noir", name: "Noir", description: "Black-and-white contrast treatment.", intensityRange: [0, 1] },
  { id: "warm", name: "Warm", description: "Warmer skin-tone leaning color balance.", intensityRange: [0, 1] },
  { id: "cool", name: "Cool", description: "Cooler blue/teal color balance.", intensityRange: [0, 1] },
  { id: "sharpen", name: "Sharpen", description: "Extra detail for compressed clips.", intensityRange: [0, 1] },
  { id: "vintage", name: "Vintage", description: "Soft muted color and vignette.", intensityRange: [0, 1] },
];

export const MOTION_PRESET_REGISTRY: Array<EffectRegistryItem<MotionPreset>> = [
  { id: "none", name: "None", description: "Locked-off framing." },
  { id: "punch-in", name: "Punch In", description: "Instant creator-style crop zoom.", intensityRange: [0, 1] },
  { id: "drift", name: "Drift", description: "Slow editorial camera drift.", intensityRange: [0, 1] },
  { id: "float", name: "Float", description: "Gentle vertical motion.", intensityRange: [0, 1] },
  { id: "handheld", name: "Handheld", description: "Small camera shake for energy.", intensityRange: [0, 1] },
];

export const TRANSITION_REGISTRY: Array<EffectRegistryItem<TransitionPreset>> = [
  { id: "cut", name: "Cut", description: "Hard edit.", defaultDuration: 0 },
  { id: "fade", name: "Fade", description: "Simple opacity crossfade.", defaultDuration: 0.35 },
  { id: "flash-white", name: "Flash White", description: "Fast white flash through the edit.", defaultDuration: 0.18 },
  { id: "blur-dissolve", name: "Blur Dissolve", description: "Soft blur into the next moment.", defaultDuration: 0.45 },
  { id: "whip-pan", name: "Whip Pan", description: "Directional motion-blur transition.", defaultDuration: 0.28 },
  { id: "zoom-cut", name: "Zoom Cut", description: "Punchy scale transition for emphasis.", defaultDuration: 0.24 },
  { id: "glitch", name: "Glitch", description: "Digital distortion transition.", defaultDuration: 0.22 },
];

export const SFX_REGISTRY: Array<EffectRegistryItem<SfxPreset> & { assetPath: string }> = [
  { id: "whoosh", name: "Whoosh", description: "Use on fast text or overlay movement.", defaultDuration: 0.35, assetPath: "/sfx/whoosh.wav" },
  { id: "pop", name: "Pop", description: "Use on word pops and sticker overlays.", defaultDuration: 0.18, assetPath: "/sfx/pop.wav" },
  { id: "impact", name: "Impact", description: "Use on big reveals and title hits.", defaultDuration: 0.6, assetPath: "/sfx/impact.wav" },
  { id: "camera-shutter", name: "Camera Shutter", description: "Use on freeze frames or photo cards.", defaultDuration: 0.2, assetPath: "/sfx/camera-shutter.wav" },
  { id: "riser", name: "Riser", description: "Use before a reveal or transition.", defaultDuration: 1.2, assetPath: "/sfx/riser.wav" },
  { id: "sub-hit", name: "Sub Hit", description: "Low-frequency emphasis hit.", defaultDuration: 0.5, assetPath: "/sfx/sub-hit.wav" },
  { id: "click", name: "Click", description: "Small UI or pointer accent.", defaultDuration: 0.1, assetPath: "/sfx/click.wav" },
  { id: "notification", name: "Notification", description: "Light social app accent.", defaultDuration: 0.35, assetPath: "/sfx/notification.wav" },
];
