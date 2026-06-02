"use client";

import { AlertOctagon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CategoryChip, PlatformChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { FunnelChip } from "@/components/intelligence/bits";
import { DataTable } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { COLL, FIELDS, SEED } from "@/lib/intelligence/collections";
import type { Myth } from "@/lib/intelligence/types";

export default function CreditMythIntelligence() {
  const MYTHS = useCollection(COLL.myths, SEED[COLL.myths]).records as unknown as Myth[];
  const sorted = [...MYTHS].sort((a, b) => b.prevalence - a.prevalence);

  return (
    <div>
      <PageHeader
        icon={<AlertOctagon className="h-5 w-5" />}
        title="Credit Myth Intelligence"
        description="Social monitoring that detects spreading misinformation, flags it, and turns each myth into a TOF/MOF/BOF correction sequence."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Myths Detected" value={MYTHS.length} sub="actively spreading" accent />
        <Stat label="Highest Prevalence" value={`${sorted[0].prevalence}%`} sub={`“${sorted[0].claim.slice(0, 22)}…”`} />
        <Stat label="Avg Prevalence" value={`${Math.round(MYTHS.reduce((a, m) => a + m.prevalence, 0) / MYTHS.length)}%`} sub="across detected myths" />
        <Stat label="Correction Sequences" value={MYTHS.length * 3} sub="TOF · MOF · BOF" />
      </div>

      <SectionLabel>Detected Misinformation</SectionLabel>
      <div className="space-y-4">
        {sorted.map((m) => (
          <div key={m.id} className="rounded-xl border border-destructive/25 bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-destructive">
                <AlertOctagon className="h-3.5 w-3.5" /> Myth Detected
              </span>
              <CategoryChip category={m.category} />
              {m.platforms.map((p) => (
                <PlatformChip key={p} platform={p} />
              ))}
              <span className="ml-auto text-[11px] text-muted-foreground">Prevalence</span>
              <span className="text-sm font-extrabold text-destructive">{m.prevalence}%</span>
            </div>
            <div className="grid gap-3 p-4 lg:grid-cols-2">
              <div className="rounded-lg border border-destructive/20 bg-destructive/[0.04] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-destructive">The Myth</p>
                <p className="mt-1 text-[14px] font-medium">“{m.claim}”</p>
              </div>
              <div className="rounded-lg border border-success/20 bg-success/[0.04] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-success">The Truth</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{m.truth}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground">Correction funnel:</span>
              <FunnelChip funnel="TOF" /> expose the myth ·
              <FunnelChip funnel="MOF" /> explain the mechanic ·
              <FunnelChip funnel="BOF" /> position the fix → consult
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Myth Records — Add / Edit / Import</SectionLabel>
      <DataTable collection={COLL.myths} seed={SEED[COLL.myths]} fields={FIELDS[COLL.myths]} title="Credit Myths" />

      <DetectedOpportunities source="myth" />
    </div>
  );
}
