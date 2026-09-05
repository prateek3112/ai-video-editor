import { CharacterPose, CharacterExpression, PropType } from './doodle-plan';

// ----------------------------------------------------
// 1. ANIMATED PIXEL MASCOT ("BITTU") WITH RICH FX
// Authentic 8-bit terracotta mascot from char.mp4
// ----------------------------------------------------
export function drawPixelMascot(opts: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
  id?: string;
  isMini?: boolean;
  emote?: 'lightbulb' | 'sparkle' | 'trophy' | 'fire' | 'exclamation';
}): string {
  const {
    x = 200,
    y = 500,
    scale = 1.0,
    color = '#E07A5F', // Warm terracotta peach from char.mp4
    id = 'pixel-mascot',
    isMini = false,
    emote,
  } = opts;

  // Floating Pixel Emotes above head
  let emoteSvg = '';
  if (emote === 'lightbulb') {
    emoteSvg = `
      <g class="mascot-emote-bulb" transform="translate(0, -56)">
        <rect x="-8" y="-12" width="16" height="14" rx="4" fill="#FBBF24" />
        <rect x="-5" y="2" width="10" height="4" fill="#78350F" />
        <!-- Radiating pixel rays -->
        <line x1="0" y1="-18" x2="0" y2="-24" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" />
        <line x1="-14" y1="-10" x2="-20" y2="-14" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" />
        <line x1="14" y1="-10" x2="20" y2="-14" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" />
      </g>
    `;
  } else if (emote === 'sparkle') {
    emoteSvg = `
      <g class="mascot-emote-sparkle" transform="translate(24, -46)">
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FBBF24" />
      </g>
      <g class="mascot-emote-sparkle" transform="translate(-24, -40) scale(0.7)">
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#38BDF8" />
      </g>
    `;
  } else if (emote === 'exclamation') {
    emoteSvg = `
      <g class="mascot-emote-excl" transform="translate(0, -56)">
        <rect x="-4" y="-16" width="8" height="16" rx="2" fill="#DC2626" />
        <rect x="-4" y="4" width="8" height="8" rx="2" fill="#DC2626" />
      </g>
    `;
  } else if (emote === 'trophy') {
    emoteSvg = `
      <g class="mascot-emote-trophy" transform="translate(0, -54)">
        <rect x="-10" y="-14" width="20" height="14" rx="3" fill="#F59E0B" />
        <rect x="-4" y="0" width="8" height="8" fill="#D97706" />
        <rect x="-8" y="8" width="16" height="4" rx="1" fill="#B45309" />
      </g>
    `;
  }

  return `
    <g id="${id}" class="pixel-mascot-rig" transform="translate(${x}, ${y}) scale(${scale})">
      <!-- Mascot Shadow -->
      <ellipse class="mascot-shadow" cx="0" cy="52" rx="44" ry="7" fill="rgba(15, 23, 42, 0.08)" />

      <!-- Floating Emote FX -->
      ${emoteSvg}

      <!-- Main Body Group (for Squash & Stretch Bounce) -->
      <g class="mascot-body-group">
        <!-- Main Body Block -->
        <rect class="mascot-body" x="-38" y="-30" width="76" height="50" rx="3" fill="${color}" />

        <!-- Left Ear / Arm -->
        <g class="mascot-left-arm-group">
          <rect class="mascot-left-arm" x="-54" y="-12" width="16" height="20" rx="2" fill="${color}" />
        </g>

        <!-- Right Ear / Arm -->
        <g class="mascot-right-arm-group">
          <rect class="mascot-right-arm" x="38" y="-12" width="16" height="20" rx="2" fill="${color}" />
        </g>

        <!-- Square Black Pixel Eyes (Blinking & Gazing) -->
        <g class="mascot-eyes">
          <rect class="mascot-left-eye" x="-20" y="-18" width="11" height="11" fill="#1E293B" rx="1" />
          <rect class="mascot-right-eye" x="10" y="-18" width="11" height="11" fill="#1E293B" rx="1" />
        </g>
      </g>

      <!-- 4 Articulated Pixel Legs (Walking Kinematics) -->
      <g class="mascot-legs">
        <rect class="mascot-leg leg-1" x="-34" y="20" width="12" height="26" rx="2" fill="${color}" />
        <rect class="mascot-leg leg-2" x="-14" y="20" width="12" height="26" rx="2" fill="${color}" />
        <rect class="mascot-leg leg-3" x="4" y="20" width="12" height="26" rx="2" fill="${color}" />
        <rect class="mascot-leg leg-4" x="22" y="20" width="12" height="26" rx="2" fill="${color}" />
      </g>
    </g>
  `;
}

