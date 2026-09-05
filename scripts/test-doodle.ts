import { createDoodlePlan } from '../lib/doodle-plan';
import { compileDoodleHtml } from '../lib/doodle-composition';
import fs from 'fs';
import path from 'path';

async function main() {
  const plan = createDoodlePlan({
    topic: 'NVIDIA AI Revolution',
    characterImageSrc: '/brand/ai-character.png',
    script: {
      title: 'NVIDIA AI Revolution',
      scenes: [
        {
          narration: "You missed SanDisk. Don't miss what is coming next.",
          sceneType: 'hook-intro',
          pose: 'pointing',
          expression: 'excited',
          headline: 'YOU MISSED SANDISK',
          props: [{ type: 'coin-stack', value: 1000 }]
        },
        {
          narration: 'NVIDIA and its CEO are leading the entire robotics age.',
          sceneType: 'company-showcase',
          pose: 'pointing',
          expression: 'happy',
          props: [{ type: 'company-logo', logoName: 'nvidia' }, { type: 'robot' }]
        },
        {
          narration: 'Actuators and gears represent over 70% of robot costs.',
          sceneType: 'data-stats',
          pose: 'shrugging',
          expression: 'surprised',
          headline: '70% COST IN ACTUATORS',
          props: [{ type: 'pie-chart', value: 70 }, { type: 'gear' }]
        },
        {
          narration: 'Subscribe now so you never miss the next 100x move!',
          sceneType: 'celebration-cta',
          pose: 'celebrating',
          expression: 'excited',
          speechBubble: 'Join us!',
          props: [{ type: 'sparkle' }, { type: 'glow-lines' }]
        }
      ]
    }
  });

  const html = compileDoodleHtml(plan);
  const targetDir = path.join(process.cwd(), 'public', 'compositions', 'test-doodle');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
  fs.writeFileSync(path.join(targetDir, 'hyperframes.json'), JSON.stringify({
    $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json',
    media: { autoProxy: true }
  }, null, 2));
  fs.writeFileSync(path.join(targetDir, 'meta.json'), JSON.stringify({ id: 'test-doodle', name: 'Test Doodle' }, null, 2));
  fs.copyFileSync(path.join(process.cwd(), 'node_modules', 'gsap', 'dist', 'gsap.min.js'), path.join(targetDir, 'gsap.min.js'));
  console.log('SUCCESS: Doodle composition generated. Total scenes:', plan.scenes.length, 'Duration:', plan.duration);
}

main().catch(console.error);
