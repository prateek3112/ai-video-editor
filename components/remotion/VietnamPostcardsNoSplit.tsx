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

export const VietnamPostcardsNoSplit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // ----------------------------------------------------
  // SCENE 1: OPENING HOOK (0.0s – 3.25s / frames 0–97)
  // Aggressive: First card appears immediately at frame 2!
  // Escalates to BIG HERO CARD at frame 60!
  // ----------------------------------------------------
  const hookPostcards = [
    { ed: PAIRS[0].ed, frameStart: 2, rot: -8, x: -140, y: -40, zIndex: 10, scaleMax: 0.95 },
    { ed: PAIRS[1].ed, frameStart: 15, rot: 7, x: 130, y: -30, zIndex: 11, scaleMax: 0.95 },
    { ed: PAIRS[2].ed, frameStart: 28, rot: -4, x: -90, y: 35, zIndex: 12, scaleMax: 0.96 },
    { ed: PAIRS[3].ed, frameStart: 42, rot: 6, x: 100, y: 30, zIndex: 13, scaleMax: 0.96 },
    { ed: PAIRS[4].ed, frameStart: 58, rot: 0, x: 0, y: 0, zIndex: 20, isHero: true, scaleMax: 1.16 },
  ];

  // Postcard exit spring at frame 92 (3.06s) -> cards push out
  const hookExitSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const hookExitScale = interpolate(hookExitSpring, [0, 1], [1, 0.4]);
  const hookExitOpacity = interpolate(hookExitSpring, [0, 0.6], [1, 0], { extrapolateRight: "clamp" });

  // ----------------------------------------------------
  // SCENE 2 CLIFFHANGER (8.0s – 8.90s / frames 240–267)
  // Cards zoom out and fly away, camera punches in on speaker
  // ----------------------------------------------------
  const cliffhangerSpring = spring({
    frame: frame - 240,
    fps,
    config: { damping: 14, stiffness: 190 },
  });
  const speakerPunchZoom = interpolate(cliffhangerSpring, [0, 1], [1.02, 1.15]);

  // ----------------------------------------------------
  // SCENE 3: FIRST TRANSFORMATION (8.90s – 10.80s / frames 267–324)
  // Photo takes ALMOST ENTIRE FRAME so audience can inspect detail!
  // Fast 3D flip triggers at frame 285 (9.50s) on "ye bani yeh"
  // ED1 HOLDS COMFORTABLY for 1.1+ seconds!
  // ----------------------------------------------------
  const flipProgress = spring({
    frame: frame - 285,
    fps,
    config: { damping: 12, stiffness: 190 }, // Snappy flip!
  });
  const flipAngle = interpolate(flipProgress, [0, 1], [0, 180]);
  const isFlipped = flipAngle >= 90;

  // ----------------------------------------------------
  // SCENE 4: SECOND TRANSFORMATION (10.80s – 12.10s / frames 324–363)
  // Fast mask reveal at frame 336 (11.20s)
  // ----------------------------------------------------
  const wipeProgress = spring({
    frame: frame - 336,
    fps,
    config: { damping: 16, stiffness: 220 },
  });
  const wipeX = interpolate(wipeProgress, [0, 1], [0, 100]);

  // ----------------------------------------------------
  // SCENE 5: FINAL CTA & REWARD LOOP (11.65s – 17.41s)
  // Postcards fan back around him at frame 435 (14.5s) for closure
  // ----------------------------------------------------
  const ctaFanSpring = spring({
    frame: frame - 435,
    fps,
    config: { damping: 14, stiffness: 150 },
  });
  const fanProgress = interpolate(ctaFanSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D0D", overflow: "hidden", fontFamily: fontStack }}>
      {/* Primary Voiceover Audio Track — 100% CLEAN VOICEOVER, ZERO SFX! */}
      <Audio src={staticFile("vietnam/speaker.mp4")} />

      {/* ============================================================ */}
      {/* FULL-FRAME SPEAKER VIDEO LAYER — VISIBLE AT ALL TIMES */}
      {/* ============================================================ */}
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${
              currentTime >= 8.3 && currentTime < 9.2
                ? speakerPunchZoom
                : currentTime >= 9.2 && currentTime < 11.65
                ? 1.0 // Steady during inspection
                : 1.02
            })`,
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <OffthreadVideo
            src={staticFile("vietnam/speaker.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Ambient Editorial Scrim (Preserves speaker while boosting card contrast) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              currentTime < 3.25
                ? "linear-gradient(180deg, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.25) 45%, rgba(13,13,13,0.8) 100%)"
                : currentTime >= 9.2 && currentTime < 11.65
                ? "linear-gradient(180deg, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.4) 40%, rgba(13,13,13,0.9) 100%)"
                : "linear-gradient(180deg, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.15) 45%, rgba(13,13,13,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* ============================================================ */}
      {/* SCENE 1: AGGRESSIVE OPENING HOOK (0.0s – 3.25s) */}
      {/* Postcards explode immediately, dominating the frame! */}
      {/* ============================================================ */}
      {currentTime < 3.25 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Curiosity-Driven Headroom Title (caption.mp4 style) */}
          <div
            style={{
              position: "absolute",
              top: 130,
              width: "100%",
              textAlign: "center",
              padding: "0 30px",
              zIndex: 50,
            }}
          >
            {currentTime < 2.0 ? (
              <div
                style={{
                  fontSize: 50,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  textTransform: "lowercase",
                  lineHeight: 1.12,
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                i tried this with my <br />
                <span style={{ color: "#FFE600" }}>vietnam photos…</span>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFE600",
                  textTransform: "lowercase",
                  textShadow: "0 4px 30px rgba(255,230,0,0.5), 0 2px 10px rgba(0,0,0,0.9)",
                }}
              >
                one ChatGPT prompt.
              </div>
            )}
          </div>

          {/* 5 Massive Postcards Popping In (Dominating Center Frame!) */}
          <div
            style={{
              position: "relative",
              width: 960,
              height: 720,
              marginTop: 260,
              transform: `scale(${hookExitScale})`,
              opacity: hookExitOpacity,
              zIndex: 30,
            }}
          >
            {hookPostcards.map((card, idx) => {
              const cardSpring = spring({
                frame: frame - card.frameStart,
                fps,
                config: { damping: 11, stiffness: 210 }, // Extra snappy pop!
              });
              if (frame < card.frameStart) return null;

              const scale = interpolate(cardSpring, [0, 1], [0.3, card.scaleMax]);
              const opacity = interpolate(cardSpring, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });
              const rot = interpolate(cardSpring, [0, 1], [card.rot * 2.2, card.rot]);

              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 860,
                    height: 645, // 4:3 ratio!
                    marginLeft: -430 + card.x,
                    marginTop: -322 + card.y,
                    transform: `scale(${scale}) rotate(${rot}deg)`,
                    opacity,
                    zIndex: card.zIndex,
                    borderRadius: 22,
                    overflow: "hidden",
                    border: card.isHero ? "7px solid #FFE600" : "6px solid #FFFFFF",
                    boxShadow: card.isHero
                      ? "0 36px 90px rgba(0, 0, 0, 0.85), 0 0 50px rgba(255,230,0,0.4)"
                      : "0 24px 60px rgba(0, 0, 0, 0.65)",
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
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 2: VIETNAM CONTEXT WITH RAPID INFO BEATS (3.25s – 8.90s) */}
      {/* New information every ~1 second + Dramatic Cliffhanger */}
      {/* ============================================================ */}
      {currentTime >= 3.25 && currentTime < 8.90 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Dynamic Headroom Titles (caption.mp4 style) */}
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
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                5 photos.
              </div>
            ) : currentTime < 5.8 ? (
              <div
                style={{
                  fontSize: 78,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFE600",
                  textTransform: "lowercase",
                  textShadow: "0 4px 24px rgba(255,230,0,0.4)",
                }}
              >
                one prompt.
              </div>
            ) : currentTime < 7.1 ? (
              <div
                style={{
                  fontSize: 66,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                zero design skills.
              </div>
            ) : currentTime < 8.0 ? (
              <div
                style={{
                  fontSize: 70,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                made in <span style={{ color: "#FFE600" }}>ChatGPT.</span>
              </div>
            ) : (
              /* REAL CLIFFHANGER (8.0s – 8.90s) */
              <div style={{ animation: "pulse 0.3s ease-out" }}>
                <div
                  style={{
                    fontSize: 54,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    color: "#FFFFFF",
                    textTransform: "lowercase",
                    lineHeight: 1.12,
                    textShadow: "0 4px 30px rgba(0,0,0,0.95)",
                  }}
                >
                  but look what happened <br />
                  <span style={{ color: "#FFE600" }}>to this one…</span>
                </div>
              </div>
            )}
          </div>

          {/* Fast Postcard Showcase in Upper Negative Space (3.25s – 8.0s) */}
          {currentTime >= 3.25 && currentTime < 8.0 && (
            <div
              style={{
                position: "absolute",
                top: 240,
                width: 580,
                height: 435, // 4:3 uncropped ratio!
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
              {currentTime >= 7.1 && currentTime < 8.0 && (
                <Img src={staticFile(PAIRS[2].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 3: FIRST TRANSFORMATION (8.90s – 10.80s) */}
      {/* Photo fills ALMOST ENTIRE FRAME so audience inspects detail! */}
      {/* ORG1 -> Fast 3D Flip -> ED1 (HOLDS FOR 1.1+ SECONDS!) */}
      {/* ============================================================ */}
      {currentTime >= 8.90 && currentTime < 10.80 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {/* Headroom Title */}
          <div
            style={{
              position: "absolute",
              top: 120,
              width: "100%",
              textAlign: "center",
              zIndex: 60,
            }}
          >
            <div
              style={{
                fontSize: 66,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: isFlipped ? "#FFE600" : "#FFFFFF",
                textTransform: "lowercase",
                textShadow: "0 4px 24px rgba(0,0,0,0.95)",
              }}
            >
              {isFlipped ? "…became this." : "this photo…"}
            </div>
          </div>

          {/* HERO COMPARISON CARD: Fills 85% of screen height for full inspection! */}
          <div
            style={{
              width: isFlipped ? 1000 : 760,
              height: isFlipped ? 750 : 1013,
              perspective: 1400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 40,
              marginTop: 60,
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
                boxShadow: "0 40px 100px rgba(0,0,0,0.85)",
                borderRadius: 24,
              }}
            >
              {/* Front Face: ORG1 (Castle Photo — Large & Clear!) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  borderRadius: 24,
                  overflow: "hidden",
                  border: "8px solid #FFFFFF",
                  background: "#0D0D0D",
                }}
              >
                <Img src={staticFile(PAIRS[0].org)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Back Face: ED1 (AI Postcard — Large 4:3 Uncropped, Holds 1.1s!) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderRadius: 24,
                  overflow: "hidden",
                  border: "8px solid #FFFFFF",
                  background: "#EAE6DF",
                }}
              >
                <Img src={staticFile(PAIRS[0].ed)} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#EAE6DF" }} />
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 4: SECOND TRANSFORMATION (10.80s – 12.10s) */}
      {/* ORG3 -> Ultra-Fast Mask Wipe -> ED3 (UNCROPPED!) */}
      {/* ============================================================ */}
      {currentTime >= 10.80 && currentTime < 12.10 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {/* Headroom Title */}
          <div
            style={{
              position: "absolute",
              top: 120,
              width: "100%",
              textAlign: "center",
              zIndex: 60,
            }}
          >
            <div
              style={{
                fontSize: 66,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: wipeX > 50 ? "#FFE600" : "#FFFFFF",
                textTransform: "lowercase",
                textShadow: "0 4px 24px rgba(0,0,0,0.95)",
              }}
            >
              {wipeX > 50 ? "…became this." : "and this one…"}
            </div>
          </div>

          {/* Comparison Card (Fills screen for clear inspection) */}
          <div
            style={{
              position: "relative",
              width: wipeX > 50 ? 1000 : 760,
              height: wipeX > 50 ? 750 : 1013,
              marginTop: 60,
              borderRadius: 24,
              overflow: "hidden",
              border: "8px solid #FFFFFF",
              boxShadow: "0 40px 100px rgba(0,0,0,0.85)",
              background: "#0D0D0D",
              zIndex: 40,
              transition: "width 0.2s ease, height 0.2s ease",
            }}
          >
            {/* Base: ORG3 Photo */}
            <Img
              src={staticFile(PAIRS[2].org)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Revealing Layer: ED3 Postcard */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `polygon(0 0, ${wipeX}% 0, ${wipeX}% 100%, 0 100%)`,
                background: "#EAE6DF",
              }}
            >
              <Img
                src={staticFile(PAIRS[2].ed)}
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#EAE6DF" }}
              />
            </div>

            {/* Gold Hairline Divider */}
            {wipeX > 0 && wipeX < 100 && (
              <div
                style={{
                  position: "absolute",
                  left: `${wipeX}%`,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  background: "#FFE600",
                  boxShadow: "0 0 24px rgba(255,230,0,1)",
                }}
              />
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 5: REWARD-DRIVEN CTA & LOOP CLOSURE (12.10s – 17.41s) */}
      {/* Giant "POSTCARDS" + 5 Cards fan back around speaker */}
      {/* ============================================================ */}
      {currentTime >= 12.10 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Headroom Reward Hierarchy */}
          <div style={{ marginTop: 140, textAlign: "center", zIndex: 60, width: "100%", padding: "0 30px" }}>
            {currentTime < 13.6 ? (
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.03em",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                want the exact prompt?
              </div>
            ) : currentTime < 15.6 ? (
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "#FFFFFF",
                    opacity: 0.85,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  comment
                </div>
                {/* BIGGEST TEXT IN THE REEL: POSTCARDS */}
                <div
                  style={{
                    fontSize: 88,
                    fontWeight: 900,
                    color: "#FFE600",
                    letterSpacing: "-0.03em",
                    textTransform: "uppercase",
                    textShadow: "0 4px 35px rgba(255,230,0,0.5), 0 2px 10px rgba(0,0,0,0.9)",
                  }}
                >
                  "POSTCARDS"
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 68,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.03em",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                I’ll send it 👀
              </div>
            )}
          </div>

          {/* 5 Postcards Fan Back Around Speaker for Visual Loop Closure! */}
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
      {/* WORD-LEVEL KINETIC CAPTIONS — JUST BELOW THE FACE ON CHEST! */}
      {/* Abigail Daniella (caption.mp4) formula: */}
      {/* Normal speech = small/subtle (44px) */}
      {/* Key punch words = BIG + BOLD + POP (64px #FFE600) */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 1300, // Exactly just below his chin/beard on his upper chest!
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 70,
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
          {/* 0.0s – 3.25s Hook */}
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

          {/* 3.25s – 9.20s Vietnam Context */}
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
          {currentTime >= 8.2 && currentTime < 8.90 && (
            <span style={{ fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "lowercase" }}>postcards mein convert!</span>
          )}

          {/* 8.90s – 10.80s Transform 1 (ED1 holds 1.1s!) */}
          {currentTime >= 8.90 && currentTime < 9.50 && (
            <span style={{ fontSize: 58, fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase" }}>THIS PHOTO…</span>
          )}
          {currentTime >= 9.50 && currentTime < 10.80 && (
            <span style={{ fontSize: 72, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>…BANI YEH!</span>
          )}

          {/* 10.80s – 12.10s Transform 2 */}
          {currentTime >= 10.80 && currentTime < 11.20 && (
            <span style={{ fontSize: 58, fontWeight: 900, color: "#FFFFFF", textTransform: "uppercase" }}>AND THIS PHOTO…</span>
          )}
          {currentTime >= 11.20 && currentTime < 12.10 && (
            <span style={{ fontSize: 72, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>…BANI YEH!</span>
          )}

          {/* 12.10s – 17.41s CTA */}
          {currentTime >= 12.10 && currentTime < 13.5 && (
            <span style={{ fontSize: 46, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "lowercase" }}>travel photos ko bhi</span>
          )}
          {currentTime >= 13.5 && currentTime < 14.5 && (
            <span style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF", textTransform: "lowercase" }}>convert karna hai?</span>
          )}
          {currentTime >= 14.5 && currentTime < 16.0 && (
            <span style={{ fontSize: 74, fontWeight: 900, color: "#FFE600", textTransform: "uppercase" }}>COMMENT "POSTCARDS"</span>
          )}
          {currentTime >= 16.0 && currentTime < 17.4 && (
            <span style={{ fontSize: 50, fontWeight: 700, color: "#FFFFFF", textTransform: "lowercase" }}>aur main prompt bhej dunga</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
