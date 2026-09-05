import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PixelMascot } from "../eight-bit/EightBitTechReel";
import { interFont, impactFont, appleGaramondFont } from "../eight-bit/typography";
import { MarkerLoop } from "./SvgMarker";

export const PipelineScene: React.FC<{
  tabLabel?: string;
  tabColor?: string;
  title?: string;
  subtitle?: string;
  footerNote?: string;
}> = ({
  tabLabel = "THE MISSION",
  tabColor = "#2563EB",
  title = "Zero Hype. Pure Alpha.",
  subtitle = "Bite-Sized Tech Intelligence Daily",
  footerNote = "Because reading 50-page research papers is my job, not yours.",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Left red cross stamp animation (frame 12)
  const crossSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 220 },
  });
  const crossScale = interpolate(crossSpring, [0, 1], [2.0, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crossOpacity = interpolate(crossSpring, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Right golden output pop animation (frame 22)
  const outputSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const outputScale = interpolate(outputSpring, [0, 1], [0.85, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outputGlow = interpolate(outputSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Center gear rotation
  const gearRotation = frame * 4;

  // Toggle switch slide animations
  const toggleSpring1 = spring({ frame: frame - 16, fps, config: { damping: 14, stiffness: 180 } });
  const toggleSpring2 = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 180 } });
  const toggleSpring3 = spring({ frame: frame - 28, fps, config: { damping: 14, stiffness: 180 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 380,
        left: "50%",
        transform: `translateX(-50%) scale(${cardScale})`,
        opacity: cardOpacity,
        width: 900,
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        border: "3.5px solid #F1F5F9",
        boxShadow: "0 30px 70px rgba(0, 0, 0, 0.08), 0 10px 24px rgba(0,0,0,0.04)",
        padding: "36px 44px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        zIndex: 20,
      }}
    >
      {/* Top Folder Tab */}
      <div
        style={{
          position: "absolute",
          top: -18,
          left: 40,
          backgroundColor: tabColor,
          color: "#FFFFFF",
          fontFamily: interFont,
          fontWeight: 900,
          fontSize: 14,
          padding: "4px 18px",
          borderRadius: 12,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {tabLabel}
      </div>

      {/* Mini Mascot perched on top right */}
      <div style={{ position: "absolute", top: -18, right: 35 }}>
        <PixelMascot x={0} y={0} scale={0.5} emote="lightbulb" hopTriggerFrame={6} />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontFamily: impactFont, fontSize: 44, color: "#0F172A", textTransform: "uppercase", letterSpacing: "-1px" }}>
            ZERO HYPE{" "}
          </span>
          <span style={{ fontFamily: appleGaramondFont, fontStyle: "italic", fontSize: 48, color: "#2563EB" }}>
            Pure Alpha.
          </span>
          <MarkerLoop width={340} height={68} strokeColor="#EF4444" delayFrames={10} />
        </div>
        <div style={{ fontFamily: interFont, fontWeight: 700, fontSize: 16, color: "#64748B", marginTop: 4 }}>
          {subtitle}
        </div>
      </div>

      {/* 1. VISUAL TRANSFORMATION PIPELINE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          backgroundColor: "#F8FAFC",
          padding: "20px 22px",
          borderRadius: 20,
          border: "2px solid #E2E8F0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Node: The 50-Page Whitepaper Problem */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: "16px 14px",
            border: "1.5px solid #CBD5E1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 4 }}>📑</div>
          <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 13, color: "#475569", textTransform: "uppercase", textAlign: "center" }}>
            50-Page Papers
          </div>
          <div style={{ fontFamily: interFont, fontWeight: 600, fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 2 }}>
            Jargon & Complex Math
          </div>

          {/* Red X Cross Stamp */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${crossScale}) rotate(-12deg)`,
              opacity: crossOpacity,
              backgroundColor: "rgba(254, 226, 226, 0.95)",
              border: "2.5px solid #DC2626",
              color: "#DC2626",
              fontFamily: impactFont,
              fontWeight: 900,
              fontSize: 14,
              padding: "4px 10px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
              pointerEvents: "none",
            }}
          >
            ❌ 100% FLUFF
          </div>
        </div>

        {/* Center Node: The Bittu Decoding Engine */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "#E07A5F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(224, 122, 95, 0.4)",
              transform: `rotate(${gearRotation}deg)`,
            }}
          >
            <span style={{ fontSize: 24 }}>⚙️</span>
          </div>
          <span
            style={{
              fontFamily: interFont,
              fontWeight: 900,
              fontSize: 10,
              color: "#E07A5F",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            DECODING ➔
          </span>
        </div>

        {/* Right Node: The 60-Second Byte */}
        <div
          style={{
            flex: 1.15,
            backgroundColor: "#F0FDF4",
            borderRadius: 14,
            padding: "16px 16px",
            border: "2px solid #86EFAC",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${outputScale})`,
            boxShadow: `0 8px 24px rgba(34, 197, 94, ${outputGlow * 0.25})`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 26 }}>⚡</span>
            <span
              style={{
                fontFamily: interFont,
                fontWeight: 900,
                fontSize: 11,
                color: "#166534",
                backgroundColor: "#DCFCE7",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              ★ 60s BREAKDOWN
            </span>
          </div>
          <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 14, color: "#14532D", textAlign: "center" }}>
            Actionable Alpha
          </div>
          <div style={{ fontFamily: appleGaramondFont, fontStyle: "italic", fontSize: 13, color: "#166534", textAlign: "center", marginTop: 2 }}>
            Clear scripts, configs & takeaways
          </div>
        </div>
      </div>

      {/* 2. THREE ACTIVE FEATURE TOGGLE SWITCHES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "No Corporate Fluff", desc: "Plain English breakdowns in 60s", spring: toggleSpring1 },
          { label: "Open Source First", desc: "Local weights, vLLM & Ollama scripts", spring: toggleSpring2 },
          { label: "Real Benchmarks", desc: "Zero sponsored bias — honest latency & cost", spring: toggleSpring3 },
        ].map((item, i) => {
          const switchX = interpolate(item.spring, [0, 1], [0, 24]);
          const switchBg = interpolate(item.spring, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFFFFF",
                padding: "10px 16px",
                borderRadius: 12,
                border: "1.5px solid #F1F5F9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16A34A" }} />
                <div>
                  <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 15, color: "#0F172A" }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: interFont, fontWeight: 600, fontSize: 12, color: "#64748B" }}>
                    {item.desc}
                  </div>
                </div>
              </div>

              {/* iOS / Retro Toggle Switch */}
              <div
                style={{
                  width: 50,
                  height: 26,
                  backgroundColor: switchBg > 0.5 ? "#16A34A" : "#CBD5E1",
                  borderRadius: 999,
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  boxShadow: switchBg > 0.5 ? "0 2px 8px rgba(22, 163, 74, 0.4)" : "none",
                  transition: "background-color 0.1s ease",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    transform: `translateX(${switchX}px)`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Callout */}
      <div
        style={{
          backgroundColor: "#F1F5F9",
          color: "#475569",
          fontFamily: interFont,
          fontWeight: 800,
          fontSize: 13,
          textAlign: "center",
          padding: "8px 16px",
          borderRadius: 999,
        }}
      >
        {footerNote}
      </div>
    </div>
  );
};
