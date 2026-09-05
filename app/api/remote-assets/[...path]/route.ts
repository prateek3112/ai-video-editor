import { fetchVmAsset } from "@/lib/vm-render-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return fetchVmAsset(request, path);
}
