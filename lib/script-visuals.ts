export type VisualLayout = "speaker" | "split" | "full-visual" | "overlay";
export type VisualType = "kinetic-type" | "stat" | "list" | "comparison" | "diagram" | "meme" | "b-roll";

export type ScriptVisualScene = {
  id: string;
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  callout?: string;
  keywords: string[];
  layout: VisualLayout;
  visualType: VisualType;
  searchQuery?: string;
  mediaUrl?: string;
  mediaType?: "video" | "image" | "gif";
  mediaCredit?: string;
  palette: {
    background: string;
    accent: string;
    secondary: string;
  };
  motif: "growth" | "idea" | "money" | "warning" | "tech" | "people" | "rocket" | "brain" | "fire" | "trophy" | "chart" | "shield" | "default";
  zoomTimings?: number[];
};

type ScriptCaption = {
  text: string;
  start: number;
  end: number;
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "but", "for", "from", "hai", "he", "i", "in", "is", "it", "ka", "ke", "ki",
  "main", "me", "mein", "of", "on", "or", "that", "the", "this", "to", "we", "with", "you", "your", "ye", "toh",
]);

const ENGLISH_VISUAL_WORDS: Record<string, string> = {
  ab: "Now",
  acha: "Good",
  accha: "Good",
  aap: "You",
  aapka: "Your",
  aapko: "You",
  agar: "If",
  apna: "Own",
  apne: "Own",
  bahut: "Big",
  banana: "Build",
  banane: "Build",
  banao: "Build",
  bhai: "Friend",
  bilkul: "Absolutely",
  chahiye: "Need",
  dekho: "Look",
  dekhiye: "Look",
  ek: "One",
  hoga: "Will",
  hum: "We",
  kar: "Build",
  kare: "Build",
  karo: "Build",
  karke: "Build",
  kamaana: "Earn",
  kamana: "Earn",
  karna: "Build",
  kiya: "Made",
  kuch: "Something",
  kya: "What",
  lekin: "But",
  matlab: "Meaning",
  mujhe: "Me",
  phir: "Next",
  poora: "Complete",
  pura: "Complete",
  nahi: "No",
  nahin: "No",
  paisa: "Money",
  paise: "Money",
  sabse: "Top",
  secret: "Secret",
  sirf: "Only",
  tarah: "Style",
  wala: "Type",
  wali: "Type",
  zyada: "More",
  yaar: "Friend",
};

// Deliberately conservative: Latin characters alone do not make a word
// English. This prevents unknown Romanized Hindi from leaking into visual
// titles while still preserving the high-signal vocabulary used by the app.
const SAFE_ENGLISH_VISUAL_WORDS = new Set([
  "absolutely", "ai", "algorithm", "app", "attention", "audience", "automation", "avoid", "backend", "best", "big",
  "brand", "budget", "bug", "build", "business", "caption", "captions", "change", "choice", "clip", "code", "complete",
  "content", "cost", "creator", "customer", "danger", "data", "dollar", "edit", "editor", "effect", "effects", "engaging",
  "english", "fast", "feature", "features", "final", "focus", "free", "friend", "full", "funny", "generate", "gemini",
  "gif", "good", "grow", "growth", "idea", "income", "increase", "invest", "issue", "lead", "learn", "look", "market",
  "media", "mistake", "model", "money", "motion", "move", "need", "next", "numbers", "online", "openai", "overlay",
  "people", "price", "problem", "profit", "quality", "raw", "reach", "ready", "revenue", "risk", "roi", "sales", "scale",
  "secret", "simple", "smart", "software", "something", "sound", "story", "strategy", "style", "system", "team", "tech",
  "theme", "top", "transcript", "transcriber", "transition", "type", "upload", "user", "video", "viral", "visual", "visuals",
  "views", "warning", "wealth", "working", "wrong", "your", "zoom",
]);

const PALETTES: ScriptVisualScene["palette"][] = [
  { background: "#0B0D10", accent: "#D7FF3F", secondary: "#FFFFFF" },
  { background: "#11141A", accent: "#FF5C35", secondary: "#FFE8D6" },
  { background: "#0A1020", accent: "#6EE7FF", secondary: "#A78BFA" },
  { background: "#16110B", accent: "#FFD43B", secondary: "#FB7185" },
];

function cleanWord(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
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
  return Number(Math.max(0, value).toFixed(3));
}

