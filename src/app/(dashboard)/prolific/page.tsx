"use client";

import { useMemo, useState } from "react";
import { Workflow, Check, ChevronRight, Sparkles, Target } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { cn } from "@/lib/utils";

import {
  CLIENT_SEED,
  REPORT_SEED,
  NEGATIVE_SEED,
  INQUIRY_SEED,
  UTILIZATION_SEED,
} from "@/lib/credit/data";
import {
  type Client,
  type CreditReport,
  type NegativeAccount,
  type Inquiry,
  type CreditUtilization,
  fullName,
} from "@/lib/credit/types";
import { diagnose, fundingReadiness } from "@/lib/credit/engine";

import { INTAKE_QUESTIONS, PHASES } from "@/lib/prolific/data";
import { PHASE_ORDER, type Journey, type Phase } from "@/lib/prolific/types";
import { placePhase, buildPlan, nextMove, signalsFromCredit } from "@/lib/prolific/engine";

const PILLAR_CLASS: Record<string, string> = {
  Credit: "text-sky-300",
  Structure: "text-violet-300",
  Capital: "text-gold",
  Growth: "text-emerald-300",
};

export default function ProlificMethodPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const reports = useCollection<CreditReport & Row>("credit_reports", REPORT_SEED as (CreditReport & Row)[]);
  const negatives = useCollection<NegativeAccount & Row>("negative_accounts", NEGATIVE_SEED as (NegativeAccount & Row)[]);
  const inquiries = useCollection<Inquiry & Row>("inquiries", INQUIRY_SEED as (Inquiry & Row)[]);
  const utilization = useCollection<CreditUtilization & Row>("credit_utilization", UTILIZATION_SEED as (CreditUtilization & Row)[]);
  const journeys = useCollection<Journey & Row>("prolific_journeys", []);

  const [selectedId, setSelectedId] = useState<string | null>(CLIENT_SEED[0]?.id ?? null);
  const client = clients.records.find((c) => c.id === selectedId) ?? null;
  const journey = journeys.records.find((j) => j.clientId === selectedId) ?? null;

  // Real credit signals from the client's imported data.
  const signals = useMemo(() => {
    if (!client) return undefined;
    const report = reports.records.find((r) => r.clientId === client.id);
    const negs = negatives.records.filter((n) => n.clientId === client.id);
    const qs = inquiries.records.filter((q) => q.clientId === client.id);
    const util = utilization.records.find((u) => u.clientId === client.id);
    if (!report) return signalsFromCredit(null, null, false);
    const diag = diagnose(report, negs, qs);
    const avg = Math.round(
      [report.experianScore, report.equifaxScore, report.transunionScore]
        .filter((n): n is number => !!n)
        .reduce((a, b, _, arr) => a + b / arr.length, 0),
    );
    const funding = fundingReadiness(avg, util?.utilizationPct, qs.length, negs);
    return signalsFromCredit(diag, funding, true);
  }, [client, reports.records, negatives.records, inquiries.records, utilization.records]);

  const intake = journey?.intake ?? {};
  const autoPhase = useMemo(() => placePhase(intake, signals), [intake, signals]);
  const currentPhase: Phase = (journey?.manualPhase as Phase) || autoPhase;
  const plan = useMemo(() => buildPlan(currentPhase), [currentPhase]);
  const goal = intake.goal ?? "";

  const completed = journey?.completedSteps ?? [];
  const totalSteps = plan.reduce((n, p) => n + p.steps.length, 0);
  const progressPct = totalSteps ? Math.round((completed.length / totalSteps) * 100) : 0;

  /* ── mutations (get-or-create journey per client) ── */
  function ensureJourney(): Journey & Row {
    if (journey) return journey;
    return journeys.add({
      clientId: selectedId!,
      intake: {},
      phase: autoPhase,
      manualPhase: "",
      completedSteps: [],
    } as Omit<Journey & Row, "id">) as Journey & Row;
  }
  function setAnswer(key: string, value: string) {
    const j = ensureJourney();
    journeys.update(j.id, { intake: { ...j.intake, [key]: value }, phase: placePhase({ ...j.intake, [key]: value }, signals) });
  }
  function setManualPhase(p: string) {
    const j = ensureJourney();
    journeys.update(j.id, { manualPhase: p === "auto" ? "" : (p as Phase) });
  }
  function toggleStep(key: string) {
    const j = ensureJourney();
    const cur = j.completedSteps ?? [];
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    journeys.update(j.id, { completedSteps: next });
  }

  return (
    <div>
      <PageHeader
        icon={<Workflow className="h-5 w-5" />}
        title="The Prolific Method"
        description="Credit → Structure → Capital → Growth. Diagnose a client, auto-place them in one of 7 phases, and generate their full transformation plan."
        actions={
          <Select value={selectedId ?? ""} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.records.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {fullName(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {!client ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Select a client to run the Prolific Method.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Phase stepper */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{fullName(client)} · Journey</p>
              <span className="text-xs text-muted-foreground">{progressPct}% of plan complete</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {PHASE_ORDER.map((id) => {
                const meta = PHASES.find((p) => p.id === id)!;
                const idx = PHASE_ORDER.indexOf(id);
                const curIdx = PHASE_ORDER.indexOf(currentPhase);
                const state = idx < curIdx ? "done" : idx === curIdx ? "current" : "upcoming";
                return (
                  <div
                    key={id}
                    className={cn(
                      "rounded-lg border p-2 text-center",
                      state === "current" && "border-gold/50 bg-gold/10",
                      state === "done" && "border-success/40 bg-success/5",
                      state === "upcoming" && "border-border bg-background/40",
                    )}
                  >
                    <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full border border-current text-[11px] font-bold">
                      {state === "done" ? <Check className="h-3.5 w-3.5 text-success" /> : meta.n}
                    </div>
                    <p className="text-[11px] font-semibold leading-tight">{meta.name}</p>
                    <p className={cn("text-[9px] uppercase tracking-wide", PILLAR_CLASS[meta.pillar])}>{meta.pillar}</p>
                  </div>
                );
              })}
            </div>
            <Progress value={progressPct} className="mt-3" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Diagnostic intake */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-gold" /> Diagnostic Intake
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Blank answers fall back to the client&apos;s live credit data.
              </p>
              <div className="space-y-2.5">
                {INTAKE_QUESTIONS.map((q) => (
                  <div key={q.key} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground/90">{q.label}</span>
                    {q.type === "select" ? (
                      <select
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-gold/50"
                        value={intake[q.key] ?? ""}
                        onChange={(e) => setAnswer(q.key, e.target.value)}
                      >
                        <option value="">—</option>
                        {q.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-1">
                        {["yes", "no"].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAnswer(q.key, v)}
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-xs capitalize",
                              intake[q.key] === v
                                ? "border-gold/50 bg-gold/15 text-gold"
                                : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Placement + next move */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gold">
                  <Sparkles className="h-3.5 w-3.5" /> Auto Placement
                </p>
                <p className="text-lg font-bold">
                  Phase {PHASE_ORDER.indexOf(currentPhase) + 1} · {PHASES.find((p) => p.id === currentPhase)!.name}
                </p>
                <p className="mt-1 text-sm text-foreground/90">{nextMove(currentPhase, goal)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Override:</span>
                  <Select value={journey?.manualPhase || "auto"} onValueChange={setManualPhase}>
                    <SelectTrigger className="h-7 w-44 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto ({PHASES.find((p) => p.id === autoPhase)!.name})</SelectItem>
                      {PHASES.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.n}. {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current phase deliverables */}
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-2 text-sm font-semibold">
                  Current Phase Plan · {PHASES.find((p) => p.id === currentPhase)!.name}
                </p>
                <div className="space-y-1.5">
                  {(plan.find((p) => p.phase === currentPhase)?.steps ?? []).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => toggleStep(s.key)}
                      className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-secondary/30"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          completed.includes(s.key) ? "border-success bg-success/20 text-success" : "border-border",
                        )}
                      >
                        {completed.includes(s.key) && <Check className="h-3 w-3" />}
                      </span>
                      <span className={cn(completed.includes(s.key) && "text-muted-foreground line-through")}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full plan across all phases */}
          <div>
            <p className="mb-3 text-sm font-semibold">Full Transformation Plan</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {plan.map((p) => (
                <div
                  key={p.phase}
                  className={cn(
                    "rounded-xl border bg-card p-4",
                    p.state === "current" ? "border-gold/40" : "border-border",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold">
                      {p.meta.n}. {p.meta.name}
                    </p>
                    <Badge
                      variant={p.state === "done" ? "success" : p.state === "current" ? "default" : "muted"}
                      className="capitalize"
                    >
                      {p.state}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">{p.meta.summary}</p>
                  <ul className="space-y-1">
                    {p.steps.map((s) => (
                      <li key={s.key} className="flex items-start gap-1.5 text-xs">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                        <span className={cn(completed.includes(s.key) && "text-muted-foreground line-through")}>{s.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
