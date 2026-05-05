import ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { GoogleGenAI } from '@google/genai';
import {
  type CaptionLanguage,
  DEFAULT_CAPTION_SETTINGS,
  type CaptionAnimation,
  type CaptionCapitalization,
  type CaptionScript,
  type CaptionSettings,
  type ExportQuality,
  type MotionPreset,
  QUALITY_CONFIG,
  type VideoEffect,
} from './caption-config';
import { getProjectById } from './local-store';
import { renderCaptionWord } from './subtitle-utils';
import { createScriptVisualScenes, type ScriptVisualScene } from './script-visuals';

let ffmpegConfigured = false;

function ensureFfmpegPath(): void {
  if (ffmpegConfigured) return;
  ffmpegConfigured = true;

  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    return;
  }

  const localStaticPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
  if (fs.existsSync(localStaticPath)) {
    ffmpeg.setFfmpegPath(localStaticPath);
    return;
  }

  // Fallback to system ffmpeg on PATH.
}

type CaptionToken = {
  text: string;
  start: number;
  end: number;
  confidence?: number;
  script?: CaptionScript;
  highlightWords?: string[];
  positionX?: number;
  positionY?: number;
};

type GeminiTranscriptionResult = {
  language?: CaptionLanguage;
  words?: Array<{ word?: string; start?: number; end?: number; confidence?: number }>;
  segments?: Array<{ start: number; end: number; text: string }>;
};

type GeminiWordToken = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  script: CaptionScript;
};

const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const geminiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

const HINGLISH_WORD_MAP: Record<string, string> = {
  this: 'ye',
  clip: 'clip',
  is: 'hai',
  ready: 'ready',
  for: 'ke liye',
  captions: 'captions',
};

function localizeWord(word: string, language: CaptionLanguage): string {
  if (language === 'english') return word;
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return HINGLISH_WORD_MAP[clean] ?? word;
}

function toFfmpegColor(input: string): string {
  const value = input.trim();
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      return `0x${hex
        .split('')
        .map((c) => `${c}${c}`)
        .join('')}`;
    }
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return `0x${hex}`;
    }
  }

  return value;
}

function escapeDrawText(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/,/g, '\\,')
    .replace(/%/g, '\\%')
    .replace(/\n/g, '\\n')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function wrapCaptionText(input: string, maxWordsPerLine: number, maxLines: number): string {
  void maxLines;
  const words = input.split(/\s+/).filter(Boolean);
  if (!words.length) return '';

  const lines: string[] = [];
  for (let index = 0; index < words.length; index += maxWordsPerLine) {
    lines.push(words.slice(index, index + maxWordsPerLine).join(' '));
  }

  return lines.join('\n');
}

function resolveLocalInputPath(videoUrl: string): string | null {
  if (!videoUrl || videoUrl.startsWith('http')) return null;

  if (path.isAbsolute(videoUrl) && fs.existsSync(videoUrl)) {
    return videoUrl;
  }

  const normalized = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl;
  const publicPath = path.join(process.cwd(), 'public', normalized);
  if (fs.existsSync(publicPath)) return publicPath;

  return null;
}

function resolveProjectInputPath(project: { sourceVideoUrl?: string; videoUrl: string }): string | null {
  const preferred = resolveLocalInputPath(project.sourceVideoUrl ?? '');
  if (preferred) return preferred;

  return resolveLocalInputPath(project.videoUrl);
}

