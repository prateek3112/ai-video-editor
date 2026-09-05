export type SceneType =
  | 'hook-intro'
  | 'excited-reveal'
  | 'narrative-two-character'
  | 'secret-whisper'
  | 'tech-explainer'
  | 'company-showcase'
  | 'data-stats'
  | 'concept-illustration'
  | 'product-factory'
  | 'money-investment'
  | 'building-industry'
  | 'comparison'
  | 'celebration-cta'
  | 'standard';

export type CharacterPose =
  | 'walking'
  | 'pointing'
  | 'arms-spread'
  | 'shrugging'
  | 'holding'
  | 'holding-prop'
  | 'whispering'
  | 'celebrating'
  | 'thinking'
  | 'standing'
  | 'waving'
  | 'running';

export type CharacterExpression =
  | 'happy'
  | 'surprised'
  | 'winking'
  | 'sad'
  | 'neutral'
  | 'excited'
  | 'angry'
  | 'confused';

export type PropType =
  | 'coin-stack'
  | 'speech-bubble'
  | 'line-chart'
  | 'pie-chart'
  | 'bar-chart'
  | 'robot'
  | 'brain'
  | 'gear'
  | 'factory'
  | 'conveyor-belt'
  | 'train'
  | 'car'
  | 'magnet'
  | 'magnifying-glass'
  | 'robotic-hand'
  | 'muscle-arm'
  | 'x-mark'
  | 'glow-lines'
  | 'sparkle'
  | 'dashed-arrow'
  | 'logo'
  | 'company-logo'
  | 'moe-network'
  | 'context-meter'
  | 'game-controller'
  | 'code-terminal'
  | 'label'
  | 'number-display'
  | 'plain-stick-figure';

export interface DoodleProp {
  type: PropType;
  x: number;
  y: number;
  scale?: number;
  text?: string;
  value?: number;
  color?: string;
  logoSrc?: string;
  logoName?: string;
  items?: string[];
  animationDelay?: number;
}

export interface DoodleScene {
  id: string;
  type: SceneType;
  start: number;
  duration: number;
  characterPose: CharacterPose;
  characterExpression: CharacterExpression;
  characterPosition: { x: number; y: number };
  characterScale?: number;
  props: DoodleProp[];
  headline?: string;
  subtitle: string;
  subtitleWords?: { word: string; start: number; end: number }[];
  speechBubble?: string | { text: string; style?: 'normal' | 'whisper' };
  secondCharacter?: {
    pose: CharacterPose;
    expression: CharacterExpression;
    position: { x: number; y: number };
    isPlain: boolean;
  };
  backgroundColor?: string;
}

export interface CharacterConfig {
  imageSrc?: string;
  headImageSrc?: string;
  headScale?: number;
  tieColor?: string;
  bodyColor?: string;
  bodyStrokeWidth?: number;
}

export interface DoodleScriptScene {
  id?: string;
  narration: string;
  sceneType?: SceneType;
  type?: SceneType;
  pose?: CharacterPose;
  expression?: CharacterExpression;
  character?: {
    pose?: CharacterPose;
    expression?: CharacterExpression;
  };
  props?: Array<{
    type: PropType;
    text?: string;
    value?: number;
    logoName?: string;
    logoSrc?: string;
    scale?: number;
    x?: number;
    y?: number;
  }>;
  headline?: string;
  speechBubble?: string | { text: string; style?: 'normal' | 'whisper' };
  hasSecondCharacter?: boolean;
  secondCharacter?: {
    pose?: CharacterPose;
    expression?: CharacterExpression;
    position?: { x: number; y: number };
    isPlain?: boolean;
  };
}

export interface DoodleScript {
  title: string;
  narration?: string;
  scenes: DoodleScriptScene[];
}

export interface DoodlePlan {
  projectId?: string;
  topic: string;
  script: DoodleScript;
  scenes: DoodleScene[];
  character: CharacterConfig;
  characterImageSrc?: string;
  characterHeadSrc?: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  watermarkText?: string;
}

const DEFAULT_CHARACTER_POSITIONS: Record<string, { x: number; y: number }> = {
  'hook-intro': { x: 210, y: 440 },
  'excited-reveal': { x: 210, y: 440 },
  'narrative-two-character': { x: 200, y: 440 },
  'secret-whisper': { x: 210, y: 440 },
  'tech-explainer': { x: 210, y: 440 },
  'company-showcase': { x: 210, y: 440 },
  'data-stats': { x: 210, y: 440 },
  'concept-illustration': { x: 210, y: 440 },
  'product-factory': { x: 210, y: 440 },
  'money-investment': { x: 210, y: 440 },
  'building-industry': { x: 210, y: 440 },
  'comparison': { x: 210, y: 440 },
  'celebration-cta': { x: 360, y: 490 },
  'standard': { x: 210, y: 440 },
};

