import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * Live CRT Screen with Typing Terminal & Scanlines
 * Displays authentic retro bash execution inside the CRT monitor.
 */
export const CrtLiveTerminal: React.FC<{
  brandColor?: string;
  terminalText?: string;
}> = ({ brandColor = "#4285F4", terminalText }) => {
  const frame = useCurrentFrame();

  // Typewriter effect
  const fullText = terminalText || "$ gemini transcribe --smart\n> IN: 'Tuesday... Wednesday'\n> FIX: 'Wednesday' [100%]\n> STATUS: STREAMING LIVE";
  const charsShown = Math.min(fullText.length, Math.floor(frame * 1.8));
  const currentText = fullText.slice(0, charsShown);

  // Blinking cursor
  const showCursor = Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0B1120",
        borderRadius: 8,
        padding: "12px 14px",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 12.5,
        color: "#60A5FA",
        lineHeight: 1.45,
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 0 16px rgba(0,0,0,0.8)",
      }}
    >
      {/* Phosphor Scanline Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.25) 0px, rgba(0, 0, 0, 0.25) 1px, transparent 1px, transparent 2px)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Terminal Content */}
      <div style={{ position: "relative", zIndex: 2, whiteSpace: "pre-wrap" }}>
        {currentText}
        {showCursor && <span style={{ color: "#38BDF8", fontWeight: 900 }}>█</span>}
      </div>

      {/* Retro CRT Vignette / Corner Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 20px ${brandColor}40`,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
    </div>
  );
};