async function extractAudioForTranscription(inputPath: string): Promise<string> {
  ensureFfmpegPath();
  const audioPath = path.join(os.tmpdir(), `transcribe-${Date.now()}.mp3`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('64k')
      .audioChannels(1)
      .audioFrequency(16000)
      .output(audioPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
  return audioPath;
}

function toWordTokens(
  segments: Array<{ start: number; end: number; text: string; confidence?: number }>,
  script: CaptionScript = 'roman',
): CaptionToken[] {
  const output: CaptionToken[] = [];

  for (const segment of segments) {
    const words = segment.text.split(/\s+/).filter(Boolean);
    if (!words.length) continue;

    const wordDuration = Math.max(0.08, (segment.end - segment.start) / words.length);
    const segmentConfidence = Number.isFinite(segment.confidence) ? Number(segment.confidence) : 0.82;
    words.forEach((word, index) => {
      const start = Number((segment.start + index * wordDuration).toFixed(2));
      const end = Number((start + wordDuration - 0.02).toFixed(2));
      output.push({ text: word, start, end, confidence: segmentConfidence, script });
    });
  }

  return output;
}

function clampConfidence(value: unknown): number | undefined {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.min(1, Math.max(0, Number(numeric.toFixed(3))));
}

function normalizeLanguage(value: unknown): CaptionLanguage {
  if (value === 'english' || value === 'hinglish' || value === 'hindi') {
    return value;
  }

  return 'hinglish';
}

function createDeterministicFallback(duration: number): Array<{ word: string; start: number; end: number; confidence: number; script: CaptionScript }> {
  const phrase = ['This', 'clip', 'is', 'ready', 'for', 'captions'];
  const safeDuration = Math.max(6, Number.isFinite(duration) ? duration : 12);
  const slot = Math.max(0.7, safeDuration / phrase.length);

  return phrase.map((word, index) => {
    const start = Number((index * slot).toFixed(2));
    const end = Number(Math.min(safeDuration, start + slot - 0.06).toFixed(2));
    return {
      word,
      start,
      end,
      confidence: 0.42,
      script: 'roman',
    };
  });
}

function isRetryableGeminiError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybe = error as { status?: number; message?: string };
  if (maybe.status === 429 || maybe.status === 500 || maybe.status === 503) return true;

  const message = String(maybe.message ?? '').toLowerCase();
  return (
    message.includes('rate') ||
    message.includes('quota') ||
    message.includes('unavailable') ||
    message.includes('high demand')
  );
}

function normalizeJsonText(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith('```')) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestGeminiSegments(
  audioBase64: string,
  duration: number,
): Promise<GeminiTranscriptionResult> {
  if (!geminiClient) throw new Error('Gemini API key not configured');

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const failures: string[] = [];

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await geminiClient.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Transcribe this audio and return JSON only with the shape:
{
  "language": "english" | "hinglish" | "hindi",
  "words": [{ "word": string, "start": number, "end": number, "confidence": number }],
  "segments": [{ "start": number, "end": number, "text": string }]
}
Rules:
- Use seconds for timestamps.
- Keep each segment short (2-6 words) if segments are present.
- Always include word-level timestamps in "words".
- Preserve Romanized Hindi words exactly as spoken when language is hinglish.
- confidence must be between 0 and 1.
- Ensure timestamps are chronological and within 0 to ${Math.max(1, Math.round(duration))}.`,
                },
                {
                  inlineData: {
                    mimeType: 'audio/mpeg',
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const raw = normalizeJsonText(response.text ?? '{}');
        return JSON.parse(raw) as GeminiTranscriptionResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        failures.push(`${model} attempt ${attempt}: ${errorMessage}`);

        if (attempt < 3 && isRetryableGeminiError(error)) {
          await wait(attempt * 800);
          continue;
        }

        break;
      }
    }
  }

  throw new Error(`Gemini transcription unavailable. ${failures[failures.length - 1] ?? 'No response'}`);
}

async function transcribeWithGemini(
  inputPath: string,
  duration: number,
): Promise<Array<{ word: string; start: number; end: number; confidence?: number; script?: CaptionScript }>> {
  if (!geminiClient) throw new Error('Gemini API key not configured');

  const audioPath = await extractAudioForTranscription(inputPath);
  const audioBuffer = await fsp.readFile(audioPath);
  await fsp.unlink(audioPath).catch(() => undefined);

  const audioBase64 = audioBuffer.toString('base64');
  const parsed = await requestGeminiSegments(audioBase64, duration);

  const mappedWords: Array<GeminiWordToken | null> = Array.isArray(parsed.words)
    ? parsed.words.map((entry) => {
        const word = String(entry.word ?? '').trim();
        const start = Number(entry.start);
        const end = Number(entry.end);

        if (!word || !Number.isFinite(start) || !Number.isFinite(end)) {
          return null;
        }

        const safeStart = Math.max(0, Number(start.toFixed(2)));
        const safeEnd = Math.max(Number((safeStart + 0.05).toFixed(2)), Number(end.toFixed(2)));

        return {
          word,
          start: safeStart,
          end: safeEnd,
          confidence: clampConfidence(entry.confidence),
          script: 'roman' as CaptionScript,
        };
      })
    : [];

  const words: GeminiWordToken[] = [];
  for (const token of mappedWords) {
    if (!token) continue;
    words.push(token);
  }

  words.sort((a, b) => a.start - b.start);

  if (words.length) {
    return words;
  }

  const segments = Array.isArray(parsed.segments) ? parsed.segments : [];
  const cleaned = segments
    .map((segment) => ({
      start: Number(segment.start),
      end: Number(segment.end),
      text: String(segment.text ?? '').trim(),
      confidence: 0.82,
    }))
    .filter((segment) => Number.isFinite(segment.start) && Number.isFinite(segment.end) && segment.text.length > 0)
    .sort((a, b) => a.start - b.start)
    .map((segment) => ({
      ...segment,
      start: Math.max(0, Number(segment.start.toFixed(2))),
      end: Math.max(Number((segment.start + 0.05).toFixed(2)), Number(segment.end.toFixed(2))),
    }));

  const tokens = toWordTokens(cleaned, 'roman');
  if (!tokens.length) {
    throw new Error('Gemini returned no usable transcription segments');
  }

  return tokens.map((token) => ({
    word: token.text,
    start: token.start,
    end: token.end,
    confidence: token.confidence,
    script: token.script,
  }));
}

export async function processTranscription(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  const inputPath = resolveProjectInputPath(project);
  if (!inputPath) {
    throw new Error('Local video file not found for transcription');
  }

  if (!geminiClient) {
    return createDeterministicFallback(project.duration);
  }

  try {
    return await transcribeWithGemini(inputPath, project.duration);
  } catch (error) {
    console.error('Gemini transcription failed, falling back to deterministic captions', error);
    return createDeterministicFallback(project.duration);
  }
}

function resolvePosition(settings: CaptionSettings, override?: { positionX?: number; positionY?: number }): { x: number; y: number } {
  const fallbackY = settings.layout === 'top' ? 0.18 : settings.layout === 'center' ? 0.5 : 0.82;
  const x = Number.isFinite(override?.positionX) ? override?.positionX : settings.positionX;
  const y = Number.isFinite(override?.positionY) ? override?.positionY : settings.positionY;

  return {
    x: Math.min(0.95, Math.max(0.05, Number.isFinite(x) ? Number(x) : 0.5)),
    y: Math.min(0.95, Math.max(0.05, Number.isFinite(y) ? Number(y) : fallbackY)),
  };
}

function applyCapitalization(text: string, mode: CaptionCapitalization): string {
  if (mode === 'uppercase') return text.toUpperCase();

  if (mode === 'title') {
    return text.replace(/\w\S*/g, (part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`);
  }

  return text;
}

