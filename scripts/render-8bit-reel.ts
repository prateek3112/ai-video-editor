import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { EightBitReelProps, EightBitScene, CrtBrand } from "../types/eight-bit-reel";

// ----------------------------------------------------
// BUILT-IN TOPIC PRESETS
// ----------------------------------------------------
const PRESETS: Record<string, {
  topic: string;
  tagBucket: string;
  authorHandle: string;
  crtBrand: CrtBrand;
  crtSubtitle: string;
  scenes: Array<{
    type: EightBitScene["type"];
    headline?: string;
    subheadline?: string;
    tabLabel?: string;
    tabColor?: string;
    title?: string;
    subtitle?: string;
    items?: EightBitScene["items"];
    footerNote?: string;
    emote?: EightBitScene["emote"];
    narration: string;
  }>;
}> = {
  "tencent-hy4": {
    topic: "Tencent HY4 - 770B MoE Engine",
    tagBucket: "Bucket 1",
    authorHandle: "@byteswithbittu",
    crtBrand: "tencent",
    crtSubtitle: "Tencent HY4",
    scenes: [
      {
        type: "intro-workstation",
        headline: "Tencent Dropped An AI Bombshell!",
        subheadline: "HY4 • 770B OPEN-WEIGHTS FOUNDATION MODEL",
        narration: "Stop scrolling! Tencent just dropped the biggest AI bombshell of the year.",
      },
      {
        type: "editorial-card",
        tabLabel: "architecture",
        tabColor: "#8B5CF6",
        title: "770B MoE Engine",
        subtitle: "Sparse Mixture-of-Experts Router Breakdown",
        items: [
          { num: "1", title: "Expert 1 (Code)", desc: "Full-stack software engineering, refactoring & PRs", tag: "official", tagColor: "#DCFCE7" },
          { num: "2", title: "Expert 2 (Logic)", desc: "Multi-step mathematical reasoning & proofs", tag: "active", tagColor: "#FEF9C3" },
          { num: "3", title: "Expert 3 (3D Dev)", desc: "3D spatial asset generation & geometry", tag: "partner", tagColor: "#E0E7FF" },
          { num: "4", title: "Expert 4 (Math)", desc: "High-precision algorithmic compute optimization", tag: "100% ★", tagColor: "#FCE7F3" },
        ],
        footerNote: "Only 49B parameters fire per token = lightning speed.",
        emote: "lightbulb",
        narration: "Meet HY4: a 770-billion parameter open-weights monster.",
      },
      {
        type: "editorial-card",
        tabLabel: "capacity",
        tabColor: "#06B6D4",
        title: "1,000,000 Context",
        subtitle: "Massive Repository & Codebase Ingestion",
        items: [
          { num: "1", title: "Full Repo Buffer", desc: "Scan 500+ files and dependencies with zero degradation", tag: "100x ★", tagColor: "#CCFBF1" },
          { num: "2", title: "Needle in Haystack", desc: "100% retrieval accuracy at 1 million tokens", tag: "verified", tagColor: "#DCFCE7" },
          { num: "3", title: "Zero Hallucination", desc: "Architectural precision across large document bases", tag: "official", tagColor: "#FEF9C3" },
          { num: "4", title: "Fast Retrieval", desc: "Instant lookups without fine-tuning latency", tag: "partner", tagColor: "#E0E7FF" },
        ],
        footerNote: "One short command runs across your entire codebase.",
        emote: "sparkle",
        narration: "It packs a one million token context window for repos.",
      },
      {
        type: "editorial-card",
        tabLabel: "workflows",
        tabColor: "#EC4899",
        title: "3D & Dev Studio",
        subtitle: "Direct Unreal Engine 5 & Full-Stack Coding",
        items: [
          { num: "1", title: "Software Engineering", desc: "End-to-end bug fixing, refactoring, and code reviews", tag: "Dev Agent", tagColor: "#DCFCE7" },
          { num: "2", title: "3D Mesh Gen", desc: "Auto-generates procedural 3D environments from text", tag: "UE5 Ready", tagColor: "#FCE7F3" },
          { num: "3", title: "Asset Pipeline", desc: "Direct export to GLTF, FBX, and Unreal Engine projects", tag: "partner", tagColor: "#FEF9C3" },
          { num: "4", title: "Zero Bottleneck", desc: "Single prompt to working interactive demo", tag: "10x Speed", tagColor: "#E0E7FF" },
        ],
        footerNote: "Handling everything from software engineering to 3D game dev!",
        emote: "sparkle",
        narration: "Handling everything from software engineering to 3D game dev!",
      },
      {
        type: "editorial-card",
        tabLabel: "open source",
        tabColor: "#F59E0B",
        title: "Hugging Face Hub",
        subtitle: "Zero API Paywalls • 100% Free Weights",
        items: [
          { num: "1", title: "Zero API Paywall", desc: "Download base model & fine-tune on your own GPUs", tag: "100% Free", tagColor: "#DCFCE7" },
          { num: "2", title: "Safetensors", desc: "Full fp16 and 4-bit quantized formats ready to run", tag: "official", tagColor: "#FEF9C3" },
          { num: "3", title: "Ollama & vLLM", desc: "Community inference support available on day 1", tag: "open", tagColor: "#E0E7FF" },
          { num: "4", title: "Commercial Use", desc: "Permissive license for building and selling AI tools", tag: "verified", tagColor: "#FCE7F3" },
        ],
        footerNote: "While closed models charge, HY4 is 100% free!",
        emote: "trophy",
        narration: "While closed models charge, HY4 is 100% free!",
      },
      {
        type: "cta-card",
        tabLabel: "get setup",
        tabColor: "#10B981",
        title: "Bytes with Bittu ⚡",
        subtitle: "Daily AI Engineering Alpha & Open-Source Tools",
        items: [
          { num: "1", title: "Full Setup Guide", desc: "Step-by-step local install instructions with scripts", tag: "official", tagColor: "#DCFCE7" },
          { num: "2", title: "Model Weights", desc: "Direct links and quantization configs on GitHub", tag: "free", tagColor: "#FEF9C3" },
          { num: "3", title: "Daily Alpha", desc: "Never miss a major AI release or architecture breakdown", tag: "daily", tagColor: "#E0E7FF" },
        ],
        footerNote: "Comment 'INSTALL' for the full setup guide & alpha!",
        emote: "trophy",
        narration: "Comment INSTALL for the full setup guide & alpha!",
      },
    ],
  },
  "claude-3-7": {
    topic: "Claude 3.7 Sonnet - Hybrid Reasoning",
    tagBucket: "Bucket 1",
    authorHandle: "@byteswithbittu",
    crtBrand: "anthropic",
    crtSubtitle: "Claude 3.7 Sonnet",
    scenes: [
      {
        type: "intro-workstation",
        headline: "Claude 3.7 Just Changed AI Forever!",
        subheadline: "HYBRID REASONING • INSTANT OR EXTENDED THINKING",
        narration: "Stop scrolling! Anthropic just dropped Claude 3.7 Sonnet.",
      },
      {
        type: "editorial-card",
        tabLabel: "architecture",
        tabColor: "#D97757",
        title: "Hybrid Reasoning",
        subtitle: "Instant Thought + Extended Thinking In One Model",
        items: [
          { num: "1", title: "Single Model", desc: "Seamlessly switches between fast responses and deep reasoning", tag: "hybrid", tagColor: "#DCFCE7" },
          { num: "2", title: "Thinking Budget", desc: "Set custom thinking token limits from 1K to 128K tokens", tag: "128K max", tagColor: "#FEF9C3" },
          { num: "3", title: "Zero Mode Switch", desc: "No need to pick between an o-series reasoner and standard chat", tag: "unified", tagColor: "#E0E7FF" },
          { num: "4", title: "Frontier Logic", desc: "Surpasses o1 and Gemini 2.0 Flash Thinking on complex code", tag: "frontier ★", tagColor: "#FCE7F3" },
        ],
        footerNote: "The first model that thinks instantaneously or ponders for minutes.",
        emote: "lightbulb",
        narration: "Meet the first model that thinks instantaneously or ponders for minutes.",
      },
      {
        type: "editorial-card",
        tabLabel: "benchmark",
        tabColor: "#06B6D4",
        title: "SWE-Bench King",
        subtitle: "70.3% Verified Autonomous Software Engineering",
        items: [
          { num: "1", title: "70.3% SWE-bench", desc: "Highest coding score ever recorded on real GitHub issues", tag: "70.3% ★", tagColor: "#CCFBF1" },
          { num: "2", title: "TAU Bench", desc: "Dominates airline and retail agent tool use benchmarks", tag: "agentic", tagColor: "#DCFCE7" },
          { num: "3", title: "Bug Remediation", desc: "Pinpoints multi-file bugs with zero developer steering", tag: "official", tagColor: "#FEF9C3" },
          { num: "4", title: "Full Codebases", desc: "Effortlessly refactors complex TypeScript and Rust repos", tag: "leader", tagColor: "#E0E7FF" },
        ],
        footerNote: "It shattered SWE-bench at 70.3%, solving real GitHub bugs.",
        emote: "sparkle",
        narration: "It shattered SWE-bench at 70.3%, solving real GitHub bugs.",
      },
      {
        type: "editorial-card",
        tabLabel: "workflows",
        tabColor: "#8B5CF6",
        title: "Cursor & CLI Agent",
        subtitle: "Direct IDE Integration & Terminal Tool Autonomy",
        items: [
          { num: "1", title: "Cursor Integration", desc: "Live in Composer for instant multi-file workspace edits", tag: "Cursor", tagColor: "#E0E7FF" },
          { num: "2", title: "Claude Code CLI", desc: "Official command-line tool that builds apps from bash", tag: "Terminal", tagColor: "#DCFCE7" },
          { num: "3", title: "Agentic Loop", desc: "Runs tests, verifies lints, and self-corrects autonomously", tag: "autonomous", tagColor: "#FEF9C3" },
          { num: "4", title: "Tool Use V2", desc: "Executes bash, grep, and file edits in single agent steps", tag: "active", tagColor: "#FCE7F3" },
        ],
        footerNote: "Handling full-stack refactors right inside your terminal!",
        emote: "sparkle",
        narration: "Handling full-stack refactors right inside your terminal!",
      },
      {
        type: "editorial-card",
        tabLabel: "pricing",
        tabColor: "#10B981",
        title: "Same Sonnet Price",
        subtitle: "$3 per Million Input • $15 per Million Output",
        items: [
          { num: "1", title: "Zero Surcharge", desc: "Same price as Claude 3.5 Sonnet: $3 in / $15 out", tag: "same price", tagColor: "#DCFCE7" },
          { num: "2", title: "Prompt Caching", desc: "Up to 90% discount on cached context tokens", tag: "90% off", tagColor: "#FEF9C3" },
          { num: "3", title: "Batch API", desc: "50% off for async processing pipelines", tag: "50% off", tagColor: "#E0E7FF" },
          { num: "4", title: "Available Now", desc: "Live today on API, Claude Pro, and Amazon Bedrock", tag: "live", tagColor: "#FCE7F3" },
        ],
        footerNote: "Zero price increase: same $3 per million tokens.",
        emote: "trophy",
        narration: "Zero price increase: same three dollars per million tokens.",
      },
      {
        type: "cta-card",
        tabLabel: "get access",
        tabColor: "#F59E0B",
        title: "Bytes with Bittu ⚡",
        subtitle: "Daily AI Engineering Alpha & Prompt Blueprints",
        items: [
          { num: "1", title: "Hybrid Prompt", desc: "Best thinking budget prompts for software engineering", tag: "official", tagColor: "#DCFCE7" },
          { num: "2", title: "CLI Setup Guide", desc: "How to install and run Claude Code in your terminal", tag: "free", tagColor: "#FEF9C3" },
          { num: "3", title: "Daily Alpha", desc: "Never miss a major AI release or architecture breakdown", tag: "daily", tagColor: "#E0E7FF" },
        ],
        footerNote: "Comment 'CLAUDE' for our hybrid reasoning system prompt!",
        emote: "trophy",
        narration: "Comment CLAUDE for our hybrid reasoning system prompt!",
      },
    ],
  },
  "gemini-transcribe": {
    topic: "Google Gemini 3.5 Transcribe - Smart Speech Intelligence",
    tagBucket: "Bucket 1",
    authorHandle: "@byteswithbittu",
    crtBrand: "google",
    crtSubtitle: "Gemini 3.5 Transcribe",
    scenes: [
      {
        type: "intro-workstation",
        headline: "Voice Recorders Just Got Smart!",
        subheadline: "GOOGLE GEMINI 3.5 TRANSCRIBE",
        narration: "Imagine if your voice recorder didn't just transcribe what you said, but actually understood what you meant.",
      },
      {
        type: "editorial-card",
        tabLabel: "breakthrough",
        tabColor: "#2563EB",
        title: "Gemini 3.5 Transcribe",
        subtitle: "Smart Audio Intelligence Engine",
        customVisualizer: "speech-correction",
        hasMarkerLoop: true,
        items: [],
        footerNote: "Filters stutters and corrects mid-sentence disfluencies.",
        emote: "sparkle",
        narration: "Google just released Gemini 3.5 Transcribe, and it's not your typical speech-to-text model.",
      },
      {
        type: "editorial-card",
        tabLabel: "disfluency",
        tabColor: "#059669",
        title: "Self-Correcting Speech",
        subtitle: "Resolves Human Mind Changes in Real-Time",
        hasMarkerLoop: true,
        items: [
          { num: "1", title: "Smart Self-Correction", desc: "Instantly reconciles corrections and changes of mind", tag: "smart", tagColor: "#DCFCE7" },
          { num: "2", title: "Zero Filler Words", desc: "Strips 'um', 'uh', and stutter disfluencies automatically", tag: "clean", tagColor: "#FEF9C3" },
          { num: "3", title: "Dual API Endpoints", desc: "Batch audio processing + sub-100ms Live streaming", tag: "live", tagColor: "#E0E7FF" },
          { num: "4", title: "2.6% Word Error Rate", desc: "State-of-the-art accuracy recorded by Artificial Analysis", tag: "SOTA ★", tagColor: "#FCE7F3" },
        ],
        footerNote: "Outputs pristine, publication-ready text automatically.",
        emote: "lightbulb",
        narration: "If you say, let's meet Tuesday... actually, Wednesday, it understands the correction.",
      },
      {
        type: "editorial-card",
        tabLabel: "global scale",
        tabColor: "#7C3AED",
        title: "85+ Languages & Diarization",
        subtitle: "Multi-Speaker & Domain-Specific Lexicons",
        items: [
          { num: "1", title: "Speaker Diarization", desc: "Distinguishes multiple voices across boardroom meetings", tag: "multi-voice", tagColor: "#EDE9FE" },
          { num: "2", title: "85+ World Languages", desc: "Seamless recognition across global languages and accents", tag: "85+ Langs", tagColor: "#DCFCE7" },
          { num: "3", title: "Live Code-Switching", desc: "Handles bilingual speakers switching languages mid-sentence", tag: "bilingual", tagColor: "#FEF9C3" },
          { num: "4", title: "Specialized Lexicons", desc: "Accurate medical, legal, and software terminology", tag: "domain", tagColor: "#E0E7FF" },
        ],
        footerNote: "Trained on massive multilingual multimodal datasets.",
        emote: "sparkle",
        narration: "It can clean up filler words, identify different speakers, understand specialized vocabulary, and support 85+ languages.",
      },
      {
        type: "editorial-card",
        tabLabel: "performance",
        tabColor: "#EA580C",
        title: "70% Speed Breakthrough",
        subtitle: "Massive Latency Reduction over Chirp 3",
        customVisualizer: "speed-gauge",
        items: [
          { num: "1", title: "70% Faster Time-to-Text", desc: "Cuts latency dramatically compared to prior Chirp models", tag: "70% ⚡", tagColor: "#FEF08A" },
          { num: "2", title: "Edge & Cloud Ready", desc: "Integrates across macOS, Android Gboard & Chrome", tag: "omnipresent", tagColor: "#DCFCE7" },
          { num: "3", title: "Public Preview Access", desc: "Available today in Google AI Studio and Vertex Cloud", tag: "free test", tagColor: "#E0E7FF" },
        ],
        footerNote: "Real-time transcription that keeps up with human thought.",
        emote: "trophy",
        narration: "And Google says it's up to 70% faster than their previous transcription model.",
      },
      {
        type: "cta-card",
        tabLabel: "the future",
        tabColor: "#0F172A",
        title: "Semantic Speech Era",
        subtitle: "Voice Intelligence Reimagined • Bytes with Bittu",
        items: [
          { num: "1", title: "From Audio to Meaning", desc: "The model parses conversational context and intent", tag: "future", tagColor: "#DCFCE7" },
          { num: "2", title: "Try It Free Today", desc: "Test live audio in Google AI Studio API playground", tag: "official", tagColor: "#FEF9C3" },
          { num: "3", title: "Daily AI Alpha", desc: "Follow @byteswithbittu for real-time engineering breakdowns", tag: "daily", tagColor: "#E0E7FF" },
        ],
        footerNote: "Comment 'TRANSCRIBE' for the complete developer guide!",
        emote: "trophy",
        narration: "So transcription is no longer just turning your voice into text. It's starting to understand the conversation.",
      },
    ],
  },
  "bittu-intro": {
    topic: "Meet Bittu - Bytes with Bittu Channel Intro",
    tagBucket: "Channel Alpha",
    authorHandle: "@byteswithbittu",
    crtBrand: "terminal",
    crtSubtitle: "Bytes with Bittu",
    scenes: [
      {
        type: "intro-workstation",
        headline: "Meet Bittu! 👾",
        subheadline: "YOUR DAILY AI & TECH COPILOT",
        terminalText: "$ whoami\n> NAME: BITTU (8-BIT BOT)\n> MISSION: DECODE AI ALPHA\n> STATUS: ONLINE & READY █",
        narration: "Hey there! I’m Bittu — your resident 8-bit pixel buddy who escaped the 90s to fix your AI feed.",
      },
      {
        type: "pipeline-visualizer",
        tabLabel: "the mission",
        tabColor: "#2563EB",
        title: "Zero Hype. Pure Alpha.",
        subtitle: "Bite-Sized Tech Intelligence Daily",
        footerNote: "Because reading 50-page research papers is my job, not yours.",
        emote: "lightbulb",
        narration: "Tired of 40-page whitepapers and hype? I break down the craziest AI drops into bite-sized bytes every single day.",
      },
      {
        type: "tool-matrix",
        tabLabel: "daily drops",
        tabColor: "#059669",
        title: "Everything You Get",
        subtitle: "Your Front-Row Seat to the Future",
        footerNote: "Level up your engineering stack every single morning.",
        emote: "sparkle",
        narration: "From autonomous coding agents and workflow automations to secret open-source models, you’ll never miss a thing.",
      },
      {
        type: "bento-cta",
        tabLabel: "join the crew",
        tabColor: "#EA580C",
        title: "Bytes with Bittu ⚡",
        subtitle: "Follow @byteswithbittu for Daily AI Intelligence",
        footerNote: "Comment 'BITTU' to get our curated AI Starter Pack!",
        emote: "trophy",
        narration: "Hit follow, grab a coffee, and welcome to Bytes with Bittu. Let’s build the future together!",
      },
    ],
  },
};

