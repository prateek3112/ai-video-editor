import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";

// 1. Inter (Inter Black / Bold 900)
export const { fontFamily: interFont } = loadInter("normal", {
  weights: ["700", "800", "900"],
});

// 2. Apple Garamond Light Italic / Cormorant Garamond (Light / Medium Italic)
export const { fontFamily: garamondGoogleFont } = loadCormorant("italic", {
  weights: ["300", "400", "500", "600"],
});
export const appleGaramondFont = `'Apple Garamond', ${garamondGoogleFont}, 'EB Garamond', Garamond, Georgia, serif`;

// 3. Impact (Heavy Headline Punch)
export const impactFont = `'Impact', ${interFont}, sans-serif`;

/**
 * Solid, artifact-free text shadow outline that completely eliminates
 * the ugly internal contour lines and "markers" caused by -webkit-text-stroke.
 */
export const cleanOutlineShadow = `
  -2px -2px 0 #000000,
   2px -2px 0 #000000,
  -2px  2px 0 #000000,
   2px  2px 0 #000000,
  -3px  0px 0 #000000,
   3px  0px 0 #000000,
   0px -3px 0 #000000,
   0px  3px 0 #000000,
   0 12px 28px rgba(0, 0, 0, 0.95),
   0 4px 8px rgba(0, 0, 0, 0.85)
`;

/**
 * Calculates adaptive font size based on caption text length to ensure
 * text NEVER goes out of screen bounds on 1080x1920 canvas.
 */
export function getAdaptiveCaptionSize(text: string): number {
  const len = text.length;
  if (len > 32) return 36;
  if (len > 24) return 42;
  if (len > 18) return 46;
  if (len > 13) return 50;
  return 54; // Compact & safe on all screens
}
