"use client";

import Link from "next/link";
import { KanbanSquare, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { FunnelChip, SourceChip, Stat } from "@/components/intelligence/bits";
import {
  setStage,
  STAGES,
  useProductionItems,
  type Stage,
} from "@/lib/intelligence/production";

const STAGE_DESC: Record<Stage, string> = {
  Backlog: "Approved, not started",
  Scripting: "Writing the content",
  Scheduled: "Slotted on the calendar",
  Published: "Shipped",
};

export default function ContentPipeline() {
  const items = useProductionItems();

  const move = (id: string, current: Stage, dir: -1 | 1) => {
    const idx = STAGES.indexOf(current);
    const next = STAGES[Math.min(STAGES.length - 1, Math.max(0, idx + dir))];
    if (next !== current) setStage(id, next);
  };

  return (
    <div>
      <PageHeader
        icon={<KanbanSquare className="h-5 w-5" />}
        title="Content Pipeline"
        description="Every approved opportunity moving from idea to published. One board, fed directly by the Intelligence Engine's approval workflow."
        actions={
          <Link href="/content-calendar">
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-gold/40 px-4 text-sm font-semibold text-gold hover:bg-gold/10">
              Open Calendar <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAGES.map((s) => (
          <Stat key={s} label={s} value={items.filter((i) => i.stage === s).length} sub={STAGE_DESC[s]} accent={s === "Backlog"} />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
          No approved opportunities yet. Head to the{" "}
          <Link href="/intelligence/queue" className="text-gold hover:underline">
            Opportunity Queue
          </Link>{" "}
          and approve a few — they&apos;ll flow into this board automatically.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage) => {
            const col = items.filter((i) => i.stage === stage);
            return (
              <div key={stage} className="rounded-xl border border-border bg-card/50 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-[13px] font-semibold">{stage}</h3>
                  <span className="rounded-full bg-secondary px-2 text-[11px] tabular-nums text-muted-foreground">
                    {col.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.map((it) => {
                    const idx = STAGES.indexOf(it.stage);
                    return (
                      <div key={it.opp.id} className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-1.5">
                          <SourceChip source={it.opp.source} />
                          <FunnelChip funnel={it.opp.funnel} />
                          <span className="ml-auto text-[11px] font-bold text-gold">{it.opp.total}</span>
                        </div>
                        <p className="mt-1.5 line-clamp-3 text-[12px] font-medium leading-snug">{it.opp.title}</p>
                        {it.date && (
                          <p className="mt-1 text-[10px] text-muted-foreground">📅 {it.date}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            onClick={() => move(it.opp.id, it.stage, -1)}
                            disabled={idx === 0}
                            className={cn("rounded-md border border-border p-1 text-muted-foreground hover:text-foreground", idx === 0 && "opacity-30")}
                            title="Move back"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{stage}</span>
                          <button
                            onClick={() => move(it.opp.id, it.stage, 1)}
                            disabled={idx === STAGES.length - 1}
                            className={cn("rounded-md border border-border p-1 text-muted-foreground hover:text-foreground", idx === STAGES.length - 1 && "opacity-30")}
                            title="Advance"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {col.length === 0 && (
                    <p className="px-1 py-4 text-center text-[11px] text-muted-foreground/60">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