// ----------------------------------------------------
// AUDIO SYNTHESIS & SILENCE TRIMMING HELPER
// ----------------------------------------------------
function prepareAudioClips(slug: string, preset: typeof PRESETS[string]): {
  audioSrc: string;
  sceneDurations: number[];
  sceneCaptions: Array<Array<{ text: string; fromFrame: number; durationInFrames: number; isHighlight?: boolean }>>;
} {
  const audioDir = path.join(process.cwd(), "public", "compositions", `8bit-${slug}`, "audio");
  fs.mkdirSync(audioDir, { recursive: true });

  const pyBin = path.join(process.cwd(), ".venv", "bin", "python3");
  const pyGenScript = path.join(process.cwd(), "scripts", "generate_edge_speech.py");
  const hasVenvPy = fs.existsSync(pyBin);

  const sceneDurations: number[] = [];
  const sceneCaptions: Array<Array<{ text: string; fromFrame: number; durationInFrames: number; isHighlight?: boolean }>> = [];
  const tightWavFiles: string[] = [];

  console.log(`🎙️ Generating voiceover with exact word-level alignment for ${preset.scenes.length} scenes...`);

  const BREATHING_SPACE_SEC = 0.32; // 0.32s (~10 frames) breathing space between sentences
  const BREATHING_SPACE_FRAMES = Math.round(BREATHING_SPACE_SEC * 30);

  preset.scenes.forEach((scene, i) => {
    const rawMp3 = path.join(audioDir, `scene-${i + 1}-raw.mp3`);
    const tightWav = path.join(audioDir, `scene-${i + 1}-tight.wav`);

    let wordsData: Array<{ word: string; start: number; end: number; duration: number }> = [];

    // 1. Synthesize audio + extract exact word timestamps
    if (hasVenvPy) {
      const pyOut = execSync(
        `"${pyBin}" "${pyGenScript}" "${scene.narration}" "${rawMp3}" "en-US-ChristopherNeural" "+6%"`
      ).toString().trim();
      try {
        wordsData = JSON.parse(pyOut);
      } catch (err) {
        console.warn(`Could not parse python word timestamps for scene ${i + 1}:`, err);
      }
    } else {
      execSync(`say -v "Daniel (English (UK))" -r 200 -o "${rawMp3}" --data-format=LEF32@24000 "${scene.narration}"`);
    }

    // 2. Measure leading offset and speech end
    const firstWordStart = wordsData.length > 0 ? wordsData[0].start : 0;
    const lastWordEnd = wordsData.length > 0 ? wordsData[wordsData.length - 1].end : 3.0;

    const silenceOffset = Math.max(0, firstWordStart - 0.05);
    const speechEnd = lastWordEnd + 0.08;

    // 3. Trim silence and append breathing space
    execSync(
      `ffmpeg -ss ${silenceOffset.toFixed(3)} -to ${speechEnd.toFixed(3)} -i "${rawMp3}" -af "apad=pad_dur=${BREATHING_SPACE_SEC}" -ar 48000 -ac 2 "${tightWav}" -y`,
      { stdio: "ignore" }
    );

    const actualDur = parseFloat(
      execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tightWav}"`)
        .toString()
        .trim()
    );

    const durFrames = Math.max(90, Math.ceil(actualDur * 30));
    sceneDurations.push(durFrames);
    tightWavFiles.push(tightWav);

    // 4. Build exact word-synced phrase chunks
    const keywords = [
      "TENCENT", "HY4", "770B", "CLAUDE", "ANTHROPIC", "HYBRID", "REASONING",
      "SWE-BENCH", "70.3%", "CURSOR", "CLI", "TERMINAL", "PRICE", "FREE", "INSTALL", "MONSTER", "WINDOW"
    ];

    const captionList: Array<{ text: string; fromFrame: number; durationInFrames: number; isHighlight?: boolean }> = [];

    if (wordsData.length > 0) {
      // Group words into chunks of 2-3 words
      const chunkSize = wordsData.length <= 6 ? 2 : 3;
      for (let wIdx = 0; wIdx < wordsData.length; wIdx += chunkSize) {
        const slice = wordsData.slice(wIdx, wIdx + chunkSize);
        const chunkText = slice.map((w) => w.word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toUpperCase()).join(" ").trim();
        if (!chunkText) continue;

        const chunkStartSec = Math.max(0, slice[0].start - silenceOffset);
        // Let chunk last until the next chunk starts or until end of this chunk + a tiny hold
        const nextSliceStart = wIdx + chunkSize < wordsData.length ? wordsData[wIdx + chunkSize].start - silenceOffset : slice[slice.length - 1].end - silenceOffset + 0.12;
        const chunkEndSec = Math.max(chunkStartSec + 0.4, nextSliceStart);

        const fromFrame = Math.max(0, Math.round(chunkStartSec * 30));
        const toFrame = Math.min(durFrames - BREATHING_SPACE_FRAMES, Math.round(chunkEndSec * 30));
        const durationInFrames = Math.max(12, toFrame - fromFrame);

        const isHighlight = keywords.some((k) => chunkText.includes(k));

        captionList.push({
          text: chunkText,
          fromFrame,
          durationInFrames,
          isHighlight,
        });
      }
    } else {
      // Fallback if wordsData wasn't parsed
      const words = scene.narration.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().split(/\s+/);
      const framesPerChunk = Math.floor((durFrames - BREATHING_SPACE_FRAMES) / 4);
      for (let cIdx = 0; cIdx < 4; cIdx++) {
        const text = words.slice(cIdx * 2, (cIdx + 1) * 2).join(" ").toUpperCase();
        if (text) {
          captionList.push({
            text,
            fromFrame: cIdx * framesPerChunk,
            durationInFrames: framesPerChunk,
            isHighlight: keywords.some((k) => text.includes(k)),
          });
        }
      }
    }

    sceneCaptions.push(captionList);
    console.log(
      `  Scene ${i + 1}: speech=${(actualDur - BREATHING_SPACE_SEC).toFixed(2)}s + breath=${BREATHING_SPACE_SEC}s -> ${durFrames} frames | "${scene.narration}"`
    );
  });

  // Concat all tight clips
  const concatList = path.join(audioDir, "concat.txt");
  fs.writeFileSync(concatList, tightWavFiles.map((f) => `file '${f}'`).join("\n"));
  const fullVoiceWav = path.join(audioDir, "full_voice_tight.wav");
  execSync(`ffmpeg -f concat -safe 0 -i "${concatList}" -c:a pcm_s16le -ar 48000 -ac 2 "${fullVoiceWav}" -y`, { stdio: "ignore" });

  const totalDur = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullVoiceWav}"`)
      .toString()
      .trim()
  );

  console.log(`⚡ Total Voiceover Duration: ${totalDur.toFixed(2)}s (with ~${BREATHING_SPACE_SEC}s breathing room between sentences)`);

  const relAudioSrc = `compositions/8bit-${slug}/audio/full_voice_tight.wav`;
  return {
    audioSrc: relAudioSrc,
    sceneDurations,
    sceneCaptions,
  };
}

