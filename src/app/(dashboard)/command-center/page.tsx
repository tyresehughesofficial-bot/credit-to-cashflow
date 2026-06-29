"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles, AlertTriangle, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { cn } from "@/lib/utils";

import {
  CLIENT_SEED,
  REPORT_SEED,
  NEGATIVE_SEED,
  INQUIRY_SEED,
  UTILIZATION_SEED,
} from "@/lib/credit/data";
import {
  type Client,
  type CreditReport,
  type NegativeAccount,
  type Inquiry,
  type CreditUtilization,
  fullName,
} from "@/lib/credit/types";
import { diagnose, fundingReadiness } from "@/lib/credit/engine";
import { CONTACT_SEED, PAYMENT_SEED, pipelineValue, type Contact, type Payment } from "@/lib/crm/data";
import { FINANCE_SEED, totals, revenueByOffer, type FinanceEntry } from "@/lib/finance/data";

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function CommandCenterPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const reports = useCollection<CreditReport & Row>("credit_reports", REPORT_SEED as (CreditReport & Row)[]);
  const negatives = useCollection<NegativeAccount & Row>("negative_accounts", NEGATIVE_SEED as (NegativeAccount & Row)[]);
  const inquiries = useCollection<Inquiry & Row>("inquiries", INQUIRY_SEED as (Inquiry & Row)[]);
  const utilization = useCollection<CreditUtilization & Row>("credit_utilization", UTILIZATION_SEED as (CreditUtilization & Row)[]);
  const contacts = useCollection<Contact>("crm_contacts", CONTACT_SEED);
  const payments = useCollection<Payment>("crm_payments", PAYMENT_SEED);
  const finance = useCollection<FinanceEntry>("finance_entries", FINANCE_SEED);

  const analysis = useMemo(() => {
    return clients.records.map((c) => {
      const report = reports.records.find((r) => r.clientId === c.id);
      const negs = negatives.records.filter((n) => n.clientId === c.id);
      const qs = inquiries.records.filter((q) => q.clientId === c.id);
      const util = utilization.records.find((u) => u.clientId === c.id);
      const diag = report ? diagnose(report, negs, qs) : null;
      const scores = [report?.experianScore, report?.equifaxScore, report?.transunionScore].filter((n): n is number => !!n);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const funding = fundingReadiness(avg, util?.utilizationPct, qs.length, negs);
      return { client: c, report, diag, avg, funding };
    });
  }, [clients.records, reports.records, negatives.records, inquiries.records, utilization.records]);

  const bureauAvg = (key: keyof CreditReport) => {
    const xs = reports.records.map((r) => r[key]).filter((n): n is number => typeof n === "number" && n > 0);
    return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
  };

  const fin = useMemo(() => totals(finance.records), [finance.records]);
  const byOffer = useMemo(() => revenueByOffer(finance.records), [finance.records]);
  const maxOffer = byOffer[0]?.amount ?? 1;

  const needsAttention = analysis.filter((a) => a.diag && (a.diag.healthBand === "Critical" || a.diag.healthBand === "Poor"));
  const fundingReady = analysis.filter((a) => a.funding.band === "Funding Ready");
  const pendingPay = payments.records.filter((p) => p.status === "pending");

  const kpis = [
    { label: "Total Clients", value: clients.records.length, href: "/clients" },
    { label: "Avg Score", value: bureauAvg("experianScore" as keyof CreditReport) ? Math.round((bureauAvg("experianScore" as keyof CreditReport) + bureauAvg("equifaxScore" as keyof CreditReport) + bureauAvg("transunionScore" as keyof CreditReport)) / 3) : "—", href: "/clients" },
    { label: "Funding-Ready", value: fundingReady.length, href: "/approval-readiness" },
    { label: "Open Pipeline", value: usd(pipelineValue(contacts.records)), href: "/crm" },
    { label: "Revenue", value: usd(fin.revenue), href: "/finance" },
    { label: "Net Profit", value: usd(fin.profit), href: "/finance" },
    { label: "Open Negatives", value: negatives.records.filter((n) => n.status !== "deleted" && n.status !== "paid").length, href: "/negative-tracking" },
    { label: "Need Attention", value: needsAttention.length, href: "/clients" },
  ];

  const alerts = [
    ...needsAttention.map((a) => ({ tone: "destructive" as const, text: `${fullName(a.client)} is in ${a.diag!.healthBand} health — start/continue disputes.`, href: "/clients" })),
    ...fundingReady.map((a) => ({ tone: "success" as const, text: `${fullName(a.client)} is funding-ready — begin the capital strategy.`, href: "/approval-readiness" })),
    ...pendingPay.map((p) => ({ tone: "warning" as const, text: `Payment pending: ${p.contact} — ${usd(Number(p.amount))}.`, href: "/crm" })),
  ].slice(0, 8);

  return (
    <div>
      <PageHeader
        icon={<LayoutDashboard className="h-5 w-5" />}
        title="Command Center"
        description="Live operating picture — clients, credit, pipeline, and revenue computed from your real data."
        actions={
          <Button asChild>
            <Link href="/prolific">
              <Sparkles className="h-4 w-4" /> Run Prolific Method
            </Link>
          </Button>
        }
      />

      <div className="space-y-8">
        {/* Live KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => (
            <Link key={k.label} href={k.href} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/40">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">{k.value}</p>
            </Link>
          ))}
        </div>

        {/* Bureau averages */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Bureau Averages
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(["experianScore", "equifaxScore", "transunionScore"] as (keyof CreditReport)[]).map((k, i) => (
              <div key={String(k)} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{["Experian", "Equifax", "TransUnion"][i]}</p>
                <p className="mt-1 text-2xl font-extrabold text-gold">{bureauAvg(k) || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Alerts */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-gold" /> Alerts & Attention
            </h2>
            <div className="space-y-2">
              {alerts.length === 0 && <p className="text-sm text-muted-foreground">All clear — no urgent items.</p>}
              {alerts.map((a, i) => (
                <Link key={i} href={a.href} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm hover:bg-secondary/30">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", a.tone === "destructive" ? "bg-destructive" : a.tone === "success" ? "bg-success" : "bg-warning")} />
                  <span className="min-w-0 flex-1">{a.text}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          {/* Revenue by offer (live) */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-gold" /> Revenue by Offer
            </h2>
            <div className="space-y-2">
              {byOffer.map((o) => (
                <div key={o.offer} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-xs">{o.offer}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary/40">
                    <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${(o.amount / maxOffer) * 100}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs font-semibold">{usd(o.amount)}</span>
                </div>
              ))}
              {byOffer.length === 0 && <p className="text-sm text-muted-foreground">No revenue logged yet.</p>}
            </div>
          </div>
        </div>

        {/* Funding-ready clients */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Funding-Ready Clients
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fundingReady.map((a) => (
              <Link key={a.client.id} href="/approval-readiness" className="rounded-xl border border-success/30 bg-success/5 p-3 hover:border-success/50">
                <p className="text-sm font-semibold">{fullName(a.client)}</p>
                <p className="text-xs text-muted-foreground">Avg {a.avg} · {a.funding.band}</p>
              </Link>
            ))}
            {fundingReady.length === 0 && <p className="text-sm text-muted-foreground">No clients funding-ready yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
