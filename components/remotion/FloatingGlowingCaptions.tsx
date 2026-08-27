"use client";

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface CaptionWord {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export type FloatingGlowingCaptionsProps = {
  videoSrc: string;
  words: CaptionWord[];
  fontSize?: number;
  positionYPercent?: number;
  letterSpacing?: number;
  textTransform?: "uppercase" | "none" | "capitalize";
  [key: string]: unknown;
};

function resolveMediaSource(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/api/")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

export const FloatingGlowingCaptions: React.FC<FloatingGlowingCaptionsProps> = ({
  videoSrc,
  words,
  fontSize,
  positionYPercent = 82,
  letterSpacing = 1.5,
  textTransform = "uppercase",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const currentTime = frame / fps;

  // Pre-process word segments to ensure seamless transitions and natural hold during speech
  const processedWords = useMemo(() => {
    return words.map((w, index) => {
      const next = words[index + 1];
      const naturalGap = next ? next.start - w.end : 0;
      // If gap is very short (< 0.22s), hold the word until the next one starts for continuous speech rhythm
      const effectiveEnd = naturalGap > 0 && naturalGap < 0.22 ? next.start : w.end + 0.08;
      return {
        ...w,
        effectiveStart: w.start,
        effectiveEnd,
      };
    });
  }, [words]);

  // Find the currently active word
  const activeWord = useMemo(() => {
    return processedWords.find(
      (w) => currentTime >= w.effectiveStart && currentTime < w.effectiveEnd
    );
  }, [processedWords, currentTime]);

  // Proportional font sizing: ~7% of screen width (e.g. 76px on 1080p, 152px on 4K)
  const effectiveFontSize = fontSize ?? Math.round(width * 0.070);

  // Compute animations if a word is active
  let wordContent: React.ReactNode = null;

  if (activeWord) {
    const startFrame = Math.round(activeWord.effectiveStart * fps);
    const endFrame = Math.round(activeWord.effectiveEnd * fps);
    const wordRelFrame = Math.max(0, frame - startFrame);
    const wordDurationFrames = Math.max(1, endFrame - startFrame);

    // Premium spring physics for bottom float-in
    const enterSpring = spring({
      frame: wordRelFrame,
      fps,
      config: {
        damping: 15,
        mass: 0.42,
        stiffness: 145,
      },
    });

    // Float upward from +28px below smoothly to 0px
    const floatY = interpolate(enterSpring, [0, 1], [28, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Subtle ambient upward glide during word duration (-2px float)
    const driftY = interpolate(wordRelFrame, [0, wordDurationFrames], [0, -3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.2, 0, 0.3, 1),
    });

    // Ultra-smooth opacity entrance (2.5 frames)
    const opacity = interpolate(wordRelFrame, [0, 2.5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });

    // Subtle scale settling (0.93 -> 1.0)
    const scale = interpolate(enterSpring, [0, 1], [0.93, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Gentle breathing pulse for the ethereal white glow
    const glowPulse = 1 + Math.sin(wordRelFrame * 0.12) * 0.06;

    const formattedWord =
      textTransform === "uppercase"
        ? activeWord.word.toUpperCase()
        : textTransform === "capitalize"
        ? activeWord.word.charAt(0).toUpperCase() + activeWord.word.slice(1).toLowerCase()
        : activeWord.word;

    wordContent = (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${positionYPercent}%`,
          transform: `translate(-50%, -50%) translateY(${floatY + driftY}px) scale(${scale})`,
          opacity,
          zIndex: 100,
          pointerEvents: "none",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Montserrat", "Inter", "Helvetica Neue", sans-serif',
            fontWeight: 900,
            fontSize: `${effectiveFontSize}px`,
            lineHeight: 1,
            letterSpacing: `${letterSpacing}px`,
            color: "#FFFFFF",
            textShadow: `
              0 0 ${10 * glowPulse}px rgba(255, 255, 255, 0.95),
              0 0 ${24 * glowPulse}px rgba(255, 255, 255, 0.8),
              0 0 ${48 * glowPulse}px rgba(255, 255, 255, 0.45),
              0 0 ${80 * glowPulse}px rgba(255, 255, 255, 0.25),
              0 4px 16px rgba(0, 0, 0, 0.7),
              0 1px 3px rgba(0, 0, 0, 0.9)
            `,
            filter: "drop-shadow(0px 6px 18px rgba(0, 0, 0, 0.4))",
          }}
        >
          {formattedWord}
        </span>
      </div>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* Background Video */}
      <OffthreadVideo
        src={resolveMediaSource(videoSrc)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Floating White Glowing Monoline Captions */}
      {wordContent}
    </AbsoluteFill>
  );
};
