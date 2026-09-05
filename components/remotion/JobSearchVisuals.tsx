"use client";

import React from "react";
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

function resolveMediaSource(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/api/")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

// --- VECTOR SVG PLATFORM & TECH ICONS ---
export const TechIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 18 }) => {
  const iconMap: Record<string, React.ReactNode> = {
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width={24} height={24} rx={6} fill="#0A66C2" />
        <path
          d="M7.5 9.5V17.5M7.5 6.8V6.9M12 17.5V12.8C12 11.2 13 10.2 14.5 10.2C16 10.2 16.5 11.2 16.5 12.8V17.5M12 12.8V9.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    indeed: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width={24} height={24} rx={6} fill="#2164f3" />
        <path
          d="M12.5 4C9.5 4 8 6 8 8.5V18.5H11.5V11.5C11.5 9.8 12.5 8.5 14 8.5C15.5 8.5 16 9.8 16 11.5V18.5H19.5V11C19.5 7.5 17 4 12.5 4Z"
          fill="white"
        />
      </svg>
    ),
    wellfound: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width={24} height={24} rx={6} fill="#FF4F00" />
        <path d="M7 8L10 16L12 11L14 16L17 8H14.5L13 12.5L12 9.5L11 12.5L9.5 8H7Z" fill="white" />
      </svg>
    ),
    github: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width={24} height={24} rx={6} fill="#181717" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 4C7.58 4 4 7.58 4 12C4 15.54 6.29 18.53 9.47 19.59C9.87 19.66 10.02 19.42 10.02 19.21C10.02 19.02 10.01 18.39 10.01 17.65C8 18.02 7.47 17.06 7.31 16.61C7.22 16.38 6.83 15.68 6.49 15.49C6.21 15.34 5.81 14.97 6.48 14.96C7.11 14.95 7.56 15.54 7.71 15.78C8.43 17 9.59 16.66 10.05 16.45C10.12 15.93 10.33 15.58 10.56 15.38C8.8 15.18 6.96 14.5 6.96 11.47C6.96 10.61 7.27 9.9 7.78 9.35C7.7 9.15 7.42 8.34 7.86 7.25C7.86 7.25 8.52 7.04 10.02 8.06C10.65 7.88 11.33 7.79 12 7.79C12.67 7.79 13.35 7.88 13.98 8.06C15.48 7.03 16.14 7.25 16.14 7.25C16.58 8.34 16.3 9.15 16.22 9.35C16.73 9.9 17.04 10.6 17.04 11.47C17.04 14.52 15.19 15.18 13.42 15.38C13.71 15.63 13.96 16.11 13.96 16.86C13.96 17.93 13.95 18.8 13.95 19.21C13.95 19.42 14.1 19.67 14.5 19.59C17.7 18.53 20 15.53 20 12C20 7.58 16.42 4 12 4Z"
          fill="white"
        />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx={12} cy={12} r={10} fill="#22C55E" />
        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
        width: "580px",
        height: "680px",
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
// 1. DYNAMIC JOB FINDER CARD (0.0s - 2.77s)
// =========================================================================
export const DynamicJobFinderCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.min(142, Math.floor(interpolate(frame, [0, 40], [0, 142], { extrapolateRight: "clamp" })));
  const highlightWidth = interpolate(frame, [10, 40], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const card1Spring = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const card2Spring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const card3Spring = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 14, stiffness: 180 } });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "32px", fontWeight: 950, color: "#111827", lineHeight: "1.1", fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              AI JOB <span style={{ color: "#2563EB" }}>SEARCH</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              Autonomous agent discovers high-paying roles
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
            🔥 {count} Matches Found
          </div>
        </div>

        {/* Matched Job Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* Job 1: Hero Match */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "16px 18px",
              border: "2px solid #2563EB",
              boxShadow: "0 12px 30px rgba(37, 99, 235, 0.15)",
              transform: `scale(${card1Spring})`,
              transformOrigin: "center top",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #2563EB, #60A5FA)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "17px" }}>
                  AI
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Senior AI Engineer</span>
                    <TechIcon name="linkedin" size={15} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#4B5563", fontWeight: 600 }}>Stripe • Remote • $185k - $240k</div>
                </div>
              </div>
              <div style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "4px 10px", borderRadius: "8px", fontWeight: 900, fontSize: "11px" }}>
                98% Match
              </div>
            </div>

            {/* Highlighter Stroke */}
            <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-2px -4px",
                  background: "rgba(37, 99, 235, 0.20)",
                  borderRadius: "5px",
                  width: `${highlightWidth}%`,
                }}
              />
              <span style={{ position: "relative", fontSize: "11px", fontWeight: 800, color: "#1E40AF" }}>
                Skills: Python • PyTorch • Agent Workflows • RAG
              </span>
            </div>
          </div>

          {/* Job 2 */}
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
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#FFEDD5", color: "#C2410C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>
                YC
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Fullstack AI Developer</span>
                  <TechIcon name="wellfound" size={14} />
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>Linear (YC W20) • $150k - $190k</div>
              </div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>95% Match</span>
          </div>

          {/* Job 3 */}
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
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#E0E7FF", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>
                OA
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1F2937" }}>ML Systems Engineer</div>
                <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>OpenAI • San Francisco / Remote</div>
              </div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>92% Match</span>
          </div>
        </div>

        {/* Footer Badge */}
        <div style={{ background: "#111827", borderRadius: "14px", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#FFF", fontWeight: 800, fontSize: "12px" }}>
          <span>⚡ 100% Automated Job Matching Across 10+ Portals</span>
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 2. DYNAMIC ATS OPTIMIZER CARD (2.77s - 6.37s)
// =========================================================================
export const DynamicAtsOptimizerCard: React.FC = () => {
  const frame = useCurrentFrame();
  const score = Math.min(98, Math.floor(interpolate(frame, [0, 35], [62, 98], { extrapolateRight: "clamp" })));
  const progressWidth = interpolate(frame, [0, 35], [62, 98], { extrapolateRight: "clamp" });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
              ATS RESUME <span style={{ color: "#10B981" }}>OPTIMIZER</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              Tailors your CV keywords for each job description
            </div>
          </div>
          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #10B981",
              color: "#047857",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <TechIcon name="check" size={14} />
            ATS Passed
          </div>
        </div>

        {/* Live ATS Score Box */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "18px 20px", border: "2px solid #10B981", boxShadow: "0 10px 30px rgba(16, 185, 129, 0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#6B7280" }}>JOB RELEVANCY SCORE</div>
              <div style={{ fontSize: "38px", fontWeight: 950, color: "#065F46", lineHeight: 1, marginTop: "4px" }}>
                {score}%
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#10B981" }}>GREENHOUSE & LEVER</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>Top 1% Candidate Match</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: "100%", height: "10px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden", marginTop: "14px" }}>
            <div style={{ width: `${progressWidth}%`, height: "100%", background: "linear-gradient(90deg, #10B981, #059669)", borderRadius: "999px" }} />
          </div>
        </div>

        {/* Dynamic Injected Keywords */}
        <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "14px 18px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#374151" }}>AUTOMATICALLY INJECTED KEYWORDS:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["+ Agent Workflows", "+ LangChain", "+ Vector DBs", "+ Next.js 15", "+ Python", "+ ATS Optimized"].map((kw, i) => (
              <span key={i} style={{ background: "#F0FDF4", color: "#15803D", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, border: "1px solid #BBF7D0" }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ background: "#1E293B", borderRadius: "14px", padding: "10px 16px", color: "#F8FAFC", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          ✓ Generates a custom ATS-tailored PDF resume in 2 seconds
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 3. DYNAMIC AUTO APPLY PIPELINE CARD (6.37s - 8.82s)
// =========================================================================
export const DynamicAutoApplyPipelineCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const item1Spring = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const item2Spring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14, stiffness: 180 } });
  const item3Spring = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 14, stiffness: 180 } });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
              1-CLICK <span style={{ color: "#7C3AED" }}>AUTO-APPLY</span>
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
              Fills application forms & submits tailored CVs
            </div>
          </div>
          <div
            style={{
              background: "#EDE9FE",
              color: "#6D28D9",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 900,
            }}
          >
            🚀 Auto-Pilot
          </div>
        </div>

        {/* Pipeline List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "14px 18px",
              border: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${item1Spring})`,
            }}
          >
            <div>
              <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827" }}>Stripe — AI Engineer</div>
              <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>Cover Letter & Resume Submitted</div>
            </div>
            <span style={{ background: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 900 }}>
              ✓ APPLIED
            </span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "14px 18px",
              border: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${item2Spring})`,
            }}
          >
            <div>
              <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827" }}>Linear — Fullstack AI</div>
              <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>Portfolio & GitHub Linked</div>
            </div>
            <span style={{ background: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 900 }}>
              ✓ APPLIED
            </span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "14px 18px",
              border: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${item3Spring})`,
            }}
          >
            <div>
              <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827" }}>OpenAI — ML Systems</div>
              <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>Greenhouse Form Auto-Submitted</div>
            </div>
            <span style={{ background: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 900 }}>
              ✓ APPLIED
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#111827", borderRadius: "14px", padding: "10px 16px", color: "#FFF", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          ⚡ 24/7 Background Applications Sent Without Lifting a Finger
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 4. DYNAMIC THREE COMMANDS HUB (8.82s - 10.22s)
// =========================================================================
export const DynamicThreeCommandsCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const c2 = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14, stiffness: 180 } });
  const c3 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 180 } });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: "32px", fontWeight: 950, color: "#111827", lineHeight: "1.1" }}>
            3 SIMPLE <span style={{ color: "#2563EB" }}>COMMANDS</span>
          </div>
          <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px", fontWeight: 600 }}>
            Complete job search automation workflow
          </div>
        </div>

        {/* 3 Step Pill Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 18px", border: "2px solid #2563EB", display: "flex", alignItems: "center", gap: "14px", transform: `scale(${c1})` }}>
            <div style={{ background: "#2563EB", color: "#FFF", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>1</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 950, color: "#111827", fontFamily: "monospace" }}>/setup</div>
              <div style={{ fontSize: "12px", color: "#4B5563", fontWeight: 700 }}>Profile, CV & Skills Builder</div>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 18px", border: "2px solid #059669", display: "flex", alignItems: "center", gap: "14px", transform: `scale(${c2})` }}>
            <div style={{ background: "#059669", color: "#FFF", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>2</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 950, color: "#111827", fontFamily: "monospace" }}>/scrape</div>
              <div style={{ fontSize: "12px", color: "#4B5563", fontWeight: 700 }}>Auto-Match Across All Job Portals</div>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 18px", border: "2px solid #7C3AED", display: "flex", alignItems: "center", gap: "14px", transform: `scale(${c3})` }}>
            <div style={{ background: "#7C3AED", color: "#FFF", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>3</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 950, color: "#111827", fontFamily: "monospace" }}>/apply</div>
              <div style={{ fontSize: "12px", color: "#4B5563", fontWeight: 700 }}>ATS Resume Tailor & Auto-Submit</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#0F172A", borderRadius: "14px", padding: "10px 16px", color: "#38BDF8", fontWeight: 800, fontSize: "12px", textAlign: "center", fontFamily: "monospace" }}>
          $ git clone ai-job-hunter && npm run start
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 5. STEP 1: /SETUP COMMAND CARD (10.22s - 16.12s)
// =========================================================================
export const DynamicSetupCommandCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedChars = Math.min(18, Math.floor(interpolate(frame, [0, 20], [0, 18], { extrapolateRight: "clamp" })));
  const fullCommand = "> /setup --profile";
  const typedText = fullCommand.slice(0, typedChars);

  const badgeSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 14, stiffness: 180 } });

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Step Badge & Title */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DBEAFE", color: "#1D4ED8", padding: "6px 14px", borderRadius: "999px", fontWeight: 900, fontSize: "13px", letterSpacing: "0.5px" }}>
            <span>⚡ STEP 1</span>
            <span>•</span>
            <span>PROFILE SETUP</span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", marginTop: "8px", lineHeight: "1.1" }}>
            COMMAND: <span style={{ color: "#2563EB", fontFamily: "monospace" }}>/setup</span>
          </div>
        </div>

        {/* Terminal Box */}
        <div style={{ background: "#0F172A", borderRadius: "18px", padding: "18px 20px", color: "#F8FAFC", fontFamily: "monospace", fontSize: "14px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)" }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }} />
          </div>
          <div style={{ color: "#38BDF8", fontWeight: 800 }}>
            {typedText}
            <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0 }}>_</span>
          </div>
          <div style={{ marginTop: "10px", color: "#94A3B8", fontSize: "12px", lineHeight: 1.5 }}>
            [✓] Reading resume.pdf...<br />
            [✓] Extracting 5+ yrs experience...<br />
            [✓] Skills mapped: React, Python, AI...<br />
            [✓] Master Candidate Profile Created!
          </div>
        </div>

        {/* Extracted Profile Snippet */}
        <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 18px", border: "1px solid #E5E7EB", transform: `scale(${badgeSpring})` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#111827" }}>Profile Database Ready</div>
            <span style={{ color: "#16A34A", fontWeight: 900, fontSize: "12px" }}>✓ COMPLETE</span>
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
            All candidate bio, experience, GitHub, portfolio & preferences configured.
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#1E293B", borderRadius: "14px", padding: "10px 16px", color: "#FFF", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          One-time setup takes under 30 seconds!
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 6. STEP 2: /SCRAPE COMMAND CARD (16.12s - 22.12s)
// =========================================================================
export const DynamicScrapeCommandCard: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.min(380, Math.floor(interpolate(frame, [0, 45], [50, 380], { extrapolateRight: "clamp" })));

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Step Badge & Title */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DCFCE7", color: "#15803D", padding: "6px 14px", borderRadius: "999px", fontWeight: 900, fontSize: "13px", letterSpacing: "0.5px" }}>
            <span>⚡ STEP 2</span>
            <span>•</span>
            <span>AUTO-MATCH & SCRAPE</span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", marginTop: "8px", lineHeight: "1.1" }}>
            COMMAND: <span style={{ color: "#059669", fontFamily: "monospace" }}>/scrape</span>
          </div>
        </div>

        {/* Terminal Box */}
        <div style={{ background: "#0F172A", borderRadius: "18px", padding: "16px 20px", color: "#F8FAFC", fontFamily: "monospace", fontSize: "13px" }}>
          <div style={{ color: "#34D399", fontWeight: 800 }}>&gt; /scrape --portals=all --min-match=90%</div>
          <div style={{ marginTop: "8px", color: "#94A3B8", fontSize: "11px", lineHeight: 1.5 }}>
            Scanning LinkedIn Jobs... [✓ 124 roles]<br />
            Scanning Indeed & Wellfound... [✓ 180 roles]<br />
            Scanning Greenhouse & Lever... [✓ 76 roles]
          </div>
        </div>

        {/* Live Portal Scraper Feeds */}
        <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 18px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 800, color: "#374151" }}>
            <span>PORTALS SCANNED</span>
            <span style={{ color: "#059669" }}>{count}+ JOBS FOUND</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800 }}>
              <TechIcon name="linkedin" size={16} /> LinkedIn (120+)
            </div>
            <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800 }}>
              <TechIcon name="indeed" size={16} /> Indeed (140+)
            </div>
            <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800 }}>
              <TechIcon name="wellfound" size={16} /> Wellfound (80+)
            </div>
            <div style={{ background: "#F8FAFC", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800 }}>
              <TechIcon name="github" size={16} /> Remote Portals
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#111827", borderRadius: "14px", padding: "10px 16px", color: "#FFF", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          Filters only the highest-intent jobs matching your skills!
        </div>
      </div>
    </MotionCardShell>
  );
};

