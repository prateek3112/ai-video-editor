# Style System & Design Grammar

Fusing the refined literary software look of **Quiet Editorial UI** with **Abigail Daniella's high-retention video aesthetic**.

---

## 1. Identity & Philosophy

The style combines **literary editorial typography** (Georgia serif & Acumin Pro sans) with **clean software-interface precision** (warm paper-like surfaces, hairline borders, soft elevation, and cause-and-effect state changes).

It is designed to make talking-head videos, tech explainers, and creator reels feel **understated, authoritative, premium, and calm**—the antithesis of chaotic, screaming MrBeast-style editing.

---

## 2. Color Palette & Semantics

| Token | Value | Semantic Role |
|---|---|---|
| `canvas` | `#F7F7F6` | Warm cream/paper ground for graphic scenes and letterbox backdrops |
| `ink` | `#0D0D0D` | Primary text, high-contrast hook text, deep rules, active borders |
| `text-secondary` | `#6B6B6B` | Metadata, subtitles, timestamps, supporting copy |
| `border` | `#D9D9D6` | Subtle 2px container outlines, dividers, and card rails |
| `surface-quiet` | `#F5F5F3` | Toolbars, pill containers, table headers, inactive tabs |
| `surface-active` | `#FFFFFF` | Document cards, inspector modals, foreground surfaces |
| `accent-yellow` | `#FFE600` | High-energy hook keyword accent (Abigail Daniella signature) |
| `success` | `#10A37F` | Verified status, completion marks, confirmation pills |
| `shadow-soft` | `rgba(0, 0, 0, 0.06)` | Ambient elevation for cards and letterboxed frames |
| `shadow-raised` | `rgba(0, 0, 0, 0.12)` | Focused card, active modal, or floating pill shadow |

---

## 3. Typography Grammar

```
Display Hook (Acumin Pro Bold / Georgia Serif)  [92px - 140px]
├── Editorial Kicker (Inter 700 Uppercase + Ink Rule) [18px - 22px]
├── Body Narration / Kinetic Captions (Acumin Pro Regular) [54px - 72px]
└── Micro Metadata / Handles / Verified Pills (Inter 400/600) [16px - 20px]
```

### Display Typography Rules
1. **Acumin Pro Bold**: Use for punchy hook intros, giant numbers, and depth text.
2. **Georgia Italic**: Use for literary or editorial emphasis words (max 1 italic word per beat).
3. **Acumin Pro Regular / Inter**: Use for continuous kinetic caption reading and UI interface elements.
4. **Tracking**:
   - Display headlines: Tight tracking (`-0.03em` to `-0.05em`).
   - Labels / Kickers: Generous tracking (`0.12em` to `0.18em`) with `text-transform: uppercase`.

---

## 4. Surfaces & Containers

### Document Card
- Surface: `#FFFFFF`
- Border: `2px solid #D9D9D6` (or `0.185cqw`)
- Radius: `16px` to `24px` (`1.5cqw` to `2.2cqw`)
- Shadow: `0 16px 40px rgba(0, 0, 0, 0.08)`
- Padding: `24px 32px`

### Inspector Window
- Header toolbar: `#F5F5F3` with three muted window dots (`10px` circles, `#D1D1CE`)
- Hairline divider: `1px solid #D9D9D6`
- Body area: `#FFFFFF`

### Kicker Rule
- A solid ink accent bar (`size: 42px x 3px`, background `#0D0D0D`) placed immediately above or alongside tracked uppercase kickers.

### Framed Video Letterbox Stage
- Outer Canvas: `#F7F7F6` or pure `#FFFFFF`
- Inset Footage: Scaled to ~`88%–92%` of screen width, centered with `border-radius: 20px`, enclosed by clean white/cream border.
- Headroom: Provides clean negative space for giant Acumin Pro Bold titles above the speaker.

### Social Proof Post Mockup Card
- Clean replica of modern social post (as seen in `frame_018.png` of Abigail Daniella's video):
  - Post header with avatar, username (`@abigaildaniellla`), follow badge
  - Metric ribbon: View counts (`119K • View insights`), engagement counts (Likes, Comments, Shares)
  - Comment bubble highlight with real user query (e.g., `"Font?"`) and author reply.
