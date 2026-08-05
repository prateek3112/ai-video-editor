"use client";

import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { EditPlan, CaptionClip } from "@/lib/edit-plan";
import { renderCaptionWord } from "@/lib/subtitle-utils";

interface RemotionCaptionsProps {
  plan: EditPlan;
}

export const RemotionCaptions: React.FC<RemotionCaptionsProps> = ({ plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const captionClips = useMemo(() => {
    return (plan.clips.filter((c) => c.type === "caption") as CaptionClip[]).sort((a, b) => a.start - b.start);
  }, [plan.clips]);

  const activeClip = useMemo(() => {
    return captionClips.find((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration);
  }, [captionClips, currentTime]);

  if (!activeClip) return null;

  const styleSettings = plan.settings;
  const rawWords = activeClip.text.split(/\s+/).filter(Boolean);
  const localizedWords = rawWords.map((w) =>
    renderCaptionWord(w, styleSettings.language, activeClip.script, styleSettings.defaultScript)
  );

  const clipDuration = activeClip.duration;
  const wordCount = localizedWords.length;
  const wordDuration = wordCount > 0 ? clipDuration / wordCount : 0.4;
  const clipElapsed = currentTime - activeClip.start;
  const activeWordIndex = Math.min(wordCount - 1, Math.max(0, Math.floor(clipElapsed / wordDuration)));

  const animationType = styleSettings.animation ?? "word-pop";
  const textColor = styleSettings.textColor ?? "#FFFFFF";
  const activeColor = styleSettings.activeWordColor ?? "#FFE600";
  const posX = (styleSettings.positionX ?? 0.5) * 100;
  const posY = (styleSettings.positionY ?? 0.8) * 100;
  const fontSize = 48 * (styleSettings.fontScale ?? 1);

  // Render Hormozi style (single active word focus)
  if (animationType === "bounce" || styleSettings.style === "hormozi") {
    const currentWord = localizedWords[activeWordIndex] ?? "";
    const activeProgress = (clipElapsed - activeWordIndex * wordDuration) / wordDuration;
    const scale = spring({
      frame: Math.max(0, activeProgress * 30),
      fps: 30,
      config: { damping: 12, stiffness: 200 },
    });

    return (
      <div
        style={{
          position: "absolute",
          left: `${posX}%`,
          top: `${posY}%`,
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 50,
          pointerEvents: "none",
          width: "90%",
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: `scale(${0.9 + scale * 0.3})`,
            fontSize: `${fontSize * 1.3}px`,
            fontWeight: 900,
            color: activeColor,
            textTransform: styleSettings.capitalization === "uppercase" ? "uppercase" : "none",
            textShadow: "0px 4px 12px rgba(0,0,0,0.8), -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
            letterSpacing: "1px",
            lineHeight: 1.1,
          }}
        >
          {currentWord}
        </span>
      </div>
    );
  }

  // Render Karaoke & Line highlighting style
  return (
    <div
      style={{
        position: "absolute",
        left: `${posX}%`,
        top: `${posY}%`,
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        zIndex: 50,
        pointerEvents: "none",
        width: "90%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        padding: "12px 24px",
        backgroundColor: styleSettings.style === "dark-box" ? "rgba(0,0,0,0.75)" : "transparent",
        borderRadius: "16px",
      }}
    >
      {localizedWords.map((word, idx) => {
        const isActive = idx === activeWordIndex;
        const isPast = idx < activeWordIndex;

        let wordScale = 1;
        if (isActive && (animationType === "word-pop" || animationType === "zoom")) {
          wordScale = 1.15;
        }

        let opacity = 1;
        if (animationType === "fade" && !isActive && !isPast) {
          opacity = 0.3;
        }

        const color = isActive ? activeColor : isPast ? "#E2E8F0" : textColor;

        return (
          <span
            key={`${word}-${idx}`}
            style={{
              display: "inline-block",
              fontSize: `${fontSize}px`,
              fontWeight: isActive ? 800 : 700,
              color,
              opacity,
              transform: `scale(${wordScale})`,
              transition: "transform 0.1s ease, color 0.1s ease",
              textTransform: styleSettings.capitalization === "uppercase" ? "uppercase" : "none",
              textShadow: "0px 2px 8px rgba(0,0,0,0.8), -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000",
              backgroundColor: isActive && styleSettings.style === "karaoke-box" ? "rgba(0,0,0,0.85)" : "transparent",
              padding: isActive && styleSettings.style === "karaoke-box" ? "2px 8px" : "0px",
              borderRadius: "8px",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
