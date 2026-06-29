"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { AIPanel } from "@/components/ai/ai-panel";
import { Input } from "@/components/ui/input";
import { SOP_SEED, SOP_CATEGORIES } from "@/lib/ops/data";

const FIELDS: Field[] = [
  { key: "title", label: "SOP" },
  { key: "category", label: "Category", type: "select", options: SOP_CATEGORIES },
  { key: "owner", label: "Owner" },
  { key: "version", label: "Version" },
  { key: "steps", label: "Steps", type: "textarea", hideInTable: true },
];

export default function SOPLibraryPage() {
  const [task, setTask] = useState("");

  return (
    <div>
      <PageHeader
        icon={<BookOpen className="h-5 w-5" />}
        title="SOP Library"
        description="Every repeated task documented — if a team member has a question, the answer already exists here."
      />

      <div className="mb-6">
        <div className="mb-2">
          <Input
            placeholder="Describe a task to generate an SOP (e.g. 'send a Round 2 MOV letter')"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="max-w-xl"
          />
        </div>
        <AIPanel
          title="AI SOP Generator"
          cta="Generate SOP"
          system="You are an operations lead at a credit-repair and funding company. Write clear, numbered SOPs a new team member can follow without asking questions. Keep it concise and concrete."
          prompt={`Write a step-by-step SOP for this task: "${task || "onboard a new credit repair client"}". Include a short purpose line, numbered steps, and a 'done when' check. Plain language.`}
          fallback="Set ANTHROPIC_API_KEY in Supabase to auto-generate SOPs. Until then, add SOPs manually below."
        />
      </div>

      <DataTable collection="sops" seed={SOP_SEED} fields={FIELDS} title="SOPs" searchKeys={["title", "category", "owner"]} />
    </div>
  );
}
