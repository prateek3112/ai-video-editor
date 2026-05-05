# CaptionAI — Product Requirements Document
### Version 1.0 | April 2026 | @theautomationguy.ai

---

## 1. Executive Summary

CaptionAI is a web-based video captioning and subtitle editor targeting Indian content creators, with first-class support for **English and Hinglish**. It replicates and improves upon the core caption generation and styling features of **Captions.ai** and **VEED.io**, built entirely on free/open-source tooling and the **Gemini API** — with zero dependence on paid ASR providers.

The core insight: Captions.ai costs $9.99–$69.99/month, VEED costs $12–$24/month. CaptionAI goes freemium with a generous free tier, monetizing via one-time exports and a Pro plan — owning the underserved Hinglish creator market.

---

## 2. Problem Statement

Indian content creators (Reels, Shorts, TikTok-adjacent formats) face three friction points:

- **Global tools ignore Hinglish.** Tools like Captions.ai and VEED treat Hindi-English code-switching as noise, producing broken, embarrassing transcripts.
- **Pricing is exclusionary.** $10–$25/month is a significant ask for a creator earning in INR.
- **Style variety is locked behind paywalls.** The animated caption templates (word-by-word, karaoke, Hormozi-style) that drive viral engagement require Pro subscriptions.

---

## 3. Goals

- Match 100% of Captions.ai's caption generation and styling feature surface
- Match 100% of VEED.io's subtitle editor feature surface
- Add Hinglish as a first-class language with accurate transliteration
- Build on Gemini API + open-source stack with zero paid ASR dependency
- Ship a working MVP in 6–8 weeks as a solo developer

---

## 4. Non-Goals (v1)

- AI video generation / AI Twin / AI Dubbing (v2 roadmap)
- Mobile native app (web-first, mobile-responsive)
- Real-time/live captioning
- Team collaboration or multi-user workspaces

---

## 5. Target Users

| Segment | Profile | Pain Point |
|---|---|---|
| **Primary** | Indian Instagram/YouTube Shorts creators, 10K–500K followers | Captions.ai is expensive; VEED breaks on Hinglish |
| **Secondary** | Micro-influencers, coaches, educators making talking-head content | Need animated captions fast, no editing skills |
| **Tertiary** | Brands and agencies producing regional content | Need Hinglish accuracy + export at scale |

---

## 6. Tech Stack

| Layer | Tool | Why |
|---|---|---|
| **Frontend** | React + Tailwind CSS | Fast, component-based, great for editor UI |
| **Video Player** | Fabric.js + Video.js | Canvas-based caption rendering over video |
| **ASR / Transcription** | **Gemini 2.0 Flash** via Gemini API | Free tier, audio input support, Hinglish-aware |
| **Word Timestamps** | Gemini structured output (JSON with word-level timing) | No Whisper needed |
| **Video Processing** | **FFmpeg.wasm** (in-browser) | Extract audio, burn captions, no server needed |
| **Caption Rendering** | Canvas API / Fabric.js | Pixel-perfect animated caption styles |
| **Export** | FFmpeg.wasm for MP4 burn-in | Client-side, no upload size limits |
| **Backend (optional)** | Node.js + Express on Render (free tier) | Proxy Gemini API key, user auth |
| **Auth** | Firebase Auth (free tier) | Google sign-in, project management |
| **Storage** | Firebase Firestore + Storage (free tier) | Save projects, style presets |

---

## 7. Core Features

### 7.1 Upload & Ingest

- Drag-and-drop or file picker: MP4, MOV, WebM, MKV
- Max file size: 500MB (client-side FFmpeg.wasm handles locally)
- Audio extraction via FFmpeg.wasm before sending to Gemini
- Progress indicator with processing stages: Extracting audio → Transcribing → Generating captions

### 7.2 AI Transcription (Gemini-powered)

**How it works:**
1. FFmpeg.wasm extracts audio → WAV/MP3
2. Audio sent to Gemini 2.0 Flash with a structured prompt requesting word-level timestamps
3. Gemini returns JSON: `[{ word: "bhai", start: 1.2, end: 1.5, confidence: 0.97 }, ...]`
4. Words are grouped into caption segments (2–5 words, natural phrase breaks)

**Prompt engineering for Hinglish:**
```
Transcribe this audio accurately. The speaker may mix Hindi and English (Hinglish).
For Hindi words spoken in English script (e.g. "bhai", "yaar", "kya", "toh"), 
keep the Romanized spelling as spoken. Return a JSON array with each word, 
its start time (seconds), end time, and confidence score.
```

