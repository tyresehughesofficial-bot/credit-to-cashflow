"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { CLIENT_SEED, ROUND_SEED } from "@/lib/credit/data";
import { type Client, type DisputeRound, type RoundStatus, fullName, BUREAUS } from "@/lib/credit/types";

const ROUND_STATUS: RoundStatus[] = ["drafted", "sent", "investigating", "completed", "escalated"];
const variant: Record<RoundStatus, "muted" | "secondary" | "warning" | "success" | "default"> = {
  drafted: "muted",
  sent: "secondary",
  investigating: "warning",
  completed: "success",
  escalated: "default",
};

export default function RoundTrackingPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const rounds = useCollection<DisputeRound & Row>("dispute_rounds", ROUND_SEED as (DisputeRound & Row)[]);
  const [clientF, setClientF] = useState("all");

  const nameOf = (id: string) => clients.records.find((c) => c.id === id)?.firstName ?? "—";
  const fullNameOf = (id: string) => {
    const c = clients.records.find((c) => c.id === id);
    return c ? fullName(c) : "—";
  };

  const rows = useMemo(
    () =>
      rounds.records
        .filter((r) => clientF === "all" || r.clientId === clientF)
        .slice()
        .sort((a, b) => (b.dateSent ?? "").localeCompare(a.dateSent ?? "")),
    [rounds.records, clientF],
  );

  const stats = useMemo(() => {
    const inProg = rounds.records.filter((r) => r.status === "investigating" || r.status === "sent").length;
    const done = rounds.records.filter((r) => r.status === "completed").length;
    const esc = rounds.records.filter((r) => r.status === "escalated").length;
    return { total: rounds.records.length, inProg, done, esc };
  }, [rounds.records]);

  function startRound() {
    const cid = clientF !== "all" ? clientF : clients.records[0]?.id;
    if (!cid) return;
    const next = (rounds.records.filter((r) => r.clientId === cid).reduce((m, r) => Math.max(m, r.roundNumber), 0) || 0) + 1;
    rounds.add({
      clientId: cid,
      roundNumber: next,
      bureau: "All",
      dateSent: new Date().toISOString().slice(0, 10),
      status: "drafted",
      result: "",
    } as Omit<DisputeRound & Row, "id">);
  }

  return (
    <div>
      <PageHeader
        icon={<ListChecks className="h-5 w-5" />}
        title="Round Tracking"
        description="Every dispute round across all clients — bureau, date sent, status, and result."
        actions={
          <Button size="sm" onClick={startRound}>
            <Plus className="h-4 w-4" /> Start Round
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Rounds", value: stats.total },
          { label: "In Progress", value: stats.inProg },
          { label: "Completed", value: stats.done },
          { label: "Escalated", value: stats.esc },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex">
        <Select value={clientF} onValueChange={setClientF}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clients.records.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {fullName(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="min-w-[140px]">
              <p className="text-sm font-semibold">{fullNameOf(r.clientId)}</p>
              <p className="text-xs text-muted-foreground">Round {r.roundNumber} · {r.bureau}</p>
            </div>
            <div className="text-xs text-muted-foreground">Sent {r.dateSent ?? "—"}</div>
            <p className="min-w-0 flex-1 truncate text-xs text-foreground/80">{r.result || "No result logged yet."}</p>
            <select
              value={r.bureau}
              onChange={(e) => rounds.update(r.id, { bureau: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-gold/50"
            >
              {["All", ...BUREAUS].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={r.status}
              onChange={(e) => rounds.update(r.id, { status: e.target.value as RoundStatus })}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-gold/50"
            >
              {ROUND_STATUS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
            <Badge variant={variant[r.status]} className="capitalize">
              {r.status}
            </Badge>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-xs text-muted-foreground">
            No rounds yet. Click <span className="text-gold">Start Round</span>.
          </p>
        )}
      </div>
    </div>
  );
}
