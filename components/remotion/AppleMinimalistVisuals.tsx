"use client";

import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

function resolveMediaSource(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/api/")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

// --- VECTOR SVG PLATFORM ICONS ---
export const PlatformIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 18 }) => {
  const iconMap: Record<string, React.ReactNode> = {
    youtube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#FF0000" />
        <path d="M9.5 8L16 12L9.5 16V8Z" fill="white" />
      </svg>
    ),
    twitter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#000000" />
        <path
          d="M14.2 6H16.8L11.2 12.4L17.8 21H12.6L8.5 15.6L3.9 21H1.3L7.3 14.1L1 6H6.3L10.1 11L14.2 6ZM13.3 19.4H14.7L5.8 7.5H4.3L13.3 19.4Z"
          fill="white"
        />
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#0A66C2" />
        <path
          d="M7.5 9.5V17.5M7.5 6.8V6.9M12 17.5V12.8C12 11.2 13 10.2 14.5 10.2C16 10.2 16.5 11.2 16.5 12.8V17.5M12 12.8V9.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <radialGradient id="ig-grad-v6" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#ig-grad-v6)" />
        <rect x="5.5" y="5.5" width="13" height="13" rx="3.8" stroke="white" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.8" />
        <circle cx="15.8" cy="8.2" r="0.9" fill="white" />
      </svg>
    ),
    reddit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#FF4500" />
        <path
          d="M12 7.5V10.2M12 7.5L14.8 6.8L15.6 8.2M17.5 12.5C18.3 12.5 19 13.2 19 14C19 14.8 18.3 15.5 17.5 15.5M6.5 12.5C5.7 12.5 5 13.2 5 14C5 14.8 5.7 15.5 6.5 15.5M17.5 14C17.5 16.5 15 18 12 18C9 18 6.5 16.5 6.5 14C6.5 11.5 9 10 12 10C15 10 17.5 11.5 17.5 14ZM10 13.5V14M14 13.5V14M10 16C10.6 16.6 11.3 16.8 12 16.8C12.7 16.8 13.4 16.6 14 16"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    tiktok: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#000000" />
        <path
          d="M14.5 6C15 7.5 16.2 8.5 18 8.8V11.2C16.8 11.2 15.8 10.8 15 10.2V15C15 17.2 13.2 19 11 19C8.8 19 7 17.2 7 15C7 12.8 8.8 11 11 11C11.3 11 11.7 11.05 12 11.15V13.6C11.7 13.5 11.4 13.4 11 13.4C10.1 13.4 9.4 14.1 9.4 15C9.4 15.9 10.1 16.6 11 16.6C11.9 16.6 12.6 15.9 12.6 15V6H14.5Z"
          fill="white"
        />
      </svg>
    ),
    discord: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#5865F2" />
        <path
          d="M16.5 8.2C15.4 7.7 14.2 7.3 13 7.1C12.8 7.4 12.6 7.8 12.5 8.1C11.2 7.9 9.8 7.9 8.5 8.1C8.4 7.8 8.2 7.4 8 7.1C6.8 7.3 5.6 7.7 4.5 8.2C2.5 11.2 2 14.1 2.2 17C3.6 18 5 18.7 6.3 19.1C6.7 18.6 7 18 7.2 17.4C6.7 17.2 6.2 16.9 5.8 16.6C5.9 16.5 6 16.4 6.1 16.3C8.8 17.5 11.7 17.5 14.4 16.3C14.5 16.4 14.6 16.5 14.7 16.6C14.3 16.9 13.8 17.2 13.3 17.4C13.5 18 13.8 18.6 14.2 19.1C15.5 18.7 16.9 18 18.3 17C18.6 13.6 17.7 10.8 16.5 8.2ZM7.5 14.5C6.7 14.5 6 13.8 6 13C6 12.2 6.7 11.5 7.5 11.5C8.3 11.5 9 12.2 9 13C9 13.8 8.3 14.5 7.5 14.5ZM13.5 14.5C12.7 14.5 12 13.8 12 13C12 12.2 12.7 11.5 13.5 11.5C14.3 11.5 15 12.2 15 13C15 13.8 14.3 14.5 13.5 14.5Z"
          fill="white"
        />
      </svg>
    ),
    telegram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#229ED9" />
        <path d="M17.5 6.5L4.5 11.5L9 13.5L15 9.5L10.5 14.5L15.5 18L17.5 6.5Z" fill="white" />
      </svg>
    ),
    github: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#181717" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 4C7.58 4 4 7.58 4 12C4 15.54 6.29 18.53 9.47 19.59C9.87 19.66 10.02 19.42 10.02 19.21C10.02 19.02 10.01 18.39 10.01 17.65C8 18.02 7.47 17.06 7.31 16.61C7.22 16.38 6.83 15.68 6.49 15.49C6.21 15.34 5.81 14.97 6.48 14.96C7.11 14.95 7.56 15.54 7.71 15.78C8.43 17 9.59 16.66 10.05 16.45C10.12 15.93 10.33 15.58 10.56 15.38C8.8 15.18 6.96 14.5 6.96 11.47C6.96 10.61 7.27 9.9 7.78 9.35C7.7 9.15 7.42 8.34 7.86 7.25C7.86 7.25 8.52 7.04 10.02 8.06C10.65 7.88 11.33 7.79 12 7.79C12.67 7.79 13.35 7.88 13.98 8.06C15.48 7.03 16.14 7.25 16.14 7.25C16.58 8.34 16.3 9.15 16.22 9.35C16.73 9.9 17.04 10.6 17.04 11.47C17.04 14.52 15.19 15.18 13.42 15.38C13.71 15.63 13.96 16.11 13.96 16.86C13.96 17.93 13.95 18.8 13.95 19.21C13.95 19.42 14.1 19.67 14.5 19.59C17.7 18.53 20 15.53 20 12C20 7.58 16.42 4 12 4Z"
          fill="white"
        />
      </svg>
    ),
  };

  return <>{iconMap[name.toLowerCase()] ?? null}</>;
};

