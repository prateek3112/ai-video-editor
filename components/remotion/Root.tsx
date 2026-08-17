import React from "react";
import { Composition, type AnyZodObject, type CalculateMetadataFunction } from "remotion";
import { DEFAULT_CAPTION_SETTINGS } from "../../lib/caption-config";
import type { EditPlan } from "../../lib/edit-plan";
import { RemotionComposition } from "./Composition";

const EMPTY_PLAN: EditPlan = {
  version: 1,
  projectId: "preview",
  duration: 1,
  fps: 30,
  width: 1080,
  height: 1920,
  quality: "1080p",
  settings: DEFAULT_CAPTION_SETTINGS,
  tracks: [],
  clips: [],
  notes: [],
  createdAt: "1970-01-01T00:00:00.000Z",
  updatedAt: "1970-01-01T00:00:00.000Z",
};

const calculateMetadata: CalculateMetadataFunction<{ plan: EditPlan }> = async ({ props }) => ({
  durationInFrames: Math.max(1, Math.ceil(props.plan.duration * props.plan.fps)),
  fps: props.plan.fps,
  width: props.plan.width,
  height: props.plan.height,
  defaultOutName: `${props.plan.projectId}-remotion.mp4`,
});

export const RemotionRoot: React.FC = () => (
  <Composition<AnyZodObject, { plan: EditPlan }>
    id="RemotionComposition"
    component={RemotionComposition}
    durationInFrames={30}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ plan: EMPTY_PLAN }}
    calculateMetadata={calculateMetadata}
  />
);
