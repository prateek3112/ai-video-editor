import { renderCaptionWord } from "./subtitle-utils";
import type { CaptionClip, EditPlan, TimelineClip } from "./edit-plan";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/\n/g, " ");
}

function clipEnd(clip: TimelineClip): number {
  return Number((clip.start + clip.duration).toFixed(3));
}

function hyperframesAssetPath(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  return src.startsWith("/") ? `../..${src}` : src;
}

function toPercent(value: number | undefined, fallback: number): string {
  const safe = Number.isFinite(value) ? Number(value) : fallback;
  return `${Math.min(95, Math.max(5, safe * 100)).toFixed(3)}%`;
}

function captionText(plan: EditPlan, clip: CaptionClip): string {
  return clip.text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => renderCaptionWord(word, plan.settings.language, clip.script, plan.settings.defaultScript))
    .join(" ");
}

function compileVideoClip(clip: TimelineClip): string {
  if (clip.type !== "video") return "";

  const mediaStart = clip.mediaStart ? ` data-media-start="${clip.mediaStart}"` : "";
  const volume = typeof clip.volume === "number" ? ` data-volume="${clip.volume}"` : "";
  const src = hyperframesAssetPath(clip.src);
  return [
    `    <video id="${escapeAttr(clip.id)}" class="clip video-layer" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="0" data-has-audio="true"${mediaStart} src="${escapeAttr(src)}" muted playsinline></video>`,
    `    <audio id="${escapeAttr(clip.id)}-audio" class="clip source-audio" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="1"${mediaStart}${volume} src="${escapeAttr(src)}"></audio>`,
  ].join("\n");
}

function compileCaptionClip(plan: EditPlan, clip: TimelineClip): string {
  if (clip.type !== "caption") return "";

  const words = clip.text.split(/\s+/).filter(Boolean).map((word) =>
    renderCaptionWord(word, plan.settings.language, clip.script, plan.settings.defaultScript)
  );
  const wordCount = words.length;
  const wordDuration = wordCount > 0 ? clip.duration / wordCount : clip.duration;

  const x = toPercent(plan.settings.positionX, plan.settings.positionX);
  const y = toPercent(plan.settings.positionY, plan.settings.positionY);
  const lowConfidence = typeof clip.confidence === "number" && clip.confidence < 0.76 ? " low-confidence" : "";
  const highlightWords = clip.highlightWords?.length ? ` data-highlight-words="${escapeAttr(clip.highlightWords.join(","))}"` : "";

  const wordSpans = words.map((word, idx) => {
    const wordStart = (clip.start + idx * wordDuration).toFixed(3);
    const wordEnd = (clip.start + (idx + 1) * wordDuration).toFixed(3);
    return `<span class="caption-word" data-start="${wordStart}" data-end="${wordEnd}">${escapeHtml(word)}</span>`;
  }).join(" ");

  return [
    `    <div id="${escapeAttr(clip.id)}" class="clip caption caption-${escapeAttr(plan.settings.animation)} style-${escapeAttr(plan.settings.style)} effect-${escapeAttr(plan.settings.effectPreset)}${lowConfidence}" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="4"${highlightWords} style="left:${x}; top:${y};">`,
    `      <div class="caption-inner">${wordSpans}</div>`,
    "    </div>",
  ].join("\n");
}

function compileOverlayClip(clip: TimelineClip): string {
  if (clip.type !== "overlay") return "";

  const x = toPercent(clip.positionX, 0.5);
  const y = toPercent(clip.positionY, 0.5);
  const opacity = typeof clip.opacity === "number" ? clip.opacity : 1;
  const scale = typeof clip.scale === "number" ? clip.scale : 1;

  if (clip.src) {
    return `    <img id="${escapeAttr(clip.id)}" class="clip overlay overlay-${escapeAttr(clip.kind)}" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="5" src="${escapeAttr(hyperframesAssetPath(clip.src))}" style="left:${x}; top:${y}; opacity:${opacity}; transform:translate(-50%, -50%) scale(${scale});" />`;
  }

  return [
    `    <div id="${escapeAttr(clip.id)}" class="clip overlay overlay-${escapeAttr(clip.kind)}" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="5" style="left:${x}; top:${y}; opacity:${opacity}; transform:translate(-50%, -50%) scale(${scale});">`,
    `      ${escapeHtml(clip.text ?? "")}`,
    "    </div>",
  ].join("\n");
}

