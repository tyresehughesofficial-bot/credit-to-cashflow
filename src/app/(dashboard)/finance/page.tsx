"use client";

import { useMemo } from "react";
import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import {
  FINANCE_SEED,
  FINANCE_TYPES,
  FINANCE_CATEGORIES,
  totals,
  revenueByOffer,
  type FinanceEntry,
} from "@/lib/finance/data";
import { OFFER_SEED } from "@/lib/offers/data";

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

const FIELDS: Field[] = [
  { key: "type", label: "Type", type: "select", options: FINANCE_TYPES },
  { key: "category", label: "Category", type: "select", options: FINANCE_CATEGORIES },
  { key: "offer", label: "Offer", type: "select", options: ["", ...OFFER_SEED.map((o) => o.name)] },
  { key: "amount", label: "Amount", type: "number" },
  { key: "date", label: "Date" },
  { key: "note", label: "Note", hideInTable: true },
];

export default function FinancePage() {
  const finance = useCollection<FinanceEntry>("finance_entries", FINANCE_SEED);
  const t = useMemo(() => totals(finance.records), [finance.records]);
  const byOffer = useMemo(() => revenueByOffer(finance.records), [finance.records]);
  const maxOffer = byOffer[0]?.amount ?? 1;

  const kpis = [
    { label: "Revenue", value: usd(t.revenue), cls: "text-success" },
    { label: "Expenses", value: usd(t.expenses), cls: "text-destructive" },
    { label: "Payouts", value: usd(t.payouts), cls: "text-warning" },
    { label: "Net Profit", value: usd(t.profit), cls: t.profit >= 0 ? "gold-text" : "text-destructive" },
  ];

  return (
    <div>
      <PageHeader
        icon={<Wallet className="h-5 w-5" />}
        title="Finance · Wealth Map"
        description="Company financial command center — revenue, expenses, payouts, profit, and which offers produce the most."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className={`mt-1 text-2xl font-extrabold tracking-tight ${k.cls}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Revenue by Offer</p>
        <div className="space-y-2">
          {byOffer.map((o) => (
            <div key={o.offer} className="flex items-center gap-3">
              <span className="w-44 shrink-0 truncate text-xs text-foreground/90">{o.offer}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary/40">
                <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${(o.amount / maxOffer) * 100}%` }} />
              </div>
              <span className="w-20 shrink-0 text-right text-xs font-semibold">{usd(o.amount)}</span>
            </div>
          ))}
          {byOffer.length === 0 && <p className="text-xs text-muted-foreground">No revenue logged yet.</p>}
        </div>
      </div>

      <DataTable collection="finance_entries" seed={FINANCE_SEED} fields={FIELDS} title="Ledger" searchKeys={["category", "offer", "note"]} />
    </div>
  );
}
