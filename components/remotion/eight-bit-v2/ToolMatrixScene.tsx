import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PixelMascot } from "../eight-bit/EightBitTechReel";
import { interFont, impactFont, appleGaramondFont } from "../eight-bit/typography";
import { MarkerLoop } from "./SvgMarker";

export const ToolMatrixScene: React.FC<{
  tabLabel?: string;
  tabColor?: string;
  title?: string;
  subtitle?: string;
  footerNote?: string;
}> = ({
  tabLabel = "DAILY DROPS",
  tabColor = "#059669",
  title = "Everything You Get",
  subtitle = "Your Front-Row Seat to the Future",
  footerNote = "Level up your engineering stack every single morning.",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for main container
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Staggered pop for 4 bento tiles
  const tile1Spring = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 200 } });
  const tile2Spring = spring({ frame: frame - 12, fps, config: { damping: 14, stiffness: 200 } });
  const tile3Spring = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 200 } });
  const tile4Spring = spring({ frame: frame - 24, fps, config: { damping: 14, stiffness: 200 } });

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
        gap: 18,
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
        <PixelMascot x={0} y={0} scale={0.5} emote="sparkle" hopTriggerFrame={6} />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontFamily: impactFont, fontSize: 44, color: "#0F172A", textTransform: "uppercase", letterSpacing: "-1px" }}>
            EVERYTHING{" "}
          </span>
          <span style={{ fontFamily: appleGaramondFont, fontStyle: "italic", fontSize: 48, color: "#059669" }}>
            You Get
          </span>
          <MarkerLoop width={340} height={68} strokeColor="#EF4444" delayFrames={10} />
        </div>
        <div style={{ fontFamily: interFont, fontWeight: 700, fontSize: 16, color: "#64748B", marginTop: 4 }}>
          {subtitle}
        </div>
      </div>

      {/* 2x2 DYNAMIC FLOATING BENTO TILES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {/* TILE 1: Coding Agents */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 16,
            padding: "16px 18px",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transform: `scale(${interpolate(tile1Spring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(tile1Spring, [0, 1], [0, 1]),
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: interFont, fontWeight: 900, fontSize: 15, color: "#0F172A" }}>
              ⚡ Coding Agents
            </span>
            <span style={{ fontFamily: interFont, fontWeight: 800, fontSize: 11, color: "#166534", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: 999 }}>
              Claude Code
            </span>
          </div>
          {/* Mini code terminal */}
          <div
            style={{
              backgroundColor: "#0F172A",
              borderRadius: 8,
              padding: "8px 10px",
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: "#38BDF8",
              lineHeight: 1.4,
            }}
          >
            <div>$ agent.auto_fix()</div>
            <div style={{ color: "#4ADE80" }}>✓ 14 files synced [0.4s]</div>
          </div>
        </div>

        {/* TILE 2: Automations & Workflows */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 16,
            padding: "16px 18px",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transform: `scale(${interpolate(tile2Spring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(tile2Spring, [0, 1], [0, 1]),
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: interFont, fontWeight: 900, fontSize: 15, color: "#0F172A" }}>
              🔗 Workflows
            </span>
            <span style={{ fontFamily: interFont, fontWeight: 800, fontSize: 11, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: 999 }}>
              MCP Stack
            </span>
          </div>
          {/* Node Graph Flow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: "8px 10px",
              border: "1px dashed #CBD5E1",
              fontSize: 11,
              fontFamily: interFont,
              fontWeight: 800,
            }}
          >
            <span style={{ color: "#64748B" }}>Trigger</span>
            <span style={{ color: "#3B82F6" }}>➔</span>
            <span style={{ color: "#2563EB" }}>MCP Agent</span>
            <span style={{ color: "#3B82F6" }}>➔</span>
            <span style={{ color: "#16A34A" }}>Done ✅</span>
          </div>
        </div>

        {/* TILE 3: Prompt Blueprints */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 16,
            padding: "16px 18px",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transform: `scale(${interpolate(tile3Spring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(tile3Spring, [0, 1], [0, 1]),
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: interFont, fontWeight: 900, fontSize: 15, color: "#0F172A" }}>
              📋 Prompt Blueprints
            </span>
            <span style={{ fontFamily: interFont, fontWeight: 800, fontSize: 11, color: "#854D0E", backgroundColor: "#FEF9C3", padding: "2px 8px", borderRadius: 999 }}>
              Zero Fluff
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: "8px 10px",
              border: "1px solid #E2E8F0",
              fontFamily: "'Courier New', monospace",
              fontSize: 10.5,
              color: "#475569",
              lineHeight: 1.35,
            }}
          >
            <span style={{ color: "#7C3AED", fontWeight: 700 }}>SYSTEM:</span> “Think step-by-step before code execution…”
          </div>
        </div>

        {/* TILE 4: Open Source Alpha */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 16,
            padding: "16px 18px",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transform: `scale(${interpolate(tile4Spring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(tile4Spring, [0, 1], [0, 1]),
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: interFont, fontWeight: 900, fontSize: 15, color: "#0F172A" }}>
              ⭐ Open Source
            </span>
            <span style={{ fontFamily: interFont, fontWeight: 900, fontSize: 11, color: "#EA580C", backgroundColor: "#FFEDD5", padding: "2px 8px", borderRadius: 999 }}>
              ★ 14.2k
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: "8px 10px",
              border: "1px solid #E2E8F0",
              fontSize: 11,
              fontFamily: interFont,
              fontWeight: 700,
              color: "#1E293B",
            }}
          >
            📦 Ollama & vLLM local configs ready to run
          </div>
        </div>
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
