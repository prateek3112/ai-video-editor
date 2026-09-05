# Layout Modes & Composition Rules

Select layout mode based on the source footage geometry and subject framing. Never force an ill-fitting layout.

---

## The 4 Core Modes

```
+-------------------+ +-------------------+ +-------------------+ +-------------------+
|  [EDITORIAL TITLE]| |                   | | [EDITORIAL TITLE] | | [TOP HOOK TITLE]  |
|  [DOCUMENT CARD]  | | [DIRECT OVERLAY]  | | [DOCUMENT CARD]   | | +---------------+ |
|                   | | (CARD OR SCRIM)   | | [PROGRESS PATH]   | | | INSET VIDEO   | |
| +---------------+ | |                   | |                   | | |               | |
| | SPEAKER       | | | SPEAKER           | | [SPEAKER CUTOUT]  | | | (SPEAKER)     | |
| +---------------+ | | (FULL BLEED)      | | (OPTIONAL HERO)   | | +---------------+ |
+-------------------+ +-------------------+ +-------------------+ +-------------------+
    Available-Area        Direct-Overlay          Full-Frame           Editorial-Framed
```

---

## 1. Mode Decision Table

| Mode | When to Choose | Visual Strategy | Caption Treatment |
|---|---|---|---|
| **Available-Area** | Creator leaves stable headroom, side space, or lower space untouched | Anchor headline and cards in that verified negative space. Do not touch speaker. | Clean Acumin Pro Regular at chest level or negative space |
| **Direct-Overlay** | Full-bleed footage fills frame, or background is busy / moving | Use localized warm-white card (`rgba(247,247,246,0.94)`) or contrast scrim behind text. | Card mode (`.card`) or unboxed text with deep contrast shadow |
| **Full-Frame** | Dedicated graphic beat, transition, intro hook, or closing CTA | Warm canvas (`#F7F7F6`), literary Georgia display + Acumin Pro UI cards. | Hero typography or centered editorial captions |
| **Editorial-Framed** | Medium/close-up talking-head footage (Abigail Daniella signature) | Inset video by 4%–6% on each side with white/cream border and rounded corners. | Giant Acumin Pro Bold hook above video, kinetic captions centered |

---

## 2. Layout Rules

### Rule 1: One Dominant Idea Per Beat
Every beat must have ONE primary anchor:
- A bold hook question or word
- OR a document card revealing data/insights
- OR a social proof mockup
Never compete for attention with multiple simultaneous complex cards.

### Rule 2: Safe Negative Space Inspection
Before placing graphics:
1. Inspect early, middle, and late frames of the beat.
2. Mark:
   - Creator face and eyes (never obscure)
   - Creator mouth and gestures (never cover during talking segments)
   - Brand logos or physical objects (microphones, props)
3. Reserve the kinetic caption corridor (52%–58% Y in 9:16 portrait).

### Rule 3: Spatial Continuity
When transitioning between layout modes (e.g. from `Editorial-Framed` to `Full-Frame`):
- Maintain smooth camera/scale transitions (e.g., video container gently expands to full-bleed or fades to warm canvas over 0.35s).
- Keep caption lane persistent so the viewer's eye does not jump erratically.