function alphaExpression(settings: CaptionSettings, start: number, end: number): string {
  const alpha = Number.isFinite(settings.textOpacity) ? settings.textOpacity : 1;
  const base = Math.min(1, Math.max(0.05, alpha)).toFixed(3);

  if (settings.animation !== 'fade' && settings.transition !== 'smooth') {
    return base;
  }

  const fadeWindow = settings.transition === 'snappy' ? 0.08 : 0.18;
  const fadeInEnd = Number((start + fadeWindow).toFixed(2));
  const fadeOutStart = Number(Math.max(start, end - fadeWindow).toFixed(2));

  return `if(lt(t\\,${fadeInEnd})\\,${base}*(t-${start.toFixed(2)})/${fadeWindow.toFixed(2)}\\,if(gt(t\\,${fadeOutStart})\\,${base}*(${end.toFixed(2)}-t)/${fadeWindow.toFixed(2)}\\,${base}))`;
}

function createAnimatedEvents(captions: CaptionToken[], animation: CaptionAnimation): CaptionToken[] {
  if (animation !== 'typewriter') return captions;

  return captions.map((caption, index) => {
    const from = Math.max(0, index - 4);
    const typedText = captions.slice(from, index + 1).map((token) => token.text).join(' ');
    return {
      text: typedText,
      start: caption.start,
      end: caption.end,
    };
  });
}

function paginateCaptionEvents(captions: CaptionToken[], settings: CaptionSettings): CaptionToken[] {
  const maxWordsPerLine = Math.max(1, Math.round(settings.maxWordsPerLine || 4));
  const maxLines = Math.max(1, Math.round(settings.maxLines || 3));
  const pageSize = Math.max(1, maxWordsPerLine * maxLines);
  const events: CaptionToken[] = [];

  for (const caption of captions) {
    const words = caption.text.split(/\s+/).filter(Boolean);
    if (words.length <= pageSize) {
      events.push(caption);
      continue;
    }

    const duration = Math.max(0.05, caption.end - caption.start);
    const wordDuration = duration / words.length;

    for (let index = 0; index < words.length; index += pageSize) {
      const pageWords = words.slice(index, index + pageSize);
      const start = Number((caption.start + index * wordDuration).toFixed(2));
      const end = Number(
        Math.min(caption.end, caption.start + (index + pageWords.length) * wordDuration).toFixed(2),
      );

      events.push({
        ...caption,
        text: pageWords.join(' '),
        start,
        end: Math.max(Number((start + 0.05).toFixed(2)), end),
      });
    }
  }

  return events;
}

