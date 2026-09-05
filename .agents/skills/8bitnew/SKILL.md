---
name: 8bitnew
description: >-
  Next-generation 8-Bit Pixel & Editorial Tech Explainer Reel pipeline using Remotion (1080x1920).
  Builds upon the 8-bit aesthetic with advanced non-character visual engagement mechanics:
  live CRT terminal typing with phosphor scanlines, animated SVG hand-drawn red marker loops,
  real-time speech self-correction before/after visualizers, dual-meter speed comparison gauges with rubber ink stamps,
  5-bar live navigation audio equalizers, and an artifact-free 3-font typography hierarchy.
---

# 8bitnew: Advanced Editorial & Retro-Tech Explainer Reels

`8bitnew` is a production-grade vertical reel generation system (1080 × 1920 @ 30fps) designed for maximum viewer retention without relying on character facial acting or movements. It combines retro 8-bit tech aesthetics with tactile editorial print techniques and real-time interactive UI visualizers.

---

## 1. Visual DNA & Palette

| Element | Hex / Style | Description |
| :--- | :--- | :--- |
| **Canvas Background** | `#FFFFFF` | Crisp, pure white background with subtle engineering dot-grid |
| **Engineering Grid** | `radial-gradient(#E2E8F0 1.2px, transparent 1.2px)` | 32px × 32px technical dot-matrix background |
| **Pixel Mascot ("Bittu")**| `#E07A5F` (Terracotta) | 4-leg grounded walker at bottom timeline; perched on cards |
| **Primary Brand Punch** | `#2563EB` (Google Blue) / `#D97757` | Accent colors for cards, tags, and progress meters |
| **Marker Loop / Stamp** | `#EF4444` / `#DC2626` | Hand-drawn red marker ink and rubber approval stamps |
| **Highlight Yellow** | `#FBBF24` / `#DCFCE7` | Gold yellow caption highlights and fluorescent paper tints |

---

## 2. Non-Character Visual Engagement Mechanics

Rather than relying on character expressions, `8bitnew` drives retention through dynamic UI physics, kinetic data displays, and tactile paper elements:

