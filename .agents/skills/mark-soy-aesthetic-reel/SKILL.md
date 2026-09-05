---
name: mark-soy-aesthetic-reel
description: >-
  Production-grade architecture, visual language, kinetic typography, and animation pipeline for creating high-retention Mark Soy editorial comparison reels based on the exact deconstruction of ref.mp4 ("People only root for others at two times..."). Covers the S-curved F1 racetrack, horizontal velocity motion blur transitions, 4-tier colorful splitting redaction bars ("Master the Middle"), alternating black/white chessboard slabs, brutalist 8-point starbursts, animated SVG red marker loops, photorealistic daylight window gobo shadows, signature card-over-speaker layouts, and multi-font typography (Inter 900 and Apple Garamond Bold Italic in pure White and Yellow). Supports both HyperFrames and Remotion.
---

# Mark Soy Aesthetic Editorial Reel Style Guide & Engine Architecture
*Based on the exact frame-by-frame deconstruction of `ref.mp4` ("$5 EDIT vs MY EDIT")*

This skill documents the exact visual language, mathematical animation physics, layout geometry, typography rules, and dual-engine architecture (HyperFrames & Remotion) for producing broadcast-quality, high-retention viral editorial reels in the signature **Mark Soy / High-Ticket Agency** aesthetic.

---

