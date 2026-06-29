"use client";

import { useMemo, useState } from "react";
import { Contact2, Plus, Send } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { cn } from "@/lib/utils";
import {
  PIPELINE_STAGES,
  CONTACT_SEED,
  CONTACT_SOURCES,
  ACTIVITY_SEED,
  ACTIVITY_TYPES,
  BOOKING_SEED,
  DEAL_SEED,
  DEAL_STATUS,
  PAYMENT_SEED,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  pipelineValue,
  type Contact,
  type Activity,
  type Deal,
  type Payment,
  type Stage,
} from "@/lib/crm/data";
import { sendMessage } from "@/lib/messaging";
import { createPaymentLink } from "@/lib/stripe";

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

const DEAL_FIELDS: Field[] = [
  { key: "name", label: "Deal" },
  { key: "contact", label: "Contact" },
  { key: "offer", label: "Offer" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "status", label: "Status", type: "select", options: DEAL_STATUS },
];
const PAYMENT_FIELDS: Field[] = [
  { key: "contact", label: "Contact" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "method", label: "Method", type: "select", options: PAYMENT_METHODS },
  { key: "status", label: "Status", type: "select", options: PAYMENT_STATUS },
  { key: "link", label: "Payment Link", hideInTable: true },
  { key: "date", label: "Date" },
];

const CONTACT_FIELDS: Field[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email", hideInTable: true },
  { key: "phone", label: "Phone" },
  { key: "source", label: "Source", type: "select", options: CONTACT_SOURCES },
  { key: "stage", label: "Stage", type: "select", options: [...PIPELINE_STAGES] },
  { key: "owner", label: "Owner" },
  { key: "offer", label: "Offer" },
  { key: "value", label: "Value", type: "number" },
  { key: "tags", label: "Tags", type: "tags", hideInTable: true },
  { key: "note", label: "Note", type: "textarea", hideInTable: true },
];

