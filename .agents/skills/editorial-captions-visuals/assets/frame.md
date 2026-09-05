---
version: 1
name: Quiet Editorial Visuals & Kinetic Captions
description: >
  High-retention editorial aesthetic combining Abigail Daniella's Acumin Pro / Helvetica
  captions and hook headings with Quiet Editorial UI's warm surfaces and software precision.
unit: frame
principle: one clear idea · disciplined sans hierarchy · operational editorial precision

colors:
  canvas: "#F7F7F6"
  ink: "#0D0D0D"
  text-secondary: "#6B6B6B"
  border: "#D9D9D6"
  surface-quiet: "#F5F5F3"
  surface-active: "#FFFFFF"
  accent-yellow: "#FFE600"
  success: "#10A37F"
  success-deep: "#0C8066"
  shadow-soft: "rgba(0,0,0,0.06)"
  shadow-raised: "rgba(0,0,0,0.12)"

typography:
  hook-xl:
    fontFamily: "'Acumin Pro', 'Helvetica Neue', Helvetica, sans-serif"
    weight: 700
    cqw: 10.5
    lineHeight: 0.95
    tracking: "-0.03em"
    color: ink
  hook-glow:
    fontFamily: "'Acumin Pro', 'Helvetica Neue', Helvetica, sans-serif"
    weight: 700
    cqw: 8.8
    lineHeight: 1.0
    tracking: "-0.02em"
    glow: "drop-shadow(0 0 20px rgba(255,255,255,0.85))"
    color: "#FFFFFF"
  caption-body:
    fontFamily: "'Acumin Pro', 'Helvetica Neue', Helvetica, sans-serif"
    weight: 400
    pxAt1080: 62
    minPxAt1080: 52
    lineHeight: 1.1
    color: "#FFFFFF"
  caption-card:
    fontFamily: "'Acumin Pro', 'Helvetica Neue', Helvetica, sans-serif"
    weight: 400
    pxAt1080: 58
    color: ink
    backgroundColor: "rgba(247, 247, 246, 0.94)"
    border: "2px solid #D9D9D6"
  editorial-display:
    fontFamily: "'Georgia', serif"
    style: italic
    weight: 400
    cqw: 8.4
    lineHeight: 0.95
    tracking: "-0.04em"
    color: ink
  kicker:
    fontFamily: "'Inter', sans-serif"
    weight: 700
    cqw: 1.8
    lineHeight: 1.1
    tracking: "0.16em"
    upper: true
    color: ink

spacing:
  edge-portrait: "8.33cqw"
  edge-landscape: "5cqw"
  edge-square: "6.67cqw"
  gap-xs: "1.1cqw"
  gap-sm: "2.2cqw"
  gap-md: "3.7cqw"
  gap-lg: "6cqw"

components:
  framed-video:
    backgroundColor: "{colors.canvas}"
    inset: "5cqw"
    rounded: "2.2cqw"
    shadow: "0 1.8cqw 4.5cqw {colors.shadow-raised}"
  document-card:
    backgroundColor: "{colors.surface-active}"
    border: "0.185cqw solid {colors.border}"
    rounded: "1.8cqw"
    shadow: "0 1.5cqw 3.8cqw {colors.shadow-soft}"
  inspector-window:
    backgroundColor: "{colors.surface-active}"
    toolbar: "{colors.surface-quiet}"
    divider: "0.12cqw solid {colors.border}"
    border: "0.185cqw solid {colors.border}"
    rounded: "2.2cqw"
  kicker-rule:
    backgroundColor: "{colors.ink}"
    size: "3.8cqw × 0.185cqw"
  social-proof-mockup:
    backgroundColor: "{colors.surface-active}"
    border: "0.185cqw solid {colors.border}"
    rounded: "2.2cqw"
    shadow: "0 2cqw 5cqw {colors.shadow-raised}"
  progress-rail:
    rail: "0.185cqw solid {colors.border}"
    active: "{colors.ink}"
    complete: "{colors.success}"
---

# Quiet Editorial Visuals & Kinetic Captions Spec

## Overview
A high-retention HyperFrames design spec combining the crisp typography of Abigail Daniella's
creator videos with the refined software aesthetics of Quiet Editorial UI.

## Typography
- Use **Acumin Pro Bold** (or **Helvetica Bold**) for hook intros, punch words, top headings, and depth layers.
- Use **Acumin Pro Regular** (or **Helvetica Regular**) for synchronized body captions (1–2 words per cue).
- Use **Georgia Italic** for literary or philosophical emphasis moments.
- Use **Inter 700 Uppercase** with generous tracking for kickers and badges.

## Layout Modes
- **Available-Area**: Anchor editorial headline and card into verified empty space.
- **Direct-Overlay**: Place high-contrast text or warm-white cards over full-bleed footage.
- **Full-Frame**: Warm `#F7F7F6` canvas for graphic-led explainer scenes.
- **Editorial-Framed**: Inset talking-head footage with rounded corners and warm margin.

## Pre-Render Audit
- Captions fit strictly on one single line without line-breaking.
- No text covers the speaker's face, mouth, or eyes.
- Entrances use `power3.out` with subtle physics settle.
- Exits cut decisively with zero lingering ghosts.
- Safe zones respect right-side social buttons (140px) and bottom handle area (360px).
