import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, currentStyle, currentLanguage, currentAnimation } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are an AI video editing assistant. The user wants to edit their video captions/style.
      Current style: ${currentStyle}
      Current language: ${currentLanguage}
      Current animation: ${currentAnimation}
      User request: "${prompt}"

      Available styles:
      classic, bold-white, dark-box, outline-only, minimal, hormozi, karaoke,
      karaoke-box, word-pop, word-fade, bounce-pop, typewriter-pro, neon-glow,
      gradient-reveal, wave, keyword-highlight, speaker-color, emoji-punch,
      bold-viral, clean-minimal, creator-pop, kinetic-news, podcast, cinema-wide,
      meme, gaming-flash, reel-neon, story-board, documentary, subway-bold, luxury
      
      Respond ONLY with a JSON object containing the action and params to apply.
      Params can include style, animation, effectPreset, videoEffect, motionPreset,
      language, textColor, activeWordColor, emphasisColor, capitalization,
      animationSpeed, effectIntensity, highlightEnabled.
      language must be english, hinglish, or hindi.
      animation must be fade, bounce, typewriter, karaoke, word-pop, slide-up, zoom, shake, pulse, or flicker.
      effectPreset must be shadow, outline, glow, glass, sticker, or none.
      videoEffect must be none, cinematic, vibrant, noir, warm, cool, sharpen, or vintage.
      motionPreset must be none, punch-in, drift, float, or handheld.
      If style is present, it must be one of the available styles above.
      Example: {"action": "update_caption_settings", "params": {"style": "creator-pop", "animation": "word-pop", "effectPreset": "sticker", "videoEffect": "vibrant", "motionPreset": "punch-in", "language": "hinglish", "textColor": "#ffffff", "activeWordColor": "#ffeb3b", "capitalization": "uppercase", "animationSpeed": 1.2, "effectIntensity": 0.75, "highlightEnabled": true}}`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    return NextResponse.json({ success: true, editCommand: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process AI edit' }, { status: 500 });
  }
}