function inferMotif(text: string): ScriptVisualScene["motif"] {
  const normalized = text.toLowerCase();
  if (/(rocket|startup|launch|skyrocket|blast|momentum)/.test(normalized)) return "rocket";
  if (/(brain|smart|intelligence|mindset|psychology)/.test(normalized)) return "brain";
  if (/(fire|hot|trending|heat|burn|explosive|lit)/.test(normalized)) return "fire";
  if (/(trophy|win|success|champion|achieve|award|best|top)/.test(normalized)) return "trophy";
  if (/(chart|data|analytics|numbers|stats|metrics|graph|percentage)/.test(normalized)) return "chart";
  if (/(shield|protect|safe|secure|defense|guard|insurance)/.test(normalized)) return "shield";
  if (/(money|price|cost|budget|invest|stock|market|rupee|dollar|income|wealth|paisa|charge|crore|lakh)/.test(normalized)) return "money";
  if (/(grow|growth|scale|increase|viral|views|reach|boost|profit|revenue|sales|roi|business|client|lead)/.test(normalized)) return "growth";
  if (/(risk|mistake|wrong|avoid|problem|fail|danger|warning|issue|bug|nahi|without|shocked)/.test(normalized)) return "warning";
  if (/(ai|tech|code|app|software|system|automation|model|algorithm|database|backend|hosting|online)/.test(normalized)) return "tech";
  if (/(team|people|customer|audience|creator|student|user|family|owner)/.test(normalized)) return "people";
  if (/(idea|think|learn|secret|framework|story|lesson|strategy|simple|build|banaya|bana)/.test(normalized)) return "idea";
  return "default";
}

function visualTypeFor(motif: ScriptVisualScene["motif"], index: number): VisualType {
  if (index > 0 && index % 5 === 0) return "meme";
  if (motif === "money" || motif === "growth") return "stat";
  if (motif === "warning") return "comparison";
  if (motif === "tech") return "diagram";
  if (motif === "people") return "list";
  return "kinetic-type";
}

function selectEnglishKeywords(text: string): string[] {
  const counts = new Map<string, { word: string; count: number }>();
  for (const rawWord of text.split(/\s+/)) {
    const key = cleanWord(rawWord);
    if (!key || key.length < 3 || STOP_WORDS.has(key)) continue;
    const mapped = ENGLISH_VISUAL_WORDS[key];
    const translated = mapped ?? (SAFE_ENGLISH_VISUAL_WORDS.has(key) ? rawWord.replace(/[^A-Za-z0-9$%]/g, "") : "");
    if (!translated || !/[A-Za-z]/.test(translated)) continue;
    const normalized = translated.toLowerCase();
    const current = counts.get(normalized);
    counts.set(normalized, { word: titleCase(translated), count: (current?.count ?? 0) + 1 });
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length)
    .slice(0, 3)
    .map((entry) => entry.word);
}

function fallbackCopy(motif: ScriptVisualScene["motif"]): { eyebrow: string; title: string; subtitle: string } {
  if (motif === "money") return { eyebrow: "REAL COST", title: "WATCH THE NUMBERS", subtitle: "Small choices compound fast." };
  if (motif === "growth") return { eyebrow: "LEVEL UP", title: "MASSIVE GROWTH", subtitle: "Turn the idea into momentum." };
  if (motif === "warning") return { eyebrow: "RED FLAG", title: "AVOID THIS", subtitle: "The obvious move can be the trap." };
  if (motif === "tech") return { eyebrow: "HOW IT WORKS", title: "SMART SYSTEM", subtitle: "Connect the pieces, then automate." };
  if (motif === "people") return { eyebrow: "PEOPLE FIRST", title: "BUILD CONNECTION", subtitle: "Show the human behind the idea." };
  if (motif === "idea") return { eyebrow: "KEY INSIGHT", title: "REMEMBER THIS", subtitle: "One clear thought beats ten weak ones." };
  if (motif === "rocket") return { eyebrow: "BLAST OFF", title: "SKYROCKET SUCCESS", subtitle: "Momentum is everything." };
  if (motif === "brain") return { eyebrow: "BIG BRAIN", title: "WORK SMART", subtitle: "Change your mindset." };
  if (motif === "fire") return { eyebrow: "TRENDING", title: "VIRAL HEAT", subtitle: "Catch the explosive wave." };
  if (motif === "trophy") return { eyebrow: "TOP TIER", title: "CHAMPION MOVE", subtitle: "Be the absolute best." };
  if (motif === "chart") return { eyebrow: "DATA DRIVEN", title: "CHECK METRICS", subtitle: "Numbers never lie." };
  if (motif === "shield") return { eyebrow: "STAY SAFE", title: "SECURE IT", subtitle: "Guard your downside." };
  return { eyebrow: "WATCH THIS", title: "THE MOVE", subtitle: "Keep it simple and make it land." };
}

