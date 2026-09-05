import * as fs from 'fs';
import * as path from 'path';

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
    /* Used during State 1, State 4, State 6, State 9            */
    /* ========================================================= */
    #speaker-fullscreen {
      position: absolute;
      inset: 0;
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
    /* Used during Split Screens 1, 2, 3, 5, 7, 8                */
    /* Fixed geometry: top 2020px, height 1820px                 */
    /* ========================================================= */
    #speaker-split {
      position: absolute;
      top: 2020px;
      left: 50%;
      transform: translateX(-50%);
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
      background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.85) 100%);
      pointer-events: none;
      z-index: 12;
    }

    /* ========================================================= */
    /* BIG BOLD HEADROOM TITLES (caption.mp4 formula)            */
    /* Giant bold Acumin/Helvetica titles in the negative space  */
    /* ========================================================= */
    .headroom-title-box {
      position: absolute;
      top: 240px;
      left: 50%;
      transform: translateX(-50%);
      width: 1960px;
      text-align: center;
      z-index: 50;
      pointer-events: none;
      display: none;
      opacity: 0;
    }

    .title-kicker {
      font-size: 64px;
      font-weight: 800;
      color: #E2E8F0;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.95);
      margin-bottom: 12px;
    }

    .title-hero {
      font-size: 210px;
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 0.92;
      text-transform: uppercase;
      text-shadow: 0 16px 40px rgba(0, 0, 0, 0.95);
    }

    .hero-white {
      color: #FFFFFF;
      text-shadow: 0 16px 50px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 255, 255, 0.3);
    }

    .hero-yellow {
      color: #FFE600; /* Signature Electric Yellow from caption.mp4 */
      text-shadow: 0 16px 50px rgba(0, 0, 0, 0.95), 0 0 70px rgba(255, 230, 0, 0.5);
    }

    .title-sub {
      font-size: 80px;
      font-weight: 800;
      color: #FFFFFF;
      margin-top: 16px;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.95);
    }

    /* ========================================================= */
    /* SPLIT-SCREEN TOP VISUAL CONTAINER (4K)                    */
    /* 1960px wide, height 1680px, top: 140px                   */
    /* Editorial Warm Light Gray / Beige ground (#F7F7F6)        */
    /* ========================================================= */
    #top-visual-card {
      position: absolute;
      top: 140px;
      left: 50%;
      transform: translateX(-50%);
      width: 1960px;
      height: 1680px;
      border-radius: 80px;
      background: #F7F7F6;
      border: 6px solid #FFFFFF;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      overflow: hidden;
      z-index: 30;
      display: none;
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
    }

    .broll-video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ========================================================= */
    /* KINETIC CAPTIONS IN 4K (Abigail Daniella 1-2 words sync) */
    /* Centered in vertical middle (Y=1920) or chest level      */
    /* Animated purely via GPU-accelerated y transform!         */
    /* ========================================================= */
    #caption-stage {
      position: absolute;
      top: 50%; /* Y = 1920px (middle corridor) */
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1800px;
      max-width: 1800px;
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
      max-width: 1800px;
      margin: 0 auto;
      text-align: center;
      line-height: 1.1;
    }

    .word-normal {
      font-family: 'Inter', sans-serif;
      font-size: 92px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      padding: 0 10px;
      text-shadow: 0 6px 25px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 0, 0, 0.9);
      display: inline;
    }

    .word-emphasis {
      font-family: 'Inter', sans-serif;
      font-size: 116px;
      font-weight: 900;
      color: #FFE600; /* Signature Electric Yellow */
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
  <div id="stage" data-composition-id="linkedin-claude-skills-4k" data-width="2160" data-height="3840" data-start="0" data-duration="63.07">
    <!-- Ambient Tech Grid -->
    <div class="ambient-grid"></div>

    <!-- FULL SCREEN SPEAKER CONTAINER (4K) -->
    <div id="speaker-fullscreen">
      <video id="speaker-video-fullscreen" src="./assets/speaker.mp4" data-start="0" data-duration="63.07" muted playsinline></video>
      <div class="speaker-gradient-overlay"></div>
    </div>

    <!-- SPLIT SCREEN LOWER SPEAKER CARD (4K) -->
    <div id="speaker-split">
      <video id="speaker-video-split" src="./assets/speaker.mp4" data-start="0" data-duration="63.07" muted playsinline></video>
      <div class="speaker-gradient-overlay"></div>
    </div>

    <!-- HEADROOM BIG BOLD TITLES (caption.mp4 inspired) -->
    <!-- 1. Intro Hook Title -->
    <div class="headroom-title-box" id="title-hook-1">
      <div class="title-kicker">AUTOMATION DROP</div>
      <div class="title-hero hero-yellow">CLAUDE</div>
      <div class="title-sub">LINKEDIN SKILLS</div>
    </div>

    <!-- 2. Completely Free Title -->
    <div class="headroom-title-box" id="title-free">
      <div class="title-kicker">OPEN SOURCE</div>
      <div class="title-hero hero-white">100% FREE</div>
    </div>

    <!-- 3. 11 Automated Skills Title -->
    <div class="headroom-title-box" id="title-11-skills">
      <div class="title-kicker">CLAUDE CODE ECOSYSTEM</div>
      <div class="title-hero hero-yellow">11 SKILLS</div>
      <div class="title-sub">FULL WORKFLOW ENGINE</div>
    </div>

    <!-- 4. Humanizer Title -->
    <div class="headroom-title-box" id="title-humanizer">
      <div class="title-kicker">THE SECRET WEAPON</div>
      <div class="title-hero hero-yellow">HUMANIZER</div>
      <div class="title-sub">ZERO AI CLICHÉS · NO M-DASHES</div>
    </div>

    <!-- 5. Permission & Approval Title -->
    <div class="headroom-title-box" id="title-approval">
      <div class="title-kicker">SAFETY FIRST</div>
      <div class="title-hero hero-white">PERMISSION</div>
      <div class="title-sub">APPROVAL REQUIRED BEFORE POSTING</div>
    </div>

    <!-- 6. 2 Minute Setup Title -->
    <div class="headroom-title-box" id="title-setup">
      <div class="title-kicker">ONE-CLICK INSTALL</div>
      <div class="title-hero hero-yellow">2 MIN SETUP</div>
      <div class="title-sub">GITHUB REPO ➔ CLAUDE SKILLS</div>
    </div>

    <!-- 7. Climax Call to Action Title -->
    <div class="headroom-title-box" id="title-cta">
      <div class="title-kicker">DROP A COMMENT</div>
      <div class="title-hero hero-yellow">CLAUDE</div>
      <div class="title-sub">I'LL SEND YOU THE COMPLETE REPO</div>
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
        <!-- B-Roll 1: GitHub Card & LinkedIn Logo (3.2s - 8.6s) -->
        <video id="vid-broll-1" class="broll-video-element" src="./assets/broll_1_github_card.mp4" data-start="3.2" data-duration="5.4" muted playsinline style="display: none;"></video>

        <!-- B-Roll 2: 11 Skills Mascot Grid (8.6s - 13.2s) -->
        <video id="vid-broll-2" class="broll-video-element" src="./assets/broll_2_eleven_skills.mp4" data-start="8.6" data-duration="4.6" muted playsinline style="display: none;"></video>

        <!-- B-Roll 3: Features Scroll (13.2s - 27.5s) -->
        <video id="vid-broll-3" class="broll-video-element" src="./assets/broll_3_features_scroll.mp4" data-start="13.2" data-duration="14.3" muted playsinline style="display: none;"></video>

        <!-- B-Roll 4: Humanizer M-dash clean (33.2s - 42.5s) -->
        <video id="vid-broll-4" class="broll-video-element" src="./assets/broll_4_humanizer.mp4" data-start="33.2" data-duration="9.3" muted playsinline style="display: none;"></video>

        <!-- B-Roll 5: Approval Modal (48.5s - 54.5s) -->
        <video id="vid-broll-5" class="broll-video-element" src="./assets/broll_5_approval_modal.mp4" data-start="48.5" data-duration="6.0" muted playsinline style="display: none;"></video>

        <!-- B-Roll 6: Setup Menu (54.5s - 59.7s) -->
        <video id="vid-broll-6" class="broll-video-element" src="./assets/broll_6_setup_menu.mp4" data-start="54.5" data-duration="5.2" muted playsinline style="display: none;"></video>
      </div>
    </div>

    <!-- KINETIC BODY CAPTIONS (caption.mp4 inspired) -->
    <div id="caption-stage">
${cues.map(c => `      <div class="caption-unit" id="cu-${c.id}"><span class="${c.emphasis ? 'word-emphasis' : 'word-normal'}">${c.text}</span></div>`).join('\n')}
    </div>

    <!-- Pulsing 4K CTA Trigger Button (59.7s - 63.07s) -->
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

    // 2. Pure B-Roll Scrubbing
    var vid1 = document.querySelector('#vid-broll-1');
    if (vid1) tl.to(vid1, { currentTime: 5.2, ease: 'none', duration: 5.4 }, 3.2);

    var vid2 = document.querySelector('#vid-broll-2');
    if (vid2) tl.to(vid2, { currentTime: 4.5, ease: 'none', duration: 4.6 }, 8.6);

    var vid3 = document.querySelector('#vid-broll-3');
    if (vid3) tl.to(vid3, { currentTime: 13.0, ease: 'none', duration: 14.3 }, 13.2);

    var vid4 = document.querySelector('#vid-broll-4');
    if (vid4) tl.to(vid4, { currentTime: 8.0, ease: 'none', duration: 9.3 }, 33.2);

    var vid5 = document.querySelector('#vid-broll-5');
    if (vid5) tl.to(vid5, { currentTime: 5.8, ease: 'none', duration: 6.0 }, 48.5);

    var vid6 = document.querySelector('#vid-broll-6');
    if (vid6) tl.to(vid6, { currentTime: 5.0, ease: 'none', duration: 5.2 }, 54.5);

    // =========================================================
    // STATE 1 [0.0s - 3.2s]: FULL SCREEN SPEAKER WITH HOOK TITLE
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
    tl.to('#title-hook-1', { opacity: 0, y: -40, duration: 0.25 }, 2.9);
    tl.set('#title-hook-1', { display: 'none' }, 3.15);

    // =========================================================
    // SPLIT SCREEN 1 [3.2s - 8.6s]: GITHUB CARD & "100% FREE"
    // TOP CARD (top: 140px, height: 1680px), SPEAKER BOTTOM CARD
    // =========================================================
    tl.to('#speaker-fullscreen', { opacity: 0, duration: 0.35, ease: 'power2.in' }, 3.2);
    tl.to('#speaker-split', { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' }, 3.2);

    tl.set('#top-visual-card', { display: 'block', opacity: 1 }, 3.2);
    tl.set('#vid-broll-1', { display: 'block' }, 3.2);
    tl.set('#top-card-title', { textContent: 'github.com / claude-code-linkedin-skills' }, 3.2);
    tl.fromTo('#top-visual-card',
      { y: -100, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)', immediateRender: false },
      3.2
    );

    // "100% FREE" header at 6.6s
    tl.set('#title-free', { display: 'block' }, 6.6);
    tl.fromTo('#title-free',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)', immediateRender: false },
      6.6
    );
    tl.to('#title-free', { opacity: 0, scale: 0.95, duration: 0.2 }, 8.4);
    tl.set('#title-free', { display: 'none' }, 8.6);

    // =========================================================
    // SPLIT SCREEN 2 [8.6s - 13.2s]: 11 SKILLS MASCOT GRID
    // =========================================================
    tl.set('#vid-broll-1', { display: 'none' }, 8.6);
    tl.set('#vid-broll-2', { display: 'block' }, 8.6);
    tl.set('#top-card-title', { textContent: 'claude-skills / ecosystem_catalog.grid' }, 8.6);
    tl.fromTo('#vid-broll-2',
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      8.6
    );

    // Punch-in speaker scale on "total 11 skill hai" at 10.2s
    tl.to('#speaker-split video', { scale: 1.12, duration: 0.35, ease: 'back.out(1.8)' }, 10.2);

    // =========================================================
    // SPLIT SCREEN 3 [13.2s - 27.5s]: FEATURES SCROLL (POST WRITER, ETC)
    // =========================================================
    tl.set('#vid-broll-2', { display: 'none' }, 13.2);
    tl.set('#vid-broll-3', { display: 'block' }, 13.2);
    tl.set('#top-card-title', { textContent: 'linkedin.com / profile_optimization_flow' }, 13.2);
    tl.fromTo('#vid-broll-3',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', immediateRender: false },
      13.2
    );

    // =========================================================
    // STATE 4 [27.5s - 33.2s]: FULL SCREEN SPEAKER PUNCH-IN
    // "Matlab kya post karna hai, kab post karna hai..."
    // =========================================================
    tl.to('#top-visual-card', { opacity: 0, scale: 0.94, duration: 0.25 }, 27.3);
    tl.set('#top-visual-card', { display: 'none' }, 27.5);

    tl.to('#speaker-split', { opacity: 0, scale: 0.94, y: 60, duration: 0.3 }, 27.3);
    tl.to('#speaker-fullscreen', { opacity: 1, duration: 0.35, ease: 'power2.out' }, 27.5);
    tl.to('#speaker-fullscreen video', { scale: 1.18, duration: 0.5, ease: 'power2.out' }, 27.5);

    // =========================================================
    // SPLIT SCREEN 5 [33.2s - 42.5s]: HUMANIZER (M-DASHES CLEAN)
    // =========================================================
    tl.to('#speaker-fullscreen', { opacity: 0, duration: 0.3 }, 33.2);
    tl.to('#speaker-split', { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' }, 33.2);
    tl.set('#speaker-split video', { scale: 1.05 }, 33.2);

    tl.set('#top-visual-card', { display: 'block', opacity: 1 }, 33.2);
    tl.set('#vid-broll-3', { display: 'none' }, 33.2);
    tl.set('#vid-broll-4', { display: 'block' }, 33.2);
    tl.set('#top-card-title', { textContent: 'humanizer / zero_m_dash_cleanup.ai' }, 33.2);
    tl.fromTo('#top-visual-card',
      { y: -80, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false },
      33.2
    );

    // "HUMANIZER" big title at 33.3s
    tl.set('#title-humanizer', { display: 'block' }, 33.3);
    tl.fromTo('#title-humanizer',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
      33.3
    );
    tl.to('#title-humanizer', { opacity: 0, duration: 0.2 }, 36.5);
    tl.set('#title-humanizer', { display: 'none' }, 36.7);

    // =========================================================
    // STATE 6 [42.5s - 48.5s]: FULL SCREEN SPEAKER ("5 AI DETECTORS")
    // =========================================================
    tl.to('#top-visual-card', { opacity: 0, scale: 0.94, duration: 0.25 }, 42.3);
    tl.set('#top-visual-card', { display: 'none' }, 42.5);

    tl.to('#speaker-split', { opacity: 0, scale: 0.94, y: 60, duration: 0.25 }, 42.3);
    tl.to('#speaker-fullscreen', { opacity: 1, duration: 0.35, ease: 'power2.out' }, 42.5);
    tl.set('#speaker-fullscreen video', { scale: 1.15 }, 42.5);

    // =========================================================
    // SPLIT SCREEN 7 [48.5s - 54.5s]: PERMISSION & APPROVAL MODAL
    // =========================================================
    tl.to('#speaker-fullscreen', { opacity: 0, duration: 0.3 }, 48.5);
    tl.to('#speaker-split', { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' }, 48.5);
    tl.set('#speaker-split video', { scale: 1.05 }, 48.5);

    tl.set('#top-visual-card', { display: 'block', opacity: 1 }, 48.5);
    tl.set('#vid-broll-4', { display: 'none' }, 48.5);
    tl.set('#vid-broll-5', { display: 'block' }, 48.5);
    tl.set('#top-card-title', { textContent: 'claude.ai / draft_approval_required' }, 48.5);
    tl.fromTo('#top-visual-card',
      { y: -80, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false },
      48.5
    );

    // "PERMISSION FIRST" title at 48.6s
    tl.set('#title-approval', { display: 'block' }, 48.6);
    tl.fromTo('#title-approval',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
      48.6
    );
    tl.to('#title-approval', { opacity: 0, duration: 0.2 }, 52.0);
    tl.set('#title-approval', { display: 'none' }, 52.2);

    // =========================================================
    // SPLIT SCREEN 8 [54.5s - 59.7s]: 2-MINUTE SETUP
    // =========================================================
    tl.set('#vid-broll-5', { display: 'none' }, 54.5);
    tl.set('#vid-broll-6', { display: 'block' }, 54.5);
    tl.set('#top-card-title', { textContent: 'claude.ai / skills / add_from_github' }, 54.5);
    tl.fromTo('#vid-broll-6',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false },
      54.5
    );

    // "2 MIN SETUP" title at 54.7s
    tl.set('#title-setup', { display: 'block' }, 54.7);
    tl.fromTo('#title-setup',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
      54.7
    );
    tl.to('#title-setup', { opacity: 0, duration: 0.2 }, 58.5);
    tl.set('#title-setup', { display: 'none' }, 58.7);

    // =========================================================
    // STATE 9 [59.7s - 63.07s]: ALL-SPEAKER CLIMAX & CTA
    // =========================================================
    tl.to('#top-visual-card', { opacity: 0, duration: 0.25 }, 59.5);
    tl.set('#top-visual-card', { display: 'none' }, 59.7);

    tl.to('#speaker-split', { opacity: 0, scale: 0.94, y: 60, duration: 0.3 }, 59.5);
    tl.to('#speaker-fullscreen', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 59.7);
    tl.fromTo('#speaker-fullscreen video',
      { scale: 1.05 },
      { scale: 1.18, duration: 0.5, ease: 'back.out(2)', immediateRender: false },
      59.7
    );

    // Big Bold Headroom CTA "CLAUDE"
    tl.set('#title-cta', { display: 'block' }, 59.8);
    tl.fromTo('#title-cta',
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false },
      59.8
    );

    // Pulsing CTA Button in bottom safe zone
    tl.set('#cta-button-container', { display: 'block' }, 59.8);
    tl.fromTo('#cta-button-container',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false },
      59.8
    );
    tl.to('#cta-button-container .cta-pulse-button-4k', {
      scale: 1.06,
      boxShadow: '0 35px 110px rgba(225, 29, 72, 0.85), 0 0 0 12px rgba(255, 255, 255, 0.35)',
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    }, 60.2);

    // =========================================================
    // EXACT KINETIC CAPTION SEQUENCING
    // =========================================================
    var captionData = ${JSON.stringify(cues)};

    captionData.forEach(function(c) {
      var sel = '#cu-' + c.id;
      var exitDuration = 0.08;
      var exitStart = Math.max(c.start + 0.12, c.end - exitDuration);

      // Entrance: crisp pop-in with slight scale and slide
      tl.set(sel, { display: 'block', y: 22, opacity: 0, scale: 1.05 }, c.start);
      tl.to(sel, { y: 0, opacity: 1, scale: 1, duration: 0.12, ease: 'power3.out' }, c.start);

      // Exit: immediate clean cut
      tl.to(sel, { y: -10, opacity: 0, duration: exitDuration, ease: 'power2.in' }, exitStart);
      tl.set(sel, { display: 'none' }, c.end);
    });

    // Caption stage vertical position choreography using GPU-accelerated y transform:
    // When y=0: centered in vertical middle corridor (top: 50%, Y=1920px)
    // When y=950: chest safe zone in full screen (Y=2870px)
    tl.set('#caption-stage', { y: 950 }, 0);      // Full screen 1
    tl.to('#caption-stage', { y: 0, duration: 0.25 }, 3.2);   // Split 1
    tl.to('#caption-stage', { y: 950, duration: 0.25 }, 27.5); // Full 4
    tl.to('#caption-stage', { y: 0, duration: 0.25 }, 33.2);  // Split 5
    tl.to('#caption-stage', { y: 950, duration: 0.25 }, 42.5); // Full 6
    tl.to('#caption-stage', { y: 0, duration: 0.25 }, 48.5);  // Split 7
    tl.to('#caption-stage', { y: 950, duration: 0.25 }, 59.7); // Climax 9

    // Register 4K timeline
    window.__timelines['linkedin-claude-skills-4k'] = tl;
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(compDir, 'index.html'), htmlContent);
console.log('✅ Created 4K composition index.html with pure transform GSAP animations successfully!');
