# Safe Zones & Collision Avoidance

Critical platform UI safe-zones and subject collision rules for HyperFrames compositions.

---

## 1. 9:16 Vertical Safe Zone (1080 × 1920)

```
0px    +-----------------------------------------------+
       |  TOP PLATFORM EXCLUSION ZONE (0 - 180px)      |  <- Notch, time, stories bar
180px  +-----------------------------------------------+
       |                                               |
       |  TOP HOOK & HEADING ZONE (180 - 460px)        |  <- Acumin Pro Bold Top Hooks
       |  (e.g., "how", "boring", "5 engaging")        |
       |                                               |
460px  +-----------------------------------------------+
       |                                               |
       |  FACE & EYE EXCLUSION CORRIDOR (460 - 980px)  |  <- NEVER place text over
       |  (Medium close-up speaker face)               |     creator's eyes/mouth!
       |                                               |
980px  +-----------------------------------------------+
       |                                       |       |
       |  KINETIC CAPTION LANE (980 - 1280px)  | RIGHT |  <- Primary caption corridor
       |  (Mid-torso / upper chest area)       | ICONS |     (y: 52% - 58%)
       |                                       | ZONE  |     Avoid right 140px!
1280px +---------------------------------------+ (140) |
       |                                       |       |
       |  LOWER STAGE ZONE (1280 - 1560px)     |       |  <- Cards / Kickers / Paths
       |                                       |       |
1560px +-----------------------------------------------+
       |  BOTTOM PLATFORM EXCLUSION (1560 - 1920px)    |  <- Handle, caption, audio track
1920px +-----------------------------------------------+
```

### Key Vertical Bounds (1080 × 1920)
- **Top Header Hook Zone**: `Y: 220px to 380px` (`11.5% to 19.8%` of height)
- **Speaker Face Safe Exclusion**: `Y: 420px to 940px`
- **Kinetic Caption Corridor**: `Y: 1000px to 1180px` (`52% to 61%` of height)
- **Max Caption Safe Width**: `840px` (centered, `left: 120px`, `right: 120px`)
- **Right Platform Rail Exclusion**: Leave at least `140px` margin on the right side for TikTok/Instagram/YouTube Shorts buttons (like, comment, share, remix).
- **Bottom Feed Safe Margin**: `360px` minimum clearance from the absolute bottom (`y: 1560px`).

---

## 2. 16:9 Landscape Safe Zone (1920 × 1080)
- **Left Editorial Split Stage**: `X: 120px to 860px` (holds headlines, document cards, inspector windows)
- **Right Speaker / B-Roll Stage**: `X: 960px to 1800px`
- **Bottom Caption Corridor**: `Y: 820px to 960px`, `maxWidth: 1400px`

---

## 3. 1:1 Square Safe Zone (1080 × 1080)
- **Top Heading Zone**: `Y: 80px to 220px`
- **Center Stage**: `Y: 240px to 820px`
- **Caption Corridor**: `Y: 840px to 960px`, `maxWidth: 880px`

---

## 4. Collision Checklist Before Rendering
1. **Face/Mouth Check**: Did any word land over the speaker's face or mouth? (If yes, shift lane to `top: 56%` or lower third).
2. **Platform UI Check**: Does any card or text touch the right 140px or bottom 360px in 9:16?
3. **Single Line Integrity**: Does the caption fit on one line without wrapping?
4. **Hard Cue Exit**: Does the previous cue completely disappear before the next cue enters?
