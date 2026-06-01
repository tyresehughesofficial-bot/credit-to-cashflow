"use client";

import { SectionLabel } from "@/components/intelligence/bits";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { opportunitiesBySource } from "@/lib/intelligence/data";
import type { IntelSource } from "@/lib/intelligence/types";

/** Renders the opportunities a given source has fed into the queue. */
export function DetectedOpportunities({ source }: { source: IntelSource }) {
  const opps = opportunitiesBySource(source);
  if (opps.length === 0) return null;
  return (
    <>
      <SectionLabel>Detected Opportunities → Queue</SectionLabel>
      <div className="space-y-3">
        {opps.map((o) => (
          <OpportunityCard key={o.id} opp={o} />
        ))}
      </div>
    </>
  );
}