// ----------------------------------------------------
// MAIN RENDER RUNNER
// ----------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  let presetKey = "tencent-hy4";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--preset" && args[i + 1]) {
      presetKey = args[i + 1];
      i++;
    }
  }

  const preset = PRESETS[presetKey] || PRESETS["tencent-hy4"];
  const slug = presetKey.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  console.log(`\n======================================================`);
  console.log(`🚀 RENDERING 8-BIT TECH REEL: ${preset.topic}`);
  console.log(`🎨 CRT Terminal: [${preset.crtBrand}] • Handle: [${preset.authorHandle}]`);
  console.log(`======================================================\n`);

  // 1. Synthesize audio and get exact durations
  const { audioSrc, sceneDurations, sceneCaptions } = prepareAudioClips(slug, preset);

  // 2. Build EightBitReelProps
  const reelProps: EightBitReelProps = {
    topic: preset.topic,
    tagBucket: preset.tagBucket,
    authorHandle: preset.authorHandle,
    crtBrand: preset.crtBrand,
    crtSubtitle: preset.crtSubtitle,
    audioSrc,
    bgMusicSrc: "bg_music.wav",
    scenes: preset.scenes.map((s, i) => ({
      id: `scene-${i + 1}`,
      type: s.type,
      durationInFrames: sceneDurations[i],
      headline: s.headline,
      subheadline: s.subheadline,
      tabLabel: s.tabLabel,
      tabColor: s.tabColor,
      title: s.title,
      subtitle: s.subtitle,
      items: s.items,
      footerNote: s.footerNote,
      emote: s.emote,
      terminalText: (s as any).terminalText,
      customVisualizer: (s as any).customVisualizer,
      hasMarkerLoop: (s as any).hasMarkerLoop,
      captions: sceneCaptions[i],
    })),
  };

  // 3. Bundle Remotion
  const entryPoint = path.join(process.cwd(), "components", "remotion", "index.ts");
  console.log("📦 Bundling Remotion composition from:", entryPoint);
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  // 4. Select Composition (EightBitV2Reel for gemini-transcribe & bittu-intro)
  const compId = slug === "gemini-transcribe" || slug === "bittu-intro" ? "EightBitV2Reel" : "EightBitTechReel";
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compId,
    inputProps: reelProps,
  });

  const totalFrames = sceneDurations.reduce((a, b) => a + b, 0);
  console.log(`🎬 Composition selected: ${composition.id} (${totalFrames} frames @ 30fps = ${(totalFrames / 30).toFixed(2)}s)`);

  // 5. Render Video
  const rendersDir = path.join(process.cwd(), "public", "renders");
  fs.mkdirSync(rendersDir, { recursive: true });
  const outputLocation = path.join(rendersDir, `8bit-${slug}.mp4`);

  console.log(`🎥 Rendering 1080x1920 MP4 to: ${outputLocation}...`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps: reelProps,
    onProgress: ({ progress }) => {
      process.stdout.write(`\rRender Progress: ${Math.round(progress * 100)}%`);
    },
  });

  console.log(`\n\n🎉 8-BIT REEL RENDER COMPLETE!`);
  console.log(`📁 Output File: ${outputLocation}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
