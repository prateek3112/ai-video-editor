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

export const VietnamPostcardsReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // ----------------------------------------------------
  // SCENE 1: OPENING HOOK (0.0s – 3.25s / frames 0–97)
  // Split Screen: Speaker 100% visible in bottom half!
  // Top half: 5 finished AI Postcards popping in!
  // ZERO sound effects!
  // ----------------------------------------------------
  const hookPostcards = [
    { ed: PAIRS[0].ed, frameStart: 4, rot: -6, x: -110, y: -20, zIndex: 10 },
    { ed: PAIRS[1].ed, frameStart: 18, rot: 5, x: 100, y: -10, zIndex: 11 },
    { ed: PAIRS[2].ed, frameStart: 32, rot: -3, x: -70, y: 25, zIndex: 12 },
    { ed: PAIRS[3].ed, frameStart: 46, rot: 4, x: 80, y: 20, zIndex: 13 },
    { ed: PAIRS[4].ed, frameStart: 62, rot: 0, x: 0, y: 0, zIndex: 14, isHero: true },
  ];

  // ----------------------------------------------------
  // SCENE 3: FIRST "THIS PHOTO BECAME THAT" (9.20s – 10.45s)
  // frames 276–313: ORG1 -> ED1 (3D Card Flip in Top Half)
  // Speaker 100% visible in Bottom Half!
  // ----------------------------------------------------
  const flipProgress = spring({
    frame: frame - 298,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const flipAngle = interpolate(flipProgress, [0, 1], [0, 180]);
  const isFlipped = flipAngle >= 90;

  // ----------------------------------------------------
  // SCENE 4: SECOND "THIS PHOTO BECAME THAT" (10.45s – 11.65s)
  // frames 314–349: ORG3 -> ED3 (Clean Fast Mask Wipe in Top Half)
  // Speaker 100% visible in Bottom Half!
  // ----------------------------------------------------
  const wipeProgress = spring({
    frame: frame - 331,
    fps,
    config: { damping: 18, stiffness: 200 },
  });
  const wipeX = interpolate(wipeProgress, [0, 1], [0, 100]); // percentage

  // ----------------------------------------------------
  // SCENE 5: CALL TO ACTION (11.65s – 17.41s)
  // ----------------------------------------------------
  const ctaCursorSpring = spring({
    frame: frame - 425,
    fps,
    config: { damping: 14, stiffness: 160 },
  });
  const cursorX = interpolate(ctaCursorSpring, [0, 1], [180, 0]);
  const cursorY = interpolate(ctaCursorSpring, [0, 1], [140, 0]);
  const isCtaClicked = frame >= 445;

  // Determine if current frame is in a split screen scene (Scene 1: Hook, Scene 3 & 4: Transformations)
  const isSplitScreen = currentTime < 3.25 || (currentTime >= 9.20 && currentTime < 11.65);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D0D", overflow: "hidden", fontFamily: fontStack }}>
      {/* Primary Voiceover Audio Track — STRICTLY ZERO SOUND EFFECTS! */}
      <Audio src={staticFile("vietnam/speaker.mp4")} />

      {/* ============================================================ */}
      {/* SPEAKER VIDEO LAYER — VISIBLE AT ALL TIMES (0.0s – 17.41s) */}
      {/* ============================================================ */}

      {isSplitScreen ? (
        /* SPLIT SCREEN MODE (Scenes 1, 3, 4): Speaker in Bottom Half (y: 960 to 1920) */
        <div
          style={{
            position: "absolute",
            top: 960,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            background: "#0D0D0D",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -460, // Centers speaker's head & chest in the lower half
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
              background: "linear-gradient(180deg, rgba(13,13,13,0.35) 0%, rgba(13,13,13,0.1) 40%, rgba(13,13,13,0.6) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Word-Level Captions for Split Screen: JUST BELOW THE FACE ON CHEST! */}
          <div
            style={{
              position: "absolute",
              top: 810, // Exactly just below his chin/beard on his upper chest!
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 60,
            }}
          >
            <div
              style={{
                maxWidth: 900,
                textAlign: "center",
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                textTransform: "lowercase",
                textShadow: "0 4px 20px rgba(0,0,0,0.95)",
                lineHeight: 1.15,
              }}
            >
              {/* Hook (0.0s – 3.25s) */}
              {currentTime >= 0.2 && currentTime < 0.7 && (
                <span style={{ color: "#FFE600", fontSize: 54 }}>ai se</span>
              )}
              {currentTime >= 0.7 && currentTime < 1.4 && (
                <span style={{ color: "#FFFFFF" }}>apni</span>
              )}
              {currentTime >= 1.4 && currentTime < 2.1 && (
                <span style={{ color: "#FFE600", fontSize: 52 }}>travel photos</span>
              )}
              {currentTime >= 2.1 && currentTime < 2.65 && (
                <span style={{ color: "#FFFFFF" }}>aise</span>
              )}
              {currentTime >= 2.65 && currentTime < 3.25 && (
                <span style={{ color: "#FFE600", fontSize: 56 }}>postcards</span>
              )}

              {/* Transform 1 (9.20s – 10.45s) */}
              {currentTime >= 9.20 && currentTime < 10.05 && (
                <span style={{ color: "#FFFFFF", fontSize: 52 }}>this photo…</span>
              )}
              {currentTime >= 10.05 && currentTime < 10.45 && (
                <span style={{ color: "#FFE600", fontSize: 56 }}>…became that!</span>
              )}

              {/* Transform 2 (10.45s – 11.65s) */}
              {currentTime >= 10.45 && currentTime < 11.15 && (
                <span style={{ color: "#FFFFFF", fontSize: 52 }}>and this photo…</span>
              )}
              {currentTime >= 11.15 && currentTime < 11.65 && (
                <span style={{ color: "#FFE600", fontSize: 56 }}>…became that!</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* FULL-SCREEN SPEAKER MODE (Scenes 2 & 5): Speaker 100% visible */
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scale(${
                currentTime >= 8.4 && currentTime < 9.2
                  ? 1.10 // Punch-in zoom on open loop!
                  : 1.02
              })`,
              transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <OffthreadVideo
              src={staticFile("vietnam/speaker.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Ambient Contrast Scrim */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(13,13,13,0.5) 0%, rgba(13,13,13,0.15) 40%, rgba(13,13,13,0.7) 100%)",
              pointerEvents: "none",
            }}
          />
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 1: TOP HALF STAGE (0.0s – 3.25s) */}
      {/* 5 AI Postcards popping in with curiosity title */}
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
            borderBottom: "2px solid #2B2B2B",
            overflow: "hidden",
          }}
        >
          {/* Big Editorial Title in Headroom (caption.mp4 style) */}
          <div
            style={{
              position: "absolute",
              top: 60,
              width: "100%",
              textAlign: "center",
              padding: "0 30px",
              zIndex: 30,
            }}
          >
            {currentTime < 2.1 ? (
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

          {/* 5 Finished AI Postcards Popping In (ED1 -> ED2 -> ED3 -> ED4 -> ED5) */}
          <div style={{ position: "relative", width: 760, height: 570, margin: "180px auto 0" }}>
            {hookPostcards.map((card, idx) => {
              const cardSpring = spring({
                frame: frame - card.frameStart,
                fps,
                config: { damping: 12, stiffness: 180 },
              });
              if (frame < card.frameStart) return null;

              const scale = interpolate(cardSpring, [0, 1], [0.35, card.isHero ? 1.03 : 0.88]);
              const opacity = interpolate(cardSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
              const rot = interpolate(cardSpring, [0, 1], [card.rot * 2, card.rot]);

              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 680,
                    height: 510, // 4:3 native ratio!
                    marginLeft: -340 + card.x,
                    marginTop: -255 + card.y,
                    transform: `scale(${scale}) rotate(${rot}deg)`,
                    opacity,
                    zIndex: card.zIndex,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: card.isHero ? "5px solid #FFE600" : "5px solid #FFFFFF",
                    boxShadow: card.isHero
                      ? "0 28px 75px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255,230,0,0.3)"
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
      {/* BIG TITLES IN HEADROOM + FLOATING INSET + SPEAKER 100% VISIBLE */}
      {/* ============================================================ */}
      {currentTime >= 3.25 && currentTime < 9.20 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Big Editorial Title in Headroom above hair (caption.mp4 style) */}
          <div
            style={{
              position: "absolute",
              top: 140,
              width: "100%",
              textAlign: "center",
              padding: "0 30px",
              zIndex: 40,
            }}
          >
            {currentTime < 4.6 ? (
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
                5 photos.
              </div>
            ) : currentTime < 5.9 ? (
              <div
                style={{
                  fontSize: 74,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFE600",
                  textTransform: "lowercase",
                  textShadow: "0 4px 24px rgba(255,230,0,0.4)",
                }}
              >
                one prompt.
              </div>
            ) : currentTime < 7.2 ? (
              <div
                style={{
                  fontSize: 62,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                zero design skills.
              </div>
            ) : currentTime < 8.4 ? (
              <div
                style={{
                  fontSize: 66,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#10A37F",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                made in ChatGPT.
              </div>
            ) : (
              /* Open Loop before transformation */
              <div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    color: "#FFFFFF",
                    textTransform: "lowercase",
                    lineHeight: 1.15,
                    textShadow: "0 4px 24px rgba(0,0,0,0.9)",
                  }}
                >
                  but look what happened <br />
                  <span style={{ color: "#FFE600" }}>to this one…</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Postcard in Upper Negative Space (Above his hair) */}
          {currentTime < 8.4 && (
            <div
              style={{
                position: "absolute",
                top: 240,
                width: 520,
                height: 390, // 4:3 native ratio!
                borderRadius: 18,
                overflow: "hidden",
                border: "4px solid #FFFFFF",
                boxShadow: "0 24px 60px rgba(0,0,0,0.65)",
                background: "#EAE6DF",
                zIndex: 35,
              }}
            >
              {currentTime < 4.6 && (
                <Img src={staticFile(PAIRS[0].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {currentTime >= 4.6 && currentTime < 5.9 && (
                <Img src={staticFile(PAIRS[3].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {currentTime >= 5.9 && currentTime < 7.2 && (
                <Img src={staticFile(PAIRS[1].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {currentTime >= 7.2 && currentTime < 8.4 && (
                <Img src={staticFile(PAIRS[2].ed)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* SCENE 3: FIRST "THIS PHOTO BECAME THAT" (9.20s – 10.45s) */}
      {/* Top Half Stage: ORG1 -> 3D Flip -> ED1 (UNCROPPED 4:3!) */}
      {/* Bottom Half Stage: Speaker 100% visible! */}
      {/* ============================================================ */}
      {currentTime >= 9.20 && currentTime < 10.45 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 960,
            background: "radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0D0D0D 100%)",
            borderBottom: "2px solid #2B2B2B",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Big Editorial Title in Headroom */}
          <div style={{ marginTop: 50, zIndex: 40, textAlign: "center" }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: isFlipped ? "#FFE600" : "#FFFFFF",
                textTransform: "lowercase",
                textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              }}
            >
              {isFlipped ? "…became this." : "this one…"}
            </div>
          </div>

          {/* 3D Flipping Card Container */}
          <div
            style={{
              marginTop: 30,
              width: isFlipped ? 820 : 540,
              height: isFlipped ? 615 : 720,
              perspective: 1200,
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
                boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
                borderRadius: 20,
              }}
            >
              {/* Front Face: ORG1 (Castle Photo) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "6px solid #FFFFFF",
                  background: "#0D0D0D",
                }}
              >
                <Img src={staticFile(PAIRS[0].org)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Back Face: ED1 (Postcard - UNCROPPED 4:3!) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "6px solid #FFFFFF",
                  background: "#EAE6DF",
                }}
              >
                <Img src={staticFile(PAIRS[0].ed)} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#EAE6DF" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 4: SECOND "THIS PHOTO BECAME THAT" (10.45s – 11.65s) */}
      {/* Top Half Stage: ORG3 -> Fast Mask Wipe -> ED3 (UNCROPPED 4:3!) */}
      {/* Bottom Half Stage: Speaker 100% visible! */}
      {/* ============================================================ */}
      {currentTime >= 10.45 && currentTime < 11.65 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 960,
            background: "radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0D0D0D 100%)",
            borderBottom: "2px solid #2B2B2B",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Big Editorial Title in Headroom */}
          <div style={{ marginTop: 50, zIndex: 40, textAlign: "center" }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: wipeX > 50 ? "#FFE600" : "#FFFFFF",
                textTransform: "lowercase",
                textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              }}
            >
              {wipeX > 50 ? "…became this." : "and this one…"}
            </div>
          </div>

          {/* Fast Mask Reveal Card Container */}
          <div
            style={{
              position: "relative",
              width: wipeX > 50 ? 820 : 540,
              height: wipeX > 50 ? 615 : 720,
              marginTop: 30,
              borderRadius: 20,
              overflow: "hidden",
              border: "6px solid #FFFFFF",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
              background: "#0D0D0D",
              zIndex: 35,
              transition: "width 0.2s ease, height 0.2s ease",
            }}
          >
            {/* Base Layer: ORG3 Photo */}
            <Img
              src={staticFile(PAIRS[2].org)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Top Layer: ED3 Postcard (UNCROPPED 4:3!) */}
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

            {/* Clean Gold Hairline Divider */}
            {wipeX > 0 && wipeX < 100 && (
              <div
                style={{
                  position: "absolute",
                  left: `${wipeX}%`,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  background: "#FFE600",
                  boxShadow: "0 0 20px rgba(255,230,0,1)",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 5: REWARD-DRIVEN CALL TO ACTION (11.65s – 17.41s) */}
      {/* Speaker 100% visible, big title in headroom, interactive CTA */}
      {/* ============================================================ */}
      {currentTime >= 11.65 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          {/* Big Editorial Title in Headroom */}
          <div style={{ marginTop: 140, textAlign: "center", zIndex: 40, width: "100%", padding: "0 30px" }}>
            {currentTime < 13.5 ? (
              <div
                style={{
                  fontSize: 62,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
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
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "#FFFFFF",
                    opacity: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  drop a comment
                </div>
                <div
                  style={{
                    fontSize: 80,
                    fontWeight: 900,
                    color: "#FFE600",
                    letterSpacing: "-0.03em",
                    textTransform: "uppercase",
                    textShadow: "0 4px 30px rgba(255,230,0,0.5)",
                  }}
                >
                  "postcards"
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  textTransform: "lowercase",
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                and I’ll <span style={{ color: "#FFE600" }}>send it.</span>
              </div>
            )}
          </div>

          {/* Interactive Comment Pill at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 220,
              zIndex: 50,
            }}
          >
            <div
              style={{
                position: "relative",
                background: "rgba(255, 255, 255, 0.96)",
                borderRadius: 22,
                padding: "20px 44px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                border: "3px solid #D9D9D6",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
                transform: isCtaClicked ? "scale(0.97)" : "scale(1)",
                transition: "transform 0.15s ease",
              }}
            >
              <span style={{ fontSize: 32 }}>💬</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6B6B" }}>
                  TYPE IN COMMENTS
                </span>
                <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: "0.02em", color: "#0D0D0D" }}>
                  "POSTCARDS"
                </span>
              </div>

              {/* Animated Cursor */}
              {currentTime >= 14.2 && (
                <div
                  style={{
                    position: "absolute",
                    right: -10,
                    bottom: -15,
                    transform: `translate(${cursorX}px, ${cursorY}px)`,
                    pointerEvents: "none",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                      fill="#0D0D0D"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============================================================ */}
      {/* WORD-LEVEL KINETIC CAPTIONS (FULL SCREEN SCENES 2 & 5) */}
      {/* Positioned at top: 1210px (63%) — EXACTLY JUST BELOW HIS CHIN ON UPPER CHEST! */}
      {/* Clean Acumin Pro / Helvetica Neue typography (caption.mp4 style) */}
      {/* ============================================================ */}
      {!isSplitScreen && (
        <div
          style={{
            position: "absolute",
            top: 1310, // Exactly just below his chin/beard on his upper chest!
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 60,
          }}
        >
          <div
            style={{
              maxWidth: 900,
              textAlign: "center",
              fontSize: 50,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textTransform: "lowercase",
              textShadow: "0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.98)",
              lineHeight: 1.15,
            }}
          >
            {/* 3.25s – 9.20s Vietnam Context */}
            {currentTime >= 3.25 && currentTime < 4.0 && (
              <span style={{ color: "#FFFFFF" }}>maine apni</span>
            )}
            {currentTime >= 4.0 && currentTime < 5.0 && (
              <span style={{ color: "#FFE600", fontSize: 56 }}>vietnam trip ki</span>
            )}
            {currentTime >= 5.0 && currentTime < 6.2 && (
              <span style={{ color: "#FFFFFF" }}>favourite photos ko</span>
            )}
            {currentTime >= 6.2 && currentTime < 7.2 && (
              <span style={{ color: "#10A37F", fontSize: 54 }}>ChatGPT ke</span>
            )}
            {currentTime >= 7.2 && currentTime < 8.2 && (
              <span style={{ color: "#FFE600", fontSize: 56 }}>1 prompt se</span>
            )}
            {currentTime >= 8.2 && currentTime < 9.2 && (
              <span style={{ color: "#FFFFFF" }}>postcards mein convert!</span>
            )}

            {/* 11.65s – 17.41s CTA */}
            {currentTime >= 11.65 && currentTime < 13.0 && (
              <span style={{ color: "#FFFFFF" }}>travel photos ko bhi</span>
            )}
            {currentTime >= 13.0 && currentTime < 14.5 && (
              <span style={{ color: "#FFFFFF" }}>convert karna hai?</span>
            )}
            {currentTime >= 14.5 && currentTime < 16.0 && (
              <span style={{ color: "#FFE600", fontSize: 60 }}>comment "postcards"</span>
            )}
            {currentTime >= 16.0 && currentTime < 17.4 && (
              <span style={{ color: "#FFFFFF" }}>aur main prompt bhej dunga</span>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
