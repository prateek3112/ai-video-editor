import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont, impactFont } from "../eight-bit/typography";
import { MarkerUnderline } from "./SvgMarker";

/**
 * Animated Speed Comparison Gauge & Rubber Ink Stamp
 * Compares Gemini 3.5 Transcribe (70% faster) with Chirp 3.
 */
export const SpeedComparisonGauge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress bar entrance
  const barSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const geminiWidth = interpolate(barSpring, [0, 1], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chirpWidth = interpolate(barSpring, [0, 1], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rubber ink stamp slam physics
  const stampSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 12, stiffness: 260 },
  });
  const stampScale = interpolate(stampSpring, [0, 1], [2.2, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampOpacity = interpolate(stampSpring, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "18px 20px",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        border: "1.5px solid #E2E8F0",
        position: "relative",
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      {/* 1. Header with Underline */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 13, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px" }}>
          Transcription Latency & Throughput
        </div>
        <MarkerUnderline width={240} strokeColor="#EA580C" delayFrames={10} />
      </div>

      {/* 2. Gemini 3.5 Transcribe Meter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: interFont, fontWeight: 900, fontSize: 16, color: "#15803D" }}>
            ⚡ Gemini 3.5 Transcribe
          </span>
          <span style={{ fontFamily: impactFont, fontWeight: 900, fontSize: 18, color: "#16A34A" }}>
            70% FASTER
          </span>
        </div>
        <div
          style={{
            height: 18,
            backgroundColor: "#DCFCE7",
            borderRadius: 999,
            overflow: "hidden",
            padding: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${geminiWidth}%`,
              backgroundColor: "#16A34A",
              borderRadius: 999,
              boxShadow: "0 2px 8px rgba(22, 163, 74, 0.4)",
            }}
          />
        </div>
      </div>

      {/* 3. Chirp 3 (Previous Model) Meter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: interFont, fontWeight: 700, fontSize: 14.5, color: "#64748B" }}>
            🐢 Previous Model (Chirp 3)
          </span>
          <span style={{ fontFamily: interFont, fontWeight: 800, fontSize: 13, color: "#94A3B8" }}>
            Baseline
          </span>
        </div>
        <div
          style={{
            height: 14,
            backgroundColor: "#F1F5F9",
            borderRadius: 999,
            overflow: "hidden",
            padding: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${chirpWidth}%`,
              backgroundColor: "#94A3B8",
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      {/* 4. Rubber Ink Stamp of Approval */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 20,
          transform: `scale(${stampScale}) rotate(-6deg)`,
          opacity: stampOpacity,
          border: "3px solid #DC2626",
          borderRadius: 8,
          padding: "4px 10px",
          color: "#DC2626",
          fontFamily: impactFont,
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: "1px",
          textTransform: "uppercase",
          backgroundColor: "rgba(254, 226, 226, 0.85)",
          boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
          pointerEvents: "none",
        }}
      >
        ★ 70% LATENCY DROP
      </div>
    </div>
  );
};
