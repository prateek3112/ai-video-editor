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
import type { EightBitReelProps, EightBitScene, PixelEmote } from "../../../types/eight-bit-reel";
import { CrtBrandScreen } from "./CrtBrandLogos";
import {
  interFont,
  impactFont,
  appleGaramondFont,
  cleanOutlineShadow,
  getAdaptiveCaptionSize,
} from "./typography";

// ----------------------------------------------------
// EDITORIAL MIXED TITLE COMPONENT
// Combines Inter Black / Impact with Apple Garamond Light Italic
// ----------------------------------------------------
export const MixedTitle: React.FC<{
  text?: string;
  fontSize?: number;
  color?: string;
  accentColor?: string;
}> = ({ text = "", fontSize = 64, color = "#99422B", accentColor = "#D97757" }) => {
  const words = text.split(" ");
  if (words.length <= 1) {
    return (
      <span style={{ fontFamily: impactFont, fontWeight: 900, textTransform: "uppercase", fontSize, color }}>
        {text}
      </span>
    );
  }
  const splitIdx = Math.max(1, Math.min(2, Math.floor(words.length / 2)));
  const part1 = words.slice(0, splitIdx).join(" ");
  const part2 = words.slice(splitIdx).join(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "8px 14px",
        lineHeight: 1.15,
      }}
    >
      <span
        style={{
          fontFamily: impactFont,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-1px",
          color,
          fontSize,
        }}
      >
        {part1}
      </span>
      <span
        style={{
          fontFamily: appleGaramondFont,
          fontStyle: "italic",
          fontWeight: 400,
          color: accentColor,
          fontSize: Math.round(fontSize * 1.05),
          letterSpacing: "0.2px",
        }}
      >
        {part2}
      </span>
    </div>
  );
};