function sceneCopy(text: string, motif: ScriptVisualScene["motif"], keywords: string[], visualType: VisualType) {
  const fallback = fallbackCopy(motif);
  let title = fallback.title;
  if (keywords.length) {
    const rawTitle = keywords.slice(0, 2).join(" ").toUpperCase();
    if (rawTitle.split(" ").length <= 3) {
      title = rawTitle;
    }
  }
  const subtitle = keywords.length >= 3 ? `Focus on ${keywords[2]}.` : fallback.subtitle;
  const callout =
    visualType !== "meme"
      ? undefined
      : motif === "money"
        ? "THE MATH IS MATHING"
        : motif === "warning"
          ? "PLOT TWIST"
          : motif === "tech"
            ? "BIG BRAIN MODE"
            : "WAIT FOR IT";

  return { eyebrow: fallback.eyebrow, title, subtitle, callout, source: text };
}

export function createScriptVisualScenes(captions: ScriptCaption[], duration: number, brandThemeId?: string): ScriptVisualScene[] {
  const cleanCaptions = captions
    .map((caption) => ({ text: String(caption.text ?? "").trim(), start: clampTime(Number(caption.start)), end: clampTime(Number(caption.end)) }))
    .filter((caption) => caption.text && caption.end > caption.start)
    .sort((a, b) => a.start - b.start);

  if (!cleanCaptions.length) return [];

  const buckets: Array<typeof cleanCaptions> = [];
  let bucket: typeof cleanCaptions = [];
  const flush = () => {
    if (bucket.length) buckets.push(bucket);
    bucket = [];
  };

  for (const caption of cleanCaptions) {
    if (!bucket.length) {
      bucket.push(caption);
      continue;
    }
    const previous = bucket[bucket.length - 1];
    const wordCount = bucket.reduce((sum, item) => sum + item.text.split(/\s+/).filter(Boolean).length, 0);
    if (caption.end - bucket[0].start > 3.4 || caption.start - previous.end > 0.55 || wordCount >= 12) flush();
    bucket.push(caption);
  }
  flush();

  const brand = getBrandTheme(brandThemeId);

  let consecutiveSpeakerCount = 0;

  return buckets.map((items, index) => {
    const text = items.map((caption) => caption.text).join(" ");
    const motif = inferMotif(text);
    const keywords = selectEnglishKeywords(text);
    const visualType = visualTypeFor(motif, index);
    const copy = sceneCopy(text, motif, keywords, visualType);
    const nextStart = buckets[index + 1]?.[0].start;
    const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : items[items.length - 1].end;
    const end = Math.min(safeDuration || items[items.length - 1].end, nextStart ?? Math.max(items[items.length - 1].end, safeDuration));

    let layout: VisualLayout = "speaker";
    if (index === 0) {
      layout = "speaker";
    } else {
      const isStrongKeyword = ["money", "fire", "trophy", "chart"].includes(motif);
      const isOverlay = index % 10 === 9; // ~10% overlay
      
      if (isOverlay) {
        layout = "overlay";
      } else if (isStrongKeyword) {
        layout = Math.random() > 0.5 ? "full-visual" : "split";
      } else if (consecutiveSpeakerCount >= 2) {
        layout = Math.random() > 0.6 ? "split" : "full-visual";
      } else {
        const rand = Math.random();
        if (rand < 0.4) layout = "speaker";
        else if (rand < 0.7) layout = "split";
        else layout = "full-visual";
      }
    }

    if (layout === "speaker") {
      consecutiveSpeakerCount++;
    } else {
      consecutiveSpeakerCount = 0;
    }
    
    const zoomTimings: number[] = [];
    if (layout === "speaker" || layout === "split") {
      zoomTimings.push(items[0].start);
    }

    return {
      id: `visual-${String(index + 1).padStart(4, "0")}`,
      start: items[0].start,
      end: Math.max(items[0].start + 0.2, end),
      eyebrow: copy.eyebrow,
      title: copy.title,
      subtitle: copy.subtitle,
      callout: copy.callout,
      keywords,
      layout,
      visualType,
      palette:
        index % 3 === 0
          ? { background: brand.background, accent: brand.accent, secondary: brand.secondary }
          : PALETTES[index % PALETTES.length],
      motif,
      zoomTimings,
    };
  });
}
import { getBrandTheme } from "./brand-themes";
