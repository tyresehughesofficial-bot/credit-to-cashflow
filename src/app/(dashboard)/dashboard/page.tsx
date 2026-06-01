import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart, LeadsBarChart } from "@/components/charts/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLIENT_METRICS,
  CONTENT_METRICS,
  LEAD_METRICS,
  LEADS_SERIES,
  REVENUE_METRICS,
  REVENUE_SERIES,
} from "@/lib/data/metrics";
import { CLIENTS, TASKS, clientName, userName } from "@/lib/data/mock";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Command Center · TRIAD T" };

const sections = [
  { key: "Content", metrics: CONTENT_METRICS },
  { key: "Leads", metrics: LEAD_METRICS },
  { key: "Clients", metrics: CLIENT_METRICS },
  { key: "Revenue", metrics: REVENUE_METRICS },
] as const;

const priorityVariant: Record<string, "destructive" | "warning" | "secondary" | "muted"> = {
  urgent: "destructive",
  high: "warning",
  medium: "secondary",
  low: "muted",
};

export default function DashboardPage() {
  const openTasks = TASKS.filter((t) => t.status !== "done").slice(0, 5);
  const recentClients = [...CLIENTS]
    .filter((c) => c.current_score && c.starting_score)
    .sort((a, b) => (b.current_score! - b.starting_score!) - (a.current_score! - a.starting_score!))
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        icon={<LayoutDashboard className="h-5 w-5" />}
        title="Command Center"
        description="Your daily operating picture — content, leads, clients, and revenue at a glance."
        actions={
          <Button asChild>
            <Link href="/content-engine">
              <Sparkles className="h-4 w-4" /> Generate Content
            </Link>
          </Button>
        }
      />

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.key}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {section.key} Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {section.metrics.map((m) => (
                <MetricCard key={m.label} metric={m} />
              ))}
            </div>
          </section>
        ))}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gold" /> Revenue Trend
              </CardTitle>
              <CardDescription>Recurring vs. funding commissions (6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={REVENUE_SERIES} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gold" /> Lead Pipeline
              </CardTitle>
              <CardDescription>Leads → consults → new clients</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsBarChart data={LEADS_SERIES} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gold" /> Today&apos;s Priorities
                </CardTitle>
                <CardDescription>Open tasks across the team</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/clients">
                  View clients <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {openTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {clientName(task.client_id)} · {userName(task.assigned_to)}
                      {task.due_date ? ` · due ${formatDate(task.due_date)}` : ""}
                    </p>
                  </div>
                  <Badge variant={priorityVariant[task.priority]} className="capitalize">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Score Gains</CardTitle>
              <CardDescription>Biggest lifts since enrollment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentClients.map((c) => {
                const lift = c.current_score! - c.starting_score!;
                return (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.starting_score} → {c.current_score}
                      </p>
                    </div>
                    <Badge variant="success">+{lift}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
