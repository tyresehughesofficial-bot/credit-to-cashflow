"use client";

import { useMemo, useState } from "react";
import {
  Lightbulb,
  Youtube,
  Smartphone,
  Flame,
  MessagesSquare,
  Anchor,
  Bookmark,
  Sparkles,
  ScanLine,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryChip, PlatformChip, SectionLabel } from "@/components/intelligence/bits";
import { ScoreBars, ScoreRing, TierBadge } from "@/components/intelligence/score";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { useCollection, collectionUpsert, type Row } from "@/lib/db/use-collection";
import { COLL, SEED } from "@/lib/intelligence/collections";
import {
  analyzeDemand,
  analyzeHook,
  analyzeOutlier,
  analyzePost,
  fmtN,
  type Analysis,
} from "@/lib/intelligence/analyze";
import type { CompetitorPost, DemandSignal, HookEntry, Opportunity, Outlier } from "@/lib/intelligence/types";

const GENERATED_SEED: Row[] = [];

const SCRAPERS = [
  { id: "long", label: "Long Form Scraper", icon: Youtube, tracks: "YouTube · Credit · Funding · Business Credit · Education" },
  { id: "short", label: "Short Form Scraper", icon: Smartphone, tracks: "TikTok · Instagram Reels · YouTube Shorts" },
  { id: "outlier", label: "Viral Outlier Scraper", icon: Flame, tracks: "Spikes vs. creator average" },
  { id: "demand", label: "Audience Demand Scraper", icon: MessagesSquare, tracks: "Questions · Pain · Objections · Misconceptions" },
  { id: "hook", label: "Hook Intelligence Scraper", icon: Anchor, tracks: "Curiosity · Fear · Authority · Myth · Contrarian · Proof" },
] as const;

