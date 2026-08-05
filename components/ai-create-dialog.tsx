"use client";

import { useState } from "react";
import { Sparkles, Wand2, Video, Loader2, ArrowRight, Layers, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getByobApiKey, getAuthHeaders } from "@/lib/byob-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AiCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"hinglish" | "english" | "hindi">("hinglish");
  const [style, setStyle] = useState("hormozi");
  const [duration, setDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a video prompt or script topic.");
      return;
    }

    const key = getByobApiKey();
    if (!key) {
      toast.warning("Please click 'BYOB API Key' in the top right to enter your Gemini API Key first!");
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai-create", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
          style,
          targetDuration: duration,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate video");
      }

      toast.success("AI Video generated successfully!");
      setOpen(false);
      router.push(`/editor?id=${data.projectId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate video project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 font-medium">
          <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          <span>AI Create Mode</span>
          <ArrowRight className="h-4 w-4 opacity-80" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 border shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">AI Create Mode</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Describe your video concept. Gemini will write the script, synthesize word timings, generate scenes & motifs, and compile Remotion + Hyperframes compositions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Video Topic or Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a 15s viral reel explaining Next.js App Router in Hinglish with Hormozi captions, growth charts, and high-energy word pops."
              rows={3}
              className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Controls grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hinglish">Hinglish (Primary)</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>

            {/* Caption Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Caption Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hormozi">Hormozi Pop</option>
                <option value="karaoke">Karaoke Highlight</option>
                <option value="neon-glow">Neon Glow</option>
                <option value="word-pop">Word Pop</option>
                <option value="bold-white">Bold White</option>
                <option value="dark-box">Dark Box</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
              </select>
            </div>
          </div>

          {/* Engine note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            <Layers className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Generates both <strong>Remotion React Composition</strong> & <strong>Hyperframes HTML Timeline</strong> instantly.</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 px-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate AI Video
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
