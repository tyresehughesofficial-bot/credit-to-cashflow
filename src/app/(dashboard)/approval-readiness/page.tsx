"use client";

import { useMemo } from "react";
import { Gauge, CheckCircle2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCollection, type Row } from "@/lib/db/use-collection";
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
import { fundingReadiness, type FundingBand } from "@/lib/credit/engine";

const bandVariant: Record<FundingBand, "success" | "warning" | "destructive"> = {
  "Funding Ready": "success",
  "Almost Ready": "warning",
  "Not Ready": "destructive",
};

export default function ApprovalReadinessPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const reports = useCollection<CreditReport & Row>("credit_reports", REPORT_SEED as (CreditReport & Row)[]);
  const negatives = useCollection<NegativeAccount & Row>("negative_accounts", NEGATIVE_SEED as (NegativeAccount & Row)[]);
  const inquiries = useCollection<Inquiry & Row>("inquiries", INQUIRY_SEED as (Inquiry & Row)[]);
  const utilization = useCollection<CreditUtilization & Row>("credit_utilization", UTILIZATION_SEED as (CreditUtilization & Row)[]);

  const assessed = useMemo(() => {
    return clients.records
      .map((c) => {
        const report = reports.records.find((r) => r.clientId === c.id);
        const negs = negatives.records.filter((n) => n.clientId === c.id);
        const qs = inquiries.records.filter((q) => q.clientId === c.id);
        const util = utilization.records.find((u) => u.clientId === c.id);
        const scores = [report?.experianScore, report?.equifaxScore, report?.transunionScore].filter(
          (n): n is number => !!n,
        );
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const funding = fundingReadiness(avg, util?.utilizationPct, qs.length, negs);
        return { client: c, avg, funding, hasReport: !!report };
      })
      .sort((a, b) => b.funding.score - a.funding.score);
  }, [clients.records, reports.records, negatives.records, inquiries.records, utilization.records]);

  const counts = {
    ready: assessed.filter((a) => a.funding.band === "Funding Ready").length,
    almost: assessed.filter((a) => a.funding.band === "Almost Ready").length,
    not: assessed.filter((a) => a.funding.band === "Not Ready").length,
  };

  return (
    <div>
      <PageHeader
        icon={<Gauge className="h-5 w-5" />}
        title="Approval Readiness"
        description="Funding-approval readiness for every client, scored against the four approval factors."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-success/40 bg-success/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-success">Funding Ready</p>
          <p className="mt-1 text-2xl font-extrabold">{counts.ready}</p>
        </div>
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">Almost Ready</p>
          <p className="mt-1 text-2xl font-extrabold">{counts.almost}</p>
        </div>
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">Not Ready</p>
          <p className="mt-1 text-2xl font-extrabold">{counts.not}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {assessed.map(({ client, avg, funding, hasReport }) => (
          <div key={client.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{fullName(client)}</p>
                <p className="text-xs text-muted-foreground">{hasReport ? `Avg score ${avg}` : "No report imported"}</p>
              </div>
              <Badge variant={bandVariant[funding.band]}>{funding.band}</Badge>
            </div>
            <Progress value={funding.score} />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{funding.score}% of factors met</p>
            <div className="mt-3 space-y-1.5">
              {funding.factors.map((f) => (
                <div key={f.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    {f.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    {f.label}
                  </span>
                  <span className="text-muted-foreground">{f.detail}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg border border-gold/20 bg-gold/5 p-2 text-xs">{funding.recommendedPath}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
