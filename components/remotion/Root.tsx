import React from "react";
import { Composition, type AnyZodObject, type CalculateMetadataFunction } from "remotion";
import { DEFAULT_CAPTION_SETTINGS } from "../../lib/caption-config";
import type { EditPlan } from "../../lib/edit-plan";
import { RemotionComposition } from "./Composition";
import { ViralChecklist, type ViralChecklistProps } from "./ViralChecklist";
import { FloatingGlowingCaptions, type FloatingGlowingCaptionsProps } from "./FloatingGlowingCaptions";
import toeditWordsData from "../../data/toedit_words.json";

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

const DEFAULT_CHECKLIST_PROPS: ViralChecklistProps = {
  videoSrc: "edit_normalized.mp4",
  title: "20 Things To Tell Claude\nBefore Launching Your Site",
  badge: "⚡ PRE-LAUNCH CHECKLIST",
  items: [
    "privacy policy",
    "terms of service",
    "clear CTA button",
    "FAQ section",
    "robots.txt",
    "sitemap.xml",
    "custom 404 page",
    "image alt tags",
    "analytics tracking",
    "SEO meta titles",
    "meta descriptions",
    "Open Graph preview",
    "favicon & app icons",
    "canonical URLs",
    "cookie consent banner",
    "mobile responsiveness",
    "accessibility (a11y)",
    "test forms & emails",
    "fix broken links",
    "optimize speed & SEO",
  ],
  popStyle: "pop",
  voiceoverSrc: "voiceover.wav",
  musicSrc: "bg_music.wav",
  popSfxSrc: "pop_sfx.wav",
};

const calculateMetadata: CalculateMetadataFunction<{ plan: EditPlan }> = async ({ props }) => ({
  durationInFrames: Math.max(1, Math.ceil(props.plan.duration * props.plan.fps)),
  fps: props.plan.fps,
  width: props.plan.width,
  height: props.plan.height,
  defaultOutName: `${props.plan.projectId}-remotion.mp4`,
});

const DEFAULT_FLOATING_CAPTIONS_PROPS: FloatingGlowingCaptionsProps = {
  videoSrc: "toedit_source.mp4",
  words: toeditWordsData.words,
  positionYPercent: 82,
  letterSpacing: 1.5,
  textTransform: "uppercase",
};

export const RemotionRoot: React.FC = () => (
  <>
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
    <Composition<AnyZodObject, ViralChecklistProps>
      id="ViralChecklist"
      component={ViralChecklist}
      durationInFrames={382} // ~12.75s @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_CHECKLIST_PROPS}
    />
    <Composition<AnyZodObject, FloatingGlowingCaptionsProps>
      id="FloatingGlowingVideo"
      component={FloatingGlowingCaptions}
      durationInFrames={1134} // 37.8s @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_FLOATING_CAPTIONS_PROPS}
    />
  </>
);


