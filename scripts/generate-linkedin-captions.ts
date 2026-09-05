import * as fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scratch/linkedin_transcription.json', 'utf8'));

interface WordItem {
  start: number;
  end: number;
  text: string;
}

const words: WordItem[] = [];

for (const item of rawData) {
  const cleanText = item.text.trim().replace(/[.,!?:;]/g, '');
  if (cleanText) {
    let s = item.start;
    let e = item.end;
    // Fix minute-offset formatting (100.227 -> 60.227)
    if (s >= 95) s = s - 40;
    if (e >= 95) e = e - 40;
    words.push({
      start: s,
      end: e,
      text: cleanText
    });
  }
}

interface Cue {
  id: number;
  start: number;
  end: number;
  text: string;
  emphasis?: boolean;
}

const cues: Cue[] = [];
let i = 0;
let cueId = 0;

const EMPHASIS_WORDS = new Set([
  'CLAUDE', 'LINKEDIN', 'FREE', '11', 'SKILL', 'SKILLS', 'HOOK', 'HUMANIZER',
  'M-DASHES', 'CHATGPT', 'AI', 'DETECTORS', 'APPROVAL', 'DRAFT', '2', 'MINUTE',
  'GITHUB', 'DONE', 'COMMENT'
]);

while (i < words.length) {
  const w1 = words[i];
  const w2 = i + 1 < words.length ? words[i + 1] : null;

  const isW1Emp = EMPHASIS_WORDS.has(w1.text.toUpperCase());
  const isW2Emp = w2 ? EMPHASIS_WORDS.has(w2.text.toUpperCase()) : false;

  if (isW1Emp && w1.text.length > 5) {
    cues.push({
      id: cueId++,
      start: Number(w1.start.toFixed(2)),
      end: Number(w1.end.toFixed(2)),
      text: w1.text.toUpperCase(),
      emphasis: true
    });
    i += 1;
  } else if (w2 && (w2.start - w1.end < 0.28) && (w1.text.length + w2.text.length <= 16)) {
    const combined = `${w1.text} ${w2.text}`.toUpperCase();
    const hasEmp = isW1Emp || isW2Emp;
    cues.push({
      id: cueId++,
      start: Number(w1.start.toFixed(2)),
      end: Number(w2.end.toFixed(2)),
      text: combined,
      emphasis: hasEmp
    });
    i += 2;
  } else {
    cues.push({
      id: cueId++,
      start: Number(w1.start.toFixed(2)),
      end: Number(w1.end.toFixed(2)),
      text: w1.text.toUpperCase(),
      emphasis: isW1Emp
    });
    i += 1;
  }
}

// Ensure min display duration of 0.16s and no overlaps
for (let c = 0; c < cues.length; c++) {
  if (cues[c].end - cues[c].start < 0.16) {
    cues[c].end = Number((cues[c].start + 0.16).toFixed(2));
  }
  if (c + 1 < cues.length && cues[c].end > cues[c + 1].start) {
    cues[c].end = Number((cues[c + 1].start - 0.02).toFixed(2));
  }
}

fs.writeFileSync('scratch/linkedin_kinetic_cues.json', JSON.stringify(cues, null, 2));
console.log(`Generated ${cues.length} kinetic caption cues with corrected ending timestamps!`);
console.log('Sample last 8 cues:', cues.slice(-8));
