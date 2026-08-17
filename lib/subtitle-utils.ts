import type { CaptionLanguage, CaptionScript, ExportFormat } from "./caption-config";

export interface SubtitleCaption {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  script?: CaptionScript;
}

export type ParsedSubtitleCaption = {
  text: string;
  start: number;
  end: number;
  confidence?: number;
  script?: CaptionScript;
};

const HINGLISH_DICTIONARY: Record<string, string> = {
  acha: "अच्छा",
  accha: "अच्छा",
  aisa: "ऐसा",
  apna: "अपना",
  bahut: "बहुत",
  bhai: "भाई",
  bilkul: "बिलकुल",
  bolo: "बोलो",
  kya: "क्या",
  kaise: "कैसे",
  kar: "कर",
  karna: "करना",
  karne: "करने",
  karunga: "करूंगा",
  kyun: "क्यों",
  kyuki: "क्योंकि",
  matlab: "मतलब",
  nahin: "नहीं",
  nahi: "नहीं",
  pakka: "पक्का",
  sach: "सच",
  shuru: "शुरू",
  tha: "था",
  the: "थे",
  thi: "थी",
  toh: "तो",
  yaar: "यार",
  ye: "ये",
};

const DIGRAPH_MAP: Array<[string, string]> = [
  ["ksh", "क्ष"],
  ["chh", "छ"],
  ["aa", "आ"],
  ["ii", "ई"],
  ["ee", "ई"],
  ["oo", "ऊ"],
  ["ai", "ऐ"],
  ["au", "औ"],
  ["kh", "ख"],
  ["gh", "घ"],
  ["ch", "च"],
  ["jh", "झ"],
  ["th", "थ"],
  ["dh", "ध"],
  ["ph", "फ"],
  ["bh", "भ"],
  ["sh", "श"],
  ["ng", "ङ"],
  ["ny", "ञ"],
];

const LETTER_MAP: Record<string, string> = {
  a: "अ",
  b: "ब",
  c: "क",
  d: "द",
  e: "ए",
  f: "फ",
  g: "ग",
  h: "ह",
  i: "इ",
  j: "ज",
  k: "क",
  l: "ल",
  m: "म",
  n: "न",
  o: "ओ",
  p: "प",
  q: "क",
  r: "र",
  s: "स",
  t: "त",
  u: "उ",
  v: "व",
  w: "व",
  x: "क्स",
  y: "य",
  z: "ज",
};

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .trim();
}

function transliterateToken(rawWord: string): string {
  const clean = normalizeWord(rawWord);
  if (!clean) return rawWord;

  const dictHit = HINGLISH_DICTIONARY[clean];
  if (dictHit) return dictHit;

  let cursor = 0;
  let output = "";
  while (cursor < clean.length) {
    const remaining = clean.slice(cursor);

    const digraph = DIGRAPH_MAP.find(([latin]) => remaining.startsWith(latin));
    if (digraph) {
      output += digraph[1];
      cursor += digraph[0].length;
      continue;
    }

    const char = remaining[0];
    output += LETTER_MAP[char] ?? char;
    cursor += 1;
  }

  return output || rawWord;
}

export function transliterateToDevanagari(text: string): string {
  return text.replace(/[A-Za-z]+/g, (token) => transliterateToken(token));
}

export function renderCaptionWord(
  word: string,
  language: CaptionLanguage,
  script: CaptionScript | undefined,
  fallbackScript: CaptionScript,
): string {
  const effectiveScript = script ?? fallbackScript;
  if (effectiveScript === "roman") return word;

  if (language === "english") return word;
  return transliterateToDevanagari(word);
}

function clampSeconds(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function formatTimeSrt(totalSeconds: number): string {
  const safe = clampSeconds(totalSeconds);
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  const millis = Math.round((safe - Math.floor(safe)) * 1000)
    .toString()
    .padStart(3, "0");

  return `${hours}:${minutes}:${seconds},${millis}`;
}

function formatTimeVtt(totalSeconds: number): string {
  const safe = clampSeconds(totalSeconds);
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  const millis = Math.round((safe - Math.floor(safe)) * 1000)
    .toString()
    .padStart(3, "0");

  return `${hours}:${minutes}:${seconds}.${millis}`;
}

function parseTimestamp(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  const parts = normalized.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return parts.length === 1 ? parts[0] : null;
}

/**
 * Parse creator-supplied SRT or WebVTT captions without guessing timings.
 * TXT is intentionally rejected because it contains no synchronization data.
 */
export function parseSubtitleText(input: string): ParsedSubtitleCaption[] {
  const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const withoutHeader = normalized.replace(/^WEBVTT(?:[^\n]*)\n+/i, "");
  const blocks = withoutHeader.split(/\n{2,}/);
  const captions: ParsedSubtitleCaption[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) continue;

    const [rawStart, rawEndWithSettings] = lines[timingIndex].split("-->");
    const rawEnd = rawEndWithSettings?.trim().split(/\s+/)[0];
    const start = parseTimestamp(rawStart ?? "");
    const end = parseTimestamp(rawEnd ?? "");
    const text = lines
      .slice(timingIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (start === null || end === null || end <= start || !text) continue;
    captions.push({ text, start: Number(start.toFixed(3)), end: Number(end.toFixed(3)), confidence: 1 });
  }

  return captions.sort((a, b) => a.start - b.start);
}

function normalizeCaptions(captions: SubtitleCaption[]): SubtitleCaption[] {
  return captions
    .map((caption) => ({
      ...caption,
      word: String(caption.word ?? "").trim(),
      start: clampSeconds(Number(caption.start)),
      end: clampSeconds(Number(caption.end)),
    }))
    .filter((caption) => caption.word.length > 0 && caption.end > caption.start)
    .sort((a, b) => a.start - b.start);
}

function toDisplayText(
  caption: SubtitleCaption,
  language: CaptionLanguage,
  fallbackScript: CaptionScript,
): string {
  return renderCaptionWord(caption.word, language, caption.script, fallbackScript);
}

export function serializeSubtitles(
  format: Exclude<ExportFormat, "mp4">,
  captions: SubtitleCaption[],
  language: CaptionLanguage,
  fallbackScript: CaptionScript,
): string {
  const normalized = normalizeCaptions(captions);

  if (format === "txt") {
    return normalized.map((caption) => toDisplayText(caption, language, fallbackScript)).join("\n");
  }

  if (format === "srt") {
    return normalized
      .map((caption, index) => {
        const text = toDisplayText(caption, language, fallbackScript);
        return `${index + 1}\n${formatTimeSrt(caption.start)} --> ${formatTimeSrt(caption.end)}\n${text}`;
      })
      .join("\n\n");
  }

  const cues = normalized
    .map((caption) => {
      const text = toDisplayText(caption, language, fallbackScript);
      return `${formatTimeVtt(caption.start)} --> ${formatTimeVtt(caption.end)}\n${text}`;
    })
    .join("\n\n");

  return `WEBVTT\n\n${cues}`;
}
