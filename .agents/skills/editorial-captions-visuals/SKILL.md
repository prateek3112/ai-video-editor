---
name: editorial-captions-visuals
description: Production-grade HyperFrames skill for high-retention creator visuals and kinetic captions. Fuses Abigail Daniella's viral Acumin Pro & Helvetica caption & hook heading system (deconstructed from caption.mp4) with the Quiet Editorial UI software aesthetic (audrey-560/quiet-editorial-ui). Features 4 signature hook styles (top negative space, behind-head depth rotoscope, glowing headers, framed video letterboxing), 1-2 word rapid kinetic speech sync, warm paper surfaces (#F7F7F6), editorial document cards, inspector windows, social proof mockups, and GSAP motion choreography.
---

# Quiet Editorial Visuals & Acumin Kinetic Captions

This skill provides a complete visual layer and kinetic typography pipeline for **HyperFrames** projects, merging the authentic creator editing formula of **Abigail Daniella** (`caption.mp4`, `@abigaildaniellla`) with the **Quiet Editorial UI** design system.

---

## 1. Quick Start & Execution Contracts

When a user requests captions or editorial visuals for a video or HyperFrames composition:

1. **Resolve the Composition**: Determine target aspect ratio (9:16 portrait `1080×1920`, 16:9 landscape `1920×1080`, or 1:1 square `1080×1080`).
2. **Inspect Negative Space & Faces**:
   - Locate the speaker's face and eyes (never obscure with text).
   - Locate the speaker's mouth and hands (avoid caption collisions during speech).
   - Identify stable headroom above the speaker for top hook headings.
3. **Select Layout Mode**:
   - `available-area`: Anchor editorial cards in unused negative space.
   - `direct-overlay`: Place high-contrast text or warm-white cards over full-bleed footage.
   - `full-frame`: Graphic-owned warm canvas (`#F7F7F6`) for transitions, title screens, or explainer beats.
   - `editorial-framed`: Inset video with rounded corners and warm margin (Abigail Daniella signature).
4. **Apply Typography Hierarchy**:
   - **Acumin Pro Bold** (or **Helvetica Bold** fallback) for intros, punch words, top headings, and depth text.
   - **Acumin Pro Regular** (or **Helvetica Regular** fallback) for body captions (1–2 words per cue, centered at chest level ~`52%–58%` Y).
   - **Georgia Italic** for literary or philosophical emphasis words.
   - **Inter 700 Uppercase** with wide tracking (`0.16em`) for kickers, badges, and interface chrome.
5. **Orchestrate with GSAP**: Snappy `power3.out` pop-in entrances (`0.12s–0.18s`), decisive `power2.in` exits (`0.08s`), and zero overlapping ghost cues.

---

## 2. The Abigail Daniella Caption & Hook Formula

Deconstructed directly from `caption.mp4`:

### A. The 4 Signature Hook Styles
1. **Top Negative Space Hook (Above the Head)**:
   - Placed at `top: 14%–18%` (in the headroom above the speaker).
   - Giant bold text (`96px–120px` at 1080p).
   - Pure White (`#FFFFFF`) or Electric Yellow (`#FFE600`).
   - Syncs to the first 3–4 words of the hook (e.g., *"how"*, *"boring"*, *"engaging"*).
2. **Behind-the-Head Rotoscope / Depth Hook**:
   - Giant bold text (`140px–180px`) placed at `z-index: 2`, behind the subject cutout (`z-index: 3`) and in front of the background (`z-index: 1`).
   - Example: *"How"* layered behind headphones and hair in `caption.mp4`.
3. **Glowing Topic Header**:
   - Used for list items, numbers, or section titles (e.g. *"5 engaging tips"*).
   - Filter: `drop-shadow(0 0 20px rgba(255,255,255,0.85)) drop-shadow(0 0 40px rgba(255,255,255,0.4))`.
4. **Framed Video Letterbox Stage**:
   - Talking-head footage is inset by 4%–6% on each side inside a warm canvas (`#F7F7F6`) container with rounded corners (`28px`).
   - Instantly elevates raw phone footage into an editorial magazine aesthetic.

