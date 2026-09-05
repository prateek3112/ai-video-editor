const fs = require('fs');
const path = require('path');

const compDir = path.resolve('public/compositions/linkedin-claude-skills-4k');
fs.mkdirSync(compDir, { recursive: true });

const cues = JSON.parse(fs.readFileSync('scratch/linkedin_kinetic_cues.json', 'utf8'));

// Generate the HTML with full 4K (2160x3840) styling and GSAP timeline
const htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LinkedIn Claude Skills - 4K Viral Explainer Reel</title>
  <script src="./gsap.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #090D16;
      font-family: 'Inter', 'Helvetica Neue', Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    #stage {
      position: relative;
      width: 2160px;
      height: 3840px;
      overflow: hidden;
      background: #090D16;
    }

    /* Ambient Subtle Tech Grid in 4K */
    .ambient-grid {
      position: absolute;
      inset: 0;
      background-size: 96px 96px;
      background-image: radial-gradient(circle, rgba(255, 255, 255, 0.08) 2px, transparent 2px);
      pointer-events: none;
      z-index: 1;
    }

    /* ========================================================= */
    /* FULL SCREEN SPEAKER CONTAINER (4K)                        */
    /* Used during State 1, State 4, State 9                     */
    /* ========================================================= */
    #speaker-fullscreen {
      position: absolute;
      top: 0;
      left: 0;
      width: 2160px;
      height: 3840px;
      overflow: hidden;
      background: #000000;
      z-index: 10;
      opacity: 1;
    }

    #speaker-fullscreen video {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 38%;
      transform-origin: center 38%;
    }

    /* ========================================================= */
    /* SPLIT-SCREEN LOWER SPEAKER CARD (4K)                      */
    /* Used during Split Screens 1 - 11                          */
    /* Fixed geometry: left 100px, width 1960px, top 2020px      */
    /* ========================================================= */
    #speaker-split {
      position: absolute;
      top: 2020px;
      left: 100px;
      width: 1960px;
      height: 1820px;
      border-radius: 96px 96px 0 0;
      border: 6px solid #FFFFFF;
      box-shadow: 0 -30px 90px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      background: #000000;
      z-index: 25;
      opacity: 0;
    }

    #speaker-split video {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 46%;
      transform-origin: center 46%;
    }

    .speaker-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(9, 13, 22, 0.4) 0%, transparent 22%, transparent 72%, rgba(0, 0, 0, 0.75) 100%);
      pointer-events: none;
    }

    /* ========================================================= */
    /* HEADROOM BIG BOLD EDITORIAL TITLES (caption.mp4 inspired) */
    /* Placed strictly above speaker's hair in safe upper space  */
    /* Left: 0, Width: 2160px, centered text                      */
    /* ========================================================= */
    .headroom-title-box {
      position: absolute;
      top: 240px;
      left: 0;
      width: 2160px;
      text-align: center;
      z-index: 50;
      display: none;
      pointer-events: none;
    }

    .title-kicker {
      font-size: 52px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
      margin-bottom: 8px;
    }

    .title-hero {
      font-size: 155px;
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 0.95;
      text-transform: uppercase;
      display: inline-block;
    }

    .hero-yellow {
      color: #FFE600;
      text-shadow: 0 12px 40px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 230, 0, 0.45);
    }

    .hero-white {
      color: #FFFFFF;
      text-shadow: 0 12px 40px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 255, 255, 0.45);
    }

    .title-sub {
      font-size: 76px;
      font-weight: 800;
      color: #FFFFFF;
      margin-top: 16px;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.95);
    }

    /* ========================================================= */
    /* SPLIT-SCREEN TOP VISUAL CONTAINER (4K)                    */
    /* 1960px wide, left: 100px, height 1680px, top: 140px      */
    /* Editorial Warm Light Gray / Beige ground (#F7F7F6)        */
    /* ========================================================= */
    #top-visual-card {
      position: absolute;
      top: 140px;
      left: 100px;
      width: 1960px;
      height: 1680px;
      border-radius: 80px;
      background: #F7F7F6;
      border: 6px solid #FFFFFF;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      overflow: hidden;
      z-index: 30;
      opacity: 0;
    }

    /* macOS Window Bar in 4K */
    .mac-window-bar-4k {
      height: 96px;
      background: #EAEAE8;
      display: flex;
      align-items: center;
      padding: 0 44px;
      gap: 18px;
      border-bottom: 2px solid #D9D9D6;
    }

    .mac-dot-4k { width: 26px; height: 26px; border-radius: 50%; }
    .dot-close { background: #EF4444; }
    .dot-min { background: #F59E0B; }
    .dot-max { background: #10B981; }

    .mac-title-4k {
      font-family: monospace;
      font-size: 34px;
      color: #555555;
      margin-left: 24px;
      font-weight: 700;
    }

    .visual-content-stage {
      width: 100%;
      height: calc(100% - 96px);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F7F7F6;
    }

    .broll-pane {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      background: #F7F7F6;
    }

    .broll-card-wrapper {
      position: relative;
      width: 1900px;
      height: 1580px;
      flex-shrink: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .broll-video-element {
      position: absolute;
      inset: 0;
      width: 1900px;
      height: 1580px;
      object-fit: contain;
    }

    /* ========================================================= */
    /* SEAMLESS PRATEEK GUGLANI AUTHOR MASKS (Replaces foreign name) */
    /* Pure white background seamlessly blends into LinkedIn cards */
    /* ========================================================= */
    .author-badge-mask {
      position: absolute;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      z-index: 50;
      pointer-events: none;
    }

    .mask-avatar-circle {
      border-radius: 50%;
      background: #191919;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 800;
      flex-shrink: 0;
    }

    .mask-text-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .mask-name-text {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      color: #191919;
      line-height: 1.15;
    }

    .mask-sub-text {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      color: #666666;
      line-height: 1.15;
    }

    /* ========================================================= */
    /* KINETIC CAPTIONS IN 4K (Abigail Daniella 1-2 words sync) */
    /* Width 2160px full centered, Y animated purely by GSAP!    */
    /* ========================================================= */
    #caption-stage {
      position: absolute;
      top: 0;
      left: 0;
      width: 2160px;
      text-align: center;
      z-index: 60;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .caption-unit {
      display: none;
      opacity: 0;
      white-space: normal;
      word-break: keep-all;
      max-width: 1900px;
      margin: 0 auto;
      text-align: center;
      line-height: 1.1;
    }

    .word-normal {
      font-family: 'Inter', sans-serif;
      font-size: 92px;
      font-weight: 900;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      padding: 0 14px;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.98), 0 2px 10px rgba(0, 0, 0, 0.8);
      display: inline;
    }

    .word-emphasis {
      font-family: 'Inter', sans-serif;
      font-size: 96px;
      font-weight: 900;
      color: #FFE600;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      padding: 0 14px;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.98), 0 0 45px rgba(255, 230, 0, 0.7);
      display: inline;
    }

    /* Pulsing 4K CTA Button */
    .cta-pulse-button-4k {
      display: inline-flex;
      align-items: center;
      gap: 32px;
      background: #E11D48;
      color: #FFFFFF;
      padding: 44px 100px;
      border-radius: 9999px;
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      font-size: 64px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      box-shadow: 0 30px 90px rgba(225, 29, 72, 0.7), 0 0 0 8px rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div id="stage" data-composition-id="linkedin-claude-skills-4k" data-start="0" data-width="2160" data-height="3840" data-duration="63.07">
    <!-- Ambient Tech Grid -->
    <div class="ambient-grid"></div>

    <!-- 1. FULLSCREEN SPEAKER (4K) -->
    <div id="speaker-fullscreen">
      <video id="speaker-video-fullscreen" src="./assets/speaker.mp4" data-start="0" data-duration="63.07" muted playsinline></video>
      <div class="speaker-gradient-overlay"></div>
    </div>

    <!-- 2. SPLIT-SCREEN LOWER SPEAKER CARD (4K) -->
    <div id="speaker-split">
      <video id="speaker-video-split" src="./assets/speaker.mp4" data-start="0" data-duration="63.07" muted playsinline></video>
      <div class="speaker-gradient-overlay"></div>
    </div>

    <!-- HEADROOM BIG BOLD TITLES (caption.mp4 inspired) -->
    <!-- 1. Intro Hook Title (0.0s - 2.8s) -->
    <div class="headroom-title-box" id="title-hook-1">
      <div class="title-kicker">AUTOMATION DROP</div>
      <div class="title-hero hero-yellow">CLAUDE</div>
      <div class="title-sub">LINKEDIN SKILLS</div>
    </div>

    <!-- 2. Full Screen Speaker Punch-In: Strategy Title (27.0s - 32.4s) -->
    <div class="headroom-title-box" id="title-strategy">
      <div class="title-kicker">CONTENT BLUEPRINT</div>
      <div class="title-hero hero-white">FULL CADENCE</div>
      <div class="title-sub">WHAT TO POST · WHEN TO POST · ENGAGE</div>
    </div>

    <!-- 3. Full Screen Speaker Punch-In: Humanizer Intro (32.4s - 34.6s) -->
    <div class="headroom-title-box" id="title-humanizer-intro">
      <div class="title-kicker">TOP SECRET</div>
      <div class="title-hero hero-yellow">THE HUMANIZER</div>
      <div class="title-sub">100% ZERO AI TRACES</div>
    </div>

    <!-- 4. Climax Call to Action Title (59.5s - 63.07s) -->
    <div class="headroom-title-box" id="title-cta">
      <div class="title-kicker">DROP A COMMENT</div>
      <div class="title-hero hero-yellow">CLAUDE</div>
      <div class="title-sub">I'LL SEND YOU THE COMPLETE REPO & SETUP</div>
    </div>

    <!-- SPLIT-SCREEN TOP VISUAL CARD (4K) -->
    <div id="top-visual-card">
      <div class="mac-window-bar-4k">
        <div class="mac-dot-4k dot-close"></div>
        <div class="mac-dot-4k dot-min"></div>
        <div class="mac-dot-4k dot-max"></div>
        <span class="mac-title-4k" id="top-card-title">github.com / claude-code-linkedin-skills</span>
      </div>
      <div class="visual-content-stage">
        <!-- 1. B-Roll 1: Repo Card (2.8s - 6.2s) -->
        <div id="pane-broll-1" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-1" class="broll-video-element" src="./assets/broll_1_repo_card.mp4" data-start="2.8" data-duration="3.4" muted playsinline></video>
          </div>
        </div>

        <!-- 2. B-Roll 2: $0 Free Badge (6.2s - 8.5s) -->
        <div id="pane-broll-2" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-2" class="broll-video-element" src="./assets/broll_2_free_badge.mp4" data-start="6.2" data-duration="2.3" muted playsinline></video>
          </div>
        </div>

        <!-- 3. B-Roll 3: 11 Skills Ecosystem Grid (8.5s - 13.0s) -->
        <div id="pane-broll-3" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-3" class="broll-video-element" src="./assets/broll_3_11_skills.mp4" data-start="8.5" data-duration="4.5" muted playsinline></video>
          </div>
        </div>

        <!-- 4. B-Roll 4: 21 Proven Hook Formulas (13.0s - 16.5s) -->
        <div id="pane-broll-4" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-4" class="broll-video-element" src="./assets/broll_4_21_hooks.mp4" data-start="13.0" data-duration="3.5" muted playsinline></video>
          </div>
        </div>

        <!-- 5. B-Roll 5: Comments & Replies (16.5s - 22.8s) -->
        <div id="pane-broll-5" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-5" class="broll-video-element" src="./assets/broll_5_comments_replies.mp4" data-start="16.5" data-duration="6.3" muted playsinline></video>
            <!-- 1. Top author avatar & name (split to avoid clipping comment body at y=914) -->
            <div class="mask-avatar-circle" style="position: absolute; top: 838px; left: 270px; width: 100px; height: 100px; font-size: 38px; z-index: 50; pointer-events: none;">PG</div>
            <div style="position: absolute; top: 838px; left: 395px; width: 620px; height: 50px; background: #FFFFFF; display: flex; align-items: center; z-index: 50; pointer-events: none;">
              <span class="mask-name-text" style="font-size: 36px; line-height: 1;">Prateek Guglani <span style="font-size: 28px; font-weight: 500; color: #666666;">· Author</span></span>
            </div>

            <!-- 2. Bottom reply avatar & name (split to avoid clipping reply body at y=1245) -->
            <div class="mask-avatar-circle" style="position: absolute; top: 1181px; left: 445px; width: 87px; height: 87px; font-size: 32px; z-index: 50; pointer-events: none;">PG</div>
            <div style="position: absolute; top: 1183px; left: 545px; width: 520px; height: 46px; background: #FFFFFF; display: flex; align-items: center; z-index: 50; pointer-events: none;">
              <span class="mask-name-text" style="font-size: 30px; line-height: 1;">Prateek Guglani <span style="font-size: 24px; font-weight: 500; color: #666666;">· Author</span></span>
            </div>
          </div>
        </div>

        <!-- 6. B-Roll 6: Profile & September Calendar (22.8s - 27.0s) -->
        <div id="pane-broll-6" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-6" class="broll-video-element" src="./assets/broll_6_profile_calendar.mp4" data-start="22.8" data-duration="4.2" muted playsinline></video>
          </div>
        </div>

        <!-- 7. B-Roll 7: Humanizer Post Card - Em Dashes Clean (34.6s - 37.5s) -->
        <div id="pane-broll-7" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-7" class="broll-video-element" src="./assets/broll_7_humanizer.mp4" data-start="34.6" data-duration="2.9" muted playsinline></video>
            <!-- Unified Author Header Box (100% covers Liam Johnston & traps video drift) -->
            <div style="position: absolute; top: 295px; left: 180px; width: 680px; height: 155px; background: #FFFFFF; display: flex; align-items: center; gap: 24px; z-index: 50; pointer-events: none;">
              <div class="mask-avatar-circle" style="width: 125px; height: 125px; font-size: 46px;">PG</div>
              <div class="mask-text-col" style="gap: 4px;">
                <div class="mask-name-text" style="font-size: 40px;">Prateek Guglani</div>
                <div class="mask-sub-text" style="font-size: 26px;">Founder · Promptible · now</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. B-Roll 8: ChatGPT Words Crossed Out (37.5s - 41.5s) -->
        <div id="pane-broll-8" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-8" class="broll-video-element" src="./assets/broll_8_ai_words.mp4" data-start="37.5" data-duration="4.0" muted playsinline></video>
            <!-- Dynamic Hand-Drawn Red Marker Strikethroughs across 'leverage' and 'delve' -->
            <svg class="strikethrough-svg" viewBox="0 0 1900 1580" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50;">
              <!-- Leverage Strikethrough -->
              <path id="strike-leverage" d="M 510 780 Q 910 770 1320 765" stroke="#EF4444" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.95" />
              <!-- Delve Strikethrough -->
              <path id="strike-delve" d="M 645 1095 Q 920 1085 1205 1080" stroke="#EF4444" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.95" />
            </svg>
          </div>
        </div>

        <!-- 9. B-Roll 9: 5 AI Detectors Scanning (41.5s - 47.5s) -->
        <div id="pane-broll-9" class="broll-pane">
          <div class="broll-card-wrapper">
            <video id="vid-broll-9" class="broll-video-element" src="./assets/broll_9_ai_detectors.mp4" data-start="41.5" data-duration="6.0" muted playsinline></video>
            <!-- Unified Author Header Box (100% covers Liam Johnston & Promptible subtitle) -->
            <div style="position: absolute; top: 605px; left: 175px; width: 500px; height: 85px; background: #FFFFFF; display: flex; align-items: center; gap: 16px; z-index: 50; pointer-events: none;">
              <div class="mask-avatar-circle" style="width: 72px; height: 72px; font-size: 28px;">PG</div>
              <div class="mask-text-col" style="gap: 3px;">
                <div class="mask-name-text" style="font-size: 28px; line-height: 1.1;">Prateek Guglani</div>
                <div class="mask-sub-text" style="font-size: 19px; line-height: 1.1;">Founder · Promptible · now</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 10. B-Roll 10: Claude Post Draft Approval Modal (47.5s - 54.0s) -->
        <div id="pane-broll-10" class="broll-pane" style="background: #1F1E1B;">
          <div class="broll-card-wrapper">
            <video id="vid-broll-10" class="broll-video-element" src="./assets/broll_10_draft_approval.mp4" data-start="47.5" data-duration="6.5" muted playsinline></video>
            <!-- Unified Author Header Box inside preview card (100% covers Liam Johnston) -->
            <div style="position: absolute; top: 720px; left: 610px; width: 560px; height: 90px; background: #FFFFFF; display: flex; align-items: center; gap: 18px; z-index: 50; pointer-events: none;">
              <div class="mask-avatar-circle" style="width: 75px; height: 75px; font-size: 28px;">PG</div>
              <div class="mask-text-col" style="gap: 2px;">
                <div class="mask-name-text" style="font-size: 32px;">Prateek Guglani <span style="font-size: 26px; font-weight: 500; color: #666666;">• 1st</span></div>
                <div class="mask-sub-text" style="font-size: 22px;">Founder at Promptible · 1m · 🌐</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 11. B-Roll 11: 2-Min Setup Menu (54.0s - 59.5s) -->
        <div id="pane-broll-11" class="broll-pane" style="background: #0D0D0D;">
          <div class="broll-card-wrapper">
            <video id="vid-broll-11" class="broll-video-element" src="./assets/broll_11_setup_github.mp4" data-start="54.0" data-duration="5.5" muted playsinline></video>
          </div>
        </div>
      </div>
    </div>

    <!-- KINETIC BODY CAPTIONS (caption.mp4 inspired) -->
    <div id="caption-stage">
` + cues.map(c => `      <div class="caption-unit" id="cu-${c.id}"><span class="${c.emphasis ? 'word-emphasis' : 'word-normal'}">${c.text}</span></div>`).join('\n') + `
    </div>

    <!-- Pulsing 4K CTA Trigger Button (59.5s - 63.07s) -->
    <div id="cta-button-container" style="display: none; position: absolute; bottom: 260px; left: 50%; transform: translateX(-50%); z-index: 60;">
      <div class="cta-pulse-button-4k">
        <span>💬</span>
        <span>COMMENT "CLAUDE" FOR REPO ➔</span>
      </div>
    </div>
  </div>

  <!-- GSAP Master Animation Engine -->
  <script>
    window.__timelines = window.__timelines || {};
    var tl = gsap.timeline({ paused: true });

    // 1. Continuous 4K Speaker Video Playback on both containers
    var masterVidFull = document.querySelector('#speaker-video-fullscreen');
    if (masterVidFull) {
      tl.to(masterVidFull, { currentTime: 63.07, ease: 'none', duration: 63.07 }, 0);
    }

    var masterVidSplit = document.querySelector('#speaker-video-split');
    if (masterVidSplit) {
      tl.to(masterVidSplit, { currentTime: 63.07, ease: 'none', duration: 63.07 }, 0);
    }

    // 2. Pure B-Roll Scrubbing (11 Clips)
    var vid1 = document.querySelector('#vid-broll-1');
    if (vid1) tl.to(vid1, { currentTime: 3.4, ease: 'none', duration: 3.4 }, 2.8);

    var vid2 = document.querySelector('#vid-broll-2');
    if (vid2) tl.to(vid2, { currentTime: 2.3, ease: 'none', duration: 2.3 }, 6.2);

    var vid3 = document.querySelector('#vid-broll-3');
    if (vid3) tl.to(vid3, { currentTime: 4.5, ease: 'none', duration: 4.5 }, 8.5);

    var vid4 = document.querySelector('#vid-broll-4');
    if (vid4) tl.to(vid4, { currentTime: 3.5, ease: 'none', duration: 3.5 }, 13.0);

    var vid5 = document.querySelector('#vid-broll-5');
    if (vid5) tl.to(vid5, { currentTime: 6.3, ease: 'none', duration: 6.3 }, 16.5);

    var vid6 = document.querySelector('#vid-broll-6');
    if (vid6) tl.to(vid6, { currentTime: 4.2, ease: 'none', duration: 4.2 }, 22.8);

    var vid7 = document.querySelector('#vid-broll-7');
    if (vid7) tl.to(vid7, { currentTime: 2.9, ease: 'none', duration: 2.9 }, 34.6);

    var vid8 = document.querySelector('#vid-broll-8');
    if (vid8) tl.to(vid8, { currentTime: 4.0, ease: 'none', duration: 4.0 }, 37.5);

    var vid9 = document.querySelector('#vid-broll-9');
    if (vid9) tl.to(vid9, { currentTime: 6.0, ease: 'none', duration: 6.0 }, 41.5);

    var vid10 = document.querySelector('#vid-broll-10');
    if (vid10) tl.to(vid10, { currentTime: 6.5, ease: 'none', duration: 6.5 }, 47.5);

    var vid11 = document.querySelector('#vid-broll-11');
    if (vid11) tl.to(vid11, { currentTime: 5.5, ease: 'none', duration: 5.5 }, 54.0);

    // =========================================================
    // SVG RED MARKER STRIKETHROUGHS ON 'leverage' & 'delve' (38.2s, 38.7s)
    // =========================================================
    var strikeLev = document.querySelector('#strike-leverage');
    var strikeDel = document.querySelector('#strike-delve');
    if (strikeLev) {
      var len1 = 900;
      try { len1 = strikeLev.getTotalLength(); } catch(e) {}
      gsap.set(strikeLev, { strokeDasharray: len1, strokeDashoffset: len1 });
      tl.to(strikeLev, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.out' }, 38.2);
    }
    if (strikeDel) {
      var len2 = 600;
      try { len2 = strikeDel.getTotalLength(); } catch(e) {}
      gsap.set(strikeDel, { strokeDasharray: len2, strokeDashoffset: len2 });
      tl.to(strikeDel, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.out' }, 38.7);
    }

    // =========================================================
    // STATE 1 [0.0s - 2.8s]: FULL SCREEN SPEAKER WITH HOOK TITLE
    // =========================================================
    tl.set('#speaker-fullscreen', { opacity: 1, scale: 1, y: 0 }, 0);
    tl.set('#speaker-split', { opacity: 0, scale: 0.94, y: 80 }, 0);

    // Intro Title "CLAUDE LINKEDIN SKILLS" in headroom
    tl.set('#title-hook-1', { display: 'block' }, 0);
    tl.fromTo('#title-hook-1',
      { y: -60, scale: 0.9, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' },
      0.1
    );
    tl.to('#title-hook-1', { opacity: 0, y: -40, duration: 0.25 }, 2.5);
    tl.set('#title-hook-1', { display: 'none' }, 2.75);

    // =========================================================
    // SPLIT SCREEN 1 [2.8s - 6.2s]: GITHUB REPO CARD
    // =========================================================
    tl.to('#speaker-fullscreen', { opacity: 0, duration: 0.35, ease: 'power2.in' }, 2.8);
    tl.to('#speaker-split', { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' }, 2.8);

    tl.set('#top-visual-card', { opacity: 1 }, 2.8);
    tl.set('#pane-broll-1', { display: 'flex' }, 2.8);
    tl.set('#top-card-title', { textContent: 'github.com / claude-code-linkedin-skills' }, 2.8);
    tl.fromTo('#top-visual-card',
      { y: -100, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)', immediateRender: false },
      2.8
    );

    // =========================================================
    // SPLIT SCREEN 2 [6.2s - 8.5s]: $0 FREE BADGE
    // =========================================================
    tl.set('#pane-broll-1', { display: 'none' }, 6.2);
    tl.set('#pane-broll-2', { display: 'flex' }, 6.2);
    tl.set('#top-card-title', { textContent: 'pricing / 100% open source & free' }, 6.2);
    tl.fromTo('#pane-broll-2',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out', immediateRender: false },
      6.2
    );

    // =========================================================
    // SPLIT SCREEN 3 [8.5s - 13.0s]: 11 SKILLS MASCOT GRID
    // =========================================================
    tl.set('#pane-broll-2', { display: 'none' }, 8.5);
    tl.set('#pane-broll-3', { display: 'flex' }, 8.5);
    tl.set('#top-card-title', { textContent: 'claude-skills / ecosystem_catalog.grid' }, 8.5);
    tl.fromTo('#pane-broll-3',
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      8.5
    );

    // Punch-in speaker scale on "total 11 skills"
    tl.to('#speaker-split video', { scale: 1.12, duration: 0.35, ease: 'back.out(1.8)' }, 10.0);

    // =========================================================
    // SPLIT SCREEN 4 [13.0s - 16.5s]: 21 PROVEN HOOK FORMULAS
    // =========================================================
    tl.set('#pane-broll-3', { display: 'none' }, 13.0);
    tl.set('#pane-broll-4', { display: 'flex' }, 13.0);
    tl.set('#top-card-title', { textContent: 'copywriting / 21_proven_hook_formulas.doc' }, 13.0);
    tl.fromTo('#pane-broll-4',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      13.0
    );

    // =========================================================
    // SPLIT SCREEN 5 [16.5s - 22.8s]: COMMENTS & REPLIES
    // =========================================================
    tl.set('#pane-broll-4', { display: 'none' }, 16.5);
    tl.set('#pane-broll-5', { display: 'flex' }, 16.5);
    tl.set('#top-card-title', { textContent: 'linkedin.com / smart_engagement_replies' }, 16.5);
    tl.fromTo('#pane-broll-5',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      16.5
    );

    // =========================================================
    // SPLIT SCREEN 6 [22.8s - 27.0s]: PROFILE & SEPTEMBER CALENDAR
    // =========================================================
    tl.set('#pane-broll-5', { display: 'none' }, 22.8);
    tl.set('#pane-broll-6', { display: 'flex' }, 22.8);
    tl.set('#top-card-title', { textContent: 'linkedin.com / profile_optimization_calendar' }, 22.8);
    tl.fromTo('#pane-broll-6',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      22.8
    );

    // =========================================================
    // STATE 4 [27.0s - 34.6s]: FULL SCREEN SPEAKER PUNCH-IN
    // "Matlab kya post karna hai, kab post karna hai..."
    // =========================================================
    tl.to('#top-visual-card', { opacity: 0, scale: 0.94, duration: 0.25 }, 26.8);
    tl.set('#pane-broll-6', { display: 'none' }, 27.0);

    tl.to('#speaker-split', { opacity: 0, scale: 0.94, y: 60, duration: 0.28 }, 26.8);
    tl.to('#speaker-fullscreen', { opacity: 1, duration: 0.35, ease: 'power2.out' }, 27.0);
    tl.to('#speaker-fullscreen video', { scale: 1.18, duration: 0.5, ease: 'power2.out' }, 27.0);

    // Strategy title in headroom (27.2s - 32.0s)
    tl.set('#title-strategy', { display: 'block' }, 27.2);
    tl.fromTo('#title-strategy',
      { y: -40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.8)', immediateRender: false },
      27.2
    );
    tl.to('#title-strategy', { opacity: 0, duration: 0.25 }, 32.0);
    tl.set('#title-strategy', { display: 'none' }, 32.3);

    // Humanizer intro title in headroom (32.4s - 34.3s)
    tl.to('#speaker-fullscreen video', { scale: 1.25, duration: 0.35, ease: 'back.out(1.8)' }, 32.4);
    tl.set('#title-humanizer-intro', { display: 'block' }, 32.4);
    tl.fromTo('#title-humanizer-intro',
      { y: -40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
      32.4
    );
    tl.to('#title-humanizer-intro', { opacity: 0, duration: 0.25 }, 34.3);
    tl.set('#title-humanizer-intro', { display: 'none' }, 34.5);

    // =========================================================
    // SPLIT SCREEN 7 [34.6s - 37.5s]: HUMANIZER (EM DASHES CLEAN)
    // =========================================================
    tl.to('#speaker-fullscreen', { opacity: 0, duration: 0.3 }, 34.6);
    tl.to('#speaker-split', { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' }, 34.6);
    tl.set('#speaker-split video', { scale: 1.05 }, 34.6);

    tl.set('#top-visual-card', { opacity: 1 }, 34.6);
    tl.set('#pane-broll-7', { display: 'flex' }, 34.6);
    tl.set('#top-card-title', { textContent: 'humanizer / zero_em_dash_cleanup.ai' }, 34.6);
    tl.fromTo('#top-visual-card',
      { y: -80, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false },
      34.6
    );

    // =========================================================
    // SPLIT SCREEN 8 [37.5s - 41.5s]: CHATGPT WORDS REMOVED
    // =========================================================
    tl.set('#pane-broll-7', { display: 'none' }, 37.5);
    tl.set('#pane-broll-8', { display: 'flex' }, 37.5);
    tl.set('#top-card-title', { textContent: 'humanizer / chatgpt_cliche_filter' }, 37.5);
    tl.fromTo('#pane-broll-8',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      37.5
    );

    // =========================================================
    // SPLIT SCREEN 9 [41.5s - 47.5s]: 5 AI DETECTORS AUDIT
    // =========================================================
    tl.set('#pane-broll-8', { display: 'none' }, 41.5);
    tl.set('#pane-broll-9', { display: 'flex' }, 41.5);
    tl.set('#top-card-title', { textContent: 'pre-publish / 5_ai_detectors_audit' }, 41.5);
    tl.fromTo('#pane-broll-9',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      41.5
    );

    // =========================================================
    // SPLIT SCREEN 10 [47.5s - 54.0s]: DRAFT APPROVAL REQUIRED
    // =========================================================
    tl.set('#pane-broll-9', { display: 'none' }, 47.5);
    tl.set('#pane-broll-10', { display: 'flex' }, 47.5);
    tl.set('#top-card-title', { textContent: 'claude.ai / draft_approval_required' }, 47.5);
    tl.fromTo('#pane-broll-10',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      47.5
    );

    // =========================================================
    // SPLIT SCREEN 11 [54.0s - 59.5s]: 2-MIN SETUP (SETTINGS -> GITHUB)
    // =========================================================
    tl.set('#pane-broll-10', { display: 'none' }, 54.0);
    tl.set('#pane-broll-11', { display: 'flex' }, 54.0);
    tl.set('#top-card-title', { textContent: 'claude.ai / settings / add_from_github' }, 54.0);
    tl.fromTo('#pane-broll-11',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      54.0
    );

    // =========================================================
    // STATE 9 [59.5s - 63.07s]: ALL-SPEAKER CLIMAX & CTA
    // =========================================================
    tl.to('#top-visual-card', { opacity: 0, duration: 0.25 }, 59.3);
    tl.set('#pane-broll-11', { display: 'none' }, 59.5);

    tl.to('#speaker-split', { opacity: 0, scale: 0.94, y: 60, duration: 0.28 }, 59.3);
    tl.to('#speaker-fullscreen', { opacity: 1, duration: 0.35, ease: 'power2.out' }, 59.5);
    tl.fromTo('#speaker-fullscreen video',
      { scale: 1.05 },
      { scale: 1.18, duration: 0.5, ease: 'back.out(2)', immediateRender: false },
      59.5
    );

    // Big Bold Headroom CTA "CLAUDE"
    tl.set('#title-cta', { display: 'block' }, 59.6);
    tl.fromTo('#title-cta',
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false },
      59.6
    );

    // Pulsing 4K CTA Button in bottom safe zone on "Comment kar do Claude..."
    tl.set('#cta-button-container', { display: 'block' }, 60.3);
    tl.fromTo('#cta-button-container',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
      60.3
    );
    tl.to('#cta-button-container .cta-pulse-button-4k', {
      scale: 1.06,
      boxShadow: '0 35px 110px rgba(225, 29, 72, 0.85), 0 0 0 12px rgba(255, 255, 255, 0.35)',
      duration: 0.55,
      repeat: 5,
      yoyo: true,
      ease: 'sine.inOut'
    }, 60.7);

    // =========================================================
    // EXACT KINETIC CAPTION SEQUENCING
    // =========================================================
    var captionData = ${JSON.stringify(cues)};

    captionData.forEach(function(c) {
      var sel = '#cu-' + c.id;
      var exitDuration = 0.08;
      var exitStart = Math.max(c.start + 0.10, c.end - exitDuration);

      // Entrance: crisp pop-in with slight scale and slide
      tl.set(sel, { display: 'block', opacity: 0, scale: 1.05 }, c.start);
      tl.to(sel, { opacity: 1, scale: 1, duration: 0.10, ease: 'power3.out' }, c.start);

      // Exit: immediate clean cut
      tl.to(sel, { opacity: 0, duration: exitDuration, ease: 'power2.in' }, exitStart);
      tl.set(sel, { display: 'none' }, c.end);
    });

    // Caption stage vertical position:
    // Split screens: centered in vertical middle corridor (Y = 1880px)
    // Full screen speaker: lower third chest safe zone (Y = 2880px)
    tl.set('#caption-stage', { y: 2880 }, 0);      // Full screen 1
    tl.to('#caption-stage', { y: 1880, duration: 0.25 }, 2.8);   // Split 1
    tl.to('#caption-stage', { y: 2880, duration: 0.25 }, 27.0);  // Full 4
    tl.to('#caption-stage', { y: 1880, duration: 0.25 }, 34.6);  // Split 7
    tl.to('#caption-stage', { y: 2880, duration: 0.25 }, 59.5);  // Climax 9

    // Register 4K timeline
    window.__timelines['linkedin-claude-skills-4k'] = tl;
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(compDir, 'index.html'), htmlContent);
console.log('✅ Created 4K composition index.html successfully!');
