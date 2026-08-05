"use client";

import React, { useMemo } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import type { EditPlan, VideoClip, OverlayClip, ScriptVisualClip } from "@/lib/edit-plan";
import { RemotionCaptions } from "./Captions";

interface RemotionCompositionProps {
  plan: EditPlan;
}

export const RemotionComposition: React.FC<RemotionCompositionProps> = ({ plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const videoClips = useMemo(() => {
    return plan.clips.filter((c) => c.type === "video") as VideoClip[];
  }, [plan.clips]);

  const overlayClips = useMemo(() => {
    return plan.clips.filter((c) => c.type === "overlay") as OverlayClip[];
  }, [plan.clips]);

  const visualClips = useMemo(() => {
    return plan.clips.filter((c) => c.type === "script-visual") as ScriptVisualClip[];
  }, [plan.clips]);

  const activeVisual = useMemo(() => {
    return visualClips.find((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration);
  }, [visualClips, currentTime]);

  const activeOverlays = useMemo(() => {
    return overlayClips.filter((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration);
  }, [overlayClips, currentTime]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#090D16", overflow: "hidden", fontFamily: "sans-serif" }}>
      {/* Background Video Layers */}
      {videoClips.map((clip) => {
        const fromFrame = Math.round(clip.start * fps);
        const durationInFrames = Math.max(1, Math.round(clip.duration * fps));

        return (
          <Sequence key={clip.id} from={fromFrame} durationInFrames={durationInFrames}>
            {clip.src ? (
              <OffthreadVideo
                src={clip.src}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <AbsoluteFill
                style={{
                  background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #311042 100%)",
                }}
              />
            )}
          </Sequence>
        );
      })}

      {/* Script Visual Graphics / Motifs */}
      {activeVisual && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              padding: "20px 36px",
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              color: "#FFFFFF",
              textAlign: "center",
              transform: "scale(1.05)",
            }}
          >
            <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "#38BDF8", fontWeight: 700, marginBottom: "6px" }}>
              {activeVisual.scene.motif} motif
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#F8FAFC" }}>
              {activeVisual.scene.title}
            </div>
          </div>
        </div>
      )}

      {/* Overlays (Lower Thirds, Text Cards, Logos) */}
      {activeOverlays.map((overlay) => (
        <div
          key={overlay.id}
          style={{
            position: "absolute",
            left: `${(overlay.positionX ?? 0.5) * 100}%`,
            top: `${(overlay.positionY ?? 0.5) * 100}%`,
            transform: "translate(-50%, -50%)",
            opacity: overlay.opacity ?? 1,
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          {overlay.src ? (
            <img src={overlay.src} alt="Overlay" style={{ maxWidth: "200px", borderRadius: "12px" }} />
          ) : (
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(0,0,0,0.8)",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "18px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {overlay.text}
            </div>
          )}
        </div>
      ))}

      {/* Delegated Caption Layer */}
      <RemotionCaptions plan={plan} />
    </AbsoluteFill>
  );
};