export default function IdeaGeneration() {
  const posts = useCollection(COLL.competitorPosts, SEED[COLL.competitorPosts]);
  const outliers = useCollection(COLL.outliers, SEED[COLL.outliers]);
  const demand = useCollection(COLL.questions, SEED[COLL.questions]);
  const hooks = useCollection(COLL.hooks, SEED[COLL.hooks]);
  const generated = useCollection(COLL.opportunities, GENERATED_SEED);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tab, setTab] = useState<string>("long");

  const longForm = useMemo(
    () => (posts.records as unknown as CompetitorPost[]).filter((p) => p.platform === "YouTube"),
    [posts.records],
  );
  const shortForm = useMemo(
    () =>
      (posts.records as unknown as CompetitorPost[]).filter(
        (p) => p.platform === "TikTok" || p.platform === "Instagram",
      ),
    [posts.records],
  );

  const generatedIds = new Set(generated.records.map((r) => r.id));

  function analyze(a: Analysis) {
    setAnalysis(a);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function generateIdea(a: Analysis) {
    const { angle: _a, whyItWorked: _w, ...opp } = a;
    collectionUpsert(COLL.opportunities, opp as unknown as Row, GENERATED_SEED);
    setAnalysis(a);
  }

  const counts: Record<string, number> = {
    long: longForm.length,
    short: shortForm.length,
    outlier: outliers.records.length,
    demand: demand.records.length,
    hook: hooks.records.length,
  };

  return (
    <div>
      <PageHeader
        icon={<Lightbulb className="h-5 w-5" />}
        title="Idea Generation — Intelligence Collection Center"
        description="The central hub where content opportunities are continuously fed from multiple intelligence sources, analyzed, approved, and turned into TOF/MOF/BOF content."
      />

      {/* Workflow stepper */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 text-[12px] font-semibold">
        {["Scrapers", "Intelligence Collection", "Opportunity Analysis", "Approval Workflow", "Content Generation"].map(
          (step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-lg px-2.5 py-1",
                  i === 0 ? "bg-gold/15 text-gold" : "bg-secondary/60 text-muted-foreground",
                )}
              >
                {step}
              </span>
              {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
            </div>
          ),
        )}
      </div>

      {/* Section 1 — scraper status */}
      <SectionLabel>Section 1 · Intelligence Collection</SectionLabel>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {SCRAPERS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-4 text-left transition-colors",
                tab === s.id ? "border-gold/40 bg-gold/[0.04]" : "border-border hover:border-gold/25",
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-gold" />
                <span className="text-lg font-extrabold tabular-nums">{counts[s.id]}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] font-semibold leading-tight">{s.label}</p>
              <p className="mt-1 line-clamp-2 text-[10.5px] text-muted-foreground">{s.tracks}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-gold">
                <ScanLine className="h-3 w-3" /> View feed
              </span>
            </button>
          );
        })}
      </div>

      {/* Section 1 feeds + Section 2 analyzer */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="long">Long Form</TabsTrigger>
              <TabsTrigger value="short">Short Form</TabsTrigger>
              <TabsTrigger value="outlier">Viral Outliers</TabsTrigger>
              <TabsTrigger value="demand">Audience Demand</TabsTrigger>
              <TabsTrigger value="hook">Hooks</TabsTrigger>
            </TabsList>

            <TabsContent value="long" className="space-y-2">
              {longForm.map((p) => (
                <PostRow
                  key={p.id}
                  p={p}
                  onAnalyze={() => analyze(analyzePost(p))}
                  onGenerate={() => generateIdea(analyzePost(p))}
                  onSave={() => posts.update(p.id, { saved: !(p as unknown as Row).saved })}
                  saved={Boolean((p as unknown as Row).saved)}
                />
              ))}
            </TabsContent>
            <TabsContent value="short" className="space-y-2">
              {shortForm.map((p) => (
                <PostRow
                  key={p.id}
                  p={p}
                  short
                  onAnalyze={() => analyze(analyzePost(p))}
                  onGenerate={() => generateIdea(analyzePost(p))}
                  onSave={() => posts.update(p.id, { saved: !(p as unknown as Row).saved })}
                  saved={Boolean((p as unknown as Row).saved)}
                />
              ))}
            </TabsContent>
            <TabsContent value="outlier" className="space-y-2">
              {(outliers.records as unknown as Outlier[]).map((o) => (
                <OutlierRow key={o.id} o={o} onAnalyze={() => analyze(analyzeOutlier(o))} onGenerate={() => generateIdea(analyzeOutlier(o))} />
              ))}
            </TabsContent>
            <TabsContent value="demand" className="space-y-2">
              {(demand.records as unknown as DemandSignal[]).map((d) => (
                <DemandRow key={d.id} d={d} onAnalyze={() => analyze(analyzeDemand(d))} onGenerate={() => generateIdea(analyzeDemand(d))} />
              ))}
            </TabsContent>
            <TabsContent value="hook" className="space-y-2">
              {(hooks.records as unknown as HookEntry[]).map((h) => (
                <HookRow key={h.id} h={h} onAnalyze={() => analyze(analyzeHook(h))} onGenerate={() => generateIdea(analyzeHook(h))} />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Section 2 — analyzer */}
        <div>
          <SectionLabel>Section 2 · Opportunity Analyzer</SectionLabel>
          <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
            {!analysis ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click <span className="text-gold">Analyze</span> on any item to score the opportunity.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <ScoreRing total={analysis.total} />
                  <div className="min-w-0">
                    <TierBadge total={analysis.total} />
                    <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug">{analysis.title}</p>
                  </div>
                </div>
                <ScoreBars scores={analysis.scores} />
                <Out label="Why it worked" value={analysis.whyItWorked} />
                <Out label="Suggested angle" value={analysis.angle} />
                <div className="grid grid-cols-2 gap-2">
                  <Out label="Hook" value={analysis.hook} small />
                  <Out label="CTA" value={analysis.cta} small />
                  <Out label="Format" value={analysis.format} small />
                  <Out label="Funnel" value={analysis.funnel} small />
                </div>
                <Button className="w-full" size="sm" disabled={generatedIds.has(analysis.id)} onClick={() => generateIdea(analysis)}>
                  {generatedIds.has(analysis.id) ? (
                    "Added to Approval Queue ↓"
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4" /> Send to Approval Queue
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections 3 & 4 — approval workflow + content generation */}
      <div className="mt-2 flex items-center justify-between">
        <SectionLabel>Section 3 &amp; 4 · Approval Workflow → Content Generation</SectionLabel>
        <span className="text-[11px] text-muted-foreground">{generated.records.length} generated</span>
      </div>
      {generated.records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
          No opportunities yet. Use <span className="text-gold">Generate Idea</span> on any scraped item — it will appear
          here with Approve / Reject / Archive and TOF / MOF / BOF generation.
        </div>
      ) : (
        <div className="space-y-3">
          {(generated.records as unknown as Opportunity[])
            .slice()
            .sort((a, b) => b.total - a.total)
            .map((o, i) => (
              <OpportunityCard key={o.id} opp={o} defaultOpen={i === 0} />
            ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── row + output bits ───────────────────────────── */

function Actions({
  onAnalyze,
  onGenerate,
  onSave,
  saved,
}: {
  onAnalyze: () => void;
  onGenerate: () => void;
  onSave?: () => void;
  saved?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAnalyze}>
        Analyze
      </Button>
      {onSave && (
        <button onClick={onSave} title="Save" className="rounded p-1 text-muted-foreground hover:text-gold">
          <Bookmark className={cn("h-4 w-4", saved && "fill-gold text-gold")} />
        </button>
      )}
      <Button size="sm" className="h-7 text-[11px]" onClick={onGenerate}>
        <Sparkles className="h-3 w-3" /> Generate Idea
      </Button>
    </div>
  );
}

function PostRow({
  p,
  short,
  onAnalyze,
  onGenerate,
  onSave,
  saved,
}: {
  p: CompetitorPost;
  short?: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{p.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">“{p.hook}”</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <PlatformChip platform={p.platform} />
          <CategoryChip category={p.category} />
          <span>{p.creator}</span>
          <span>· {p.postedAt}</span>
        </div>
      </div>
      <div className="text-right text-[11px]">
        <p className="font-bold tabular-nums text-gold">{fmtN(p.views)} views</p>
        <p className="text-muted-foreground">
          {short
            ? `${fmtN(p.shares)} sh · ${fmtN(p.saves)} sv · ${fmtN(p.comments)} c`
            : `${fmtN(p.likes)} likes · ${fmtN(p.saves)} saves`}
        </p>
      </div>
      <Actions onAnalyze={onAnalyze} onGenerate={onGenerate} onSave={onSave} saved={saved} />
    </div>
  );
}

function OutlierRow({ o, onAnalyze, onGenerate }: { o: Outlier; onAnalyze: () => void; onGenerate: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gold/25 bg-card p-3">
      <Flame className="h-4 w-4 shrink-0 text-gold" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{o.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {o.creator} · {o.whyItWorked}
        </p>
      </div>
      <div className="text-right text-[11px]">
        <p className="font-bold tabular-nums text-gold">{o.multiple}x</p>
        <p className="text-muted-foreground">
          {fmtN(o.views)} vs {fmtN(o.avgViews)} avg
        </p>
      </div>
      <Actions onAnalyze={onAnalyze} onGenerate={onGenerate} />
    </div>
  );
}

function DemandRow({ d, onAnalyze, onGenerate }: { d: DemandSignal; onAnalyze: () => void; onGenerate: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium">{d.text}</p>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 font-semibold">{d.type}</span>
          <CategoryChip category={d.category} />
          <span>{d.sourceLabel}</span>
        </div>
      </div>
      <p className="shrink-0 text-right text-[11px] font-bold tabular-nums text-gold">{d.mentions} mentions</p>
      <Actions onAnalyze={onAnalyze} onGenerate={onGenerate} />
    </div>
  );
}

function HookRow({ h, onAnalyze, onGenerate }: { h: HookEntry; onAnalyze: () => void; onGenerate: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">“{h.hook}”</p>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-2 py-0.5 font-semibold text-gold/90">{h.type}</span>
          <PlatformChip platform={h.platform} />
          <span>{h.creator}</span>
        </div>
      </div>
      <p className="shrink-0 text-right text-[11px] font-bold tabular-nums text-gold">{fmtN(h.views)} views</p>
      <Actions onAnalyze={onAnalyze} onGenerate={onGenerate} />
    </div>
  );
}

function Out({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 leading-snug", small ? "text-[12px]" : "text-[12.5px]")}>{value}</p>
    </div>
  );
}
