import { Trophy } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { CLIENT_PATTERNS } from "@/lib/intelligence/data";

export default function ClientIntelligence() {
  return (
    <div>
      <PageHeader
        icon={<Trophy className="h-5 w-5" />}
        title="Client Intelligence"
        description="Mining historical client outcomes — removals, score jumps and funding approvals — to surface real, provable case-study and success-pattern content."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Success Patterns" value={CLIENT_PATTERNS.length} sub="provable angles" accent />
        <Stat label="Case Studies Ready" value={CLIENT_PATTERNS.length} sub="real results" />
        <Stat label="Result Categories" value={new Set(CLIENT_PATTERNS.map((c) => c.metric)).size} sub="removal · score · funding" />
        <Stat label="Authority Fuel" value="High" sub="receipts beat opinions" />
      </div>

      <SectionLabel>Success Patterns → Case-Study Opportunities</SectionLabel>
      <div className="grid gap-3 md:grid-cols-2">
        {CLIENT_PATTERNS.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-gold">
                <Trophy className="h-3.5 w-3.5" /> {c.metric}
              </span>
              <CategoryChip category={c.category} />
            </div>
            <p className="mt-2 text-lg font-extrabold tracking-tight gold-text">{c.stat}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{c.detail}</p>
          </div>
        ))}
      </div>

      <DetectedOpportunities source="client" />
    </div>
  );
}
