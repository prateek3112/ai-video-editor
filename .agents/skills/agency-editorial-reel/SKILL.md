---
name: agency-editorial-reel
description: >-
  Production-grade architecture, visual language, kinetic typography, and animation pipeline for creating high-retention Agency Editorial & Mark Soy tech explainer reels. Features a 6-state narrative flow, full-screen speaker punch-in zooms, audio-synced brand reveals, signature card-over-speaker arched split screens, 4-tier splitting color bars, chessboard matrices, 3D document fan stacks, and motion-blurred 2-to-3 word captions strictly using White/Yellow Inter 900 and Apple Garamond Bold Italic.
---

# High-Retention Agency Editorial Tech Reel Skill Guide
*The definitive production standard for viral Mark Soy / Agency tech explainer reels*

This skill documents the complete design system, layout geometry, animation physics, typography rules, audio pipeline, and engine code for producing broadcast-ready vertical reels (1080x1920) that achieve maximum viewer retention on Instagram Reels, TikTok, and YouTube Shorts.

---

## 1. Visual DNA & Aesthetic Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE DESIGN PILLARS                             │
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
| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#F8F9FA` | Warm technical paper background with subtle 40px dot grid |
| **Primary Text** | `#FFFFFF` | Monolithic headline words, body phrases, and flow captions |
| **Highlight Accent** | `#FFE500` / `#FDE047` | Golden yellow for high-stress keywords (`AI MODEL`, `UNLIMITED OCR`) |
| **Dark Monochrome** | `#111827` / `#000000` | Slabs, text shadows, and dark card elements |
| **Brand Accent Red** | `#E11D48` | Animated SVG circle marker loop and CTA trigger buttons |
| **Gobo Daylight Shadow**| `rgba(17, 24, 39, 0.08)` | Organic ambient window/tree silhouette drifting across paper |

---

## 2. The 6-State Narrative Flow & Timeline

Every reel follows this exact 6-state pacing architecture to maintain visual freshness every 3–6 seconds:

```
[0:00 - ~0:09] STATE 1: FULL-SCREEN SPEAKER HOOK
               • Edge-to-edge 1080x1920 video with zero borders or top bars
               • Camera punch-ins: 1.05x (base) → 1.18x (hook) → 1.26x (climax)
               • Lower-third captions: Top 78% (keeping chest and mic clear)
      ↓
[~0:09 - ~0:15] STATE 2: FULL-SCREEN VISUAL & HERO DEMO
               • Brand Reveal: Pops on screen at the EXACT second the name is spoken
               • Animated hand-drawn red SVG circle loop encircling the brand name
               • Apple-Style B-Roll: Dark macOS browser window embedding live screen demo
      ↓
[~0:15 - ~0:23] STATE 3: SIGNATURE CARD-OVER-SPEAKER SPLIT-SCREEN
               • Top 50%: Floating white card (width: 952px, height: 870px, top: 140px)
                 - 4-Tier Splitting Bars: Colors turn black & split horizontally (±160px)
                 - Local vs Cloud comparison: Cloud cross-out vs On-device laptop box
               • Bottom 44%: Arched Speaker Container (border-radius: 52px 52px 0 0)
                 - Framing: object-position: center 74%, scale: 1.12 (face & mic centered)
      ↓
[~0:23 - ~0:29] STATE 4: FULL-SCREEN VISUAL DEEP-DIVE (CHESSBOARD MATRIX)
               • Zero Subscriptions piano-key matrix ($0 API Bills, Free Forever, Offline)
               • Speaker fades out gracefully so full-screen graphic shines
      ↓
[~0:29 - ~0:33] STATE 5: SIGNATURE SPLIT-SCREEN (DOCUMENT FAN STACK)
               • Top 50%: 3D Document Fan-Out Stack (Research Papers, Reports, Contracts)
               • Bottom 44%: Arched Speaker Container (framing face and hands)
      ↓
[~0:33 - End]   STATE 6: ALL-SPEAKER ON CTA (FULL SCREEN)
               • Direct-to-camera punch-in (1.16x)
               • Pulsing ManyChat-style CTA button: 💬 COMMENT "KEYWORD" FOR SETUP ➔
```

---

## 3. Typography & Caption Engine Specifications

### A. Font Pairing Rules
1. **`Inter 900`**: Heavy sans-serif used for hook pre-headers, hero title keywords, and uppercase flow captions.
2. **`Apple Garamond Bold Italic`** (`EB Garamond Bold Italic`): Luxury editorial serif italic used for descriptive hook lines, italic highlight words, and brand titles.

### B. Crisp Solid Stroke Formula (No Wireframe Glitches)
Never apply `-webkit-text-stroke` without `paint-order: stroke fill`. Standard glyphs like `A`, `D`, `O`, `R` will suffer from hollow internal counterspace artifacts if the stroke encroaches on the fill.

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

