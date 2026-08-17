"use client";

import React, { useMemo } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionClip, EditPlan } from "../../lib/edit-plan";
import { renderCaptionWord } from "../../lib/subtitle-utils";

interface RemotionCaptionsProps {
  plan: EditPlan;
}

function transformText(text: string, mode: EditPlan["settings"]["capitalization"]): string {
  if (mode === "uppercase") return text.toUpperCase();
  if (mode === "title") return text.replace(/\w\S*/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
  return text;
}

export const RemotionCaptions: React.FC<RemotionCaptionsProps> = ({ plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const captions = useMemo(
    () => (plan.clips.filter((clip) => clip.type === "caption") as CaptionClip[]).sort((a, b) => a.start - b.start),
    [plan.clips],
  );
  const activeClip = captions.find((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration);
  if (!activeClip) return null;

  const settings = plan.settings;
  const words = activeClip.text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => renderCaptionWord(word, settings.language, activeClip.script, settings.defaultScript));
  if (!words.length) return null;

  const clipFrame = Math.max(0, frame - Math.round(activeClip.start * fps));
  const clipElapsed = currentTime - activeClip.start;
  const wordDuration = Math.max(0.08, activeClip.duration / words.length);
  const activeWordIndex = Math.min(words.length - 1, Math.floor(clipElapsed / wordDuration));
  const activeWordFrame = Math.max(0, clipFrame - Math.round(activeWordIndex * wordDuration * fps));
  
  // Word-pop spring
  const entrance = spring({
    frame: activeWordFrame,
    fps,
    durationInFrames: Math.max(4, Math.round((0.2 / Math.max(0.6, settings.animationSpeed)) * fps)),
    config: settings.animation === "word-pop" ? { damping: 8, mass: 0.4, stiffness: 180 } : settings.transition === "snappy" ? { damping: 17, stiffness: 250 } : { damping: 200 },
  });
  
  const fade = interpolate(clipFrame, [0, Math.max(1, 0.12 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  
  const shouldShowSingleWord = settings.animation === "word-pop" || settings.style === "hormozi" || settings.style === "creator-pop";
  const posX = (activeClip.positionX ?? settings.positionX ?? 0.5) * 100;
  const posY = (activeClip.positionY ?? settings.positionY ?? 0.8) * 100;
  const baseFontSize = Math.round(66 * Math.max(0.45, settings.fontScale));
  const effect = settings.effectPreset;
  
  // Glow effect
  const glowOscillation = 8 + Math.sin(frame / fps * 4) * 4; // oscillates between 4 and 12
  const isGlowing = effect === "glow" || settings.style.toLowerCase().includes("neon");
  const glowColor = settings.activeWordColor || settings.emphasisColor;
  
  let shadow = "none";
  if (isGlowing) {
    shadow = `0 0 ${glowOscillation}px ${glowColor}, 0 0 ${glowOscillation * 2}px ${glowColor}`;
  } else if (effect === "shadow") {
    shadow = `2px 4px ${settings.shadowStrength * 12}px rgba(0,0,0,0.7)`;
  } else if (effect === "sticker") {
    shadow = "0 12px 28px rgba(0,0,0,.42)";
  }
  
  const hasOutline = effect === "outline" || effect === "sticker";

  const wobble = settings.animation === "shake" ? Math.sin(activeWordFrame * 1.8) * 7 : 0;
  const floatY = settings.animation === "bounce" ? (1 - entrance) * -34 : settings.animation === "slide-up" ? (1 - entrance) * 38 : 0;
  const activeScale = (settings.animation === "word-pop" || settings.animation === "zoom" || settings.style === "hormozi") ? entrance * 1.15 : 1;

  const sharedContainer: React.CSSProperties = {
    position: "absolute",
    left: `${posX}%`,
    top: `${posY}%`,
    width: "92%",
    transform: `translate(-50%, -50%) translate(${wobble}px, ${floatY}px) scale(${shouldShowSingleWord ? activeScale : 1})`,
    transformOrigin: "center",
    textAlign: "center",
    zIndex: 100,
    pointerEvents: "none",
    opacity: settings.animation === "fade" ? fade : 1,
    fontFamily: settings.fontFamily,
    fontWeight: settings.fontWeight,
    letterSpacing: settings.letterSpacing,
    lineHeight: settings.lineHeight,
    textTransform: settings.capitalization === "uppercase" ? "uppercase" : settings.capitalization === "title" ? "capitalize" : "none",
  };
  
  const textStrokeStyle = hasOutline ? {
    WebkitTextStroke: `${settings.strokeWidth}px ${settings.strokeColor}`,
    paintOrder: "stroke fill",
  } : {};

  if (shouldShowSingleWord) {
    const word = transformText(words[activeWordIndex] ?? "", settings.capitalization);
    return (
      <div style={sharedContainer}>
        <span
          style={{
            display: "inline-block",
            maxWidth: "94%",
            padding: effect === "sticker" ? "8px 18px" : 0,
            borderRadius: 14,
            background: effect === "sticker" ? "rgba(255,255,255,.96)" : "transparent",
            color: effect === "sticker" ? "#090909" : settings.activeWordColor,
            fontSize: baseFontSize * 1.12,
            textShadow: shadow,
            ...textStrokeStyle,
          }}
        >
          {word}
        </span>
      </div>
    );
  }

  // Multi-line logic
  const lines = [];
  for (let i = 0; i < words.length; i += settings.maxWordsPerLine) {
    lines.push(words.slice(i, i + settings.maxWordsPerLine));
  }

  return (
    <div style={{ ...sharedContainer, transform: `translate(-50%, -50%) translate(${wobble}px, ${floatY}px)` }}>
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          maxWidth: "92%",
          alignItems: "center",
          justifyContent: "center",
          gap: `${Math.max(6, baseFontSize * 0.14)}px`,
          padding: effect === "glass" || settings.style === "dark-box" ? "12px 24px" : 0,
          borderRadius: 16,
          background: effect === "glass" ? "rgba(0,0,0,0.35)" : settings.style === "dark-box" ? `rgba(0,0,0,${Math.max(0.44, settings.backgroundOpacity)})` : "transparent",
          backdropFilter: effect === "glass" ? "blur(12px)" : "none",
        }}
      >
        {lines.map((lineWords, lineIndex) => (
          <div
            key={`line-${lineIndex}`}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: `${Math.max(6, baseFontSize * 0.14)}px`,
              flexWrap: "nowrap",
            }}
          >
            {lineWords.map((rawWord, indexInLine) => {
              const index = lineIndex * settings.maxWordsPerLine + indexInLine;
              const active = index === activeWordIndex;
              const highlighted = (activeClip.highlightWords ?? []).some((keyword) => keyword.toLowerCase() === rawWord.toLowerCase());
              const highlightBg = active && settings.highlightEnabled ? settings.activeWordBackground : "transparent";
              return (
                <span
                  key={`${rawWord}-${index}`}
                  style={{
                    display: "inline-block",
                    padding: active && settings.highlightEnabled ? "2px 9px" : 0,
                    borderRadius: 8,
                    background: highlightBg,
                    opacity: active && settings.highlightEnabled && settings.activeWordBackgroundOpacity !== undefined ? settings.activeWordBackgroundOpacity : (settings.animation === "karaoke" && index > activeWordIndex ? 0.54 : settings.textOpacity),
                    color: active ? settings.activeWordColor : highlighted ? settings.emphasisColor : settings.textColor,
                    fontSize: baseFontSize,
                    transform: active ? `scale(${1 + (entrance - 1) * 0.15})` : "scale(1)",
                    textShadow: shadow,
                    ...textStrokeStyle,
                  }}
                >
                  {transformText(rawWord, settings.capitalization)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
