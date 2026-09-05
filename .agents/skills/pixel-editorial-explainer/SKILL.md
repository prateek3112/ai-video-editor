---
name: pixel-editorial-explainer
description: >-
  Production-grade editorial & carousel explainer video pipeline supporting both Remotion and HyperFrames. Features the actionable animated Pixel Mascot ("Bittu") from char.mp4 with 4-leg walking kinematics, jump hops, arm gestures, retro desk workstations, deckled editorial torn-paper tech cards, verified status tags, pure white canvas, tight zero-silence audio pacing, and synced mono-line kinetic captions.
---

# Pixel Mascot & Editorial Explainer Skill ("Bytes with Bittu ⚡")

This document serves as the comprehensive master reference for generating high-retention editorial-style carousel explainer reels based on the `char.mp4` visual standard.

---

## 1. Persona & Branding System

- **Character Persona**: **Bittu** (The 8-Bit AI Mascot & Guide)
- **Visual Design**: Chunky 8-bit terracotta / coral peach (`#E07A5F`) rectangular body with two square black pixel eyes (`■ ■`), side ears/arms, and 4 articulated pixel legs (`■ ■ ■ ■`).
- **Series Title**: **Bytes with Bittu ⚡**
- **Top Navigation Bar**: Rounded pill badges (`[Bucket 1]`, `[@byteswithbittu]`, `[Part 1!]`).
- **Narrator Voice Persona**: Jarvis-style crisp, authoritative, punchy neural voice (`en-US-ChristopherNeural` via `edge-tts` at `+6%` rate with zero silence gaps).

---

## 2. Mascot Animation & Movement System

The Pixel Mascot is fully actionable and supports 7 distinct animation modes:

1. **4-Leg Walking Kinematics (`isWalking`)**:
   - Legs 1 & 3 oscillate in opposition to Legs 2 & 4 on a rapid sine wave (`0.15s` period / ~4.5 frames @ 30fps).
   - Alternates `scaleY(0.65)` to `scaleY(1.0)` with a subtle 2px vertical body bob.
2. **Squash & Stretch Hopping (`isBouncing` / `isJumping`)**:
   - Anticipation squash (`scale(1.2, 0.8)` at launch).
   - Peak jump elevation (`translateY(-36px)` with `scale(0.85, 1.25)`).
   - Landing impact recovery (`scale(1.15, 0.85)` into spring bounce).
3. **Arm Gestures & Celebrating (`isCelebrating` / `armsRaised`)**:
   - Side blocky arms raise up to `45°` / `90°` with rapid waving oscillation (`±12°`).
4. **Retro Desk Workstation (`deskWorkstation`)**:
   - Mascot sits at a wooden desk typing next to a retro CRT computer monitor.
   - Screen displays live glowing terminal graphics (e.g. Tencent blue logo, Claude starburst, matrix streams).
5. **Timeline Walker (`timelineWalker`)**:
   - Mascot traverses continuously across the bottom progress bar track as scenes advance.
6. **Looking Around & Blinking (`isLooking`)**:
   - Eyes shift position left/right (`±4px`) to look at cards or the viewer.
   - Eye blink every 60 frames (`scaleY(0.1)` for 3 frames).
7. **Floating Pixel Emotes & FX (`pixelFX`)**:
   - Floating pixel lightbulbs (idea reveal), pixel sparkles (high-spec benchmark), pixel lightning bolts, and pixel hearts.

---

## 3. Visual DNA & Color Palette

- **Canvas Background**: Immaculate, crisp white (`#FFFFFF`) or soft clean cream (`#FAF8F5`). Absolutely no gray dot grids, no math formula clutter, and no speech bubbles.
- **Palette**:
  - **Mascot**: Terracotta Peach (`#E07A5F` / `#D97757`)
  - **Headlines / Titles**: Rich Terracotta Serif (`#99422B`) and Deep Slate (`#0F172A`)
  - **Torn-Paper Cards**: Soft Cream (`#FAF8F5`) with crisp border (`#E2E8F0`) and ambient shadow (`0 20px 48px rgba(15, 23, 42, 0.08)`)
  - **Status Pill Badges**:
    - `[official]` / `[verified]` : Green (`#DCFCE7` / `#166534`)
    - `[active]` / `[free]` : Yellow (`#FEF9C3` / `#854D0E`)
    - `[partner]` / `[capacity]` : Blue (`#E0E7FF` / `#3730A3`)
    - `[100% ★]` / `[workflows]` : Pink/Magenta (`#FCE7F3` / `#9D174D`)
- **Captions**:
  - **Mono-line 1-2 words max, NO background mask container**.
  - 48px–64px bold uppercase sans with thick 4px black outline (`-webkit-text-stroke: 4px #000`) and deep shadow (`0 10px 30px rgba(0,0,0,0.95)`).
  - Golden yellow keyword highlighting (`#FBBF24`).

---

## 4. Screen Layout & Safe Zones (1080 × 1920 / 720 × 1280)

```
+-------------------------------------------------------+
|  [y: 80px]   [Bucket 1]              [@byteswithbittu]|  <- Top Navigation
|                                                       |
|  [y: 160-320px]  EDITORIAL SERIF HEADLINE             |  <- Georgia 700 / Nunito 900
|                                                       |
|  [y: 400-1280px]  HERO STAGE ZONE                     |
|    - Scene 1: Desk Workstation (Mascot + CRT Monitor) |
|    - Scenes 2-6: Deckled Torn-Paper Spec Cards        |
|                                                       |
|  [y: 1520-1640px]                                     |
|    KINETIC 1-2 WORD CAPTIONS (NO BG MASK)             |  <- Pure text with black outline
|                                                       |
|  [y: 1780-1840px]                                     |
|    BOTTOM TIMELINE TRACK (Walking Mascot Progress)    |  <- 4-leg walking mascot
+-------------------------------------------------------+
```

---

## 5. Audio Pacing & Silence Removal Rules

- **Zero Dead Pauses**: Explainer reels must have tight, snappy pacing. All trailing audio silences must be trimmed with `silenceremove` or generated with sentence-by-sentence chaining.
- **Transition Breathers**: Maximum 0.10s–0.15s between narration sentences.
- **Background Music**: Low-volume upbeat ambient tech track (`12%-15%` volume) mixed beneath the voiceover.

---

## 6. Dual-Engine Architecture

1. **Remotion Engine** (`components/remotion/DoodleExplainerReel.tsx`):
   - Pure React architecture with Remotion `spring()` physics and frame-accurate `<Sequence>` scheduling.
   - Rendered via `@remotion/renderer` to 1080 × 1920 MP4.
2. **HyperFrames Engine** (`lib/doodle-composition.ts`):
   - GSAP 3 vector HTML canvas timeline orchestration with full-screen `0 0 720 1280` coordinate space.
   - Rendered via `hyperframes render` CLI.
