"use client";

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface ViralChecklistItem {
  text: string;
  timestamp?: number;
  frame?: number;
}

export interface ViralChecklistProps {
  videoSrc: string;
  title: string;
  subtitle?: string;
  badge?: string;
  items: (string | ViralChecklistItem)[];
  popStyle?: "cut" | "pop" | "fade";
  voiceoverSrc?: string;
  musicSrc?: string;
  popSfxSrc?: string;
  titleTop?: string | number;
  listTop?: string | number;
  leftColX?: string | number;
  rightColX?: string | number;
  fontSize?: number;
  titleSize?: number;
  textColor?: string;
  accentColor?: string;
}

export const ViralChecklist: React.FC<ViralChecklistProps> = ({
  videoSrc,
  title,
  subtitle,
  badge = "🚀 PRE-LAUNCH CHECKLIST",
  items,
  popStyle = "pop",
  voiceoverSrc = "voiceover.wav",
  musicSrc = "bg_music.wav",
  popSfxSrc = "pop_sfx.wav",
  titleTop = "7%",
  listTop = "25%",
  leftColX = "7%",
  rightColX = "53%",
  fontSize,
  titleSize,
  textColor = "#FFFFFF",
  accentColor = "#38BDF8", // Cyan / Electric Blue for number pop
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  // Normalize items to { number, text, appearFrame }
  const normalizedItems = useMemo(() => {
    const total = items.length;
    // Distribute items evenly from frame 0 to frame duration * 0.88
    const stepFrames = total > 1 ? (durationInFrames * 0.86) / (total - 1) : 0;

    return items.map((item, idx) => {
      const text = typeof item === "string" ? item : item.text;
      let appearFrame = 0;

      if (typeof item !== "string") {
        if (item.frame !== undefined) {
          appearFrame = item.frame;
        } else if (item.timestamp !== undefined) {
          appearFrame = Math.round(item.timestamp * fps);
        } else {
          appearFrame = idx === 0 ? 0 : Math.round(idx * stepFrames);
        }
      } else {
        appearFrame = idx === 0 ? 0 : Math.round(idx * stepFrames);
      }

      return {
        number: idx + 1,
        text,
        appearFrame,
      };
    });
  }, [items, durationInFrames, fps]);

  const leftColItems = normalizedItems.slice(0, Math.ceil(normalizedItems.length / 2));
  const rightColItems = normalizedItems.slice(Math.ceil(normalizedItems.length / 2));

  // Sizing
  const baseTitleSize = titleSize ?? (width >= 1080 ? 60 : 42);
  const baseFontSize = fontSize ?? (width >= 1080 ? 30 : 21);
  const rowSpacing = width >= 1080 ? 44 : 29;

  const renderItem = (item: { number: number; text: string; appearFrame: number }) => {
    const isVisible = frame >= item.appearFrame;
    const itemAge = Math.max(0, frame - item.appearFrame);

    let popScale = 1;
    let popOpacity = isVisible ? 1 : 0;

    // Flash accent color for the first 6 frames of appearance
    const isJustBorn = isVisible && itemAge < 8;
    const itemColor = isJustBorn ? accentColor : textColor;

    if (isVisible && popStyle === "pop") {
      const springVal = spring({
        frame: itemAge,
        fps,
        config: { damping: 13, stiffness: 240 },
      });
      popScale = 0.75 + springVal * 0.25;
    } else if (isVisible && popStyle === "fade") {
      popOpacity = interpolate(itemAge, [0, 4], [0, 1], { extrapolateRight: "clamp" });
    }

    return (
      <div
        key={item.number}
        style={{
          display: "flex",
          alignItems: "center",
          height: rowSpacing,
          fontSize: baseFontSize,
          lineHeight: 1.15,
          fontWeight: 650,
          color: itemColor,
          textShadow: isJustBorn
            ? `0 0 12px ${accentColor}99, 0 2px 8px rgba(0,0,0,0.9)`
            : "0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.95)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {/* Pre-rendered number - always visible */}
        <span
          style={{
            display: "inline-block",
            minWidth: width >= 1080 ? 50 : 34,
            textAlign: "right",
            marginRight: width >= 1080 ? 12 : 8,
            fontWeight: 800,
            color: isJustBorn ? accentColor : "rgba(255,255,255,0.9)",
          }}
        >
          {item.number}.
        </span>

        {/* Text popping in */}
        <span
          style={{
            display: "inline-block",
            opacity: popOpacity,
            transform: isVisible ? `scale(${popScale})` : "scale(1)",
            transformOrigin: "left center",
            letterSpacing: "-0.01em",
          }}
        >
          {item.text}
        </span>
      </div>
    );
  };

  const mediaSrc = (pathStr: string) =>
    pathStr.startsWith("http") || pathStr.startsWith("data:") ? pathStr : staticFile(pathStr.replace(/^\/+/, ""));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* Background Video */}
      {videoSrc && (
        <OffthreadVideo
          src={mediaSrc(videoSrc)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Cinematic dark gradient overlays for maximum contrast */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "52%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.05) 90%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Hero Header */}
      <div
        style={{
          position: "absolute",
          top: titleTop,
          left: "4%",
          right: "4%",
          textAlign: "center",
          color: textColor,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          zIndex: 10,
        }}
      >
        {badge && (
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: 20,
              background: "rgba(56, 189, 248, 0.18)",
              border: "1px solid rgba(56, 189, 248, 0.45)",
              color: "#38bdf8",
              fontSize: baseTitleSize * 0.32,
              fontWeight: 750,
              letterSpacing: "0.08em",
              marginBottom: 10,
              textTransform: "uppercase",
              backdropFilter: "blur(6px)",
            }}
          >
            {badge}
          </div>
        )}

        <div
          style={{
            fontWeight: 850,
            fontSize: baseTitleSize,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.95)",
            whiteSpace: "pre-line",
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: baseTitleSize * 0.45,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              marginTop: 8,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* 2-Column Checklist Container */}
      <div
        style={{
          position: "absolute",
          top: listTop,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {/* Left Column (Items 1 to 10) */}
        <div
          style={{
            position: "absolute",
            left: leftColX,
            top: 0,
            display: "flex",
            flexDirection: "column",
            gap: width >= 1080 ? 6 : 3,
          }}
        >
          {leftColItems.map(renderItem)}
        </div>

        {/* Right Column (Items 11 to 20) */}
        <div
          style={{
            position: "absolute",
            left: rightColX,
            top: 0,
            display: "flex",
            flexDirection: "column",
            gap: width >= 1080 ? 6 : 3,
          }}
        >
          {rightColItems.map(renderItem)}
        </div>
      </div>

      {/* Audio Layer: Voiceover */}
      {voiceoverSrc && (
        <Audio src={mediaSrc(voiceoverSrc)} volume={1.0} />
      )}

      {/* Audio Layer: Background Beat */}
      {musicSrc && (
        <Audio src={mediaSrc(musicSrc)} volume={0.16} />
      )}

      {/* Audio Layer: Pop SFX for each popping item */}
      {popSfxSrc &&
        normalizedItems.map((item) => {
          if (item.appearFrame <= 0) return null;
          return (
            <Sequence
              key={`pop-${item.number}`}
              from={item.appearFrame}
              durationInFrames={4}
            >
              <Audio src={mediaSrc(popSfxSrc)} volume={0.55} />
            </Sequence>
          );
        })}
    </AbsoluteFill>
  );
};
