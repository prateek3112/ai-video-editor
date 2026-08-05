export const BYOB_STORAGE_KEY = "byob_gemini_api_key";

/**
 * Get user's BYOB Gemini API key from client localStorage
 */
export function getByobApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(BYOB_STORAGE_KEY) ?? "";
}

/**
 * Save user's BYOB Gemini API key to client localStorage
 */
export function setByobApiKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (!trimmed) {
    localStorage.removeItem(BYOB_STORAGE_KEY);
  } else {
    localStorage.setItem(BYOB_STORAGE_KEY, trimmed);
  }
}

/**
 * Remove user's BYOB Gemini API key from client localStorage
 */
export function removeByobApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BYOB_STORAGE_KEY);
}

/**
 * Build request headers with BYOB key
 */
export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const key = getByobApiKey();
  const headers: Record<string, string> = {
    ...extraHeaders,
  };
  if (key) {
    headers["x-gemini-api-key"] = key;
  }
  return headers;
}

/**
 * Server-side helper to resolve Gemini API key from request header, body payload, or env
 */
export function resolveGeminiApiKey(req: Request, payload?: any): string | null {
  const headerKey = req.headers.get("x-gemini-api-key")?.trim();
  if (headerKey) return headerKey;

  const payloadKey = payload?.apiKey?.trim();
  if (payloadKey) return payloadKey;

  const envKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey?.trim()) return envKey.trim();

  return null;
}
