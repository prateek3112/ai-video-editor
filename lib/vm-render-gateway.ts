import crypto from "node:crypto";

const WORKER_TOKEN_HEADER = "x-render-worker-token";
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
]);

/**
 * The app can run in two roles:
 * - local/web: proxy media work to the VM
 * - worker: execute the forwarded request on the VM
 *
 * Keeping the setting server-only prevents browsers from discovering the
 * worker token or calling an internal worker request directly.
 */
export function usesVmRendering(): boolean {
  return process.env.RENDER_EXECUTION_TARGET === "remote";
}

function workerToken(): string | null {
  const token = process.env.RENDER_VM_WORKER_TOKEN?.trim();
  return token || null;
}

function remoteVmBaseUrl(): string | null {
  const raw = process.env.RENDER_VM_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && process.env.ALLOW_INSECURE_RENDER_VM_URL !== "true") {
      return null;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function vmRenderingConfigurationError(): string | null {
  if (!usesVmRendering()) return null;
  if (!remoteVmBaseUrl()) {
    return "RENDER_VM_URL must be a valid HTTPS URL (or explicitly allow HTTP for a private VM).";
  }
  if (!workerToken()) return "RENDER_VM_WORKER_TOKEN is required when remote rendering is enabled.";
  return null;
}

export function isVmWorkerRequest(request: Request): boolean {
  const expected = workerToken();
  const actual = request.headers.get(WORKER_TOKEN_HEADER);
  if (!expected || !actual) return false;

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function shouldDelegateToVm(request: Request): boolean {
  return usesVmRendering() && !isVmWorkerRequest(request);
}

function upstreamUrl(pathname: string, request: Request): URL {
  const base = remoteVmBaseUrl();
  if (!base) throw new Error(vmRenderingConfigurationError() ?? "Remote VM rendering is not configured.");
  const incoming = new URL(request.url);
  return new URL(`${pathname}${incoming.search}`, `${base}/`);
}

function forwardedHeaders(request: Request): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(normalized) || normalized === "host" || normalized === WORKER_TOKEN_HEADER) return;
    headers.set(key, value);
  });
  headers.set(WORKER_TOKEN_HEADER, workerToken()!);
  headers.set("x-forwarded-host", new URL(request.url).host);
  return headers;
}

function responseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });
  return headers;
}

/** Prefix remote runtime media with a same-origin proxy so a local web app can
 * preview the VM's uploads and outputs without CORS or stale-local-file bugs. */
export function rewriteRemoteAssetUrls(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("/api/remote-assets/")) return value;
    if (value.startsWith("/api/uploads/")) return value.replace("/api/uploads/", "/api/remote-assets/uploads/");
    if (value.startsWith("/uploads/")) return value.replace("/uploads/", "/api/remote-assets/uploads/");
    if (value.startsWith("/api/renders/")) return value.replace("/api/renders/", "/api/remote-assets/renders/");
    if (value.startsWith("/renders/")) return value.replace("/renders/", "/api/remote-assets/renders/");
    if (value.startsWith("/api/compositions/")) return value.replace("/api/compositions/", "/api/remote-assets/compositions/");
    if (value.startsWith("/compositions/")) return value.replace("/compositions/", "/api/remote-assets/compositions/");
    return value;
  }
  if (Array.isArray(value)) return value.map(rewriteRemoteAssetUrls);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, rewriteRemoteAssetUrls(entry)]));
  }
  return value;
}

/** Forward a browser-facing API request to the VM. JSON responses are rewritten
 * to use same-origin media proxies; byte streams (subtitle exports, video) pass through unchanged. */
export async function delegateToVm(request: Request, pathname: string): Promise<Response> {
  const configurationError = vmRenderingConfigurationError();
  if (configurationError) return Response.json({ success: false, error: configurationError }, { status: 503 });

  try {
    const method = request.method.toUpperCase();
    const upstream = await fetch(upstreamUrl(pathname, request), {
      method,
      headers: forwardedHeaders(request),
      body: method === "GET" || method === "HEAD" ? undefined : request.body,
      // Node requires this for streaming an incoming Request body to fetch.
      // It is ignored by browsers and is intentionally not user-controlled.
      // @ts-expect-error duplex is implemented by Node's fetch, not yet in the DOM RequestInit type.
      duplex: "half",
    });
    const headers = responseHeaders(upstream);
    const contentType = upstream.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = await upstream.json();
      headers.delete("content-length");
      return Response.json(rewriteRemoteAssetUrls(payload), { status: upstream.status, headers });
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown remote VM error";
    return Response.json({ success: false, error: `VM render gateway unavailable: ${message}` }, { status: 502 });
  }
}

export function remoteAssetPath(parts: string[]): string | null {
  if (parts.length < 2 || !parts.every((part) => part && part !== "." && part !== ".." && !part.includes("\\") && !part.includes("/"))) {
    return null;
  }
  const [kind] = parts;
  if (kind !== "uploads" && kind !== "renders" && kind !== "compositions") return null;
  return parts.map(encodeURIComponent).join("/");
}

export async function fetchVmAsset(request: Request, parts: string[]): Promise<Response> {
  const assetPath = remoteAssetPath(parts);
  const configurationError = vmRenderingConfigurationError();
  if (!assetPath || configurationError) {
    return Response.json({ error: assetPath ? configurationError : "Invalid remote asset path" }, { status: assetPath ? 503 : 400 });
  }

  const base = remoteVmBaseUrl()!;
  const endpoint = assetPath.startsWith("uploads/")
    ? `/api/uploads/${assetPath.slice("uploads/".length)}`
    : assetPath.startsWith("renders/")
      ? `/api/renders/${assetPath.slice("renders/".length)}`
      : `/api/compositions/${assetPath.slice("compositions/".length)}`;

  try {
    const upstream = await fetch(new URL(endpoint, `${base}/`), {
      headers: {
        [WORKER_TOKEN_HEADER]: workerToken()!,
        ...(request.headers.get("range") ? { Range: request.headers.get("range")! } : {}),
      },
    });
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders(upstream) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown remote VM error";
    return Response.json({ error: `VM asset gateway unavailable: ${message}` }, { status: 502 });
  }
}
