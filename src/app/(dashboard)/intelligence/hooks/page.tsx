"use client";

import { useMemo, useState } from "react";
import { Anchor, Search, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { PlatformChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { DataTable } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { COLL, FIELDS, SEED } from "@/lib/intelligence/collections";
import type { HookType, HookEntry } from "@/lib/intelligence/types";

const TYPES: HookType[] = ["Curiosity", "Fear", "Authority", "Myth", "Contrarian", "Proof", "Story", "Urgency"];

export default function HookIntelligence() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<HookType | "All">("All");
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const HOOKS = useCollection(COLL.hooks, SEED[COLL.hooks]).records as unknown as HookEntry[];

  const list = useMemo(() => {
    return HOOKS.filter((h) => {
      if (type !== "All" && h.type !== type) return false;
      if (q && !h.hook.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.views - a.views);
  }, [q, type]);

  return (
    <div>
      <PageHeader
        icon={<Anchor className="h-5 w-5" />}
        title="Hook Intelligence"
        description="A searchable database of high-performing hooks from TikTok, Instagram and YouTube — categorized by psychological trigger and ranked by engagement."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Hooks Stored" value={HOOKS.length} sub="and growing" accent />
        <Stat label="Psychology Types" value={TYPES.length} sub="trigger categories" />
        <Stat label="Top Hook Reach" value={`${(Math.max(...HOOKS.map((h) => h.views)) / 1000).toFixed(0)}k`} sub="single post" />
        <Stat label="Favorited" value={Object.values(favs).filter(Boolean).length} sub="in your swipe file" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hooks…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                type === t ? "border-gold/40 bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((h) => (
          <div key={h.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium leading-snug">“{h.hook}”</p>
              <button
                onClick={() => setFavs((f) => ({ ...f, [h.id]: !f[h.id] }))}
                aria-label="Favorite"
                className="shrink-0 text-muted-foreground transition-colors hover:text-gold"
              >
                <Star className={cn("h-4 w-4", favs[h.id] && "fill-gold text-gold")} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-2 py-0.5 text-[10px] font-semibold text-gold/90">
                {h.type}
              </span>
              <PlatformChip platform={h.platform} />
              <span className="text-[11px] text-muted-foreground">{h.creator}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {(h.views / 1000).toFixed(0)}k views · {h.engagementRate}% ER
              </span>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Hook Database — Add / Edit / Import</SectionLabel>
      <DataTable collection={COLL.hooks} seed={SEED[COLL.hooks]} fields={FIELDS[COLL.hooks]} title="Hooks" />

      <DetectedOpportunities source="hook" />
    </div>
  );
}
