import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { resolveGeminiApiKey } from "@/lib/byob-client";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { prompt, currentStyle, currentLanguage, currentAnimation, plan } = payload;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required for AI editing" }, { status: 400 });
    }

    const apiKey = resolveGeminiApiKey(req, payload);
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini API Key is required. Please set your BYOB API Key in the top bar.",
        },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an AI video editing assistant. The user wants to edit their video captions, style, overlays, and effects.
Current style: ${currentStyle}
Current language: ${currentLanguage}
Current animation: ${currentAnimation}
User edit request: "${prompt}"

Available styles:
classic, bold-white, dark-box, outline-only, minimal, hormozi, karaoke,
karaoke-box, word-pop, word-fade, bounce-pop, typewriter-pro, neon-glow,
gradient-reveal, wave, keyword-highlight, speaker-color, emoji-punch,
bold-viral, clean-minimal, creator-pop, kinetic-news, podcast, cinema-wide,
meme, gaming-flash, reel-neon, story-board, documentary, subway-bold, luxury

Available languages: english, hinglish, hindi
Available animations: fade, bounce, typewriter, karaoke, word-pop, slide-up, zoom, shake, pulse, flicker
Available videoEffects: none, cinematic, vibrant, noir, warm, cool, sharpen, vintage

Respond ONLY with a JSON object containing:
{
  "action": "update_caption_settings",
  "params": {
    "style": "hormozi",
    "animation": "word-pop",
    "language": "hinglish",
    "textColor": "#FFFFFF",
    "activeWordColor": "#FFE600",
    "capitalization": "uppercase",
    "fontSize": 52,
    "positionY": 0.75,
    "highlightEnabled": true
  },
  "summary": "Updated captions to Hormozi style with active yellow word pop in Hinglish."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");

    return NextResponse.json({
      success: true,
      editCommand: result,
      summary: result.summary || "Applied AI edits to video composition",
    });
  } catch (error: any) {
    console.error("AI Edit error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process AI edit" }, { status: 500 });
  }
}
