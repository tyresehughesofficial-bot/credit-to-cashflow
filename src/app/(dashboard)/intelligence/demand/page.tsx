"use client";

import { MessagesSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { DataTable } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { COLL, FIELDS, SEED } from "@/lib/intelligence/collections";
import type { DemandSignal } from "@/lib/intelligence/types";
import type { DemandType } from "@/lib/intelligence/types";

const TYPE_CLASS: Record<DemandType, string> = {
  Question: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  "Pain Point": "bg-red-500/10 text-red-300 border-red-500/20",
  Objection: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Misconception: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Confusion: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Request: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

export default function AudienceDemand() {
  const DEMAND_SIGNALS = useCollection(COLL.questions, SEED[COLL.questions]).records as unknown as DemandSignal[];
  const sorted = [...DEMAND_SIGNALS].sort((a, b) => b.mentions - a.mentions);
  const total = DEMAND_SIGNALS.reduce((a, d) => a + d.mentions, 0);

  return (
    <div>
      <PageHeader
        icon={<MessagesSquare className="h-5 w-5" />}
        title="Audience Demand Mining"
        description="Comment & DM analysis across Triad T and competitor content — extracting the questions, pain points, objections and misconceptions the market is asking to be answered."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Signals Mined" value={DEMAND_SIGNALS.length} sub="distinct themes" accent />
        <Stat label="Total Mentions" value={total.toLocaleString()} sub="rolling 30 days" />
        <Stat label="Top Demand" value={sorted[0].mentions} sub={`“${sorted[0].text.slice(0, 28)}…”`} />
        <Stat label="Pain Signals" value={DEMAND_SIGNALS.filter((d) => d.type === "Pain Point" || d.sentiment < -30).length} sub="high-urgency" />
      </div>

      <SectionLabel>Demand Signals → Content Opportunities</SectionLabel>
      <div className="space-y-2">
        {sorted.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3.5">
            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", TYPE_CLASS[d.type])}>
              {d.type}
            </span>
            <p className="flex-1 text-[14px] font-medium">{d.text}</p>
            <CategoryChip category={d.category} />
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-gold">{d.mentions}</p>
              <p className="text-[10px] text-muted-foreground">{d.sourceLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Extracted Questions — Add / Edit / Import</SectionLabel>
      <DataTable collection={COLL.questions} seed={SEED[COLL.questions]} fields={FIELDS[COLL.questions]} title="Demand Signals" />

      <DetectedOpportunities source="demand" />
    </div>
  );
}
