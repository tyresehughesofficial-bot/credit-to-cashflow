"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Activity,
  Stethoscope,
  ListChecks,
  Gavel,
  Sparkles,
  X,
  Loader2,
  Download,
  Landmark,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { initials, cn } from "@/lib/utils";
import {
  CLIENT_SEED,
  REPORT_SEED,
  NEGATIVE_SEED,
  INQUIRY_SEED,
  ROUND_SEED,
  UTILIZATION_SEED,
  PUBLIC_RECORD_SEED,
  PERSONAL_INFO_SEED,
} from "@/lib/credit/data";
import {
  type Client,
  type CreditReport,
  type CreditUtilization,
  type NegativeAccount,
  type Inquiry,
  type DisputeRound,
  type PublicRecord,
  type PersonalInformation,
  type ClientStatus,
  type RoundStatus,
  CLIENT_STATUSES,
  fullName,
} from "@/lib/credit/types";
import {
  diagnose,
  actionPlan,
  disputeStrategy,
  recommendations,
  fundingReadiness,
} from "@/lib/credit/engine";
import { importClient, type ImportResult } from "@/lib/credit/myfreescorenow";

const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-gold/50";

const statusVariant: Record<ClientStatus, "default" | "secondary" | "success" | "warning" | "muted"> = {
  lead: "muted",
  imported: "secondary",
  analyzing: "warning",
  active: "default",
  disputing: "warning",
  funding_ready: "success",
  graduated: "success",
  paused: "muted",
};

const bandVariant: Record<string, "success" | "default" | "warning" | "destructive"> = {
  Excellent: "success",
  Good: "success",
  Fair: "default",
  Poor: "warning",
  Critical: "destructive",
};

const roundVariant: Record<RoundStatus, "muted" | "secondary" | "warning" | "success" | "default"> = {
  drafted: "muted",
  sent: "secondary",
  investigating: "warning",
  completed: "success",
  escalated: "default",
};