### A. Live CRT Terminal Screen with Typing & Scanlines (Scene 1)
- **Component**: [`CrtTerminalTyping.tsx`](file:///Users/prateekguglani/Desktop/portfolio/ai-video-editor/components/remotion/eight-bit-v2/CrtTerminalTyping.tsx)
- Real-time typewriter input simulating active command-line speech processing:
  ```
  $ gemini transcribe --smart
  > IN: 'Tuesday... Wednesday'
  > FIX: 'Wednesday' [100%]
  > STATUS: STREAMING LIVE █
  ```
- **Phosphor Scanline Overlay**: Horizontal scanline texture (`repeating-linear-gradient`) and soft phosphor glow.
- **Blinking Block Cursor**: `█` toggles every 8 frames for authentic retro terminal feel.

### B. Animated Hand-Drawn SVG Markers (Scenes 3 & 5)
- **Component**: [`SvgMarker.tsx`](file:///Users/prateekguglani/Desktop/portfolio/ai-video-editor/components/remotion/eight-bit-v2/SvgMarker.tsx)
- **MarkerLoop**: Hand-drawn imperfect oval loop that wraps around key stats or titles using spring physics and `strokeDashoffset` reveal.
- **MarkerUnderline**: Hand-drawn wavy underline accentuating core proof points.

### C. Real-Time Speech Self-Correction Visualizer (Scene 2)
- **Component**: [`LiveSpeechCorrection.tsx`](file:///Users/prateekguglani/Desktop/portfolio/ai-video-editor/components/remotion/eight-bit-v2/LiveSpeechCorrection.tsx)
- Demonstrates abstract speech intelligence through interactive visual state:
  1. Spoken input displays raw disfluent speech: `“Let's meet Tuesday… actually, Wednesday”`
  2. Animated red redaction line strikes through `Tuesday` (frame 10).
  3. Fluorescent green highlight pops onto `Wednesday` (frame 22).
  4. Clean result pill slides up: `“Let's meet Wednesday.”` with `[100% CLEAN]` verified badge.

### D. Speed Comparison Gauge & Rubber Ink Stamp (Scene 5)
- **Component**: [`SpeedComparisonGauge.tsx`](file:///Users/prateekguglani/Desktop/portfolio/ai-video-editor/components/remotion/eight-bit-v2/SpeedComparisonGauge.tsx)
- **Dual Animated Meters**:
  - `Gemini 3.5 Transcribe`: Progress bar shoots from 0% to 100% (Green `#16A34A`), labeled `70% FASTER`.
  - `Previous Model (Chirp 3)`: Baseline progress bar capped at 30% (Slate `#94A3B8`).
- **Rubber Ink Stamp of Approval**:
  - `[★ 70% LATENCY DROP]` badge slams down from `scale(2.2) -> scale(1.0)` with a `-6deg` tilt and spring settle.

### E. Live Navigation Audio Equalizer (All Scenes)
- **Component**: [`AudioEqualizerNav.tsx`](file:///Users/prateekguglani/Desktop/portfolio/ai-video-editor/components/remotion/eight-bit-v2/AudioEqualizerNav.tsx)
- 5-bar animated jumping waveform positioned next to the creator handle `@byteswithbittu`, visually reinforcing real-time neural audio commentary.

---

## 3. Editorial Typography System & Zero-Marker Rule

### A. The 3 Allowed Fonts
1. **Inter Black (900)**: Primary punch words for titles and base caption words.
2. **Impact**: Heavy uppercase headline punch.
3. **Apple Garamond Light Italic**: Literary editorial accent in titles and caption highlight words.
*(Strictly NO script fonts like Aston Script).*

### B. Eliminating Font "Markers" & Contour Overlap Artifacts
> [!IMPORTANT]
> **NEVER use `-webkit-text-stroke` on variable fonts like Inter.**
> Variable font TrueType outlines use overlapping components (stem + bowl). In Chromium / Remotion, `-webkit-text-stroke` strokes each component independently, creating black vertical lines and rectangular notches inside letters (`D`, `R`, `P`, `O`, `B`).
>
> **Solution**: Use the multi-directional `cleanOutlineShadow`:
> ```css
> text-shadow:
>   -2px -2px 0 #000,  2px -2px 0 #000,
>   -2px  2px 0 #000,  2px  2px 0 #000,
>   -3px  0px 0 #000,  3px  0px 0 #000,
>    0px -3px 0 #000,  0px  3px 0 #000,
>    0 12px 28px rgba(0, 0, 0, 0.95),
>    0 4px 8px rgba(0, 0, 0, 0.85);
> ```
> This creates a 100% solid, smooth interior with crisp outer definition and zero internal artifacts.

---

## 4. Screen Layout & Safe Zones (1080 × 1920)

```
+-------------------------------------------------------+
|  [y: 80px]   [Bucket 1]       [Live EQ] [@handle]     |  <- Top Navigation
|                                                       |
|  [y: 180-340px]  MIXED HEADLINE (Impact + Garamond)   |  <- Mixed sans & serif
|                                                       |
|  [y: 420-1260px]  HERO STAGE ZONE                     |
|    - Scene 1: Desk + Live Typing CRT Terminal         |
|    - Scenes 2-6: Editorial Cards + Visualizers       |
|      (Speech Correction, Speed Gauge, Marker Loops)   |
|                                                       |
|  [y: 1360-1440px]                                     |
|    KINETIC LOWER-THIRD CAPTIONS                       |  <- Slide Up IN / Blur OUT
|    (Inter Black + Apple Garamond Italic #FBBF24)      |  <- Adaptive Safe-Zone
|                                                       |
|  [y: 1780-1840px]                                     |
|    BOTTOM TIMELINE TRACK (Walking Mascot Progress)    |  <- 4-leg walking mascot
+-------------------------------------------------------+
```

---

## 5. Audio Pipeline & Word Synchronization

1. **Word-Level Synthesis**: Synthesizes neural voiceover via `edge-tts` with `boundary="WordBoundary"`.
2. **Silence Removal**: Trims leading pause (`word[0].start - 0.05s`) and trailing pause (`word[n].end + 0.08s`).
3. **Breathing Room**: Inserts **0.32s (~10 frames @ 30fps)** audio silence padding (`apad=pad_dur=0.32`) after each scene's speech, allowing animations to settle naturally.
4. **Adaptive Captions**: Dynamically downscales font size based on character count (`getAdaptiveCaptionSize(text)`) so text never goes off-screen.

---

## 6. Rendering via CLI

To render any video using the `8bitnew` pipeline:

```bash
# Render Google Gemini 3.5 Transcribe with full visualizer stack
npx tsx scripts/render-8bit-reel.ts --preset gemini-transcribe
```

Outputs are rendered in Full HD (1080 × 1920 @ 30fps) to `public/renders/8bit-gemini-transcribe.mp4`.