**Languages supported (v1):**
- English
- Hinglish (Hindi-English code-switch, Devanagari-optional)
- Hindi (Devanagari script)

**Accuracy features:**
- Low-confidence word highlighting (shown in yellow in editor, like VEED)
- One-click manual correction: click any word to edit
- Merge/split caption segments

### 7.3 Caption Style Engine

This is the core differentiator. CaptionAI ships **20+ caption styles** matching and extending Captions.ai and VEED's template library.

#### Style Categories

**Static Styles**
| Style Name | Description | Inspired By |
|---|---|---|
| Classic | Simple line-by-line white text, black outline | VEED Classic |
| Bold White | All-caps, large, high-contrast | Captions.ai default |
| Dark Box | Text on dark pill/rectangle background | VEED Box |
| Outline Only | White text with thick stroke, no background | Captions.ai Outline |
| Minimal | Small lowercase, centered, no background | Aesthetic/minimal |

**Animated Styles (word-by-word)**
| Style Name | Animation | Inspired By |
|---|---|---|
| **Hormozi** | Each word flashes on screen one at a time, bold | Alex Hormozi / Captions.ai |
| **Karaoke** | Full line shown, active word changes color | VEED Karaoke / Captions.ai |
| **Karaoke Box** | Active word gets box highlight | VEED Box Highlight |
| **Word Pop** | Each word scales up (1.0→1.2) then settles | Captions.ai Pop |
| **Word Fade** | Each word fades in from 0 opacity | Smooth/educational |
| **Bounce** | Words drop in with slight bounce easing | Playful/youth |
| **Typewriter** | Characters appear letter by letter per word | Tutorial content |
| **Neon Glow** | Active word glows with colored aura | Gaming/nightlife |
| **Gradient Reveal** | Words revealed with gradient sweep | Lifestyle/fitness |
| **Wave** | Words animate in left-to-right wave | Music/entertainment |

**Emphasis Styles**
| Feature | Description |
|---|---|
| Keyword Highlight | AI or manual selection of key words — auto-colored differently |
| Speaker Color | Different color per detected speaker |
| Emoji Injection | Gemini suggests relevant emoji after key phrases |

#### Style Customization Panel (per style)

Every style exposes the following controls — mirroring VEED's subtitle editor exactly:

- **Font family**: 15+ fonts (Montserrat, Anton, Bebas Neue, Poppins, Inter, etc.)
- **Font size**: Slider 12px–120px
- **Font weight**: Regular / Bold / ExtraBold
- **Text color**: Color picker + opacity
- **Stroke/outline**: Color + width (0–20px)
- **Background**: None / Pill / Rectangle / Full-width bar
- **Background color + opacity**
- **Active word color** (for animated styles)
- **Active word background** (box/pill highlight)
- **Text shadow**: Color + X/Y offset + blur
- **Letter spacing**
- **Line height**
- **Capitalization**: Normal / ALL CAPS / Title Case
- **Position**: Vertical slider (top / center / bottom) + horizontal alignment
- **Max words per line**: 1–8 words
- **Animation speed**: Slow / Normal / Fast

### 7.4 Timeline / Subtitle Editor

Inspired by VEED's subtitle editor panel:

- **Left panel**: Scrollable list of caption segments with timestamps
- **Right panel**: Style controls
- **Bottom**: Video timeline with caption blocks (draggable to adjust timing)
- **Video preview**: Real-time canvas rendering of captions over video

**Editing capabilities:**
- Click any segment to edit text inline
- Drag segment edges to adjust start/end time
- Split segment at cursor (S key shortcut)
- Merge two adjacent segments (M key shortcut)
- Add new manual segment
- Delete segment
- Shift all timings by X seconds (global offset)
- Search and replace across all captions
- Undo/Redo (Ctrl+Z / Ctrl+Y)

### 7.5 Hinglish-Specific Features

These are CaptionAI's market differentiators vs Captions.ai and VEED:

- **Script toggle per segment**: Switch any segment between Devanagari and Roman Hinglish
- **Auto-transliteration**: Gemini-powered — "yaar kya kar raha hai" ↔ "यार क्या कर रहा है"
- **Hinglish dictionary**: Common slang preserved correctly (bhai, yaar, bilkul, acha, etc.)
- **Mixed script rendering**: Hindi words in one font weight, English in another (optional)

