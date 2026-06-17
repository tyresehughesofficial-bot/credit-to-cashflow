"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Pencil,
  X,
  BookLock,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { BUREAU_PROFILES, INTEL_CATEGORIES, type BureauProfile, type IntelCategory } from "@/lib/credit/bureau-intel";
import { BUREAUS } from "@/lib/credit/types";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-gold/50";

const PROFILE_FIELDS: { key: keyof BureauProfile; label: string; icon: React.ReactNode }[] = [
  { key: "disputeAddress", label: "Dispute Address", icon: <MapPin className="h-4 w-4" /> },
  { key: "contact", label: "Contact Info", icon: <Phone className="h-4 w-4" /> },
  { key: "responsePatterns", label: "Response Patterns", icon: <Activity className="h-4 w-4" /> },
  { key: "verificationBehavior", label: "Known Verification Behavior", icon: <ShieldCheck className="h-4 w-4" /> },
  { key: "escalationMethods", label: "Escalation Methods", icon: <ArrowUpRight className="h-4 w-4" /> },
  { key: "investigationTimelines", label: "Investigation Timelines", icon: <Clock className="h-4 w-4" /> },
];

export default function BureauIntelligencePage() {
  const profiles = useCollection<BureauProfile & Row>("bureau_profiles", BUREAU_PROFILES as (BureauProfile & Row)[]);
  const categories = useCollection<IntelCategory & Row>("bureau_intel_categories", INTEL_CATEGORIES as (IntelCategory & Row)[]);
  const [editing, setEditing] = useState<(BureauProfile & Row) | null>(null);

  return (
    <div>
      <PageHeader
        icon={<BookLock className="h-5 w-5" />}
        title="Bureau Intelligence"
        description="Internal knowledge database for how each bureau behaves — addresses, contacts, response patterns, verification behavior, escalation methods, and timelines. This is operator reference knowledge, not client data."
      />

      <Tabs defaultValue={BUREAUS[0]}>
        <TabsList className="flex-wrap">
          {BUREAUS.map((b) => (
            <TabsTrigger key={b} value={b}>
              {b}
            </TabsTrigger>
          ))}
          <TabsTrigger value="__categories">Item Intelligence</TabsTrigger>
        </TabsList>

        {BUREAUS.map((b) => {
          const p = profiles.records.find((x) => x.bureau === b);
          return (
            <TabsContent key={b} value={b}>
              {!p ? (
                <p className="text-sm text-muted-foreground">No intelligence on file for {b}.</p>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{b}</h2>
                        <p className="text-xs text-muted-foreground">Bureau knowledge profile</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing({ ...p })}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {PROFILE_FIELDS.map((f) => (
                      <div key={String(f.key)} className="rounded-xl border border-border bg-card p-4">
                        <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gold">
                          {f.icon} {f.label}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                          {String(p[f.key] ?? "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          );
        })}

        <TabsContent value="__categories">
          <p className="mb-4 text-sm text-muted-foreground">
            Cross-bureau intelligence by item type — playbooks and legal levers used during analysis and dispute strategy.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {categories.records.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-gold">{c.category}</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{c.summary}</p>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Playbook</p>
                <p className="mb-3 text-sm leading-relaxed text-foreground/90">{c.playbook}</p>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Legal Basis</p>
                <p className="text-xs leading-relaxed text-foreground/70">{c.legalBasis}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-gold">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Edit {editing.bureau} intelligence</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {PROFILE_FIELDS.map((f) => (
                <label key={String(f.key)} className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </span>
                  <textarea
                    className={cn(inputCls, "min-h-[72px] resize-y")}
                    value={String(editing[f.key] ?? "")}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const { id, ...patch } = editing;
                  profiles.update(id, patch);
                  setEditing(null);
                }}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
