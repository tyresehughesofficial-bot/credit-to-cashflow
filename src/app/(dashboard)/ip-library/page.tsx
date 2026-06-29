"use client";

import { Lightbulb } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { IP_SEED, type IPItem } from "@/lib/ops/data";

const FIELDS: Field[] = [
  { key: "name", label: "Asset" },
  { key: "type", label: "Type" },
  { key: "notes", label: "Notes" },
];

export default function IPLibraryPage() {
  const ip = useCollection<IPItem>("ip_library", IP_SEED);

  return (
    <div>
      <PageHeader
        icon={<Lightbulb className="h-5 w-5" />}
        title="IP Library"
        description="The frameworks, methods, and systems that make Triad T a structured transformation system — not just a service."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ip.records.map((i) => (
          <div key={i.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-bold">{i.name}</p>
              <Badge variant="secondary">{i.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{i.notes}</p>
          </div>
        ))}
      </div>

      <DataTable collection="ip_library" seed={IP_SEED} fields={FIELDS} title="Manage IP" searchKeys={["name", "type"]} />
    </div>
  );
}
