export type AiProvider = "local-whisper" | "gemini" | "openai" | "azure-openai";

export type ByobConfig = {
  provider: AiProvider;
  apiKey: string;
  endpoint?: string;
  deployment?: string;
  transcriptionDeployment?: string;
  apiVersion?: string;
  pexelsApiKey?: string;
};

export const BYOB_STORAGE_KEY = "ai_video_editor_provider_v2";
const LEGACY_STORAGE_KEY = "byob_gemini_api_key";

export const DEFAULT_BYOB_CONFIG: ByobConfig = {
  provider: "local-whisper",
  apiKey: "",
};

function isProvider(value: unknown): value is AiProvider {
  return value === "local-whisper" || value === "gemini" || value === "openai" || value === "azure-openai";
}

function cleanEndpoint(value: unknown): string | undefined {
  const endpoint = String(value ?? "").trim().replace(/\/+$/, "");
  if (!endpoint) return undefined;

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:") return undefined;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return undefined;
  }
}

export function normalizeByobConfig(value: Partial<ByobConfig> | null | undefined): ByobConfig {
  const provider = isProvider(value?.provider) ? value.provider : "local-whisper";
  return {
    provider,
    apiKey: String(value?.apiKey ?? "").trim(),
    endpoint: cleanEndpoint(value?.endpoint),
    deployment: String(value?.deployment ?? "").trim() || undefined,
    transcriptionDeployment: String(value?.transcriptionDeployment ?? "").trim() || undefined,
    apiVersion: String(value?.apiVersion ?? "").trim() || undefined,
    pexelsApiKey: String(value?.pexelsApiKey ?? "").trim() || undefined,
  };
}

export function getByobConfig(): ByobConfig {
  if (typeof window === "undefined") return DEFAULT_BYOB_CONFIG;

  const stored = localStorage.getItem(BYOB_STORAGE_KEY);
  if (stored) {
    try {
      return normalizeByobConfig(JSON.parse(stored) as Partial<ByobConfig>);
    } catch {
      localStorage.removeItem(BYOB_STORAGE_KEY);
    }
  }

  const legacyGeminiKey = localStorage.getItem(LEGACY_STORAGE_KEY)?.trim();
  if (legacyGeminiKey) {
    const migrated = normalizeByobConfig({ provider: "gemini", apiKey: legacyGeminiKey });
    localStorage.setItem(BYOB_STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  }

  return DEFAULT_BYOB_CONFIG;
}

export function setByobConfig(config: ByobConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BYOB_STORAGE_KEY, JSON.stringify(normalizeByobConfig(config)));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function removeByobConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BYOB_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

/** Compatibility helpers used by the AI Create dialog. */
export function getByobApiKey(): string {
  return getByobConfig().apiKey;
}

export function setByobApiKey(key: string): void {
  const current = getByobConfig();
  setByobConfig({ ...current, provider: current.provider === "local-whisper" ? "gemini" : current.provider, apiKey: key });
}

export function removeByobApiKey(): void {
  removeByobConfig();
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const config = getByobConfig();
  const headers: Record<string, string> = {
    ...extraHeaders,
    "x-ai-provider": config.provider,
  };

  if (config.apiKey) headers["x-ai-api-key"] = config.apiKey;
  if (config.endpoint) headers["x-ai-endpoint"] = config.endpoint;
  if (config.deployment) headers["x-ai-deployment"] = config.deployment;
  if (config.transcriptionDeployment) headers["x-ai-transcription-deployment"] = config.transcriptionDeployment;
  if (config.apiVersion) headers["x-ai-api-version"] = config.apiVersion;
  if (config.pexelsApiKey) headers["x-media-pexels-key"] = config.pexelsApiKey;

  // Keep the legacy header during migration for older deployed API routes.
  if (config.provider === "gemini" && config.apiKey) headers["x-gemini-api-key"] = config.apiKey;
  return headers;
}

export function resolveByobConfig(req: Request, payload?: Partial<ByobConfig> & { apiKey?: string }): ByobConfig {
  const requestedProvider = req.headers.get("x-ai-provider") ?? payload?.provider;
  const provider = isProvider(requestedProvider)
    ? requestedProvider
    : process.env.AI_PROVIDER && isProvider(process.env.AI_PROVIDER)
      ? process.env.AI_PROVIDER
      : process.env.GEMINI_API_KEY
        ? "gemini"
        : "local-whisper";

  const providerEnvKey =
    provider === "gemini"
      ? process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY
      : provider === "openai"
        ? process.env.OPENAI_API_KEY
        : provider === "azure-openai"
          ? process.env.AZURE_OPENAI_API_KEY
          : "";

  return normalizeByobConfig({
    provider,
    apiKey:
      req.headers.get("x-ai-api-key") ??
      req.headers.get("x-gemini-api-key") ??
      payload?.apiKey ??
      providerEnvKey ??
      "",
    endpoint: req.headers.get("x-ai-endpoint") ?? payload?.endpoint ?? process.env.AZURE_OPENAI_ENDPOINT,
    deployment: req.headers.get("x-ai-deployment") ?? payload?.deployment ?? process.env.AZURE_OPENAI_DEPLOYMENT,
    transcriptionDeployment:
      req.headers.get("x-ai-transcription-deployment") ??
      payload?.transcriptionDeployment ??
      process.env.AZURE_OPENAI_TRANSCRIPTION_DEPLOYMENT,
    apiVersion: req.headers.get("x-ai-api-version") ?? payload?.apiVersion ?? process.env.AZURE_OPENAI_API_VERSION,
    pexelsApiKey: req.headers.get("x-media-pexels-key") ?? payload?.pexelsApiKey ?? process.env.PEXELS_API_KEY,
  });
}

export function resolveGeminiApiKey(req: Request, payload?: { apiKey?: string }): string | null {
  const config = resolveByobConfig(req, { ...payload, provider: "gemini" });
  return config.apiKey || null;
}