// ----------------------------------------------------
// 2. DESK & RETRO COMPUTER WORKSTATION (Scene 1 Intro)
// ----------------------------------------------------
export function drawDeskWorkstation(opts: { x: number; y: number; scale?: number; id?: string }): string {
  const s = opts.scale || 1.0;
  return `
    <g id="${opts.id || 'desk-workstation'}" transform="translate(${opts.x}, ${opts.y}) scale(${s})">
      <!-- Wooden Desk -->
      <rect x="-190" y="80" width="380" height="18" rx="3" fill="#8C583E" stroke="#5D3A29" stroke-width="2" />
      <rect x="-160" y="98" width="14" height="110" fill="#6E4430" />
      <rect x="146" y="98" width="14" height="110" fill="#6E4430" />

      <!-- Retro CRT Computer Monitor (Right Side) -->
      <g transform="translate(85, -5)">
        <rect x="-12" y="58" width="24" height="22" fill="#334155" />
        <rect x="-35" y="76" width="70" height="6" rx="2" fill="#1E293B" />
        
        <!-- Monitor Casing -->
        <rect x="-65" y="-55" width="130" height="114" rx="8" fill="#1E293B" stroke="#0F172A" stroke-width="3" />
        <circle cx="50" cy="-40" r="4" fill="#FACC15" />
        
        <!-- CRT Screen (Tencent Blue Terminal Glow) -->
        <rect x="-52" y="-42" width="104" height="84" rx="5" fill="#0B1E3B" stroke="#0052D9" stroke-width="2" />
        
        <!-- Official Tencent Vector Icon on Screen -->
        <g transform="translate(0, -6) scale(0.65)">
          <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="#0052D9" stroke="#38BDF8" stroke-width="2" />
          <path d="M -16 -10 L 0 14 L 16 -10" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <line x1="0" y1="-10" x2="0" y2="14" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
        </g>
        <text x="0" y="28" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="900" font-size="10" fill="#38BDF8">Tencent HY4</text>
        
        <!-- Screen Power Indicator -->
        <circle cx="48" cy="48" r="3" fill="#10B981" />
      </g>

      <!-- Pixel Mascot sitting on the desk typing with Emote FX -->
      ${drawPixelMascot({ x: -75, y: 35, scale: 0.9, id: 'desk-mascot', emote: 'exclamation' })}
    </g>
  `;
}