function compileVisualGlyphs(motif: TimelineClip & { type: "script-visual" }): string[] {
  const scene = motif.scene;
  const keywordCount = Math.max(1, scene.keywords.length);
  const rhythm = scene.keywords.map((keyword, index) => {
    const weight = Math.min(88, Math.max(22, keyword.length * 8 + index * 12));
    return `      <div class="visual-data-node node-${index + 1}" style="--node-size:${weight}px; --node-lift:${12 + index * 13}%;"></div>`;
  });

  if (scene.motif === "growth") {
    return [
      '      <div class="graphic growth-chart">',
      '        <div class="growth-axis"></div>',
      '        <div class="growth-line"></div>',
      '        <div class="growth-point point-a"></div>',
      '        <div class="growth-point point-b"></div>',
      '        <div class="growth-point point-c"></div>',
      '        <div class="growth-arrow"></div>',
      "      </div>",
      ...rhythm,
    ];
  }

  if (scene.motif === "money") {
    return [
      '      <div class="graphic money-stack">',
      '        <div class="coin coin-a"></div>',
      '        <div class="coin coin-b"></div>',
      '        <div class="coin coin-c"></div>',
      '        <div class="coin-symbol"></div>',
      "      </div>",
      ...rhythm.slice(0, Math.min(3, keywordCount)),
    ];
  }

  if (scene.motif === "warning") {
    return [
      '      <div class="graphic warning-system">',
      '        <div class="warning-triangle"></div>',
      '        <div class="warning-bar bar-a"></div>',
      '        <div class="warning-bar bar-b"></div>',
      '        <div class="warning-pulse"></div>',
      "      </div>",
      ...rhythm,
    ];
  }

  if (scene.motif === "tech") {
    return [
      '      <div class="graphic circuit-board">',
      '        <div class="chip-core"></div>',
      '        <div class="circuit-line line-a"></div>',
      '        <div class="circuit-line line-b"></div>',
      '        <div class="circuit-line line-c"></div>',
      '        <div class="circuit-dot dot-a"></div>',
      '        <div class="circuit-dot dot-b"></div>',
      '        <div class="circuit-dot dot-c"></div>',
      "      </div>",
      ...rhythm,
    ];
  }

  if (scene.motif === "people") {
    return [
      '      <div class="graphic people-map">',
      '        <div class="avatar avatar-a"></div>',
      '        <div class="avatar avatar-b"></div>',
      '        <div class="avatar avatar-c"></div>',
      '        <div class="avatar-link link-a"></div>',
      '        <div class="avatar-link link-b"></div>',
      '        <div class="avatar-link link-c"></div>',
      "      </div>",
      ...rhythm,
    ];
  }

  if (scene.motif === "idea") {
    return [
      '      <div class="graphic idea-bulb">',
      '        <div class="bulb-glass"></div>',
      '        <div class="bulb-base"></div>',
      '        <div class="spark spark-a"></div>',
      '        <div class="spark spark-b"></div>',
      '        <div class="spark spark-c"></div>',
      "      </div>",
      ...rhythm,
    ];
  }

  return [
    '      <div class="graphic storyboard-grid">',
    '        <div class="frame frame-a"></div>',
    '        <div class="frame frame-b"></div>',
    '        <div class="frame frame-c"></div>',
    '        <div class="frame frame-d"></div>',
    "      </div>",
    ...rhythm,
  ];
}

