import React from "react";
import { Composition, type AnyZodObject, type CalculateMetadataFunction } from "remotion";
import { DEFAULT_CAPTION_SETTINGS } from "../../lib/caption-config";
import type { EditPlan } from "../../lib/edit-plan";
import { RemotionComposition } from "./Composition";
import { ViralChecklist, type ViralChecklistProps } from "./ViralChecklist";
import { FloatingGlowingCaptions, type FloatingGlowingCaptionsProps } from "./FloatingGlowingCaptions";
import editWordsData from "../../data/edit_words.json";
import jioWordsData from "../../data/jio_words.json";
import { InstagramReelComposition, type InstagramReelProps } from "./InstagramReelComposition";
import { JioCourseComposition, type JioCourseProps } from "./JioCourseComposition";

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
  words: editWordsData.words,
  positionYPercent: 82,
  letterSpacing: 1.5,
  textTransform: "uppercase",
};

const DEFAULT_INSTAGRAM_REEL_PROPS: InstagramReelProps = {
  videoSrc: "edit_source.mp4",
  words: editWordsData.words,
};

const DEFAULT_JIO_COURSE_PROPS: JioCourseProps = {
  videoSrc: "jio_source.mp4",
  visualSrc: "jiovisual_source.mp4",
  bannerSrc: "visuals/jio_intro_banner.png",
  words: jioWordsData.words,
};

import { AestheticEditorialReel, type AestheticReelProps } from "./AestheticEditorialReel";
import { DoodleExplainerReel } from "./DoodleExplainerReel";
import { EightBitTechReel } from "./eight-bit/EightBitTechReel";
import { EightBitV2Reel } from "./eight-bit-v2/EightBitV2Reel";
import { DEFAULT_8BIT_PROPS } from "./eight-bit/defaultProps";
import type { EightBitReelProps } from "../../types/eight-bit-reel";
import { VietnamPostcardsReel } from "./VietnamPostcardsReel";
import { VietnamPostcardsNoSplit } from "./VietnamPostcardsNoSplit";
import { VietnamPostcardsSplit } from "./VietnamPostcardsSplit";
import { GptAstraReel } from "./GptAstraReel";

const DEFAULT_AESTHETIC_REEL_PROPS: AestheticReelProps = {
  videoSrc: "edit_source.mp4",
  words: editWordsData.words,
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition<AnyZodObject, EightBitReelProps>
      id="EightBitV2Reel"
      component={EightBitV2Reel}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_8BIT_PROPS}
      calculateMetadata={({ props }) => {
        const total = (props.scenes || []).reduce((acc, s) => acc + s.durationInFrames, 0);
        return {
          durationInFrames: total || 830,
        };
      }}
    />
    <Composition<AnyZodObject, EightBitReelProps>
      id="EightBitTechReel"
      component={EightBitTechReel}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_8BIT_PROPS}
      calculateMetadata={({ props }) => {
        const total = (props.scenes || []).reduce((acc, s) => acc + s.durationInFrames, 0);
        return {
          durationInFrames: total || 830,
        };
      }}
    />
    <Composition
      id="DoodleExplainerReel"
      component={DoodleExplainerReel}
      durationInFrames={830} // 27.65s @ 30fps (snappy silence-trimmed)
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="VietnamPostcardsReel"
      component={VietnamPostcardsReel}
      durationInFrames={522} // 17.41s @ 30fps
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="VietnamPostcardsNoSplit"
      component={VietnamPostcardsNoSplit}
      durationInFrames={522} // 17.41s @ 30fps
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="GptAstraReel"
      component={GptAstraReel}
      durationInFrames={1461} // 48.72s @ 30fps
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="VietnamPostcardsSplit"
      component={VietnamPostcardsSplit}
      durationInFrames={522} // 17.41s @ 30fps
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition<AnyZodObject, AestheticReelProps>
      id="AestheticEditorialReel"
      component={AestheticEditorialReel}
      durationInFrames={1025} // 34.17s @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_AESTHETIC_REEL_PROPS}
    />
    <Composition<AnyZodObject, JioCourseProps>
      id="JioCourseReel"
      component={JioCourseComposition}
      durationInFrames={894} // 29.80s @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_JIO_COURSE_PROPS}
    />
    <Composition<AnyZodObject, InstagramReelProps>
      id="InstagramReel"
      component={InstagramReelComposition}
      durationInFrames={1024} // 34.13s @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_INSTAGRAM_REEL_PROPS}
    />
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
      durationInFrames={1053} // 35.1s @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_FLOATING_CAPTIONS_PROPS}
    />
  </>
);
