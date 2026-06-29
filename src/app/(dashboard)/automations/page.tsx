"use client";

import { useState } from "react";
import { Zap, Play } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection, collectionUpsert, type Row } from "@/lib/db/use-collection";
import { AUTOMATION_SEED, type Automation } from "@/lib/library/data";
import { CONTACT_SEED, type Contact } from "@/lib/crm/data";
import { sendMessage } from "@/lib/messaging";

const FIELDS: Field[] = [
  { key: "name", label: "Automation" },
  { key: "trigger", label: "Trigger" },
  { key: "action", label: "Action" },
  { key: "status", label: "Status", type: "select", options: ["active", "paused"] },
];

const uid = () => `ac-${Math.random().toString(36).slice(2, 9)}`;

export default function AutomationsPage() {
  const automations = useCollection<Automation>("automations", AUTOMATION_SEED);
  const contacts = useCollection<Contact>("crm_contacts", CONTACT_SEED);
  const [autoId, setAutoId] = useState("");
  const [contactId, setContactId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    const a = automations.records.find((x) => x.id === autoId);
    const c = contacts.records.find((x) => x.id === contactId);
    if (!a || !c) return;
    setBusy(true);
    setMsg(null);

    // Execute the action in-app: attempt a message if the action implies one.
    let outcome = `Ran "${a.name}" for ${c.name}: ${a.action}`;
    if (/sms|text/i.test(a.action) && c.phone) {
      const res = await sendMessage({ channel: "sms", to: c.phone, body: `${a.name}` });
      outcome += res.sent ? " — SMS sent." : " — SMS queued (no provider).";
    } else if (/email/i.test(a.action) && c.email) {
      const res = await sendMessage({ channel: "email", to: c.email, subject: a.name, body: a.action });
      outcome += res.sent ? " — email sent." : " — email queued (no provider).";
    }

    // Log to the CRM activity feed.
    collectionUpsert("crm_activities", { id: uid(), contact: c.name, type: "task", summary: outcome, date: new Date().toISOString().slice(0, 10) } as Row);
    setBusy(false);
    setMsg(outcome);
  }

  const selCls = "rounded-md border border-border bg-background px-2 py-2 text-sm outline-none focus:border-gold/50";

  return (
    <div>
      <PageHeader icon={<Zap className="h-5 w-5" />} title="Automations" description="Trigger-based automations across the whole platform." />

      {/* Manual run (in-app execution; scheduled/event triggers need the backend scheduler) */}
      <div className="mb-6 rounded-xl border border-gold/30 bg-card p-4">
        <p className="mb-2 text-sm font-semibold">Run an automation now</p>
        <div className="flex flex-wrap items-center gap-2">
          <select className={selCls} value={autoId} onChange={(e) => setAutoId(e.target.value)}>
            <option value="">Automation…</option>
            {automations.records.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select className={selCls} value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">Contact…</option>
            {contacts.records.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button size="sm" disabled={busy || !autoId || !contactId} onClick={run}>
            <Play className="h-4 w-4" /> Run now
          </Button>
        </div>
        {msg && <p className="mt-2 text-xs text-gold">{msg} — logged to CRM activity.</p>}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Manual run executes in-app (sends via provider if configured, else logs). Scheduled & event-triggered runs activate with the backend scheduler.
        </p>
      </div>

      <DataTable collection="automations" seed={AUTOMATION_SEED} fields={FIELDS} title="Automation Rules" searchKeys={["name", "trigger", "action"]} />
    </div>
  );
}
