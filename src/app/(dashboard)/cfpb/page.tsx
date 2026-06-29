"use client";

import { useState } from "react";
import { Landmark, Wand2, Plus, X } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { CLIENT_SEED } from "@/lib/credit/data";
import { type Client, fullName } from "@/lib/credit/types";

interface Complaint extends Row {
  id: string;
  clientId: string;
  against: string;
  issue: string;
  narrative: string;
  status: string;
  dateFiled: string;
}

const ISSUES = [
  "Incorrect information on report",
  "Investigation took too long / not completed",
  "Did not provide method of verification",
  "Re-inserted previously deleted item",
  "Debt not validated by collector",
  "Identity theft / unauthorized account",
];
const STATUS = ["drafted", "submitted", "responded", "closed"];
const statusVariant: Record<string, "muted" | "secondary" | "warning" | "success"> = {
  drafted: "muted",
  submitted: "secondary",
  responded: "warning",
  closed: "success",
};

const inputCls = "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-gold/50";

function buildNarrative(clientName: string, against: string, issue: string): string {
  return (
    `I am submitting this complaint regarding ${against}. ${issue}.\n\n` +
    `Despite my dispute, the matter has not been resolved in accordance with the Fair Credit Reporting Act ` +
    `(15 U.S.C. §1681i). The company failed to conduct a reasonable reinvestigation and/or could not verify the ` +
    `disputed information with original documentation. I have retained copies of my correspondence and certified-mail ` +
    `receipts.\n\nI request that the CFPB direct ${against} to correct or delete the inaccurate information and provide ` +
    `written confirmation of the results. — ${clientName}`
  );
}

export default function CFPBCenterPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const complaints = useCollection<Complaint>("cfpb_complaints", []);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Complaint>>({});

  const nameOf = (id: string) => {
    const c = clients.records.find((c) => c.id === id);
    return c ? fullName(c) : "—";
  };

  function startNew() {
    setDraft({ clientId: clients.records[0]?.id ?? "", against: "Experian", issue: ISSUES[0], status: "drafted", dateFiled: new Date().toISOString().slice(0, 10), narrative: "" });
    setOpen(true);
  }
  function generate() {
    setDraft((d) => ({ ...d, narrative: buildNarrative(nameOf(d.clientId ?? ""), d.against ?? "the company", d.issue ?? "") }));
  }
  function save() {
    if (!draft.clientId) return;
    complaints.add({
      clientId: draft.clientId,
      against: draft.against ?? "",
      issue: draft.issue ?? "",
      narrative: draft.narrative ?? "",
      status: draft.status ?? "drafted",
      dateFiled: draft.dateFiled ?? new Date().toISOString().slice(0, 10),
    } as Omit<Complaint, "id">);
    setOpen(false);
    setDraft({});
  }

  return (
    <div>
      <PageHeader
        icon={<Landmark className="h-5 w-5" />}
        title="CFPB Center"
        description="Build, file, and track CFPB complaints and bureau escalations."
        actions={
          <Button size="sm" onClick={startNew}>
            <Plus className="h-4 w-4" /> New Complaint
          </Button>
        }
      />

      <div className="space-y-3">
        {complaints.records.length === 0 && (
          <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No complaints yet. Click <span className="text-gold">New Complaint</span> to build one.
          </p>
        )}
        {complaints.records.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {nameOf(c.clientId)} <span className="text-muted-foreground">vs {c.against}</span>
                </p>
                <p className="text-xs text-muted-foreground">{c.issue} · filed {c.dateFiled}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={c.status}
                  onChange={(e) => complaints.update(c.id, { status: e.target.value })}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs capitalize outline-none focus:border-gold/50"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Badge variant={statusVariant[c.status]} className="capitalize">
                  {c.status}
                </Badge>
                <button onClick={() => complaints.remove(c.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background/40 p-2 text-[11px] leading-relaxed text-foreground/90">
              {c.narrative}
            </pre>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-gold">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">New CFPB Complaint</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <select className={inputCls} value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}>
                {clients.records.map((c) => (
                  <option key={c.id} value={c.id}>
                    {fullName(c)}
                  </option>
                ))}
              </select>
              <input className={inputCls} placeholder="Against (e.g. Experian, Midland Credit)" value={draft.against ?? ""} onChange={(e) => setDraft({ ...draft, against: e.target.value })} />
              <select className={inputCls} value={draft.issue} onChange={(e) => setDraft({ ...draft, issue: e.target.value })}>
                {ISSUES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={generate}>
                  <Wand2 className="h-3.5 w-3.5" /> Generate narrative
                </Button>
              </div>
              <textarea
                className={`${inputCls} min-h-[140px] resize-y`}
                placeholder="Complaint narrative…"
                value={draft.narrative ?? ""}
                onChange={(e) => setDraft({ ...draft, narrative: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={save}>
                Save complaint
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