function compileScriptVisualClip(clip: TimelineClip): string {
  if (clip.type !== "script-visual") return "";

  const scene = clip.scene;
  const keywordData = scene.keywords.length ? ` data-keywords="${escapeAttr(scene.keywords.join(","))}"` : "";
  const ariaLabel = `${scene.motif} visual for ${scene.title}`;

  return [
    `    <section id="${escapeAttr(clip.id)}" class="clip script-visual layout-${escapeAttr(scene.layout)} motif-${escapeAttr(scene.motif)}" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="2"${keywordData} aria-label="${escapeAttr(ariaLabel)}" style="--bg:${escapeAttr(scene.palette.background)}; --accent:${escapeAttr(scene.palette.accent)}; --secondary:${escapeAttr(scene.palette.secondary)};">`,
    '      <div class="visual-grid"></div>',
    '      <div class="visual-orbit"></div>',
    scene.mediaUrl
      ? scene.mediaType === "video"
        ? `      <video class="visual-media" src="${escapeAttr(hyperframesAssetPath(scene.mediaUrl))}" muted loop playsinline></video>`
        : `      <img class="visual-media" src="${escapeAttr(hyperframesAssetPath(scene.mediaUrl))}" alt="" />`
      : "",
    scene.mediaUrl ? '      <div class="visual-media-shade"></div>' : "",
    '      <div class="visual-copy">',
    `        <div class="visual-eyebrow">${escapeHtml(scene.eyebrow)}</div>`,
    `        <div class="visual-title">${escapeHtml(scene.title)}</div>`,
    `        <div class="visual-subtitle">${escapeHtml(scene.subtitle)}</div>`,
    scene.callout ? `        <div class="visual-callout">${escapeHtml(scene.callout)}</div>` : "",
    '      </div>',
    ...compileVisualGlyphs(clip),
    scene.mediaCredit ? `      <div class="visual-credit">${escapeHtml(scene.mediaCredit)}</div>` : "",
    "    </section>",
  ].join("\n");
}

function compileAudioClip(clip: TimelineClip): string {
  if (clip.type !== "audio" && clip.type !== "sfx") return "";

  const mediaStart = clip.mediaStart ? ` data-media-start="${clip.mediaStart}"` : "";
  return `    <audio id="${escapeAttr(clip.id)}" class="clip ${clip.type}" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="3" data-volume="${clip.volume}"${mediaStart} src="${escapeAttr(hyperframesAssetPath(clip.src))}"></audio>`;
}

function compileTransitionClip(clip: TimelineClip): string {
  if (clip.type !== "transition") return "";

  return `    <div id="${escapeAttr(clip.id)}" class="clip transition transition-${escapeAttr(clip.transition)}" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="6"></div>`;
}

function compileClip(plan: EditPlan, clip: TimelineClip): string {
  return (
    compileVideoClip(clip) ||
    compileCaptionClip(plan, clip) ||
    compileOverlayClip(clip) ||
    compileScriptVisualClip(clip) ||
    compileAudioClip(clip) ||
    compileTransitionClip(clip)
  );
}

