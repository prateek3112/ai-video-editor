# Acumin Pro & Helvetica Caption & Heading System

Deconstructed from the creator editing style of Abigail Daniella (`caption.mp4`, `@abigaildaniellla`).

> "I've been using this text effect in most of my videos recently, they're attention grabbing which means longer retention... We're going to make talking videos less boring and more engaging."

---

## 1. Core Typography Philosophy

The system uses a strictly disciplined two-weight sans-serif hierarchy:

| Role | Primary Font | Backup / Fallback | Styling & Case |
|---|---|---|---|
| **Intros & Hook Punch Words** | **Acumin Pro Bold** | **Helvetica Bold** | Sentence or Lowercase, Heavy Weight (700/800), Tight Tracking (`-0.02em` to `-0.04em`), High Contrast White or Electric Yellow (`#FFE600`) |
| **Video Headers & Section Titles** | **Acumin Pro Bold** | **Helvetica Bold** | Bold (700), Optional Soft Outer Glow (`drop-shadow(0 0 24px rgba(255,255,255,0.85))`) |
| **Rest of Video (Body Captions)** | **Acumin Pro Regular** | **Helvetica Regular** | Regular Weight (400), Clean Sans, Neutral White (`#FFFFFF`), Crisp Edge, Unboxed or Subtle Card Surface |

### Font Links
- **Acumin Pro**: [https://font.download/font/acumin-pro](https://font.download/font/acumin-pro)
  - `AcuminPro-Bold.woff2` (Intro hooks, titles, punch words)
  - `AcuminPro-Regular.woff2` (Body captions, kinetic speech sync)
- **Helvetica**: [https://font.download/font/helvetica-255](https://font.download/font/helvetica-255)
  - `Helvetica-Bold.woff2`
  - `Helvetica-Regular.woff2`

### Fallback Stack
```css
font-family: "Acumin Pro", "Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
```

---

## 2. The 4 Signature Heading & Hook Styles

### Style A: Top Negative Space Hook (Above the Head)
- **Position**: Upper 12%–18% of the vertical frame (`top: 14%–18%`), positioned directly in the headroom space above the creator.
- **Visuals**: Giant bold text (e.g., `"how"`, `"boring"`, `"head"`).
- **Scale**: `92px–124px` at 1080×1920 (equivalent to `8.5cqw–11.5cqw`).
- **Color**: Pure White (`#FFFFFF`) or Electric Yellow (`#FFE600` / `#FFF500`) for high-energy hooks.
- **Rhythm**: Appears word-by-word or in 1–2 word pulses during the first 3 seconds (0:00–0:04) to instantly hook scrolling viewers.

### Style B: Behind-the-Head Rotoscope / Depth Hook
- **Concept**: The text is sandwiched in 3D z-space between the video background and the foreground cutout of the speaker (`frame_024.png`: `"How"` layered behind headphones and hair).
- **Layering Order**:
  1. `z-index: 1`: Background video / Room plate
  2. `z-index: 2`: Acumin Pro Bold depth text (`font-size: 140px–180px`, white, uppercase/titlecase)
  3. `z-index: 3`: Foreground subject cutout (rotoscoped video or transparent WebM/PNG cutout)
  4. `z-index: 4`: Foreground UI / Kicker elements
- **Impact**: Creates physical dimensionality, cementing the speaker inside a high-production studio environment.

### Style C: Outer Glow Header
- **Visuals**: Used for list items, numbered tips, or major topic announcements (e.g. `frame_027.png`: `"5 engaging"`).
- **Glow Filter**:
  ```css
  filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 32px rgba(255, 255, 255, 0.4));
  ```
- **Structure**: Number is prominent (`font-size: 120px`), followed by bold topic name (`font-size: 88px`).

### Style D: Inset Framed Letterbox Video
- **Visuals**: Talking-head video is placed inside a clean card container with a generous white/warm-cream border (`padding: 40px–60px` or `inset: 60px 48px`).
- **Effect**: Transforms standard mobile phone selfie video into a sleek, editorial magazine aesthetic (`frame_002`, `frame_012`, `frame_024`, `frame_027`).

---

## 3. Kinetic Body Captions (Rest of Video)

### Cadence & Phrase Chunking
- **Chunk Size**: **1 to 2 words per cue** (never more than 3 words).
- **Duration**: `0.18s to 0.42s` per cue, closely tracking spoken syllable velocity.
- **Single Line Only**: Captions strictly occupy ONE line. Never wrap to a second line.
- **Punctuation**: Strip terminal periods and commas from on-screen display text, but use them to mark cue boundaries and natural breath pauses.

### Positioning & Safe Zone
- **Primary Lane**: Chest / mid-torso level (`top: 52%–58%` in 9:16) when the speaker is in medium close-up. This keeps text close to the speaker's face without colliding with chin, mouth, or microphone.
- **Secondary Lane**: Lower safe third (`top: 70%–76%`) for wide shots, b-roll, or full-body movement.
- **Horizontal Alignment**: Perfectly centered (`text-align: center`, `left: 50%`, `transform: translateX(-50%)`).

### Surface Treatments
1. **Clean Mode (`SURFACE_MODE = "clean"`)**:
   - Pure text with high contrast against speaker's clothing or room.
   - Text color: `#FFFFFF` (on dark/medium backgrounds) or `#0D0D0D` (on bright backgrounds).
   - Subtle contrast shadow: `text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);`
2. **Card Mode (`SURFACE_MODE = "card"`)**:
   - For bright, busy, or moving backgrounds.
   - Container: `background: rgba(247, 247, 246, 0.94); border: 2px solid #D9D9D6; border-radius: 16px; padding: 14px 24px; color: #0D0D0D;`
   - Shadow: `box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);`

---

## 4. GSAP Animation Choreography

```javascript
// Snappy pop-in entrance with micro-scale & vertical settle
timeline.fromTo(
  cueEl,
  { opacity: 0, y: 14, scale: 0.96 },
  { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power3.out" },
  cue.start
);

// Crisp, immediate cut-out exit
timeline.to(
  cueEl,
  { opacity: 0, y: -6, duration: 0.08, ease: "power2.in" },
  cue.end - 0.08
);
```

Hard cue cut ensures zero ghosting or overlapping text across spoken cues.
