import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Animated hand-drawn SVG Red Marker Loop
 * Surrounds a key stat or phrase with an imperfect, wobbly red marker circle.
 */
export const MarkerLoop: React.FC<{
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  delayFrames?: number;
}> = ({
  width = 240,
  height = 70,
  strokeColor = "#EF4444",
  strokeWidth = 3.5,
  delayFrames = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const anim = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Perimeter approx for ellipse: 2 * pi * sqrt((a^2 + b^2)/2)
  const a = width / 2;
  const b = height / 2;
  const perimeter = 2 * Math.PI * Math.sqrt((a * a + b * b) / 2);
  const strokeDashoffset = interpolate(anim, [0, 1], [perimeter, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(anim, [0, 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Imperfect hand-drawn wobbly path coordinates
  const cx = width / 2;
  const cy = height / 2;
  const rx = (width - 12) / 2;
  const ry = (height - 10) / 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-1.5deg)",
        pointerEvents: "none",
        zIndex: 10,
        opacity,
      }}
    >
      {/* Hand-drawn wobbly bezier loop */}
      <path
        d={`
          M ${cx - rx + 4} ${cy + 2}
          C ${cx - rx - 2} ${cy - ry + 4}, ${cx - 10} ${cy - ry - 2}, ${cx + rx - 8} ${cy - ry + 6}
          C ${cx + rx + 6} ${cy - 4}, ${cx + rx + 2} ${cy + ry - 4}, ${cx + 12} ${cy + ry + 2}
          C ${cx - rx + 14} ${cy + ry + 4}, ${cx - rx - 4} ${cy + 10}, ${cx - rx + 18} ${cy - ry + 12}
        `}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={perimeter}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};

/**
 * Animated hand-drawn SVG Red Marker Underline
 */
export const MarkerUnderline: React.FC<{
  width?: number;
  strokeColor?: string;
  strokeWidth?: number;
  delayFrames?: number;
}> = ({
  width = 200,
  strokeColor = "#EF4444",
  strokeWidth = 3.5,
  delayFrames = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const anim = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const pathLength = width + 30;
  const strokeDashoffset = interpolate(anim, [0, 1], [pathLength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(anim, [0, 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width={width}
      height={18}
      viewBox={`0 0 ${width} 18`}
      style={{
        position: "absolute",
        bottom: -8,
        left: 0,
        pointerEvents: "none",
        zIndex: 5,
        opacity,
      }}
    >
      <path
        d={`M 2 12 Q ${width * 0.3} 16, ${width * 0.6} 10 T ${width - 4} 13`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};
