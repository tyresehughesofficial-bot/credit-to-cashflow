"use client";

import { Plug } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { aiConfigured } from "@/lib/ai";

const ITEMS = [
  { name: "Supabase", desc: "Database, auth, storage & edge functions.", ok: isSupabaseConfigured },
  { name: "Claude (Anthropic)", desc: "Text generation via the generate-text function.", ok: aiConfigured },
  { name: "MyFreeScoreNow", desc: "Credit report import (mfsn_import function).", ok: isSupabaseConfigured },
  { name: "GoHighLevel", desc: "CRM / pipelines — migrating in-app (W6).", ok: false },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader icon={<Plug className="h-5 w-5" />} title="Integrations" description="Connect Supabase, AI, credit data, and funding partners." />
      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((i) => (
          <div key={i.name} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{i.name}</p>
              <Badge variant={i.ok ? "success" : "muted"}>{i.ok ? "Connected" : "Not connected"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
