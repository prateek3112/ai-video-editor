"use client";

import React, { useMemo } from "react";
import { Gif } from "@remotion/gif";
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
import type {
  AudioClip,
  EditPlan,
  OverlayClip,
  ScriptVisualClip,
  TransitionClip,
  VideoClip,
} from "../../lib/edit-plan";
import type { ScriptVisualScene } from "../../lib/script-visuals";
import { RemotionCaptions } from "./Captions";
import { VideoMotionWrapper, ColorGradeFilter, TransitionFlash } from "./MotionEffects";

interface RemotionCompositionProps {
  plan: EditPlan;
}

function mediaSource(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

const MotifGraphic: React.FC<{ scene: ScriptVisualScene }> = ({ scene }) => {
  if (scene.motif === "growth") {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 210 }}>
        {[0.34, 0.53, 0.74, 1].map((height, index) => (
          <div
            key={height}
            style={{
              width: 54,
              height: `${height * 100}%`,
              borderRadius: 16,
              background: index % 2 ? scene.palette.accent : scene.palette.secondary,
              boxShadow: index === 3 ? `0 0 42px ${scene.palette.accent}66` : undefined,
            }}
          />
        ))}
      </div>
    );
  }

  if (scene.motif === "money") {
    return (
      <div style={{ fontSize: 154, fontWeight: 950, lineHeight: 0.9, color: scene.palette.accent, letterSpacing: -10 }}>
        $<span style={{ color: "white" }}>10</span>K
      </div>
    );
  }

  if (scene.motif === "warning") {
    return (
      <div
        style={{
          width: 220,
          height: 190,
          clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
          background: scene.palette.accent,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 24,
          color: scene.palette.background,
          fontSize: 92,
          fontWeight: 950,
        }}
      >
        !
      </div>
    );
  }

  if (scene.motif === "tech") {
    return (
      <div style={{ position: "relative", width: 260, height: 220 }}>
        {[{ x: 0, y: 70 }, { x: 170, y: 0 }, { x: 170, y: 145 }].map((point, index) => (
          <div
            key={`${point.x}-${point.y}`}
            style={{
              position: "absolute",
              left: point.x,
              top: point.y,
              width: 92,
              height: 72,
              borderRadius: 18,
              background: index ? scene.palette.secondary : scene.palette.accent,
              boxShadow: `0 14px 38px ${scene.palette.accent}30`,
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 82, top: 70, width: 100, height: 8, background: "white", transform: "rotate(-22deg)" }} />
        <div style={{ position: "absolute", left: 82, top: 130, width: 100, height: 8, background: "white", transform: "rotate(24deg)" }} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: 240, height: 240 }}>
      <div style={{ position: "absolute", inset: 18, borderRadius: "50%", border: `28px solid ${scene.palette.accent}`, borderRightColor: "transparent" }} />
      <div style={{ position: "absolute", inset: 72, borderRadius: "50%", background: scene.palette.secondary }} />
    </div>
  );
};

const VisualScene: React.FC<{ scene: ScriptVisualScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (scene.layout === "speaker") return null;

  const entrance = spring({ frame, fps, config: { damping: 18, stiffness: 170 }, durationInFrames: Math.round(0.55 * fps) });
  const exitOpacity = interpolate(frame, [0, 0.16 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const isOverlay = scene.layout === "overlay";
  const isSplit = scene.layout === "split";
  const isFull = scene.layout === "full-visual";
  
  const panelStyle: React.CSSProperties = isOverlay
    ? { position: "absolute", left: "7%", right: "7%", top: "7%", height: "36%", borderRadius: 34 }
    : isSplit
      ? { position: "absolute", inset: "50% 0 0 0" }
      : { position: "absolute", inset: 0 };
  const titleSize = isOverlay ? 64 : isSplit ? 68 : 104;

  return (
    <div
      style={{
        ...panelStyle,
        overflow: "hidden",
        color: "white",
        background: `radial-gradient(circle at 82% 18%, ${scene.palette.accent}38, transparent 30%), linear-gradient(145deg, ${scene.palette.background}, #050505)`,
        border: isOverlay ? "2px solid rgba(255,255,255,0.18)" : undefined,
        boxShadow: isOverlay ? "0 28px 90px rgba(0,0,0,0.55)" : undefined,
        opacity: exitOpacity,
        zIndex: isOverlay ? 50 : 10,
      }}
    >
      {scene.mediaUrl && scene.mediaType === "gif" ? (
        <Gif
          src={mediaSource(scene.mediaUrl)}
          width={width}
          height={height}
          fit="cover"
          loopBehavior="loop"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.72 }}
        />
      ) : scene.mediaUrl && scene.mediaType === "video" ? (
        <OffthreadVideo
          src={mediaSource(scene.mediaUrl)}
          muted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }}
        />
      ) : scene.mediaUrl && scene.mediaType === "image" ? (
        <Img
          src={mediaSource(scene.mediaUrl)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }}
        />
      ) : null}
      {scene.mediaUrl ? <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.2))" }} /> : null}
      <div style={{ position: "absolute", inset: isOverlay ? 22 : 42, border: `2px solid ${scene.palette.accent}55`, borderRadius: isOverlay ? 22 : 30 }} />
      <div
        style={{
          position: "absolute",
          inset: isOverlay ? "36px 42px" : isSplit ? "58px 68px" : "112px 86px",
          display: "flex",
          flexDirection: isOverlay || isSplit ? "row" : "column",
          alignItems: isOverlay || isSplit ? "center" : "flex-start",
          justifyContent: "space-between",
          gap: 34,
          transform: `translateY(${(1 - entrance) * 50}px) scale(${0.94 + entrance * 0.06})`,
        }}
      >
        <div style={{ maxWidth: isOverlay || isSplit ? "64%" : "88%" }}>
          <div style={{ color: scene.palette.accent, fontWeight: 900, fontSize: isOverlay ? 22 : 28, letterSpacing: 4, marginBottom: 14 }}>
            {scene.eyebrow}
          </div>
          <div style={{ fontSize: titleSize, lineHeight: 0.92, letterSpacing: -3, fontWeight: 950, textTransform: "uppercase" }}>
            {scene.title}
          </div>
          {!isOverlay && <div style={{ marginTop: 24, maxWidth: 700, color: "rgba(255,255,255,0.72)", fontSize: 34, lineHeight: 1.18, fontWeight: 650 }}>{scene.subtitle}</div>}
          {scene.callout && (
            <div style={{ display: "inline-block", marginTop: 28, padding: "12px 20px", transform: "rotate(-2deg)", background: "white", color: "black", fontWeight: 950, fontSize: 30 }}>
              {scene.callout}
            </div>
          )}
        </div>
        <div style={{ transform: `rotate(${(1 - entrance) * 8}deg) scale(${0.8 + entrance * 0.2})` }}>
          <MotifGraphic scene={scene} />
        </div>
      </div>
      {scene.mediaCredit ? (
        <div style={{ position: "absolute", right: 22, bottom: 16, color: "rgba(255,255,255,.62)", fontSize: 16, fontWeight: 650 }}>
          {scene.mediaCredit}
        </div>
      ) : null}
    </div>
  );
};

