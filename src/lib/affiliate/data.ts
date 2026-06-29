import type { Row } from "@/lib/db/use-collection";

export interface Affiliate extends Row {
  id: string;
  name: string;
  tier: string;
  status: string;
  link: string;
  joined: string;
}

export interface Commission extends Row {
  id: string;
  affiliate: string;
  client: string;
  offer: string;
  amount: number;
  status: string; // pending | approved | paid
}

export const TIERS = [
  { name: "Bronze", rate: "10%", note: "Entry — 0–4 referrals" },
  { name: "Silver", rate: "15%", note: "5–14 referrals" },
  { name: "Gold", rate: "20%", note: "15+ referrals + leaderboard" },
];

export const AFFILIATE_STATUS = ["pending", "active", "paused"];
export const COMMISSION_STATUS = ["pending", "approved", "paid"];

export const AFFILIATE_SEED: Affiliate[] = [
  { id: "af-1", name: "Jordan Miles", tier: "Gold", status: "active", link: "triadt.co/r/jordan", joined: "2026-02-10" },
  { id: "af-2", name: "Tasha Greene", tier: "Silver", status: "active", link: "triadt.co/r/tasha", joined: "2026-04-22" },
  { id: "af-3", name: "Mike Alvarez", tier: "Bronze", status: "pending", link: "triadt.co/r/mike", joined: "2026-06-15" },
];

export const COMMISSION_SEED: Commission[] = [
  { id: "co-1", affiliate: "Jordan Miles", client: "Marcus Bennett", offer: "Credit Repair", amount: 150, status: "paid" },
  { id: "co-2", affiliate: "Jordan Miles", client: "—", offer: "Business Funding", amount: 320, status: "approved" },
  { id: "co-3", affiliate: "Tasha Greene", client: "Alicia Reyes", offer: "Business-in-a-Box", amount: 250, status: "pending" },
];

/** Leaderboard: affiliate → total commission, descending. */
export function leaderboard(commissions: Commission[]): { affiliate: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  commissions.forEach((c) => {
    const cur = map.get(c.affiliate) ?? { total: 0, count: 0 };
    cur.total += Number(c.amount || 0);
    cur.count += 1;
    map.set(c.affiliate, cur);
  });
  return Array.from(map.entries())
    .map(([affiliate, v]) => ({ affiliate, ...v }))
    .sort((a, b) => b.total - a.total);
}
