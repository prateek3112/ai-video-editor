---
name: 8bit-tech-reel
description: >-
  Production-grade 8-bit Pixel Mascot ("Bittu") & Editorial Tech Explainer Reel pipeline using Remotion. Features the authentic 4-leg walking pixel mascot from char.mp4, retro wooden desk workstations with custom CRT brand monitor terminals (Anthropic, OpenAI, DeepSeek, Google, GitHub, Apple, Cursor, etc.), deckled editorial torn-paper tech cards, verified status pills, zero-silence neural voiceovers, and frame-synced mono-line kinetic captions. Capable of generating reels on ANY tech topic.
---

# 8-Bit Pixel Mascot & Editorial Tech Reel Skill ("Bytes with Bittu ⚡")

This document serves as the master production reference for generating high-retention 8-bit animated explainer reels in **Remotion** (1080 × 1920 Full HD vertical video) for **any technology topic**.

---

## 1. Persona & Branding System

- **Mascot Persona**: **Bittu** (The 8-Bit AI Guide & Engineering Mascot)
- **Visual Design**: Chunky 8-bit terracotta / coral peach (`#E07A5F`) rectangular body with two square black pixel eyes (`■ ■`), side ears/arms, and 4 articulated pixel legs (`■ ■ ■ ■`).
- **Series Title**: **Bytes with Bittu ⚡**
- **Top Navigation Bar**: Rounded pill badges (`[Bucket 1]`, `[@byteswithbittu]`).
- **Narrator Voice**: Jarvis-style authoritative, punchy neural voice (`en-US-ChristopherNeural` via `edge-tts` at `+6%` rate with zero-silence trimming).

---

## 2. Mascot Kinematics & Animation Toolkit

Bittu is fully actionable with 6 natural kinematics modes:

1. **4-Leg Alternating Walking Cycle**:
   - Legs 1 & 3 oscillate in opposition to Legs 2 & 4 on a smooth sine cycle (`0.14s` period / ~4 frames @ 30fps).
   - Alternates `scaleY(0.65)` to `scaleY(1.0)` with a subtle **2px natural body bob** across the bottom timeline track.
   - **NO erratic mid-walk jumping**: The timeline mascot remains grounded and walks smoothly.
2. **Organic Idle Breathing Pulse**:
   - Subtle `±1.5%` scale breathing pulse over 2.4s while sitting atop editorial cards.
3. **Single Parabolic Entrance Hop**:
   - When each card enters or on scene emphasis:
     - Frames 0–4: Anticipation squash (`scale(1.15, 0.85)`)
     - Frames 4–12: Parabolic arc jump (`translateY(-26px)` with `scale(0.88, 1.18)`)
     - Frames 12–18: Landing settle & spring recovery (`scale(1.12, 0.88) -> scale(1.0, 1.0)`)
4. **Desk Workstation Typing**:
   - Sits at a wooden desk with typing arm oscillations and eye blinks.
5. **Looking Around & Eye Blinks**:
   - Square black pixel eyes blink every 60 frames (`scaleY(0.1)` for 4 frames).
6. **Contextual Floating Pixel Emotes (`emote`)**:
   - `💡` Floating Pixel Lightbulb (architecture / deep dive)
   - `✨` Floating Pixel Sparkles (benchmarks / capabilities)
   - `🔥` Floating Pixel Fire (hot releases / viral drops)
   - `🏆` Floating Pixel Trophy (pricing / open source / awards)
   - `❗` Floating Pixel Exclamation (intro hook alert)

---

## 3. Screen Layout & Safe Zones (1080 × 1920)

```
+-------------------------------------------------------+
|  [y: 80px]   [Bucket 1]              [@byteswithbittu]|  <- Top Navigation
|                                                       |
|  [y: 180-340px]  EDITORIAL SERIF HEADLINE             |  <- Georgia 700 / Nunito 900
|                                                       |
|  [y: 460-1260px]  HERO STAGE ZONE                     |
|    - Scene 1: Wooden Desk Workstation + CRT Monitor   |
|    - Scenes 2-6: Deckled Torn-Paper Spec Cards        |
|                                                       |
|  [y: 1360-1440px]                                     |
|    KINETIC 2-3 WORD CAPTIONS (SLIDE UP IN / BLUR OUT) |  <- 58px font, 10% above, 10% smaller
|                                                       |
|  [y: 1780-1840px]                                     |
|    BOTTOM TIMELINE TRACK (Walking Mascot Progress)    |  <- 4-leg walking mascot
+-------------------------------------------------------+
```

