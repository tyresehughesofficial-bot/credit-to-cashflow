import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { OBJECTIONS } from "@/lib/intelligence/data";
import type { Objection } from "@/lib/intelligence/types";

const TYPE_CLASS: Record<Objection["type"], string> = {
  Trust: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  Price: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Timing: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Skepticism: "bg-violet-500/10 text-violet-300 border-violet-500/20",
};

export default function ObjectionIntelligence() {
  const sorted = [...OBJECTIONS].sort((a, b) => b.frequency - a.frequency);

  return (
    <div>
      <PageHeader
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Objection Intelligence"
        description="Mining sales calls, DMs, consultation notes, email replies and lead forms for trust, price, timing and skepticism objections — then turning each into pre-emptive content."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Objections Tracked" value={OBJECTIONS.length} sub="distinct patterns" accent />
        <Stat label="Most Frequent" value={sorted[0].frequency} sub={sorted[0].type} />
        <Stat label="Trust + Skepticism" value={OBJECTIONS.filter((o) => o.type === "Trust" || o.type === "Skepticism").length} sub="authority content" />
        <Stat label="Price Objections" value={OBJECTIONS.filter((o) => o.type === "Price").length} sub="value-framing content" />
      </div>

      <SectionLabel>Objection Patterns → Counter-Content</SectionLabel>
      <div className="space-y-2">
        {sorted.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3.5">
            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", TYPE_CLASS[o.type])}>
              {o.type}
            </span>
            <p className="flex-1 text-[14px] font-medium">“{o.text}”</p>
            <CategoryChip category={o.category} />
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{o.channel}</span>
            <span className="text-sm font-bold tabular-nums text-gold">{o.frequency}×</span>
          </div>
        ))}
      </div>

      <DetectedOpportunities source="objection" />
    </div>
  );
}
