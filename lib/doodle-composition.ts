import type { DoodlePlan, DoodleScene } from './doodle-plan';
import {
  drawPixelMascot,
  drawDeskWorkstation,
  drawTimelineFooter,
  drawTencentIntroCard,
  drawMoEArchitectureCard,
  drawContextSpecCard,
  drawGameDevCard,
  drawHuggingFaceCard,
  drawCTAEditorialCard,
} from './doodle-svg-library';

function escapeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(input: string): string {
  if (!input) return "";
  return escapeHtml(input).replace(/\n/g, " ");
}

// Exact frame-accurate kinetic caption timing chunks matching the narration
const SCENE_CAPTIONS: Record<number, Array<{ text: string; start: number; duration: number; isHighlight: boolean }>> = {
  0: [
    { text: "STOP SCROLLING!", start: 0.00, duration: 1.16, isHighlight: true },
    { text: "TENCENT JUST", start: 1.16, duration: 1.20, isHighlight: true },
    { text: "DROPPED THE", start: 2.36, duration: 1.20, isHighlight: false },
    { text: "AI BOMBSHELL!", start: 3.56, duration: 1.21, isHighlight: true },
  ],
  1: [
    { text: "MEET HY4:", start: 0.00, duration: 1.26, isHighlight: true },
    { text: "A 770-BILLION", start: 1.26, duration: 1.27, isHighlight: true },
    { text: "PARAMETER", start: 2.53, duration: 1.26, isHighlight: false },
    { text: "OPEN-WEIGHTS MONSTER.", start: 3.79, duration: 1.24, isHighlight: true },
  ],
  2: [
    { text: "IT PACKS A", start: 0.00, duration: 1.13, isHighlight: false },
    { text: "ONE MILLION", start: 1.13, duration: 1.13, isHighlight: true },
    { text: "TOKEN CONTEXT", start: 2.26, duration: 1.13, isHighlight: true },
    { text: "WINDOW FOR REPOS.", start: 3.39, duration: 1.14, isHighlight: true },
  ],
  3: [
    { text: "HANDLING EVERYTHING", start: 0.00, duration: 1.03, isHighlight: false },
    { text: "FROM SOFTWARE", start: 1.03, duration: 1.03, isHighlight: true },
    { text: "ENGINEERING TO", start: 2.06, duration: 1.04, isHighlight: false },
    { text: "3D GAME DEV!", start: 3.10, duration: 1.10, isHighlight: true },
  ],
  4: [
    { text: "WHILE CLOSED", start: 0.00, duration: 1.29, isHighlight: false },
    { text: "MODELS CHARGE,", start: 1.29, duration: 1.29, isHighlight: true },
    { text: "HY4 IS", start: 2.58, duration: 1.30, isHighlight: false },
    { text: "100% FREE!", start: 3.88, duration: 1.29, isHighlight: true },
  ],
  5: [
    { text: "COMMENT INSTALL", start: 0.00, duration: 1.00, isHighlight: true },
    { text: "FOR THE", start: 1.00, duration: 1.00, isHighlight: false },
    { text: "FULL SETUP", start: 2.00, duration: 1.00, isHighlight: true },
    { text: "GUIDE & ALPHA!", start: 3.00, duration: 0.95, isHighlight: true },
  ],
};