---

## 4. CRT Brand Terminal Library

Scene 1 features a retro CRT computer monitor displaying the official terminal screen of the topic's creator or technology:

| Brand Key | Screen Border & Glow | Screen Logo / Graphic | Display Label |
| :--- | :--- | :--- | :--- |
| `anthropic` | Warm Coral (`#D97757`) | Starburst Emblem (`#FDBA74`) | `Claude 3.7 Sonnet` |
| `openai` | Emerald Green (`#10A37F`) | Rosetta Flower Emblem | `OpenAI o3 / 4.5` |
| `deepseek` | Cyan Blue (`#0066FF`) | Blue Whale Emblem | `DeepSeek-R1` |
| `google` | Royal Blue (`#4285F4`) | 4-Point Gemini Sparkle | `Gemini 2.5 Pro` |
| `cursor` | Electric Indigo (`#6366F1`) | Cursor Triangle / Cube | `Cursor Agent` |
| `github` | Dark Slate (`#58A6FF`) | Octocat Silhouette | `GitHub Copilot` |
| `apple` | Clean Silver (`#A1A1AA`) | Apple Silhouette | `Apple Intelligence` |
| `tencent` | Tencent Blue (`#0052D9`) | Blue Hexagon Chevron | `Tencent HY4` |
| `huggingface`| Gold Yellow (`#FFD21E`) | Hug Emoji Face | `Hugging Face Hub` |
| `terminal` | Phosphor Green (`#22C55E`)| `>_ root@alpha` Prompt | `Linux Bash CLI` |

---

## 5. Universal 6-Scene Script & Card Taxonomy

Every topic is broken down into 6 punchy, high-retention scenes:

1. **Scene 1: Hook Intro (`intro-workstation`)**:
   - Spoken Hook: *"Stop scrolling! [Company] just dropped [Model/Tool]."*
   - Visual: Wooden desk + CRT monitor with the corresponding `crtBrand` screen + typing mascot.
2. **Scene 2: Architecture / Deep Dive (`editorial-card`)**:
   - Tab: `[ARCHITECTURE]`, Emote: `lightbulb`
   - 4-item technical breakdown (engine, parameter count, routers, active compute).
3. **Scene 3: Benchmark / Capacity (`editorial-card`)**:
   - Tab: `[BENCHMARK]` or `[CAPACITY]`, Emote: `sparkle`
   - 4-item performance metrics (SWE-bench %, context window, needle accuracy).
4. **Scene 4: Practical Workflows (`editorial-card`)**:
   - Tab: `[WORKFLOWS]`, Emote: `sparkle`
   - 4-item agentic integration (IDE support, CLI autonomy, code refactoring, 3D).
5. **Scene 5: Pricing / Open Source (`editorial-card`)**:
   - Tab: `[PRICING]` or `[OPEN SOURCE]`, Emote: `trophy`
   - 4-item accessibility specs (API price comparison, free weights, safetensors).
6. **Scene 6: Community Call-to-Action (`cta-card`)**:
   - Tab: `[GET ACCESS]` or `[GET SETUP]`, Emote: `trophy`
   - Spoken CTA: *"Comment [KEYWORD] for [Setup Guide / System Prompt]!"*

---

## 6. Audio Silence Removal, Breathing Space & Caption Sync Pipeline

1. **Synthesize Narration with Word Boundaries (`edge-tts`)**:
   - Uses `scripts/generate_edge_speech.py` with `boundary="WordBoundary"` to extract millisecond word timestamps directly from the TTS engine.
2. **Trim Leading & Trailing Dead Pause**:
   - Trims silence before first word (`word[0].start - 0.05s`) and after last word (`word[n].end + 0.08s`).
   - Offsets all word timestamps so words remain synchronized to the audio.
3. **Add Sentence Breathing Space**:
   - Adds **0.30s – 0.35s (~10 frames @ 30fps)** audio silence padding (`apad=pad_dur=0.32`) at the end of each scene clip.
   - Allows the card animation to settle and gives the viewer breathing room before the next point.

---

## 7. Editorial Typography System & Font Combinations

