import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const inputVideo = path.resolve('scratch/input_assets_linkedin/linkedinvisuals.MP4');
const assetsDir = path.resolve('public/compositions/linkedin-claude-skills-4k/assets');

fs.mkdirSync(assetsDir, { recursive: true });

// 11 Pure Sentence-Matched B-Roll Segments
// Resolution inside #top-visual-card is 1900x1580 (#F7F7F6 background)
const brolls = [
  {
    name: 'broll_1_repo_card.mp4',
    start: 0.5,
    duration: 4.2,
    sourceDuration: 4.2,
    // GitHub repo card & Claude mascot
    crop: 'crop=720:500:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_2_free_badge.mp4',
    start: 4.8,
    duration: 2.4,
    sourceDuration: 2.4,
    // $0 / Completely Free badge
    crop: 'crop=720:500:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_3_11_skills.mp4',
    start: 7.8,
    sourceDuration: 2.4,
    duration: 4.5, // audio is 8.5s - 13.0s (4.5s)
    // 11 Skills Mascot Grid (clean 720:760:0:80 keeps all 11 mascots, 0% speaker)
    // Stretched across full 4.5s
    filter: 'crop=720:760:0:80,setpts=1.875*PTS,scale=1900:1650:force_original_aspect_ratio=decrease,pad=1900:1650:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_4_21_hooks.mp4',
    start: 12.8,
    sourceDuration: 2.2,
    duration: 3.5, // audio is 13.0s - 16.5s (3.5s)
    // 21 Hook Formulas document list
    filter: 'crop=720:500:0:0,setpts=1.591*PTS,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_5_comments_replies.mp4',
    start: 16.0,
    sourceDuration: 2.0,
    duration: 6.3, // audio is 16.5s - 22.8s (6.3s)
    // Stationary card with mascot and live replies typing: slowed down to avoid scroll-up leak
    filter: 'crop=720:650:0:150,setpts=3.15*PTS,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_6_profile_calendar.mp4',
    start: 21.8,
    duration: 4.2,
    sourceDuration: 4.2, // audio is 22.8s - 27.0s (4.2s)
    // September weekly calendar cropped below profile header (100% clean of all names)
    filter: 'crop=720:550:0:330,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_7_humanizer.mp4',
    start: 28.6, // Card stays 100% centered, em-dashes disappear at 30.8s
    duration: 3.2,
    sourceDuration: 3.2, // audio is 34.6s - 37.5s (2.9s)
    // Post card where em-dashes disappear
    crop: 'crop=720:500:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_8_ai_words.mp4',
    start: 33.5,
    sourceDuration: 2.3,
    duration: 4.0, // audio is 37.5s - 41.5s (4.0s)
    // "leverage" & "delve" ChatGPT words
    // Crop 440:460:140:20 isolates the words with ZERO side card slivers and 0% creator!
    filter: 'crop=440:460:140:20,setpts=1.739*PTS,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_9_ai_detectors.mp4',
    start: 37.2,
    sourceDuration: 3.5,
    duration: 6.0, // audio is 41.5s - 47.5s (6.0s)
    // 5 AI Detectors scanning smoothly without cutting into Claude UI
    filter: 'crop=720:500:0:0,setpts=1.714285*PTS,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_10_draft_approval.mp4',
    start: 42.5,
    sourceDuration: 3.3,
    duration: 6.5, // audio is 47.5s - 54.0s (6.5s)
    // Claude draft preview with [No, keep editing] [Yes, post it] - stationary modal
    filter: 'crop=720:500:0:0,setpts=1.97*PTS,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#1F1E1B'
  },
  {
    name: 'broll_11_setup_github.mp4',
    start: 48.5,
    duration: 5.5,
    sourceDuration: 5.5, // audio is 54.0s - 59.5s (5.5s)
    // Claude Settings ➔ Skills ➔ Add from GitHub ➔ Paste Repo URL ➔ Save
    // Strictly cuts off at 54.0s of source (ZERO foreign speaker at 57s)
    crop: 'crop=720:480:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#0D0D0D'
  }
];

console.log('🎬 Extracting 11 pure sentence-matched B-roll segments from linkedinvisuals.MP4...');

for (const b of brolls) {
  const outputPath = path.join(assetsDir, b.name);
  const vf = b.filter || b.crop;
  const srcDur = b.sourceDuration || b.duration;
  // -ss before -i ensures accurate input seeking with setpts filter
  const cmd = `ffmpeg -y -ss ${b.start} -i "${inputVideo}" -t ${srcDur} -vf "${vf}" -c:v libx264 -pix_fmt yuv420p -g 1 -keyint_min 1 -r 30 -an -t ${b.duration} "${outputPath}"`;
  console.log(`[EXTRACT] ${b.name} (src: ${b.start}s - ${b.start + srcDur}s, out dur: ${b.duration}s)...`);
  execSync(cmd, { stdio: 'pipe' });
}

console.log('✅ All 11 pure sentence-matched B-roll segments extracted successfully!');