function applyLanguageToCaptions(
  captions: CaptionToken[],
  language: CaptionLanguage,
  fallbackScript: CaptionScript,
): CaptionToken[] {
  const normalizedLanguage = normalizeLanguage(language);

  return captions.map((caption) => {
    const localizedWords = caption.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const localizedWord = localizeWord(word, normalizedLanguage);
        return renderCaptionWord(localizedWord, normalizedLanguage, caption.script, fallbackScript);
      });

    return {
      ...caption,
      text: localizedWords.join(' '),
    };
  });
}

function groupCaptionsForRender(captions: CaptionToken[], settings: CaptionSettings): CaptionToken[] {
  if (!captions.length) return [];

  const keepWordLevel =
    settings.animation === 'karaoke' || settings.animation === 'word-pop' || settings.animation === 'typewriter';
  if (keepWordLevel) return captions;

  const hasPhraseCaptions = captions.some((caption) => caption.text.trim().includes(' '));
  if (hasPhraseCaptions) return captions;

  const maxWordsPerLine = Math.max(1, Math.round(settings.maxWordsPerLine || 4));
  const grouped: CaptionToken[] = [];
  let bucket: CaptionToken[] = [];

  const flush = () => {
    if (!bucket.length) return;

    const confidenceValues = bucket
      .map((caption) => caption.confidence)
      .filter((value): value is number => Number.isFinite(value));
    const avgConfidence = confidenceValues.length
      ? Number((confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length).toFixed(3))
      : undefined;

    grouped.push({
      text: bucket.map((caption) => caption.text).join(' '),
      start: bucket[0].start,
      end: bucket[bucket.length - 1].end,
      confidence: avgConfidence,
      script: bucket.find((caption) => caption.script)?.script,
      highlightWords: bucket.flatMap((caption) => caption.highlightWords ?? []),
    });

    bucket = [];
  };

  for (const caption of captions) {
    if (!bucket.length) {
      bucket.push(caption);
      continue;
    }

    const previous = bucket[bucket.length - 1];
    const nextDuration = caption.end - bucket[0].start;
    const gap = caption.start - previous.end;

    if (bucket.length >= maxWordsPerLine * 2 || nextDuration > 2.8 || gap > 0.4) {
      flush();
    }

    bucket.push(caption);
  }

  flush();
  return grouped;
}

