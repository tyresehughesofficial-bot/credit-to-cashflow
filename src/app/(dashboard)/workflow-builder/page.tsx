"use client";

import { Workflow, ArrowDown } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { WORKFLOW_SEED, type WorkflowStep } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "step", label: "Step" },
  { key: "module", label: "Module" },
  { key: "output", label: "Output" },
];

export default function WorkflowBuilderPage() {
  const steps = useCollection<WorkflowStep>("workflow_steps", WORKFLOW_SEED);
  return (
    <div>
      <PageHeader icon={<Workflow className="h-5 w-5" />} title="Workflow Builder · Runner" description="The Runner connects every module — idea → script → visuals → publish → analytics → feedback." />

      <div className="mb-8 mx-auto max-w-md space-y-1">
        {steps.records.map((s, i) => (
          <div key={s.id}>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-sm font-semibold">{s.step}</p>
              <p className="text-xs text-muted-foreground">{s.module} → {s.output}</p>
            </div>
            {i < steps.records.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown className="h-4 w-4 text-gold" />
              </div>
            )}
          </div>
        ))}
      </div>

      <DataTable collection="workflow_steps" seed={WORKFLOW_SEED} fields={FIELDS} title="Workflow Steps" searchKeys={["step", "module"]} />
    </div>
  );
}