// ----------------------------------------------------
// 3. EDITORIAL TORN-PAPER CARDS (char.mp4 Style)
// ----------------------------------------------------
export function drawTornPaperCard(opts: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  tabLabel?: string;
  tabColor?: string;
  categoryNumber?: string;
  title: string;
  subtitle?: string;
  items: Array<{ num: string; title: string; desc: string; tag?: string; tagColor?: string }>;
  footerNote?: string;
  id?: string;
  mascotEmote?: 'lightbulb' | 'sparkle' | 'trophy' | 'fire' | 'exclamation';
}): string {
  const {
    x = 360,
    y = 530,
    width = 630,
    height = 640,
    tabLabel = 'release',
    tabColor = '#3B82F6',
    categoryNumber = 'HY4 PREVIEW',
    title = 'Tencent AI Lab',
    subtitle,
    items = [],
    footerNote = 'Tencent just dropped the biggest AI bombshell of the year.',
    id = 'paper-card',
    mascotEmote,
  } = opts;

  const halfW = width / 2;
  const halfH = height / 2;

  // Render items rows
  const itemsHtml = items.map((item, idx) => {
    const rowY = -halfH + 110 + idx * 82;
    const tagBg = item.tagColor || (item.tag === 'official' ? '#DCFCE7' : item.tag === 'partner' ? '#FEF9C3' : '#F1F5F9');
    const tagText = item.tag === 'official' ? '#166534' : item.tag === 'partner' ? '#854D0E' : '#475569';

    return `
      <g transform="translate(0, ${rowY})" class="card-item-row">
        <!-- Number & Title -->
        <text x="${-halfW + 35}" y="0" font-family="'Nunito', sans-serif" font-weight="900" font-size="20" fill="#99422B">${item.num}. ${item.title}:</text>
        
        <!-- Description -->
        <text x="${-halfW + 35}" y="24" font-family="'Nunito', sans-serif" font-weight="700" font-size="14.5" fill="#64748B">${item.desc}</text>
        
        <!-- Status Tag Pill -->
        ${item.tag ? `
          <g transform="translate(${halfW - 55}, 6)">
            <rect x="-44" y="-13" width="88" height="26" rx="13" fill="${tagBg}" stroke="${item.tag === 'official' ? '#86EFAC' : 'transparent'}" stroke-width="1" />
            <text x="0" y="4" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="11" fill="${tagText}">${item.tag}</text>
          </g>
        ` : ''}

        <!-- Subtle Row Divider -->
        ${idx < items.length - 1 ? `<line x1="${-halfW + 35}" y1="42" x2="${halfW - 35}" y2="42" stroke="#F1F5F9" stroke-width="1.5" />` : ''}
      </g>
    `;
  }).join('\n');

  return `
    <g id="${id}" transform="translate(${x}, ${y})" class="editorial-paper-card">
      <!-- Soft Editorial Drop Shadow -->
      <rect x="${-halfW - 4}" y="${-halfH - 4}" width="${width + 8}" height="${height + 8}" rx="28" fill="rgba(15, 23, 42, 0.06)" filter="blur(20px)" />
      
      <!-- Torn Paper / Clean Card Body -->
      <rect x="${-halfW}" y="${-halfH}" width="${width}" height="${height}" rx="24" fill="#FAF8F5" stroke="#E2E8F0" stroke-width="2" />

      <!-- Top Tab Folder Accent -->
      <g transform="translate(${-halfW + 70}, ${-halfH})">
        <rect x="-45" y="-18" width="90" height="26" rx="10" fill="${tabColor}" />
        <text x="0" y="-1" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="900" font-size="12" fill="#FFFFFF">${tabLabel}</text>
      </g>

      <!-- Mini Mascot sitting on top right of the card with Emote -->
      <g transform="translate(${halfW - 65}, ${-halfH - 10}) scale(0.45)">
        ${drawPixelMascot({ x: 0, y: 0, scale: 1.0, id: `${id}-top-mascot`, emote: mascotEmote })}
      </g>

      <!-- Card Header: Title -->
      <text x="0" y="${-halfH + 52}" text-anchor="middle" font-family="'Georgia', serif" font-weight="700" font-size="34" fill="#99422B" letter-spacing="-0.5px">${title}</text>
      ${subtitle ? `<text x="0" y="${-halfH + 80}" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="700" font-size="14" fill="#64748B">${subtitle}</text>` : ''}

      <!-- Items List -->
      ${itemsHtml}

      <!-- Footer Callout Note -->
      ${footerNote ? `
        <g transform="translate(0, ${halfH - 32})">
          <rect x="${-halfW + 35}" y="-16" width="${width - 70}" height="32" rx="16" fill="#F1F5F9" />
          <text x="0" y="4" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="12" fill="#475569">${footerNote}</text>
        </g>
      ` : ''}
    </g>
  `;
}

// ----------------------------------------------------
// 4. BOTTOM TIMELINE FOOTER (Walking Mascot Progress)
// ----------------------------------------------------
export function drawTimelineFooter(opts: { x: number; y: number; width: number; currentStep: number; totalSteps: number }): string {
  const { x = 360, y = 1190, width = 640, currentStep = 1, totalSteps = 6 } = opts;
  const progressRatio = Math.min(1, Math.max(0, currentStep / totalSteps));
  const mascotX = -width / 2 + (width * progressRatio);

  return `
    <g id="timeline-footer" transform="translate(${x}, ${y})">
      <!-- Progress Bar Track -->
      <line x1="${-width / 2}" y1="0" x2="${width / 2}" y2="0" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round" />
      <line x1="${-width / 2}" y1="0" x2="${mascotX}" y2="0" stroke="#E07A5F" stroke-width="4" stroke-linecap="round" />

      <!-- Step Indicator Dots -->
      ${Array.from({ length: totalSteps }).map((_, i) => {
        const dotX = -width / 2 + (width * (i / (totalSteps - 1)));
        const isActive = i < currentStep;
        return `<circle cx="${dotX}" cy="0" r="5" fill="${isActive ? '#E07A5F' : '#CBD5E1'}" />`;
      }).join('\n')}

      <!-- Animated Mascot Walking on the Timeline -->
      <g id="timeline-walker-mascot" transform="translate(${mascotX}, -28) scale(0.42)">
        ${drawPixelMascot({ x: 0, y: 0, scale: 1.0, id: 'walker-mascot' })}
      </g>
    </g>
  `;
}

