import React from "react";
import type { CrtBrand } from "../../../types/eight-bit-reel";

export const CrtBrandScreen: React.FC<{
  brand: CrtBrand;
  subtitle?: string;
}> = ({ brand, subtitle }) => {
  switch (brand) {
    case "anthropic":
      return (
        <g>
          {/* CRT Screen Background (Anthropic Dark Slate/Warm) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#1E1916" stroke="#D97757" strokeWidth="2" />
          {/* Anthropic Starburst Vector Icon */}
          <g transform="translate(0, -6) scale(0.65)">
            <path
              d="M 0 -28 L 6 -8 L 26 -6 L 10 6 L 16 26 L 0 12 L -16 26 L -10 6 L -26 -6 L -6 -8 Z"
              fill="#D97757"
              stroke="#FDBA74"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#FDBA74">
            {subtitle || "Claude 3.7 Sonnet"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#D97757" />
        </g>
      );

    case "openai":
      return (
        <g>
          {/* CRT Screen Background (OpenAI Dark Emerald) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#0A1E17" stroke="#10A37F" strokeWidth="2" />
          {/* OpenAI Rosetta Emblem */}
          <g transform="translate(0, -6) scale(0.55)">
            <circle cx="0" cy="0" r="28" fill="none" stroke="#10A37F" strokeWidth="3.5" />
            <circle cx="0" cy="0" r="14" fill="#10A37F" opacity="0.3" />
            <path d="M 0 -28 L 0 28 M -28 0 L 28 0 M -20 -20 L 20 20 M -20 20 L 20 -20" stroke="#10A37F" strokeWidth="2.5" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#34D399">
            {subtitle || "OpenAI o3 / 4.5"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#10B981" />
        </g>
      );

    case "deepseek":
      return (
        <g>
          {/* CRT Screen Background (DeepSeek Navy Cyan) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#08182B" stroke="#0066FF" strokeWidth="2" />
          {/* DeepSeek Whale Emblem */}
          <g transform="translate(0, -6) scale(0.6)">
            <path
              d="M -26 6 C -20 -14, 10 -22, 26 -6 C 28 8, 14 16, -2 18 C -14 20, -22 14, -26 6 Z"
              fill="#0066FF"
              stroke="#38BDF8"
              strokeWidth="2"
            />
            <circle cx="16" cy="-2" r="3" fill="#FFFFFF" />
            <path d="M -26 6 L -32 -2 L -30 12 Z" fill="#0066FF" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#38BDF8">
            {subtitle || "DeepSeek-R1"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#38BDF8" />
        </g>
      );

    case "google":
      return (
        <g>
          {/* CRT Screen Background (Google Blue) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#0F172A" stroke="#4285F4" strokeWidth="2" />
          {/* Gemini 4-Point Gradient Sparkle */}
          <g transform="translate(0, -6) scale(0.65)">
            <path d="M 0 -26 Q 0 0 26 0 Q 0 0 0 26 Q 0 0 -26 0 Q 0 0 0 -26 Z" fill="#4285F4" stroke="#93C5FD" strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill="#EA4335" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#93C5FD">
            {subtitle || "Gemini 2.5 Pro"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#4285F4" />
        </g>
      );

    case "cursor":
      return (
        <g>
          {/* CRT Screen Background (Dark Slate) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#090D16" stroke="#818CF8" strokeWidth="2" />
          {/* Cursor Pointer / Cube Emblem */}
          <g transform="translate(0, -6) scale(0.65)">
            <polygon points="-16,-22 16,0 -4,4 -10,18" fill="#6366F1" stroke="#A5B4FC" strokeWidth="2" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#A5B4FC">
            {subtitle || "Cursor Agent"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#818CF8" />
        </g>
      );

    case "github":
      return (
        <g>
          {/* CRT Screen Background (GitHub Dark) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#0D1117" stroke="#30363D" strokeWidth="2" />
          {/* Octocat Silhouette */}
          <g transform="translate(0, -6) scale(0.65)">
            <circle cx="0" cy="0" r="18" fill="#FFFFFF" />
            <polygon points="-14,-14 -10,-4 -6,-10" fill="#0D1117" />
            <polygon points="14,-14 10,-4 6,-10" fill="#0D1117" />
            <circle cx="-6" cy="2" r="3" fill="#0D1117" />
            <circle cx="6" cy="2" r="3" fill="#0D1117" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#E6EDF3">
            {subtitle || "GitHub Copilot"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#58A6FF" />
        </g>
      );

    case "apple":
      return (
        <g>
          {/* CRT Screen Background (Apple Clean Dark) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#18181B" stroke="#71717A" strokeWidth="2" />
          {/* Apple Logo Silhouette */}
          <g transform="translate(0, -6) scale(0.65)">
            <path
              d="M 0 -16 C 4 -22, 10 -20, 10 -20 C 10 -20, 12 -14, 8 -10 C 4 -6, 0 -8, 0 -16 Z M -12 -6 C -18 2, -14 16, -6 20 C -2 22, 4 22, 8 20 C 14 16, 18 4, 12 -4 C 8 -8, 0 -8, -6 -6 C -8 -6, -10 -6, -12 -6 Z"
              fill="#FFFFFF"
            />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#E4E4E7">
            {subtitle || "Apple Intelligence"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#A1A1AA" />
        </g>
      );

    case "huggingface":
      return (
        <g>
          {/* CRT Screen Background (HuggingFace Gold) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#201C08" stroke="#FFD21E" strokeWidth="2" />
          {/* Hugging Face Hug Emoji */}
          <g transform="translate(0, -6) scale(0.65)">
            <circle cx="0" cy="0" r="18" fill="#FFD21E" />
            <ellipse cx="-7" cy="-2" rx="2" ry="4" fill="#000000" />
            <ellipse cx="7" cy="-2" rx="2" ry="4" fill="#000000" />
            <path d="M -8 6 Q 0 14 8 6" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#FFD21E">
            {subtitle || "Hugging Face"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#FFD21E" />
        </g>
      );

    case "tencent":
    default:
      return (
        <g>
          {/* CRT Screen Background (Tencent Electric Blue) */}
          <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#0B1E3B" stroke="#0052D9" strokeWidth="2" />
          {/* Official Tencent Hexagon Emblem */}
          <g transform="translate(0, -6) scale(0.65)">
            <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="#0052D9" stroke="#38BDF8" strokeWidth="2" />
            <path d="M -16 -10 L 0 14 L 16 -10" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="0" y1="-10" x2="0" y2="14" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <text x="0" y="28" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="10" fill="#38BDF8">
            {subtitle || "Tencent HY4"}
          </text>
          <circle cx="48" cy="48" r="3" fill="#10B981" />
        </g>
      );
  }
};