function createDrawTextFilters(captions: CaptionToken[], settings: CaptionSettings, quality: ExportQuality): string[] {
  const fontScale = Math.min(2.4, Math.max(0.1, settings.fontScale || 1));
  const baseFontSize = quality === '4k' ? 92 : quality === '1080p' ? 52 : 40;
  const animationSpeed = Math.max(0.6, Math.min(2.2, settings.animationSpeed || 1));
  const fontSize = Math.round(baseFontSize * fontScale);
  const bounceAmplitude = (quality === '4k' ? 24 : 14) * animationSpeed;
  const maxWordsPerLine = Math.max(1, Math.round(settings.maxWordsPerLine || 4));
  const maxLines = Math.max(1, Math.round(settings.maxLines || 3));
  const textColor = toFfmpegColor(settings.textColor);
  const emphasisColor = toFfmpegColor(settings.activeWordColor || settings.emphasisColor);
  const backgroundColor = toFfmpegColor(settings.backgroundColor);
  const activeBackgroundColor = toFfmpegColor(settings.activeWordBackground || settings.backgroundColor);
  const lineSpacing = Math.round(Math.max(0, settings.lineHeight - 1) * fontSize * 0.35);
  const events = createAnimatedEvents(paginateCaptionEvents(captions, settings), settings.animation);

  return events.map((caption) => {
    const position = resolvePosition(settings);
    const xExpr = `(w*${position.x.toFixed(4)})-(text_w/2)`;
    const baseY = `h*${position.y.toFixed(4)}`;
    const transformed = applyCapitalization(caption.text, settings.capitalization);
    const wrappedText = wrapCaptionText(transformed, maxWordsPerLine, maxLines);
    const effect = settings.effectPreset ?? 'shadow';
    let xAnimatedExpr = xExpr;
    let yExpr = baseY;

    if (settings.animation === 'bounce') {
      yExpr = `(${baseY})-abs(sin((t-${caption.start.toFixed(2)})*${(9 * animationSpeed).toFixed(2)}))*${bounceAmplitude}`;
    } else if (settings.animation === 'flicker') {
      xAnimatedExpr = `(${xExpr})+if(gt(sin((t-${caption.start.toFixed(2)})*${(58 * animationSpeed).toFixed(2)}),0.72),${quality === '4k' ? 6 : 3},0)`;
    } else if (settings.animation === 'slide-up') {
      yExpr = `(${baseY})+max(0\\,1-((t-${caption.start.toFixed(2)})/${(0.26 / animationSpeed).toFixed(2)}))*${quality === '4k' ? 72 : 38}`;
    } else if (settings.animation === 'shake') {
      xAnimatedExpr = `(${xExpr})+sin((t-${caption.start.toFixed(2)})*${(42 * animationSpeed).toFixed(2)})*${quality === '4k' ? 10 : 5}`;
    } else if (settings.animation === 'pulse' || settings.animation === 'zoom') {
      yExpr = `(${baseY})-abs(sin((t-${caption.start.toFixed(2)})*${(5 * animationSpeed).toFixed(2)}))*${quality === '4k' ? 10 : 5}`;
    }

    const hasKeywordHighlight = (caption.highlightWords ?? []).some((keyword) => {
      const normalizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedWords = caption.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      return normalizedKeyword.length > 0 && normalizedWords.includes(normalizedKeyword);
    });
    const useActiveColor =
      hasKeywordHighlight ||
      settings.highlightEnabled ||
      settings.animation === 'karaoke' ||
      settings.animation === 'word-pop' ||
      settings.animation === 'typewriter';
    const chosenColor = useActiveColor ? emphasisColor : textColor;
    let shadowColor = `black@${Math.max(0.15, settings.shadowStrength).toFixed(2)}`;
    let shadowX = Math.max(1, Math.round(settings.shadowStrength * 4));
    let shadowY = Math.max(1, Math.round(settings.shadowStrength * 5));
    let borderW = 0;
    let borderColor = 'black@0';

    borderW = Math.max(0, Number.isFinite(settings.strokeWidth) ? settings.strokeWidth : 0);
    borderColor = `${toFfmpegColor(settings.strokeColor)}@0.92`;

    if (effect === 'none') {
      shadowColor = 'black@0';
      shadowX = 0;
      shadowY = 0;
    } else if (effect === 'outline') {
      borderW = Math.max(borderW, quality === '4k' ? 5 : 3);
      shadowColor = 'black@0.25';
      shadowX = 1;
      shadowY = 1;
    } else if (effect === 'glow') {
      borderW = Math.max(borderW, quality === '4k' ? 2 : 1);
      borderColor = `${emphasisColor}@0.35`;
      shadowColor = `${emphasisColor}@0.95`;
      shadowX = quality === '4k' ? 2 : 1;
      shadowY = quality === '4k' ? 2 : 1;
    } else if (effect === 'sticker') {
      borderW = Math.max(borderW, quality === '4k' ? 8 : 4);
      borderColor = `${toFfmpegColor(settings.strokeColor || '#000000')}@0.98`;
      shadowColor = 'black@0.45';
      shadowX = quality === '4k' ? 5 : 3;
      shadowY = quality === '4k' ? 6 : 4;
    }

    const useGlass = effect === 'glass';
    const useSticker = effect === 'sticker';
    const useBox = useGlass || useSticker || settings.highlightEnabled || settings.backgroundOpacity > 0.01;
    const boxColor = settings.highlightEnabled ? activeBackgroundColor : backgroundColor;
    const boxOpacity =
      settings.highlightEnabled
        ? Math.min(1, Math.max(0, settings.activeWordBackgroundOpacity))
        : useGlass
          ? 0.28
          : useSticker
            ? 0.08
          : Math.min(1, Math.max(0, settings.backgroundOpacity));
    const boxBorder = useGlass ? (quality === '4k' ? 20 : 12) : useSticker ? (quality === '4k' ? 16 : 9) : quality === '4k' ? 24 : 14;
    const textOpacity = Math.min(1, Math.max(0.05, settings.textOpacity));

    return [
      `drawtext=text='${escapeDrawText(wrappedText)}'`,
      `fontcolor=${chosenColor}@${textOpacity.toFixed(2)}`,
      `fontsize=${fontSize}`,
      `x=${xAnimatedExpr}`,
      `y=${yExpr}`,
      `line_spacing=${lineSpacing}`,
      `alpha=${alphaExpression(settings, caption.start, caption.end)}`,
      `borderw=${borderW}`,
      `bordercolor=${borderColor}`,
      `shadowcolor=${shadowColor}`,
      `shadowx=${shadowX}`,
      `shadowy=${shadowY}`,
      useBox ? `box=1:boxcolor=${boxColor}@${boxOpacity.toFixed(2)}:boxborderw=${boxBorder}` : 'box=0',
      `enable='between(t\\,${caption.start.toFixed(2)}\\,${caption.end.toFixed(2)})'`,
    ].join(':');
  });
}

