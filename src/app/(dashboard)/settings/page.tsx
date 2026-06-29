"use client";

import { Settings } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { useCollection, type Row } from "@/lib/db/use-collection";

interface AppSettings extends Row {
  id: string;
  workspace: string;
  timezone: string;
  supportEmail: string;
}
const SEED: AppSettings[] = [{ id: "s1", workspace: "Triad T Enterprise LLC", timezone: "America/New_York", supportEmail: "support@triadt.co" }];
const inputCls = "w-full max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50";

export default function SettingsPage() {
  const s = useCollection<AppSettings>("app_settings", SEED);
  const rec = s.records[0] ?? SEED[0];
  const fields: { label: string; key: keyof AppSettings }[] = [
    { label: "Workspace name", key: "workspace" },
    { label: "Timezone", key: "timezone" },
    { label: "Support email", key: "supportEmail" },
  ];
  return (
    <div>
      <PageHeader icon={<Settings className="h-5 w-5" />} title="Settings" description="Workspace, branding, and platform settings." />
      <div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
        {fields.map((f) => (
          <label key={String(f.key)} className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</span>
            <input
              className={inputCls}
              value={String(rec[f.key] ?? "")}
              onChange={(e) => s.update(rec.id, { [f.key]: e.target.value })}
            />
          </label>
        ))}
        <p className="text-xs text-muted-foreground">Saved automatically.</p>
      </div>
    </div>
  );
}
