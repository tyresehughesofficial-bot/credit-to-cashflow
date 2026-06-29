"use client";

import { PhoneCall } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { SCRIPT_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "body", label: "Body", type: "textarea" },
];

export default function ConsultationScriptsPage() {
  return (
    <div>
      <PageHeader icon={<PhoneCall className="h-5 w-5" />} title="Consultation Scripts" description="Closing frameworks and consultation call scripts." />
      <DataTable collection="consult_scripts" seed={SCRIPT_SEED} fields={FIELDS} title="Consultation Scripts" searchKeys={["title", "category", "body"]} />
    </div>
  );
}
