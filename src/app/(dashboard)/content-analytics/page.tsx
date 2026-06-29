"use client";

import { LineChart } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EngagementLineChart } from "@/components/charts/charts";
import { CONTENT_METRICS, CONTENT_SERIES } from "@/lib/data/metrics";

export default function ContentAnalyticsPage() {
  return (
    <div>
      <PageHeader icon={<LineChart className="h-5 w-5" />} title="Content Analytics" description="Reach, engagement, and funnel performance by content." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CONTENT_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Engagement Trend</p>
        <EngagementLineChart data={CONTENT_SERIES} />
      </div>
    </div>
  );
}