export const RemotionComposition: React.FC<RemotionCompositionProps> = ({ plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const videoClips = useMemo(() => plan.clips.filter((clip) => clip.type === "video") as VideoClip[], [plan.clips]);
  const overlayClips = useMemo(() => plan.clips.filter((clip) => clip.type === "overlay") as OverlayClip[], [plan.clips]);
  const visualClips = useMemo(() => plan.clips.filter((clip) => clip.type === "script-visual") as ScriptVisualClip[], [plan.clips]);
  const sfxClips = useMemo(() => plan.clips.filter((clip) => clip.type === "sfx") as AudioClip[], [plan.clips]);
  const transitionClips = useMemo(() => plan.clips.filter((clip) => clip.type === "transition") as TransitionClip[], [plan.clips]);
  const activeVisual = visualClips.find((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration);
  const activeLayout = activeVisual?.scene.layout ?? "speaker";

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <ColorGradeFilter videoEffect={plan.settings.videoEffect} intensity={plan.settings.effectIntensity}>
        {videoClips.map((clip) => {
          const fromFrame = Math.round(clip.start * fps);
          const durationInFrames = Math.max(1, Math.round(clip.duration * fps));
          const isSplit = activeLayout === "split";
          const isFullVisual = activeLayout === "full-visual";

          return (
            <Sequence key={clip.id} from={fromFrame} durationInFrames={durationInFrames} premountFor={fps}>
              {clip.src ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    width: "100%",
                    height: isSplit ? "50%" : "100%",
                    opacity: isFullVisual ? 0 : 1,
                    overflow: "hidden",
                  }}
                >
                  <VideoMotionWrapper motionPreset={plan.settings.motionPreset} activeScene={activeVisual}>
                    <OffthreadVideo
                      src={mediaSource(clip.src)}
                      volume={clip.volume ?? 1}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </VideoMotionWrapper>
                </div>
              ) : (
                <AbsoluteFill style={{ background: "linear-gradient(135deg, #090B10, #171D2A)" }} />
              )}
            </Sequence>
          );
        })}

        {visualClips.map((clip) => (
          <Sequence
            key={clip.id}
            from={Math.round(clip.start * fps)}
            durationInFrames={Math.max(1, Math.round(clip.duration * fps))}
            premountFor={fps}
          >
            <VisualScene scene={clip.scene} />
          </Sequence>
        ))}

        {overlayClips
          .filter((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration)
          .map((overlay) => (
            <div
              key={overlay.id}
              style={{
                position: "absolute",
                left: `${(overlay.positionX ?? 0.5) * 100}%`,
                top: `${(overlay.positionY ?? 0.5) * 100}%`,
                transform: `translate(-50%, -50%) scale(${overlay.scale ?? 1})`,
                opacity: overlay.opacity ?? 1,
                zIndex: 30,
              }}
            >
              {overlay.src ? (
                <Img src={mediaSource(overlay.src)} style={{ maxWidth: 560, maxHeight: 760, borderRadius: 24, objectFit: "contain" }} />
              ) : (
                <div style={{ padding: "16px 26px", background: "white", color: "black", fontWeight: 950, fontSize: 34, transform: "rotate(-2deg)" }}>
                  {overlay.text}
                </div>
              )}
            </div>
          ))}

        {transitionClips.map((clip) => (
          <Sequence key={clip.id} from={Math.round(clip.start * fps)} durationInFrames={Math.max(1, Math.round(clip.duration * fps))} premountFor={Math.round(fps * 0.2)}>
            <TransitionFlash transition={clip.transition} durationInFrames={Math.max(1, Math.round(clip.duration * fps))} />
          </Sequence>
        ))}

        {sfxClips.map((clip) => (
          <Sequence key={clip.id} from={Math.round(clip.start * fps)} durationInFrames={Math.max(1, Math.round(clip.duration * fps))} premountFor={fps}>
            <Audio src={mediaSource(clip.src)} volume={clip.volume} />
          </Sequence>
        ))}

        <RemotionCaptions plan={plan} />
      </ColorGradeFilter>
    </AbsoluteFill>
  );
};
