"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, HardDrive, Key, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DEFAULT_BYOB_CONFIG,
  getByobConfig,
  removeByobConfig,
  setByobConfig,
  type AiProvider,
  type ByobConfig,
} from "@/lib/byob-client";
import { toast } from "sonner";

const PROVIDERS: Array<{ id: AiProvider; label: string; detail: string }> = [
  { id: "local-whisper", label: "Local Whisper", detail: "Free, private, runs on this server" },
  { id: "gemini", label: "Gemini", detail: "Gemini audio + structured editing" },
  { id: "openai", label: "OpenAI", detail: "Whisper word timestamps" },
  { id: "azure-openai", label: "Azure OpenAI", detail: "Your Azure deployments" },
];

function hasCloudCredentials(config: ByobConfig): boolean {
  if (config.provider === "local-whisper") return true;
  if (!config.apiKey) return false;
  if (config.provider === "azure-openai") {
    return Boolean(config.endpoint && config.transcriptionDeployment);
  }
  return true;
}

export function ByobKeyDialog({ triggerText = "AI Provider" }: { triggerText?: string }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ByobConfig>(DEFAULT_BYOB_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const stored = getByobConfig();
      setConfig(stored);
      setIsConfigured(hasCloudCredentials(stored));
    }
    setOpen(nextOpen);
  };

  const update = (next: Partial<ByobConfig>) => setConfig((current) => ({ ...current, ...next }));

  const handleSave = () => {
    if (!hasCloudCredentials(config)) {
      toast.error(
        config.provider === "azure-openai"
          ? "Azure endpoint, transcription deployment, and API key are required."
          : "An API key is required for this cloud provider.",
      );
      return;
    }

    setByobConfig(config);
    setIsConfigured(true);
    toast.success(
      config.provider === "local-whisper"
        ? "Local Whisper selected. The first transcription downloads the free model."
        : `${PROVIDERS.find((provider) => provider.id === config.provider)?.label} connected for BYOB transcription.`,
    );
    setOpen(false);
  };

  const handleClear = () => {
    removeByobConfig();
    setConfig(DEFAULT_BYOB_CONFIG);
    setIsConfigured(true);
    toast.info("Cloud credentials cleared. Local Whisper is active.");
  };

  const selected = PROVIDERS.find((provider) => provider.id === config.provider) ?? PROVIDERS[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={`h-9 rounded-full px-3 text-xs font-medium gap-1.5 ${
              isConfigured ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-white/15 text-gray-300"
            }`}
          >
            {config.provider === "local-whisper" ? <HardDrive className="h-3.5 w-3.5" /> : <Key className="h-3.5 w-3.5" />}
            <span>{isConfigured ? selected.label : triggerText}</span>
            {isConfigured && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-gray-950">Transcription provider</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Choose free local transcription or bring your Gemini, OpenAI, or Azure OpenAI credentials. Keys stay in this browser and are forwarded only for the request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => update({ provider: provider.id })}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  config.provider === provider.id
                    ? "border-blue-500 bg-blue-50 text-blue-950"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="text-sm font-semibold">{provider.label}</div>
                <div className="mt-0.5 text-xs text-gray-500">{provider.detail}</div>
              </button>
            ))}
          </div>

          {config.provider === "local-whisper" ? (
            <div className="flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>No API key or usage bill. The multilingual base model is cached locally after its first download.</span>
            </div>
          ) : (
            <>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-gray-700">API key</span>
                <span className="relative block">
                  <input
                    type={showKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(event) => update({ apiKey: event.target.value })}
                    placeholder={config.provider === "gemini" ? "AIzaSy..." : "sk-..."}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 font-mono text-sm text-gray-950 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              {config.provider === "azure-openai" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-semibold text-gray-700">Azure endpoint</span>
                    <input
                      value={config.endpoint ?? ""}
                      onChange={(event) => update({ endpoint: event.target.value })}
                      placeholder="https://your-resource.openai.azure.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-950 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-gray-700">Text deployment</span>
                    <input
                      value={config.deployment ?? ""}
                      onChange={(event) => update({ deployment: event.target.value })}
                      placeholder="gpt-4.1-mini"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-950 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-gray-700">Whisper deployment</span>
                    <input
                      value={config.transcriptionDeployment ?? ""}
                      onChange={(event) => update({ transcriptionDeployment: event.target.value })}
                      placeholder="whisper-1"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-950 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                </div>
              )}

            </>
          )}

          <div className="space-y-2 border-t border-gray-200 pt-4">
            <label className="text-sm font-semibold text-gray-700">Pexels API key (optional B-roll)</label>
            <input
              type={showKey ? "text" : "password"}
              value={config.pexelsApiKey ?? ""}
              onChange={(event) => update({ pexelsApiKey: event.target.value })}
              placeholder="Free Pexels API key"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono text-sm text-gray-950 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500">Resolves real portrait stock-video B-roll. Without it, branded motion graphics are used.</p>
          </div>

          <div className="flex gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>For production, replace browser storage with encrypted per-user secrets and a managed job queue.</span>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-red-600 hover:bg-red-50">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Clear cloud keys
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
              Save provider
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