// ----------------------------------------------------
// 5. SCENE CARDS (EXACT MATCH TO NARRATION SCRIPT)
// ----------------------------------------------------

export function drawTencentIntroCard(): string {
  return drawTornPaperCard({
    x: 360,
    y: 530,
    width: 630,
    height: 640,
    tabLabel: 'release',
    tabColor: '#3B82F6',
    categoryNumber: 'HY4 PREVIEW',
    title: 'Tencent AI Lab',
    subtitle: 'HY4: 770B Open-Weights Foundation Model',
    items: [
      { num: '1', title: 'HY4 Model', desc: 'Frontier reasoning engine rivaling closed proprietary LLMs', tag: 'official', tagColor: '#DCFCE7' },
      { num: '2', title: '770B Total', desc: '49B active parameters per token for blazing fast inference', tag: '770B MoE', tagColor: '#FEF9C3' },
      { num: '3', title: '1M Context', desc: 'Ingests entire 500+ file code repositories in one prompt', tag: '1,000,000', tagColor: '#E0E7FF' },
      { num: '4', title: 'Hugging Face', desc: 'Weights released 100% open-source for global developers', tag: 'free', tagColor: '#FEF3C7' },
    ],
    footerNote: 'Tencent just dropped the biggest AI bombshell of the year.',
    id: 'card-scene-1',
    mascotEmote: 'exclamation',
  });
}

export function drawMoEArchitectureCard(): string {
  return drawTornPaperCard({
    x: 360,
    y: 530,
    width: 630,
    height: 640,
    tabLabel: 'architecture',
    tabColor: '#8B5CF6',
    categoryNumber: 'DEEP DIVE',
    title: '770B MoE Engine',
    subtitle: 'Sparse Mixture-of-Experts Router Breakdown',
    items: [
      { num: '1', title: 'Expert 1 (Code)', desc: 'Full-stack software engineering, refactoring & PRs', tag: 'official', tagColor: '#DCFCE7' },
      { num: '2', title: 'Expert 2 (Logic)', desc: 'Multi-step mathematical reasoning & algorithmic proofs', tag: 'active', tagColor: '#FEF9C3' },
      { num: '3', title: 'Expert 3 (3D Dev)', desc: '3D spatial asset generation & procedural geometry', tag: 'partner', tagColor: '#E0E7FF' },
      { num: '4', title: 'Expert 4 (Math)', desc: 'High-precision algorithmic compute optimization', tag: '100% ★', tagColor: '#FCE7F3' },
    ],
    footerNote: 'Only 49B parameters fire per token = lightning response speeds.',
    id: 'card-scene-2',
    mascotEmote: 'lightbulb',
  });
}

export function drawContextSpecCard(): string {
  return drawTornPaperCard({
    x: 360,
    y: 530,
    width: 630,
    height: 640,
    tabLabel: 'capacity',
    tabColor: '#06B6D4',
    categoryNumber: 'BENCHMARK',
    title: '1,000,000 Context',
    subtitle: 'Massive Repository & Codebase Ingestion',
    items: [
      { num: '1', title: 'Full Repo Buffer', desc: 'Scan 500+ files and dependencies with zero degradation', tag: '100x ★', tagColor: '#CCFBF1' },
      { num: '2', title: 'Needle in Haystack', desc: '100% retrieval accuracy at 1 million tokens', tag: 'verified', tagColor: '#DCFCE7' },
      { num: '3', title: 'Zero Hallucination', desc: 'Architectural precision across large document bases', tag: 'official', tagColor: '#FEF9C3' },
      { num: '4', title: 'Fast Retrieval', desc: 'Instant lookups without fine-tuning latency', tag: 'partner', tagColor: '#E0E7FF' },
    ],
    footerNote: 'One short command runs across your entire codebase.',
    id: 'card-scene-3',
    mascotEmote: 'sparkle',
  });
}

export function drawGameDevCard(): string {
  return drawTornPaperCard({
    x: 360,
    y: 530,
    width: 630,
    height: 640,
    tabLabel: 'workflows',
    tabColor: '#EC4899',
    categoryNumber: 'CREATION',
    title: '3D & Dev Studio',
    subtitle: 'Direct Unreal Engine 5 & Full-Stack Coding',
    items: [
      { num: '1', title: 'Software Engineering', desc: 'End-to-end bug fixing, refactoring, and code reviews', tag: 'Dev Agent', tagColor: '#DCFCE7' },
      { num: '2', title: '3D Mesh Gen', desc: 'Auto-generates procedural 3D environments from text', tag: 'UE5 Ready', tagColor: '#FCE7F3' },
      { num: '3', title: 'Asset Pipeline', desc: 'Direct export to GLTF, FBX, and Unreal Engine projects', tag: 'partner', tagColor: '#FEF9C3' },
      { num: '4', title: 'Zero Bottleneck', desc: 'Single prompt to working interactive demo', tag: '10x Speed', tagColor: '#E0E7FF' },
    ],
    footerNote: 'Handling everything from software engineering to 3D game dev!',
    id: 'card-scene-4',
    mascotEmote: 'sparkle',
  });
}

