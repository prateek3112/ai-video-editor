"use client";

import React from "react";
import { Player } from "@remotion/player";
import { RemotionComposition } from "./Composition";
import type { EditPlan } from "@/lib/edit-plan";

interface RemotionPlayerPreviewProps {
  plan: EditPlan;
  className?: string;
}

export const RemotionPlayerPreview: React.FC<RemotionPlayerPreviewProps> = ({ plan, className = "" }) => {
  const durationInFrames = Math.max(1, Math.round(plan.duration * plan.fps));
  const width = plan.width || 1080;
  const height = plan.height || 1920;

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ${className}`}>
      <Player
        component={RemotionComposition}
        inputProps={{ plan }}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={plan.fps}
        controls
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
        showVolumeControl={false}
      />
    </div>
  );
};