// =========================================================================
// 7. STEP 3: /APPLY COMMAND CARD (22.12s - 28.97s)
// =========================================================================
export const DynamicApplyCommandCard: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.min(15, Math.floor(interpolate(frame, [0, 45], [1, 15], { extrapolateRight: "clamp" })));

  return (
    <MotionCardShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        
        {/* Step Badge & Title */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#EDE9FE", color: "#6D28D9", padding: "6px 14px", borderRadius: "999px", fontWeight: 900, fontSize: "13px", letterSpacing: "0.5px" }}>
            <span>⚡ STEP 3</span>
            <span>•</span>
            <span>ATS OPTIMIZE & APPLY</span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 950, color: "#111827", marginTop: "8px", lineHeight: "1.1" }}>
            COMMAND: <span style={{ color: "#7C3AED", fontFamily: "monospace" }}>/apply</span>
          </div>
        </div>

        {/* Terminal Box */}
        <div style={{ background: "#0F172A", borderRadius: "18px", padding: "16px 20px", color: "#F8FAFC", fontFamily: "monospace", fontSize: "13px" }}>
          <div style={{ color: "#A78BFA", fontWeight: 800 }}>&gt; /apply --tailor-cv --auto-submit</div>
          <div style={{ marginTop: "8px", color: "#94A3B8", fontSize: "11px", lineHeight: 1.5 }}>
            [1] Injecting tailored keywords... [ATS: 99%]<br />
            [2] Generating PDF Resume & Cover Letter...<br />
            [3] Submitting application forms...
          </div>
        </div>

        {/* Live Application Dispatcher */}
        <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "14px 18px", border: "2px solid #7C3AED", boxShadow: "0 10px 30px rgba(124, 58, 237, 0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 950, color: "#111827" }}>
              Live Applications Dispatched
            </div>
            <div style={{ background: "#7C3AED", color: "#FFF", padding: "4px 10px", borderRadius: "8px", fontWeight: 900, fontSize: "12px" }}>
              {count} Sent 🚀
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#4B5563", marginTop: "6px", fontWeight: 600 }}>
            Every submission is 100% customized for the specific job description!
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#065F46", borderRadius: "14px", padding: "10px 16px", color: "#FFF", fontWeight: 800, fontSize: "12px", textAlign: "center" }}>
          ✓ Verified Submissions with zero manual copy-pasting
        </div>
      </div>
    </MotionCardShell>
  );
};
