---
name: viral-tech-reel
description: >-
  Production-ready Remotion architecture, visual language, and animation pipeline for creating high-retention Apple/Linear-inspired viral tech reels with split-screens, full-screen showcases, and 'Unique Bold Captions' (Inter 900, 2-word phrase slide-up, exit blur).
---

# Viral Tech Reel Editing Style Guide & Remotion Architecture

This skill documents the production-tested blueprint for creating high-converting, viral tech Instagram Reels and TikToks using Remotion and Next.js.

---

## 1. Scene Architecture & Pacing

A winning 30–45s tech reel follows a dynamic **4-State Visual Flow**:

```
[0:00 - 0:02] Hook: Full-Screen Speaker + Bold Kinetic Text
       ↓
[0:02 - 0:07] Intro / Problem: Apple Split-Screen (Cards 1 & 2)
       ↓
[0:07 - 0:09] First Wow Moment: Centered Full-Screen Visual Deep-Dive (Card 3)
       ↓
[0:09 - 0:14] Setup Workflow: Apple Split-Screen (Cards 4 & 5)
       ↓
[0:14 - 0:18] Main Climax Demo: Centered Full-Screen Visual Deep-Dive (Card 6)
       ↓
[0:18 - 0:29] Results & Optimization: Apple Split-Screen (Cards 7, 8, 9)
       ↓
[0:29 - 0:34] CTA: Full-Screen Speaker + Pulsing ManyChat "COMMENT" Trigger Box
```

---

## 2. Layout Specifications

### A. Apple Split-Screen Mode
- **Backdrop**: `#F8F9FA` with subtle dot-grid.
- **Top Visual Card**:
  - Size: `width: 610px`, `height: 825px`, `borderRadius: 38px`.
  - Position: `top: 40px`, `left: 50%`, `transform: translateX(-50%)`.
  - Entrance: Spring slide-up (`translateY: 55px -> 0px`, `scale: 0.88 -> 1.0`).
- **Bottom Speaker Container**:
  - Arched Window: `borderRadius: "52px 52px 0 0"`, `border: "2px solid rgba(255,255,255,0.9)"`.
  - Video Framing: `top: -140px`, `transform: "translateX(-50%) scale(0.86)"`.
- **Center Caption Corridor**:
  - Position: `top: 49.5%`, `left: 50%`, `transform: translate(-50%, -50%)`.

### B. Centered Full-Screen Visual Deep-Dive (No Camera Clutter)
- **Backdrop**: Dark studio ambient `#090D16` with radial blue glow.
- **Visual Card**:
  - Size: `width: 720px`, `height: 960px`, `borderRadius: 44px`.
  - Position: `top: 46%`, `left: 50%`, `transform: translate(-50%, -50%)`.
  - Captions: Placed below at `top: 86%`.

---

## 3. 'UNIQUE BOLD CAPTIONS' System (Inter 900 + 2-Word Phrase Slide-Up + Exit Blur)

### Typography Rules
- **Font Family**: `Inter 900` (via `@remotion/google-fonts/Inter`) or `"Helvetica Neue", Helvetica, Arial, sans-serif`.
- **Ultra-Tight Letter Spacing**: `letterSpacing: "-3.5px"` (`-0.06em`) for high-density monolithic blocks.
- **Solid Fill & Outer Stroke**: `paintOrder: "stroke fill"`, `WebkitTextStroke: "6px #000000"`.
- **Color Palette**:
  - **Keywords**: Golden Yellow (`#FFE500`) with multi-layer drop shadows.
  - **Flow Words**: Pure White (`#FFFFFF`).

### 2-Word Phrase Grouping & Motion Physics
```tsx
// 1. Group words into 2-word phrase blocks for comfortable reading time
const phrases = useMemo(() => {
  const list = [];
  let currentGroup = [];
  for (let i = 0; i < processedWords.length; i++) {
    const w = processedWords[i];
    const prev = processedWords[i - 1];
    const gap = prev ? w.start - prev.end : 0;
    if (currentGroup.length >= 2 || (currentGroup.length > 0 && gap > 0.25)) {
      list.push({
        id: list.length,
        start: currentGroup[0].start,
        end: currentGroup[currentGroup.length - 1].effectiveEnd,
        words: currentGroup,
      });
      currentGroup = [];
    }
    currentGroup.push(w);
  }
  if (currentGroup.length > 0) {
    list.push({
      id: list.length,
      start: currentGroup[0].start,
      end: currentGroup[currentGroup.length - 1].effectiveEnd,
      words: currentGroup,
    });
  }
  return list;
}, [processedWords]);

// 2. Entrance Slide-Up
const enterSpring = spring({ frame: relFrame, fps, config: { damping: 20, stiffness: 150, mass: 0.4 } });
const enterSlideY = interpolate(enterSpring, [0, 1], [26, 0]);
const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

// 3. Exit Motion Blur (last 3-4 frames of the 2-word phrase)
const isExiting = frame >= endFrame - exitDuration;
const exitProgress = isExiting ? interpolate(frame, [endFrame - exitDuration, endFrame], [0, 1]) : 0;
const exitBlur = interpolate(exitProgress, [0, 1], [0, 12]);
const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
const exitSlideY = interpolate(exitProgress, [0, 1], [0, -10]);
```

---

## 4. Container Audio & Lip-Sync Synchronization

Extract master audio with `first_pts=0` resampling:
```bash
ffmpeg -y -i input.MOV -af "aresample=async=1:first_pts=0" -vn -c:a pcm_s16le -ar 48000 master_audio.wav
```
