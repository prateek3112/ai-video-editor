"use client";

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Typography - Acumin Pro / Helvetica Neue / Inter stack
const { fontFamily: sansFont } = loadInter("normal", { weights: ["400", "700", "900"] });
const fontStack = `"Acumin Pro", "Helvetica Neue", Helvetica, ${sansFont}, -apple-system, sans-serif`;

// 5 Matching Pairs (Strict Mapping)
const PAIRS = [
  { id: 1, org: "vietnam/org1.JPEG", ed: "vietnam/ed1.PNG", title: "VinWonders Castle" },
  { id: 2, org: "vietnam/org2.JPEG", ed: "vietnam/ed2.PNG", title: "Ferris Wheel & Mountain" },
  { id: 3, org: "vietnam/org3.JPEG", ed: "vietnam/ed3.PNG", title: "Venice Canal & Gondola" },
  { id: 4, org: "vietnam/org4.JPEG", ed: "vietnam/ed4.PNG", title: "Sunset Town Clock Tower" },
  { id: 5, org: "vietnam/org5.JPEG", ed: "vietnam/ed5.PNG", title: "Harbor Skyline Lights" },
];

export const VietnamPostcardsSplit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // ----------------------------------------------------
  // SCENE 1: OPENING HOOK (0.0s – 3.25s / frames 0–97)
  // Split Screen: Top 52% postcards, Bottom 48% speaker!
  // First card appears immediately at frame 2!
  // ----------------------------------------------------
  const hookPostcards = [
    { ed: PAIRS[0].ed, frameStart: 2, rot: -7, x: -110, y: -20, zIndex: 10, scaleMax: 0.96 },
    { ed: PAIRS[1].ed, frameStart: 15, rot: 6, x: 100, y: -15, zIndex: 11, scaleMax: 0.96 },
    { ed: PAIRS[2].ed, frameStart: 28, rot: -4, x: -75, y: 25, zIndex: 12, scaleMax: 0.98 },
    { ed: PAIRS[3].ed, frameStart: 42, rot: 5, x: 85, y: 20, zIndex: 13, scaleMax: 0.98 },
    { ed: PAIRS[4].ed, frameStart: 58, rot: 0, x: 0, y: 0, zIndex: 20, isHero: true, scaleMax: 1.12 },
  ];

  // ----------------------------------------------------
  // SCENE 2 CLIFFHANGER (8.3s – 9.2s / frames 249–276)
  // ----------------------------------------------------
  const cliffhangerSpring = spring({
    frame: frame - 249,
    fps,
    config: { damping: 14, stiffness: 190 },
  });
  const speakerPunchZoom = interpolate(cliffhangerSpring, [0, 1], [1.02, 1.15]);

  // ----------------------------------------------------
  // SCENE 3: FIRST TRANSFORMATION (9.20s – 10.45s / frames 276–313)
  // Fast 3D flip at frame 301 (10.03s)
  // ----------------------------------------------------
  const flipProgress = spring({
    frame: frame - 301,
    fps,
    config: { damping: 12, stiffness: 190 },
  });
  const flipAngle = interpolate(flipProgress, [0, 1], [0, 180]);
  const isFlipped = flipAngle >= 90;

  // ----------------------------------------------------
  // SCENE 4: SECOND TRANSFORMATION (10.45s – 11.65s / frames 314–349)
  // Fast mask reveal at frame 333 (11.10s)
  // ----------------------------------------------------
  const wipeProgress = spring({
    frame: frame - 333,
    fps,
    config: { damping: 16, stiffness: 220 },
  });
  const wipeX = interpolate(wipeProgress, [0, 1], [0, 100]);

  // ----------------------------------------------------
  // SCENE 5: FINAL CTA & REWARD LOOP (11.65s – 17.41s)
  // ----------------------------------------------------
  const ctaFanSpring = spring({
    frame: frame - 435,
    fps,
    config: { damping: 14, stiffness: 150 },
  });
  const fanProgress = interpolate(ctaFanSpring, [0, 1], [0, 1]);

  const isSplitScene = currentTime < 3.25 || (currentTime >= 9.20 && currentTime < 11.65);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D0D", overflow: "hidden", fontFamily: fontStack }}>
      {/* Primary Voiceover Audio Track — 100% CLEAN VOICEOVER, ZERO SFX! */}
      <Audio src={staticFile("vietnam/speaker.mp4")} />

      {/* ============================================================ */}
      {/* SPEAKER VIDEO LAYER — VISIBLE AT ALL TIMES */}
      {/* ============================================================ */}
      {isSplitScene ? (
        /* SPLIT SCREEN MODE (Scenes 1, 3, 4): Speaker in Lower Portion */
        <div
          style={{
            position: "absolute",
            top: currentTime < 3.25 ? 960 : 1260, // Gives 65% of screen to photo during comparison!
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            background: "#0D0D0D",
            borderTop: "3px solid #262626",
            transition: "top 0.25s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: currentTime < 3.25 ? -480 : -520, // Focuses on face
              left: 0,
              width: 1080,
              height: 1920,
            }}
          >
            <OffthreadVideo
              src={staticFile("vietnam/speaker.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.1) 40%, rgba(13,13,13,0.6) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : (
        /* FULL SCREEN SPEAKER MODE (Scenes 2 & 5) */
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scale(${currentTime >= 8.3 && currentTime < 9.2 ? speakerPunchZoom : 1.02})`,
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <OffthreadVideo
              src={staticFile("vietnam/speaker.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.15) 45%, rgba(13,13,13,0.75) 100%)",
              pointerEvents: "none",
            }}
          />
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 1: TOP HALF STAGE (0.0s – 3.25s) */}
      {/* ============================================================ */}
      {currentTime < 3.25 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 960,
            background: "radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0D0D0D 100%)",
            overflow: "hidden",
          }}
        >
          {/* Headroom Title */}
          <div
            style={{
              position: "absolute",
              top: 50,
              width: "100%",
              textAlign: "center",
              padding: "0 30px",
              zIndex: 40,
            }}
          >
            {currentTime < 2.0 ? (
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  textTransform: "lowercase",
                  lineHeight: 1.15,
                }}
              >
                i tried this with my <br />
                <span style={{ color: "#FFE600" }}>vietnam photos…</span>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFE600",
                  textTransform: "lowercase",
                  textShadow: "0 4px 24px rgba(255,230,0,0.4)",
                }}
              >
                one ChatGPT prompt.
              </div>
            )}
          </div>

          {/* 5 Postcards popping in */}
          <div style={{ position: "relative", width: 760, height: 570, margin: "160px auto 0" }}>
            {hookPostcards.map((card, idx) => {
              const cardSpring = spring({
                frame: frame - card.frameStart,
                fps,
                config: { damping: 11, stiffness: 210 },
              });
              if (frame < card.frameStart) return null;

              const scale = interpolate(cardSpring, [0, 1], [0.35, card.scaleMax]);
              const opacity = interpolate(cardSpring, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });
              const rot = interpolate(cardSpring, [0, 1], [card.rot * 2, card.rot]);

              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 700,
                    height: 525, // 4:3 native ratio!
                    marginLeft: -350 + card.x,
                    marginTop: -262 + card.y,
                    transform: `scale(${scale}) rotate(${rot}deg)`,
                    opacity,
                    zIndex: card.zIndex,
                    borderRadius: 20,
                    overflow: "hidden",
                    border: card.isHero ? "6px solid #FFE600" : "5px solid #FFFFFF",
                    boxShadow: card.isHero
                      ? "0 32px 85px rgba(0, 0, 0, 0.85), 0 0 40px rgba(255,230,0,0.35)"
                      : "0 20px 50px rgba(0, 0, 0, 0.6)",
                    background: "#EAE6DF",
                  }}
                >
                  <Img
                    src={staticFile(card.ed)}
                    style={{ width: "100%", height: "100%", objectFit: "contain", background: "#EAE6DF" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 2: VIETNAM CONTEXT (3.25s – 9.20s) */}
      {/* ============================================================ */}
      {currentTime >= 3.25 && currentTime < 9.20 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Headroom Titles */}
          <div
            style={{
              position: "absolute",
              top: 140,
              width: "100%",
              textAlign: "center",
              padding: "0 30px",
              zIndex: 50,
            }}
          >
            {currentTime < 4.5 ? (
              <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-0.03em", color: "#FFFFFF", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
                5 photos.
              </div>
            ) : currentTime < 5.8 ? (
              <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: "-0.03em", color: "#FFE600", textTransform: "lowercase", textShadow: "0 4px 24px rgba(255,230,0,0.4)" }}>
                one prompt.
              </div>
            ) : currentTime < 7.1 ? (
              <div style={{ fontSize: 66, fontWeight: 900, letterSpacing: "-0.03em", color: "#FFFFFF", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
                zero design skills.
              </div>
            ) : currentTime < 8.3 ? (
              <div style={{ fontSize: 70, fontWeight: 900, letterSpacing: "-0.03em", color: "#FFFFFF", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
                made in <span style={{ color: "#FFE600" }}>ChatGPT.</span>
              </div>
            ) : (
              <div style={{ animation: "pulse 0.3s ease-out" }}>
                <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: "-0.03em", color: "#FFFFFF", textTransform: "lowercase", lineHeight: 1.12, textShadow: "0 4px 30px rgba(0,0,0,0.95)" }}>
                  but look what happened <br />
                  <span style={{ color: "#FFE600" }}>to this one…</span>
                </div>
              </div>
            )}
          </div>

          {/* Upper Negative Space Postcard */}
          {currentTime >= 3.25 && currentTime < 8.3 && (
            <div
              style={{
                position: "absolute",
                top: 240,
                width: 580,
                height: 435,
                borderRadius: 20,
                overflow: "hidden",
                border: "5px solid #FFFFFF",
                boxShadow: "0 24px 60px rgba(0,0,0,0.65)",
                background: "#EAE6DF",
                zIndex: 35,
              }}
            >
              {currentTime < 4.5 && (
                <Img src={staticFile(PAIRS[0].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {currentTime >= 4.5 && currentTime < 5.8 && (
                <Img src={staticFile(PAIRS[3].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {currentTime >= 5.8 && currentTime < 7.1 && (
                <Img src={staticFile(PAIRS[1].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {currentTime >= 7.1 && currentTime < 8.3 && (
                <Img src={staticFile(PAIRS[2].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 3: FIRST TRANSFORMATION (9.20s – 10.45s) */}
      {/* Top 65% Screen: Photo fills frame for inspection! */}
      {/* ============================================================ */}
      {currentTime >= 9.20 && currentTime < 10.45 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1260,
            background: "radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0D0D0D 100%)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Headroom Title */}
          <div style={{ marginTop: 40, zIndex: 40, textAlign: "center" }}>
            <div style={{ fontSize: 62, fontWeight: 900, letterSpacing: "-0.03em", color: isFlipped ? "#FFE600" : "#FFFFFF", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.95)" }}>
              {isFlipped ? "…became this." : "this photo…"}
            </div>
          </div>

          {/* Inspection Card: Takes whole top area! */}
          <div
            style={{
              marginTop: 25,
              width: isFlipped ? 980 : 740,
              height: isFlipped ? 735 : 986,
              perspective: 1400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 35,
              transition: "width 0.22s ease, height 0.22s ease",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                transform: `rotateY(${flipAngle}deg)`,
                boxShadow: "0 36px 90px rgba(0,0,0,0.8)",
                borderRadius: 22,
              }}
            >
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 22, overflow: "hidden", border: "7px solid #FFFFFF", background: "#0D0D0D" }}>
                <Img src={staticFile(PAIRS[0].org)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 22, overflow: "hidden", border: "7px solid #FFFFFF", background: "#EAE6DF" }}>
                <Img src={staticFile(PAIRS[0].ed)} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#EAE6DF" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 4: SECOND TRANSFORMATION (10.45s – 11.65s) */}
      {/* Top 65% Screen: Photo fills frame for inspection! */}
      {/* ============================================================ */}
      {currentTime >= 10.45 && currentTime < 11.65 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1260,
            background: "radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0D0D0D 100%)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Headroom Title */}
          <div style={{ marginTop: 40, zIndex: 40, textAlign: "center" }}>
            <div style={{ fontSize: 62, fontWeight: 900, letterSpacing: "-0.03em", color: wipeX > 50 ? "#FFE600" : "#FFFFFF", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.95)" }}>
              {wipeX > 50 ? "…became this." : "and this one…"}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: wipeX > 50 ? 980 : 740,
              height: wipeX > 50 ? 735 : 986,
              marginTop: 25,
              borderRadius: 22,
              overflow: "hidden",
              border: "7px solid #FFFFFF",
              boxShadow: "0 36px 90px rgba(0,0,0,0.8)",
              background: "#0D0D0D",
              zIndex: 35,
              transition: "width 0.2s ease, height 0.2s ease",
            }}
          >
            <Img src={staticFile(PAIRS[2].org)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, clipPath: `polygon(0 0, ${wipeX}% 0, ${wipeX}% 100%, 0 100%)`, background: "#EAE6DF" }}>
              <Img src={staticFile(PAIRS[2].ed)} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#EAE6DF" }} />
            </div>
            {wipeX > 0 && wipeX < 100 && (
              <div style={{ position: "absolute", left: `${wipeX}%`, top: 0, bottom: 0, width: 6, background: "#FFE600", boxShadow: "0 0 24px rgba(255,230,0,1)" }} />
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 5: REWARD CTA & POSTCARD LOOP (11.65s – 17.41s) */}
      {/* ============================================================ */}
      {currentTime >= 11.65 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Headroom Reward Hierarchy */}
          <div style={{ marginTop: 140, textAlign: "center", zIndex: 60, width: "100%", padding: "0 30px" }}>
            {currentTime < 13.5 ? (
              <div style={{ fontSize: 64, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
                want the exact prompt?
              </div>
            ) : currentTime < 15.6 ? (
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.15em", color: "#FFFFFF", opacity: 0.85, textTransform: "uppercase", marginBottom: 8 }}>
                  comment
                </div>
                <div style={{ fontSize: 88, fontWeight: 900, color: "#FFE600", letterSpacing: "-0.03em", textTransform: "uppercase", textShadow: "0 4px 35px rgba(255,230,0,0.5), 0 2px 10px rgba(0,0,0,0.9)" }}>
                  "POSTCARDS"
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 68, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", textTransform: "lowercase", textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
                I’ll send it 👀
              </div>
            )}
          </div>

          {/* 5 Postcards Fan Back Around Speaker for Closure */}
          {currentTime >= 14.5 && (
            <div
              style={{
                position: "absolute",
                top: 480,
                width: 900,
                height: 480,
                zIndex: 40,
                opacity: fanProgress,
                transform: `scale(${interpolate(fanProgress, [0, 1], [0.7, 1])})`,
              }}
            >
              <div style={{ position: "absolute", left: 10, top: 20, width: 340, height: 255, borderRadius: 14, overflow: "hidden", border: "4px solid #FFFFFF", transform: "rotate(-12deg)", boxShadow: "0 18px 45px rgba(0,0,0,0.7)" }}>
                <Img src={staticFile(PAIRS[0].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", right: 10, top: 20, width: 340, height: 255, borderRadius: 14, overflow: "hidden", border: "4px solid #FFFFFF", transform: "rotate(12deg)", boxShadow: "0 18px 45px rgba(0,0,0,0.7)" }}>
                <Img src={staticFile(PAIRS[1].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", left: 80, top: 180, width: 340, height: 255, borderRadius: 14, overflow: "hidden", border: "4px solid #FFFFFF", transform: "rotate(-6deg)", boxShadow: "0 18px 45px rgba(0,0,0,0.7)" }}>
                <Img src={staticFile(PAIRS[2].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", right: 80, top: 180, width: 340, height: 255, borderRadius: 14, overflow: "hidden", border: "4px solid #FFFFFF", transform: "rotate(6deg)", boxShadow: "0 18px 45px rgba(0,0,0,0.7)" }}>
                <Img src={staticFile(PAIRS[3].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* CAPTIONS: POSITIONED DYNAMICALLY IN MIDDLE/DIVIDER DURING SPLIT, */}
      {/* AND JUST BELOW FACE DURING FULL SCREEN! */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: isSplitScene
            ? currentTime < 3.25
              ? 920 // Exactly on the middle divider for Hook!
              : 1220 // Exactly on the divider for Transformations!
            : 1300, // Just below face on chest for full screen!
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 70,
          transition: "top 0.25s ease",
        }}
      >
        <div
          style={{
            maxWidth: 920,
            textAlign: "center",
            lineHeight: 1.15,
            textShadow: "0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.98)",
          }}
        >
          {/* Hook */}
          {currentTime >= 0.2 && currentTime < 0.7 && (
            <span style={{ fontSize: 62, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>AI SE</span>
          )}
          {currentTime >= 0.7 && currentTime < 1.4 && (
            <span style={{ fontSize: 44, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "lowercase" }}>apni</span>
          )}
          {currentTime >= 1.4 && currentTime < 2.1 && (
            <span style={{ fontSize: 60, fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase" }}>TRAVEL PHOTOS</span>
          )}
          {currentTime >= 2.1 && currentTime < 2.65 && (
            <span style={{ fontSize: 44, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "lowercase" }}>aise</span>
          )}
          {currentTime >= 2.65 && currentTime < 3.25 && (
            <span style={{ fontSize: 66, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>POSTCARDS</span>
          )}

          {/* Context */}
          {currentTime >= 3.25 && currentTime < 4.0 && (
            <span style={{ fontSize: 44, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "lowercase" }}>maine apni</span>
          )}
          {currentTime >= 4.0 && currentTime < 5.0 && (
            <span style={{ fontSize: 64, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>VIETNAM TRIP KI</span>
          )}
          {currentTime >= 5.0 && currentTime < 6.2 && (
            <span style={{ fontSize: 46, fontWeight: 700, color: "#FFFFFF", textTransform: "lowercase" }}>favourite photos ko</span>
          )}
          {currentTime >= 6.2 && currentTime < 7.2 && (
            <span style={{ fontSize: 62, fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase" }}>CHATGPT KE</span>
          )}
          {currentTime >= 7.2 && currentTime < 8.2 && (
            <span style={{ fontSize: 66, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>1 PROMPT SE</span>
          )}
          {currentTime >= 8.2 && currentTime < 9.2 && (
            <span style={{ fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "lowercase" }}>postcards mein convert!</span>
          )}

          {/* Transform 1 */}
          {currentTime >= 9.20 && currentTime < 10.05 && (
            <span style={{ fontSize: 58, fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase" }}>THIS PHOTO…</span>
          )}
          {currentTime >= 10.05 && currentTime < 10.45 && (
            <span style={{ fontSize: 68, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>…BECAME THAT!</span>
          )}

          {/* Transform 2 */}
          {currentTime >= 10.45 && currentTime < 11.15 && (
            <span style={{ fontSize: 58, fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase" }}>AND THIS PHOTO…</span>
          )}
          {currentTime >= 11.15 && currentTime < 11.65 && (
            <span style={{ fontSize: 68, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>…BECAME THAT!</span>
          )}

          {/* CTA */}
          {currentTime >= 11.65 && currentTime < 13.0 && (
            <span style={{ fontSize: 46, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "lowercase" }}>travel photos ko bhi</span>
          )}
          {currentTime >= 13.0 && currentTime < 14.5 && (
            <span style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF", textTransform: "lowercase" }}>convert karna hai?</span>
          )}
          {currentTime >= 14.5 && currentTime < 16.0 && (
            <span style={{ fontSize: 72, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>COMMENT "POSTCARDS"</span>
          )}
          {currentTime >= 16.0 && currentTime < 17.4 && (
            <span style={{ fontSize: 50, fontWeight: 700, color: "#FFFFFF", textTransform: "lowercase" }}>aur main prompt bhej dunga</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
