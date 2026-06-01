import { Landmark } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { CFPB_ALERTS } from "@/lib/intelligence/data";

export default function CFPBIntelligence() {
  const sorted = [...CFPB_ALERTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <PageHeader
        icon={<Landmark className="h-5 w-5" />}
        title="CFPB Intelligence"
        description="Monitoring CFPB announcements, enforcement actions, complaint trends and regulatory updates — high-authority proof points for consumer-rights content."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Updates (30d)" value={CFPB_ALERTS.length} sub="regulatory signals" accent />
        <Stat label="Enforcement" value={CFPB_ALERTS.filter((a) => a.type === "Enforcement Action").length} sub="proof disputes work" />
        <Stat label="Complaint Trends" value={CFPB_ALERTS.filter((a) => a.type === "Complaint Trend").length} sub="demand indicators" />
        <Stat label="Announcements" value={CFPB_ALERTS.filter((a) => a.type === "Announcement").length} sub="citable guidance" />
      </div>

      <SectionLabel>Regulatory Monitoring Feed</SectionLabel>
      <div className="space-y-3">
        {sorted.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">CFPB</span>
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

      <DetectedOpportunities source="cfpb" />
    </div>
  );
}
