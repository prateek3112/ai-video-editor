import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont, appleGaramondFont } from "../eight-bit/typography";

/**
 * Live Speech Self-Correction Visualizer
 * Shows real-time speech correction:
 * Raw: "Let's meet Tuesday... actually, Wednesday"
 * -> Strikethrough Tuesday
 * -> Highlight Wednesday
 * -> Clean Output: "Let's meet Wednesday"
 */
export const LiveSpeechCorrection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timeline within the scene
  const strikeSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const strikeWidth = interpolate(strikeSpring, [0, 1], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const highlightScale = interpolate(highlightSpring, [0, 1], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlightOpacity = interpolate(highlightSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const resultSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 14, stiffness: 220 },
  });
  const resultY = interpolate(resultSpring, [0, 1], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resultOpacity = interpolate(resultSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 20px",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        border: "2px dashed #CBD5E1",
        marginTop: 6,
      }}
    >
      {/* 1. Spoken Audio Waveform Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎙️</span>
          <span
            style={{
              fontFamily: interFont,
              fontWeight: 800,
              fontSize: 13,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Raw Spoken Input
          </span>
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 800,
            fontSize: 11,
            color: "#EF4444",
            backgroundColor: "#FEE2E2",
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          DISFLUENCY DETECTED
        </div>
      </div>

      {/* 2. Interactive Sentence with Strikethrough & Highlight */}
      <div
        style={{
          fontFamily: interFont,
          fontWeight: 800,
          fontSize: 20,
          color: "#1E293B",
          lineHeight: 1.5,
        }}
      >
        <span>“Let's meet </span>

        {/* Strikethrough Tuesday */}
        <span style={{ position: "relative", display: "inline-block", color: "#94A3B8" }}>
          Tuesday
          <span
            style={{
              position: "absolute",
              top: "55%",
              left: 0,
              width: `${strikeWidth}%`,
              height: 3.5,
              backgroundColor: "#EF4444",
              borderRadius: 2,
              transform: "translateY(-50%) rotate(-1deg)",
            }}
          />
        </span>

        <span>… actually, </span>

        {/* Highlighted Wednesday */}
        <span
          style={{
            position: "relative",
            display: "inline-block",
            transform: `scale(${highlightScale})`,
            opacity: highlightOpacity,
            color: "#15803D",
            backgroundColor: "#DCFCE7",
            padding: "2px 8px",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)",
          }}
        >
          Wednesday”
        </span>
      </div>

      {/* 3. Clean Transcribed Result */}
      <div
        style={{
          transform: `translateY(${resultY}px)`,
          opacity: resultOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "#FFFFFF",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1.5px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <span style={{ fontSize: 16 }}>✨</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: interFont, fontWeight: 700, fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
            Clean Transcribed Output
          </div>
          <div style={{ fontFamily: appleGaramondFont, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: "#0F172A" }}>
            “Let's meet Wednesday.”
          </div>
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 900,
            fontSize: 11,
            color: "#16A34A",
            backgroundColor: "#F0FDF4",
            padding: "4px 8px",
            borderRadius: 999,
          }}
        >
          100% CLEAN
        </div>
      </div>
    </div>
  );
};