export function drawHuggingFaceCard(): string {
  return drawTornPaperCard({
    x: 360,
    y: 530,
    width: 630,
    height: 640,
    tabLabel: 'open source',
    tabColor: '#F59E0B',
    categoryNumber: 'DOWNLOAD',
    title: 'Hugging Face Hub',
    subtitle: 'Zero API Paywalls • 100% Free Weights',
    items: [
      { num: '1', title: 'Zero API Paywall', desc: 'Download base model & fine-tune on your own GPUs', tag: '100% Free', tagColor: '#DCFCE7' },
      { num: '2', title: 'Safetensors', desc: 'Full fp16 and 4-bit quantized formats ready to run', tag: 'official', tagColor: '#FEF9C3' },
      { num: '3', title: 'Ollama & vLLM', desc: 'Community inference support available on day 1', tag: 'open', tagColor: '#E0E7FF' },
      { num: '4', title: 'Commercial Use', desc: 'Permissive license for building and selling AI tools', tag: 'verified', tagColor: '#FCE7F3' },
    ],
    footerNote: 'While closed models charge, HY4 is 100% free!',
    id: 'card-scene-5',
    mascotEmote: 'trophy',
  });
}

export function drawCTAEditorialCard(): string {
  return drawTornPaperCard({
    x: 360,
    y: 530,
    width: 630,
    height: 640,
    tabLabel: 'get setup',
    tabColor: '#10B981',
    categoryNumber: 'FOLLOW',
    title: 'Bytes with Bittu ⚡',
    subtitle: 'Daily AI Engineering Alpha & Open-Source Tools',
    items: [
      { num: '1', title: 'Full Setup Guide', desc: 'Step-by-step local install instructions with scripts', tag: 'official', tagColor: '#DCFCE7' },
      { num: '2', title: 'Model Weights', desc: 'Direct links and quantization configs on GitHub', tag: 'free', tagColor: '#FEF9C3' },
      { num: '3', title: 'Daily Alpha', desc: 'Never miss a major AI release or architecture breakdown', tag: 'daily', tagColor: '#E0E7FF' },
    ],
    footerNote: 'Comment "INSTALL" for the full setup guide & alpha!',
    id: 'card-scene-6',
    mascotEmote: 'trophy',
  });
}

// Compatibility helpers
export function drawCharacter(opts: any): string {
  return drawPixelMascot({ x: opts.x, y: opts.y, scale: opts.scale, id: opts.id });
}
export function drawBackgroundCanvas(w: number, h: number): string {
  return `<rect width="${w}" height="${h}" fill="#FFFFFF" />`;
}
export function drawCoinStack(opts: any): string { return ''; }
export function drawSpeechBubble(opts: any): string { return ''; }
export function drawSparkle(opts: any): string { return ''; }
export function drawGlowLines(opts: any): string { return ''; }
export function drawDashedArrow(opts: any): string { return ''; }
export function drawLineChart(opts: any): string { return ''; }
export function drawPieChart(opts: any): string { return ''; }
export function drawBarChart(opts: any): string { return ''; }
export function drawRobot(opts: any): string { return ''; }
export function drawBrain(opts: any): string { return ''; }
export function drawGear(opts: any): string { return ''; }
export function drawLabel(opts: any): string { return ''; }
export function drawNumberDisplay(opts: any): string { return ''; }
export function drawPlainStickFigure(opts: any): string { return ''; }
export function drawTencentBombshell(opts: any): string { return drawTencentIntroCard(); }
export function drawMoENetwork(opts: any): string { return drawMoEArchitectureCard(); }
export function drawContextMeter(opts: any): string { return drawContextSpecCard(); }
export function drawGameController(opts: any): string { return drawGameDevCard(); }
export function drawCompanyLogo(opts: any): string { return drawHuggingFaceCard(); }
export function drawCelebrationCTA(opts: any): string { return drawCTAEditorialCard(); }
