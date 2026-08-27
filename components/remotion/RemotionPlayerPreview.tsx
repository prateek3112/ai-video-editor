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
        acknowledgeRemotionLicense
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
        showVolumeControls={false}
        errorFallback={({ error }: { error: Error }) => (
          <div className="flex items-center justify-center w-full h-full bg-slate-950 text-white/60 text-sm p-8 text-center">
            <div>
              <div className="text-red-400 font-medium mb-2">Media Error</div>
              <div className="text-xs text-white/40">{error.message}</div>
            </div>
          </div>
        )}
      />
    </div>
  );
};
