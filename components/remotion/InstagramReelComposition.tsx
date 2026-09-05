"use client";

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import editWordsData from "../../data/edit_words.json";

// Load Inter 900 for ultra-tight 'UNIQUE BOLD CAPTIONS' style
const { fontFamily: interFont } = loadInter("normal", { weights: ["900"] });

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export type InstagramReelProps = {
  videoSrc?: string;
  words?: CaptionWord[];
};

function resolveMediaSource(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/api/")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

type SceneMode = "speaker-hook" | "split-screen" | "fullscreen-visual-card3" | "fullscreen-visual-card6" | "speaker-cta";

// Mapping of 10 visual cards with exact timing and layout style
const VISUAL_CARDS = [
  { id: 1, file: "edit_assets/E2345BC2-F3AE-4E33-8ABD-31E1C76E7ADA.png", start: 2.20, end: 3.90, badge: "⚡ 100% FREE AI" },
  { id: 2, file: "edit_assets/AAF67520-C6E0-4F70-968A-3ECDB28032EC.png", start: 3.90, end: 6.70, badge: "🎯 98% ATS SCORE" },
  { id: 3, file: "edit_assets/4BFFEE01-923C-4436-B05E-191B2BFF454F.png", start: 6.70, end: 9.00, badge: "🚀 AUTO-APPLY ON", isDeepDive: true },
  { id: 4, file: "edit_assets/01053198-6625-44BB-AEF3-ACC60DC01D69.png", start: 9.00, end: 11.75, badge: "📝 1-CLICK CV SETUP" },
  { id: 5, file: "edit_assets/BE16AF7C-0BA7-4564-B5AA-840FE79299E8.png", start: 11.75, end: 13.70, badge: "✅ 95% PROFILE STRENGTH" },
  { id: 6, file: "edit_assets/CC05A077-6307-40CF-95E5-0E33BABD5442.png", start: 13.70, end: 18.00, badge: "🔍 MULTI-PORTAL SCRAPER", isDeepDive: true },
  { id: 7, file: "edit_assets/0C3AEE0A-F7E6-404D-BDE8-308CB2D187F7.png", start: 18.00, end: 22.75, badge: "🏆 TOP JOB MATCHES" },
  { id: 8, file: "edit_assets/0F9FC9BB-36EB-4AE2-8557-1B78F95289E2.png", start: 22.75, end: 27.50, badge: "✨ ATS OPTIMIZER" },
  { id: 9, file: "edit_assets/3E53D761-540C-41AE-89FF-6563A2D2E524.png", start: 27.50, end: 29.50, badge: "🤖 AUTO DISPATCHER" },
  { id: 10, file: "edit_assets/3BD060C9-C556-421B-9698-4BBDA5204AD0.png", start: 29.50, end: 34.13, badge: "📦 SETUP PDF GUIDE" },
];

// High-impact keyword dictionary for yellow accent styling
const KEYWORDS = new Set([
  "FREE", "AI", "TOOL", "JOBS", "DHOONDEGA",
  "OPTIMIZE", "RESUME", "APPLY", "PROFILE", "READY",
  "LINKEDIN", "INDEED", "SCORE", "BEST", "80", "98", "ATS",
  "GUIDE", "COMMENT"
]);

export const InstagramReelComposition: React.FC<InstagramReelProps> = ({
  videoSrc = "edit_source.mp4",
  words = editWordsData.words,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Process words
  const processedWords = useMemo(() => {
    return words.map((w, index) => {
      const next = words[index + 1];
      const naturalGap = next ? next.start - w.end : 0;
      const effectiveEnd = naturalGap > 0 && naturalGap < 0.08 ? next.start : w.end;
      const cleanWord = w.word.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const isKeyword = KEYWORDS.has(cleanWord) || cleanWord.includes("APPLY") || cleanWord.includes("FREE") || cleanWord.includes("JOB");
      return {
        word: w.word.toUpperCase(),
        start: w.start,
        end: w.end,
        effectiveStart: w.start,
        effectiveEnd,
        isKeyword,
      };
    });
  }, [words]);

  // Group words into natural 2-word phrase pairs for comfortable reading
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

      // Group 2 words together or split on pauses > 0.25s
      if (currentGroup.length >= 2 || (currentGroup.length > 0 && gap > 0.25)) {
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

  // Active 2-word phrase
  const activePhrase = useMemo(() => {
    return phrases.find((p) => currentTime >= p.start && currentTime < p.end);
  }, [phrases, currentTime]);

  // Active Visual Card
  const activeCard = useMemo(() => {
    return VISUAL_CARDS.find((c) => currentTime >= c.start && currentTime < c.end) || VISUAL_CARDS[0];
  }, [currentTime]);

  // Determine Scene Mode (Early Full-Screen at Card 3 and Card 6)
  let sceneMode: SceneMode = "split-screen";
  if (currentTime < 2.20) {
    sceneMode = "speaker-hook";
  } else if (currentTime >= 6.70 && currentTime < 9.00) {
    sceneMode = "fullscreen-visual-card3";
  } else if (currentTime >= 13.70 && currentTime < 18.00) {
    sceneMode = "fullscreen-visual-card6";
  } else if (currentTime >= 29.50) {
    sceneMode = "speaker-cta";
  } else {
    sceneMode = "split-screen";
  }

  // --- 2-Word Slide-Up In & Exit Blur Engine ---
  const renderTwoWordCaptions = () => {
    if (!activePhrase) return null;

    const startFrame = Math.round(activePhrase.start * fps);
    const endFrame = Math.round(activePhrase.end * fps);
    const phraseDurationFrames = Math.max(4, endFrame - startFrame);
    const relFrame = Math.max(0, frame - startFrame);

    // 1. Smooth, Gentle Slide-Up Entrance
    const enterSpring = spring({
      frame: relFrame,
      fps,
      config: { damping: 20, stiffness: 150, mass: 0.4 },
    });
    const enterSlideY = interpolate(enterSpring, [0, 1], [26, 0]);
    const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

    // 2. Smooth Exit Motion Blur (last 3-4 frames of this 2-word phrase)
    const exitDuration = Math.min(4, Math.floor(phraseDurationFrames * 0.35));
    const exitStartFrame = endFrame - exitDuration;
    const isExiting = frame >= exitStartFrame;

    const exitProgress = isExiting
      ? interpolate(frame, [exitStartFrame, endFrame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

    const exitBlur = isExiting ? interpolate(exitProgress, [0, 1], [0, 12]) : 0;
    const exitOpacity = isExiting ? interpolate(exitProgress, [0, 1], [1, 0]) : 1;
    const exitSlideY = isExiting ? interpolate(exitProgress, [0, 1], [0, -10]) : 0;

    const totalY = enterSlideY + exitSlideY;
    const totalOpacity = enterOpacity * exitOpacity;

    const captionTop =
      sceneMode === "split-screen"
        ? "49.5%"
        : sceneMode.startsWith("fullscreen-visual")
        ? "86%"
        : "72%";

    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: captionTop,
          transform: `translate(-50%, -50%) translateY(${totalY}px)`,
          opacity: totalOpacity,
          filter: `blur(${exitBlur}px)`,
          zIndex: 140,
          pointerEvents: "none",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          flexWrap: "nowrap",
          width: "90%",
        }}
      >
        {activePhrase.words.map((item, idx) => {
          const isCurrentlySpoken = currentTime >= item.effectiveStart && currentTime < item.effectiveEnd;
          const wordOpacity = isCurrentlySpoken ? 1.0 : 0.72;

          const isYellowKeyword = item.isKeyword;

          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                opacity: wordOpacity,
                fontFamily: `"${interFont}", "Helvetica Neue", Helvetica, Arial, sans-serif`,
                fontWeight: 900,
                fontSize: isYellowKeyword
                  ? (sceneMode === "split-screen" ? "68px" : "76px")
                  : (sceneMode === "split-screen" ? "58px" : "66px"),
                lineHeight: 0.9,
                letterSpacing: "-3.5px", // Ultra-tight monolithic letter spacing
                color: isYellowKeyword ? "#FFE500" : "#FFFFFF",
                textTransform: "uppercase",
                paintOrder: "stroke fill",
                WebkitTextStroke: "6px #000000",
                textShadow: isYellowKeyword
                  ? "0 8px 24px rgba(255, 229, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.95), 0 16px 40px rgba(0, 0, 0, 0.7)"
                  : "0 8px 24px rgba(0, 0, 0, 0.85), 0 2px 6px rgba(0, 0, 0, 0.95), 0 16px 40px rgba(0, 0, 0, 0.6)",
                filter: "drop-shadow(0px 8px 18px rgba(0, 0, 0, 1))",
                transition: "opacity 0.05s ease-out",
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    );
  };

  // --- Dynamic Floating Card Component with Slide-Up & Scale Pop (Split-Screen) ---
  const renderFloatingCard = () => {
    if (!activeCard) return null;

    const cardStartFrame = Math.round(activeCard.start * fps);
    const cardRelFrame = Math.max(0, frame - cardStartFrame);

    // Snappy Apple cubic spring on card entrance
    const popSpring = spring({
      frame: cardRelFrame,
      fps,
      config: { damping: 13, stiffness: 190, mass: 0.3 },
    });

    const floatY = Math.sin((frame / fps) * 2.0) * 3;
    const cardScale = interpolate(popSpring, [0, 1], [0.88, 1.0]);
    const cardTranslateY = interpolate(popSpring, [0, 1], [55, 0]);

    return (
      <div
        key={activeCard.id}
        style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: `translateX(-50%) translateY(${cardTranslateY + floatY}px) scale(${cardScale})`,
          width: "610px",
          height: "825px",
          borderRadius: "38px",
          overflow: "hidden",
          boxShadow:
            "0 30px 70px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.03)",
          border: "2.5px solid rgba(255, 255, 255, 0.98)",
          background: "#FFFFFF",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={resolveMediaSource(activeCard.file)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        {/* Floating Feature Badge */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "999px",
            padding: "6px 16px",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "12px",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
          }}
        >
          {activeCard.badge}
        </div>
      </div>
    );
  };

  // --- Clean Full-Screen Visual Showcase Mode (CENTERED & No Circle HUD) ---
  const renderFullScreenDeepDive = () => {
    if (!sceneMode.startsWith("fullscreen-visual") || !activeCard) return null;

    const relFrame = Math.max(0, frame - Math.round(activeCard.start * fps));
    const enterSpring = spring({ frame: relFrame, fps, config: { damping: 14, stiffness: 180 } });
    const zoomScale = interpolate(relFrame, [0, 130], [1.0, 1.05], { extrapolateRight: "clamp" });
    const slideUp = interpolate(enterSpring, [0, 1], [40, 0]);

    return (
      <AbsoluteFill style={{ backgroundColor: "#090D16", overflow: "hidden" }}>
        {/* Elegant Ambient Radial Lighting */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 45%, rgba(37, 99, 235, 0.22) 0%, #060911 80%)",
          }}
        />

        {/* Card PERFECTLY CENTERED in screen with smooth push-in */}
        <div
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${slideUp}px) scale(${enterSpring * zoomScale})`,
            width: "720px",
            height: "960px",
            borderRadius: "44px",
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0, 0, 0, 0.85), 0 0 60px rgba(37, 99, 235, 0.4)",
            border: "3px solid rgba(255, 255, 255, 0.95)",
            background: "#FFFFFF",
            zIndex: 30,
          }}
        >
          <Img
            src={resolveMediaSource(activeCard.file)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Clean Top Live Badge */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "999px",
            padding: "9px 26px",
            color: "#38BDF8",
            fontWeight: 900,
            fontSize: "15px",
            letterSpacing: "1px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
        >
          ⚡ FEATURE DEEP-DIVE • {activeCard.badge}
        </div>
      </AbsoluteFill>
    );
  };

  // --- CTA Overlay for Closing Scene (29.50s - 34.13s) ---
  const renderSceneCTA = () => {
    if (sceneMode !== "speaker-cta") return null;
    const relFrame = Math.max(0, frame - Math.round(29.50 * fps));
    const enter = spring({ frame: relFrame, fps, config: { damping: 12, stiffness: 170 } });
    const pulse = 1 + Math.sin(relFrame * 0.2) * 0.04;

    return (
      <div
        style={{
          position: "absolute",
          top: "150px",
          left: "50%",
          transform: `translateX(-50%) scale(${enter * pulse})`,
          zIndex: 110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          width: "640px",
        }}
      >
        {/* Main CTA Trigger Box */}
        <div
          style={{
            padding: "20px 42px",
            borderRadius: "30px",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            color: "#FFFFFF",
            fontWeight: 950,
            fontSize: "36px",
            letterSpacing: "1.5px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 24px 70px rgba(37, 99, 235, 0.75), 0 0 40px rgba(124, 58, 237, 0.5)",
          }}
        >
          <span>💬</span>
          <span>COMMENT "APPLY"</span>
        </div>

        {/* Subtitle Banner for ManyChat Automation */}
        <div
          style={{
            padding: "12px 28px",
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "#FFF",
            fontWeight: 700,
            fontSize: "17px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          ✨ I will DM you the step-by-step PDF setup guide + GitHub link!
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>

      {/* Master Dialogue Audio */}
      <Audio src={resolveMediaSource("edit_master_audio.wav")} volume={1.0} />

      {/* 1. HOOK SCENE (0.00s - 2.20s: Full-Screen Speaker) */}
      {sceneMode === "speaker-hook" && (
        <AbsoluteFill style={{ backgroundColor: "#000000" }}>
          <OffthreadVideo
            src={resolveMediaSource(videoSrc)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <AbsoluteFill
            style={{
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.45) 100%)",
              zIndex: 30,
            }}
          />
        </AbsoluteFill>
      )}

      {/* 2. SIGNATURE APPLE-STYLE SPLIT-SCREEN */}
      {sceneMode === "split-screen" && (
        <AbsoluteFill style={{ backgroundColor: "#F8F9FA" }}>
          {/* Subtle dot grid backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)",
              backgroundSize: "36px 36px",
              opacity: 0.65,
            }}
          />

          {/* TOP SECTION: Floating Visual Card with Slide-Up Spring */}
          {renderFloatingCard()}

          {/* BOTTOM SECTION: Zoomed-Out Talking Head inside Arched Window */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "28px",
              right: "28px",
              height: "860px",
              borderRadius: "52px 52px 0 0",
              overflow: "hidden",
              boxShadow:
                "0 -10px 40px rgba(0, 0, 0, 0.08), 0 -2px 10px rgba(0, 0, 0, 0.03)",
              border: "2px solid rgba(255, 255, 255, 0.9)",
              borderBottom: "none",
              zIndex: 20,
              background: "#000",
            }}
          >
            <OffthreadVideo
              src={resolveMediaSource(videoSrc)}
              muted
              style={{
                position: "absolute",
                top: "-140px",
                left: "50%",
                transform: "translateX(-50%) scale(0.86)",
                width: "100%",
                height: "1400px",
                objectFit: "cover",
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* 3. FULL-SCREEN VISUAL SHOWCASES (Card 3 at 6.7s & Card 6 at 13.7s) */}
      {renderFullScreenDeepDive()}

      {/* 4. CLOSING / CTA SCENE (29.50s - 34.13s) */}
      {sceneMode === "speaker-cta" && (
        <AbsoluteFill style={{ backgroundColor: "#000000" }}>
          <OffthreadVideo
            src={resolveMediaSource(videoSrc)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <AbsoluteFill
            style={{
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.45) 100%)",
              zIndex: 30,
            }}
          />
        </AbsoluteFill>
      )}

      {/* CTA Overlay on Final Scene */}
      {renderSceneCTA()}

      {/* 2-Word Slide-Up In & Blur Out Captions */}
      {renderTwoWordCaptions()}

    </AbsoluteFill>
  );
};
