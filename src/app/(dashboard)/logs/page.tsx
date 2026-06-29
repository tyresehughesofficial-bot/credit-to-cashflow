"use client";

import { ScrollText } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { useCollection, type Row } from "@/lib/db/use-collection";

interface Log extends Row {
  id: string;
  source?: string;
  status?: string;
  mode?: string;
  message?: string;
  createdAt?: string;
}

export default function LogsPage() {
  const logs = useCollection<Log>("import_logs", []);
  return (
    <div>
      <PageHeader icon={<ScrollText className="h-5 w-5" />} title="Logs" description="Activity and import logs across the platform." />
      {logs.records.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          No logs yet. Import activity (e.g. MyFreeScoreNow imports) appears here once Supabase is connected.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.records.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{l.message || l.source || "Activity"}</p>
                <p className="text-xs text-muted-foreground">{l.source} · {l.mode} · {l.createdAt ?? ""}</p>
              </div>
              <Badge variant={l.status === "success" ? "success" : l.status === "partial" ? "warning" : "muted"}>{l.status || "—"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
