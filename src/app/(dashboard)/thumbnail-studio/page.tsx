"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Save,
  RotateCcw,
  Trash2,
  CircleCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCollection, type Row } from "@/lib/db/use-collection";
import {
  BRAND_STYLES,
  CATEGORIES,
  EMOTIONS,
  PLATFORMS,
  PROVIDERS,
  generatePrompts,
  type ThumbnailInput,
  type ThumbnailPrompts,
} from "@/lib/creative/thumbnail";

const COLLECTION = "thumbnail_requests";
const SEED: Row[] = [];

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/50";

const DEFAULTS: ThumbnailInput = {
  topic: "",
  platform: "YouTube",
  contentCategory: "Credit Repair",
  emotion: "Authority",
  brandStyle: "Luxury Black & Gold",
};

function copyText(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* clipboard blocked — ignore */
  }
}

export default function ThumbnailStudio() {
  const { records, add, remove } = useCollection(COLLECTION, SEED);
  const [form, setForm] = useState<ThumbnailInput>(DEFAULTS);
  const [prompts, setPrompts] = useState<ThumbnailPrompts | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [active, setActive] = useState<keyof ThumbnailPrompts>("chatgpt");

  function set<K extends keyof ThumbnailInput>(key: K, value: ThumbnailInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function generate() {
    if (!form.topic.trim()) return;
    setPrompts(generatePrompts(form));
  }

  function flash(id: string) {
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1400);
  }

  function launch(providerId: string) {
    if (!prompts) return;
    const provider = PROVIDERS.find((p) => p.id === providerId)!;
    const prompt = prompts[provider.promptKey];
    copyText(prompt);
    flash(`open-${providerId}`);
    window.open(provider.url(prompt), "_blank", "noopener,noreferrer");
  }

  function saveRequest() {
    if (!prompts) return;
    add({
      ...form,
      generatedChatgptPrompt: prompts.chatgpt,
      generatedFireflyPrompt: prompts.firefly,
      generatedCanvaPrompt: prompts.canva,
      createdAt: new Date().toISOString(),
    } as unknown as Omit<Row, "id">);
    flash("save");
  }

  function load(r: Row) {
    setForm({
      topic: String(r.topic ?? ""),
      platform: String(r.platform ?? "YouTube"),
      contentCategory: String(r.contentCategory ?? "Credit Repair"),
      emotion: String(r.emotion ?? "Authority"),
      brandStyle: String(r.brandStyle ?? "Luxury Black & Gold"),
    });
    setPrompts({
      chatgpt: String(r.generatedChatgptPrompt ?? ""),
      firefly: String(r.generatedFireflyPrompt ?? ""),
      canva: String(r.generatedCanvaPrompt ?? ""),
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader
        icon={<ImageIcon className="h-5 w-5" />}
        title="Thumbnail Studio"
        description="Generate provider-ready thumbnail prompts, then launch straight into ChatGPT, Adobe Firefly or Canva. Prompt-first — no image API required."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <div className="h-fit rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Thumbnail Concept</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Describe it; we&apos;ll write the prompts.</p>

          <div className="mt-4 space-y-3">
            <Field label="Topic">
              <input
                className={inputCls}
                placeholder="e.g. How to delete a collection in 2026"
                value={form.topic}
                onChange={(e) => set("topic", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Platform">
                <select className={inputCls} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                  {PLATFORMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select className={inputCls} value={form.contentCategory} onChange={(e) => set("contentCategory", e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Emotion">
                <select className={inputCls} value={form.emotion} onChange={(e) => set("emotion", e.target.value)}>
                  {EMOTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Brand Style">
                <select className={inputCls} value={form.brandStyle} onChange={(e) => set("brandStyle", e.target.value)}>
                  {BRAND_STYLES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Button className="w-full" onClick={generate} disabled={!form.topic.trim()}>
              <Wand2 className="h-4 w-4" /> Generate Thumbnail Concept
            </Button>
          </div>
        </div>

        {/* Provider Launch Center */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/25 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Provider Launch Center</p>
              <div className="flex flex-wrap gap-1.5">
                {["ChatGPT", "Adobe Firefly", "Canva"].map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                    <CircleCheck className="h-3.5 w-3.5" /> {p} Ready
                  </span>
                ))}
              </div>
            </div>

            {!prompts ? (
              <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Wand2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill the form and hit <span className="text-gold">Generate Thumbnail Concept</span> to get ChatGPT,
                  Firefly &amp; Canva prompts.
                </p>
              </div>
            ) : (
              <>
                {/* Launch buttons */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PROVIDERS.map((p) => (
                    <Button key={p.id} variant="outline" className="h-10" onClick={() => launch(p.id)}>
                      {copied === `open-${p.id}` ? <Check className="h-4 w-4 text-success" /> : <ExternalLink className="h-4 w-4" />}
                      Open in {p.label.replace("Adobe ", "")}
                    </Button>
                  ))}
                  <Button
                    className="h-10"
                    onClick={() => {
                      copyText(prompts[active]);
                      flash("copy");
                    }}
                  >
                    {copied === "copy" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy Prompt
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  “Open in …” copies that tool&apos;s prompt to your clipboard and opens the tool in a new tab — just paste.
                </p>

                {/* Prompt tabs */}
                <div className="mt-4 flex gap-1.5">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActive(p.promptKey)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        active === p.promptKey
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p.label} prompt
                    </button>
                  ))}
                </div>
                <div className="mt-2 rounded-lg border border-border bg-background/40 p-3">
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{prompts[active]}</p>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={saveRequest}>
                    {copied === "save" ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    Save to history
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* History — save / load / edit / reuse */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border p-3">
              <p className="text-[13px] font-semibold">
                Prompt History <span className="text-muted-foreground">({records.length})</span>
              </p>
            </div>
            {records.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">
                No saved prompts yet. Generate a concept and click <span className="text-gold">Save to history</span>.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {records.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{String(r.topic)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {String(r.platform)} · {String(r.contentCategory)} · {String(r.emotion)} ·{" "}
                        {String(r.brandStyle)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => load(r)}>
                        <RotateCcw className="h-3 w-3" /> Load &amp; Reuse
                      </Button>
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Phase 2 seam: add <code className="text-gold">OPENAI_API_KEY</code> /{" "}
            <code className="text-gold">ADOBE_FIREFLY_API_KEY</code> to generate images in-app from these same prompts —
            the UI won&apos;t change.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
