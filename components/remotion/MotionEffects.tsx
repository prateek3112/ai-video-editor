import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionPreset, VideoEffect } from "../../lib/caption-config";
import type { ScriptVisualClip, TransitionClip } from "../../lib/edit-plan";

export const VideoMotionWrapper: React.FC<{
  motionPreset: MotionPreset;
  activeScene?: ScriptVisualClip;
  children: React.ReactNode;
}> = ({ motionPreset, activeScene, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFrame = activeScene ? Math.max(0, frame - Math.round(activeScene.start * fps)) : frame;
  const sceneDuration = activeScene ? Math.max(1, Math.round(activeScene.duration * fps)) : fps * 5;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotate = 0;

  if (motionPreset === "punch-in") {
    const progress = spring({ frame: sceneFrame, fps, config: { damping: 14 } });
    scale = 1 + progress * 0.12;
  } else if (motionPreset === "drift") {
    translateX = interpolate(sceneFrame, [0, sceneDuration], [-2, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else if (motionPreset === "float") {
    scale = 1.02 + Math.sin(frame / fps * 2) * 0.02;
  } else if (motionPreset === "handheld") {
    translateX = Math.sin(frame * 0.65) * 3 + Math.sin(frame * 0.2) * 2;
    translateY = Math.cos(frame * 0.51) * 3 + Math.cos(frame * 0.3) * 2;
    rotate = Math.sin(frame * 0.4) * 0.5;
    scale = 1.05; // Slightly scaled to avoid edges showing
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}%, ${translateY}%) scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const ColorGradeFilter: React.FC<{
  videoEffect: VideoEffect;
  intensity?: number;
  children: React.ReactNode;
}> = ({ videoEffect, intensity = 0.65, children }) => {
  const i = Math.min(1, Math.max(0, intensity));
  let filter = "none";
  let vignette = false;

  if (videoEffect === "cinematic") {
    filter = `brightness(${1 - 0.05 * i}) contrast(${1 + 0.15 * i}) saturate(${1 - 0.15 * i})`;
    vignette = true;
  } else if (videoEffect === "vibrant") {
    filter = `brightness(${1 + 0.05 * i}) contrast(${1 + 0.05 * i}) saturate(${1 + 0.35 * i})`;
  } else if (videoEffect === "noir") {
    filter = `grayscale(${0.75 * i}) contrast(${1 + 0.2 * i}) brightness(${1 - 0.1 * i})`;
  } else if (videoEffect === "warm") {
    filter = `sepia(${0.15 * i}) brightness(${1 + 0.03 * i}) saturate(${1 + 0.12 * i})`;
  } else if (videoEffect === "cool") {
    filter = `hue-rotate(${10 * i}deg) brightness(${1 - 0.02 * i}) saturate(${1 - 0.08 * i})`;
  } else if (videoEffect === "sharpen") {
    filter = `contrast(${1 + 0.12 * i}) brightness(${1 + 0.02 * i})`;
  } else if (videoEffect === "vintage") {
    filter = `sepia(${0.25 * i}) contrast(${1 - 0.08 * i}) brightness(${1 - 0.05 * i}) saturate(${1 - 0.18 * i})`;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter, zIndex: 1 }}>{children}</AbsoluteFill>
      {vignette && i > 0 && (
        <AbsoluteFill
          style={{
            zIndex: 2,
            background: `radial-gradient(circle, transparent 50%, rgba(0,0,0,${0.4 * i}) 100%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const TransitionFlash: React.FC<{ transition: TransitionClip["transition"]; durationInFrames: number }> = ({ transition, durationInFrames }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (transition === "cut") return null;

  if (transition === "flash-white") {
    const opacity = Math.sin(progress * Math.PI);
    return <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none", background: "white", opacity }} />;
  }

  if (transition === "fade") {
    const opacity = interpolate(progress, [0, 1], [0, 1]);
    return <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none", background: "black", opacity }} />;
  }

  if (transition === "zoom-cut") {
    const scale = interpolate(progress, [0, 1], [1.5, 1.0]);
    // It's hard to apply transform to previous/next scenes from this overlay component.
    // As a transition overlay, we could just render a solid color or we can try to do something else.
    // The prompt says "Scale from 1.5 to 1.0 over ~8 frames" for the transition. If we just return a scaled div? No, that won't scale the video.
    // Wait, if it's a TransitionFlash component, it's rendered as an overlay in Composition.
    // Scaling the underlying video from an overlay is impossible.
    // Maybe we just don't scale the video but render a quick zoom effect overlay? Or we accept that we can't easily scale the video here and just return null or black.
    // Actually, Remotion can use backdrop-filter for blur and glitch!
    return (
      <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none", transform: `scale(${scale})`, backdropFilter: `brightness(${scale})` }} />
    );
  }

  if (transition === "blur-dissolve") {
    const blur = interpolate(progress, [0, 1], [20, 0]);
    return <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none", backdropFilter: `blur(${blur}px)` }} />;
  }

  if (transition === "glitch") {
    // We can simulate RGB offset using backdrop-filter drop-shadow or mixed overlays if we had the source, but backdrop-filter doesn't do channel offset easily.
    // Wait, CSS `backdrop-filter` doesn't support RGB split.
    // The prompt says "RGB channel offset (red shifted left, blue shifted right) for ~5 frames, then snap to normal".
    // We can render two slightly offset overlays if we had the video, but since this is an overlay, we might have to use some hack or just standard backdrop filters.
    // A simple hack: a semi-transparent red overlay shifted left and blue shifted right.
    const isGlitchActive = frame < 5;
    if (!isGlitchActive) return null;
    return (
      <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none", mixBlendMode: "difference", background: "rgba(255,0,0,0.1)", transform: "translateX(-10px)" }}>
        <AbsoluteFill style={{ background: "rgba(0,0,255,0.1)", transform: "translateX(20px)" }} />
      </AbsoluteFill>
    );
  }

  if (transition === "whip-pan") {
    const translateX = interpolate(progress, [0, 1], [-100, 0]);
    // Can't translate the underlying video, but we can translate a black solid to reveal it?
    // Actually a directional motion blur is better, but backdropFilter can't do directional blur.
    // We'll just swipe a solid color.
    return <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none", background: "#050505", transform: `translateX(${translateX}%)` }} />;
  }

  return null;
};