function compileStyles(plan: EditPlan): string {
  const settings = plan.settings;
  const fontSize = Math.round(76 * Math.min(2.4, Math.max(0.1, settings.fontScale || 1)));
  const textShadow =
    settings.effectPreset === "none"
      ? "none"
      : settings.effectPreset === "glow"
        ? `0 0 18px ${settings.activeWordColor}, 0 0 40px ${settings.activeWordColor}`
        : `0 5px 18px rgba(0,0,0,${Math.min(0.9, Math.max(0.1, settings.shadowStrength))})`;
  const strokeWidth = Math.max(0, settings.strokeWidth);
  const backgroundOpacity = Math.min(1, Math.max(0, settings.backgroundOpacity));

  return `
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: transparent;
      font-family: ${settings.fontFamily}, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #stage {
      position: relative;
      width: ${plan.width}px;
      height: ${plan.height}px;
      overflow: hidden;
      background: #000;
    }

    .clip {
      position: absolute;
    }

    .video-layer {
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .caption {
      z-index: 40;
      max-width: 86%;
      transform: translate(-50%, -50%);
      color: ${settings.textColor};
      opacity: ${settings.textOpacity};
      font-size: ${fontSize}px;
      font-weight: ${settings.fontWeight};
      line-height: ${settings.lineHeight};
      letter-spacing: ${settings.letterSpacing}px;
      text-align: center;
      text-transform: ${settings.capitalization === "uppercase" ? "uppercase" : "none"};
      text-shadow: ${textShadow};
      -webkit-text-stroke: ${strokeWidth}px ${settings.strokeColor};
    }

    .script-visual {
      z-index: 20;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
      color: #fff;
      background:
        radial-gradient(circle at 72% 24%, color-mix(in srgb, var(--accent) 44%, transparent), transparent 34%),
        radial-gradient(circle at 16% 78%, color-mix(in srgb, var(--secondary) 28%, transparent), transparent 32%),
        linear-gradient(135deg, var(--bg), #050505);
    }

    .layout-speaker { display: none; }
    .layout-split { height: 50%; }
    .layout-overlay { left: 7%; top: 6%; width: 86%; height: 36%; border-radius: 34px; }

    .visual-copy {
      position: absolute;
      z-index: 8;
      left: 8%;
      top: 16%;
      max-width: 66%;
      text-transform: uppercase;
    }

    .visual-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .72; }
    .visual-media-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.86), rgba(0,0,0,.18)); }
    .visual-credit { position: absolute; z-index: 10; right: 22px; bottom: 16px; color: rgba(255,255,255,.62); font-size: 16px; font-weight: 650; }

    .visual-eyebrow { color: var(--accent); font-size: 28px; font-weight: 900; letter-spacing: 4px; }
    .visual-title { margin-top: 18px; font-size: 94px; line-height: .92; letter-spacing: -4px; font-weight: 950; }
    .visual-subtitle { margin-top: 24px; color: rgba(255,255,255,.72); font-size: 32px; line-height: 1.18; font-weight: 650; text-transform: none; }
    .visual-callout { display: inline-block; margin-top: 26px; padding: 12px 18px; background: white; color: black; font-size: 28px; font-weight: 950; transform: rotate(-2deg); }
    .layout-overlay .visual-copy { top: 18%; max-width: 62%; }
    .layout-overlay .visual-title { font-size: 58px; }
    .layout-overlay .visual-subtitle { display: none; }
    .layout-split .visual-title { font-size: 68px; }
    .layout-split .visual-subtitle { font-size: 25px; }

    .script-visual::after {
      content: "";
      position: absolute;
      inset: 42px;
      border: 2px solid color-mix(in srgb, var(--accent) 36%, transparent);
      pointer-events: none;
    }

    .visual-grid {
      position: absolute;
      inset: 0;
      opacity: 0.22;
      background-image:
        linear-gradient(color-mix(in srgb, var(--secondary) 34%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--secondary) 34%, transparent) 1px, transparent 1px);
      background-size: 72px 72px;
      transform: perspective(700px) rotateX(58deg) translateY(140px);
      transform-origin: bottom;
    }

    .visual-orbit {
      position: absolute;
      right: 78px;
      top: 82px;
      width: 260px;
      height: 260px;
      border: 22px solid color-mix(in srgb, var(--accent) 72%, transparent);
      border-left-color: transparent;
      border-radius: 999px;
      filter: drop-shadow(0 0 24px color-mix(in srgb, var(--accent) 42%, transparent));
    }

    .graphic {
      position: absolute;
      inset: 9% 8% 10%;
      filter: drop-shadow(0 24px 46px rgba(0,0,0,0.32));
    }

    .graphic div,
    .visual-data-node {
      position: absolute;
      box-sizing: border-box;
    }

    .visual-data-node {
      right: calc(8% + var(--node-lift));
      bottom: calc(7% + var(--node-lift) / 2);
      width: var(--node-size);
      height: var(--node-size);
      border: 3px solid color-mix(in srgb, var(--secondary) 72%, transparent);
      border-radius: 999px;
      opacity: 0.42;
      transform: translateY(calc(var(--node-lift) * -0.4));
    }

    .node-2 {
      right: auto;
      left: 16%;
      bottom: 14%;
    }

    .node-3 {
      right: 24%;
      top: 18%;
      bottom: auto;
    }

    .growth-chart {
      inset: 18% 12% 16%;
    }

    .growth-axis {
      left: 4%;
      bottom: 10%;
      width: 76%;
      height: 52%;
      border-left: 5px solid color-mix(in srgb, var(--secondary) 72%, transparent);
      border-bottom: 5px solid color-mix(in srgb, var(--secondary) 72%, transparent);
    }

    .growth-line {
      left: 10%;
      bottom: 23%;
      width: 68%;
      height: 42%;
      border-bottom: 12px solid var(--accent);
      border-right: 12px solid var(--accent);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      transform: skewY(-17deg);
      opacity: 0.9;
    }

    .growth-point {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: var(--secondary);
      box-shadow: 0 0 34px color-mix(in srgb, var(--secondary) 54%, transparent);
    }

    .point-a { left: 15%; bottom: 28%; }
    .point-b { left: 39%; bottom: 43%; }
    .point-c { left: 67%; bottom: 61%; }

    .growth-arrow {
      right: 6%;
      top: 8%;
      width: 96px;
      height: 96px;
      border-top: 18px solid var(--accent);
      border-right: 18px solid var(--accent);
      transform: rotate(45deg);
    }

    .money-stack {
      inset: 10% 10% 10%;
    }

    .coin {
      left: 22%;
      width: 56%;
      height: 30%;
      border: 16px solid color-mix(in srgb, var(--accent) 86%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 20%, transparent);
      box-shadow: inset 0 0 0 16px color-mix(in srgb, var(--secondary) 26%, transparent);
    }

    .coin-a { bottom: 18%; }
    .coin-b { bottom: 31%; }
    .coin-c { bottom: 44%; }

    .coin-symbol {
      left: 43%;
      top: 21%;
      width: 14%;
      height: 52%;
      border-left: 18px solid var(--secondary);
      border-right: 18px solid var(--secondary);
      opacity: 0.82;
    }

    .warning-system {
      inset: 10% 9% 10%;
    }

    .warning-triangle {
      left: 18%;
      top: 10%;
      width: 64%;
      height: 72%;
      background: color-mix(in srgb, var(--accent) 76%, transparent);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      opacity: 0.78;
    }

    .warning-bar {
      left: 48%;
      width: 4%;
      background: var(--bg);
      border-radius: 999px;
    }

    .bar-a { top: 32%; height: 27%; }
    .bar-b { top: 66%; height: 7%; }

    .warning-pulse {
      inset: 10%;
      border: 8px solid color-mix(in srgb, var(--accent) 58%, transparent);
      border-radius: 999px;
      opacity: 0.36;
    }

    .circuit-board {
      inset: 14% 14% 12%;
    }

    .chip-core {
      left: 35%;
      top: 23%;
      width: 30%;
      height: 42%;
      border: 10px solid var(--accent);
      border-radius: 26px;
      background: color-mix(in srgb, var(--secondary) 14%, transparent);
      box-shadow: 0 0 44px color-mix(in srgb, var(--accent) 46%, transparent);
    }

    .circuit-line {
      background: var(--secondary);
      opacity: 0.82;
    }

    .line-a { left: 5%; top: 42%; width: 30%; height: 8px; }
    .line-b { left: 65%; top: 42%; width: 30%; height: 8px; }
    .line-c { left: 49%; top: 65%; width: 8px; height: 25%; }

    .circuit-dot {
      width: 46px;
      height: 46px;
      border-radius: 999px;
      background: var(--accent);
    }

    .dot-a { left: 0; top: 36%; }
    .dot-b { right: 0; top: 36%; }
    .dot-c { left: 43%; bottom: 2%; }

    .people-map {
      inset: 14% 12%;
    }

    .avatar {
      width: 132px;
      height: 132px;
      border-radius: 999px;
      background:
        radial-gradient(circle at 50% 34%, var(--secondary) 0 19%, transparent 20%),
        radial-gradient(circle at 50% 95%, var(--accent) 0 42%, transparent 43%);
      border: 8px solid color-mix(in srgb, var(--accent) 54%, transparent);
    }

    .avatar-a { left: 42%; top: 7%; }
    .avatar-b { left: 16%; bottom: 10%; transform: scale(0.82); }
    .avatar-c { right: 16%; bottom: 10%; transform: scale(0.82); }

    .avatar-link {
      height: 8px;
      background: color-mix(in srgb, var(--secondary) 68%, transparent);
      transform-origin: left center;
    }

    .link-a { left: 33%; top: 52%; width: 22%; transform: rotate(-34deg); }
    .link-b { left: 50%; top: 52%; width: 24%; transform: rotate(34deg); }
    .link-c { left: 31%; bottom: 23%; width: 38%; }

    .idea-bulb {
      inset: 9% 14% 9%;
    }

    .bulb-glass {
      left: 31%;
      top: 6%;
      width: 38%;
      height: 54%;
      border: 16px solid var(--accent);
      border-radius: 50% 50% 46% 46%;
      background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 58%);
      box-shadow: 0 0 58px color-mix(in srgb, var(--accent) 50%, transparent);
    }

    .bulb-base {
      left: 39%;
      top: 61%;
      width: 22%;
      height: 18%;
      border-radius: 12px;
      background: repeating-linear-gradient(0deg, var(--secondary) 0 9px, transparent 9px 17px);
      border: 6px solid var(--secondary);
    }

    .spark {
      width: 72px;
      height: 12px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 32px color-mix(in srgb, var(--accent) 44%, transparent);
    }

    .spark-a { left: 18%; top: 18%; transform: rotate(-35deg); }
    .spark-b { right: 17%; top: 20%; transform: rotate(35deg); }
    .spark-c { left: 44%; top: 2%; transform: rotate(90deg); }

    .storyboard-grid {
      inset: 13% 10%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 34px;
    }

    .frame {
      position: relative;
      border: 8px solid color-mix(in srgb, var(--secondary) 70%, transparent);
      border-radius: 24px;
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--accent) 24%, transparent), transparent),
        color-mix(in srgb, var(--bg) 68%, #ffffff 8%);
    }

    .frame::after {
      content: "";
      position: absolute;
      left: 18%;
      top: 24%;
      width: 54%;
      height: 42%;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 58%, transparent);
    }

    .caption-inner {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.18em;
      width: 100%;
    }

    .caption-word {
      display: inline-block;
      display: inline-block;
      padding: ${backgroundOpacity > 0 ? "0.12em 0.34em" : "0"};
      background: rgba(0, 0, 0, ${backgroundOpacity});
      border-radius: ${settings.effectPreset === "sticker" ? "18px" : "10px"};
    }

    .effect-sticker {
      -webkit-text-stroke-width: ${Math.max(strokeWidth, 4)}px;
    }

    .low-confidence .caption-word {
      outline: 3px solid rgba(250, 204, 21, 0.65);
    }

    .overlay {
      z-index: 50;
      color: #fff;
      font-size: 48px;
      font-weight: 800;
      text-shadow: 0 5px 18px rgba(0,0,0,0.45);
    }

    .transition {
      inset: 0;
      z-index: 60;
      pointer-events: none;
    }

    .transition-flash-white {
      background: white;
      opacity: 0.82;
    }

    .transition-blur-dissolve,
    .transition-whip-pan,
    .transition-zoom-cut,
    .transition-glitch {
      backdrop-filter: blur(18px);
      background: rgba(255,255,255,0.08);
    }
  `;
}

