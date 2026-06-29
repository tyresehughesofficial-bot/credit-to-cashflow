import type { Row } from "@/lib/db/use-collection";

export interface FinanceEntry extends Row {
  id: string;
  type: string; // revenue | expense | payout
  category: string;
  offer: string;
  amount: number;
  date: string;
  note: string;
}

export const FINANCE_TYPES = ["revenue", "expense", "payout"];
export const FINANCE_CATEGORIES = [
  "Client Payment",
  "Funding Fee",
  "Software",
  "Marketing",
  "Affiliate Payout",
  "Contractor",
  "Taxes",
  "Other",
];

export const FINANCE_SEED: FinanceEntry[] = [
  { id: "fe-1", type: "revenue", category: "Client Payment", offer: "Credit Repair", amount: 1497, date: "2026-06-03", note: "Marcus Bennett" },
  { id: "fe-2", type: "revenue", category: "Funding Fee", offer: "Business Funding", amount: 3200, date: "2026-06-10", note: "Approval fee" },
  { id: "fe-3", type: "revenue", category: "Client Payment", offer: "Business-in-a-Box", amount: 2500, date: "2026-06-14", note: "Alicia Reyes" },
  { id: "fe-4", type: "revenue", category: "Client Payment", offer: "Credit Building", amount: 800, date: "2026-06-18", note: "—" },
  { id: "fe-5", type: "expense", category: "Software", offer: "", amount: 420, date: "2026-06-01", note: "GHL + DisputeFox + tools" },
  { id: "fe-6", type: "expense", category: "Marketing", offer: "", amount: 950, date: "2026-06-05", note: "Ads" },
  { id: "fe-7", type: "payout", category: "Affiliate Payout", offer: "Affiliate System", amount: 300, date: "2026-06-20", note: "Tier 2 affiliate" },
];

export interface FinanceTotals {
  revenue: number;
  expenses: number;
  payouts: number;
  profit: number;
}

export function totals(entries: FinanceEntry[]): FinanceTotals {
  const sum = (t: string) => entries.filter((e) => e.type === t).reduce((a, e) => a + Number(e.amount || 0), 0);
  const revenue = sum("revenue");
  const expenses = sum("expense");
  const payouts = sum("payout");
  return { revenue, expenses, payouts, profit: revenue - expenses - payouts };
}

/** Revenue grouped by offer, descending. */
export function revenueByOffer(entries: FinanceEntry[]): { offer: string; amount: number }[] {
  const map = new Map<string, number>();
  entries
    .filter((e) => e.type === "revenue")
    .forEach((e) => map.set(e.offer || "Other", (map.get(e.offer || "Other") ?? 0) + Number(e.amount || 0)));
  return Array.from(map.entries()).map(([offer, amount]) => ({ offer, amount })).sort((a, b) => b.amount - a.amount);
}