const DEFAULT_PROP_POSITIONS: Record<string, { x: number; y: number }> = {
  'hook-intro': { x: 510, y: 440 },
  'excited-reveal': { x: 510, y: 440 },
  'narrative-two-character': { x: 510, y: 440 },
  'secret-whisper': { x: 510, y: 440 },
  'tech-explainer': { x: 510, y: 440 },
  'company-showcase': { x: 510, y: 440 },
  'data-stats': { x: 510, y: 440 },
  'concept-illustration': { x: 510, y: 440 },
  'product-factory': { x: 510, y: 440 },
  'money-investment': { x: 510, y: 440 },
  'building-industry': { x: 510, y: 440 },
  'comparison': { x: 510, y: 440 },
  'celebration-cta': { x: 360, y: 310 },
  'standard': { x: 510, y: 440 },
};

export function createDoodlePlan(opts: {
  projectId?: string;
  topic: string;
  script: DoodleScript;
  characterImageSrc?: string;
  characterHeadSrc?: string;
  fps?: number;
  watermarkText?: string;
}): DoodlePlan {
  let currentTime = 0;
  const fps = opts.fps || 30;
  const charImage = opts.characterImageSrc || opts.characterHeadSrc || '/brand/ai-character.png';

  const scenes: DoodleScene[] = (opts.script.scenes || []).map((sceneData, index) => {
    const rawNarration = sceneData.narration || '';
    const wordCount = rawNarration.trim().split(/\s+/).filter(Boolean).length;
    const duration = Math.max(Math.ceil(wordCount / 2.5), 3);

    const sceneType: SceneType = sceneData.sceneType || sceneData.type || 'standard';
    const charPos = DEFAULT_CHARACTER_POSITIONS[sceneType] || { x: 360, y: 700 };
    const propBasePos = DEFAULT_PROP_POSITIONS[sceneType] || { x: 360, y: 450 };

    const rawProps = Array.isArray(sceneData.props) ? sceneData.props : [];
    const props: DoodleProp[] = rawProps.map((p, pIndex) => {
      const xOffset = rawProps.length > 1 ? (pIndex * 100) - ((rawProps.length - 1) * 50) : 0;
      const yOffset = pIndex % 2 === 0 ? 0 : 30;

      return {
        type: p.type,
        x: typeof p.x === 'number' ? p.x : propBasePos.x + xOffset,
        y: typeof p.y === 'number' ? p.y : propBasePos.y + yOffset,
        scale: typeof p.scale === 'number' ? p.scale : 1.0,
        text: p.text,
        value: p.value,
        logoName: p.logoName,
        logoSrc: p.logoSrc,
        animationDelay: 0.3 + (pIndex * 0.15),
      };
    });

    const sceneId = sceneData.id || `scene-${index}-${sceneType}`;
    const pose: CharacterPose = sceneData.pose || sceneData.character?.pose || (index === 0 ? 'pointing' : 'standing');
    const expression: CharacterExpression = sceneData.expression || sceneData.character?.expression || 'happy';

    const scene: DoodleScene = {
      id: sceneId,
      type: sceneType,
      start: currentTime,
      duration: duration,
      characterPose: pose,
      characterExpression: expression,
      characterPosition: charPos,
      props: props,
      headline: sceneData.headline,
      subtitle: rawNarration,
      speechBubble: sceneData.speechBubble,
      backgroundColor: '#FFFFFF',
    };

    if (sceneData.hasSecondCharacter || sceneData.secondCharacter) {
      scene.secondCharacter = {
        pose: sceneData.secondCharacter?.pose || 'walking',
        expression: sceneData.secondCharacter?.expression || 'neutral',
        position: sceneData.secondCharacter?.position || { x: charPos.x + 220, y: charPos.y },
        isPlain: sceneData.secondCharacter?.isPlain ?? true,
      };
    }

    currentTime += duration;
    return scene;
  });

  return {
    projectId: opts.projectId,
    topic: opts.topic,
    script: opts.script,
    scenes,
    character: {
      imageSrc: charImage,
      headImageSrc: charImage,
      headScale: 2.5,
      tieColor: '#CC3333',
      bodyColor: '#000000',
      bodyStrokeWidth: 4,
    },
    characterImageSrc: charImage,
    characterHeadSrc: charImage,
    duration: currentTime,
    fps,
    width: 720,
    height: 1280,
    watermarkText: opts.watermarkText || 'BW',
  };
}
