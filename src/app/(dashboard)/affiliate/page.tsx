"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import {
  AFFILIATE_SEED,
  COMMISSION_SEED,
  AFFILIATE_STATUS,
  COMMISSION_STATUS,
  TIERS,
  leaderboard,
  type Affiliate,
  type Commission,
} from "@/lib/affiliate/data";

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
const TIER_NAMES = TIERS.map((t) => t.name);

const AFF_FIELDS: Field[] = [
  { key: "name", label: "Affiliate" },
  { key: "tier", label: "Tier", type: "select", options: TIER_NAMES },
  { key: "status", label: "Status", type: "select", options: AFFILIATE_STATUS },
  { key: "link", label: "Referral Link" },
  { key: "joined", label: "Joined", hideInTable: true },
];

const COMM_FIELDS: Field[] = [
  { key: "affiliate", label: "Affiliate" },
  { key: "client", label: "Client" },
  { key: "offer", label: "Offer" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "status", label: "Status", type: "select", options: COMMISSION_STATUS },
];

export default function AffiliatePage() {
  const affiliates = useCollection<Affiliate>("affiliates", AFFILIATE_SEED);
  const commissions = useCollection<Commission>("commissions", COMMISSION_SEED);

  const board = useMemo(() => leaderboard(commissions.records), [commissions.records]);
  const pendingPayout = useMemo(
    () => commissions.records.filter((c) => c.status === "approved").reduce((a, c) => a + Number(c.amount || 0), 0),
    [commissions.records],
  );
  const paid = useMemo(
    () => commissions.records.filter((c) => c.status === "paid").reduce((a, c) => a + Number(c.amount || 0), 0),
    [commissions.records],
  );

  return (
    <div>
      <PageHeader
        icon={<Trophy className="h-5 w-5" />}
        title="Affiliate System"
        description="Build a sales army — tiers, commissions, onboarding, leaderboard, and payouts."
      />

      {/* KPIs + tiers */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Active Affiliates</p>
          <p className="mt-1 text-2xl font-extrabold">{affiliates.records.filter((a) => a.status === "active").length}</p>
        </div>
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">Pending Payout</p>
          <p className="mt-1 text-2xl font-extrabold">{usd(pendingPayout)}</p>
        </div>
        <div className="rounded-xl border border-success/40 bg-success/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-success">Paid Out</p>
          <p className="mt-1 text-2xl font-extrabold">{usd(paid)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tiers</p>
          <div className="space-y-0.5 text-xs">
            {TIERS.map((t) => (
              <p key={t.name}>
                <span className="font-semibold text-gold">{t.name}</span> {t.rate} · {t.note}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-8 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Leaderboard</p>
        <div className="space-y-2">
          {board.map((b, i) => (
            <div key={b.affiliate} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-gold/20 text-gold" : "bg-secondary/40 text-muted-foreground"}`}>
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium">{b.affiliate}</span>
              <span className="text-xs text-muted-foreground">{b.count} referral{b.count === 1 ? "" : "s"}</span>
              <span className="w-20 text-right text-sm font-semibold">{usd(b.total)}</span>
            </div>
          ))}
          {board.length === 0 && <p className="text-xs text-muted-foreground">No commissions yet.</p>}
        </div>
      </div>

      <div className="space-y-8">
        <DataTable collection="affiliates" seed={AFFILIATE_SEED} fields={AFF_FIELDS} title="Affiliates" searchKeys={["name", "tier", "status"]} />
        <DataTable collection="commissions" seed={COMMISSION_SEED} fields={COMM_FIELDS} title="Commissions" searchKeys={["affiliate", "client", "offer"]} />
      </div>
    </div>
  );
}
