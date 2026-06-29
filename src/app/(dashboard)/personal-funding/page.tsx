"use client";

import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

const SECTIONS = [
  { title: "Personal Credit Prep", items: ["Tri-bureau scores 680+", "Utilization under 10%", "No recent derogatories", "Limit hard inquiries (<4 / 6mo)", "Aged primary tradelines"] },
  { title: "Approval Pathways", items: ["0% APR personal cards", "Personal lines of credit", "Personal installment loans", "Credit-union relationships", "Co-sign / authorized-user boosts"] },
  { title: "Before You Apply", items: ["Freeze unnecessary inquiries", "Pay balances before statement cut", "Confirm reported income", "Sequence applications by lender sensitivity"] },
];

export default function PersonalFundingPage() {
  return (
    <div>
      <PageHeader icon={<Wallet className="h-5 w-5" />} title="Personal Funding" description="Personal credit analysis and approval pathways." />
      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-bold">{s.title}</p>
            <ul className="space-y-1.5">
              {s.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
