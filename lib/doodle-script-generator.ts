import type { DoodleScript, SceneType, CharacterPose, CharacterExpression, PropType } from './doodle-plan';
import { generateStructuredJson } from '@/lib/structured-ai';
import { resolveByobConfig } from '@/lib/byob-client';

export async function generateDoodleScript(topic: string, options?: {
  targetDuration?: number;
  tone?: 'educational' | 'exciting' | 'serious' | 'funny';
  language?: string;
  providerConfig?: any; // To pass in BYOB config if needed
}): Promise<DoodleScript> {
  const targetDuration = options?.targetDuration || 60;
  const tone = options?.tone || 'educational';
  const language = options?.language || 'en';
  
  const systemPrompt = `You are an expert scriptwriter for Doodle/Whiteboard Explainer videos.
Create a complete doodle video script about the topic: "${topic}".
Language: ${language}
Tone: ${tone}
Target Duration: ~${targetDuration} seconds

A doodle video consists of scenes. For each scene, you must provide the visual direction and the narration text.
Available Scene Types: 'hook-intro', 'company-showcase', 'data-stats', 'secret-whisper', 'celebration-cta', 'standard'.
Available Character Poses: 'standing', 'pointing', 'thinking', 'holding-prop', 'waving', 'shrugging', 'running'.
Available Character Expressions: 'neutral', 'happy', 'sad', 'surprised', 'angry', 'confused', 'excited'.
Available Prop Types: 'coin-stack', 'line-chart', 'pie-chart', 'bar-chart', 'robot', 'brain', 'gear', 'factory', 'conveyor-belt', 'train', 'car', 'magnet', 'magnifying-glass', 'robotic-hand', 'muscle-arm', 'x-mark', 'glow-lines', 'sparkle', 'dashed-arrow', 'company-logo', 'label', 'number-display', 'plain-stick-figure'.

Rules for maximum engagement:
1. Start with a 'hook-intro' scene that grabs attention immediately.
2. End with a 'celebration-cta' scene.
3. Use 'company-showcase' for brand/company mentions.
4. Use 'data-stats' for numbers/statistics.
5. Use 'secret-whisper' for insider/hidden info.
6. Vary poses and expressions - do NOT repeat the same ones consecutively.
7. Each scene should have 8-15 words of narration (approx 3-5 seconds of speech).
8. Use 1 to 4 props per scene. Do not exceed 4 props.
9. Provide short, punchy 'headline' text for key scenes (3-5 words max).
10. Optionally provide 'speechBubble' text for the character (1-3 words max).

Respond ONLY with a JSON object matching this structure exactly:
{
  "title": "Title of the video",
  "scenes": [
    {
      "id": "scene-1",
      "type": "hook-intro",
      "narration": "Have you ever wondered how AI works?",
      "headline": "AI EXPLAINED",
      "speechBubble": "Wow!",
      "character": {
        "pose": "pointing",
        "expression": "excited"
      },
      "props": [
        { "type": "brain", "scale": 1.2, "x": 70, "y": 50 }
      ]
    }
  ]
}
`;

  // We assume there's some default fallback if providerConfig isn't passed,
  // but for safety we'll use a mocked empty request object if needed, 
  // though typically this should be passed from the route.
  // In our case we'll rely on the caller to provide providerConfig or use default
  const config = options?.providerConfig || { provider: 'google', model: 'gemini-1.5-pro' };
  
  const result = await generateStructuredJson<{
    title: string;
    scenes: Array<any>;
  }>(config, systemPrompt);

  return result as DoodleScript;
}

export async function generateDoodleScriptFromText(narrationText: string, options?: {
  targetSceneCount?: number;
  providerConfig?: any;
}): Promise<DoodleScript> {
  const targetSceneCount = options?.targetSceneCount || 10;
  
  const systemPrompt = `You are an expert storyboard artist for Doodle/Whiteboard Explainer videos.
I will provide you with a completed narration script. You need to break it down into scenes and assign visual elements.

Narration Text:
"${narrationText}"

Target Scene Count: ~${targetSceneCount}

A doodle video consists of scenes. For each scene, provide the visual direction and the exact slice of narration text.
Available Scene Types: 'hook-intro', 'company-showcase', 'data-stats', 'secret-whisper', 'celebration-cta', 'standard'.
Available Character Poses: 'standing', 'pointing', 'thinking', 'holding-prop', 'waving', 'shrugging', 'running'.
Available Character Expressions: 'neutral', 'happy', 'sad', 'surprised', 'angry', 'confused', 'excited'.
Available Prop Types: 'coin-stack', 'line-chart', 'pie-chart', 'bar-chart', 'robot', 'brain', 'gear', 'factory', 'conveyor-belt', 'train', 'car', 'magnet', 'magnifying-glass', 'robotic-hand', 'muscle-arm', 'x-mark', 'glow-lines', 'sparkle', 'dashed-arrow', 'company-logo', 'label', 'number-display', 'plain-stick-figure'.

Rules:
1. Distribute the narration text exactly as provided, splitting it across the scenes. Do not change the text.
2. Follow the visual engagement rules (vary poses, use appropriate props, limit to 4 props).
3. Add a punchy 'headline' for key scenes.

Respond ONLY with a JSON object matching this structure exactly:
{
  "title": "Storyboard for provided text",
  "scenes": [
    {
      "id": "scene-1",
      "type": "hook-intro",
      "narration": "Have you ever wondered how AI works?",
      "headline": "AI EXPLAINED",
      "character": {
        "pose": "pointing",
        "expression": "excited"
      },
      "props": [
        { "type": "brain", "scale": 1.2, "x": 70, "y": 50 }
      ]
    }
  ]
}
`;

  const config = options?.providerConfig || { provider: 'google', model: 'gemini-1.5-pro' };
  
  const result = await generateStructuredJson<{
    title: string;
    scenes: Array<any>;
  }>(config, systemPrompt);

  return result as DoodleScript;
}
