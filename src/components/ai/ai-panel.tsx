"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

import { aiText } from "@/lib/ai";
import { cn } from "@/lib/utils";

/**
 * Drop-in "real AI" panel. Calls Claude via the generate-text Edge Function and
 * renders the result; if AI is unavailable it shows `fallback` with a quiet
 * note. Use anywhere to upgrade a deterministic feature with one component.
 */
export function AIPanel({
  title,
  system,
  prompt,
  fallback,
  cta = "Generate with AI",
  maxTokens = 700,
  className,
}: {
  title: string;
  system?: string;
  prompt: string;
  fallback?: string;
  cta?: string;
  maxTokens?: number;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  async function run() {
    setLoading(true);
    const t = await aiText({ system, prompt, maxTokens });
    setLoading(false);
    if (t == null) {
      setOffline(true);
      setText(fallback ?? "AI is not enabled yet. Set ANTHROPIC_API_KEY in Supabase to turn this on.");
    } else {
      setOffline(false);
      setText(t);
    }
  }

  return (
    <div className={cn("rounded-xl border border-gold/30 bg-card p-4", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-gold" /> {title}
        </p>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-gold-gradient px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : text ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {text ? "Regenerate" : cta}
        </button>
      </div>
      {text ? (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{text}</div>
      ) : (
        <p className="text-xs text-muted-foreground">Click to generate a tailored AI strategy for this client.</p>
      )}
      {offline && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          AI offline — showing the deterministic plan. Deploy <span className="text-gold">generate-text</span> + set the key to enable live AI.
        </p>
      )}
    </div>
  );
}
