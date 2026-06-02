"use client";

import { Flame, Zap } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, PlatformChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { DataTable } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { COLL, FIELDS, SEED } from "@/lib/intelligence/collections";
import type { Outlier } from "@/lib/intelligence/types";

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`);

export default function ViralOutliers() {
  const OUTLIERS = useCollection(COLL.outliers, SEED[COLL.outliers]).records as unknown as Outlier[];
  const sorted = [...OUTLIERS].sort((a, b) => b.multiple - a.multiple);
  const topMultiple = sorted[0];

  return (
    <div>
      <PageHeader
        icon={<Flame className="h-5 w-5" />}
        title="Viral Outlier Detection"
        description="Content that dramatically outperforms a creator's baseline. The engine flags the spike, dissects why it worked, and proposes a replication play."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Outliers Detected" value={OUTLIERS.length} sub="this week" accent />
        <Stat label="Biggest Spike" value={`${topMultiple.multiple}x`} sub={topMultiple.creator} />
        <Stat label="Avg Multiple" value={`${(OUTLIERS.reduce((a, o) => a + o.multiple, 0) / OUTLIERS.length).toFixed(1)}x`} sub="over baseline" />
        <Stat label="Top Opp Score" value={Math.max(...OUTLIERS.map((o) => o.opportunityScore))} sub="replication potential" />
      </div>

      <SectionLabel>Outlier Breakdown</SectionLabel>
      <div className="space-y-4">
        {sorted.map((o) => (
          <div key={o.id} className="rounded-xl border border-gold/25 bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold">
                <Flame className="h-3.5 w-3.5" /> Outlier Detected
              </span>
              <PlatformChip platform={o.platform} />
              <CategoryChip category={o.category} />
              <span className="text-[11px] text-muted-foreground">{o.creator}</span>
              <span className="ml-auto text-sm font-extrabold text-gold">{o.multiple}x average</span>
            </div>

            <div className="p-4">
              <h3 className="text-[15px] font-semibold">{o.title}</h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">“{o.hook}”</p>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Outlier Views" value={fmt(o.views)} accent />
                <Metric label="Creator Avg" value={fmt(o.avgViews)} />
                <Metric label="Format" value={o.format} />
                <Metric label="Timing" value={o.timing} />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <Box label="Topic / Angle" value={`${o.topic} — ${o.angle}`} />
                <Box label="Thumbnail" value={o.thumbnail} />
                <Box label="CTA" value={o.cta} />
                <div className="rounded-lg border border-success/20 bg-success/[0.04] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-success">Why this worked</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{o.whyItWorked}</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  <Zap className="h-3.5 w-3.5" /> Replication Suggestions · Opportunity Score {o.opportunityScore}
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {o.replication.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Outlier Records — Add / Edit / Import</SectionLabel>
      <DataTable collection={COLL.outliers} seed={SEED[COLL.outliers]} fields={FIELDS[COLL.outliers]} title="Viral Outliers" />

      <DetectedOpportunities source="outlier" />
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${accent ? "text-gold" : ""}`}>{value}</p>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-[13px] leading-relaxed">{value}</p>
    </div>
  );
}
