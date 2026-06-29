"use client";

import { ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { OBJECTION_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "body", label: "Body", type: "textarea" },
];

export default function ObjectionHandlingPage() {
  return (
    <div>
      <PageHeader icon={<ShieldAlert className="h-5 w-5" />} title="Objection Handling" description="Battle-tested rebuttals for every objection." />
      <DataTable collection="objections_lib" seed={OBJECTION_SEED} fields={FIELDS} title="Objection Handling" searchKeys={["title", "category", "body"]} />
    </div>
  );
}
