"use client";

import { useMemo, useState } from "react";
import {
  Clapperboard,
  Wand2,
  Loader2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  CopyPlus,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useCollection, type Row } from "@/lib/db/use-collection";
import {
  ASSET_TYPES,
  BRAND_STYLES,
  INDUSTRIES,
  PLATFORMS,
  buildDirection,
  type CreativeDirection,
  type CreativeInput,
  type ProviderId,
} from "@/lib/creative/engine";
import { generateAsset } from "@/lib/creative/providers";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const COLLECTION = "creative_assets";
const ASSET_SEED: Row[] = [];
const PROVIDERS: ProviderId[] = ["OpenAI", "Adobe Firefly", "Canva"];
const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-gold/50";

const DEFAULTS: CreativeInput = {
  projectName: "",
  assetType: "Advertisement",
  topic: "",
  industry: "Business Funding",
  offer: "",
  platform: "Instagram",
  brandStyle: "Luxury Black & Gold",
  provider: "OpenAI",
};

const copy = (t: string) => {
  try {
    navigator.clipboard?.writeText(t);
  } catch {
    /* ignore */
  }
};

export default function CreativeStudio() {
  const { records, add, update, remove } = useCollection(COLLECTION, ASSET_SEED);
  const [form, setForm] = useState<CreativeInput>(DEFAULTS);
  const [dir, setDir] = useState<CreativeDirection | null>(null);
  const [asset, setAsset] = useState<{ url: string; real: boolean; provider: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  function set<K extends keyof CreativeInput>(k: K, v: CreativeInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function ping(id: string) {
    setFlash(id);
    setTimeout(() => setFlash((c) => (c === id ? null : c)), 1300);
  }

  async function generate() {
    if (!form.topic.trim() && !form.projectName.trim()) return;
    setBusy(true);
    const direction = buildDirection(form);
    setDir(direction);
    try {
      const out = await generateAsset(form, direction);
      setAsset({ url: out.assetUrl, real: out.real, provider: out.provider });
      add({
        projectName: form.projectName || form.topic,
        assetType: form.assetType,
        topic: form.topic,
        industry: form.industry,
        offer: form.offer,
        platform: form.platform,
        brandStyle: form.brandStyle,
        provider: out.provider,
        prompt: direction.prompts.openai,
        assetUrl: out.assetUrl,
        width: out.width,
        height: out.height,
        real: out.real,
        createdAt: new Date().toISOString(),
      } as unknown as Omit<Row, "id">);
    } finally {
      setBusy(false);
    }
  }

  async function regenerate(r: Row) {
    const input: CreativeInput = {
      projectName: String(r.projectName ?? ""),
      assetType: String(r.assetType ?? "Advertisement"),
      topic: String(r.topic ?? ""),
      industry: String(r.industry ?? ""),
      offer: String(r.offer ?? ""),
      platform: String(r.platform ?? ""),
      brandStyle: String(r.brandStyle ?? "Luxury Black & Gold"),
      provider: (String(r.provider ?? "OpenAI") as ProviderId) || "OpenAI",
    };
    const direction = buildDirection(input);
    const out = await generateAsset(input, direction);
    update(r.id, { assetUrl: out.assetUrl, real: out.real, prompt: direction.prompts.openai, createdAt: new Date().toISOString() });
  }

  function download(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "asset"}.${url.startsWith("data:image/svg") ? "svg" : "png"}`;
    a.click();
  }

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filter !== "all" && String(r.assetType) !== filter) return false;
      if (q && !`${r.projectName} ${r.topic} ${r.industry}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [records, q, filter]);

  return (
    <div>
      <PageHeader
        icon={<Clapperboard className="h-5 w-5" />}
        title="Creative Asset Generation Engine"
        description="The creative department of Triad T — turn a brief into knowledge-grounded creative direction and a generated asset via OpenAI / Adobe Firefly / Canva, organized into projects."
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              isSupabaseConfigured ? "bg-success/10 text-success" : "bg-gold/10 text-gold",
            )}
          >
            {isSupabaseConfigured ? "Supabase connected" : "Preview mode (local)"}
          </span>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr_360px]">
        {/* LEFT — Project Builder */}
        <div className="h-fit rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Creative Project Builder</p>
          <div className="mt-3 space-y-3">
            <F label="Project Name">
              <input className={inputCls} value={form.projectName} placeholder="Q3 Funding Ad" onChange={(e) => set("projectName", e.target.value)} />
            </F>
            <F label="Asset Type">
              <select className={inputCls} value={form.assetType} onChange={(e) => set("assetType", e.target.value)}>
                {ASSET_TYPES.map((a) => (
                  <option key={a.id}>{a.id}</option>
                ))}
              </select>
            </F>
            <F label="Topic">
              <input className={inputCls} value={form.topic} placeholder="Get approved for $50k" onChange={(e) => set("topic", e.target.value)} />
            </F>
            <div className="grid grid-cols-2 gap-2">
              <F label="Industry">
                <select className={inputCls} value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </F>
              <F label="Platform">
                <select className={inputCls} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                  {PLATFORMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </F>
            </div>
            <F label="Offer">
              <input className={inputCls} value={form.offer} placeholder="Funding Accelerator" onChange={(e) => set("offer", e.target.value)} />
            </F>
            <F label="Brand Style">
              <select className={inputCls} value={form.brandStyle} onChange={(e) => set("brandStyle", e.target.value)}>
                {BRAND_STYLES.map((b) => (
                  <option key={b.id}>{b.id}</option>
                ))}
              </select>
            </F>
            <F label="Generation Provider">
              <div className="grid grid-cols-3 gap-1.5">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => set("provider", p)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors",
                      form.provider === p ? "border-gold/40 bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.replace("Adobe ", "")}
                  </button>
                ))}
              </div>
            </F>
            <Button className="w-full" onClick={generate} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>

        {/* CENTER — Creative Generation */}
        <div className="min-w-0 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">AI Creative Generation</p>
          {!dir ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Fill the brief and hit <span className="text-gold">Generate</span>. The engine searches your knowledge
                base, builds creative direction, writes provider prompts, and renders the asset.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <Out label="Creative Direction" value={dir.direction} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Out label="Visual Concept" value={dir.concept} />
                <Out label="Composition Layout" value={dir.composition} />
                <Out label="Typography Direction" value={dir.typography} />
                <Out label="Brand Alignment" value={dir.brandAlignment} />
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Color Palette</p>
                <div className="mt-2 flex gap-2">
                  {dir.palette.map((c) => (
                    <div key={c} className="flex items-center gap-1.5">
                      <span className="h-6 w-6 rounded-md border border-border" style={{ background: c }} />
                      <span className="text-[10px] text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              {dir.sources.length > 0 && (
                <div className="rounded-lg border border-gold/20 bg-gold/[0.04] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">Knowledge used</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {dir.sources.map((s) => (
                      <a
                        key={s.title}
                        href={s.viewUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground hover:text-gold"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset prompt + provider actions */}
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Asset Prompt</p>
                  <button
                    onClick={() => { copy(dir.prompts.openai); ping("p"); }}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-gold"
                  >
                    {flash === "p" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />} Copy
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed">{dir.prompts.openai}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { copy(dir.prompts.firefly); ping("ff"); window.open("https://firefly.adobe.com/generate/images?prompt=" + encodeURIComponent(dir.prompts.firefly), "_blank", "noopener"); }}>
                  {flash === "ff" ? <Check className="h-3.5 w-3.5 text-success" /> : <ExternalLink className="h-3.5 w-3.5" />} Open in Firefly
                </Button>
                <Button size="sm" variant="outline" onClick={() => { copy(dir.prompts.canva); ping("cv"); window.open("https://www.canva.com/", "_blank", "noopener"); }}>
                  {flash === "cv" ? <Check className="h-3.5 w-3.5 text-success" /> : <ExternalLink className="h-3.5 w-3.5" />} Export to Canva
                </Button>
                <Button size="sm" variant="outline" onClick={() => { copy(dir.prompts.canva); ping("cb"); }}>
                  {flash === "cb" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />} Copy Canva Brief
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Asset Preview */}
        <div className="h-fit rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Generated Asset</p>
          {!asset ? (
            <div className="mt-3 flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
              Your generated asset appears here.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt="Generated asset" className="w-full rounded-lg border border-border" />
              <div className="flex items-center justify-between">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", asset.real ? "bg-success/15 text-success" : "bg-gold/10 text-gold")}>
                  {asset.real ? `${asset.provider} · live` : `${asset.provider} · preview mock`}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => download(asset.url, form.projectName || form.topic)} className="rounded p-1 text-muted-foreground hover:text-gold" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={generate} className="rounded p-1 text-muted-foreground hover:text-gold" title="Regenerate">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!asset.real && (
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Add <code className="text-gold">NEXT_PUBLIC_OPENAI_API_KEY</code> (or the server Firefly keys) to render the
                  real image from this exact prompt — the flow is unchanged.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM — Asset Library */}
      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <p className="mr-auto inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Layers className="h-4 w-4 text-gold" /> Asset Library ({records.length})
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input className={cn(inputCls, "h-8 w-44 pl-8 text-xs")} placeholder="Search assets…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={cn(inputCls, "h-8 w-40 text-xs")} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All types</option>
            {ASSET_TYPES.map((a) => (
              <option key={a.id}>{a.id}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
            No assets yet. Generate your first creative above.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((r) => (
              <div key={r.id} className="group overflow-hidden rounded-xl border border-border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(r.assetUrl)} alt={String(r.projectName)} className="aspect-square w-full object-cover" />
                <div className="p-2.5">
                  <p className="truncate text-[12px] font-medium">{String(r.projectName)}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {String(r.assetType)} · {String(r.provider)}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <IconBtn title="Download" onClick={() => download(String(r.assetUrl), String(r.projectName))}><Download className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn title="Copy prompt" onClick={() => { copy(String(r.prompt)); ping(`c-${r.id}`); }}>{flash === `c-${r.id}` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}</IconBtn>
                    <IconBtn title="Duplicate" onClick={() => { const { id: _i, ...rest } = r; add(rest as Omit<Row, "id">); }}><CopyPlus className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn title="Regenerate" onClick={() => regenerate(r)}><RefreshCw className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn title="Delete" danger onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Out({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed">{value}</p>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn("rounded p-1 text-muted-foreground transition-colors", danger ? "hover:text-destructive" : "hover:text-gold")}
    >
      {children}
    </button>
  );
}