// --- BASE PREMIUM CARD CONTAINER ---
export const MotionCardShell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const floatY = Math.sin((frame / fps) * 1.5) * 3;

  return (
    <div
      style={{
        position: "relative",
        width: "600px",
        height: "800px",
        borderRadius: "28px",
        overflow: "hidden",
        backgroundColor: "#FAF7F2",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.05)",
        border: "3px solid rgba(255, 255, 255, 0.95)",
        display: "flex",
        flexDirection: "column",
        transform: `translateY(${floatY}px)`,
        boxSizing: "border-box",
        padding: "24px 28px",
      }}
    >
      {children}
    </div>
  );
};

// =========================================================================
// 1. DYNAMIC NATIVE LEAD FINDER (0.0s - 4.09s: "Leads dhund sakte ho")
// =========================================================================
export const DynamicLeadFinderCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.min(48, Math.floor(interpolate(frame, [0, 45], [0, 48], { extrapolateRight: "clamp" })));
  const highlightWidth = interpolate(frame, [15, 45], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const card1Spring = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const card2Spring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14, stiffness: 180 } });
  const card3Spring = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 14, stiffness: 180 } });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "32px", fontWeight: 950, color: "#111827", lineHeight: "1.1", fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}>
              FIND <span style={{ color: "#FF6B00" }}>NEW LEADS</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              AI scans 13+ platforms for high-intent buyers
            </div>
          </div>
          <div
            style={{
              background: "rgba(18, 20, 28, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
            🔥 {count} Leads
          </div>
        </div>

        {/* Lead Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* Card 1: Hero Match */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "16px 18px",
              border: "2px solid #FF6B00",
              boxShadow: "0 12px 30px rgba(255, 107, 0, 0.15)",
              transform: `scale(${card1Spring})`,
              transformOrigin: "center top",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "17px" }}>
                  RB
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Rohit Bansal</span>
                    <PlatformIcon name="linkedin" size={15} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#4B5563", fontWeight: 600 }}>CEO @ TechScale • Active Buyer</div>
                </div>
              </div>
              <div style={{ background: "#FFEDD5", color: "#C2410C", padding: "4px 10px", borderRadius: "8px", fontWeight: 900, fontSize: "11px" }}>
                Score: 94%
              </div>
            </div>

            {/* Highlighter Stroke */}
            <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-2px -4px",
                  background: "rgba(255, 107, 0, 0.22)",
                  borderRadius: "5px",
                  width: `${highlightWidth}%`,
                }}
              />
              <span style={{ position: "relative", fontSize: "11px", fontWeight: 800, color: "#9A3412" }}>
                Intent: Actively hiring AI agents & automation tools
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "12px 18px",
              border: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${card2Spring})`,
              transformOrigin: "center top",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#E0E7FF", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>
                NS
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Neha Sharma</span>
                  <PlatformIcon name="twitter" size={14} />
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>Head of Growth @ Growthify</div>
              </div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>Score: 88%</span>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "12px 18px",
              border: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${card3Spring})`,
              transformOrigin: "center top",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>
                AM
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937" }}>Arjun Mehta</div>
                <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>Founder @ Bravvo AI</div>
              </div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>Score: 82%</span>
          </div>
        </div>

        {/* Footer Badge */}
        <div style={{ background: "#111827", borderRadius: "14px", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#FFF", fontWeight: 800, fontSize: "12px" }}>
          <span>✓ Qualified leads ready for instant outreach</span>
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 2. DYNAMIC NATIVE MARKET RESEARCH (4.09s - 5.48s: "Market research karo")
// =========================================================================
export const DynamicMarketResearchCard: React.FC = () => {
  const frame = useCurrentFrame();

  const bar1 = interpolate(frame, [0, 25], [15, 78], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar2 = interpolate(frame, [4, 28], [15, 92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar3 = interpolate(frame, [8, 32], [15, 65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar4 = interpolate(frame, [12, 36], [15, 84], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "32px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
              MARKET <span style={{ color: "#FF6B00" }}>RESEARCH</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              Real-time consumer data & trends across the web
            </div>
          </div>
          <div
            style={{
              background: "rgba(18, 20, 28, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
            Live Intel
          </div>
        </div>

        {/* Live Sentiment Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#FFF", borderRadius: "16px", padding: "14px 16px", border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700 }}>Customer Sentiment</div>
            <div style={{ fontSize: "24px", fontWeight: 950, color: "#059669", marginTop: "2px" }}>68% Positive</div>
          </div>
          <div style={{ background: "#FFF", borderRadius: "16px", padding: "14px 16px", border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700 }}>Trending Topics</div>
            <div style={{ fontSize: "24px", fontWeight: 950, color: "#FF6B00", marginTop: "2px" }}>12 Emerging</div>
          </div>
        </div>

        {/* Sources Analyzed Dynamic Bars */}
        <div style={{ background: "#FFF", borderRadius: "18px", padding: "16px 18px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151" }}>SOURCES ANALYZED (11.1K+ DATA POINTS)</div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlatformIcon name="reddit" size={16} />
            <div style={{ flex: 1, height: "8px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${bar1}%`, height: "100%", background: "#FF4500", borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#4B5563" }}>2.3K</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlatformIcon name="twitter" size={16} />
            <div style={{ flex: 1, height: "8px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${bar2}%`, height: "100%", background: "#111827", borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#4B5563" }}>3.7K</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlatformIcon name="youtube" size={16} />
            <div style={{ flex: 1, height: "8px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${bar3}%`, height: "100%", background: "#FF0000", borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#4B5563" }}>1.8K</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PlatformIcon name="linkedin" size={16} />
            <div style={{ flex: 1, height: "8px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${bar4}%`, height: "100%", background: "#0A66C2", borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#4B5563" }}>1.2K</span>
          </div>
        </div>

        <div style={{ background: "#EEF2FF", borderRadius: "14px", padding: "10px 16px", color: "#3730A3", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          💡 High market demand for Zero-API Autonomous AI Automation
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 3. DYNAMIC NATIVE COMPETITOR RADAR (5.48s - 9.42s: "Competitors track karo")
// =========================================================================
export const DynamicCompetitorRadarCard: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
              TRACK <span style={{ color: "#FF6B00" }}>COMPETITORS</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              Monitor activity, content & growth live
            </div>
          </div>
          <div
            style={{
              background: "rgba(18, 20, 28, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
            25+ Brands
          </div>
        </div>

        {/* Competitor Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* Nike */}
          <div style={{ background: "#111827", borderRadius: "18px", padding: "14px 18px", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#1E2230", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "17px" }}>
                N
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 900 }}>Nike <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>@nike</span></div>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <PlatformIcon name="instagram" size={13} />
                  <PlatformIcon name="twitter" size={13} />
                  <PlatformIcon name="tiktok" size={13} />
                </div>
              </div>
            </div>
            <div style={{ color: "#22C55E", fontWeight: 900, fontSize: "15px" }}>
              ▲ 18% Growth
            </div>
          </div>

          {/* Zomato */}
          <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "14px 18px", border: "1.5px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#E23744", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "17px" }}>
                Z
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827" }}>Zomato <span style={{ color: "#6B7280", fontSize: "11px" }}>@zomato</span></div>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <PlatformIcon name="instagram" size={13} />
                  <PlatformIcon name="twitter" size={13} />
                  <PlatformIcon name="linkedin" size={13} />
                </div>
              </div>
            </div>
            <div style={{ color: "#22C55E", fontWeight: 900, fontSize: "15px" }}>
              ▲ 12% Viral
            </div>
          </div>

          {/* Apple */}
          <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "14px 18px", border: "1.5px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#000000", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "17px" }}>
                
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827" }}>Apple <span style={{ color: "#6B7280", fontSize: "11px" }}>@apple</span></div>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <PlatformIcon name="youtube" size={13} />
                  <PlatformIcon name="twitter" size={13} />
                </div>
              </div>
            </div>
            <div style={{ color: "#22C55E", fontWeight: 900, fontSize: "15px" }}>
              ▲ 9% Keynote
            </div>
          </div>
        </div>

        <div style={{ background: "#FFEDD5", borderRadius: "14px", padding: "10px 16px", color: "#C2410C", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          🔔 Nike posted new viral reel (Engagement spiking +240%)
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 4. DYNAMIC NATIVE 13+ PLATFORMS NETWORK (10.4s - 15.25s: "13+ platforms")
// =========================================================================
export const DynamicPlatformsNetworkCard: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.15) * 0.05;

  const platforms = [
    { name: "youtube", label: "YouTube" },
    { name: "twitter", label: "Twitter / X" },
    { name: "linkedin", label: "LinkedIn" },
    { name: "instagram", label: "Instagram" },
    { name: "reddit", label: "Reddit" },
    { name: "tiktok", label: "TikTok" },
    { name: "discord", label: "Discord" },
    { name: "telegram", label: "Telegram" },
    { name: "github", label: "GitHub" },
  ];

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", alignItems: "center" }}>
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
          <div>
            <div style={{ fontSize: "32px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
              13+ <span style={{ color: "#FF6B00" }}>PLATFORMS</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              1 AI Agent collects everything at once
            </div>
          </div>
          <div
            style={{
              background: "rgba(18, 20, 28, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
            All-In-One
          </div>
        </div>

        {/* Central Glowing AI Core */}
        <div
          style={{
            width: "86px",
            height: "86px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${pulse})`,
            boxShadow: "0 0 40px rgba(255, 107, 0, 0.7)",
            border: "3px solid #FFF",
          }}
        >
          <span style={{ fontSize: "32px" }}>🤖</span>
          <span style={{ color: "#FFF", fontWeight: 900, fontSize: "10px", letterSpacing: "1px" }}>AI AGENT</span>
        </div>

        {/* Platform Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", width: "100%" }}>
          {platforms.map((item) => (
            <div
              key={item.name}
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E5E7EB",
                borderRadius: "14px",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <PlatformIcon name={item.name} size={16} />
              <span style={{ color: "#1F2937", fontWeight: 800, fontSize: "11px" }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", borderRadius: "14px", padding: "10px 18px", color: "#FFF", fontWeight: 800, fontSize: "12px", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
          ⚡ Cross-Platform Live Scraping • Zero Rate Limits
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 5. DYNAMIC ZERO API / FREE SYSTEM SPECS (22.75s - 27.35s: "Zero API / Free")
// =========================================================================
export const DynamicZeroApiCard: React.FC = () => {
  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
              ZERO <span style={{ color: "#FF6B00" }}>API HEADACHE</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              No separate API keys or paid subscriptions
            </div>
          </div>
          <div
            style={{
              background: "rgba(18, 20, 28, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
            100% Free
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#FFF", borderRadius: "18px", padding: "16px 20px", border: "1.5px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700 }}>API KEYS NEEDED</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#111827", marginTop: "2px" }}>13+ Separate Keys</div>
            </div>
            <div style={{ background: "#ECFDF5", color: "#059669", padding: "6px 12px", borderRadius: "10px", fontWeight: 900, fontSize: "14px" }}>
              ➔ 0 Keys Needed ●
            </div>
          </div>

          <div style={{ background: "#FFF", borderRadius: "18px", padding: "16px 20px", border: "1.5px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700 }}>PLATFORM CONNECTORS</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#111827", marginTop: "2px" }}>1-by-1 Manual</div>
            </div>
            <div style={{ background: "#EEF2FF", color: "#4F46E5", padding: "6px 12px", borderRadius: "10px", fontWeight: 900, fontSize: "14px" }}>
              ➔ 13+ All-In-One ●
            </div>
          </div>

          <div style={{ background: "#FFF", borderRadius: "18px", padding: "16px 20px", border: "2px solid #22C55E", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 25px rgba(34, 197, 94, 0.15)" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700 }}>MONTHLY COST</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#DC2626", textDecoration: "line-through", marginTop: "2px" }}>$499 / month</div>
            </div>
            <div style={{ background: "#22C55E", color: "#FFF", padding: "6px 16px", borderRadius: "10px", fontWeight: 950, fontSize: "16px" }}>
              $0 (100% FREE)
            </div>
          </div>
        </div>

        <div style={{ background: "#111827", borderRadius: "14px", padding: "12px 18px", color: "#FFF", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          🚀 Ready to deploy in under 60 seconds
        </div>
      </div>
    </MotionCardShell>
  );
};
