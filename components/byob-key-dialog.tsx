"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getByobApiKey, setByobApiKey, removeByobApiKey } from "@/lib/byob-client";
import { toast } from "sonner";

export function ByobKeyDialog({ triggerText = "BYOB API Key" }: { triggerText?: string }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    if (open) {
      const stored = getByobApiKey();
      setApiKeyInput(stored);
      setHasStoredKey(Boolean(stored));
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      removeByobApiKey();
      setHasStoredKey(false);
      toast.info("BYOB API key cleared");
    } else {
      setByobApiKey(trimmed);
      setHasStoredKey(true);
      toast.success("BYOB API key saved! Ready for AI Create & AI Editor.");
    }
    setOpen(false);
  };

  const handleClear = () => {
    removeByobApiKey();
    setApiKeyInput("");
    setHasStoredKey(false);
    toast.info("BYOB API key cleared");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant={hasStoredKey ? "default" : "outline"}
          size="sm"
          className={`h-9 px-3 rounded-full text-xs font-medium gap-1.5 transition-all ${
            hasStoredKey
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>{hasStoredKey ? "BYOB Key Active" : triggerText}</span>
          {hasStoredKey && <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 border shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Key className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">Bring Your Own Key (BYOB)</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500">
            Enter your Google Gemini API Key. Your key is stored securely in your browser and used directly for video creation, script synthesis, and AI video editing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {hasStoredKey ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Active BYOB key is loaded. Remotion and Hyperframes AI generators will use your key.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <span>No BYOB key set. The system will fall back to server environment variables if available.</span>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 pt-2">
          {hasStoredKey ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear Key
            </Button>
          ) : <div />}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save & Activate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
