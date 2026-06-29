"use client";

import { FileText, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { CONTRACT_SEED, CONTRACT_STATUS, type Contract } from "@/lib/ops/data";

const statusVariant: Record<string, "muted" | "secondary" | "success" | "destructive"> = {
  template: "muted",
  sent: "secondary",
  signed: "success",
  expired: "destructive",
};

export default function ContractsPage() {
  const contracts = useCollection<Contract>("contracts", CONTRACT_SEED);

  return (
    <div>
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Contracts & Compliance"
        description="Agreement hub — templates, provider links (JotForm / DisputeFox), and signed-status tracking."
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2">Agreement</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Link</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.records.map((c) => (
              <tr key={c.id} className="border-b border-border/60 hover:bg-secondary/30">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{c.type}</td>
                <td className="px-3 py-2">{c.provider}</td>
                <td className="px-3 py-2">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:opacity-80">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <input
                      placeholder="Paste form/contract URL"
                      defaultValue=""
                      onBlur={(e) => e.target.value && contracts.update(c.id, { url: e.target.value })}
                      className="w-44 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-gold/50"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={c.status}
                      onChange={(e) => contracts.update(c.id, { status: e.target.value })}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs capitalize outline-none focus:border-gold/50"
                    >
                      {CONTRACT_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Badge variant={statusVariant[c.status]} className="capitalize">
                      {c.status}
                    </Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        E-signing stays in JotForm / DisputeFox; this hub tracks which agreement each client has and its signed status.
      </p>
    </div>
  );
}