function ffmpegEnableBetween(start: number, end: number): string {
  return `enable='between(t\\,${start.toFixed(2)}\\,${end.toFixed(2)})'`;
}

function hexToFfmpegRgb(hex: string): string {
  return toFfmpegColor(hex || '#111827');
}

function motifShapeFilter(scene: ScriptVisualScene, width: number, height: number): string {
  const accent = hexToFfmpegRgb(scene.palette.accent);
  const secondary = hexToFfmpegRgb(scene.palette.secondary);
  const start = scene.start;
  const end = scene.end;
  const enable = ffmpegEnableBetween(start, end);

  if (scene.motif === 'growth') {
    return [
      `drawbox=x=${Math.round(width * 0.18)}:y=${Math.round(height * 0.7)}:w=${Math.round(width * 0.11)}:h=${Math.round(height * 0.13)}:color=${secondary}@0.72:t=fill:${enable}`,
      `drawbox=x=${Math.round(width * 0.33)}:y=${Math.round(height * 0.56)}:w=${Math.round(width * 0.11)}:h=${Math.round(height * 0.27)}:color=${accent}@0.82:t=fill:${enable}`,
      `drawbox=x=${Math.round(width * 0.48)}:y=${Math.round(height * 0.39)}:w=${Math.round(width * 0.11)}:h=${Math.round(height * 0.44)}:color=${secondary}@0.72:t=fill:${enable}`,
      `drawbox=x=${Math.round(width * 0.63)}:y=${Math.round(height * 0.25)}:w=${Math.round(width * 0.11)}:h=${Math.round(height * 0.58)}:color=${accent}@0.82:t=fill:${enable}`,
    ].join(',');
  }

  if (scene.motif === 'warning') {
    return `drawbox=x=${Math.round(width * 0.12)}:y=${Math.round(height * 0.18)}:w=${Math.round(width * 0.76)}:h=${Math.round(height * 0.64)}:color=${accent}@0.18:t=${Math.max(10, Math.round(width * 0.018))}:${enable}`;
  }

  if (scene.motif === 'money') {
    return [
      `drawbox=x=${Math.round(width * 0.14)}:y=${Math.round(height * 0.2)}:w=${Math.round(width * 0.72)}:h=${Math.round(height * 0.52)}:color=${accent}@0.15:t=fill:${enable}`,
      `drawbox=x=${Math.round(width * 0.2)}:y=${Math.round(height * 0.28)}:w=${Math.round(width * 0.6)}:h=${Math.round(height * 0.36)}:color=${secondary}@0.2:t=${Math.max(8, Math.round(width * 0.012))}:${enable}`,
    ].join(',');
  }

  return `drawbox=x=${Math.round(width * 0.66)}:y=${Math.round(height * 0.16)}:w=${Math.round(width * 0.2)}:h=${Math.round(width * 0.2)}:color=${accent}@0.32:t=fill:${enable}`;
}

function createTopVisualFilters(scenes: ScriptVisualScene[], width: number, height: number, duration: number): string[] {
  const filters: string[] = [`color=c=${hexToFfmpegRgb(scenes[0]?.palette.background ?? '#111827')}:s=${width}x${height}:d=${Math.max(1, duration).toFixed(2)}[visual0]`];
  let inputLabel = 'visual0';
  let outputIndex = 1;

  scenes.forEach((scene, sceneIndex) => {
    const bgColor = hexToFfmpegRgb(scene.palette.background);
    const accent = hexToFfmpegRgb(scene.palette.accent);
    const enable = ffmpegEnableBetween(scene.start, scene.end);

    const chain = [
      `drawbox=x=0:y=0:w=iw:h=ih:color=${bgColor}@1:t=fill:${enable}`,
      motifShapeFilter(scene, width, height),
      `drawbox=x=${Math.round(width * 0.06)}:y=${Math.round(height * 0.08)}:w=${Math.round(width * 0.88)}:h=${Math.round(height * 0.84)}:color=${accent}@0.18:t=${Math.max(5, Math.round(width * 0.006))}:${enable}`,
    ].join(',');
    const outputLabel = sceneIndex === scenes.length - 1 ? 'visuals' : `visual${outputIndex}`;
    filters.push(`[${inputLabel}]${chain}[${outputLabel}]`);
    inputLabel = outputLabel;
    outputIndex += 1;
  });

  return filters;
}

