"use client";

import { Package } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { OFFER_SEED } from "@/lib/offers/data";

const FIELDS: Field[] = [
  { key: "name", label: "Offer" },
  { key: "promise", label: "Promise" },
  { key: "audience", label: "Who It's For", hideInTable: true },
  { key: "price", label: "Price" },
  { key: "timeline", label: "Timeline" },
  { key: "deliverables", label: "Deliverables", type: "tags" },
  { key: "contract", label: "Contract", hideInTable: true },
  { key: "upsell", label: "Upsell Path", hideInTable: true },
];

export default function OffersPage() {
  return (
    <div>
      <PageHeader
        icon={<Package className="h-5 w-5" />}
        title="Offers & Products"
        description="Every offer defined — promise, audience, price, timeline, deliverables, contract, and upsell path."
      />

      {/* Catalog cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {OFFER_SEED.map((o) => (
          <div key={o.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-bold">{o.name}</p>
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">{o.price}</span>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">{o.promise}</p>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Deliverables</p>
            <ul className="mb-2 space-y-0.5">
              {o.deliverables.map((d, i) => (
                <li key={i} className="text-xs text-foreground/90">• {d}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>⏱ {o.timeline}</span>
              <span>📄 {o.contract}</span>
            </div>
            <p className="mt-2 text-[11px] text-gold">↗ Upsell: {o.upsell}</p>
          </div>
        ))}
      </div>

      <DataTable collection="products" seed={OFFER_SEED} fields={FIELDS} title="Manage Offers" searchKeys={["name", "audience"]} />
    </div>
  );
}