export function compileDoodleHtml(plan: DoodlePlan): string {
  const width = plan.width || 720;
  const height = plan.height || 1280;
  const fps = plan.fps || 30;
  const totalDuration = plan.scenes.reduce((acc, scene) => Math.max(acc, scene.start + scene.duration), plan.duration || 0);
  const compId = escapeAttr(plan.projectId || 'doodle-editorial');

  const sceneVisuals = [
    // Scene 1: Tencent Desk Workstation Intro
    `
      <div class="intro-headline">Tencent Dropped An AI Bombshell!</div>
      <div class="intro-subheadline">HY4 • 770B Open-Weights Foundation Model</div>
      <svg style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none;" viewBox="0 0 720 1280">
        ${drawDeskWorkstation({ x: 360, y: 560, scale: 1.25, id: 'desk-intro-ws' })}
      </svg>
    `,
    // Scene 2: 770B MoE Architecture Card
    `
      <svg style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none;" viewBox="0 0 720 1280">
        ${drawMoEArchitectureCard()}
      </svg>
    `,
    // Scene 3: 1,000,000 Context Spec Card
    `
      <svg style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none;" viewBox="0 0 720 1280">
        ${drawContextSpecCard()}
      </svg>
    `,
    // Scene 4: 3D & Dev Workflows Card
    `
      <svg style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none;" viewBox="0 0 720 1280">
        ${drawGameDevCard()}
      </svg>
    `,
    // Scene 5: Hugging Face 100% Free Card
    `
      <svg style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none;" viewBox="0 0 720 1280">
        ${drawHuggingFaceCard()}
      </svg>
    `,
    // Scene 6: Bytes with Bittu CTA Card
    `
      <svg style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none;" viewBox="0 0 720 1280">
        ${drawCTAEditorialCard()}
      </svg>
    `,
  ];

  const scenesHtml = plan.scenes.map((scene, idx) => {
    const sceneId = escapeAttr(scene.id);
    const visualContent = sceneVisuals[idx % sceneVisuals.length];
    const chunks = SCENE_CAPTIONS[idx] || [];

    const kineticCaptionsHtml = `
      <div id="caption-stream-${sceneId}" class="kinetic-caption-stream">
        ${chunks.map((c, i) => `
          <span id="chunk-${sceneId}-${i}" class="caption-chunk ${c.isHighlight ? 'hl-yellow' : ''}">${escapeHtml(c.text)}</span>
        `).join('')}
      </div>
    `;

    return `
      <section id="scene-${sceneId}" class="clip doodle-scene" data-start="${scene.start}" data-duration="${scene.duration}" style="position: absolute; inset: 0; visibility: hidden; opacity: 0;">
        ${visualContent}
        ${kineticCaptionsHtml}
      </section>
    `;
  }).join('\n');

  const scenesData = JSON.stringify(plan.scenes.map((s, idx) => ({
    id: s.id,
    start: s.start,
    duration: s.duration,
    step: idx + 1,
    totalSteps: plan.scenes.length,
    chunks: SCENE_CAPTIONS[idx] || [],
  })));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bytes with Bittu - ${compId}</title>
  <script src="./gsap.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900;950&display=swap');

    * {
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: #FFFFFF;
    }

    #stage {
      position: relative;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #FFFFFF;
    }

    .doodle-scene {
      position: absolute;
      inset: 0;
    }

    .intro-headline {
      position: absolute;
      top: 130px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Georgia', serif;
      font-weight: 700;
      font-size: 42px;
      color: #99422B;
      text-align: center;
      max-width: 90%;
      line-height: 1.18;
      letter-spacing: -0.5px;
      z-index: 50;
    }

    .intro-subheadline {
      position: absolute;
      top: 260px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 16px;
      color: #64748B;
      text-align: center;
      max-width: 85%;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      z-index: 50;
    }

    .kinetic-caption-stream {
      position: absolute;
      top: 1010px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      height: 90px;
      text-align: center;
      z-index: 100;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .caption-chunk {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      visibility: hidden;
      opacity: 0;
      font-family: 'Nunito', system-ui, sans-serif;
      font-size: 52px;
      font-weight: 950;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      white-space: nowrap;
      -webkit-text-stroke: 4px #000000;
      text-shadow: 0 10px 30px rgba(0, 0, 0, 0.95), 0 4px 8px rgba(0, 0, 0, 0.9);
    }

    .caption-chunk.hl-yellow {
      color: #FBBF24;
      -webkit-text-stroke: 4px #000000;
    }

    .top-nav-bar {
      position: absolute;
      top: 45px;
      left: 45px;
      right: 45px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 120;
    }

    .pill-bucket {
      background: #FEE2E2;
      color: #DC2626;
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 14px;
      padding: 6px 16px;
      border-radius: 999px;
    }

    .pill-handle {
      color: #64748B;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div id="stage" data-composition-id="${compId}" data-start="0" data-duration="${totalDuration}" data-width="${width}" data-height="${height}" data-fps="${fps}">
    
    <!-- Top Nav Header (char.mp4 Style) -->
    <div class="top-nav-bar">
      <div class="pill-bucket">Bucket 1</div>
      <div class="pill-handle">@byteswithbittu</div>
    </div>

    <!-- Scenes Canvas -->
    ${scenesHtml}

    <!-- Bottom Timeline Footer Track -->
    <svg id="persistent-timeline" style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; pointer-events: none; z-index: 90;" viewBox="0 0 720 1280">
      ${drawTimelineFooter({ x: 360, y: 1190, width: 620, currentStep: 1, totalSteps: plan.scenes.length })}
    </svg>
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    var timeline = gsap.timeline({ paused: true });
    
    var scenes = ${scenesData};
    var totalWidth = 620;
    var totalSteps = scenes.length;

    scenes.forEach(function(scene, sIdx) {
      var start = scene.start;
      var duration = scene.duration;
      var end = start + duration;
      
      // Show scene atomically using autoAlpha
      timeline.set('#scene-' + scene.id, { autoAlpha: 1 }, start);

      // Card entrance spring pop
      var card = document.querySelector('#scene-' + scene.id + ' .editorial-paper-card, #scene-' + scene.id + ' #desk-intro-ws');
      if (card) {
        timeline.fromTo(card, 
          { autoAlpha: 0, scale: 0.92 }, 
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.8)' }, 
          start
        );
      }

      // Smooth Natural 4-Leg Walking Kinematics for Timeline Walker
      timeline.to('.mascot-leg.leg-1, .mascot-leg.leg-3', {
        scaleY: 0.65,
        duration: 0.14,
        yoyo: true,
        repeat: Math.ceil(duration / 0.14) * 2,
        ease: 'sine.inOut',
        transformOrigin: 'top center'
      }, start);

      timeline.to('.mascot-leg.leg-2, .mascot-leg.leg-4', {
        scaleY: 0.65,
        duration: 0.14,
        yoyo: true,
        repeat: Math.ceil(duration / 0.14) * 2,
        ease: 'sine.inOut',
        transformOrigin: 'top center',
        delay: 0.07
      }, start);

      // Pixel Mascot Eye Blinks
      timeline.to('.mascot-left-eye, .mascot-right-eye', {
        scaleY: 0.1,
        duration: 0.08,
        repeat: Math.max(2, Math.floor(duration / 1.8)),
        yoyo: true,
        repeatDelay: 1.8,
        ease: 'power2.inOut',
        transformOrigin: 'center center'
      }, start + 0.3);

      // Timeline Walker Mascot Progress
      var targetRatio = (sIdx + 1) / totalSteps;
      var targetX = -totalWidth / 2 + (totalWidth * targetRatio);
      timeline.to('#timeline-walker-mascot', {
        x: targetX,
        duration: 0.45,
        ease: 'power2.out'
      }, start);

      // ZERO-LAG KINETIC CAPTIONS USING ATOMIC AUTOALPHA
      var chunks = scene.chunks || [];
      chunks.forEach(function(chunk, idx) {
        var chunkSel = '#chunk-' + scene.id + '-' + idx;
        var chunkStart = start + chunk.start;
        var chunkEnd = chunkStart + chunk.duration;

        timeline.set(chunkSel, { autoAlpha: 1, scale: 1.05 }, chunkStart);
        timeline.set(chunkSel, { autoAlpha: 0 }, chunkEnd);
      });

      // Scene exit
      timeline.set('#scene-' + scene.id, { autoAlpha: 0 }, end);
    });

    window.__timelines['${compId}'] = timeline;
  </script>
</body>
</html>`;
}