### C. Motion Physics: Slide-Up Entrance + Exit Motion Blur
Captions animate 2-to-3 words at a time with subtle entrance spring and high-velocity exit blur:
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
When using timeline libraries like GSAP, never allow `fromTo` calls on `#speaker-container` to default to `immediateRender: true`, as this leaks future `y: 80` or `border-radius: 52px` back to frame 0.
Always set:
```javascript
tl.set('#speaker-container', {
  top: 0, left: 0, width: 1080, height: 1920,
  borderRadius: '0px', border: 'none', boxShadow: 'none', opacity: 1, zIndex: 20
}, 0);

// On subsequent state transitions:
tl.fromTo('#speaker-container',
  { y: 80, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.8)', immediateRender: false },
  splitTime
);
```

### B. Split-Screen Speaker Framing
In 9:16 vertical video, the speaker's face is usually at $Y \approx 50\% - 65\%$ while the top $40\%$ is empty wall and ceiling fan. When clipping into an arched container ($880\text{px}$ high):
- Set `object-position: center 74%` and `scale: 1.12`.
- This pulls the footage up, perfectly framing the speaker's eyes, smile, microphone, and hand gestures.

### C. Audio-Synced Brand Reveal
Never trigger the brand visual early. Calculate silence intervals or exact word timestamps (e.g. *"Iska naam hai..."*), keeping the speaker on screen until the exact second the product name is pronounced.

---

## 5. HyperFrames Implementation Recipe

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <script src="./gsap.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,700&family=Inter:wght@900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }

    #stage {
      position: relative;
      width: 1080px; height: 1920px;
      overflow: hidden; background: #F8F9FA;
      font-family: 'Inter', sans-serif;
    }

    #speaker-container {
      position: absolute;
      top: 0; left: 0; width: 1080px; height: 1920px;
      overflow: hidden; z-index: 20;
    }
    #speaker-video {
      width: 100%; height: 100%;
      object-fit: cover; object-position: center 46%;
    }

    #top-split-card {
      position: absolute;
      top: 140px; left: 50%; transform: translateX(-50%);
      width: 952px; height: 870px;
      border-radius: 44px; background: #FFFFFF;
      box-shadow: 0 30px 80px rgba(0,0,0,0.14);
      display: none; opacity: 0; z-index: 30;
    }
  </style>
</head>
<body>
  <div id="stage" data-composition-id="agency-reel" data-width="1080" data-height="1920">
    <div id="speaker-container">
      <video id="speaker-video" src="./assets/speaker.mp4" muted playsinline></video>
    </div>
    <div id="top-split-card"></div>
    <div id="caption-corridor"></div>
  </div>

  <script>
    var tl = gsap.timeline({ paused: true });

    // Scrub continuous video node
    tl.to('#speaker-video', { currentTime: 36.15, ease: 'none', duration: 36.15 }, 0);

    // Camera punch-in
    tl.to('#speaker-video', { scale: 1.18, duration: 0.35, ease: 'back.out(2)' }, 2.5);

    // Arched split-screen entrance with pulled-up framing
    tl.set('#speaker-container', {
      top: 1040, left: '50%', xPercent: -50, width: 952, height: 880,
      borderRadius: '52px 52px 0 0', border: '3px solid rgba(255,255,255,0.9)',
      boxShadow: '0 -25px 60px rgba(0,0,0,0.18)', opacity: 1, zIndex: 35
    }, 15.0);

    tl.set('#speaker-video', { scale: 1.12, objectPosition: 'center 74%' }, 15.0);

    window.__timelines['agency-reel'] = tl;
  </script>
</body>
</html>
```

---

## 6. Master Production Checklist

- [ ] **Zero Top White Bars**: Verify frame 0.0s is full-bleed with no leaky container transforms or borders.
- [ ] **No Cluttered Top Badges**: Keep the top 200px clean and uncluttered.
- [ ] **Audio-Synced Reveal**: Trigger brand title and red SVG marker loop at the exact syllable of the name reveal.
- [ ] **Strict Two-Color Palette**: Only White (`#FFFFFF`) and Golden Yellow (`#FFE500`).
- [ ] **Strict Two-Font System**: Only `Inter 900` and `Apple Garamond Bold Italic`.
- [ ] **Solid Letter Outlines**: `paint-order: stroke fill` with `2.5px` black stroke to prevent hollow letter cutouts.
- [ ] **Zero Horizontal Overflow**: Captions limited to 2–3 words per cue with `max-width: 840px`.
- [ ] **Face-Centered Split-Screen**: Set `object-position: center 74%` so the speaker's face and microphone are prominent.
- [ ] **Clean Dialogue Audio**: Normalized voice with zero intrusive sound effects.
