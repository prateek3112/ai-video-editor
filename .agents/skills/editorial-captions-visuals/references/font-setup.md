# Font Setup & Licensing Guide

Instructions for installing and configuring the typography system for HyperFrames.

---

## 1. Required Font Files

| Font Family | Weight / Style | Role | Source / Download Link |
|---|---|---|---|
| **Acumin Pro Bold** | 700 / Normal | Hook intros, punch words, top headings, depth text | [font.download/font/acumin-pro](https://font.download/font/acumin-pro) |
| **Acumin Pro Regular** | 400 / Normal | Kinetic body captions (rest of video), UI labels | [font.download/font/acumin-pro](https://font.download/font/acumin-pro) |
| **Helvetica Bold** *(Backup)* | 700 / Normal | Fallback for intro hooks and headings | [font.download/font/helvetica-255](https://font.download/font/helvetica-255) |
| **Helvetica Regular** *(Backup)* | 400 / Normal | Fallback for body captions | [font.download/font/helvetica-255](https://font.download/font/helvetica-255) |
| **Georgia Regular** | 400 / Normal | Editorial display headlines (Quiet Editorial UI) | System font / User provided WOFF2 |
| **Georgia Italic** | 400 / Italic | Editorial emphasis words (Quiet Editorial UI) | System font / User provided WOFF2 |
| **Inter Regular** | 400 / Normal | Secondary interface copy, metadata | Bundled SIL Open Font |
| **Inter Bold** | 700 / Normal | Uppercase tracked kickers, badges, buttons | Bundled SIL Open Font |

---

## 2. Recommended Directory Structure

In your HyperFrames project or composition directory:

```
public/
└── fonts/
    ├── AcuminPro-Bold.woff2       (or .otf / .ttf)
    ├── AcuminPro-Regular.woff2    (or .otf / .ttf)
    ├── Helvetica-Bold.woff2
    ├── Helvetica-Regular.woff2
    ├── Georgia-Regular.woff2
    ├── Georgia-Italic.woff2
    ├── Inter-400-latin.woff2
    └── Inter-700-latin.woff2
```

---

## 3. CSS `@font-face` Declarations

Include these in your composition's `<style>` block:

```css
/* --- Acumin Pro --- */
@font-face {
  font-family: "Acumin Pro";
  src: url("fonts/AcuminPro-Regular.woff2") format("woff2"),
       url("fonts/AcuminPro-Regular.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Acumin Pro";
  src: url("fonts/AcuminPro-Bold.woff2") format("woff2"),
       url("fonts/AcuminPro-Bold.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* --- Helvetica Backup --- */
@font-face {
  font-family: "Helvetica Fallback";
  src: url("fonts/Helvetica-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Helvetica Fallback";
  src: url("fonts/Helvetica-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
}

/* --- Fallback Font Stacks --- */
:root {
  --font-display-hook: "Acumin Pro", "Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body-caption: "Acumin Pro", "Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-editorial-serif: "Georgia", "Georgia QEUI", Times, serif;
  --font-interface-ui: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}
```

---

## 4. Preflight Check

Before initiating an MP4 render via `npx hyperframes render`:
1. Verify the composition loads the webfonts without triggering FOIT (Flash of Invisible Text) or layout shift.
2. In local environments where `.woff2` files are pending licensing, the system font stack `-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif` guarantees clean visual previewing.