// ----------------------------------------------------
// 1. POLISHED PIXEL MASCOT ("BITTU")
// Natural walking kinematics, cute grounded idle, smooth single hops on scene entry
// ----------------------------------------------------
export const PixelMascot: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  color?: string;
  isWalking?: boolean;
  isTyping?: boolean;
  hopTriggerFrame?: number;
  armsRaised?: boolean;
  emote?: PixelEmote;
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
      if (hopProgress <= 4) {
        squashX = interpolate(hopProgress, [0, 4], [1.0, 1.15]);
        squashY = interpolate(hopProgress, [0, 4], [1.0, 0.85]);
      } else if (hopProgress <= 12) {
        const t = (hopProgress - 4) / 8;
        hopY = -Math.sin(t * Math.PI) * 26;
        squashX = interpolate(t, [0, 0.5, 1], [1.15, 0.88, 1.0]);
        squashY = interpolate(t, [0, 0.5, 1], [0.85, 1.18, 1.0]);
      } else {
        const t = (hopProgress - 12) / 6;
        squashX = interpolate(t, [0, 0.5, 1], [1.12, 0.98, 1.0]);
        squashY = interpolate(t, [0, 0.5, 1], [0.88, 1.02, 1.0]);
      }
    }
  }

  // Idle Breathing Pulse (Subtle 1.5% scale breathing over 2.4s)
  const breathing = !isWalking && hopTriggerFrame < 0 ? Math.sin((frame / 36) * Math.PI) * 0.02 : 0;

  // Arm Wave / Raise
  const armAngle = armsRaised ? -40 + Math.sin(frame / 3) * 12 : isTyping ? 18 + typingOffset : 0;

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
        {emote === "fire" && (
          <g transform={`translate(0, ${-54 + emoteBob})`}>
            <path d="M 0 -18 Q 8 -10 6 0 Q 4 10 -4 10 Q -10 6 -8 -4 Q -4 -12 0 -18 Z" fill="#EF4444" />
            <circle cx="0" cy="2" r="4" fill="#FBBF24" />
          </g>
        )}

        {/* Mascot Body with Organic Squash/Stretch & Natural Hop */}
        <g style={{ transform: `translate(0px, ${hopY + walkBob}px) scale(${squashX}, ${squashY})`, transformOrigin: "0px 50px" }}>
          <rect x="-38" y="-30" width="76" height="50" rx="3" fill={color} />

          {/* Left Arm */}
          <g style={{ transform: `rotate(${armAngle}deg)`, transformOrigin: "-38px -2px" }}>
            <rect x="-54" y="-12" width="16" height="20" rx="2" fill={color} />
          </g>

          {/* Right Arm */}
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
// 2. DESK WORKSTATION COMPONENT WITH DYNAMIC CRT BRAND
// ----------------------------------------------------
export const DeskWorkstation: React.FC<{
  brand?: EightBitReelProps["crtBrand"];
  crtSubtitle?: string;
}> = ({ brand = "tencent", crtSubtitle }) => {
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
          
          {/* Dynamic Brand Screen Terminal */}
          <CrtBrandScreen brand={brand} subtitle={crtSubtitle} />
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
  tabLabel?: string;
  tabColor?: string;
  title?: string;
  subtitle?: string;
  items?: EightBitScene["items"];
  footerNote?: string;
  emote?: PixelEmote;
}> = ({
  tabLabel = "SPECS",
  tabColor = "#8B5CF6",
  title = "",
  subtitle,
  items = [],
  footerNote = "",
  emote,
}) => {
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

      {/* Mini Mascot sitting on top right with single entrance hop */}
      <div style={{ position: "absolute", top: -18, right: 35 }}>
        <PixelMascot x={0} y={0} scale={0.5} emote={emote} hopTriggerFrame={8} />
      </div>

      {/* Card Title - Mixed Inter Black / Impact + Apple Garamond Light Italic */}
      <div style={{ marginTop: 4, marginBottom: subtitle ? 2 : 10 }}>
        <MixedTitle text={title} fontSize={38} color="#99422B" accentColor="#D97757" />
      </div>

      {subtitle && (
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 700,
            fontSize: 15,
            color: "#64748B",
            textAlign: "center",
            marginTop: 2,
            marginBottom: 16,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Items Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, marginTop: 6 }}>
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
              <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 19.5, color: "#99422B" }}>
                {item.num}. {item.title}:
              </div>
              <div style={{ fontFamily: interFont, fontWeight: 600, fontSize: 14.5, color: "#64748B", marginTop: 2 }}>
                {item.desc}
              </div>
            </div>
            {item.tag && (
              <div
                style={{
                  backgroundColor: item.tagColor || "#DCFCE7",
                  color: item.tag === "official" ? "#166534" : "#854D0E",
                  fontFamily: interFont,
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
      {footerNote && (
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
            marginTop: 10,
          }}
        >
          {footerNote}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 4. KINETIC MONO-LINE SUBTITLES (Slide-Up IN + Blur OUT)
// Mix & Match: Inter Black + Apple Garamond Light Italic / Aston Script
// Adaptive sizing ensures text NEVER goes out of screen
// ----------------------------------------------------
export const KineticCaption: React.FC<{
  text: string;
  durationInFrames: number;
  isHighlight?: boolean;
}> = ({ text, durationInFrames, isHighlight = false }) => {
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

  // Adaptive font size to ensure captions NEVER clip or spill off screen
  const baseFontSize = getAdaptiveCaptionSize(text);

  // Parse words for mix-and-match typography
  const words = text.trim().split(/\s+/);
  const HIGHLIGHT_KEYWORDS = [
    "TENCENT", "HY4", "770B", "CLAUDE", "ANTHROPIC", "HYBRID", "REASONING",
    "SWE-BENCH", "70.3%", "CURSOR", "CLI", "TERMINAL", "PRICE", "FREE", "INSTALL",
    "MONSTER", "WINDOW", "SCROLLING", "BOMBSHELL", "PONDERS", "INSTANTANEOUSLY"
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 1360, // 10% above previous 1540px
        left: "50%",
        transform: `translateX(-50%) translateY(${enterY + exitY}px) scale(${exitScale})`,
        opacity: enterOpacity * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        maxWidth: "92%",
        width: "92%",
        margin: "0 auto",
        textAlign: "center",
        zIndex: 100,
        pointerEvents: "none",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "6px 12px",
      }}
    >
      {words.map((w, i) => {
        const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toUpperCase();
        const isWordHighlight =
          HIGHLIGHT_KEYWORDS.some((kw) => cleanWord.includes(kw)) ||
          (isHighlight && (i === words.length - 1 || words.length === 1));

        // Use Apple Garamond Light Italic for highlight words, Inter Black for base words
        const fontFam = isWordHighlight ? appleGaramondFont : interFont;
        const textColor = isWordHighlight ? "#FBBF24" : "#FFFFFF";

        return (
          <span
            key={i}
            style={{
              fontFamily: fontFam,
              fontSize: isWordHighlight ? Math.round(baseFontSize * 1.08) : baseFontSize,
              fontStyle: isWordHighlight ? "italic" : "normal",
              fontWeight: isWordHighlight ? 500 : 900,
              color: textColor,
              textTransform: isWordHighlight ? "none" : "uppercase",
              letterSpacing: isWordHighlight ? "0.5px" : "-0.5px",
              // Clean multi-directional shadow outline: ZERO internal stroke artifacts or markers!
              textShadow: cleanOutlineShadow,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------
// 5. MAIN UNIVERSAL REMOTION COMPOSITION
// ----------------------------------------------------
export const EightBitTechReel: React.FC<EightBitReelProps> = ({
  topic,
  tagBucket = "Bucket 1",
  authorHandle = "@byteswithbittu",
  crtBrand = "tencent",
  crtSubtitle,
  audioSrc = "compositions/tencent-hy4-reel/audio_snappy/full_voice_snappy.wav",
  bgMusicSrc = "bg_music.wav",
  scenes = [],
}) => {
  const frame = useCurrentFrame();

  const totalFrames = scenes.reduce((acc, s) => acc + s.durationInFrames, 0) || 830;
  const currentStep = Math.min(
    scenes.length,
    scenes.findIndex((s, i) => {
      const priorFrames = scenes.slice(0, i + 1).reduce((sum, sc) => sum + sc.durationInFrames, 0);
      return frame < priorFrames;
    }) + 1 || 1
  );

  const timelineProgress = interpolate(frame, [0, totalFrames], [-320, 320]);

  // Compute frame offsets
  let accumulatedFrames = 0;
  const sequencedScenes = scenes.map((s) => {
    const start = accumulatedFrames;
    accumulatedFrames += s.durationInFrames;
    return { ...s, startFrame: start };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", overflow: "hidden" }}>
      {/* Voiceover and Background Music */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1.3} />}
      {bgMusicSrc && <Audio src={staticFile(bgMusicSrc)} volume={0.14} loop />}

      {/* Top Navigation Bar */}
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
          {tagBucket}
        </div>
        <div
          style={{
            color: "#64748B",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          {authorHandle}
        </div>
      </div>

      {/* Dynamic Sequenced Scenes */}
      {sequencedScenes.map((scene) => (
        <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames}>
          {scene.type === "intro-workstation" ? (
            <>
              <div
                style={{
                  position: "absolute",
                  top: 180,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "92%",
                  textAlign: "center",
                }}
              >
                <MixedTitle text={scene.headline} fontSize={64} color="#1E1916" accentColor="#D97757" />
              </div>
              {scene.subheadline && (
                <div
                  style={{
                    position: "absolute",
                    top: 390,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: interFont,
                    fontWeight: 900,
                    fontSize: 24,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 2.5,
                  }}
                >
                  {scene.subheadline}
                </div>
              )}
              <DeskWorkstation brand={crtBrand} crtSubtitle={crtSubtitle} />
            </>
          ) : (
            <EditorialCard
              tabLabel={scene.tabLabel}
              tabColor={scene.tabColor}
              title={scene.title}
              subtitle={scene.subtitle}
              items={scene.items}
              footerNote={scene.footerNote}
              emote={scene.emote}
            />
          )}

          {/* Subtitles for this scene */}
          {scene.captions.map((chunk, idx) => (
            <Sequence
              key={idx}
              from={chunk.fromFrame}
              durationInFrames={chunk.durationInFrames}
            >
              <KineticCaption
                text={chunk.text}
                durationInFrames={chunk.durationInFrames}
                isHighlight={chunk.isHighlight}
              />
            </Sequence>
          ))}
        </Sequence>
      ))}

      {/* Bottom Timeline Footer Track */}
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
          armsRaised={currentStep === scenes.length}
        />
      </div>
    </AbsoluteFill>
  );
};
