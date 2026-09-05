# Apple Minimalist Video Editing Style Guide (Reference: ref.mp4)

This document specifies the exact editing formula, visual layout, typography rules, and motion curves from the reference edit `ref.mp4`.

## 1. Aesthetic DNA
- **Theme**: Minimalist Apple / Linear aesthetic.
- **Background**: Clean solid White/Off-white (`#FFFFFF` / `#FAFAFA`) or Midnight Dark (`#0A0A0C`).
- **Typography Hierarchy**:
  - Key Power Words: High-contrast **Editorial Serif Italic** (`Georgia`, `Playfair Display`, `Times New Roman` with `fontStyle: 'italic'`, `fontWeight: 900`).
  - Standard Bridge Words: Clean modern **Sans-Serif** (`Inter`, `SF Pro Display`, `Montserrat` with `fontWeight: 700`).
  - Color: Pitch Black `#000000` on white backgrounds, Crisp White `#FFFFFF` on dark backgrounds.

## 2. Layout Structure
- **Signature Split-Screen**:
  - Top Half: Floating UI / Device Mockup / 3D Card with soft drop shadow (`0 24px 60px rgba(0,0,0,0.09)`).
  - Center Gap: Monoline 1-word caption centered in the ribbon between visual and speaker (`top: 50%`).
  - Bottom Half: Speaker in a sleek **rounded arched card** anchored to the bottom (`border-radius: 48px 48px 0 0`).
- **Full Screen Speaker Cuts**:
  - Full screen with spring camera punch-in on conversational hooks.
- **Full Screen Visual Deep-Dives**:
  - Clean device / document showcase with animated highlight pen strokes over key lines.

## 3. Motion & Transitions
- Spring physics: `damping: 14, stiffness: 180, mass: 0.38`.
- Rhythmic cuts and sound effects on every card reveal.
- Safe top gap (>290px) to prevent Instagram Reel header cropping.
