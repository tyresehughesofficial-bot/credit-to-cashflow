"use client";

import { useMemo, useState } from "react";
import { FileWarning } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { CLIENT_SEED, NEGATIVE_SEED } from "@/lib/credit/data";
import { type Client, type NegativeAccount, fullName } from "@/lib/credit/types";
import { disputeReason, negativePriority } from "@/lib/credit/engine";

const STATUS = ["open", "disputing", "deleted", "verified", "paid"];
const prioVariant: Record<string, "destructive" | "warning" | "secondary" | "muted"> = {
  Critical: "destructive",
  High: "warning",
  Medium: "secondary",
  Low: "muted",
};

export default function NegativeTrackingPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const negatives = useCollection<NegativeAccount & Row>("negative_accounts", NEGATIVE_SEED as (NegativeAccount & Row)[]);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("all");

  const nameOf = (id: string) => {
    const c = clients.records.find((c) => c.id === id);
    return c ? fullName(c) : "—";
  };

  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return negatives.records
      .filter((n) => statusF === "all" || n.status === statusF)
      .filter((n) => !needle || n.creditor.toLowerCase().includes(needle) || nameOf(n.clientId).toLowerCase().includes(needle))
      .map((n) => ({ ...n, priority: negativePriority(String(n.accountType)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negatives.records, clients.records, q, statusF]);

  const open = negatives.records.filter((n) => n.status !== "deleted" && n.status !== "paid").length;
  const deleted = negatives.records.filter((n) => n.status === "deleted").length;

  return (
    <div>
      <PageHeader
        icon={<FileWarning className="h-5 w-5" />}
        title="Negative Account Tracking"
        description="Every negative item across all clients — status, bureau, recommended dispute reason, and priority."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Items", value: negatives.records.length },
          { label: "Open / Active", value: open },
          { label: "Deleted", value: deleted },
          { label: "Removal Rate", value: negatives.records.length ? `${Math.round((deleted / negatives.records.length) * 100)}%` : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search creditor or client…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Creditor</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Bureau</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Recommended Reason</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id} className="border-b border-border/60 hover:bg-secondary/30">
                <td className="px-3 py-2 font-medium">{nameOf(n.clientId)}</td>
                <td className="px-3 py-2">{n.creditor}</td>
                <td className="px-3 py-2 capitalize">{String(n.accountType).replace("_", " ")}</td>
                <td className="px-3 py-2">{n.bureau}</td>
                <td className="px-3 py-2">${Number(n.balance).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <Badge variant={prioVariant[n.priority]}>{n.priority}</Badge>
                </td>
                <td className="max-w-[260px] px-3 py-2 text-xs text-muted-foreground">{disputeReason(String(n.accountType))}</td>
                <td className="px-3 py-2">
                  <select
                    value={String(n.status)}
                    onChange={(e) => negatives.update(n.id, { status: e.target.value })}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-gold/50"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No negative accounts match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