export default function ClientCommandCenter() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const reports = useCollection<CreditReport & Row>("credit_reports", REPORT_SEED as (CreditReport & Row)[]);
  const negatives = useCollection<NegativeAccount & Row>("negative_accounts", NEGATIVE_SEED as (NegativeAccount & Row)[]);
  const inquiries = useCollection<Inquiry & Row>("inquiries", INQUIRY_SEED as (Inquiry & Row)[]);
  const rounds = useCollection<DisputeRound & Row>("dispute_rounds", ROUND_SEED as (DisputeRound & Row)[]);
  const utilization = useCollection<CreditUtilization & Row>("credit_utilization", UTILIZATION_SEED as (CreditUtilization & Row)[]);
  const publicRecords = useCollection<PublicRecord & Row>("public_records", PUBLIC_RECORD_SEED as (PublicRecord & Row)[]);
  const personalInfo = useCollection<PersonalInformation & Row>("personal_information", PERSONAL_INFO_SEED as (PersonalInformation & Row)[]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(CLIENT_SEED[0]?.id ?? null);
  const [importing, setImporting] = useState(false);
  const [lastImport, setLastImport] = useState<ImportResult | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return clients.records.filter((c) => {
      const name = fullName(c).toLowerCase();
      const matchesQ = !q || name.includes(q) || (c.email ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [clients.records, query, statusFilter]);

  const selected = clients.records.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Client Command Center"
        description="Operational HQ — import from MyFreeScoreNow, read & analyze the tri-bureau report, diagnose health, generate the action plan & dispute strategy, and track every round."
        actions={
          <Button size="sm" onClick={() => setImporting(true)}>
            <UserPlus className="h-4 w-4" /> Import Client
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CLIENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        {/* Client list */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-3">
            <p className="text-[13px] font-semibold">
              Clients <span className="text-muted-foreground">({filtered.length})</span>
            </p>
          </div>
          <div className="divide-y divide-border/60">
            {filtered.map((c) => {
              const report = reports.records.find((r) => r.clientId === c.id);
              const avg = report
                ? Math.round(
                    [report.experianScore, report.equifaxScore, report.transunionScore]
                      .filter((n): n is number => !!n)
                      .reduce((a, b, _, arr) => a + b / arr.length, 0),
                  )
                : null;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary/30",
                    selectedId === c.id && "bg-gold/5",
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(fullName(c))}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{fullName(c)}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email || c.phone || "—"}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusVariant[c.status]} className="capitalize">
                      {c.status.replace("_", " ")}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{avg ? `Avg ${avg}` : "No report"} · R{c.round}</p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                No clients. Click <span className="text-gold">Import Client</span>.
              </p>
            )}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <ClientDetail
            client={selected}
            report={reports.records.find((r) => r.clientId === selected.id)}
            negatives={negatives.records.filter((n) => n.clientId === selected.id)}
            inquiries={inquiries.records.filter((q) => q.clientId === selected.id)}
            rounds={rounds.records.filter((r) => r.clientId === selected.id)}
            utilization={utilization.records.find((u) => u.clientId === selected.id)}
            publicRecords={publicRecords.records.filter((p) => p.clientId === selected.id)}
            personalInfo={personalInfo.records.filter((p) => p.clientId === selected.id)}
            onAddRound={(r) => rounds.add(r)}
            onUpdateClient={(patch) => clients.update(selected.id, patch)}
          />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12 text-sm text-muted-foreground">
            Select a client to open their command profile.
          </div>
        )}
      </div>

      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImport={async (form) => {
            const res = await importClient(form);
            setSelectedId(res.clientId);
            setLastImport(res);
            setImporting(false);
          }}
        />
      )}

      {lastImport && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-gold/30 bg-card p-4 shadow-gold">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Imported from MyFreeScoreNow{" "}
                <Badge variant={lastImport.mode === "live" ? "success" : "secondary"} className="ml-1 align-middle">
                  {lastImport.mode}
                </Badge>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lastImport.counts.negatives} negatives · {lastImport.counts.inquiries} inquiries ·{" "}
                {lastImport.counts.publicRecords} public records · {lastImport.counts.personalInfo} PII items
              </p>
              {lastImport.mode === "demo" && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Demo data — set <span className="text-gold">MFSN_API_KEY</span> to pull live reports.
                </p>
              )}
            </div>
            <button onClick={() => setLastImport(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Client detail ───────────────────────── */

function ClientDetail({
  client,
  report,
  negatives,
  inquiries,
  rounds,
  utilization,
  publicRecords,
  personalInfo,
  onAddRound,
  onUpdateClient,
}: {
  client: Client & Row;
  report?: CreditReport;
  negatives: NegativeAccount[];
  inquiries: Inquiry[];
  rounds: DisputeRound[];
  utilization?: CreditUtilization;
  publicRecords: PublicRecord[];
  personalInfo: PersonalInformation[];
  onAddRound: (r: Omit<DisputeRound, "id">) => void;
  onUpdateClient: (patch: Partial<Client>) => void;
}) {
  const diag = useMemo(() => diagnose(report, negatives, inquiries), [report, negatives, inquiries]);
  const plan = useMemo(() => actionPlan(diag, negatives), [diag, negatives]);
  const strategy = useMemo(() => disputeStrategy(negatives), [negatives]);
  const recs = useMemo(() => recommendations(diag, negatives, inquiries), [diag, negatives, inquiries]);

  const scores: { bureau: string; score?: number }[] = [
    { bureau: "Experian", score: report?.experianScore },
    { bureau: "Equifax", score: report?.equifaxScore },
    { bureau: "TransUnion", score: report?.transunionScore },
  ];
  const avg = useMemo(() => {
    const xs = scores.map((s) => s.score).filter((n): n is number => !!n);
    return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
  }, [scores]);
  const funding = useMemo(
    () => fundingReadiness(avg, utilization?.utilizationPct, inquiries.length, negatives),
    [avg, utilization, inquiries, negatives],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials(fullName(client))}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{fullName(client)}</h2>
              {client.source && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {client.source === "myfreescorenow" ? "MyFreeScoreNow" : client.source}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {client.phone || "—"} · {client.email || "—"}
              {client.myfreescorenowId && <> · ID {client.myfreescorenowId}</>}
            </p>
          </div>
        </div>
        <Select value={client.status} onValueChange={(v) => onUpdateClient({ status: v as ClientStatus })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CLIENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* score row */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scores.map((s) => (
          <div key={s.bureau} className="rounded-lg border border-border bg-background/40 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.bureau}</p>
            <p className="mt-1 text-xl font-extrabold text-gold">{s.score ?? "—"}</p>
          </div>
        ))}
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-gold">Health</p>
          <p className="mt-1 text-xl font-extrabold">{diag.healthScore}</p>
        </div>
      </div>

      {/* utilization + funding row */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Utilization</p>
          <p className={cn("mt-1 text-xl font-extrabold", (utilization?.utilizationPct ?? 0) > 30 ? "text-destructive" : "text-success")}>
            {utilization ? `${utilization.utilizationPct}%` : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Negatives</p>
          <p className="mt-1 text-xl font-extrabold">{negatives.filter((n) => n.status !== "deleted").length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Inquiries</p>
          <p className="mt-1 text-xl font-extrabold">{inquiries.length}</p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-3 text-center",
            funding.band === "Funding Ready"
              ? "border-success/40 bg-success/5"
              : funding.band === "Almost Ready"
                ? "border-warning/40 bg-warning/5"
                : "border-border bg-background/40",
          )}
        >
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Funding</p>
          <p className="mt-1 text-sm font-bold">{funding.band}</p>
        </div>
      </div>

      <Tabs defaultValue="diagnosis">
        <TabsList className="flex-wrap">
          <TabsTrigger value="diagnosis">
            <Stethoscope className="mr-1.5 h-3.5 w-3.5" /> Diagnosis
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Activity className="mr-1.5 h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="plan">
            <ListChecks className="mr-1.5 h-3.5 w-3.5" /> Action Plan
          </TabsTrigger>
          <TabsTrigger value="strategy">
            <Gavel className="mr-1.5 h-3.5 w-3.5" /> Strategy
          </TabsTrigger>
          <TabsTrigger value="funding">
            <Landmark className="mr-1.5 h-3.5 w-3.5" /> Funding
          </TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
        </TabsList>

        {/* DIAGNOSIS */}
        <TabsContent value="diagnosis" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={bandVariant[diag.healthBand]} className="text-sm">
              {diag.healthBand}
            </Badge>
            <Badge variant={diag.priority === "Critical" || diag.priority === "High" ? "destructive" : "secondary"}>
              {diag.priority} priority
            </Badge>
            <span className="text-sm text-muted-foreground">Health score {diag.healthScore}/100</span>
          </div>
          <Progress value={diag.healthScore} />
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gold">
              <Sparkles className="h-3.5 w-3.5" /> AI Diagnosis
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">{diag.summary}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Main Problems</p>
            <ul className="space-y-1.5">
              {diag.problems.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">AI Recommendations</p>
            <ul className="space-y-1.5">
              {recs.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        {/* PROFILE */}
        <TabsContent value="profile" className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold">Negative Accounts ({negatives.length})</p>
            <div className="space-y-2">
              {negatives.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {negatives.map((n) => (
                <div key={n.id} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{n.creditor}</p>
                    <Badge
                      variant={n.status === "deleted" || n.status === "paid" ? "success" : n.status === "verified" ? "destructive" : "warning"}
                      className="capitalize"
                    >
                      {n.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {String(n.accountType).replace("_", " ")} · {n.bureau} · ${Number(n.balance).toLocaleString()}
                  </p>
                  {n.remarks && <p className="mt-1 text-xs text-foreground/70">{n.remarks}</p>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Hard Inquiries ({inquiries.length})</p>
            <div className="space-y-2">
              {inquiries.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {inquiries.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <p className="text-sm font-medium">{q.creditor}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.bureau} · {q.inquiryDate ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {utilization && (
            <div>
              <p className="mb-2 text-sm font-semibold">Utilization</p>
              <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${Number(utilization.totalBalance).toLocaleString()} / ${Number(utilization.totalLimit).toLocaleString()}
                  </span>
                  <span className={cn("font-semibold", utilization.utilizationPct > 30 ? "text-destructive" : "text-success")}>
                    {utilization.utilizationPct}%
                  </span>
                </div>
                <Progress value={Math.min(100, utilization.utilizationPct)} className="mt-2" />
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold">Public Records ({publicRecords.length})</p>
            <div className="space-y-2">
              {publicRecords.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {publicRecords.map((p) => (
                <div key={p.id} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize">{p.recordType}</p>
                    <Badge variant="warning" className="capitalize">
                      {p.status || "open"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.bureau} · ${Number(p.amount).toLocaleString()} · filed {p.filedDate ?? "—"}
                    {p.reference && <> · {p.reference}</>}
                  </p>
                  {p.remarks && <p className="mt-1 text-xs text-foreground/70">{p.remarks}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Personal Information ({personalInfo.length})</p>
            <div className="space-y-2">
              {personalInfo.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {personalInfo.map((pi) => (
                <div key={pi.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{pi.value}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {pi.infoType}
                      {pi.bureau && <> · {pi.bureau}</>}
                    </p>
                  </div>
                  <Badge variant={pi.status === "unauthorized" || pi.status === "old" ? "warning" : "muted"} className="capitalize">
                    {pi.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ACTION PLAN */}
        <TabsContent value="plan" className="space-y-4">
          {([
            ["Immediate", plan.immediate],
            ["Short-Term", plan.shortTerm],
            ["Long-Term", plan.longTerm],
          ] as const).map(([label, items]) => (
            <div key={label} className="rounded-lg border border-border bg-background/40 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gold">{label}</p>
              <ul className="space-y-1.5">
                {items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabsContent>

        {/* STRATEGY */}
        <TabsContent value="strategy" className="space-y-4">
          {([
            ["Round 1 — Factual & Validation", strategy.round1],
            ["Round 2 — Method of Verification", strategy.round2],
            ["Round 3 — Procedural & Furnisher", strategy.round3],
            ["CFPB & Legal Escalation", strategy.cfpbEscalation],
          ] as const).map(([label, items]) => (
            <div key={label} className="rounded-lg border border-border bg-background/40 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gold">{label}</p>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="flex gap-3">
                    <Badge variant="secondary" className="h-fit shrink-0">
                      {it.label}
                    </Badge>
                    <p className="text-sm text-foreground/90">{it.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* FUNDING READINESS */}
        <TabsContent value="funding" className="space-y-4">
          <div
            className={cn(
              "rounded-lg border p-4",
              funding.band === "Funding Ready"
                ? "border-success/40 bg-success/5"
                : funding.band === "Almost Ready"
                  ? "border-warning/40 bg-warning/5"
                  : "border-destructive/40 bg-destructive/5",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Funding Readiness</p>
              <Badge
                variant={funding.band === "Funding Ready" ? "success" : funding.band === "Almost Ready" ? "warning" : "destructive"}
              >
                {funding.band}
              </Badge>
            </div>
            <Progress value={funding.score} className="mt-3" />
            <p className="mt-1 text-right text-xs text-muted-foreground">{funding.score}% of approval factors met</p>
          </div>
          <div className="space-y-2">
            {funding.factors.map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  {f.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{f.detail}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gold/20 bg-gold/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">Recommended Path</p>
            <p className="mt-1 text-sm">{funding.recommendedPath}</p>
          </div>
        </TabsContent>

        {/* ROUNDS */}
        <TabsContent value="rounds">
          <RoundTracker clientId={client.id} rounds={rounds} onAddRound={onAddRound} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ───────────────────────── Round tracker ───────────────────────── */

function RoundTracker({
  clientId,
  rounds,
  onAddRound,
}: {
  clientId: string;
  rounds: DisputeRound[];
  onAddRound: (r: Omit<DisputeRound, "id">) => void;
}) {
  const next = (rounds.reduce((m, r) => Math.max(m, r.roundNumber), 0) || 0) + 1;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Dispute Rounds ({rounds.length})</p>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() =>
            onAddRound({
              clientId,
              roundNumber: next,
              bureau: "All",
              dateSent: new Date().toISOString().slice(0, 10),
              status: "drafted",
              result: "",
            })
          }
        >
          <Download className="h-3.5 w-3.5 rotate-180" /> Start Round {next}
        </Button>
      </div>
      <div className="space-y-2">
        {rounds.length === 0 && <p className="text-xs text-muted-foreground">No rounds yet.</p>}
        {[...rounds]
          .sort((a, b) => a.roundNumber - b.roundNumber)
          .map((r) => (
            <div key={r.id} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  Round {r.roundNumber} · {r.bureau}
                </p>
                <Badge variant={roundVariant[r.status]} className="capitalize">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Sent {r.dateSent ?? "—"}</p>
              {r.result && <p className="mt-1 text-xs text-foreground/80">{r.result}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Import dialog ───────────────────────── */

function ImportDialog({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (form: { firstName: string; lastName: string; email?: string; phone?: string; myfreescorenowId?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", myfreescorenowId: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-gold">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Import from MyFreeScoreNow</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Pulls the member&apos;s tri-bureau report, runs analysis, and seeds the command profile. Uses the live
          <span className="text-gold"> mfsn-import</span> Edge Function when configured, otherwise a demo import.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="First name" value={form.firstName} onChange={set("firstName")} />
            <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={set("lastName")} />
          </div>
          <input className={inputCls} placeholder="Email" value={form.email} onChange={set("email")} />
          <input className={inputCls} placeholder="Phone" value={form.phone} onChange={set("phone")} />
          <input
            className={inputCls}
            placeholder="MyFreeScoreNow member ID (optional)"
            value={form.myfreescorenowId}
            onChange={set("myfreescorenowId")}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={loading || !form.firstName.trim()}
            onClick={async () => {
              setLoading(true);
              await onImport(form);
              setLoading(false);
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Import & Analyze
          </Button>
        </div>
      </div>
    </div>
  );
}
