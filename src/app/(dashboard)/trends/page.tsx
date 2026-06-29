"use client";

import { Newspaper } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { TREND_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "title", label: "Trend" },
  { key: "type", label: "Type" },
  { key: "platform", label: "Platform" },
  { key: "note", label: "Note", type: "textarea" },
];

export default function TrendsPage() {
  return (
    <div>
      <PageHeader icon={<Newspaper className="h-5 w-5" />} title="News & Trend Center" description="Trending audio, topics, and finance news to ride." />
      <DataTable collection="trends" seed={TREND_SEED} fields={FIELDS} title="Trends" searchKeys={["title", "type", "platform"]} />
    </div>
  );
}
