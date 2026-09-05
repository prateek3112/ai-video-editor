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
import type { EightBitReelProps, EightBitScene, PixelEmote, CardItem } from "../../../types/eight-bit-reel";
import { PixelMascot } from "../eight-bit/EightBitTechReel";
import { CrtBrandScreen } from "../eight-bit/CrtBrandLogos";
import {
  interFont,
  impactFont,
  appleGaramondFont,
  cleanOutlineShadow,
  getAdaptiveCaptionSize,
} from "../eight-bit/typography";
import { MarkerLoop, MarkerUnderline } from "./SvgMarker";
import { AudioEqualizerNav } from "./AudioEqualizerNav";
import { LiveSpeechCorrection } from "./LiveSpeechCorrection";
import { SpeedComparisonGauge } from "./SpeedComparisonGauge";
import { CrtLiveTerminal } from "./CrtTerminalTyping";
import { PipelineScene } from "./PipelineScene";
import { ToolMatrixScene } from "./ToolMatrixScene";
import { BentoCtaScene } from "./BentoCtaScene";

// ----------------------------------------------------
// 1. EDITORIAL MIXED TITLE (Impact / Inter Black + Apple Garamond Light Italic)
// ----------------------------------------------------
export const MixedTitleV2: React.FC<{
  text?: string;
  fontSize?: number;
  color?: string;
  accentColor?: string;
  hasMarker?: boolean;
}> = ({
  text = "",
  fontSize = 64,
  color = "#1E1916",
  accentColor = "#D97757",
  hasMarker = false,
}) => {
  const words = text.split(" ");
  if (words.length <= 1) {
    return (
      <span style={{ position: "relative", display: "inline-block", fontFamily: impactFont, fontWeight: 900, textTransform: "uppercase", fontSize, color }}>
        {text}
        {hasMarker && <MarkerLoop width={220} height={60} strokeColor="#EF4444" delayFrames={12} />}
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
        position: "relative",
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
          position: "relative",
          display: "inline-block",
          fontFamily: appleGaramondFont,
          fontStyle: "italic",
          fontWeight: 400,
          color: accentColor,
          fontSize: Math.round(fontSize * 1.05),
          letterSpacing: "0.2px",
        }}
      >
        {part2}
        {hasMarker && <MarkerLoop width={280} height={65} strokeColor="#EF4444" delayFrames={12} />}
      </span>
    </div>
  );
};

