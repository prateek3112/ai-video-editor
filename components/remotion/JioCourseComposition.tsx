"use client";

import React, { useMemo } from "react";
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
import jioWordsData from "../../data/jio_words.json";

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export type JioCourseProps = {
  videoSrc?: string;
  visualSrc?: string;
  bannerSrc?: string;
  certSrc?: string;
  words?: CaptionWord[];
};

function resolveMediaSource(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/api/")) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

type SceneMode = "split-screen" | "speaker-full";

export const JioCourseComposition: React.FC<JioCourseProps> = ({
  videoSrc = "jio_source.mp4",
  visualSrc = "jiovisual_source.mp4",
  bannerSrc = "visuals/jio_intro_banner.png",
  certSrc = "visuals/jio_certificate_card.png",
  words = jioWordsData.words,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  // Process word segments for smooth, seamless transitions
  const processedWords = useMemo(() => {
    return words.map((w, index) => {
      const next = words[index + 1];
      const naturalGap = next ? next.start - w.end : 0;
      const effectiveEnd = naturalGap > 0 && naturalGap < 0.16 ? next.start : w.end + 0.05;
      return {
        ...w,
        effectiveStart: w.start,
        effectiveEnd,
      };
    });
  }, [words]);

  // Current active word
  const activeWord = useMemo(() => {
    return processedWords.find(
      (w) => currentTime >= w.effectiveStart && currentTime < w.effectiveEnd
    );
  }, [processedWords, currentTime]);

  // --- Dynamic Visual Scenes ---
  // 1. 0.0s - 6.4s: Intro Hook with user attached banner graphic (960x540 16:9 uncropped)
  // 2. 6.4s - 19.8s: Screen recording of Jio AI classroom portal @ 0.8x (Curriculum & AI tools)
  // 3. 19.8s - 22.0s: Official Certificate Visual Card ("Certificate bhi milega")
  // 4. 22.0s - 24.45s: Full Screen Speaker Close-Up ("100% Free")
  // 5. 24.45s - 27.65s: Screen recording of registration step & form ("Bas is link par jao, register karo")
  // 6. 27.65s - 29.80s: Full Screen Speaker Close-Up CTA ("Comment LINK")

  let sceneMode: SceneMode = "split-screen";
  let topVisualElement: React.ReactNode = null;

  if (currentTime < 6.4) {
    // 1. INTRO BANNER GRAPHIC (100% uncropped)
    sceneMode = "split-screen";
    topVisualElement = (
      <div
        style={{
          width: "960px",
          height: "540px",
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)",
          border: "3px solid rgba(255, 255, 255, 0.95)",
          position: "relative",
        }}
      >
        <Img
          src={resolveMediaSource(bannerSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#FFFFFF",
          }}
        />
      </div>
    );
  } else if (currentTime >= 6.4 && currentTime < 19.8) {
    // 2. JIOVISUAL PORTAL (Played at 0.8x speed)
    sceneMode = "split-screen";
    topVisualElement = (
      <div
        style={{
          width: "960px",
          height: "540px",
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "#000000",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "3px solid rgba(255, 255, 255, 0.95)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser Top Navigation Bar */}
        <div
          style={{
            height: "38px",
            background: "#F3F4F6",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: "7px" }}>
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FF5F56" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FFBD2E" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#27C93F" }} />
          </div>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "3px 18px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🔒</span>
            <span>jio.com/ai-classroom</span>
          </div>
          <div style={{ width: "40px" }} />
        </div>

        {/* Screen Recording Video Frame @ 0.8x */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#FFFFFF" }}>
          <OffthreadVideo
            src={resolveMediaSource(visualSrc)}
            playbackRate={0.8}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    );
  } else if (currentTime >= 19.8 && currentTime < 22.0) {
    // 3. OFFICIAL CERTIFICATE VISUAL CARD ("Certificate bhi milega")
    sceneMode = "split-screen";
    const certFrame = Math.max(0, frame - Math.round(19.8 * fps));
    const certSpring = spring({ frame: certFrame, fps, config: { damping: 14, stiffness: 200 } });

    topVisualElement = (
      <div
        style={{
          width: "960px",
          height: "540px",
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "#FAF7F2",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "3px solid rgba(255, 255, 255, 0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${certSpring})`,
          position: "relative",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "24px",
            zIndex: 10,
            background: "linear-gradient(135deg, #FF6B00, #FF3B30)",
            color: "#FFFFFF",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 6px 16px rgba(255, 107, 0, 0.35)",
          }}
        >
          <span>🎓</span>
          <span>OFFICIAL JIO INSTITUTE CERTIFICATION</span>
        </div>
        <div
          style={{
            width: "820px",
            height: "420px",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
            border: "2px solid #E5E7EB",
            marginTop: "30px",
            background: "#FFF",
          }}
        >
          <Img
            src={resolveMediaSource(certSrc)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    );
  } else if (currentTime >= 22.0 && currentTime < 24.45) {
    // 4. FULL SCREEN SPEAKER ("Yeh course completely free hai")
    sceneMode = "speaker-full";
  } else if (currentTime >= 24.45 && currentTime < 27.65) {
    // 5. REGISTRATION PORTAL & FORM ("Bas is link par jao, register karo")
    sceneMode = "split-screen";
    topVisualElement = (
      <div
        style={{
          width: "960px",
          height: "540px",
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "#000000",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "3px solid rgba(255, 255, 255, 0.95)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser Top Navigation Bar */}
        <div
          style={{
            height: "38px",
            background: "#F3F4F6",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: "7px" }}>
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FF5F56" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FFBD2E" }} />
            <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#27C93F" }} />
          </div>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "3px 18px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🔒</span>
            <span>jio.com/ai-classroom/register</span>
          </div>
          <div style={{ width: "40px" }} />
        </div>

        {/* Video Frame cued at registration step in jiovisual.mov (at 18s / frame 540) */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#FFFFFF" }}>
          <OffthreadVideo
            src={resolveMediaSource(visualSrc)}
            startFrom={Math.round(18 * 60)} // start at registration form
            playbackRate={0.8}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    );
  } else {
    // 6. FULL SCREEN SPEAKER CTA ("Comment LINK")
    sceneMode = "speaker-full";
  }

  // --- Single Pure White Captions with Helvetica / SF Pro Typography ---
  let captionElement: React.ReactNode = null;
  if (activeWord) {
    const startFrame = Math.round(activeWord.effectiveStart * fps);
    const wordRelFrame = Math.max(0, frame - startFrame);

    const enterSpring = spring({
      frame: wordRelFrame,
      fps,
      config: {
        damping: 16,
        mass: 0.3,
        stiffness: 190,
      },
    });

    const floatY = interpolate(enterSpring, [0, 1], [8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const scale = interpolate(enterSpring, [0, 1], [0.95, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const opacity = interpolate(wordRelFrame, [0, 1.2], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const captionTop = sceneMode === "split-screen" ? "50%" : "74%";

    captionElement = (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: captionTop,
          transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${scale})`,
          opacity,
          zIndex: 120,
          pointerEvents: "none",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily:
              '"Helvetica Neue", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 900,
            fontSize: sceneMode === "split-screen" ? "84px" : "90px",
            lineHeight: 1,
            letterSpacing: "1.8px",
            color: "#FFFFFF",
            textTransform: "uppercase",
            textShadow:
              "0 4px 18px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.9), 0 0 28px rgba(0, 0, 0, 0.85)",
            filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.95))",
          }}
        >
          {activeWord.word}
        </span>
      </div>
    );
  }

  // --- CTA Overlay on Final Scene (27.65s - 29.80s) ---
  const renderSceneCTA = () => {
    if (currentTime < 27.65) return null;
    const relFrame = Math.max(0, frame - Math.round(27.65 * fps));
    const enter = spring({ frame: relFrame, fps, config: { damping: 12, stiffness: 170 } });
    const pulse = 1 + Math.sin(relFrame * 0.2) * 0.04;

    return (
      <div
        style={{
          position: "absolute",
          top: "380px",
          left: "50%",
          transform: `translateX(-50%) scale(${enter * pulse})`,
          zIndex: 110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          width: "600px",
        }}
      >
        <div
          style={{
            padding: "22px 42px",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #0A58CA, #0D6EFD)",
            color: "#FFFFFF",
            fontWeight: 950,
            fontSize: "36px",
            letterSpacing: "1.5px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 20px 60px rgba(13, 110, 253, 0.7), 0 0 40px rgba(10, 88, 202, 0.5)",
          }}
        >
          <span>💬</span>
          <span>COMMENT "LINK"</span>
        </div>
        <div
          style={{
            padding: "10px 24px",
            borderRadius: "999px",
            background: "rgba(18, 20, 28, 0.94)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#FFF",
            fontWeight: 700,
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          ✨ I will DM you the direct course link!
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", overflow: "hidden" }}>

      {/* ========================================================================= */}
      {/* 0. CONTINUOUS MASTER DIALOGUE AUDIO TRACK (Uninterrupted 48kHz)            */}
      {/* ========================================================================= */}
      <Audio src={resolveMediaSource("jio_master_audio.wav")} volume={1.0} />

      {/* ========================================================================= */}
      {/* 1. SIGNATURE SPLIT SCREEN MODE                                            */}
      {/* ========================================================================= */}
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

          {/* TOP SECTION: Dynamic Visual Container */}
          <div
            style={{
              position: "absolute",
              top: "50px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {topVisualElement}
          </div>

          {/* BOTTOM SECTION: Speaker Framed in Arched Rounded Card */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "32px",
              right: "32px",
              height: "870px",
              borderRadius: "56px 56px 0 0",
              overflow: "hidden",
              boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.08), 0 -2px 10px rgba(0, 0, 0, 0.03)",
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
                top: "-550px",
                left: 0,
                width: "100%",
                height: "1920px",
                objectFit: "cover",
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================================= */}
      {/* 2. FULL SCREEN SPEAKER MODE (Hook & CTA)                                   */}
      {/* ========================================================================= */}
      {sceneMode === "speaker-full" && (
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
                "radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.5) 100%)",
              zIndex: 40,
            }}
          />
        </AbsoluteFill>
      )}

      {/* CTA Overlay */}
      {renderSceneCTA()}

      {/* Single Pure White Captions */}
      {captionElement}

      {/* ========================================================================= */}
      {/* 3. CLEAN SFX TRACK (Camera Focus, Clicks, Risers, and Zoom Whooshes ONLY) */}
      {/* ========================================================================= */}
      <Sequence from={2} durationInFrames={8}>
        <Audio src={resolveMediaSource("sfx/camera-shutter.wav")} volume={0.14} />
      </Sequence>
      <Sequence from={60} durationInFrames={10}>
        <Audio src={resolveMediaSource("sfx/whoosh.wav")} volume={0.14} />
      </Sequence>
      <Sequence from={190} durationInFrames={6}>
        <Audio src={resolveMediaSource("sfx/click.wav")} volume={0.18} />
      </Sequence>
      <Sequence from={300} durationInFrames={8}>
        <Audio src={resolveMediaSource("sfx/camera-shutter.wav")} volume={0.16} />
      </Sequence>
      <Sequence from={500} durationInFrames={28}>
        <Audio src={resolveMediaSource("sfx/riser.wav")} volume={0.12} />
      </Sequence>
      <Sequence from={600} durationInFrames={8}>
        <Audio src={resolveMediaSource("sfx/camera-shutter.wav")} volume={0.18} />
      </Sequence>
      <Sequence from={650} durationInFrames={8}>
        <Audio src={resolveMediaSource("sfx/click.wav")} volume={0.20} />
      </Sequence>
      <Sequence from={735} durationInFrames={10}>
        <Audio src={resolveMediaSource("sfx/whoosh.wav")} volume={0.14} />
      </Sequence>
      <Sequence from={830} durationInFrames={8}>
        <Audio src={resolveMediaSource("sfx/click.wav")} volume={0.22} />
      </Sequence>
    </AbsoluteFill>
  );
};
