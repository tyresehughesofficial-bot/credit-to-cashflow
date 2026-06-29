"use client";

import Link from "next/link";
import { DollarSign, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart } from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import { REVENUE_METRICS, REVENUE_SERIES } from "@/lib/data/metrics";

export default function RevenueAnalyticsPage() {
  return (
    <div>
      <PageHeader
        icon={<DollarSign className="h-5 w-5" />}
        title="Revenue Analytics"
        description="MRR, funding commissions, and revenue by source."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/finance">
              Wealth Map <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REVENUE_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Revenue Trend</p>
        <RevenueAreaChart data={REVENUE_SERIES} />
      </div>
    </div>
  );
}
