"use client";

import { UserPlus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { LeadsBarChart } from "@/components/charts/charts";
import { LEAD_METRICS, LEADS_SERIES } from "@/lib/data/metrics";

export default function LeadAnalyticsPage() {
  return (
    <div>
      <PageHeader icon={<UserPlus className="h-5 w-5" />} title="Lead Analytics" description="Lead sources, conversion, and cost per acquisition." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LEAD_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Leads & Conversions</p>
        <LeadsBarChart data={LEADS_SERIES} />
      </div>
    </div>
  );
}
