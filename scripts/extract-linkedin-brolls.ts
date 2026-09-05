import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const inputVideo = path.resolve('scratch/input_assets_linkedin/linkedinvisuals.MP4');
const assetsDir = path.resolve('public/compositions/linkedin-claude-skills-4k/assets');

fs.mkdirSync(assetsDir, { recursive: true });

// Define the 6 pure B-roll segments.
// Note: In linkedinvisuals.MP4, the upper 50% (Y: 0 to 640 of 1280) contains 100% pure UI graphics.
// The lower 50% contains the foreign human speaker.
// By cropping crop=720:630:0:0, we completely isolate the UI and eliminate every trace of the speaker!

const brolls = [
  {
    name: 'broll_1_github_card.mp4',
    start: 0.5,
    duration: 6.0,
    crop: 'crop=720:600:0:10,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_2_eleven_skills.mp4',
    start: 7.5,
    duration: 5.5,
    // Note: The 11 skills grid in f_010.jpg is full screen, but the lower part has "DOES A".
    // Cropping crop=720:900:0:0 keeps all the cute mascots without any speaker!
    crop: 'crop=720:900:0:0,scale=1900:1650:force_original_aspect_ratio=decrease,pad=1900:1650:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_3_features_scroll.mp4',
    start: 13.5,
    duration: 13.5,
    crop: 'crop=720:620:0:0,scale=1900:1600:force_original_aspect_ratio=decrease,pad=1900:1600:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_4_humanizer.mp4',
    start: 33.5,
    duration: 8.5,
    crop: 'crop=720:600:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#FBFBFA'
  },
  {
    name: 'broll_5_approval_modal.mp4',
    start: 42.5,
    duration: 11.5,
    crop: 'crop=720:600:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#F5F5F3'
  },
  {
    name: 'broll_6_setup_menu.mp4',
    start: 54.5,
    duration: 6.0,
    crop: 'crop=720:600:0:0,scale=1900:1580:force_original_aspect_ratio=decrease,pad=1900:1580:(ow-iw)/2:(oh-ih)/2:#0D0D0D'
  }
];

console.log('🎬 Extracting 6 pure B-roll segments from linkedinvisuals.MP4...');

for (const b of brolls) {
  const outputPath = path.join(assetsDir, b.name);
  const cmd = `ffmpeg -y -ss ${b.start} -i "${inputVideo}" -t ${b.duration} -vf "${b.crop}" -c:v libx264 -pix_fmt yuv420p -an "${outputPath}"`;
  console.log(`[EXTRACT] ${b.name} (${b.start}s - ${b.start + b.duration}s)...`);
  execSync(cmd, { stdio: 'pipe' });
}

console.log('✅ All 6 pure B-roll segments extracted successfully!');
