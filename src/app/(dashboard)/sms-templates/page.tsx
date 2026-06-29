"use client";

import { MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { SMS_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "body", label: "Body", type: "textarea" },
];

export default function SMSTemplatesPage() {
  return (
    <div>
      <PageHeader icon={<MessageSquare className="h-5 w-5" />} title="SMS Templates" description="High-converting SMS sequences and one-offs." />
      <DataTable collection="sms_templates" seed={SMS_SEED} fields={FIELDS} title="SMS Templates" searchKeys={["title", "category", "body"]} />
    </div>
  );
}
