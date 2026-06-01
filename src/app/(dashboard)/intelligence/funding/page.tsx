import { Banknote } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { FUNDING_ALERTS } from "@/lib/intelligence/data";

export default function FundingIntelligence() {
  const sorted = [...FUNDING_ALERTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <PageHeader
        icon={<Banknote className="h-5 w-5" />}
        title="Funding Intelligence"
        description="Monitoring SBA, fintech lenders, business & personal lending programs and underwriting shifts — each change becomes a timely funding content opportunity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Signals (30d)" value={FUNDING_ALERTS.length} sub="funding-channel changes" accent />
        <Stat label="Underwriting" value={FUNDING_ALERTS.filter((a) => a.channel === "Underwriting").length} sub="approval-odds shifts" />
        <Stat label="Business" value={FUNDING_ALERTS.filter((a) => a.channel === "Business Program" || a.channel === "Fintech Lender").length} sub="biz-credit angles" />
        <Stat label="Personal / SBA" value={FUNDING_ALERTS.filter((a) => a.channel === "Personal Program" || a.channel === "SBA").length} sub="consumer angles" />
      </div>

      <SectionLabel>Funding Monitoring Feed</SectionLabel>
      <div className="space-y-3">
        {sorted.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">{a.channel}</span>
              <CategoryChip category={a.category} />
              <span className="ml-auto text-[11px] text-muted-foreground">{a.date}</span>
            </div>
            <h3 className="mt-2 text-[15px] font-semibold">{a.headline}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{a.detail}</p>
          </div>
        ))}
      </div>

      <DetectedOpportunities source="funding" />
    </div>
  );
}