### B. Kinetic Body Caption Cadence
- **1 to 2 words per cue** (maximum 3 words for short articles like *"to the"*).
- **Duration**: `0.18s to 0.40s` per cue, tracking speech syllable velocity.
- **Positioning**: Mid-torso / chest level (`y: 52%–58%`), strictly on ONE single line.
- **Surface**: Clean unboxed white text with subtle shadow (`text-shadow: 0 2px 14px rgba(0,0,0,0.55)`), or card surface (`rgba(247,247,246,0.94)` with `2px solid #D9D9D6`) on busy footage.

---

## 3. Quiet Editorial UI Design System

Derived from `audrey-560/quiet-editorial-ui`:

### Color Tokens
- `canvas`: `#F7F7F6` (warm paper ground)
- `ink`: `#0D0D0D` (authoritative text, hairlines, borders)
- `text-secondary`: `#6B6B6B` (metadata, kickers, timestamps)
- `border`: `#D9D9D6` (2px container outlines)
- `surface-active`: `#FFFFFF` (document cards, modals)
- `surface-quiet`: `#F5F5F3` (toolbars, pill tabs)
- `success`: `#10A37F` (verified checks, completed steps)
- `accent-yellow`: `#FFE600` (hook emphasis)

### Reusable UI Components
- **Document Card**: `#FFFFFF` card with `2px solid #D9D9D6`, `24px` radius, `0 16px 40px rgba(0,0,0,0.08)` shadow.
- **Kicker with Ink Rule**: `36px × 3px` ink bar + Inter 700 tracked uppercase text.
- **Progress Rail**: Hairline rail with numbered node badges (`✓` for completed in `#10A37F`).
- **Social Proof Mockup**: Interactive Instagram post mockup with view counts (`119K`), likes, and comment threads.
- **Cause-and-Effect Cursor**: Crisp black-and-white pointer that travels to an element, clicks with a scale ripple, and triggers an immediate visual state change.

---

## 4. Fonts & Setup

- **Acumin Pro**: Download at [https://font.download/font/acumin-pro](https://font.download/font/acumin-pro)
  - Bold: Intros, punch words, top headings.
  - Regular: Body captions, kinetic speech sync.
- **Helvetica**: Download at [https://font.download/font/helvetica-255](https://font.download/font/helvetica-255)
  - Direct backup if Acumin Pro is unavailable.
- **System Fallback Stack**:
  ```css
  font-family: "Acumin Pro", "Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
  ```

---

## 5. Directory Map & Included Files

```
.agents/skills/editorial-captions-visuals/
├── SKILL.md                                 <- Master skill entrypoint
├── references/
│   ├── captions-acumin.md                   <- Deep breakdown of Abigail Daniella captions & hooks
│   ├── style-system.md                      <- Quiet Editorial UI tokens & component grammar
│   ├── layout-modes.md                      <- The 4 layout modes & selection guide
│   ├── safe-zones.md                        <- 9:16 portrait, 16:9, and 1:1 safe-zone grids
│   ├── motion-language.md                   <- GSAP easing, timing curves, and cursor choreography
│   └── font-setup.md                        <- Font installation & @font-face setup
├── assets/
│   ├── frame.md                             <- Machine-readable design specification tokens
│   ├── components/
│   │   ├── acumin-kinetic-caption.html      <- Reusable kinetic caption sub-composition
│   │   ├── quiet-editorial-card.html        <- Document cards, kickers & progress rails
│   │   ├── social-proof-mockup.html         <- Instagram post mockup component
│   │   └── editorial-safe-zones.html        <- Visual debug overlay
│   └── examples/
│       └── editorial-reel-golden.html       <- Complete, linted 1080x1920 golden composition
└── scripts/
    ├── preflight.mjs                        <- Composition & font preflight verification
    └── validate-package.mjs                 <- Skill package integrity validator
```

---

## 6. Validation

Validate the skill anytime:

```bash
node .agents/skills/editorial-captions-visuals/scripts/validate-package.mjs .agents/skills/editorial-captions-visuals
```