// ----------------------------------------------------
// 2. ENHANCED DESK WORKSTATION WITH LIVE CRT TERMINAL
// ----------------------------------------------------
export const DeskWorkstationV2: React.FC<{
  brand?: any;
  crtSubtitle?: string;
  terminalText?: string;
}> = ({ brand = "google", crtSubtitle = "Gemini 3.5 Transcribe", terminalText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle floating idle
  const idleFloat = Math.sin((frame / fps) * Math.PI * 1.5) * 4;

  return (
    <div
      style={{
        position: "absolute",
        top: 500,
        left: "50%",
        transform: `translateX(-50%) translateY(${idleFloat}px)`,
        width: 700,
        height: 600,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      {/* Desk Surface Items */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 70,
          marginBottom: -4,
          zIndex: 10,
        }}
      >
        {/* Pixel Mascot typing with lightbulb/sparkle */}
        <div style={{ transform: "scale(1.25)", marginBottom: 10 }}>
          <PixelMascot x={0} y={0} isTyping={true} emote="sparkle" />
        </div>

        {/* CRT Computer Monitor with Live Typing Screen */}
        <div
          style={{
            width: 280,
            height: 250,
            backgroundColor: "#1E293B",
            borderRadius: "18px 18px 8px 8px",
            border: "5px solid #0F172A",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
            position: "relative",
          }}
        >
          {/* Inner Live Screen */}
          <div
            style={{
              width: "100%",
              height: 180,
              borderRadius: 8,
              border: "3px solid #334155",
              overflow: "hidden",
            }}
          >
            <CrtLiveTerminal brandColor="#4285F4" terminalText={terminalText} />
          </div>

          {/* CRT Stand Bezel */}
          <div
            style={{
              marginTop: 6,
              fontFamily: interFont,
              fontWeight: 800,
              fontSize: 10,
              color: "#94A3B8",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {crtSubtitle}
          </div>

          {/* Stand Foot */}
          <div
            style={{
              position: "absolute",
              bottom: -22,
              left: "50%",
              transform: "translateX(-50%)",
              width: 90,
              height: 22,
              backgroundColor: "#334155",
              border: "3px solid #0F172A",
              borderTop: "none",
            }}
          />
        </div>
      </div>

      {/* Heavy Wooden Desk Plank */}
      <div
        style={{
          width: 660,
          height: 32,
          backgroundColor: "#854D0E",
          border: "4px solid #451A03",
          borderRadius: 6,
          boxShadow: "0 14px 24px rgba(0,0,0,0.12)",
          zIndex: 5,
        }}
      />

      {/* Desk Legs */}
      <div
        style={{
          width: 580,
          display: "flex",
          justifyContent: "space-between",
          zIndex: 2,
        }}
      >
        <div style={{ width: 36, height: 260, backgroundColor: "#713F12", border: "4px solid #451A03" }} />
        <div style={{ width: 36, height: 260, backgroundColor: "#713F12", border: "4px solid #451A03" }} />
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. EDITORIAL SPEC CARD V2 (With Interactive Custom Visualizers)
// ----------------------------------------------------
export const EditorialCardV2: React.FC<{
  tabLabel?: string;
  tabColor?: string;
  title?: string;
  subtitle?: string;
  items?: CardItem[];
  footerNote?: string;
  emote?: PixelEmote;
  customVisualizer?: 'speech-correction' | 'speed-gauge' | 'marker-loop';
  hasMarkerLoop?: boolean;
}> = ({
  tabLabel = "ARCHITECTURE",
  tabColor = "#2563EB",
  title = "Smart Transcription",
  subtitle,
  items = [],
  footerNote,
  emote = "sparkle",
  customVisualizer,
  hasMarkerLoop = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth entrance pop
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 420,
        left: "50%",
        transform: `translateX(-50%) scale(${cardScale})`,
        opacity: cardOpacity,
        width: 860,
        minHeight: 820,
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        border: "3.5px solid #F1F5F9",
        boxShadow: "0 30px 70px rgba(0, 0, 0, 0.08), 0 10px 24px rgba(0,0,0,0.04)",
        padding: "44px 48px",
        display: "flex",
        flexDirection: "column",
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

      {/* Mini Mascot sitting on top right */}
      <div style={{ position: "absolute", top: -18, right: 35 }}>
        <PixelMascot x={0} y={0} scale={0.5} emote={emote} hopTriggerFrame={8} />
      </div>

      {/* Card Title - Mixed Inter Black / Impact + Apple Garamond Light Italic */}
      <div style={{ marginTop: 4, marginBottom: subtitle ? 2 : 10 }}>
        <MixedTitleV2 text={title} fontSize={38} color="#0F172A" accentColor="#2563EB" hasMarker={hasMarkerLoop} />
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
            marginBottom: 14,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Custom Interactive Visualizers (Non-character visual engagement) */}
      {customVisualizer === "speech-correction" && <LiveSpeechCorrection />}
      {customVisualizer === "speed-gauge" && <SpeedComparisonGauge />}

      {/* Regular Items Rows */}
      {items.length > 0 && (
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
                <div style={{ fontFamily: interFont, fontWeight: 900, fontSize: 19, color: "#0F172A" }}>
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
                    color: item.tag === "official" ? "#166534" : "#1E40AF",
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
      )}

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
// Clean 3-Font System with Zero Internal Markers & Overflow Protection
// ----------------------------------------------------
export const KineticCaptionV2: React.FC<{
  text: string;
  durationInFrames: number;
  isHighlight?: boolean;
}> = ({ text, durationInFrames, isHighlight = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide Up on IN
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 240 },
  });
  const enterY = interpolate(enterSpring, [0, 1], [28, 0]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Blur on OUT
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

  // Responsive safe-zone sizing
  const baseFontSize = getAdaptiveCaptionSize(text);

  const words = text.trim().split(/\s+/);
  const HIGHLIGHT_KEYWORDS = [
    "GOOGLE", "GEMINI", "TRANSCRIBE", "SMART", "CORRECTION", "WEDNESDAY", "TUESDAY",
    "85+", "LANGUAGES", "70%", "FASTER", "UNDERSTAND", "ACCURACY", "RECORDER", "DISFLUENCY"
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 1360,
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

        // Use Apple Garamond Light Italic for highlights, Inter Black for base words
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
              // Clean multi-directional shadow outline (zero internal markers)
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
// 5. MASTER EIGHT-BIT REEL V2 COMPOSITION
// ----------------------------------------------------
export const EightBitV2Reel: React.FC<EightBitReelProps> = ({
  topic,
  tagBucket = "Bucket 1",
  authorHandle = "@byteswithbittu",
  crtBrand = "google",
  crtSubtitle = "Gemini 3.5 Transcribe",
  audioSrc,
  bgMusicSrc,
  scenes,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Compute scene frames
  let currentStart = 0;
  const sequencedScenes = scenes.map((scene) => {
    const start = currentStart;
    currentStart += scene.durationInFrames;
    return { ...scene, startFrame: start };
  });

  // Bottom Timeline Mascot Position
  const mascotProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const trackStartX = 240;
  const trackEndX = 840;
  const mascotTrackX = interpolate(mascotProgress, [0, 1], [trackStartX, trackEndX]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", overflow: "hidden" }}>
      {/* Background Engineering Dot Matrix Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(#E2E8F0 1.2px, transparent 1.2px)",
          backgroundSize: "32px 32px",
          opacity: 0.65,
          pointerEvents: "none",
        }}
      />

      {/* Audio Voiceover Track */}
      {audioSrc && <Audio src={audioSrc.startsWith("http") ? audioSrc : staticFile(audioSrc)} />}
      {bgMusicSrc && (
        <Audio
          src={bgMusicSrc.startsWith("http") ? bgMusicSrc : staticFile(bgMusicSrc)}
          volume={0.12}
          loop
        />
      )}

      {/* 1. Top Navigation Bar with Audio Equalizer */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            fontFamily: interFont,
            fontWeight: 900,
            fontSize: 20,
            padding: "8px 24px",
            borderRadius: 999,
          }}
        >
          {tagBucket}
        </div>

        {/* Right side: Author handle + Live Audio Equalizer */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AudioEqualizerNav color="#2563EB" height={20} />
          <div
            style={{
              color: "#64748B",
              fontFamily: interFont,
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            {authorHandle}
          </div>
        </div>
      </div>

      {/* 2. Sequenced Scenes */}
      {sequencedScenes.map((scene) => (
        <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames}>
          {scene.type === "intro-workstation" ? (
            <>
              {/* Scene 1 Headline */}
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
                <MixedTitleV2 text={scene.headline} fontSize={64} color="#0F172A" accentColor="#2563EB" />
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
              {/* Desk Workstation with Live Typing CRT Screen */}
              <DeskWorkstationV2 brand={crtBrand} crtSubtitle={crtSubtitle} terminalText={scene.terminalText} />
            </>
          ) : scene.type === "pipeline-visualizer" ? (
            <PipelineScene
              tabLabel={scene.tabLabel}
              tabColor={scene.tabColor}
              title={scene.title}
              subtitle={scene.subtitle}
              footerNote={scene.footerNote}
            />
          ) : scene.type === "tool-matrix" ? (
            <ToolMatrixScene
              tabLabel={scene.tabLabel}
              tabColor={scene.tabColor}
              title={scene.title}
              subtitle={scene.subtitle}
              footerNote={scene.footerNote}
            />
          ) : scene.type === "bento-cta" ? (
            <BentoCtaScene
              tabLabel={scene.tabLabel}
              tabColor={scene.tabColor}
              title={scene.title}
              subtitle={scene.subtitle}
              footerNote={scene.footerNote}
            />
          ) : (
            <EditorialCardV2
              tabLabel={scene.tabLabel}
              tabColor={scene.tabColor}
              title={scene.title}
              subtitle={scene.subtitle}
              items={scene.items}
              footerNote={scene.footerNote}
              emote={scene.emote}
              customVisualizer={scene.customVisualizer}
              hasMarkerLoop={scene.hasMarkerLoop}
            />
          )}

          {/* Word-synced Kinetic Captions */}
          {scene.captions.map((chunk, idx) => (
            <Sequence key={idx} from={chunk.fromFrame} durationInFrames={chunk.durationInFrames}>
              <KineticCaptionV2
                text={chunk.text}
                durationInFrames={chunk.durationInFrames}
                isHighlight={chunk.isHighlight}
              />
            </Sequence>
          ))}
        </Sequence>
      ))}

      {/* 3. Bottom Timeline Track with Walking Mascot */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          right: 0,
          height: 40,
          zIndex: 40,
        }}
      >
        {/* Track Line */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: trackStartX,
            width: trackEndX - trackStartX,
            height: 4,
            backgroundColor: "#E2E8F0",
            borderRadius: 2,
          }}
        />

        {/* Progress Colored Track */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: trackStartX,
            width: mascotTrackX - trackStartX,
            height: 4,
            backgroundColor: "#2563EB",
            borderRadius: 2,
          }}
        />

        {/* Waypoint dots */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((pct, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 17,
              left: interpolate(pct, [0, 1], [trackStartX, trackEndX]) - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: mascotProgress >= pct ? "#2563EB" : "#CBD5E1",
              border: "2px solid #FFFFFF",
            }}
          />
        ))}

        {/* Walking Mascot on Timeline */}
        <div
          style={{
            position: "absolute",
            top: -24,
            left: mascotTrackX - 22,
            transform: "scale(0.55)",
          }}
        >
          <PixelMascot x={0} y={0} isWalking={true} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
