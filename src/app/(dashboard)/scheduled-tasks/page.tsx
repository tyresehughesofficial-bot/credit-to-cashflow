"use client";

import { CalendarClock } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { SCHEDULED_SEED } from "@/lib/library/data";

const FIELDS: Field[] = [
  { key: "task", label: "Task" },
  { key: "schedule", label: "Schedule" },
  { key: "nextRun", label: "Next Run" },
  { key: "status", label: "Status", type: "select", options: ["scheduled", "paused", "done"] },
];

export default function ScheduledTasksPage() {
  return (
    <div>
      <PageHeader icon={<CalendarClock className="h-5 w-5" />} title="Scheduled Tasks" description="Recurring jobs, reminders, and scheduled publishing." />
      <DataTable collection="scheduled_tasks" seed={SCHEDULED_SEED} fields={FIELDS} title="Scheduled Tasks" searchKeys={["task", "schedule"]} />
    </div>
  );
}
