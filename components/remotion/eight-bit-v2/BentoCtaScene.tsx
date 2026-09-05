import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PixelMascot } from "../eight-bit/EightBitTechReel";
import { interFont, impactFont, appleGaramondFont } from "../eight-bit/typography";
import { MarkerUnderline } from "./SvgMarker";

export const BentoCtaScene: React.FC<{
  tabLabel?: string;
  tabColor?: string;
  title?: string;
  subtitle?: string;
  footerNote?: string;
}> = ({
  tabLabel = "JOIN THE CREW",
  tabColor = "#EA580C",
  title = "Bytes with Bittu ⚡",
  subtitle = "Follow @byteswithbittu for Daily AI Intelligence",
  footerNote = "Comment 'BITTU' to get our curated AI Starter Pack!",
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

  // CTA button pulse
  const pulseScale = 1 + Math.sin(frame * 0.25) * 0.03;

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
        <PixelMascot x={0} y={0} scale={0.5} emote="trophy" hopTriggerFrame={6} />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontFamily: impactFont, fontSize: 44, color: "#0F172A", textTransform: "uppercase", letterSpacing: "-1px" }}>
            BYTES WITH{" "}
          </span>
          <span style={{ fontFamily: appleGaramondFont, fontStyle: "italic", fontSize: 48, color: "#EA580C" }}>
            Bittu ⚡
          </span>
          <MarkerUnderline width={320} strokeColor="#EA580C" delayFrames={8} />
        </div>
        <div style={{ fontFamily: interFont, fontWeight: 700, fontSize: 16, color: "#64748B", marginTop: 4 }}>
          {subtitle}
        </div>
      </div>

      {/* BENTO HERO BOX: Free Starter Pack */}
      <div
        style={{
          backgroundColor: "#FFFBEB",
          borderRadius: 20,
          padding: "20px 24px",
          border: "2px solid #FDE68A",
          display: "flex",
          alignItems: "center",
          gap: 20,
          boxShadow: "0 4px 16px rgba(245, 158, 11, 0.12)",
        }}
      >
        <div style={{ fontSize: 42 }}>🎁</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 18, color: "#78350F" }}>
            Free Developer AI Starter Pack
          </div>
          <div style={{ fontFamily: interFont, fontWeight: 600, fontSize: 13.5, color: "#92400E", marginTop: 2 }}>
            Includes system prompt templates, local LLM scripts & agent setup blueprints.
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#F59E0B",
            color: "#FFFFFF",
            fontFamily: interFont,
            fontWeight: 900,
            fontSize: 13,
            padding: "6px 16px",
            borderRadius: 999,
          }}
        >
          100% FREE
        </div>
      </div>

      {/* COMMUNITY PLATFORMS ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        {[
          { icon: "⚡", title: "Daily Alpha", desc: "Short video drops", tag: "Everyday", color: "#DCFCE7", textColor: "#15803D" },
          { icon: "🛠️", title: "Open Source", desc: "GitHub scripts", tag: "Repos", color: "#DBEAFE", textColor: "#1E40AF" },
          { icon: "💬", title: "Community", desc: "Discord & chat", tag: "Builders", color: "#FCE7F3", textColor: "#9D174D" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: "#F8FAFC",
              borderRadius: 16,
              padding: "14px 16px",
              border: "1.5px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontFamily: interFont, fontWeight: 800, fontSize: 11, backgroundColor: item.color, color: item.textColor, padding: "2px 8px", borderRadius: 999 }}>
                {item.tag}
              </span>
            </div>
            <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 14, color: "#0F172A", marginTop: 4 }}>
              {item.title}
            </div>
            <div style={{ fontFamily: interFont, fontWeight: 600, fontSize: 11.5, color: "#64748B" }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* PULSING INTERACTIVE CALLOUT */}
      <div
        style={{
          transform: `scale(${pulseScale})`,
          backgroundColor: "#EA580C",
          color: "#FFFFFF",
          fontFamily: interFont,
          fontWeight: 900,
          fontSize: 16,
          textAlign: "center",
          padding: "14px 24px",
          borderRadius: 16,
          letterSpacing: "0.5px",
          boxShadow: "0 6px 20px rgba(234, 88, 12, 0.35)",
        }}
      >
        👇 COMMENT "BITTU" FOR DIRECT ACCESS! 👇
      </div>
    </div>
  );
};
