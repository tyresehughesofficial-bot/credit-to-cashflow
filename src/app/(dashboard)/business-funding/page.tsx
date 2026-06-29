"use client";

import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

const SECTIONS = [
  { title: "Fundability Checklist", items: ["LLC + EIN active", "Business address (non-PO box)", "Dedicated business phone + 411 listing", "Business bank account", "Business email + matching domain", "Website live", "Business license/permits"] },
  { title: "Lender Categories", items: ["0% APR business credit cards", "Business lines of credit", "Vendor / net-30 accounts", "SBA & term loans", "Revenue-based financing"] },
  { title: "Funding Sequence", items: ["Build business credit profile (D&B, Experian Biz)", "Stack vendor accounts → store cards → cash cards", "Apply same-day to maximize approvals", "Keep utilization low between rounds", "Graduate to lines & term loans"] },
];

export default function BusinessFundingPage() {
  return (
    <div>
      <PageHeader icon={<Building2 className="h-5 w-5" />} title="Business Funding" description="Business credit build, fundability, and lender matching." />
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
