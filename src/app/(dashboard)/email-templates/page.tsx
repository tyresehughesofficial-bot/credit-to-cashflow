"use client";

import { Mail } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { EMAIL_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "body", label: "Body", type: "textarea" },
];

export default function EmailTemplatesPage() {
  return (
    <div>
      <PageHeader icon={<Mail className="h-5 w-5" />} title="Email Templates" description="Nurture, sales, and re-engagement email templates." />
      <DataTable collection="email_templates" seed={EMAIL_SEED} fields={FIELDS} title="Email Templates" searchKeys={["title", "category", "body"]} />
    </div>
  );
}
