"use client";

import { useMemo, useState } from "react";
import { Search, TrendingUp, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CLIENTS, DISPUTES, NEGATIVE_ACCOUNTS, userName } from "@/lib/data/mock";
import { initials, formatDate, cn } from "@/lib/utils";
import type { Client, ClientStage, DisputeStatus } from "@/types/database";

const stageVariant: Record<ClientStage, "default" | "secondary" | "success" | "warning" | "muted"> = {
  lead: "muted",
  consultation: "secondary",
  onboarding: "warning",
  active: "default",
  funding_ready: "success",
  graduated: "success",
  paused: "muted",
};

const disputeVariant: Record<DisputeStatus, "default" | "secondary" | "success" | "warning" | "destructive" | "muted"> = {
  drafted: "muted",
  sent: "secondary",
  investigating: "warning",
  deleted: "success",
  verified: "destructive",
  escalated: "default",
};

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [selectedId, setSelectedId] = useState<string>(CLIENTS[0].id);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return CLIENTS.filter((c) => {
      const matchesQ = !q || c.full_name.toLowerCase().includes(q) || (c.email ?? "").includes(q);
      const matchesStage = stage === "all" || c.stage === stage;
      return matchesQ && matchesStage;
    });
  }, [query, stage]);

  const selected = CLIENTS.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Client Command Center"
        description="Profiles, round tracking, bureau tracking, negative accounts, scores, and escalations."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {(["lead", "consultation", "onboarding", "active", "funding_ready", "graduated", "paused"] as ClientStage[]).map(
              (s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace("_", " ")}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Clients ({filtered.length})</CardTitle>
            <CardDescription>Select a client to view their command profile.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className={cn("cursor-pointer", selectedId === c.id && "bg-gold/5")}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(c.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stageVariant[c.stage]} className="capitalize">
                        {c.stage.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{c.current_score ?? "—"}</span>
                      {c.current_score && c.starting_score && (
                        <span className="ml-1 text-xs text-success">
                          +{c.current_score - c.starting_score}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {userName(c.assigned_to)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selected && <ClientDetail client={selected} />}
      </div>
    </div>
  );
}

function ClientDetail({ client }: { client: Client }) {
  const negatives = NEGATIVE_ACCOUNTS.filter((n) => n.client_id === client.id);
  const disputes = DISPUTES.filter((d) => d.client_id === client.id);
  const escalations = disputes.filter((d) => d.status === "escalated" || d.status === "verified");

  const scoreProgress =
    client.current_score && client.starting_score && client.target_score
      ? Math.min(
          100,
          Math.round(
            ((client.current_score - client.starting_score) /
              (client.target_score - client.starting_score)) *
              100,
          ),
        )
      : 0;

  const bureaus = ["Equifax", "Experian", "TransUnion"] as const;

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials(client.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{client.full_name}</CardTitle>
            <CardDescription>
              {client.phone} · enrolled {client.enrolled_at ? formatDate(client.enrolled_at) : "—"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {client.goal && (
          <div className="rounded-lg border border-gold/20 bg-gold/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">Goal</p>
            <p className="mt-1 text-sm">{client.goal}</p>
          </div>
        )}

        {/* Score tracking */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-gold" /> Score Progress
            </p>
            <span className="text-xs text-muted-foreground">
              {client.starting_score} → <span className="text-foreground">{client.current_score}</span> /{" "}
              {client.target_score}
            </span>
          </div>
          <Progress value={scoreProgress} />
          <p className="mt-1 text-right text-xs text-muted-foreground">{scoreProgress}% to target</p>
        </div>

        {/* Bureau tracking */}
        <div>
          <p className="mb-2 text-sm font-semibold">Bureau Tracking</p>
          <div className="grid grid-cols-3 gap-2">
            {bureaus.map((b) => {
              const open = disputes.filter((d) => d.bureau === b && d.status !== "deleted").length;
              const deleted = disputes.filter((d) => d.bureau === b && d.status === "deleted").length;
              return (
                <div key={b} className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">{b}</p>
                  <p className="mt-1 text-sm font-semibold text-gold">{open} open</p>
                  <p className="text-[10px] text-success">{deleted} deleted</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round / dispute tracking */}
        <div>
          <p className="mb-2 text-sm font-semibold">Dispute Rounds</p>
          <div className="space-y-2">
            {disputes.length === 0 && (
              <p className="text-xs text-muted-foreground">No disputes yet.</p>
            )}
            {disputes.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {d.bureau} · Round {d.round}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{d.strategy}</p>
                </div>
                <Badge variant={disputeVariant[d.status]} className="capitalize">
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Negative accounts */}
        <div>
          <p className="mb-2 text-sm font-semibold">Negative Accounts ({negatives.length})</p>
          <div className="space-y-2">
            {negatives.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.creditor}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {n.type.replace("_", " ")} · {n.bureau} · ${n.balance.toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={n.status === "deleted" ? "success" : n.status === "verified" ? "destructive" : "warning"}
                  className="capitalize"
                >
                  {n.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation tracking */}
        {escalations.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
              Escalations ({escalations.length})
            </p>
            {escalations.map((e) => (
              <p key={e.id} className="mt-1 text-sm">
                {e.bureau} R{e.round} — {e.strategy}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
