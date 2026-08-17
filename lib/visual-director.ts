import type { ByobConfig } from "./byob-client";
import { getBrandTheme } from "./brand-themes";
import { generateStructuredJson } from "./structured-ai";
import {
  createScriptVisualScenes,
  type ScriptVisualScene,
  type VisualLayout,
  type VisualType,
} from "./script-visuals";

type TimedCaption = { text: string; start: number; end: number };

const LAYOUTS = new Set<VisualLayout>(["speaker", "split", "full-visual", "overlay"]);
const VISUAL_TYPES = new Set<VisualType>(["kinetic-type", "stat", "list", "comparison", "diagram", "meme", "b-roll"]);
const MOTIFS = new Set<ScriptVisualScene["motif"]>(["growth", "idea", "money", "warning", "tech", "people", "rocket", "brain", "fire", "trophy", "chart", "shield", "default"]);

function englishCopy(value: unknown, fallback: string, maxLength: number): string {
  const clean = String(value ?? "")
    .replace(/[^A-Za-z0-9$%+&.,!?':()\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return /[A-Za-z]/.test(clean) ? clean : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function resolvePexelsVideo(query: string, apiKey: string): Promise<Pick<ScriptVisualScene, "mediaUrl" | "mediaType" | "mediaCredit"> | null> {
  const url = new URL("https://api.pexels.com/v1/videos/search");
  url.searchParams.set("query", query.slice(0, 80));
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("size", "medium");
  url.searchParams.set("per_page", "3");

  const response = await fetch(url, { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) return null;

  const body = (await response.json()) as {
    videos?: Array<{
      user?: { name?: string; url?: string };
      video_files?: Array<{ link?: string; width?: number; height?: number; file_type?: string; quality?: string }>;
    }>;
  };
  const video = body.videos?.[0];
  if (!video) return null;
  const files = (video.video_files ?? [])
    .filter((file) => file.link?.startsWith("https://") && file.file_type === "video/mp4")
    .sort((a, b) => {
      const aPortrait = Number((a.height ?? 0) >= (a.width ?? 0));
      const bPortrait = Number((b.height ?? 0) >= (b.width ?? 0));
      return bPortrait - aPortrait || (b.height ?? 0) - (a.height ?? 0);
    });
  const selected = files.find((file) => (file.height ?? 0) <= 1920) ?? files[0];
  if (!selected?.link) return null;
  return {
    mediaUrl: selected.link,
    mediaType: "video",
    mediaCredit: video.user?.name ? `Pexels · ${video.user.name}` : "Pexels",
  };
}

export async function directVisualScenes(input: {
  captions: TimedCaption[];
  duration: number;
  config: ByobConfig;
  brandThemeId?: string;
}): Promise<ScriptVisualScene[]> {
  const fallback = createScriptVisualScenes(input.captions, input.duration, input.brandThemeId);
  if (!fallback.length) return [];
  const brand = getBrandTheme(input.brandThemeId);
  let planned = fallback;

  if (input.config.provider !== "local-whisper") {
    try {
      const transcript = input.captions.map((caption) => `[${caption.start.toFixed(2)}-${caption.end.toFixed(2)}] ${caption.text}`).join(" ");
      const windows = fallback.map((scene) => ({ id: scene.id, start: scene.start, end: scene.end, defaultLayout: scene.layout }));
      const result = await generateStructuredJson<{ scenes?: Array<Record<string, unknown>> }>(
        input.config,
        `You are a senior short-form video editor. Direct high-retention visual scenes for this transcript.
Transcript: ${transcript}
Locked timing windows: ${JSON.stringify(windows)}
Brand: ${brand.name}; background ${brand.background}; accent ${brand.accent}; secondary ${brand.secondary}.

Return JSON only: {"scenes":[{"id":"visual-0001","layout":"overlay|split|full-visual|speaker","visualType":"kinetic-type|stat|list|comparison|diagram|meme|b-roll","motif":"growth|idea|money|warning|tech|people|rocket|brain|fire|trophy|chart|shield|default","eyebrow":"ENGLISH","title":"ENGLISH","subtitle":"ENGLISH","callout":"ENGLISH optional","searchQuery":"plain English stock-video query","zoomTimings":[0.0]}]}.

Rules:
- Return exactly one scene for every locked timing window, using the same id and order.
- All on-screen visual copy MUST be natural English even when speech is Hindi or Hinglish.
- Alternate speaker, overlay, split and full-visual shots; never hide the speaker for more than two consecutive windows. Use your understanding of the content to pick the best layout.
- Use b-roll only when a literal real-world shot improves the story. Use meme for funny/reaction beats.
- Titles: 2-6 words. Eyebrows: 1-4 words. Make them engaging, funnier, and contextual. No generic filler. No URLs.
- zoomTimings: suggest an array of timestamps (within the scene) for camera punch-ins on high-energy or emphasis moments. Keep empty if not needed.
- Extract clear keywords for emphasis highlighting if applicable.`,
      );
      const candidates = Array.isArray(result.scenes) ? result.scenes : [];
      planned = fallback.map((base, index) => {
        const candidate = candidates[index] ?? {};
        const layout = LAYOUTS.has(candidate.layout as VisualLayout) ? (candidate.layout as VisualLayout) : base.layout;
        const visualType = VISUAL_TYPES.has(candidate.visualType as VisualType) ? (candidate.visualType as VisualType) : base.visualType;
        const motif = MOTIFS.has(candidate.motif as ScriptVisualScene["motif"]) ? (candidate.motif as ScriptVisualScene["motif"]) : base.motif;
        const zoomTimings = Array.isArray(candidate.zoomTimings) ? candidate.zoomTimings.map(Number).filter((n) => !isNaN(n)) : base.zoomTimings;
        return {
          ...base,
          layout,
          visualType,
          motif,
          eyebrow: englishCopy(candidate.eyebrow, base.eyebrow, 36).toUpperCase(),
          title: englishCopy(candidate.title, base.title, 76),
          subtitle: englishCopy(candidate.subtitle, base.subtitle, 120),
          callout: candidate.callout ? englishCopy(candidate.callout, base.callout ?? "WATCH THIS", 48).toUpperCase() : base.callout,
          searchQuery: englishCopy(candidate.searchQuery, base.keywords.join(" ") || base.title, 80),
          palette: { background: brand.background, accent: brand.accent, secondary: brand.secondary },
          start: clamp(base.start, 0, input.duration),
          end: clamp(base.end, base.start + 0.1, input.duration),
          zoomTimings: zoomTimings,
        };
      });
    } catch (error) {
      console.warn("AI visual direction unavailable; using deterministic brand-safe scenes", error);
    }
  }

  if (!input.config.pexelsApiKey) return planned;
  let resolved = 0;
  return Promise.all(
    planned.map(async (scene) => {
      const wantsBroll = scene.visualType === "b-roll" || scene.layout === "split";
      if (!wantsBroll || resolved >= 3) return scene;
      resolved += 1;
      try {
        const media = await resolvePexelsVideo(scene.searchQuery ?? scene.keywords.join(" ") ?? scene.title, input.config.pexelsApiKey!);
        return media ? { ...scene, ...media } : scene;
      } catch {
        return scene;
      }
    }),
  );
}

