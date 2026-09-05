import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  const compDir = path.resolve('public/compositions/grok-agent-editorial-middle-captions');
  const rawRenderPath = path.join(compDir, 'raw_render.mp4');
  const outputFinal = path.resolve('public/renders/grok-agent-editorial-middle-captions.mp4');
  const voiceoverPath = path.join(compDir, 'assets/voice_normalized.wav');

  console.log('🚀 STEP 1: RENDERING HIGH-PRECISION HYPERFRAMES COMPOSITION (MIDDLE CAPTIONS)...');
  const renderCmd = `npx hyperframes render "${compDir}" --output "${rawRenderPath}" --fps 30`;
  execSync(renderCmd, { stdio: 'inherit' });

  console.log('🎧 STEP 2: MUXING CLEAN DIALOGUE AUDIO...');
  fs.mkdirSync(path.dirname(outputFinal), { recursive: true });
  const ffmpegCmd = `ffmpeg -i "${rawRenderPath}" -i "${voiceoverPath}" -map 0:v -map 1:a -af volume=1.3 -c:v copy -c:a aac -b:a 256k -shortest "${outputFinal}" -y`;
  console.log('[CMD]', ffmpegCmd);
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log('🎉 FINAL MIDDLE CAPTIONS EDITORIAL REEL READY: ', outputFinal);
}

main().catch((err) => {
  console.error('Fatal error during render:', err);
  process.exit(1);
});
