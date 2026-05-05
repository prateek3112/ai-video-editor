import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { CaptionScript } from './caption-config';

export type LocalProjectStatus = 'processing' | 'transcribing' | 'ready' | 'rendering' | 'completed' | 'failed';

export interface LocalCaption {
  id: string;
  projectId: string;
  start: number;
  end: number;
  text: string;
  confidence?: number;
  script?: CaptionScript;
  highlightWords?: string[];
  positionX?: number;
  positionY?: number;
}

export interface LocalProject {
  id: string;
  videoUrl: string;
  sourceVideoUrl: string;
  duration: number;
  status: LocalProjectStatus;
  createdAt: string;
  captions: LocalCaption[];
}

interface LocalStoreData {
  projects: LocalProject[];
}

const dataDir = path.join(process.cwd(), 'data');
const storePath = path.join(dataDir, 'projects.json');

let lock: Promise<void> = Promise.resolve();
let lastGoodStore: LocalStoreData | null = null;

async function ensureStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    const initial: LocalStoreData = { projects: [] };
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function normalizeStore(parsed: Partial<LocalStoreData>): LocalStoreData {
  const projects = Array.isArray(parsed.projects) ? parsed.projects : [];

  return {
    projects: projects.map((project) => ({
      ...project,
      sourceVideoUrl: project.sourceVideoUrl ?? project.videoUrl,
    })) as LocalProject[],
  };
}

async function readStore(): Promise<LocalStoreData> {
  await ensureStore();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const raw = await fs.readFile(storePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
      const normalized = normalizeStore(parsed);
      lastGoodStore = normalized;
      return normalized;
    } catch (error) {
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
        continue;
      }

      if (lastGoodStore) {
        return lastGoodStore;
      }

      throw error;
    }
  }

  return lastGoodStore ?? { projects: [] };
}

async function writeStore(store: LocalStoreData): Promise<void> {
  await ensureStore();
  const tempPath = `${storePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), 'utf-8');
  await fs.rename(tempPath, storePath);
  lastGoodStore = store;
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = lock.then(fn);
  lock = next.then(() => undefined, () => undefined);
  return next;
}

export async function createProject(input: {
  videoUrl: string;
  duration: number;
  status?: LocalProjectStatus;
}): Promise<LocalProject> {
  return withLock(async () => {
    const store = await readStore();
    const project: LocalProject = {
      id: crypto.randomUUID(),
      videoUrl: input.videoUrl,
      sourceVideoUrl: input.videoUrl,
      duration: input.duration,
      status: input.status ?? 'processing',
      createdAt: new Date().toISOString(),
      captions: [],
    };

    store.projects.push(project);
    await writeStore(store);
    return project;
  });
}

export async function getProjectById(projectId: string): Promise<LocalProject | null> {
  const store = await readStore();
  return store.projects.find((project) => project.id === projectId) ?? null;
}

export async function updateProject(projectId: string, update: Partial<Omit<LocalProject, 'id' | 'createdAt'>>): Promise<LocalProject> {
  return withLock(async () => {
    const store = await readStore();
    const index = store.projects.findIndex((project) => project.id === projectId);

    if (index === -1) {
      throw new Error('Project not found');
    }

    const current = store.projects[index];
    const next: LocalProject = {
      ...current,
      ...update,
      captions: update.captions ?? current.captions,
    };

    store.projects[index] = next;
    await writeStore(store);
    return next;
  });
}

export async function setProjectCaptions(
  projectId: string,
  captions: Array<{
    start: number;
    end: number;
    text: string;
    confidence?: number;
    script?: CaptionScript;
    highlightWords?: string[];
    positionX?: number;
    positionY?: number;
  }>,
): Promise<LocalProject> {
  return withLock(async () => {
    const store = await readStore();
    const index = store.projects.findIndex((project) => project.id === projectId);

    if (index === -1) {
      throw new Error('Project not found');
    }

    const project = store.projects[index];
    const normalized = captions
      .map((caption) => ({
        id: crypto.randomUUID(),
        projectId,
        start: caption.start,
        end: caption.end,
        text: caption.text,
        confidence: Number.isFinite(caption.confidence) ? Number(caption.confidence) : undefined,
        script: caption.script,
        highlightWords: Array.isArray(caption.highlightWords)
          ? caption.highlightWords.map((word) => String(word).trim()).filter(Boolean).slice(0, 8)
          : undefined,
        positionX: Number.isFinite(caption.positionX) ? Math.min(0.95, Math.max(0.05, Number(caption.positionX))) : undefined,
        positionY: Number.isFinite(caption.positionY) ? Math.min(0.95, Math.max(0.05, Number(caption.positionY))) : undefined,
      }))
      .sort((a, b) => a.start - b.start);

    const next: LocalProject = {
      ...project,
      captions: normalized,
    };

    store.projects[index] = next;
    await writeStore(store);
    return next;
  });
}
