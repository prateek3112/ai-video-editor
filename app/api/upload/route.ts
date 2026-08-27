import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
    }

    // 500MB Max File Size Limit
    const MAX_SIZE_BYTES = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 500MB limit" },
        { status: 413 }
      );
    }

    const ext = (path.extname(file.name) || ".mp4").toLowerCase();
    const ALLOWED_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".mkv", ".avi", ".mp3", ".wav", ".m4a", ".aac", ".ogg"]);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${ext}. Supported formats: MP4, MOV, WEBM, MKV, AVI, MP3, WAV, M4A, AAC.` },
        { status: 400 }
      );
    }

    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 50);
    const filename = `${Date.now()}-${safeBaseName}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const destinationPath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await fs.writeFile(destinationPath, Buffer.from(bytes));

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      contentType: file.type,
      size: file.size,
      publicUrl,
    });
  } catch (error) {
    console.error("Local upload error", error);
    return NextResponse.json({ success: false, error: "Failed to upload file locally" }, { status: 500 });
  }
}