function createMotionFilters(motionPreset: MotionPreset, quality: ExportQuality): string[] {
  const { width, height } = QUALITY_CONFIG[quality];
  const evenWidth = Math.round(width / 2) * 2;
  const evenHeight = Math.round(height / 2) * 2;

  if (motionPreset === 'punch-in') {
    return [`scale=${Math.round(evenWidth * 1.08)}:${Math.round(evenHeight * 1.08)}`, `crop=${evenWidth}:${evenHeight}:(in_w-out_w)/2:(in_h-out_h)/2`];
  }

  if (motionPreset === 'drift') {
    const scaledWidth = Math.round(evenWidth * 1.1);
    const scaledHeight = Math.round(evenHeight * 1.1);
    const amplitudeX = Math.round((scaledWidth - evenWidth) * 0.36);
    const amplitudeY = Math.round((scaledHeight - evenHeight) * 0.28);
    return [
      `scale=${scaledWidth}:${scaledHeight}`,
      `crop=${evenWidth}:${evenHeight}:(in_w-out_w)/2+sin(t*0.45)*${amplitudeX}:(in_h-out_h)/2+cos(t*0.38)*${amplitudeY}`,
    ];
  }

  if (motionPreset === 'float') {
    const scaledWidth = Math.round(evenWidth * 1.06);
    const scaledHeight = Math.round(evenHeight * 1.06);
    return [
      `scale=${scaledWidth}:${scaledHeight}`,
      `crop=${evenWidth}:${evenHeight}:(in_w-out_w)/2:(in_h-out_h)/2+sin(t*0.75)*${Math.round((scaledHeight - evenHeight) * 0.4)}`,
    ];
  }

  if (motionPreset === 'handheld') {
    const scaledWidth = Math.round(evenWidth * 1.08);
    const scaledHeight = Math.round(evenHeight * 1.08);
    return [
      `scale=${scaledWidth}:${scaledHeight}`,
      `crop=${evenWidth}:${evenHeight}:(in_w-out_w)/2+sin(t*9)*${Math.round((scaledWidth - evenWidth) * 0.18)}:(in_h-out_h)/2+cos(t*8)*${Math.round((scaledHeight - evenHeight) * 0.16)}`,
    ];
  }

  return [`scale=${evenWidth}:${evenHeight}`];
}

function createVideoEffectFilters(effect: VideoEffect, intensity: number): string[] {
  const amount = Math.min(1, Math.max(0, Number.isFinite(intensity) ? intensity : 0.65));

  if (effect === 'cinematic') {
    return [`eq=contrast=${(1 + amount * 0.16).toFixed(2)}:saturation=${(0.92 + amount * 0.1).toFixed(2)}:brightness=${(-0.035 * amount).toFixed(3)}`, `vignette=PI/5`];
  }

  if (effect === 'vibrant') {
    return [`eq=contrast=${(1 + amount * 0.12).toFixed(2)}:saturation=${(1 + amount * 0.48).toFixed(2)}:brightness=${(0.015 * amount).toFixed(3)}`];
  }

  if (effect === 'noir') {
    return [`format=gray`, `eq=contrast=${(1 + amount * 0.28).toFixed(2)}:brightness=${(-0.025 * amount).toFixed(3)}`];
  }

  if (effect === 'warm') {
    return [`colorbalance=rs=${(0.08 * amount).toFixed(3)}:gs=${(0.025 * amount).toFixed(3)}:bs=${(-0.06 * amount).toFixed(3)}`];
  }

  if (effect === 'cool') {
    return [`colorbalance=rs=${(-0.05 * amount).toFixed(3)}:gs=${(0.015 * amount).toFixed(3)}:bs=${(0.09 * amount).toFixed(3)}`];
  }

  if (effect === 'sharpen') {
    return [`unsharp=5:5:${(0.45 + amount * 0.75).toFixed(2)}:3:3:${(0.2 + amount * 0.2).toFixed(2)}`];
  }

  if (effect === 'vintage') {
    return [
      `eq=contrast=${(0.98 + amount * 0.08).toFixed(2)}:saturation=${(0.78 + amount * 0.08).toFixed(2)}:brightness=${(0.018 * amount).toFixed(3)}`,
      `colorbalance=rs=${(0.07 * amount).toFixed(3)}:gs=${(0.025 * amount).toFixed(3)}:bs=${(-0.07 * amount).toFixed(3)}`,
      `vignette=PI/6`,
    ];
  }

  return [];
}

