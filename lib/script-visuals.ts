export type ScriptVisualScene = {
  id: string;
  start: number;
  end: number;
  title: string;
  subtitle: string;
  keywords: string[];
  palette: {
    background: string;
    accent: string;
    secondary: string;
  };
  motif: "growth" | "idea" | "money" | "warning" | "tech" | "people" | "default";
};

type ScriptCaption = {
  text: string;
  start: number;
  end: number;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "but",
  "for",
  "from",
  "hai",
  "he",
  "i",
  "in",
  "is",
  "it",
  "ka",
  "ke",
  "ki",
  "main",
  "me",
  "mein",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "we",
  "with",
  "you",
]);

const PALETTES: ScriptVisualScene["palette"][] = [
  { background: "#101820", accent: "#facc15", secondary: "#38bdf8" },
  { background: "#172554", accent: "#2dd4bf", secondary: "#f8fafc" },
  { background: "#1f2937", accent: "#fb7185", secondary: "#fbbf24" },
  { background: "#052e2b", accent: "#a7f3d0", secondary: "#60a5fa" },
  { background: "#111827", accent: "#c084fc", secondary: "#f97316" },
];

function cleanWord(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]/g, "");
}

function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function clampTime(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Number(Math.max(0, value).toFixed(2));
}

function inferMotif(text: string): ScriptVisualScene["motif"] {
  const normalized = text.toLowerCase();

  if (/(money|price|cost|budget|invest|stock|market|rupee|dollar|income|wealth|paise|paisa|kamaana|kamana|charge|500|5000|karodo|crore|lakh)/.test(normalized)) {
    return "money";
  }

  if (/(grow|growth|scale|increase|viral|views|reach|boost|profit|revenue|sales|roi|sell|sellable|business|client|shop|landing|demo|lead|live page)/.test(normalized)) {
    return "growth";
  }

  if (/(risk|mistake|wrong|avoid|problem|fail|danger|warning|issue|bug|nahi|without|shocked)/.test(normalized)) {
    return "warning";
  }

  if (/(ai|tech|code|app|software|data|system|automation|model|algorithm|database|backend|hosting|emergent|online|form)/.test(normalized)) {
    return "tech";
  }

  if (/(team|people|customer|audience|creator|student|user|friend|family|owner|local|saloon|dhaba|boutique|coaching)/.test(normalized)) {
    return "people";
  }

  if (/(idea|think|learn|secret|framework|story|lesson|strategy|simple|plain english|build|banaya|bana)/.test(normalized)) {
    return "idea";
  }

  return "default";
}

function selectKeywords(text: string): string[] {
  const counts = new Map<string, { word: string; count: number }>();

  for (const rawWord of text.split(/\s+/)) {
    const key = cleanWord(rawWord);
    if (!key || key.length < 3 || STOP_WORDS.has(key)) continue;
    const word = rawWord.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    const current = counts.get(key);
    counts.set(key, { word, count: (current?.count ?? 0) + 1 });
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length)
    .slice(0, 3)
    .map((entry) => titleCase(entry.word));
}

function sceneTitle(text: string, keywords: string[]): string {
  if (keywords.length) {
    return keywords.slice(0, 2).join(" + ");
  }

  const words = text.split(/\s+/).filter(Boolean).slice(0, 4);
  return titleCase(words.join(" ") || "Key Moment");
}

export function createScriptVisualScenes(captions: ScriptCaption[], duration: number): ScriptVisualScene[] {
  const cleanCaptions = captions
    .map((caption) => ({
      text: String(caption.text ?? "").trim(),
      start: clampTime(Number(caption.start)),
      end: clampTime(Number(caption.end)),
    }))
    .filter((caption) => caption.text && caption.end > caption.start)
    .sort((a, b) => a.start - b.start);

  if (!cleanCaptions.length) {
    const end = Math.max(4, Number.isFinite(duration) ? duration : 8);
    return [
      {
        id: "visual-0001",
        start: 0,
        end,
        title: "Upload Ready",
        subtitle: "AI visuals will follow your script here.",
        keywords: ["AI", "Visuals", "Captions"],
        palette: PALETTES[0],
        motif: "default",
      },
    ];
  }

  const scenes: ScriptVisualScene[] = [];
  let bucket: typeof cleanCaptions = [];

  const flush = () => {
    if (!bucket.length) return;
    const text = bucket.map((caption) => caption.text).join(" ");
    const keywords = selectKeywords(text);
    const index = scenes.length;

    scenes.push({
      id: `visual-${String(index + 1).padStart(4, "0")}`,
      start: bucket[0].start,
      end: bucket[bucket.length - 1].end,
      title: sceneTitle(text, keywords),
      subtitle: text,
      keywords,
      palette: PALETTES[index % PALETTES.length],
      motif: inferMotif(text),
    });
    bucket = [];
  };

  for (const caption of cleanCaptions) {
    if (!bucket.length) {
      bucket.push(caption);
      continue;
    }

    const currentDuration = caption.end - bucket[0].start;
    const previous = bucket[bucket.length - 1];
    const gap = caption.start - previous.end;
    const wordCount = bucket.reduce((sum, item) => sum + item.text.split(/\s+/).filter(Boolean).length, 0);

    if (currentDuration > 3.8 || gap > 0.55 || wordCount >= 14) {
      flush();
    }

    bucket.push(caption);
  }

  flush();
  return scenes;
}
