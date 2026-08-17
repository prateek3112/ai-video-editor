import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProjectById, setProjectVisualScenes } from "@/lib/local-store";
import type { ScriptVisualScene } from "@/lib/script-visuals";

export const runtime = "nodejs";

const MAX_ASSET_BYTES = 50 * 1024 * 1024;

type AcceptedAsset = {
  extension: ".gif" | ".png" | ".jpg" | ".webp" | ".mp4" | ".webm";
  mediaType: NonNullable<ScriptVisualScene["mediaType"]>;
};

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function identifyAsset(bytes: Uint8Array): AcceptedAsset | null {
  const ascii = (start: number, end: number) => Buffer.from(bytes.subarray(start, end)).toString("ascii");
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return { extension: ".gif", mediaType: "gif" };
  if (hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { extension: ".png", mediaType: "image" };
  if (hasPrefix(bytes, [0xff, 0xd8, 0xff])) return { extension: ".jpg", mediaType: "image" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { extension: ".webp", mediaType: "image" };
  if (ascii(4, 8) === "ftyp") return { extension: ".mp4", mediaType: "video" };
  if (hasPrefix(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return { extension: ".webm", mediaType: "video" };
  return null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file");
    const sceneId = String(formData.get("sceneId") ?? "").trim();
    if (!(file instanceof File) || !sceneId) {
      return NextResponse.json({ success: false, error: "file and sceneId are required" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_ASSET_BYTES) {
      return NextResponse.json({ success: false, error: "Visual asset must be between 1 byte and 50 MB" }, { status: 413 });
    }

    const scenes = project.visualScenes ?? [];
    const sceneIndex = scenes.findIndex((scene) => scene.id === sceneId);
    if (sceneIndex < 0) {
      return NextResponse.json({ success: false, error: "Visual scene not found" }, { status: 404 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const asset = identifyAsset(bytes);
    if (!asset) {
      return NextResponse.json({ success: false, error: "Only valid GIF, PNG, JPEG, WebP, MP4, or WebM files are accepted" }, { status: 415 });
    }

    const safeProjectId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeProjectId || safeProjectId !== id) {
      return NextResponse.json({ success: false, error: "Invalid project id" }, { status: 400 });
    }
    const filename = `${crypto.randomUUID()}${asset.extension}`;
    const relativeDir = path.posix.join("uploads", "visuals", safeProjectId);
    const destinationDir = path.join(process.cwd(), "public", relativeDir);
    await fs.mkdir(destinationDir, { recursive: true });
    await fs.writeFile(path.join(destinationDir, filename), bytes, { flag: "wx" });

    const publicUrl = `/${path.posix.join(relativeDir, filename)}`;
    const visualScenes = scenes.map((scene, index) =>
      index === sceneIndex
        ? { ...scene, mediaUrl: publicUrl, mediaType: asset.mediaType, mediaCredit: "Uploaded asset" }
        : scene,
    );
    const updatedProject = await setProjectVisualScenes(id, visualScenes);

    return NextResponse.json({
      success: true,
      asset: { publicUrl, mediaType: asset.mediaType, size: file.size },
      project: updatedProject,
    });
  } catch (error) {
    console.error("Visual asset upload failed", error);
    return NextResponse.json({ success: false, error: "Failed to attach visual asset" }, { status: 500 });
  }
}