function compileMetadata(plan: EditPlan): string {
  return JSON.stringify(
    {
      projectId: plan.projectId,
      duration: plan.duration,
      fps: plan.fps,
      quality: plan.quality,
      generatedBy: "CaptionAI composition compiler",
      clipCount: plan.clips.length,
    },
    null,
    2,
  );
}

export function compileHyperframesHtml(plan: EditPlan): string {
  const clips = plan.clips
    .map((clip) => compileClip(plan, clip))
    .filter(Boolean)
    .join("\n");
  const maxDuration = Math.max(plan.duration, ...plan.clips.map(clipEnd));

  return `<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Video Editor Composition ${escapeHtml(plan.projectId)}</title>
  <script src="./gsap.min.js"></script>
  <style>${compileStyles(plan)}</style>
  <script type="application/json" id="captionai-edit-plan">${escapeHtml(compileMetadata(plan))}</script>
</head>
<body>
  <div id="stage" data-composition-id="captionai-${escapeAttr(plan.projectId)}" data-start="0" data-duration="${maxDuration}" data-width="${plan.width}" data-height="${plan.height}" data-fps="${plan.fps}">
${clips}
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    const timeline = gsap.timeline({ paused: true });
    document.querySelectorAll('.script-visual:not(.layout-speaker)').forEach((element) => {
      const start = Number(element.dataset.start || 0);
      timeline.from(element, { opacity: 0, scale: 0.96, duration: 0.28, ease: 'power3.out' }, start + 0.1);
      timeline.from(element.querySelector('.visual-copy'), { opacity: 0, y: 42, duration: 0.42, ease: 'expo.out' }, start + 0.16);
      timeline.from(element.querySelectorAll('.visual-copy > *'), { opacity: 0, y: 28, scale: 0.94, duration: 0.34, stagger: 0.08, ease: 'back.out(1.35)' }, start + 0.22);
      timeline.from(element.querySelectorAll('.visual-media, .visual-grid, .visual-orbit'), { opacity: 0, scale: 0.9, duration: 0.46, stagger: 0.06, ease: 'power2.out' }, start + 0.14);
    });
    document.querySelectorAll('.caption').forEach((element) => {
      const start = Number(element.dataset.start || 0);
      const end = start + Number(element.dataset.duration || 0);
      timeline.from(element, { opacity: 0, y: 28, scale: 0.78, duration: 0.16, ease: 'back.out(1.8)' }, start + 0.02);
      timeline.from(element.querySelectorAll('.caption-word'), { opacity: 0.25, scale: 0.82, duration: 0.12, stagger: 0.045, ease: 'power3.out' }, start + 0.05);
      timeline.to(element, { opacity: 0, scale: 0.95, duration: 0.1, ease: 'power2.in' }, Math.max(start, end - 0.1));
      timeline.set(element, { opacity: 0, visibility: 'hidden' }, end);
    });
    document.querySelectorAll('.visual-data-node, .graphic').forEach((element, index) => {
      const scene = element.closest('.script-visual');
      const start = Number(scene?.dataset.start || 0);
      timeline.from(element, { opacity: 0, rotation: index % 2 ? 6 : -6, duration: 0.42, ease: 'power2.out' }, start + 0.18);
    });
    document.querySelectorAll('.transition').forEach((element) => {
      const start = Number(element.dataset.start || 0);
      const duration = Number(element.dataset.duration || 0.16);
      timeline.fromTo(element, { opacity: 0 }, { opacity: 0.9, duration: duration * 0.45, ease: 'power4.in' }, start);
      timeline.to(element, { opacity: 0, duration: duration * 0.55, ease: 'power4.out' }, start + duration * 0.45);
    });
    window.__timelines['captionai-${escapeAttr(plan.projectId)}'] = timeline;
  </script>
</body>
</html>
`;
}