async function renderWithFfmpeg(
  inputPath: string,
  outputPath: string,
  settings: CaptionSettings,
  quality: ExportQuality,
  captions: CaptionToken[],
  duration: number,
) {
  ensureFfmpegPath();
  const qualityConfig = QUALITY_CONFIG[quality];
  const grouped = groupCaptionsForRender(captions, settings);
  const languageAdjusted = applyLanguageToCaptions(grouped, settings.language, settings.defaultScript);
  const captionEvents = languageAdjusted.length ? languageAdjusted : [{ text: 'Caption Preview', start: 0, end: 2.4 }];
  const drawTextFilters = createDrawTextFilters(captionEvents, settings, quality);
  const width = Math.round(qualityConfig.width / 2) * 2;
  const height = Math.round(qualityConfig.height / 2) * 2;
  const topHeight = Math.round(height / 2 / 2) * 2;
  const bottomHeight = height - topHeight;
  const visualScenes = createScriptVisualScenes(captionEvents, duration);
  const bottomFilters = [
    `scale=${width}:${bottomHeight}:force_original_aspect_ratio=increase`,
    `crop=${width}:${bottomHeight}:(in_w-out_w)/2:(in_h-out_h)/2`,
    ...createVideoEffectFilters(settings.videoEffect ?? 'none', settings.effectIntensity ?? 0.65),
  ].join(',');
  const captionChain = drawTextFilters.length ? drawTextFilters.join(',') : 'null';
  const complexFilters = [
    ...createTopVisualFilters(visualScenes, width, topHeight, duration),
    `[0:v]${bottomFilters}[talking]`,
    `[visuals][talking]vstack=inputs=2[split]`,
    `[split]${captionChain}[v]`,
  ];

  return new Promise<void>((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .complexFilter(complexFilters)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoBitrate(qualityConfig.bitrate)
      .outputOptions([
        '-preset',
        'medium',
        '-crf',
        quality === '4k' ? '18' : '21',
        '-movflags',
        '+faststart',
        '-map',
        '[v]',
        '-map',
        '0:a:0?',
        '-shortest',
      ])
      .on('end', () => resolve())
      .on('error', (err, _stdout, stderr) => {
        const stderrTail = stderr ? stderr.split('\n').slice(-12).join('\n') : '';
        reject(new Error(`${err.message}${stderrTail ? `\n${stderrTail}` : ''}`));
      });

    command.save(outputPath);
  });
}

export async function processVideoRender(
  projectId: string,
  styleId: string,
  incomingSettings?: CaptionSettings,
  quality: ExportQuality = '4k',
): Promise<string> {
  const project = await getProjectById(projectId);

  if (!project) throw new Error('Project not found');

  const settings: CaptionSettings = {
    ...DEFAULT_CAPTION_SETTINGS,
    ...incomingSettings,
    style: styleId,
  };

  const outputFilename = `${projectId}-${quality}-${Date.now()}.mp4`;
  const renderDir = path.join(process.cwd(), 'public', 'renders');
  await fsp.mkdir(renderDir, { recursive: true });
  const outputPath = path.join(renderDir, outputFilename);
  const outputPublicUrl = `/renders/${outputFilename}`;

  const inputPath = resolveProjectInputPath(project);

  if (!inputPath) {
    throw new Error('Local source video not found for rendering');
  }

  await renderWithFfmpeg(
    inputPath,
    outputPath,
    settings,
    quality,
    project.captions.map((cap) => ({
      text: cap.text,
      start: cap.start,
      end: cap.end,
      confidence: cap.confidence,
      script: cap.script,
      highlightWords: cap.highlightWords,
      positionX: cap.positionX,
      positionY: cap.positionY,
    })),
    project.duration,
  );

  return outputPublicUrl;
}
