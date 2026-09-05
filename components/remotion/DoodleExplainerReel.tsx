import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import {
  interFont,
  appleGaramondFont,
  cleanOutlineShadow,
} from "./eight-bit/typography";

// ----------------------------------------------------
// 1. POLISHED PIXEL MASCOT COMPONENT ("BITTU")
// Natural walking kinematics, cute grounded idle, smooth single hops on scene entry
// ----------------------------------------------------
export const PixelMascot: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  color?: string;
  isWalking?: boolean;
  isTyping?: boolean;
  hopTriggerFrame?: number; // Smooth single jump on scene entrance
  armsRaised?: boolean;
  emote?: "lightbulb" | "sparkle" | "trophy" | "exclamation";
}> = ({
  x = 0,
  y = 0,
  scale = 1,
  color = "#E07A5F",
  isWalking = false,
  isTyping = false,
  hopTriggerFrame = -1,
  armsRaised = false,
  emote,
}) => {
  const frame = useCurrentFrame();

  // 4-Leg Alternating Walking Gait (Smooth sine cycle)
  const legCycle = isWalking ? Math.sin((frame / 4.0) * Math.PI) : 0;
  const leg1_3_Scale = isWalking ? interpolate(legCycle, [-1, 1], [0.65, 1.0]) : 1;
  const leg2_4_Scale = isWalking ? interpolate(legCycle, [-1, 1], [1.0, 0.65]) : 1;

  // Gentle Walk Bob (only 2px, grounded and natural)
  const walkBob = isWalking ? Math.abs(Math.sin((frame / 4.0) * Math.PI)) * 2 : 0;

  // Eye Blink every 60 frames (~2s)
  const blinkCycle = frame % 60;
  const eyeScaleY = blinkCycle > 56 ? 0.1 : 1.0;

  // Typing Arm Oscillation
  const typingOffset = isTyping ? Math.sin(frame * 1.2) * 4 : 0;

  // Smooth Single Entrance Hop (Squash -> Arc Jump -> Land Settle)
  let hopY = 0;
  let squashX = 1;
  let squashY = 1;

  if (hopTriggerFrame >= 0) {
    const hopProgress = frame - hopTriggerFrame;
    if (hopProgress >= 0 && hopProgress <= 18) {
      // 0-4: Anticipation Squash
      if (hopProgress <= 4) {
        squashX = interpolate(hopProgress, [0, 4], [1.0, 1.15]);
        squashY = interpolate(hopProgress, [0, 4], [1.0, 0.85]);
      }
      // 4-12: Parabolic Arc Jump
      else if (hopProgress <= 12) {
        const t = (hopProgress - 4) / 8;
        hopY = -Math.sin(t * Math.PI) * 26;
        squashX = interpolate(t, [0, 0.5, 1], [1.15, 0.88, 1.0]);
        squashY = interpolate(t, [0, 0.5, 1], [0.85, 1.18, 1.0]);
      }
      // 12-18: Landing Settle & Spring Recovery
      else {
        const t = (hopProgress - 12) / 6;
        squashX = interpolate(t, [0, 0.5, 1], [1.12, 0.98, 1.0]);
        squashY = interpolate(t, [0, 0.5, 1], [0.88, 1.02, 1.0]);
      }
    }
  }

  // Idle Breathing Pulse (Subtle 1.5% scale breathing over 2.4s)
  const breathing = !isWalking && hopTriggerFrame < 0 ? Math.sin((frame / 36) * Math.PI) * 0.02 : 0;

  // Arm Wave / Raise
  const armAngle = armsRaised ? -40 + Math.sin(frame / 3) * 12 : (isTyping ? 18 + typingOffset : 0);

  // Emote Float Bob
  const emoteBob = Math.sin(frame / 6) * 3;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale * (1 + breathing)})`,
        width: 120,
        height: 100,
        pointerEvents: "none",
      }}
    >
      <svg viewBox="-60 -50 120 110" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {/* Soft Ground Contact Shadow */}
        <ellipse
          cx="0"
          cy={52}
          rx={hopY < 0 ? 32 : 44}
          ry={hopY < 0 ? 5 : 7}
          fill="rgba(15, 23, 42, 0.08)"
          style={{ opacity: hopY < 0 ? 0.35 : 0.8 }}
        />

        {/* Floating Emote FX */}
        {emote === "lightbulb" && (
          <g transform={`translate(0, ${-56 + emoteBob})`}>
            <rect x="-8" y="-12" width="16" height="14" rx="4" fill="#FBBF24" />
            <rect x="-5" y="2" width="10" height="4" fill="#78350F" />
            <line x1="0" y1="-18" x2="0" y2="-24" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <line x1="-14" y1="-10" x2="-20" y2="-14" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <line x1="14" y1="-10" x2="20" y2="-14" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {emote === "sparkle" && (
          <g transform={`translate(24, ${-46 + emoteBob})`}>
            <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FBBF24" />
          </g>
        )}
        {emote === "exclamation" && (
          <g transform={`translate(0, ${-56 + emoteBob})`}>
            <rect x="-4" y="-16" width="8" height="16" rx="2" fill="#DC2626" />
            <rect x="-4" y="4" width="8" height="8" rx="2" fill="#DC2626" />
          </g>
        )}
        {emote === "trophy" && (
          <g transform={`translate(0, ${-54 + emoteBob})`}>
            <rect x="-10" y="-14" width="20" height="14" rx="3" fill="#F59E0B" />
            <rect x="-4" y="0" width="8" height="8" fill="#D97706" />
            <rect x="-8" y="8" width="16" height="4" rx="1" fill="#B45309" />
          </g>
        )}

        {/* Mascot Body with Organic Squash/Stretch & Natural Hop */}
        <g style={{ transform: `translate(0px, ${hopY + walkBob}px) scale(${squashX}, ${squashY})`, transformOrigin: "0px 50px" }}>
          {/* Main Body Block */}
          <rect x="-38" y="-30" width="76" height="50" rx="3" fill={color} />

          {/* Left Ear / Arm */}
          <g style={{ transform: `rotate(${armAngle}deg)`, transformOrigin: "-38px -2px" }}>
            <rect x="-54" y="-12" width="16" height="20" rx="2" fill={color} />
          </g>

          {/* Right Ear / Arm */}
          <g style={{ transform: `rotate(${-armAngle}deg)`, transformOrigin: "38px -2px" }}>
            <rect x="38" y="-12" width="16" height="20" rx="2" fill={color} />
          </g>

          {/* Square Black Pixel Eyes */}
          <g>
            <rect
              x="-20"
              y="-18"
              width="11"
              height="11"
              fill="#1E293B"
              rx="1"
              style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: "-14px -12px" }}
            />
            <rect
              x="10"
              y="-18"
              width="11"
              height="11"
              fill="#1E293B"
              rx="1"
              style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: "16px -12px" }}
            />
          </g>
        </g>

        {/* 4 Articulated Pixel Legs */}
        <g style={{ transform: `translate(0px, ${walkBob}px)` }}>
          <rect
            x="-34"
            y="20"
            width="12"
            height="26"
            rx="2"
            fill={color}
            style={{ transform: `scaleY(${leg1_3_Scale})`, transformOrigin: "0px 20px" }}
          />
          <rect
            x="-14"
            y="20"
            width="12"
            height="26"
            rx="2"
            fill={color}
            style={{ transform: `scaleY(${leg2_4_Scale})`, transformOrigin: "0px 20px" }}
          />
          <rect
            x="4"
            y="20"
            width="12"
            height="26"
            rx="2"
            fill={color}
            style={{ transform: `scaleY(${leg1_3_Scale})`, transformOrigin: "0px 20px" }}
          />
          <rect
            x="22"
            y="20"
            width="12"
            height="26"
            rx="2"
            fill={color}
            style={{ transform: `scaleY(${leg2_4_Scale})`, transformOrigin: "0px 20px" }}
          />
        </g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------
// 2. DESK WORKSTATION COMPONENT (Scene 1 Intro)
// ----------------------------------------------------
export const DeskWorkstation: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 860,
        transform: "translate(-50%, -50%) scale(1.65)",
        width: 400,
        height: 240,
      }}
    >
      <svg viewBox="-200 -120 400 240" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {/* Wooden Desk */}
        <rect x="-190" y="80" width="380" height="18" rx="3" fill="#8C583E" stroke="#5D3A29" strokeWidth="2" />
        <rect x="-160" y="98" width="14" height="110" fill="#6E4430" />
        <rect x="146" y="98" width="14" height="110" fill="#6E4430" />

        {/* Retro CRT Computer Monitor */}
        <g transform="translate(85, -5)">
          <rect x="-12" y="58" width="24" height="22" fill="#334155" />
          <rect x="-35" y="76" width="70" height="6" rx="2" fill="#1E293B" />
          <rect x="-65" y="-55" width="130" height="114" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          
          {/* Tencent Blue Glow Terminal Screen */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#0B1E3B" stroke="#0052D9" strokeWidth="2" />
          
          {/* Official Tencent Icon on Screen */}
          <g transform="translate(0, -6) scale(0.65)">
            <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="#0052D9" stroke="#38BDF8" strokeWidth="2" />
            <path d="M -16 -10 L 0 14 L 16 -10" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="0" y1="-10" x2="0" y2="14" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#38BDF8">Tencent HY4</text>
          
          <circle cx="48" cy="48" r="3" fill="#10B981" />
        </g>
      </svg>
      {/* Pixel Mascot typing at desk with single entrance hop */}
      <PixelMascot x={125} y={155} scale={0.9} isTyping={true} hopTriggerFrame={6} emote="exclamation" />
    </div>
  );
};

// ----------------------------------------------------
// 3. EDITORIAL TORN-PAPER CARD COMPONENT
// ----------------------------------------------------
export const EditorialCard: React.FC<{
  tabLabel: string;
  tabColor: string;
  title: string;
  subtitle?: string;
  items: Array<{ num: string; title: string; desc: string; tag?: string; tagColor?: string }>;
  footerNote: string;
  emote?: "lightbulb" | "sparkle" | "trophy";
}> = ({ tabLabel, tabColor, title, subtitle, items, footerNote, emote }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 860,
        transform: `translate(-50%, -50%) scale(${interpolate(cardSpring, [0, 1], [0.92, 1.45])})`,
        opacity: cardSpring,
        width: 630,
        height: 640,
        backgroundColor: "#FAF8F5",
        borderRadius: 28,
        border: "2px solid #E2E8F0",
        boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
        padding: "36px 36px 24px 36px",
        display: "flex",
        flexDirection: "column",
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
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          fontSize: 14,
          padding: "4px 18px",
          borderRadius: 12,
          textTransform: "uppercase",
        }}
      >
        {tabLabel}
      </div>

      {/* Mini Mascot sitting on top right with single entrance hop */}
      <div style={{ position: "absolute", top: -18, right: 35 }}>
        <PixelMascot x={0} y={0} scale={0.5} emote={emote} hopTriggerFrame={8} />
      </div>

      {/* Card Title */}
      <div
        style={{
          fontFamily: "'Georgia', serif",
          fontWeight: 700,
          fontSize: 36,
          color: "#99422B",
          textAlign: "center",
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </div>

      {subtitle && (
        <div
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#64748B",
            textAlign: "center",
            marginTop: 4,
            marginBottom: 20,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Items Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, marginTop: 10 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 10,
              borderBottom: i < items.length - 1 ? "1.5px solid #F1F5F9" : "none",
            }}
          >
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: "#99422B" }}>
                {item.num}. {item.title}:
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14.5, color: "#64748B", marginTop: 2 }}>
                {item.desc}
              </div>
            </div>
            {item.tag && (
              <div
                style={{
                  backgroundColor: item.tagColor || "#DCFCE7",
                  color: item.tag === "official" ? "#166534" : "#854D0E",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                {item.tag}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Callout */}
      <div
        style={{
          backgroundColor: "#F1F5F9",
          color: "#475569",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 13,
          textAlign: "center",
          padding: "8px 16px",
          borderRadius: 999,
          marginTop: 10,
        }}
      >
        {footerNote}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. KINETIC MONO-LINE SUBTITLES (Slide-Up IN + Blur OUT)
// Size: 58px (10% smaller than 64px)
// Position: top 1360px (10% higher than 1540px)
// ----------------------------------------------------
export const KineticCaption: React.FC<{
  text: string;
  durationInFrames?: number;
  isHighlight?: boolean;
}> = ({ text, durationInFrames = 35, isHighlight = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide Up on IN (Spring entrance over first 6 frames)
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 240 },
  });
  const enterY = interpolate(enterSpring, [0, 1], [28, 0]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Blur on OUT (Smooth exit over final 5 frames of the chunk)
  const exitFrames = 5;
  const exitStart = Math.max(1, durationInFrames - exitFrames);
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 12]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitY = interpolate(exitProgress, [0, 1], [0, -8]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.94]);

  return (
    <div
      style={{
        position: "absolute",
        top: 1360, // 10% above previous 1540px
        left: "50%",
        transform: `translateX(-50%) translateY(${enterY + exitY}px) scale(${exitScale})`,
        opacity: enterOpacity * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        width: "90%",
        textAlign: "center",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: isHighlight ? appleGaramondFont : interFont,
          fontSize: isHighlight ? 60 : 54,
          fontStyle: isHighlight ? "italic" : "normal",
          fontWeight: isHighlight ? 500 : 900,
          color: isHighlight ? "#FBBF24" : "#FFFFFF",
          textTransform: isHighlight ? "none" : "uppercase",
          letterSpacing: isHighlight ? "0.5px" : "-0.5px",
          textShadow: cleanOutlineShadow,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ----------------------------------------------------
// 5. MAIN REMOTION COMPOSITION (Snappy 27.65s Runtime)
// ----------------------------------------------------
export const DoodleExplainerReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame Timestamps (@ 30fps)
  const scenes = [
    { start: 0, duration: 143 },
    { start: 143, duration: 151 },
    { start: 294, duration: 136 },
    { start: 430, duration: 126 },
    { start: 556, duration: 155 },
    { start: 711, duration: 119 },
  ];

  const totalFrames = 830;
  const currentStep = Math.min(6, Math.floor(frame / 138) + 1);
  const timelineProgress = interpolate(frame, [0, totalFrames], [-320, 320]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", overflow: "hidden" }}>
      {/* Snappy Silence-Trimmed Audio */}
      <Audio src={staticFile("compositions/tencent-hy4-reel/audio_snappy/full_voice_snappy.wav")} volume={1.3} />
      <Audio src={staticFile("bg_music.wav")} volume={0.14} loop />

      {/* Top Navigation Pills */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 150,
        }}
      >
        <div
          style={{
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: 22,
            padding: "8px 24px",
            borderRadius: 999,
          }}
        >
          Bucket 1
        </div>
        <div
          style={{
            color: "#64748B",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          @byteswithbittu
        </div>
      </div>

      {/* SCENE 1: Intro Workstation */}
      <Sequence from={scenes[0].start} durationInFrames={scenes[0].duration}>
        <div
          style={{
            position: "absolute",
            top: 200,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            fontSize: 66,
            color: "#99422B",
            textAlign: "center",
            width: "90%",
            lineHeight: 1.18,
          }}
        >
          Tencent Dropped An AI Bombshell!
        </div>
        <div
          style={{
            position: "absolute",
            top: 390,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          HY4 • 770B Open-Weights Foundation Model
        </div>
        <DeskWorkstation />

        {/* Synced Captions for Scene 1 (143 frames) */}
        <Sequence from={0} durationInFrames={35}><KineticCaption text="STOP SCROLLING!" isHighlight /></Sequence>
        <Sequence from={35} durationInFrames={36}><KineticCaption text="TENCENT JUST" isHighlight /></Sequence>
        <Sequence from={71} durationInFrames={36}><KineticCaption text="DROPPED THE" /></Sequence>
        <Sequence from={107} durationInFrames={36}><KineticCaption text="AI BOMBSHELL!" isHighlight /></Sequence>
      </Sequence>

      {/* SCENE 2: 770B MoE Architecture */}
      <Sequence from={scenes[1].start} durationInFrames={scenes[1].duration}>
        <EditorialCard
          tabLabel="architecture"
          tabColor="#8B5CF6"
          title="770B MoE Engine"
          subtitle="Sparse Mixture-of-Experts Router Breakdown"
          items={[
            { num: "1", title: "Expert 1 (Code)", desc: "Full-stack software engineering, refactoring & PRs", tag: "official", tagColor: "#DCFCE7" },
            { num: "2", title: "Expert 2 (Logic)", desc: "Multi-step mathematical reasoning & proofs", tag: "active", tagColor: "#FEF9C3" },
            { num: "3", title: "Expert 3 (3D Dev)", desc: "3D spatial asset generation & geometry", tag: "partner", tagColor: "#E0E7FF" },
            { num: "4", title: "Expert 4 (Math)", desc: "High-precision algorithmic compute optimization", tag: "100% ★", tagColor: "#FCE7F3" },
          ]}
          footerNote="Only 49B parameters fire per token = lightning speed."
          emote="lightbulb"
        />
        <Sequence from={0} durationInFrames={38}><KineticCaption text="MEET HY4:" isHighlight /></Sequence>
        <Sequence from={38} durationInFrames={38}><KineticCaption text="A 770-BILLION" isHighlight /></Sequence>
        <Sequence from={76} durationInFrames={38}><KineticCaption text="PARAMETER" /></Sequence>
        <Sequence from={114} durationInFrames={37}><KineticCaption text="OPEN-WEIGHTS MONSTER." isHighlight /></Sequence>
      </Sequence>

      {/* SCENE 3: 1M Token Context */}
      <Sequence from={scenes[2].start} durationInFrames={scenes[2].duration}>
        <EditorialCard
          tabLabel="capacity"
          tabColor="#06B6D4"
          title="1,000,000 Context"
          subtitle="Massive Repository & Codebase Ingestion"
          items={[
            { num: "1", title: "Full Repo Buffer", desc: "Scan 500+ files and dependencies with zero degradation", tag: "100x ★", tagColor: "#CCFBF1" },
            { num: "2", title: "Needle in Haystack", desc: "100% retrieval accuracy at 1 million tokens", tag: "verified", tagColor: "#DCFCE7" },
            { num: "3", title: "Zero Hallucination", desc: "Architectural precision across large document bases", tag: "official", tagColor: "#FEF9C3" },
            { num: "4", title: "Fast Retrieval", desc: "Instant lookups without fine-tuning latency", tag: "partner", tagColor: "#E0E7FF" },
          ]}
          footerNote="One short command runs across your entire codebase."
          emote="sparkle"
        />
        <Sequence from={0} durationInFrames={34}><KineticCaption text="IT PACKS A" /></Sequence>
        <Sequence from={34} durationInFrames={34}><KineticCaption text="ONE MILLION" isHighlight /></Sequence>
        <Sequence from={68} durationInFrames={34}><KineticCaption text="TOKEN CONTEXT" isHighlight /></Sequence>
        <Sequence from={102} durationInFrames={34}><KineticCaption text="WINDOW FOR REPOS." isHighlight /></Sequence>
      </Sequence>

      {/* SCENE 4: Autonomous 3D Dev */}
      <Sequence from={scenes[3].start} durationInFrames={scenes[3].duration}>
        <EditorialCard
          tabLabel="workflows"
          tabColor="#EC4899"
          title="3D & Dev Studio"
          subtitle="Direct Unreal Engine 5 & Full-Stack Coding"
          items={[
            { num: "1", title: "Software Engineering", desc: "End-to-end bug fixing, refactoring, and code reviews", tag: "Dev Agent", tagColor: "#DCFCE7" },
            { num: "2", title: "3D Mesh Gen", desc: "Auto-generates procedural 3D environments from text", tag: "UE5 Ready", tagColor: "#FCE7F3" },
            { num: "3", title: "Asset Pipeline", desc: "Direct export to GLTF, FBX, and Unreal Engine projects", tag: "partner", tagColor: "#FEF9C3" },
            { num: "4", title: "Zero Bottleneck", desc: "Single prompt to working interactive demo", tag: "10x Speed", tagColor: "#E0E7FF" },
          ]}
          footerNote="Handling everything from software engineering to 3D game dev!"
          emote="sparkle"
        />
        <Sequence from={0} durationInFrames={31}><KineticCaption text="HANDLING EVERYTHING" /></Sequence>
        <Sequence from={31} durationInFrames={31}><KineticCaption text="FROM SOFTWARE" isHighlight /></Sequence>
        <Sequence from={62} durationInFrames={31}><KineticCaption text="ENGINEERING TO" /></Sequence>
        <Sequence from={93} durationInFrames={33}><KineticCaption text="3D GAME DEV!" isHighlight /></Sequence>
      </Sequence>

      {/* SCENE 5: Hugging Face Open Weights */}
      <Sequence from={scenes[4].start} durationInFrames={scenes[4].duration}>
        <EditorialCard
          tabLabel="open source"
          tabColor="#F59E0B"
          title="Hugging Face Hub"
          subtitle="Zero API Paywalls • 100% Free Weights"
          items={[
            { num: "1", title: "Zero API Paywall", desc: "Download base model & fine-tune on your own GPUs", tag: "100% Free", tagColor: "#DCFCE7" },
            { num: "2", title: "Safetensors", desc: "Full fp16 and 4-bit quantized formats ready to run", tag: "official", tagColor: "#FEF9C3" },
            { num: "3", title: "Ollama & vLLM", desc: "Community inference support available on day 1", tag: "open", tagColor: "#E0E7FF" },
            { num: "4", title: "Commercial Use", desc: "Permissive license for building and selling AI tools", tag: "verified", tagColor: "#FCE7F3" },
          ]}
          footerNote="While closed models charge, HY4 is 100% free!"
          emote="trophy"
        />
        <Sequence from={0} durationInFrames={38}><KineticCaption text="WHILE CLOSED" /></Sequence>
        <Sequence from={38} durationInFrames={39}><KineticCaption text="MODELS CHARGE," isHighlight /></Sequence>
        <Sequence from={77} durationInFrames={39}><KineticCaption text="HY4 IS" /></Sequence>
        <Sequence from={116} durationInFrames={39}><KineticCaption text="100% FREE!" isHighlight /></Sequence>
      </Sequence>

      {/* SCENE 6: CTA */}
      <Sequence from={scenes[5].start} durationInFrames={scenes[5].duration}>
        <EditorialCard
          tabLabel="get setup"
          tabColor="#10B981"
          title="Bytes with Bittu ⚡"
          subtitle="Daily AI Engineering Alpha & Open-Source Tools"
          items={[
            { num: "1", title: "Full Setup Guide", desc: "Step-by-step local install instructions with scripts", tag: "official", tagColor: "#DCFCE7" },
            { num: "2", title: "Model Weights", desc: "Direct links and quantization configs on GitHub", tag: "free", tagColor: "#FEF9C3" },
            { num: "3", title: "Daily Alpha", desc: "Never miss a major AI release or architecture breakdown", tag: "daily", tagColor: "#E0E7FF" },
          ]}
          footerNote="Comment 'INSTALL' for the full setup guide & alpha!"
          emote="trophy"
        />
        <Sequence from={0} durationInFrames={30}><KineticCaption text="COMMENT INSTALL" isHighlight /></Sequence>
        <Sequence from={30} durationInFrames={30}><KineticCaption text="FOR THE" /></Sequence>
        <Sequence from={60} durationInFrames={30}><KineticCaption text="FULL SETUP" isHighlight /></Sequence>
        <Sequence from={90} durationInFrames={29}><KineticCaption text="GUIDE & ALPHA!" isHighlight /></Sequence>
      </Sequence>

      {/* Bottom Timeline Footer Track with Smooth Walking Mascot */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          height: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 120,
        }}
      >
        <svg viewBox="-360 -40 720 80" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <line x1="-320" y1="0" x2="320" y2="0" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
          <line x1="-320" y1="0" x2={timelineProgress} y2="0" stroke="#E07A5F" strokeWidth="6" strokeLinecap="round" />

          {[-320, -192, -64, 64, 192, 320].map((dotX, i) => (
            <circle key={i} cx={dotX} cy="0" r="7" fill={i < currentStep ? "#E07A5F" : "#CBD5E1"} />
          ))}
        </svg>

        {/* Smooth 4-leg walking mascot without random mid-walk jumps */}
        <PixelMascot
          x={360 + timelineProgress}
          y={15}
          scale={0.55}
          isWalking={true}
          armsRaised={currentStep === 6}
        />
      </div>
    </AbsoluteFill>
  );
};