### 7.6 Export

**Export options:**

| Format | Description |
|---|---|
| **MP4 with burned-in captions** | Captions permanently embedded — primary export |
| **SRT file** | Standard subtitle file for YouTube, external editors |
| **VTT file** | Web standard, for HTML5 players |
| **TXT transcript** | Plain text of all captions |

**Export quality:**
- 720p, 1080p, 4K passthrough
- Original video quality preserved (no re-encode of video stream, only caption overlay added)
- Aspect ratio presets: 9:16 (Reels/Shorts), 16:9 (YouTube), 1:1 (Square), 4:5 (Feed)

---

## 8. User Flows

### 8.1 Primary Flow: Upload → Auto-caption → Style → Export

```
Landing Page
    ↓
Upload Video (drag/drop)
    ↓
Processing Screen (audio extract → Gemini transcription)
    ↓
Caption Editor
    ├── Preview Panel (left): Video with live caption overlay
    ├── Style Panel (right): Template picker + customization
    └── Timeline (bottom): Segment list + timeline scrubber
    ↓
Choose Export Format
    ↓
Download / Share
```

### 8.2 Secondary Flow: Manual Edit

After auto-transcription, user can:
- Click any word to correct it
- Click yellow (low-confidence) words first
- Adjust timing by dragging on timeline
- Add or delete segments

---

## 9. UI/UX Design Principles

Matching the design quality of Captions.ai and VEED exactly:

