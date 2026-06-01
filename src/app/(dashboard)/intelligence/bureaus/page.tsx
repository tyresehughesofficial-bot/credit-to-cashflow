import { Scale } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { BUREAU_ALERTS } from "@/lib/intelligence/data";

export default function BureauIntelligence() {
  const sorted = [...BUREAU_ALERTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <PageHeader
        icon={<Scale className="h-5 w-5" />}
        title="Bureau Intelligence"
        description="Monitoring Experian, Equifax and TransUnion for reporting, scoring and policy changes — each one a fresh, low-competition content opportunity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Alerts (30d)" value={BUREAU_ALERTS.length} sub="across 3 bureaus" accent />
        <Stat label="Reporting Changes" value={BUREAU_ALERTS.filter((a) => a.type === "Reporting Change").length} sub="affect consumer files" />
        <Stat label="Policy Changes" value={BUREAU_ALERTS.filter((a) => a.type === "Policy Change").length} sub="dispute-relevant" />
        <Stat label="Consumer Alerts" value={BUREAU_ALERTS.filter((a) => a.type === "Consumer Alert").length} sub="actionable" />
      </div>

      <SectionLabel>Bureau Monitoring Feed</SectionLabel>
      <div className="space-y-3">
        {sorted.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">{a.bureau}</span>
              <span className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {a.type}
              </span>
              <CategoryChip category={a.category} />
              <span className="ml-auto text-[11px] text-muted-foreground">{a.date}</span>
            </div>
            <h3 className="mt-2 text-[15px] font-semibold">{a.headline}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{a.detail}</p>
          </div>
        ))}
      </div>

      <DetectedOpportunities source="bureau" />
    </div>
  );
}