## 1. Aesthetic DNA & Visual Philosophy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE AESTHETIC PILLARS                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. 6-STATE NARRATIVE RHYTHM: Pacing alternates seamlessly between      │
│    Full-Screen Speaker, Full Visual Deep-Dives, and Arched Splits.     │
│ 2. STRICT 2-FONT SYSTEM: Inter 900 (Bold Sans) + Apple Garamond        │
│    Bold Italic (Editorial Elegance).                                   │
│ 3. 2-COLOR TYPOGRAPHY DISCIPLINE: Strictly Pure White (#FFFFFF) and    │
│    Golden Yellow (#FFE500) for all text and highlight words.           │
│ 4. CRUNCHY SOLID OUTLINES: paint-order: stroke fill with 2.5px black   │
│    stroke and multi-layer drop shadows (never hollow wireframes).      │
│ 5. SNAPPY 2-3 WORD CAPTIONS: Lower-third placement (top: 78%) with     │
│    slide-up entrance and exit motion blur; zero horizontal overflow.   │
│ 6. SPEAKER ELEVATION IN SPLIT-SCREEN: Pulled UP (center 74%) so face,  │
│    eyes, mic, and gestures are centered instead of empty walls/fans.   │
│ 7. AUDIO PURITY: Crystal-clear normalized voiceover; zero sound fx.    │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Palette & Visual Tokens
| Token Name | Hex Code | Visual Meaning & Role |
| :--- | :--- | :--- |
| **Canvas Background** | `#FDFDFB` / `#F8F9FA` | Warm technical paper background with subtle 40px dot or square grid |
| **Monochrome Deep** | `#111827` / `#000000` | High-contrast text, brutalist starbursts, and redaction slabs |
| **Primary Text** | `#FFFFFF` | Monolithic headline words, body phrases, and flow captions |
| **Highlight Yellow** | `#FFE500` / `#FDE047` | Golden yellow for high-stress keywords |
| **Annotation Crimson** | `#E11D48` / `#DC2626` | Hand-drawn SVG marker loops, red underline strokes |
| **Bar 1: Sunset Amber** | `#F59E0B` / `#FBBF24` | Top horizontal bar in the 4-tier matrix |
| **Bar 2: Hot Coral Pink**| `#F43F5E` / `#E11D48` | Second horizontal bar in the 4-tier matrix |
| **Bar 3: Mint Cyan** | `#06B6D4` / `#0EA5E9` | Third horizontal bar in the 4-tier matrix |
| **Bar 4: Midnight Navy** | `#0F172A` / `#1E293B` | Bottom horizontal bar in the 4-tier matrix |
| **Gobo Daylight Shadow**| `rgba(17, 24, 39, 0.08)` | Organic daylight tree/window silhouette floating across canvas |

---

## 2. Complete Timeline & Frame-by-Frame Deconstruction of `ref.mp4`

Total Duration: **21.96 seconds** | Frame Rate: **25 / 30 fps**

```
[0.00s - 1.80s] SCENE 1: HOOK + DUAL-FONT SCRIPT ("at two times")
      ↓
[1.80s - 3.80s] SCENE 2: S-CURVE F1 RACETRACK & GRID CARS ("first, when they're at the beginning of the race")
      ↓
[3.80s - 6.20s] SCENE 3: DIRECTIONAL VELOCITY BLUR + CHECKERED FLAG & 8-POINT STAR ("second, when they finish")
      ↓
[6.20s - 7.50s] SCENE 4: CORNER STARBURSTS + MINIMALIST FOCUS ("neither is when you need it")
      ↓
[7.50s - 12.80s] SCENE 5: 4-COLOR SPLITTING BARS ("master the middle... boring, exhausting, soul crushing middle")
      ↓
[12.80s - 14.50s] SCENE 6: ALTERNATING CHESSBOARD SLABS ("that's where the winning happens on your own")
      ↓
[14.50s - 17.50s] SCENE 7: SPEAKER PUNCH-IN + DUAL-FONT CADENCE ("cheer for you as long as you can't beat them")
      ↓
[17.50s - 21.96s] SCENE 8: MINIMALIST DAYLIGHT GOBO EPILOGUE ("Friendly Reminder... it's a bug not a feature")
```

---

## 3. Typography & Caption Engine Specifications

### A. Font Pairing Rules
1. **`Inter 900`**: Heavy modern sans-serif for pre-headers, main title keywords, and uppercase flow captions.
2. **`Apple Garamond Bold Italic`** (`EB Garamond Bold Italic`): Luxury editorial serif italic for descriptive lines, italic highlight words, and brand titles.

### B. Crisp Solid Stroke Formula (No Wireframe Glitches)
```css
/* Authentic High-Contrast Caption Typography */
.caption-phrase {
  font-family: 'Inter', -apple-system, sans-serif;
  font-weight: 900;
  font-size: 48px;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.2;
  paint-order: stroke fill;
  -webkit-text-stroke: 2.5px #000000;
  text-shadow: 0 3px 0 #000000, 0 8px 24px rgba(0, 0, 0, 0.95);
  max-width: 840px;
  margin: 0 auto;
  text-align: center;
}

/* Yellow Keyword Highlight */
.caption-phrase .hl-yellow {
  color: #FFE500;
  paint-order: stroke fill;
  -webkit-text-stroke: 2.5px #000000;
  text-shadow: 0 0 24px rgba(255, 229, 0, 0.95), 0 4px 16px rgba(0, 0, 0, 0.95);
  padding: 0 4px;
}

/* Apple Garamond Bold Italic Highlight */
.caption-phrase .hl-garamond {
  font-family: 'Apple Garamond', 'EB Garamond', Garamond, serif;
  font-style: italic;
  font-weight: 700;
  text-transform: none;
  color: #FFE500;
  font-size: 58px;
  letter-spacing: 0.01em;
  paint-order: stroke fill;
  -webkit-text-stroke: 1.5px #000000;
  text-shadow: 0 0 24px rgba(255, 229, 0, 0.95), 0 4px 16px rgba(0, 0, 0, 0.95);
  padding: 0 6px;
}
```

### C. Motion Physics: Slide-Up In + Exit Motion Blur
```javascript
var exitDuration = 0.12;
var exitStart = Math.max(c.start + 0.15, c.end - exitDuration);

// Slide-up entrance
tl.set(selector, { display: 'block', y: 22, opacity: 0, filter: 'blur(0px)' }, c.start);
tl.to(selector, { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' }, c.start);

// Motion blur exit
tl.to(selector, {
  y: -12,
  opacity: 0,
  filter: 'blur(8px)',
  duration: exitDuration,
  ease: 'power2.in'
}, exitStart);

tl.set(selector, { display: 'none' }, c.end);
```

---

## 4. Camera & Layout Geometry

### A. Preventing Initial White Bar / Gap Leaks
```javascript
tl.set('#speaker-container', {
  top: 0, left: 0, width: 1080, height: 1920,
  borderRadius: '0px', border: 'none', boxShadow: 'none', opacity: 1, zIndex: 20
}, 0);

tl.fromTo('#speaker-container',
  { y: 80, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.8)', immediateRender: false },
  splitTime
);
```

### B. Split-Screen Speaker Framing
```javascript
tl.set('#speaker-container', {
  top: 1040, left: '50%', xPercent: -50, width: 952, height: 880,
  borderRadius: '52px 52px 0 0', border: '3px solid rgba(255,255,255,0.9)',
  boxShadow: '0 -25px 60px rgba(0,0,0,0.18)', opacity: 1, zIndex: 35
}, splitTime);

tl.set('#speaker-video-element', { scale: 1.12, objectPosition: 'center 74%' }, splitTime);
```

---

## 5. Master Production Checklist

- [ ] **Zero Top White Bars**: Verify frame 0.0s is full-bleed with no leaky container transforms or borders.
- [ ] **No Cluttered Top Badges**: Keep the top 200px clean and uncluttered.
- [ ] **Audio-Synced Reveal**: Trigger brand title and red SVG marker loop at the exact syllable of the name reveal.
- [ ] **Strict Two-Color Palette**: Only White (`#FFFFFF`) and Golden Yellow (`#FFE500`).
- [ ] **Strict Two-Font System**: Only `Inter 900` and `Apple Garamond Bold Italic`.
- [ ] **Solid Letter Outlines**: `paint-order: stroke fill` with `2.5px` black stroke to prevent hollow letter cutouts.
- [ ] **Zero Horizontal Overflow**: Captions limited to 2–3 words per cue with `max-width: 840px`.
- [ ] **Face-Centered Split-Screen**: Set `object-position: center 74%` so the speaker's face and microphone are prominent.
- [ ] **Clean Dialogue Audio**: Normalized voice with zero intrusive sound effects.
