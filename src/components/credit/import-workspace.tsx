"use client";

import { useMemo, useState } from "react";
import { X, Loader2, UserPlus, Upload, Sparkles, Building2, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { cn } from "@/lib/utils";
import { CLIENT_SEED } from "@/lib/credit/data";
import { type Client, CLIENT_STATUSES, fullName } from "@/lib/credit/types";
import { importClient } from "@/lib/credit/myfreescorenow";
import { createManualClient, type ManualClientInput } from "@/lib/credit/manual";
import { uploadReport, processReport, saveExtracted, type ExtractedData } from "@/lib/credit/upload";

const inp = "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-gold/50";
const lbl = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground";
type Mode = "mfsn" | "manual" | "upload";
const num = (v: string) => (v === "" ? undefined : Number(v));

export function ImportWorkspace({
  open,
  initialMode = "manual",
  onClose,
  onCreated,
}: {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
  onCreated: (clientId: string, note?: string) => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 my-8 w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-gold">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Add a Client</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {/* Source selector */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {([
            ["mfsn", "MyFreeScoreNow", <Sparkles key="i" className="h-4 w-4" />],
            ["manual", "Manual Client", <UserPlus key="i" className="h-4 w-4" />],
            ["upload", "Upload Report", <Upload key="i" className="h-4 w-4" />],
          ] as const).map(([m, label, icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium",
                mode === m ? "border-gold/50 bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {mode === "mfsn" && <MfsnForm onClose={onClose} onCreated={onCreated} />}
        {mode === "manual" && <ManualForm onClose={onClose} onCreated={onCreated} />}
        {mode === "upload" && <UploadForm onClose={onClose} onCreated={onCreated} />}
      </div>
    </div>
  );
}

/* ── MyFreeScoreNow (existing flow) ── */
function MfsnForm({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string, n?: string) => void }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", myfreescorenowId: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Pulls the member&apos;s tri-bureau report via the mfsn_import function (demo if not live).</p>
      <div className="grid grid-cols-2 gap-3">
        <input className={inp} placeholder="First name" value={f.firstName} onChange={set("firstName")} />
        <input className={inp} placeholder="Last name" value={f.lastName} onChange={set("lastName")} />
      </div>
      <input className={inp} placeholder="Email" value={f.email} onChange={set("email")} />
      <input className={inp} placeholder="Phone" value={f.phone} onChange={set("phone")} />
      <input className={inp} placeholder="MyFreeScoreNow member ID (optional)" value={f.myfreescorenowId} onChange={set("myfreescorenowId")} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={busy || !f.firstName.trim()} onClick={async () => { setBusy(true); const r = await importClient(f); setBusy(false); onCreated(r.clientId, `Imported (${r.mode})`); }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Import & Analyze
        </Button>
      </div>
    </div>
  );
}

/* ── Manual client ── */
function ManualForm({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string, n?: string) => void }) {
  const [f, setF] = useState<ManualClientInput>({ firstName: "", lastName: "", status: "active" });
  const s = (k: keyof ManualClientInput, isNum = false) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: isNum ? num(e.target.value) : e.target.value });

  function save(addReport: boolean) {
    if (!f.firstName.trim() || !f.lastName.trim()) return;
    const id = createManualClient(f);
    onCreated(id, addReport ? "Manual client created — add a report" : "Manual client created");
  }

  return (
    <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
      <Section title="Client">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *"><input className={inp} value={f.firstName} onChange={s("firstName")} /></Field>
          <Field label="Last name *"><input className={inp} value={f.lastName} onChange={s("lastName")} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email *"><input className={inp} value={f.email ?? ""} onChange={s("email")} /></Field>
          <Field label="Phone"><input className={inp} value={f.phone ?? ""} onChange={s("phone")} /></Field>
        </div>
        <Field label="Address"><input className={inp} value={f.address ?? ""} onChange={s("address")} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="City"><input className={inp} value={f.city ?? ""} onChange={s("city")} /></Field>
          <Field label="State"><input className={inp} value={f.state ?? ""} onChange={s("state")} /></Field>
          <Field label="ZIP"><input className={inp} value={f.zip ?? ""} onChange={s("zip")} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of birth"><input className={inp} placeholder="MM/DD/YYYY" value={f.dob ?? ""} onChange={s("dob")} /></Field>
          <Field label="Status">
            <select className={inp} value={f.status} onChange={s("status")}>
              {CLIENT_STATUSES.map((x) => <option key={x} value={x} className="capitalize">{x.replace("_", " ")}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Program"><input className={inp} value={f.program ?? ""} onChange={s("program")} /></Field>
          <Field label="Start date"><input className={inp} placeholder="YYYY-MM-DD" value={f.startDate ?? ""} onChange={s("startDate")} /></Field>
          <Field label="Assigned specialist"><input className={inp} value={f.assignedTo ?? ""} onChange={s("assignedTo")} /></Field>
        </div>
        <Field label="Notes"><textarea className={cn(inp, "min-h-[60px] resize-y")} value={f.notes ?? ""} onChange={s("notes")} /></Field>
      </Section>

      <Section title="Bureau Scores">
        <div className="grid grid-cols-4 gap-3">
          <Field label="Experian"><input type="number" className={inp} value={f.experianScore ?? ""} onChange={s("experianScore", true)} /></Field>
          <Field label="Equifax"><input type="number" className={inp} value={f.equifaxScore ?? ""} onChange={s("equifaxScore", true)} /></Field>
          <Field label="TransUnion"><input type="number" className={inp} value={f.transunionScore ?? ""} onChange={s("transunionScore", true)} /></Field>
          <Field label="Score date"><input className={inp} placeholder="YYYY-MM-DD" value={f.scoreDate ?? ""} onChange={s("scoreDate")} /></Field>
        </div>
      </Section>

      <Section title="Credit Details">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Total limit $"><input type="number" className={inp} value={f.totalLimit ?? ""} onChange={s("totalLimit", true)} /></Field>
          <Field label="Total balances $"><input type="number" className={inp} value={f.totalBalance ?? ""} onChange={s("totalBalance", true)} /></Field>
          <Field label="Utilization %"><input type="number" className={inp} value={f.utilizationPct ?? ""} onChange={s("utilizationPct", true)} /></Field>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Field label="# Negatives"><input type="number" className={inp} value={f.negativeCount ?? ""} onChange={s("negativeCount", true)} /></Field>
          <Field label="# Inquiries"><input type="number" className={inp} value={f.inquiryCount ?? ""} onChange={s("inquiryCount", true)} /></Field>
          <Field label="Oldest age (mo)"><input type="number" className={inp} value={f.oldestAgeMonths ?? ""} onChange={s("oldestAgeMonths", true)} /></Field>
          <Field label="Avg age (mo)"><input type="number" className={inp} value={f.avgAgeMonths ?? ""} onChange={s("avgAgeMonths", true)} /></Field>
        </div>
      </Section>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="outline" size="sm" disabled={!f.firstName.trim() || !f.lastName.trim()} onClick={() => save(true)}>Save &amp; Add Report</Button>
        <Button size="sm" disabled={!f.firstName.trim() || !f.lastName.trim()} onClick={() => save(false)}>Save Client</Button>
      </div>
    </div>
  );
}

/* ── Upload report → extract → review → save ── */
function UploadForm({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string, n?: string) => void }) {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const [phase, setPhase] = useState<"form" | "processing" | "review">("form");
  const [target, setTarget] = useState<"existing" | "new">(clients.records.length ? "existing" : "new");
  const [clientId, setClientId] = useState(clients.records[0]?.id ?? "");
  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", email: "" });
  const [meta, setMeta] = useState({ reportDate: new Date().toISOString().slice(0, 10), provider: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | undefined>();
  const [data, setData] = useState<ExtractedData>({});

  async function run() {
    if (!file) return;
    setErr(null);
    let cid = clientId;
    if (target === "new") {
      if (!newClient.firstName.trim()) { setErr("Enter a first name for the new client."); return; }
      cid = createManualClient({ ...newClient });
      setClientId(cid);
    }
    setPhase("processing");
    const u = await uploadReport({ file, clientId: cid, source: "manual" });
    if (u.error) { setErr(u.error); }
    setUploadId(u.uploadId);
    const res = await processReport(u, file);
    if (!res.ok) setErr(res.error ?? "Extraction unavailable — fill the fields below manually.");
    setData(res.data ?? {});
    setPhase("review");
  }

  function confirmSave() {
    const cid = clientId;
    saveExtracted(cid, data, meta.reportDate, uploadId);
    onCreated(cid, "Report saved & analyzed");
  }

  /* editable review helpers */
  const scores = data.scores ?? {};
  const setScore = (k: "experian" | "equifax" | "transunion") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData({ ...data, scores: { ...scores, [k]: num(e.target.value) ?? null } });
  const util = data.utilization ?? {};
  const setUtil = (k: "total_balance" | "total_limit" | "utilization_pct") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData({ ...data, utilization: { ...util, [k]: num(e.target.value) ?? null } });

  if (phase === "processing") {
    return <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-gold" /> Uploading &amp; extracting…</div>;
  }

  if (phase === "review") {
    return (
      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-3">
          <p className="text-xs font-semibold text-gold">Review Extracted Data</p>
          <p className="text-[11px] text-muted-foreground">Nothing is saved until you confirm. Edit anything the parser got wrong.</p>
        </div>
        {err && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
            <p className="text-xs font-semibold text-destructive">Auto-extraction didn&apos;t run</p>
            <p className="mt-1 text-[11px] text-foreground/90">{err}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">You can still enter the fields below manually and save — the AI diagnosis runs on the saved data.</p>
          </div>
        )}

        <Section title="Bureau Scores">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Experian"><input type="number" className={inp} value={scores.experian ?? ""} onChange={setScore("experian")} /></Field>
            <Field label="Equifax"><input type="number" className={inp} value={scores.equifax ?? ""} onChange={setScore("equifax")} /></Field>
            <Field label="TransUnion"><input type="number" className={inp} value={scores.transunion ?? ""} onChange={setScore("transunion")} /></Field>
          </div>
        </Section>

        <Section title="Utilization">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Total balance $"><input type="number" className={inp} value={util.total_balance ?? ""} onChange={setUtil("total_balance")} /></Field>
            <Field label="Total limit $"><input type="number" className={inp} value={util.total_limit ?? ""} onChange={setUtil("total_limit")} /></Field>
            <Field label="Utilization %"><input type="number" className={inp} value={util.utilization_pct ?? ""} onChange={setUtil("utilization_pct")} /></Field>
          </div>
        </Section>

        <EditableList
          title={`Negative Accounts (${data.negatives?.length ?? 0})`}
          rows={data.negatives ?? []}
          cols={[["creditor", "Creditor"], ["account_type", "Type"], ["bureau", "Bureau"], ["status", "Status"]]}
          onChange={(rows) => setData({ ...data, negatives: rows as ExtractedData["negatives"] })}
          blank={{ creditor: "", account_type: "collection" }}
        />
        <EditableList
          title={`Inquiries (${data.inquiries?.length ?? 0})`}
          rows={data.inquiries ?? []}
          cols={[["creditor", "Creditor"], ["bureau", "Bureau"], ["inquiry_date", "Date"]]}
          onChange={(rows) => setData({ ...data, inquiries: rows as ExtractedData["inquiries"] })}
          blank={{ creditor: "" }}
        />

        <p className="text-[11px] text-muted-foreground">
          Also saving: {data.tradelines?.length ?? 0} tradelines · {data.personal_information?.length ?? 0} personal-info items (editable in the profile).
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => setPhase("form")}>Back</Button>
          <Button size="sm" onClick={confirmSave}>Confirm &amp; Save</Button>
        </div>
      </div>
    );
  }

  // form phase
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTarget("existing")} className={cn("flex-1 rounded-md border px-3 py-2 text-xs", target === "existing" ? "border-gold/50 bg-gold/10 text-gold" : "border-border text-muted-foreground")}>Existing client</button>
        <button onClick={() => setTarget("new")} className={cn("flex-1 rounded-md border px-3 py-2 text-xs", target === "new" ? "border-gold/50 bg-gold/10 text-gold" : "border-border text-muted-foreground")}>New client</button>
      </div>

      {target === "existing" ? (
        <Field label="Client">
          <select className={inp} value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.records.map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}
          </select>
        </Field>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <input className={inp} placeholder="First name" value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} />
          <input className={inp} placeholder="Last name" value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} />
          <input className={inp} placeholder="Email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Report date"><input className={inp} value={meta.reportDate} onChange={(e) => setMeta({ ...meta, reportDate: e.target.value })} /></Field>
        <Field label="Provider / source"><input className={inp} placeholder="e.g. IdentityIQ, SmartCredit" value={meta.provider} onChange={(e) => setMeta({ ...meta, provider: e.target.value })} /></Field>
      </div>

      <Field label="Credit report file (PDF, CSV, JSON, TXT, PNG, JPG)">
        <input type="file" accept=".pdf,.csv,.json,.txt,.png,.jpg,.jpeg,.webp" className={inp} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Notes (optional)"><textarea className={cn(inp, "min-h-[50px] resize-y")} value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} /></Field>

      {err && <p className="text-xs text-destructive">{err}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!file} onClick={run}><Upload className="h-4 w-4" /> Upload &amp; Extract</Button>
      </div>
    </div>
  );
}

/* ── small building blocks ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold"><Building2 className="h-3 w-3" /> {title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className={lbl}>{label}</span>{children}</label>;
}

function EditableList({
  title, rows, cols, onChange, blank,
}: {
  title: string;
  rows: Record<string, unknown>[];
  cols: [string, string][];
  onChange: (rows: Record<string, unknown>[]) => void;
  blank: Record<string, unknown>;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">{title}</p>
        <button onClick={() => onChange([...rows, { ...blank }])} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-gold"><Plus className="h-3 w-3" /> Add</button>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {cols.map(([k]) => (
              <input
                key={k}
                className={cn(inp, "py-1 text-xs")}
                value={String(r[k] ?? "")}
                onChange={(e) => { const next = [...rows]; next[i] = { ...next[i], [k]: e.target.value }; onChange(next); }}
              />
            ))}
            <button onClick={() => onChange(rows.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[11px] text-muted-foreground">None extracted — click Add to enter manually.</p>}
      </div>
    </div>
  );
}
