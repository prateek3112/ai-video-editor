import { GoogleGenAI } from "@google/genai";
import type { ByobConfig } from "./byob-client";

function stripCodeFence(input: string): string {
  return input
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateStructuredJson<T>(
  config: ByobConfig,
  prompt: string,
  timeoutMs = 30_000,
): Promise<T> {
  if (config.provider === "local-whisper") {
    throw new Error("AI generation needs Gemini, OpenAI, or Azure OpenAI. Local Whisper is transcription-only.");
  }
  if (!config.apiKey) throw new Error(`${config.provider} API key is required`);

  if (config.provider === "gemini") {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs)),
    ]);
    return JSON.parse(stripCodeFence(response.text ?? "{}")) as T;
  }

  let url = "https://api.openai.com/v1/chat/completions";
  let model = "gpt-5-mini";
  let headers: Record<string, string> = { Authorization: `Bearer ${config.apiKey}` };

  if (config.provider === "azure-openai") {
    if (!config.endpoint || !config.deployment) {
      throw new Error("Azure endpoint and text deployment are required for AI generation");
    }
    const endpoint = new URL(config.endpoint);
    const allowedAzureHost = endpoint.hostname.endsWith(".openai.azure.com") || endpoint.hostname.endsWith(".services.ai.azure.com");
    if (!allowedAzureHost) throw new Error("Azure endpoint must use an official Azure AI host");
    const deployment = encodeURIComponent(config.deployment);
    const apiVersion = encodeURIComponent(config.apiVersion || "2024-10-21");
    url = `${endpoint.origin}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    model = config.deployment;
    headers = { "api-key": config.apiKey };
  }

  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
      }),
    },
    timeoutMs,
  );

  if (!response.ok) {
    throw new Error(`${config.provider} returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }

  const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${config.provider} returned no structured response`);
  return JSON.parse(stripCodeFence(content)) as T;
}
