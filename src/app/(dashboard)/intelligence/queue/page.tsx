"use client";

import { useMemo, useState } from "react";
import { ListChecks, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/intelligence/bits";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { OPPORTUNITIES } from "@/lib/intelligence/data";
import { resetOpps, statusOf, useOppStatuses } from "@/lib/intelligence/store";
import type { OppStatus } from "@/lib/intelligence/types";

type Filter = "queue" | "approved" | "saved" | "rejected" | "archived" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "queue", label: "Review Queue" },
  { key: "approved", label: "Approved" },
  { key: "saved", label: "Saved" },
  { key: "rejected", label: "Rejected" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

export default function OpportunityQueue() {
  const statuses = useOppStatuses();
  const [filter, setFilter] = useState<Filter>("queue");

  const counts = useMemo(() => {
    const c: Record<OppStatus, number> = { new: 0, approved: 0, rejected: 0, archived: 0, saved: 0 };
    for (const o of OPPORTUNITIES) c[statusOf(statuses, o.id)]++;
    return c;
  }, [statuses]);

  const list = useMemo(() => {
    return OPPORTUNITIES.filter((o) => {
      const s = statusOf(statuses, o.id);
      if (filter === "all") return true;
      if (filter === "queue") return s === "new";
      return s === filter;
    });
  }, [statuses, filter]);

  const avgScore = Math.round(OPPORTUNITIES.reduce((a, o) => a + o.total, 0) / OPPORTUNITIES.length);

  return (
    <div>
      <PageHeader
        icon={<ListChecks className="h-5 w-5" />}
        title="Opportunity Queue"
        description="Every detected opportunity, scored and ranked highest-first. Approve to push into the Content Production Pipeline."
        actions={
          <Button variant="outline" size="sm" onClick={() => resetOpps()}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset decisions
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="In Review" value={counts.new} sub="awaiting decision" accent />
        <Stat label="Approved → Pipeline" value={counts.approved} sub="moving to production" />
        <Stat label="Saved" value={counts.saved} sub="parked for later" />
        <Stat label="Avg Opportunity Score" value={avgScore} sub="across all detected" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n =
            f.key === "queue"
              ? counts.new
              : f.key === "all"
                ? OPPORTUNITIES.length
                : counts[f.key as OppStatus];
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === f.key
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="rounded-full bg-secondary px-1.5 text-[10px] tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
            Nothing here yet. Opportunities you mark will show under this filter.
          </div>
        ) : (
          list.map((o, i) => <OpportunityCard key={o.id} opp={o} defaultOpen={i === 0 && filter === "queue"} />)
        )}
      </div>
    </div>
  );
}