export default function CRMPage() {
  const contacts = useCollection<Contact>("crm_contacts", CONTACT_SEED);
  const activities = useCollection<Activity>("crm_activities", ACTIVITY_SEED);
  const bookings = useCollection<Activity>("crm_bookings", BOOKING_SEED);
  const deals = useCollection<Deal>("crm_deals", DEAL_SEED);
  const payments = useCollection<Payment>("crm_payments", PAYMENT_SEED);

  const totalPipeline = useMemo(() => pipelineValue(contacts.records), [contacts.records]);
  const collected = useMemo(
    () => payments.records.filter((p) => p.status === "paid").reduce((a, p) => a + Number(p.amount || 0), 0),
    [payments.records],
  );

  const [newActivity, setNewActivity] = useState({ contact: "", type: "note", summary: "" });
  const [sending, setSending] = useState(false);
  const [pay, setPay] = useState({ contact: "", amount: "" });
  const [payMsg, setPayMsg] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  async function makePaymentLink() {
    const amt = Number(pay.amount);
    if (!pay.contact || !amt) return;
    setPayBusy(true);
    setPayMsg(null);
    const c = contacts.records.find((x) => x.name === pay.contact);
    const res = await createPaymentLink({ amount: amt, description: `Triad T — ${pay.contact}`, email: c?.email });
    setPayBusy(false);
    payments.add({ contact: pay.contact, amount: amt, method: "link", status: "pending", link: res.url ?? "", date: new Date().toISOString().slice(0, 10) } as Omit<Payment, "id">);
    setPayMsg(res.ok ? `Live payment link created — ${res.url}` : "Recorded as pending. Set STRIPE_SECRET_KEY to generate a live checkout link.");
    setPay({ contact: "", amount: "" });
  }

  async function logActivity(sendIt: boolean) {
    if (!newActivity.contact || !newActivity.summary) return;
    let note = "";
    if (sendIt && (newActivity.type === "sms" || newActivity.type === "email")) {
      setSending(true);
      const c = contacts.records.find((x) => x.name === newActivity.contact);
      const to = newActivity.type === "sms" ? c?.phone : c?.email;
      const res = await sendMessage({ channel: newActivity.type as "sms" | "email", to: to ?? "", body: newActivity.summary });
      setSending(false);
      note = res.sent ? " (sent)" : " (queued — no provider)";
    }
    activities.add({ ...newActivity, summary: newActivity.summary + note, date: new Date().toISOString().slice(0, 10) } as Omit<Activity, "id">);
    setNewActivity({ contact: "", type: "note", summary: "" });
  }

  return (
    <div>
      <PageHeader
        icon={<Contact2 className="h-5 w-5" />}
        title="CRM"
        description="Contacts, the 10-stage pipeline, activity, and bookings — the in-app CRM replacing GoHighLevel."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Contacts", value: contacts.records.length },
          { label: "Open Pipeline", value: usd(totalPipeline) },
          { label: "Won Deals", value: deals.records.filter((d) => d.status === "won").length },
          { label: "Collected", value: usd(collected) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* PIPELINE — 10-stage kanban */}
        <TabsContent value="pipeline">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {PIPELINE_STAGES.map((stage) => {
              const cards = contacts.records.filter((c) => c.stage === stage);
              const sum = cards.reduce((a, c) => a + Number(c.value || 0), 0);
              return (
                <div key={stage} className="w-60 shrink-0">
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-1.5">
                    <p className="text-xs font-semibold">{stage}</p>
                    <span className="text-[10px] text-muted-foreground">{cards.length} · {usd(sum)}</span>
                  </div>
                  <div className="space-y-2">
                    {cards.map((c) => (
                      <div key={c.id} className="rounded-lg border border-border bg-card p-2.5">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {c.offer || "—"}{c.value ? ` · ${usd(Number(c.value))}` : ""}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <span className="text-[10px] text-muted-foreground">{c.owner}</span>
                          <select
                            value={c.stage}
                            onChange={(e) => contacts.update(c.id, { stage: e.target.value as Stage })}
                            className="max-w-[120px] rounded border border-border bg-background px-1 py-0.5 text-[10px] outline-none focus:border-gold/50"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {cards.length === 0 && <p className="px-1 text-[11px] text-muted-foreground">—</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* CONTACTS */}
        <TabsContent value="contacts">
          <DataTable collection="crm_contacts" seed={CONTACT_SEED} fields={CONTACT_FIELDS} title="Contacts" searchKeys={["name", "email", "owner", "offer"]} />
        </TabsContent>

        {/* DEALS */}
        <TabsContent value="deals">
          <DataTable collection="crm_deals" seed={DEAL_SEED} fields={DEAL_FIELDS} title="Deals" searchKeys={["name", "contact", "offer"]} />
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gold/30 bg-card p-3">
            <select
              value={pay.contact}
              onChange={(e) => setPay({ ...pay, contact: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-2 text-sm outline-none focus:border-gold/50"
            >
              <option value="">Contact…</option>
              {contacts.records.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount $"
              value={pay.amount}
              onChange={(e) => setPay({ ...pay, amount: e.target.value })}
              className="w-28 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
            />
            <Button size="sm" disabled={payBusy || !pay.contact || !pay.amount} onClick={makePaymentLink}>
              {payBusy ? "…" : "Create payment link"}
            </Button>
            {payMsg && <span className="text-xs text-gold">{payMsg}</span>}
          </div>
          <DataTable collection="crm_payments" seed={PAYMENT_SEED} fields={PAYMENT_FIELDS} title="Payments" searchKeys={["contact", "method", "status"]} />
        </TabsContent>

        {/* ACTIVITY */}
        <TabsContent value="activity" className="space-y-4">
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3">
            <select
              value={newActivity.contact}
              onChange={(e) => setNewActivity({ ...newActivity, contact: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-2 text-sm outline-none focus:border-gold/50"
            >
              <option value="">Contact…</option>
              {contacts.records.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={newActivity.type}
              onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-2 text-sm capitalize outline-none focus:border-gold/50"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              placeholder="Summary…"
              value={newActivity.summary}
              onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
              className="min-w-[200px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
            />
            <Button size="sm" variant="outline" disabled={!newActivity.contact || !newActivity.summary} onClick={() => logActivity(false)}>
              <Plus className="h-4 w-4" /> Log
            </Button>
            {(newActivity.type === "sms" || newActivity.type === "email") && (
              <Button size="sm" disabled={sending || !newActivity.contact || !newActivity.summary} onClick={() => logActivity(true)}>
                <Send className="h-4 w-4" /> Send &amp; log
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {[...activities.records].reverse().map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.summary}</p>
                  <p className="text-xs text-muted-foreground">{a.contact} · {a.date}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{a.type}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* BOOKINGS */}
        <TabsContent value="bookings">
          <div className="space-y-2">
            {bookings.records.map((b) => (
              <div key={b.id} className={cn("flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3")}>
                <div>
                  <p className="text-sm font-medium">{b.contact}</p>
                  <p className="text-xs text-muted-foreground">{b.summary}</p>
                </div>
                <Badge variant="default">{b.date}</Badge>
              </div>
            ))}
            {bookings.records.length === 0 && <p className="text-sm text-muted-foreground">No bookings.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
