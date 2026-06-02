"use client";

import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import {
  DonutChart,
  EngagementLineChart,
  LeadsBarChart,
  RevenueAreaChart,
} from "@/components/charts/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CLIENT_METRICS,
  CONTENT_METRICS,
  CONTENT_SERIES,
  FUNNEL_MIX,
  LEAD_METRICS,
  LEADS_SERIES,
  REVENUE_BY_SOURCE,
  REVENUE_METRICS,
  REVENUE_SERIES,
} from "@/lib/data/metrics";
import { SectionLabel, Stat } from "@/components/intelligence/bits";
import { DataTable } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { useProductionItems } from "@/lib/intelligence/production";
import { ANALYTICS_FIELDS, ANALYTICS_SEED, COLL } from "@/lib/intelligence/collections";

interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  period: string;
  group: string;
}

function LiveKpis() {
  const metrics = useCollection(COLL.analytics, ANALYTICS_SEED).records as unknown as Kpi[];
  const published = useProductionItems().filter((i) => i.stage === "Published").length;

  const value = (m: Kpi) => {
    const raw = m.id === "posts" ? String(published) : String(m.value ?? "");
    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      if (m.group === "revenue") return `$${n.toLocaleString()}`;
      return n >= 100000 ? `${Math.round(n / 1000)}K` : n.toLocaleString();
    }
    return raw;
  };

  return (
    <>
      <SectionLabel>Live KPIs — database-driven (editable)</SectionLabel>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Stat
            key={m.id}
            label={m.label}
            value={value(m)}
            sub={`${m.delta ? m.delta + " · " : ""}${m.period}${m.id === "posts" ? " (from pipeline)" : ""}`}
            accent={m.id === "revenue"}
          />
        ))}
      </div>
      <div className="mt-4">
        <DataTable collection={COLL.analytics} seed={ANALYTICS_SEED} fields={ANALYTICS_FIELDS} title="Analytics Metrics" />
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        icon={<BarChart3 className="h-5 w-5" />}
        title="Analytics Center"
        description="Deep-dive analytics across content, leads, clients, and revenue."
      />

      <LiveKpis />

      <div className="mt-8">
        <Tabs defaultValue="content">
        <TabsList className="flex-wrap">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CONTENT_METRICS.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Reach & Engagement</CardTitle>
                <CardDescription>Engagement rate trend (6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <EngagementLineChart data={CONTENT_SERIES} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Funnel Mix</CardTitle>
                <CardDescription>Content by funnel stage</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={FUNNEL_MIX} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {LEAD_METRICS.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
              <CardDescription>Leads → consults → new clients</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsBarChart data={LEADS_SERIES} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CLIENT_METRICS.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Client Outcomes</CardTitle>
              <CardDescription>Score improvement & program progress</CardDescription>
            </CardHeader>
            <CardContent>
              <EngagementLineChart data={CONTENT_SERIES} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {REVENUE_METRICS.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Recurring vs. funding (6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueAreaChart data={REVENUE_SERIES} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={REVENUE_BY_SOURCE} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
