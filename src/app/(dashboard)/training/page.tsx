"use client";

import { GraduationCap } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { TRAINING_SEED, TRAINING_CATEGORIES, type TrainingModule } from "@/lib/ops/data";
import { ROLES } from "@/lib/auth/roles";

const FIELDS: Field[] = [
  { key: "title", label: "Module" },
  { key: "category", label: "Category", type: "select", options: TRAINING_CATEGORIES },
  { key: "assignee", label: "Assigned Role", type: "select", options: ROLES },
  { key: "content", label: "Content", type: "textarea", hideInTable: true },
];

export default function TrainingHubPage() {
  const training = useCollection<TrainingModule>("training_modules", TRAINING_SEED);

  return (
    <div>
      <PageHeader
        icon={<GraduationCap className="h-5 w-5" />}
        title="Training Hub"
        description="Sales, product, operations, and brand training — so the team can ramp without tribal knowledge."
      />

      <div className="mb-8 space-y-6">
        {TRAINING_CATEGORIES.map((cat) => {
          const mods = training.records.filter((m) => m.category === cat);
          if (!mods.length) return null;
          return (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {cat} Training
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {mods.map((m) => (
                  <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{m.title}</p>
                      <Badge variant="secondary">{m.assignee}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <DataTable collection="training_modules" seed={TRAINING_SEED} fields={FIELDS} title="Manage Training" searchKeys={["title", "category", "assignee"]} />
    </div>
  );
}