The typography pipeline strictly pairs **modern bold tech sans** (`Inter Black`, `Impact`) with **editorial literary italics** (`Apple Garamond Light Italic`). Script fonts (e.g. Aston Script) are avoided.

### A. Allowed Font Families
1. **Inter Black (900)**: Primary modern sans punch for titles and standard caption words.
2. **Impact**: Ultra-condensed heavy punch for title keywords.
3. **Apple Garamond Light Italic**: Elegant editorial italic for highlight words and title accents.
*(Note: Script / cursive fonts like Aston Script are excluded).*

### B. Eliminating Font "Markers" & Contour Overlap Artifacts
> [!IMPORTANT]
> **NEVER use `-webkit-text-stroke` on variable fonts like Inter.**
> Variable font TrueType outlines use overlapping glyph components for compression (e.g. stem + bowl). In Chromium / Remotion, `-webkit-text-stroke` strokes each individual component, creating ugly internal vertical lines, notches, and "markers" inside letters (D, R, P, O, B).
> 
> **Solution**: Use pure outer multi-directional `text-shadow` outline (`cleanOutlineShadow`):
> ```css
> text-shadow:
>   -2px -2px 0 #000,  2px -2px 0 #000,
>   -2px  2px 0 #000,  2px  2px 0 #000,
>   -3px  0px 0 #000,  3px  0px 0 #000,
>    0px -3px 0 #000,  0px  3px 0 #000,
>    0 12px 28px rgba(0, 0, 0, 0.95),
>    0 4px 8px rgba(0, 0, 0, 0.85);
> ```
> This creates a 100% solid letter interior with crisp outer definition and zero internal artifacts.

### C. Title Hierarchy (Scene 1 Headline & Card Titles)
- **Primary Words**: **Impact** or **Inter Black (900)** (`uppercase`, tight letter spacing `-1px` to `-2px`).
- **Editorial Accent Words**: **Apple Garamond Light Italic** (`fontStyle: 'italic'`, `fontWeight: 400`, warm coral `#D97757` or brand accent).
- **Scene 1 Headline Example**: `CLAUDE 3.7` (Impact) + *Just Changed AI Forever!* (Apple Garamond Light Italic).
- **Card Title Examples**:
  - `HYBRID` (Inter Black) + *Reasoning* (Apple Garamond Light Italic)
  - `SWE-BENCH` (Inter Black) + *King* (Apple Garamond Light Italic)
  - `770B` (Impact) + *MoE Engine* (Apple Garamond Light Italic)
- **Top Tab Badges**: Inter Black (900) uppercase with `1px` letter spacing.

### D. Kinetic Captions (Lower-Third Subtitles)
- **Base Spoken Words**: **Inter Black** (`fontWeight: 900`, pure white `#FFFFFF` with `cleanOutlineShadow`).
- **Highlight Spoken Words**: **Apple Garamond Light Italic** (`fontStyle: 'italic'`, `fontWeight: 500`, in **Gold Yellow `#FBBF24`**).
- **Motion Animation**:
  - **Slide Up on IN**: Springs up by `28px` (`translateY(28px) -> 0px`) with snappy damping.
  - **Blur on OUT**: Over the final 5 frames of the phrase chunk, smoothly blurs out (`filter: blur(12px)`) and fades (`opacity: 1 -> 0`).
- **Screen Boundary Containment (Zero Overflow Rule)**:
  - Captions use responsive adaptive sizing (`getAdaptiveCaptionSize(text)`):
    - `text.length > 32` $\rightarrow$ `36px`
    - `text.length > 24` $\rightarrow$ `42px`
    - `text.length > 18` $\rightarrow$ `46px`
    - `text.length > 13` $\rightarrow$ `50px`
    - Standard $\rightarrow$ `54px`
  - Centered flexbox wrap container (`maxWidth: "92%"`, `width: "92%"`, `margin: "0 auto"`). Text **NEVER** clips or spills outside the 1080px canvas on any screen.

---

## 8. How to Render Any Video (CLI)

Use the built-in multi-topic generator CLI:

```bash
# Render baseline topic (Tencent HY4)
npx tsx scripts/render-8bit-reel.ts --preset tencent-hy4

# Render new topic (Claude 3.7 Sonnet)
npx tsx scripts/render-8bit-reel.ts --preset claude-3-7
```

Outputs will be rendered directly to `public/renders/8bit-<preset>.mp4` at **1080 × 1920 @ 30fps**.
