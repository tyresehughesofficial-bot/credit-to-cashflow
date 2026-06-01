"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Check, X, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Stat, FunnelChip, SourceChip } from "@/components/intelligence/bits";
import {
  publishItem,
  scheduleItem,
  unscheduleItem,
  useProductionItems,
} from "@/lib/intelligence/production";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ContentCalendar() {
  const items = useProductionItems();
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const cells = useMemo(() => monthCells(view.y, view.m), [view]);
  const todayStr = ymd(now);

  const scheduled = items.filter((i) => i.date && i.stage !== "Published");
  const backlog = items.filter((i) => !i.date && i.stage !== "Published");
  const published = items.filter((i) => i.stage === "Published");
  const inMonth = scheduled.filter((i) =>
    i.date?.startsWith(`${view.y}-${String(view.m + 1).padStart(2, "0")}`),
  );

  const byDate = useMemo(() => {
    const map: Record<string, typeof items> = {};
    for (const i of scheduled) if (i.date) (map[i.date] ??= []).push(i);
    return map;
  }, [scheduled]);

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div>
      <PageHeader
        icon={<CalendarDays className="h-5 w-5" />}
        title="Content Calendar"
        description="Approved opportunities from the Intelligence Engine, scheduled into production. Approve in the Opportunity Queue → schedule here → publish."
        actions={
          <Link href="/intelligence/queue">
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-gold/40 px-4 text-sm font-semibold text-gold hover:bg-gold/10">
              Opportunity Queue <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Approved → Pipeline" value={items.length} sub="ready to produce" accent />
        <Stat label="Scheduled" value={scheduled.length} sub="on the calendar" />
        <Stat label="This Month" value={inMonth.length} sub={`${MONTHS[view.m]} ${view.y}`} />
        <Stat label="Published" value={published.length} sub="shipped" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {MONTHS[view.m]} {view.y}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => shift(-1)} className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setView({ y: now.getFullYear(), m: now.getMonth() })} className="rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground">
                Today
              </button>
              <button onClick={() => shift(1)} className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DOW.map((d) => (
              <div key={d} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              const key = c ? ymd(c) : `b${i}`;
              const dayItems = c ? byDate[ymd(c)] ?? [] : [];
              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[84px] rounded-lg border p-1.5",
                    c ? "border-border bg-background/40" : "border-transparent",
                    c && ymd(c) === todayStr && "border-gold/40 bg-gold/[0.04]",
                  )}
                >
                  {c && <div className="mb-1 text-[10px] font-medium text-muted-foreground">{c.getDate()}</div>}
                  <div className="space-y-1">
                    {dayItems.map((it) => (
                      <div
                        key={it.opp.id}
                        title={it.opp.title}
                        className="group flex items-center gap-1 rounded-md border border-gold/20 bg-gold/[0.06] px-1.5 py-1"
                      >
                        <FunnelChip funnel={it.opp.funnel} />
                        <span className="min-w-0 flex-1 truncate text-[10px] leading-tight">{it.opp.title}</span>
                        <button
                          onClick={() => publishItem(it.opp.id)}
                          title="Mark published"
                          className="hidden text-success group-hover:block"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => unscheduleItem(it.opp.id)}
                          title="Remove from date"
                          className="hidden text-muted-foreground hover:text-destructive group-hover:block"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backlog → schedule */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Backlog — approved, unscheduled
          </p>
          <div className="space-y-2">
            {backlog.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
                Nothing waiting. Approve opportunities in the{" "}
                <Link href="/intelligence/queue" className="text-gold hover:underline">
                  Opportunity Queue
                </Link>{" "}
                and they&apos;ll land here.
              </div>
            ) : (
              backlog.map((it) => (
                <div key={it.opp.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-1.5">
                    <SourceChip source={it.opp.source} />
                    <FunnelChip funnel={it.opp.funnel} />
                    <span className="ml-auto text-[11px] font-bold text-gold">{it.opp.total}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-snug">{it.opp.title}</p>
                  <label className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Schedule:</span>
                    <input
                      type="date"
                      defaultValue={todayStr}
                      onChange={(e) => e.target.value && scheduleItem(it.opp.id, e.target.value)}
                      className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground [color-scheme:dark]"
                    />
                  </label>
                </div>
              ))
            )}
          </div>

          {published.length > 0 && (
            <>
              <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Published
              </p>
              <div className="space-y-1.5">
                {published.map((it) => (
                  <div key={it.opp.id} className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground line-through">{it.opp.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
