import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const GptAstraReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Dynamic Camera punch zooms for pacing
  const cameraScale = (() => {
    if (currentTime < 3.5) {
      return interpolate(currentTime, [0, 0.4], [1.0, 1.05], { extrapolateRight: "clamp" });
    } else if (currentTime >= 3.5 && currentTime < 8.8) {
      return 1.0;
    } else if (currentTime >= 8.8 && currentTime < 13.5) {
      return interpolate(currentTime, [8.8, 9.3], [1.0, 1.04], { extrapolateRight: "clamp" });
    } else if (currentTime >= 13.5 && currentTime < 26.5) {
      return interpolate(currentTime, [13.5, 14.0], [1.0, 1.06], { extrapolateRight: "clamp" });
    } else if (currentTime >= 26.5 && currentTime < 36.5) {
      return interpolate(currentTime, [26.5, 27.2], [1.05, 1.14], { extrapolateRight: "clamp" });
    } else {
      return interpolate(currentTime, [36.5, 37.2], [1.05, 1.08], { extrapolateRight: "clamp" });
    }
  })();

  // Card Springs
  const scene1CardSpring = spring({
    frame: frame - Math.round(1.0 * fps),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const scene3CardSpring = spring({
    frame: frame - Math.round(8.8 * fps),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const scene4CardSpring = spring({
    frame: frame - Math.round(13.5 * fps),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const scene5CardSpring = spring({
    frame: frame - Math.round(26.5 * fps),
    fps,
    config: { damping: 13, stiffness: 140 },
  });

  const scene6CardSpring = spring({
    frame: frame - Math.round(40.5 * fps),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#06080D", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      {/* 0. PRIMARY CONTINUOUS SYNCHRONIZED AUDIO */}
      <Audio src={staticFile("gpt/speaker_intra.mp4")} />

      {/* ============================================================ */}
      {/* 1. SPEAKER TALKING HEAD (OFFTHREAD ALL-INTRA 100% SMOOTH)    */}
      {/* ============================================================ */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale})`,
          transformOrigin: "center 42%",
        }}
      >
        <OffthreadVideo
          src={staticFile("gpt/speaker_intra.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Ambient Dark Scrim for High-Contrast Clean Aesthetics */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 35%, rgba(6,8,13,0.55) 75%, rgba(6,8,13,0.88) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Headroom Gradient Scrim */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 380,
            background: "linear-gradient(to bottom, rgba(6,8,13,0.92) 0%, rgba(6,8,13,0) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* ============================================================ */}
      {/* 2. SCENE 2 HERO: PARTICLE GALAXY TITLE (3.5s – 8.8s)         */}
      {/* Properly isolated inside Sequence to prevent seek overflows  */}
      {/* ============================================================ */}
      <Sequence from={Math.round(3.5 * fps)} durationInFrames={Math.round(5.3 * fps)}>
        <AbsoluteFill style={{ zIndex: 10 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: interpolate(currentTime, [3.5, 3.8, 8.4, 8.8], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <OffthreadVideo
              src={staticFile("gpt/visual1_1080p.mp4")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(0,102,255,0.18) 0%, rgba(0,0,0,0.7) 85%)",
              }}
            />
          </div>

          {/* Picture-in-Picture Speaker Cutout in Bottom-Right */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 40,
              width: 250,
              height: 375,
              borderRadius: 28,
              overflow: "hidden",
              border: "3px solid rgba(255, 230, 0, 0.85)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 230, 0, 0.3)",
              transform: `scale(${interpolate(currentTime, [3.6, 4.0], [0.6, 1.0], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(currentTime, [3.6, 3.9], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <OffthreadVideo
              src={staticFile("gpt/speaker_intra.mp4")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              startFrom={Math.round(3.5 * fps)}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ============================================================ */}
      {/* 3. SCENE 1: PRISTINE EDITORIAL BENCHMARK TABLE (1.0s – 3.5s) */}
      {/* 100% Vector/UI — Zero room/speaker from visual2.MP4          */}
      {/* ============================================================ */}
      {currentTime >= 1.0 && currentTime < 3.5 && (
        <div
          style={{
            position: "absolute",
            top: 250,
            left: 54,
            width: 972,
            backgroundColor: "#FFFFFF",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 28px 70px rgba(0,0,0,0.85)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            transform: `translateY(${interpolate(scene1CardSpring, [0, 1], [-70, 0])}px) scale(${interpolate(
              scene1CardSpring,
              [0, 1],
              [0.92, 1]
            )})`,
            opacity: interpolate(currentTime, [1.0, 1.3, 3.2, 3.5], [0, 1, 1, 0]),
            zIndex: 15,
            padding: "24px 32px",
            color: "#0D0D0D",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "2px solid #EAEAEA", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>✦</div>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.04em", color: "#111111" }}>OPENAI BENCHMARK RESULTS</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#666666" }}>SEPTEMBER 2026</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr", gap: "8px 12px", fontSize: 17, fontWeight: 600 }}>
            <div style={{ color: "#777777", textTransform: "uppercase", fontSize: 14, letterSpacing: "0.05em" }}>Benchmark</div>
            <div style={{ color: "#0071E3", fontWeight: 800, fontSize: 16, textAlign: "center", backgroundColor: "rgba(0,113,227,0.08)", padding: "4px 8px", borderRadius: 8 }}>GPT-6 Astra</div>
            <div style={{ color: "#555555", fontWeight: 700, fontSize: 15, textAlign: "center" }}>GPT-5.5</div>
            <div style={{ color: "#555555", fontWeight: 700, fontSize: 15, textAlign: "center" }}>Claude</div>

            <div style={{ color: "#222" }}>Terminal-Bench Science</div>
            <div style={{ color: "#0071E3", fontWeight: 800, textAlign: "center" }}>64.6%</div>
            <div style={{ color: "#666", textAlign: "center" }}>22.4%</div>
            <div style={{ color: "#666", textAlign: "center" }}>52.6%</div>

            <div style={{ color: "#222" }}>AutomationBench</div>
            <div style={{ color: "#0071E3", fontWeight: 800, textAlign: "center" }}>41.4%</div>
            <div style={{ color: "#666", textAlign: "center" }}>18.1%</div>
            <div style={{ color: "#666", textAlign: "center" }}>31.4%</div>

            <div style={{ color: "#222" }}>FrontierMath Tier 4</div>
            <div style={{ color: "#0071E3", fontWeight: 800, textAlign: "center" }}>97.6%</div>
            <div style={{ color: "#666", textAlign: "center" }}>83.0%</div>
            <div style={{ color: "#666", textAlign: "center" }}>87.8%</div>

            <div style={{ color: "#222" }}>BenchCAD 3D Modeling</div>
            <div style={{ color: "#0071E3", fontWeight: 800, textAlign: "center" }}>95.9%</div>
            <div style={{ color: "#666", textAlign: "center" }}>83.3%</div>
            <div style={{ color: "#666", textAlign: "center" }}>84.3%</div>

            <div style={{ gridColumn: "1 / -1", backgroundColor: "#FFE600", borderRadius: 12, padding: "10px 14px", display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr", alignItems: "center", boxShadow: "0 0 25px rgba(255,230,0,0.6)", marginTop: 6 }}>
              <div style={{ color: "#000000", fontWeight: 900, fontSize: 20 }}>ARC-AGI-3 (Novel Puzzles)</div>
              <div style={{ color: "#000000", fontWeight: 900, fontSize: 26, textAlign: "center" }}>99.9% 🔥</div>
              <div style={{ color: "#444444", fontWeight: 800, fontSize: 18, textAlign: "center" }}>7.8%</div>
              <div style={{ color: "#666666", fontWeight: 700, fontSize: 16, textAlign: "center" }}>—</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. SCENE 3: GREG BROCKMAN & AXIOS STATEMENT (8.8s – 13.5s)   */}
      {/* Featuring Greg Brockman from TIME Studios & Axios news card  */}
      {/* ============================================================ */}
      {currentTime >= 8.8 && currentTime < 13.5 && (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 54,
            width: 972,
            zIndex: 15,
            opacity: interpolate(currentTime, [8.8, 9.2, 13.1, 13.5], [0, 1, 1, 0]),
            transform: `translateY(${interpolate(scene3CardSpring, [0, 1], [-60, 0])}px)`,
          }}
        >
          {currentTime < 11.2 ? (
            /* Part A: Greg Brockman TIME Video/Image Showcase (8.8s – 11.2s) */
            <div
              style={{
                backgroundColor: "#0C0E14",
                borderRadius: 28,
                overflow: "hidden",
                border: "2px solid rgba(255, 230, 0, 0.6)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(255, 230, 0, 0.25)",
              }}
            >
              <div
                style={{
                  padding: "16px 28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "linear-gradient(90deg, #111522 0%, #1A2035 100%)",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFE600", boxShadow: "0 0 10px #FFE600" }} />
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.06em" }}>
                    GREG BROCKMAN
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#FFE600", backgroundColor: "rgba(255,230,0,0.15)", padding: "3px 10px", borderRadius: 12 }}>
                    PRESIDENT, OPENAI
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>
                  TIME STUDIOS INTERVIEW
                </div>
              </div>

              {/* High-definition Media of Greg Brockman */}
              <div style={{ width: "100%", height: 380, position: "relative", overflow: "hidden" }}>
                <Img
                  src={staticFile("gpt/greg_brockman_hd.jpg")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${interpolate(currentTime, [8.8, 11.2], [1.0, 1.05], { extrapolateRight: "clamp" })})`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    background: "linear-gradient(to top, rgba(12,14,20,0.95), rgba(12,14,20,0))",
                  }}
                />
              </div>

              <div style={{ padding: "18px 28px", backgroundColor: "#0C0E14" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>
                  "This is a generational leap. Welcome to the arrival of AGI."
                </div>
              </div>
            </div>
          ) : (
            /* Part B: Axios Official Confirmation Card (11.2s – 13.5s) */
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 30px 80px rgba(0,0,0,0.85)",
                border: "1.5px solid rgba(255,255,255,0.4)",
                padding: "36px 44px",
                color: "#0D0D0D",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "2px solid #EEEEEE", paddingBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img
                    src={staticFile("gpt/greg_brockman_hd.jpg")}
                    alt="Greg Brockman"
                    style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "2px solid #0071E3" }}
                  />
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#002B49" }}>AXIOS EXCLUSIVE</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#666" }}>STATEMENT BY GREG BROCKMAN</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#10A37F", backgroundColor: "rgba(16,163,127,0.1)", padding: "6px 14px", borderRadius: 16 }}>
                  ✓ VERIFIED
                </div>
              </div>

              <div style={{ fontSize: 28, lineHeight: 1.45, fontWeight: 500, color: "#1F2328", position: "relative" }}>
                OpenAI officially launched <strong style={{ color: "#0071E3", fontWeight: 800 }}>GPT-6 Astra</strong>. President <strong style={{ color: "#000000", fontWeight: 800 }}>Greg Brockman</strong> announced:
                <div style={{ marginTop: 14, fontSize: 34, fontWeight: 900, color: "#000000", letterSpacing: "-0.02em" }}>
                  "Welcome to the arrival of Artificial General Intelligence, or AGI."
                </div>

                {/* Animated Red Highlighter Underline */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: interpolate(currentTime, [11.4, 12.8], [0, 880], {
                      extrapolateRight: "clamp",
                    }),
                    height: 6,
                    backgroundColor: "#FF3B30",
                    borderRadius: 3,
                    boxShadow: "0 0 16px rgba(255,59,48,0.7)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. SCENE 4: 99.9% ARC-AGI & ZERO INSTRUCTIONS (13.5s – 26.5s) */}
      {/* 100% Crisp Vector UI Card — Zero visual2 speaker/room        */}
      {/* ============================================================ */}
      {currentTime >= 13.5 && currentTime < 26.5 && (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 54,
            width: 972,
            backgroundColor: "#0B0E17",
            borderRadius: 30,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
            border: "2px solid rgba(255,255,255,0.18)",
            transform: `translateY(${interpolate(scene4CardSpring, [0, 1], [-50, 0])}px)`,
            opacity: interpolate(currentTime, [13.5, 13.9, 26.0, 26.5], [0, 1, 1, 0]),
            zIndex: 15,
            padding: "36px 40px",
          }}
        >
          {currentTime < 19.5 ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FFE600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  FRONTIER INTELLIGENCE BENCHMARK
                </div>
                <div style={{ fontSize: 16, color: "#888", fontWeight: 700 }}>ARC-AGI-3</div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 14 }}>
                <span style={{ fontSize: 110, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", textShadow: "0 0 40px rgba(255,230,0,0.5)" }}>
                  99.9%
                </span>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#FFE600" }}>SOLVE RATE</span>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)", padding: "14px 18px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 14, color: "#999", fontWeight: 600 }}>Previous SOTA</div>
                  <div style={{ fontSize: 28, color: "#FFF", fontWeight: 800, marginTop: 4 }}>7.8% (GPT-5.5)</div>
                </div>
                <div style={{ flex: 1, backgroundColor: "rgba(255,230,0,0.12)", padding: "14px 18px", borderRadius: 16, border: "1.5px solid #FFE600" }}>
                  <div style={{ fontSize: 14, color: "#FFE600", fontWeight: 700 }}>Astra Leap</div>
                  <div style={{ fontSize: 28, color: "#FFE600", fontWeight: 900, marginTop: 4 }}>+92.1% JUMP</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#10A37F", boxShadow: "0 0 12px #10A37F" }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: "#10A37F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  TEST CONDITION: FULL AUTONOMY
                </span>
              </div>

              <div style={{ fontSize: 34, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                AI placed into completely <span style={{ color: "#FFE600" }}>unknown environments</span> with zero instructions.
              </div>

              <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.06)", padding: "12px", borderRadius: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>🧭</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF", marginTop: 4 }}>Self-Explore</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.06)", padding: "12px", borderRadius: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>🧩</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF", marginTop: 4 }}>Deduce Rules</div>
                </div>
                <div style={{ backgroundColor: "rgba(255,230,0,0.15)", padding: "12px", borderRadius: 14, textAlign: "center", border: "1.5px solid #FFE600" }}>
                  <div style={{ fontSize: 24 }}>🎯</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#FFE600", marginTop: 4 }}>Goal Achieved</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. SCENE 5: 100% EXPLOIT & CRITICAL RISK (26.5s – 36.5s)     */}
      {/* 100% Clean Security Card — Zero visual2 speaker/room         */}
      {/* ============================================================ */}
      {currentTime >= 26.5 && currentTime < 36.5 && (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 54,
            width: 972,
            backgroundColor: "#0D0507",
            borderRadius: 30,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(255,59,48,0.4)",
            border: "3px solid #FF3B30",
            transform: `translateY(${interpolate(scene5CardSpring, [0, 1], [-50, 0])}px)`,
            opacity: interpolate(currentTime, [26.5, 26.9, 36.0, 36.5], [0, 1, 1, 0]),
            zIndex: 15,
            padding: "40px 48px",
          }}
        >
          {currentTime < 30.5 ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#FF3B30", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                CYBERSECURITY EXPLOIT BENCHMARK
              </div>
              <div style={{ fontSize: 120, fontWeight: 900, color: "#FFFFFF", textShadow: "0 0 45px rgba(255,59,48,0.9)", margin: "8px 0" }}>
                100%
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#FFE600" }}>
                FLAWLESS SECURITY PENETRATION
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  border: "3.5px solid #FF3B30",
                  padding: "16px 36px",
                  borderRadius: 20,
                  backgroundColor: "rgba(255,59,48,0.18)",
                  boxShadow: "0 0 40px rgba(255,59,48,0.6)",
                  transform: "rotate(-2deg)",
                }}
              >
                <div style={{ fontSize: 44, fontWeight: 900, color: "#FF3B30", letterSpacing: "0.08em" }}>
                  ⚠️ LEVEL 3: CRITICAL RISK
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginTop: 4 }}>
                  OPENAI PREPAREDNESS FRAMEWORK
                </div>
              </div>

              <div style={{ marginTop: 24, fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.85)", maxWidth: 780, lineHeight: 1.4 }}>
                Highest autonomous threat tier ever assigned to a neural model in OpenAI history.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. SCENE 6: AUTONOMOUS COMPUTER USE CARDS (40.5s – 44.5s)    */}
      {/* 100% Clean Software UI — Zero visual2 speaker/room           */}
      {/* ============================================================ */}
      {currentTime >= 40.5 && currentTime < 44.5 && (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 54,
            width: 972,
            backgroundColor: "#0B0E17",
            borderRadius: 30,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.85)",
            border: "2px solid rgba(255,255,255,0.3)",
            transform: `translateY(${interpolate(scene6CardSpring, [0, 1], [-50, 0])}px)`,
            opacity: interpolate(currentTime, [40.5, 40.8, 44.1, 44.5], [0, 1, 1, 0]),
            zIndex: 15,
            padding: "36px 44px",
          }}
        >
          {currentTime < 42.5 ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#10A37F", letterSpacing: "0.06em" }}>
                  📊 SPREADSHEET & FINANCIAL MODELING
                </div>
                <div style={{ backgroundColor: "#10A37F", color: "#FFF", fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>AUTO-FILLING</div>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 18, fontWeight: 600 }}>
                <div style={{ color: "#888" }}>Revenue (Q3)</div>
                <div style={{ color: "#FFE600", fontWeight: 800 }}>$142,500.00</div>
                <div style={{ color: "#10A37F" }}>✓ Calculated</div>
                <div style={{ color: "#888" }}>Net Margin</div>
                <div style={{ color: "#FFE600", fontWeight: 800 }}>38.4%</div>
                <div style={{ color: "#10A37F" }}>✓ Projected</div>
                <div style={{ color: "#888" }}>Tax Liability</div>
                <div style={{ color: "#FFE600", fontWeight: 800 }}>$24,180.00</div>
                <div style={{ color: "#10A37F" }}>✓ Reconciled</div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0071E3", letterSpacing: "0.06em" }}>
                  🌐 AUTONOMOUS BROWSER & FORM AGENT
                </div>
                <div style={{ backgroundColor: "#0071E3", color: "#FFF", fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>NAVIGATING WEB</div>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "18px", fontSize: 20, color: "#FFFFFF", lineHeight: 1.4 }}>
                <div style={{ color: "#888", fontSize: 14, marginBottom: 6 }}>Action Log:</div>
                <div>→ Identified multi-step web checkout form</div>
                <div>→ Auto-populated authentication & payment tokens</div>
                <div style={{ color: "#10A37F", fontWeight: 800, marginTop: 6 }}>✓ Workflow executed autonomously without human intervention</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. HEADROOM TITLES — PERFECT TITLE CASING & SOPHISTICATION   */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 25,
          padding: "0 40px",
        }}
      >
        {currentTime < 3.5 && (
          <h1
            style={{
              fontSize: 66,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 4px 28px rgba(0,0,0,0.95)",
              textAlign: "center",
            }}
          >
            Welcome to the <span style={{ color: "#FFE600", textShadow: "0 0 35px rgba(255,230,0,0.9)" }}>AGI Era</span>
          </h1>
        )}

        {currentTime >= 3.5 && currentTime < 8.8 && (
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#FFE600",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 0 35px rgba(255,230,0,0.85)",
              textAlign: "center",
            }}
          >
            ChatGPT-6 Astra
          </h1>
        )}

        {currentTime >= 8.8 && currentTime < 13.5 && (
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 4px 28px rgba(0,0,0,0.9)",
              textAlign: "center",
            }}
          >
            Welcome to the <span style={{ color: "#FFE600" }}>AGI Era</span>
          </h1>
        )}

        {currentTime >= 13.5 && currentTime < 26.5 && (
          <h1
            style={{
              fontSize: 66,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 4px 28px rgba(0,0,0,0.9)",
              textAlign: "center",
            }}
          >
            99.9% in <span style={{ color: "#FFE600" }}>ARC-AGI-3</span>
          </h1>
        )}

        {currentTime >= 26.5 && currentTime < 36.5 && (
          <h1
            style={{
              fontSize: 66,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 0 35px rgba(255,59,48,0.8)",
              textAlign: "center",
            }}
          >
            Critical Risk <span style={{ color: "#FF3B30" }}>Category</span>
          </h1>
        )}

        {currentTime >= 36.5 && currentTime < 44.5 && (
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 4px 28px rgba(0,0,0,0.9)",
              textAlign: "center",
            }}
          >
            Autonomous <span style={{ color: "#FFE600" }}>Computer Use</span>
          </h1>
        )}

        {currentTime >= 44.5 && (
          <h1
            style={{
              fontSize: 70,
              fontWeight: 900,
              color: "#FFE600",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 0 35px rgba(255,230,0,0.8)",
              textAlign: "center",
            }}
          >
            Is This Truly AGI?
          </h1>
        )}
      </div>

      {/* ============================================================ */}
      {/* 9. CLOSING REWARD / COMMENT CTA BADGE (44.5s – 48.7s)        */}
      {/* ============================================================ */}
      {currentTime >= 44.5 && (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 54,
            right: 54,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            zIndex: 35,
            opacity: interpolate(currentTime, [44.5, 45.0], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(10,14,24,0.94)",
              border: "2.5px solid #FFE600",
              borderRadius: 24,
              padding: "16px 36px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.95), 0 0 30px rgba(255,230,0,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 34 }}>👇</span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "0.02em",
              }}
            >
              COMMENT <span style={{ color: "#FFE600" }}>"AGI"</span> WITH YOUR THOUGHTS
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
