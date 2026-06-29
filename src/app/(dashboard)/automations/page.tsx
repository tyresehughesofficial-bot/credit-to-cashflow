"use client";

import { Zap } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { AUTOMATION_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "name", label: "Automation" },
  { key: "trigger", label: "Trigger" },
  { key: "action", label: "Action" },
  { key: "status", label: "Status", type: "select", options: ["active", "paused"] },
];

export default function AutomationsPage() {
  return (
    <div>
      <PageHeader icon={<Zap className="h-5 w-5" />} title="Automations" description="Trigger-based automations across the whole platform." />
      <DataTable collection="automations" seed={AUTOMATION_SEED} fields={FIELDS} title="Automation Rules" searchKeys={["name", "trigger", "action"]} />
    </div>
  );
}
