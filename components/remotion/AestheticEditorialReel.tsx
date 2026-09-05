"use client";

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import editWordsData from "../../data/edit_words.json";

// Typography
const { fontFamily: sansFont } = loadInter("normal", { weights: ["900"] });
const { fontFamily: serifFont } = loadPlayfair("italic", { weights: ["900"] });

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export type AestheticReelProps = {
  videoSrc?: string;
  words?: CaptionWord[];
};

function resolveMediaSource(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/api/")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

// 10 Visual Card Assets (3:4 ratio: 1086x1448)
const VISUAL_CARDS = [
  { id: 1, file: "edit_assets/E2345BC2-F3AE-4E33-8ABD-31E1C76E7ADA.png", start: 2.10, end: 3.90, badge: "⚡ 100% FREE AI" },
  { id: 2, file: "edit_assets/AAF67520-C6E0-4F70-968A-3ECDB28032EC.png", start: 3.90, end: 6.70, badge: "🎯 98% ATS SCORE" },
  { id: 3, file: "edit_assets/4BFFEE01-923C-4436-B05E-191B2BFF454F.png", start: 6.70, end: 9.00, badge: "🚀 AUTO-APPLY ON" },
  { id: 4, file: "edit_assets/01053198-6625-44BB-AEF3-ACC60DC01D69.png", start: 9.00, end: 11.75, badge: "📝 1-CLICK CV SETUP" },
  // Middle Full-Screen Showcase Cards (11.75s - 18.0s)
  { id: 5, file: "edit_assets/BE16AF7C-0BA7-4564-B5AA-840FE79299E8.png", start: 11.75, end: 14.50, badge: "✅ 95% PROFILE STRENGTH" },
  { id: 6, file: "edit_assets/CC05A077-6307-40CF-95E5-0E33BABD5442.png", start: 14.50, end: 18.00, badge: "🔍 MULTI-PORTAL SCRAPER" },
  // Cream Paper Cards (18.0s - 27.5s)
  { id: 7, file: "edit_assets/0C3AEE0A-F7E6-404D-BDE8-308CB2D187F7.png", start: 18.00, end: 22.75, badge: "🏆 TOP JOB MATCHES" },
  { id: 8, file: "edit_assets/0F9FC9BB-36EB-4AE2-8557-1B78F95289E2.png", start: 22.75, end: 27.50, badge: "✨ ATS OPTIMIZER" },
  { id: 9, file: "edit_assets/3E53D761-540C-41AE-89FF-6563A2D2E524.png", start: 27.50, end: 29.50, badge: "🤖 AUTO DISPATCHER" },
  { id: 10, file: "edit_assets/3BD060C9-C556-421B-9698-4BBDA5204AD0.png", start: 29.50, end: 34.17, badge: "📦 SETUP PDF GUIDE" },
];

const EMOTIONAL_SERIF_WORDS = new Set([
  "FREE", "AI", "TOOL", "JOBS", "DHOONDEGA",
  "RESUME", "OPTIMIZE", "APPLY", "AUTOMATIC",
  "DISPATCHER", "GUIDE", "COMMENT"
]);

const ALERT_RED_WORDS = new Set([
  "DHOONDEGA", "OPTIMIZE", "APPLY", "COMMENT"
]);

export const AestheticEditorialReel: React.FC<AestheticReelProps> = ({
  videoSrc = "edit_source.mp4",
  words = editWordsData.words,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Process word timings & typography roles
  const processedWords = useMemo(() => {
    return words.map((w, index) => {
      const next = words[index + 1];
      const naturalGap = next ? next.start - w.end : 0;
      const effectiveEnd = naturalGap > 0 && naturalGap < 0.08 ? next.start : w.end;
      const cleanUpper = w.word.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const isSerif = EMOTIONAL_SERIF_WORDS.has(cleanUpper) || cleanUpper.includes("FREE") || cleanUpper.includes("JOB");
      const isRed = ALERT_RED_WORDS.has(cleanUpper);
      const isCyan = cleanUpper.includes("GUIDE") || cleanUpper.includes("AI");

      return {
        raw: w.word,
        word: w.word.toUpperCase(),
        start: w.start,
        end: w.end,
        effectiveStart: w.start,
        effectiveEnd,
        isSerif,
        isRed,
        isCyan,
      };
    });
  }, [words]);

  // Group into rhythmic 2-word bursts
  const phrases = useMemo(() => {
    const list: Array<{
      id: number;
      start: number;
      end: number;
      words: typeof processedWords;
    }> = [];

    let currentGroup: typeof processedWords = [];
    for (let i = 0; i < processedWords.length; i++) {
      const w = processedWords[i];
      const prev = processedWords[i - 1];
      const gap = prev ? w.start - prev.end : 0;

      if (currentGroup.length >= 2 || (currentGroup.length > 0 && gap > 0.22)) {
        list.push({
          id: list.length,
          start: currentGroup[0].start,
          end: currentGroup[currentGroup.length - 1].effectiveEnd,
          words: currentGroup,
        });
        currentGroup = [];
      }
      currentGroup.push(w);
    }
    if (currentGroup.length > 0) {
      list.push({
        id: list.length,
        start: currentGroup[0].start,
        end: currentGroup[currentGroup.length - 1].effectiveEnd,
        words: currentGroup,
      });
    }
    return list;
  }, [processedWords]);

  const activePhrase = useMemo(() => {
    return phrases.find((p) => currentTime >= p.start && currentTime < p.end);
  }, [phrases, currentTime]);

  // Layout State Machine
  // Mode 1: 0.0s - 2.10s -> Fullscreen Hook
  // Mode 2: 2.10s - 11.75s -> Split Screen (Navy & Newspaper)
  // Mode 3: 11.75s - 18.00s -> FULL-SCREEN VISUAL SHOWCASE (Speaker Hides)
  // Mode 4: 18.00s - 27.50s -> Split Screen (Warm Cream Paper)
  // Mode 5: 27.50s - 34.17s -> Fullscreen CTA Finale
  const isHookFullscreen = currentTime < 2.10;
  const isMiddleFullscreenVisual = currentTime >= 11.75 && currentTime < 18.00;
  const isCtaFullscreen = currentTime >= 27.50;
  const isSplitMode = !isHookFullscreen && !isMiddleFullscreenVisual && !isCtaFullscreen;

  let bgTheme: "dark-navy" | "vintage-newspaper" | "dark-portal" | "warm-cream" = "dark-navy";
  if (currentTime >= 6.70 && currentTime < 11.75) {
    bgTheme = "vintage-newspaper";
  } else if (currentTime >= 11.75 && currentTime < 18.00) {
    bgTheme = "dark-portal";
  } else if (currentTime >= 18.00 && currentTime < 27.50) {
    bgTheme = "warm-cream";
  }

  // --- SPEAKER CONTAINER GEOMETRY (Eliminates ALL black borders) ---
  let speakerBottom = 36;
  let speakerLeft = 36;
  let speakerRight = 36;
  let speakerHeight = 840;
  let speakerRadius = 40;
  let speakerOpacity = 1;
  let speakerScale = 1;

  if (isHookFullscreen || isCtaFullscreen) {
    speakerBottom = 0;
    speakerLeft = 0;
    speakerRight = 0;
    speakerHeight = 1920;
    speakerRadius = 0;
    speakerOpacity = 1;
  } else if (isMiddleFullscreenVisual) {
    // Speaker smoothly hides during full-screen visual deep-dive
    const exitMiddle = interpolate(currentTime, [11.60, 11.85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const enterCream = interpolate(currentTime, [17.80, 18.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    speakerOpacity = exitMiddle + enterCream;
    speakerScale = interpolate(speakerOpacity, [0, 1], [0.92, 1.0]);
  }

  // --- RENDER VISUAL CARDS (Split Mode & Middle Full-Screen Showcase) ---
  const renderVisualCards = () => {
    if (isHookFullscreen || isCtaFullscreen) return null;

    return VISUAL_CARDS.map((card) => {
      if (currentTime < card.start - 0.2 || currentTime > card.end + 0.2) return null;

      const cardStartFrame = Math.round(card.start * fps);
      const cardEndFrame = Math.round(card.end * fps);
      const relFrame = Math.max(0, frame - cardStartFrame);
      const totalFrames = cardEndFrame - cardStartFrame;

      // Spring Entrance Physics
      const enterSpring = spring({
        frame: relFrame,
        fps,
        config: { damping: 14, stiffness: 190, mass: 0.3 },
      });
      const enterScale = interpolate(enterSpring, [0, 1], [0.85, 1.0]);
      const enterSlideY = interpolate(enterSpring, [0, 1], [40, 0]);
      const enterRotate = interpolate(enterSpring, [0, 1], [-2, 0]);
      const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
      const enterBlur = interpolate(relFrame, [0, 3], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      // Subtle Ken-Burns Drift
      const driftScale = 1 + (relFrame / totalFrames) * 0.02;

      // Exit Transition (Last 4 frames)
      const framesLeft = Math.max(0, cardEndFrame - frame);
      const isExiting = framesLeft <= 4;
      const exitProgress = isExiting
        ? interpolate(4 - framesLeft, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 0;
      const exitSlideY = isExiting ? interpolate(exitProgress, [0, 1], [0, -20]) : 0;
      const exitScale = isExiting ? interpolate(exitProgress, [0, 1], [1, 0.95]) : 1;
      const exitOpacity = isExiting ? interpolate(exitProgress, [0, 1], [1, 0]) : 1;
      const exitBlur = isExiting ? interpolate(exitProgress, [0, 1], [0, 6]) : 0;

      const finalScale = enterScale * driftScale * exitScale;
      const finalY = enterSlideY + exitSlideY;
      const finalOpacity = enterOpacity * exitOpacity;
      const finalBlur = Math.max(enterBlur, exitBlur);

      // MIDDLE FULL-SCREEN SHOWCASE (11.75s - 18.0s)
      if (isMiddleFullscreenVisual) {
        return (
          <div
            key={card.id}
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${finalY}px) scale(${finalScale}) rotate(${enterRotate}deg)`,
              opacity: finalOpacity,
              filter: `blur(${finalBlur}px)`,
              width: "820px",
              height: "1093px", // Full-screen centered 3:4 showcase
              borderRadius: "48px",
              overflow: "hidden",
              boxShadow: "0 40px 110px rgba(0, 0, 0, 0.85), 0 0 60px rgba(37, 99, 235, 0.4)",
              border: "3.5px solid rgba(255, 255, 255, 0.3)",
              backgroundColor: "#FFFFFF",
              zIndex: 30,
            }}
          >
            <Img
              src={resolveMediaSource(card.file)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <div
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "rgba(15, 23, 42, 0.94)",
                backdropFilter: "blur(12px)",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "999px",
                fontFamily: sansFont,
                fontSize: "16px",
                fontWeight: 900,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
              }}
            >
              {card.badge}
            </div>
          </div>
        );
      }

      // SPLIT SCREEN CARD (Top position)
      return (
        <div
          key={card.id}
          style={{
            position: "absolute",
            top: "65px",
            left: "50%",
            transform: `translateX(-50%) translateY(${finalY}px) scale(${finalScale}) rotate(${enterRotate}deg)`,
            opacity: finalOpacity,
            filter: `blur(${finalBlur}px)`,
            width: "630px",
            height: "840px",
            borderRadius: "40px",
            overflow: "hidden",
            boxShadow:
              bgTheme === "dark-navy"
                ? "0 30px 90px rgba(0, 0, 0, 0.75), 0 0 50px rgba(37, 99, 235, 0.35)"
                : "0 24px 70px rgba(0, 0, 0, 0.15)",
            border:
              bgTheme === "dark-navy"
                ? "3px solid rgba(255, 255, 255, 0.25)"
                : "3px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#FFFFFF",
            zIndex: 20,
          }}
        >
          <Img
            src={resolveMediaSource(card.file)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: card.badge.includes("FREE")
                ? "linear-gradient(135deg, #FF6B00, #E11D48)"
                : "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(10px)",
              color: "#FFFFFF",
              padding: "7px 16px",
              borderRadius: "999px",
              fontFamily: sansFont,
              fontSize: "14px",
              fontWeight: 900,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            }}
          >
            {card.badge}
          </div>
        </div>
      );
    });
  };

  // --- KINETIC CAPTIONS ---
  const renderKineticCaptions = () => {
    if (!activePhrase) return null;

    const startFrame = Math.round(activePhrase.start * fps);
    const endFrame = Math.round(activePhrase.end * fps);
    const relFrame = Math.max(0, frame - startFrame);

    const enterSpring = spring({
      frame: relFrame,
      fps,
      config: { damping: 18, stiffness: 220, mass: 0.3 },
    });
    const enterSlideY = interpolate(enterSpring, [0, 1], [30, 0]);
    const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

    const framesLeft = Math.max(0, endFrame - frame);
    const isExiting = framesLeft <= 4;
    const exitProgress = isExiting
      ? interpolate(4 - framesLeft, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    const exitBlur = isExiting ? interpolate(exitProgress, [0, 1], [0, 12]) : 0;
    const exitOpacity = isExiting ? interpolate(exitProgress, [0, 1], [1, 0]) : 1;
    const exitSlideY = isExiting ? interpolate(exitProgress, [0, 1], [0, -12]) : 0;

    const totalY = enterSlideY + exitSlideY;
    const totalOpacity = enterOpacity * exitOpacity;

    const isLightBg = bgTheme === "vintage-newspaper" || bgTheme === "warm-cream";

    // Dynamic vertical placement depending on scene
    const topPosition = isHookFullscreen || isCtaFullscreen
      ? "72%"
      : isMiddleFullscreenVisual
      ? "84%" // Centered below the full-screen visual card
      : "51.5%";

    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: topPosition,
          transform: `translate(-50%, -50%) translateY(${totalY}px)`,
          opacity: totalOpacity,
          filter: `blur(${exitBlur}px)`,
          zIndex: 70,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: "14px",
          width: "92%",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {activePhrase.words.map((w, i) => {
          let fontFam = w.isSerif ? serifFont : sansFont;
          let fontSty: "italic" | "normal" = w.isSerif ? "italic" : "normal";
          let fontColor = isLightBg ? "#111827" : "#FFFFFF";
          let textShad = isLightBg
            ? "0 2px 10px rgba(0,0,0,0.12)"
            : "0 4px 20px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.95)";

          if (w.isRed) {
            fontColor = "#DC2626";
            textShad = "0 0 24px rgba(220, 38, 38, 0.8), 0 2px 6px rgba(0,0,0,0.9)";
          } else if (w.isCyan) {
            fontColor = "#38BDF8";
            textShad = "0 0 24px rgba(56, 189, 248, 0.85), 0 2px 6px rgba(0,0,0,0.9)";
          }

          return (
            <span
              key={i}
              style={{
                fontFamily: fontFam,
                fontStyle: fontSty,
                fontWeight: 900,
                fontSize: w.isSerif ? "68px" : "62px",
                color: fontColor,
                textShadow: textShad,
                letterSpacing: w.isSerif ? "-0.02em" : "-0.04em",
                lineHeight: "1.1",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    );
  };

  // --- SVG ANIMATED RED MARKER ANNOTATIONS ---
  const renderRedMarkerAnnotations = () => {
    if (bgTheme !== "vintage-newspaper") return null;

    const relMarkerFrame = Math.max(0, frame - Math.round(6.70 * fps));
    const drawProgress = interpolate(relMarkerFrame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pathLength = 320;
    const dashOffset = (1 - drawProgress) * pathLength;

    return (
      <div
        style={{
          position: "absolute",
          top: "51.5%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 65,
          pointerEvents: "none",
          width: "560px",
          height: "120px",
        }}
      >
        <svg width="560" height="120" viewBox="0 0 560 120">
          <path
            d="M 40,95 Q 200,105 340,90 Q 480,82 520,96"
            fill="none"
            stroke="#DC2626"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
          />
          <path
            d="M 60,60 C 40,20 500,15 500,60 C 500,105 40,110 55,62"
            fill="none"
            stroke="#DC2626"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={900}
            strokeDashoffset={(1 - drawProgress) * 900}
          />
        </svg>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* 1. MASTER AUDIO */}
      <Audio src={staticFile("edit_master_audio.wav")} volume={1.0} />

      {/* 2. SFX CUES */}
      {VISUAL_CARDS.map((c) => (
        <Sequence key={c.id} from={Math.round(c.start * fps)} durationInFrames={15}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={Math.round(6.70 * fps)} durationInFrames={25}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={Math.round(11.75 * fps)} durationInFrames={20}>
        <Audio src={staticFile("sfx/impact.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={Math.round(27.50 * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/notification.wav")} volume={0.45} />
      </Sequence>

      {/* 3. DYNAMIC BACKGROUND THEMES */}
      {bgTheme === "dark-navy" && (
        <AbsoluteFill style={{ backgroundColor: "#081245" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 25%, rgba(37,99,235,0.4) 0%, #060B22 80%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "100px",
              left: "40px",
              width: "130px",
              height: "170px",
              borderRadius: "28px",
              background: "#FF6B00",
              boxShadow: "0 20px 40px rgba(255, 107, 0, 0.4)",
              transform: "rotate(-8deg)",
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "120px",
              right: "40px",
              width: "140px",
              height: "180px",
              borderRadius: "28px",
              background: "#E11D48",
              boxShadow: "0 20px 40px rgba(225, 29, 72, 0.4)",
              transform: "rotate(10deg)",
              opacity: 0.85,
            }}
          />
        </AbsoluteFill>
      )}

      {bgTheme === "vintage-newspaper" && (
        <AbsoluteFill style={{ backgroundColor: "#F0EAD6" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px),
                linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%),
                linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%)
              `,
              backgroundSize: "24px 24px, 40px 40px, 40px 40px",
              opacity: 0.9,
            }}
          />
        </AbsoluteFill>
      )}

      {bgTheme === "dark-portal" && (
        <AbsoluteFill style={{ backgroundColor: "#060911" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 45%, rgba(37,99,235,0.35) 0%, #060911 85%)",
            }}
          />
        </AbsoluteFill>
      )}

      {bgTheme === "warm-cream" && (
        <AbsoluteFill style={{ backgroundColor: "#F5F2E3" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 4. VISUAL CARDS RENDERER */}
      {renderVisualCards()}

      {/* 5. RED MARKER ANNOTATIONS */}
      {renderRedMarkerAnnotations()}

      {/* 6. SPEAKER VIDEO CONTAINER (Curved Floating Card, Headroom Cropped, Face Moved Upward) */}
      <div
        style={{
          position: "absolute",
          bottom: `${speakerBottom}px`,
          left: `${speakerLeft}px`,
          right: `${speakerRight}px`,
          height: `${speakerHeight}px`,
          borderRadius: `${speakerRadius}px`,
          overflow: "hidden",
          border: isHookFullscreen || isCtaFullscreen ? "none" : "3px solid rgba(255, 255, 255, 0.85)",
          boxShadow: isHookFullscreen || isCtaFullscreen ? "none" : "0 20px 60px rgba(0, 0, 0, 0.55)",
          zIndex: 10,
          backgroundColor: "#000000",
          opacity: speakerOpacity,
          transform: `scale(${speakerScale})`,
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <OffthreadVideo
          src={resolveMediaSource(videoSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isHookFullscreen || isCtaFullscreen ? "scale(1.02)" : "scale(1.05) translateY(2%)",
            transformOrigin: "center center",
            filter: "contrast(1.08) brightness(1.02)",
          }}
        />
        {(isHookFullscreen || isCtaFullscreen) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
            }}
          />
        )}
      </div>

      {/* 7. MANYCHAT PULSING CTA BADGE (Scene 6) */}
      {isCtaFullscreen && (
        <div
          style={{
            position: "absolute",
            bottom: "160px",
            left: "50%",
            transform: `translateX(-50%) scale(${1 + Math.sin(frame * 0.2) * 0.03})`,
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            padding: "16px 36px",
            borderRadius: "999px",
            boxShadow: "0 20px 60px rgba(37, 99, 235, 0.8), 0 0 30px rgba(124, 58, 237, 0.5)",
            border: "2px solid rgba(255, 255, 255, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 80,
          }}
        >
          <span style={{ fontSize: "28px" }}>💬</span>
          <span
            style={{
              fontFamily: sansFont,
              fontSize: "30px",
              fontWeight: 950,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            COMMENT <span style={{ color: "#FFE500" }}>"GUIDE"</span>
          </span>
        </div>
      )}

      {/* 8. GLOBAL KINETIC DUAL-FONT CAPTIONS */}
      {renderKineticCaptions()}
    </AbsoluteFill>
  );
};
