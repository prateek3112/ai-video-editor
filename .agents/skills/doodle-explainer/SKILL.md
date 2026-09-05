---
name: doodle-explainer
description: >-
  Production-grade hand-drawn doodle animated explainer video pipeline using HyperFrames and vector graphics. Features stick-figure characters, wobbly hand-drawn sketches, speech bubbles, concept props (brains, gears, coins, robots), engineering graph grids, and casual handwritten subtitles.
---

# Hand-Drawn Doodle Explainer Video Pipeline

This document serves as the master reference for generating classic hand-drawn doodle and stick-figure animated explainer videos.

---

## 1. Visual DNA & Art Style
- **Background**: Pure white (`#FFFFFF`) with optional light engineering graph grid or sketch canvas.
- **Line Quality**: Thick hand-drawn imperfect lines with wobbly bezier curves (`3px–4px` stroke), rounded line caps (`stroke-linecap="round"`), and casual sketches.
- **Color Palette**:
  - Outlines: `#1E293B` / `#000000`
  - Accent Color 1 (Energy/Gold): `#E8982A` / `#F59E0B`
  - Accent Color 2 (Tech/Blue): `#4A90D9` / `#2563EB`
  - Accent Color 3 (Alert/Tie): `#CC3333` / `#DC2626`

---

## 2. Character System (Stick Figures)
- **Anatomy**:
  - Head: Circle head with dot eyes and hand-drawn smile/frown/surprised mouth.
  - Body: Vertical stick spine with collar and red tie.
  - Limbs: Segmented arms and legs supporting 8 canonical poses:
    1. `walking`
    2. `pointing`
    3. `arms-spread`
    4. `shrugging`
    5. `holding`
    6. `whispering`
    7. `celebrating`
    8. `thinking`

---

## 3. Prop Library
Hand-drawn vector sketch props:
- Coin Stacks (`drawCoinStack`)
- Speech Bubbles (`drawSpeechBubble`)
- Line / Bar / Pie Charts (`drawLineChart`, `drawPieChart`)
- Doodle Robot, Brain, Gear, Factory, Conveyor Belt, Magnifying Glass, Muscle Arm, Sparkle Marks.

---

## 4. Typography & Subtitles
- **Subtitles**: Bottom-center, handwritten font (`Caveat` or `Patrick Hand`), 28-34px, italic with slight tilt.
- **Headlines**: Casual bold sans (`Nunito` or `Poppins Bold`), 42-52px.
