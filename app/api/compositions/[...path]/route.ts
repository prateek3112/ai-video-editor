import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME_MAP: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  if (!parts.length || !parts.every((part) => /^[a-zA-Z0-9._-]+$/.test(part))) {
    return NextResponse.json({ error: "Invalid composition path" }, { status: 400 });
  }
  const root = path.join(process.cwd(), "public", "compositions");
  const filePath = path.join(root, ...parts);
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return NextResponse.json({ error: "Invalid composition path" }, { status: 400 });

  try {
    const content = await fs.readFile(filePath);
    return new NextResponse(content, {
      headers: {
        "Content-Type": MIME_MAP[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Composition asset not found" }, { status: 404 });
  }
}
