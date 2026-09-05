import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return NextResponse.json({ error: "Invalid filename" }, { status: 400 });

  const filePath = path.join(process.cwd(), "public", "renders", filename);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "Render not found" }, { status: 404 });

  const stat = fs.statSync(filePath);
  const contentType = MIME_MAP[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
  const range = request.headers.get("range")?.match(/bytes=(\d+)-(\d*)/);
  const start = range ? Number(range[1]) : 0;
  const end = range?.[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
  if (start < 0 || end < start || start >= stat.size) {
    return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
  }

  const stream = fs.createReadStream(filePath, { start, end });
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      stream.on("end", () => controller.close());
      stream.on("error", (error) => controller.error(error));
    },
    cancel() {
      stream.destroy();
    },
  });
  const headers = {
    "Accept-Ranges": "bytes",
    "Content-Length": String(end - start + 1),
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  return new NextResponse(body, range ? { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}` } } : { headers });
}
