import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * 5-Bar Bouncing Audio Waveform Equalizer
 * Placed in the top navigation bar to indicate live AI audio processing.
 */
export const AudioEqualizerNav: React.FC<{
  color?: string;
  height?: number;
}> = ({ color = "#2563EB", height = 18 }) => {
  const frame = useCurrentFrame();

  // Pseudo-random frequencies simulating audio speech waveform
  const barHeights = [
    Math.sin(frame * 0.45) * 0.4 + 0.6,
    Math.sin(frame * 0.7 + 1.2) * 0.45 + 0.55,
    Math.sin(frame * 0.9 + 2.5) * 0.5 + 0.5,
    Math.sin(frame * 0.6 + 0.8) * 0.4 + 0.6,
    Math.sin(frame * 0.5 + 3.1) * 0.35 + 0.65,
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        height,
        padding: "0 6px",
      }}
    >
      {barHeights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: Math.max(4, h * height),
            backgroundColor: color,
            borderRadius: 2,
            transition: "height 0.05s ease-out",
          }}
        />
      ))}
    </div>
  );
};