- **Dark mode first**: Dark editor canvas (#0F0F0F background), like Captions.ai
- **3-panel layout**: Left = video preview, Center = timeline/segments, Right = style controls
- **Live preview**: Every style change reflects on video in real-time (< 100ms)
- **Template picker**: Visual grid of style thumbnails (not text list) — exactly like Captions.ai's template carousel
- **Snap-to-beat** (v2): Future feature for music videos
- **Mobile responsive**: Works on tablet; upload/style/export usable on phone
- **Keyboard shortcuts**: Professional-grade (J/K/L for playback, S to split, etc.)

---

## 10. Freemium Pricing Model

| Feature | Free | Pro (₹299/mo) |
|---|---|---|
| Videos per month | 3 | Unlimited |
| Max video length | 5 min | 60 min |
| Caption styles | 5 basic | All 20+ |
| Export MP4 | Watermark | No watermark |
| Export SRT/VTT | No | Yes |
| Hinglish mode | Yes | Yes |
| Custom font upload | No | Yes |
| Saved style presets | 1 | Unlimited |
| Priority processing | No | Yes |

**One-time purchase alternative**: ₹99 per export (no subscription) — appeals to casual creators.

---

## 11. Gemini API Integration — Technical Details

### Transcription Prompt (Structured Output)

```javascript
const prompt = `
You are a transcription engine. Transcribe the following audio precisely.
The speaker may use Hinglish (Hindi-English code-switching).
Preserve Romanized Hindi words exactly as spoken (e.g. bhai, yaar, kya, toh, acha, matlab).

Return ONLY a valid JSON array. No explanation. No markdown. Format:
[
  { "word": "string", "start": float, "end": float, "confidence": float },
  ...
]
`;

const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "audio/mp3", data: base64Audio } }] }],
    generationConfig: { response_mime_type: "application/json", temperature: 0 }
  })
});
```

### Word Grouping Algorithm

```javascript
function groupWordsIntoSegments(words, maxWords = 4, maxDuration = 3.0) {
  const segments = [];
  let current = [];
  
  for (const word of words) {
    current.push(word);
    const duration = word.end - current[0].start;
    
    if (current.length >= maxWords || duration >= maxDuration) {
      segments.push({
        text: current.map(w => w.word).join(" "),
        start: current[0].start,
        end: current[current.length - 1].end,
        words: current
      });
      current = [];
    }
  }
  return segments;
}
```

### Caption Rendering Pipeline (Canvas)

```javascript
// For each video frame at time T:
// 1. Find active segment where segment.start <= T <= segment.end
// 2. Find active word within segment where word.start <= T <= word.end
// 3. Draw background pill/rect if enabled
// 4. Draw each word in segment:
//    - activeWord: use activeColor, scale, or highlight box
//    - otherWords: use baseColor
// 5. Apply animation easing based on style
```

---

## 12. Caption Animation Implementation

Each animated style is defined as a config object:

```javascript
const STYLES = {
  karaoke: {
    renderMode: "full-line",         // Show all words in segment at once
    activeWordEffect: "color-swap",   // Active word changes color
    activeColor: "#FFD700",
    baseColor: "#FFFFFF",
    background: "pill",
    animation: "none"
  },
  hormozi: {
    renderMode: "word-by-word",      // Show only active word
    activeWordEffect: "scale",
    scale: 1.3,
    baseColor: "#FFFFFF",
    background: "none",
    textTransform: "uppercase",
    fontWeight: 900,
    animation: "flash"
  },
  wordPop: {
    renderMode: "full-line",
    activeWordEffect: "scale-bounce",
    scaleFrom: 1.0,
    scaleTo: 1.25,
    duration: 80,                    // ms
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)"
  }
  // ... 17 more
};
```

---

## 13. Competitive Differentiation

| Feature | Captions.ai | VEED.io | **CaptionAI** |
|---|---|---|---|
| Hinglish support | ❌ | ❌ | ✅ First-class |
| Free animated styles | ❌ (paid) | ❌ (paid) | ✅ 5 free |
| INR pricing | ❌ USD only | ❌ USD only | ✅ ₹299/mo |
| Client-side processing | ❌ | ❌ | ✅ No upload limit |
| Word-level timestamps | ✅ | ✅ | ✅ via Gemini |
| SRT export free | ❌ | ❌ | ❌ (Pro) |
| Script toggle (Roman↔Devanagari) | ❌ | ❌ | ✅ |
| AI Emoji injection | ❌ | ❌ | ✅ |
| One-time pay per export | ❌ | ❌ | ✅ ₹99 |

---

## 14. MVP Scope (8-Week Roadmap)

### Week 1–2: Foundation
- React app scaffold + Tailwind setup
- FFmpeg.wasm integration (audio extraction)
- Gemini API transcription pipeline
- Word grouping into segments

### Week 3–4: Editor UI
- 3-panel editor layout (video preview, segment list, style panel)
- Canvas-based caption rendering (real-time)
- Basic style controls (font, color, position)
- Timeline scrubber

### Week 5–6: Caption Styles
- 10 animated caption styles (Hormozi, Karaoke, Word Pop, Bounce, Fade, Karaoke Box, Neon Glow, Typewriter, Gradient, Minimal)
- Style template picker (visual grid)
- Per-style customization panel

### Week 7: Hinglish + Polish
- Hinglish transcription tuning (Gemini prompt optimization)
- Script toggle (Roman ↔ Devanagari)
- Low-confidence word highlighting
- Undo/Redo, keyboard shortcuts

### Week 8: Export + Launch
- FFmpeg.wasm burn-in export (MP4)
- SRT/VTT export
- Firebase Auth + project save/load
- Watermark logic (free tier)
- Deploy on Vercel (free)

---

## 15. Success Metrics (3-Month Post-Launch)

| Metric | Target |
|---|---|
| Monthly active users | 2,000 |
| Videos processed per month | 10,000 |
| Free → Pro conversion rate | 5% |
| Hinglish accuracy (user rating) | > 4.0 / 5.0 |
| Export completion rate | > 70% |
| MRR | ₹30,000 (~$360) |

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini API word-timestamp accuracy | Test extensively; fall back to Whisper.js (open-source, runs in browser) |
| FFmpeg.wasm slow on large files | Chunk processing; show progress; offer server-side fallback |
| Hinglish segmentation errors | Build a correction feedback loop; store corrections to improve prompts |
| Captions.ai/VEED copy IP claim | All styles are reimplemented from scratch — visual output is not copyrightable |
| Firebase free tier limits | 1GB storage, 50K reads/day — sufficient for MVP; upgrade if needed |

---

## 17. Future Roadmap (v2+)

- **AI Keyword Highlighter**: Gemini identifies key phrases automatically and applies emphasis style
- **Auto Emoji Mode**: Gemini injects contextual emojis post key phrases
- **B-roll Suggestion**: Gemini describes video segments → suggest stock clips
- **AI Dubbing (Hinglish → Hindi)**: Gemini TTS for translated voiceover
- **Reels Auto-Cutter**: Detect best 30-second clip from longer video
- **Brand Kit**: Save brand colors, fonts, logo watermark position
- **API Access**: Headless caption generation for agencies (B2B tier)
- **Mobile App**: React Native wrapper around the same core engine

---

*Document owner: @theautomationguy.ai | Next review: MVP Week 4 checkpoint*