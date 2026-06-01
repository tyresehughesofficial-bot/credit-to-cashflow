import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricSummary } from "@/lib/data/metrics";

export function MetricCard({ metric }: { metric: MetricSummary }) {
  const positive = metric.rawDelta >= 0;
  return (
    <Card className="relative overflow-hidden transition-colors hover:border-gold/40">
      <div className="pointer-events-none absolute inset-0 bg-surface-gradient" />
      <CardContent className="relative p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {metric.label}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(metric.rawDelta)}%
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{metric.hint}</p>
      </CardContent>
    </Card>
  );
}
