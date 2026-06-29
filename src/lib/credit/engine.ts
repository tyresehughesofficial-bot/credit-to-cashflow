/**
 * AI CREDIT ENGINE (deterministic core).
 *
 * Production-ready local intelligence: every function is pure and runs instantly
 * in the browser, so the Command Center is fully operational with zero backend.
 * The signatures are designed so a live model (Claude via the `credit-analyze`
 * Edge Function) can be swapped in behind the same call sites later — see
 * `analyzeWithAI()` at the bottom for the seam.
 */
import type {
  CreditReport,
  HealthBand,
  Inquiry,
  NegativeAccount,
  PriorityLevel,
} from "./types";

export interface DiagnosisResult {
  healthScore: number; // 0–100
  healthBand: HealthBand;
  priority: PriorityLevel;
  problems: string[];
  summary: string;
}

export interface ActionPlan {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

export interface StrategyItem {
  label: string;
  detail: string;
}
export interface DisputeStrategy {
  round1: StrategyItem[];
  round2: StrategyItem[];
  round3: StrategyItem[];
  cfpbEscalation: StrategyItem[];
}

const avgScore = (r?: CreditReport): number => {
  if (!r) return 0;
  const xs = [r.experianScore, r.equifaxScore, r.transunionScore].filter(
    (n): n is number => typeof n === "number" && n > 0,
  );
  if (!xs.length) return 0;
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
};

const bandForScore = (s: number): HealthBand => {
  if (s >= 740) return "Excellent";
  if (s >= 670) return "Good";
  if (s >= 580) return "Fair";
  if (s >= 500) return "Poor";
  return "Critical";
};

/** Health diagnosis from a report + the client's negatives/inquiries. */
export function diagnose(
  report: CreditReport | undefined,
  negatives: NegativeAccount[],
  inquiries: Inquiry[],
): DiagnosisResult {
  const avg = avgScore(report);
  const open = negatives.filter((n) => n.status !== "deleted" && n.status !== "paid");
  const problems: string[] = [];

  // Score → base health.
  let health = avg ? Math.max(0, Math.min(100, Math.round(((avg - 300) / 550) * 100))) : 30;

  // Negative-item penalties.
  const byType = (t: string) => open.filter((n) => n.accountType === t).length;
  const collections = byType("collection");
  const chargeOffs = byType("charge_off");
  const repos = byType("repossession");
  const publics = byType("public_record") + byType("bankruptcy");
  const medical = byType("medical");
  const lates = byType("late_payment");

  health -= collections * 6 + chargeOffs * 8 + repos * 10 + publics * 12 + medical * 3 + lates * 2;
  health -= Math.max(0, inquiries.length - 2) * 2; // excess hard inquiries
  health = Math.max(0, Math.min(100, Math.round(health)));

  if (collections) problems.push(`${collections} collection account${collections > 1 ? "s" : ""} reporting`);
  if (chargeOffs) problems.push(`${chargeOffs} charge-off${chargeOffs > 1 ? "s" : ""} (audit balance/status accuracy)`);
  if (repos) problems.push(`${repos} repossession${repos > 1 ? "s" : ""} — challenge deficiency accounting`);
  if (publics) problems.push(`${publics} public record/bankruptcy item${publics > 1 ? "s" : ""}`);
  if (medical) problems.push(`${medical} medical collection${medical > 1 ? "s" : ""} (likely removable)`);
  if (lates) problems.push(`${lates} late-payment item${lates > 1 ? "s" : ""}`);
  if (inquiries.length > 4) problems.push(`${inquiries.length} hard inquiries suppressing score`);
  if (!problems.length) problems.push("No major derogatories — focus on optimization and aging.");

  const band = bandForScore(avg || 0);
  const priority: PriorityLevel =
    health < 35 ? "Critical" : health < 55 ? "High" : health < 75 ? "Medium" : "Low";

  const summary =
    `Tri-bureau average ${avg || "—"} (${band}). ` +
    `${open.length} active derogatory item${open.length === 1 ? "" : "s"} and ${inquiries.length} hard inquir${
      inquiries.length === 1 ? "y" : "ies"
    }. ` +
    (priority === "Critical" || priority === "High"
      ? "Aggressive dispute + escalation track recommended."
      : "Targeted cleanup and optimization track recommended.");

  return { healthScore: health, healthBand: band, priority, problems, summary };
}

/** Immediate / short-term / long-term action plan. */
export function actionPlan(diag: DiagnosisResult, negatives: NegativeAccount[]): ActionPlan {
  const hasMedical = negatives.some((n) => n.accountType === "medical" && n.status !== "deleted");
  const hasCollections = negatives.some((n) => n.accountType === "collection" && n.status !== "deleted");

  const immediate = [
    "Clean personal information first (addresses, names, employers) to prevent mixed-file re-insertions.",
    hasCollections
      ? "Send debt-validation letters to all third-party collectors (FDCPA §809)."
      : "Pull all three bureau reports and confirm data consistency.",
    diag.priority === "Critical" || diag.priority === "High"
      ? "Open Round 1 bureau disputes on the highest-impact derogatories by certified mail."
      : "Identify quick-win inaccuracies for Round 1.",
  ];
  if (hasMedical) immediate.push("Challenge sub-$500 / paid medical collections — removable under current policy.");

  const shortTerm = [
    "Track 30-day investigation windows; demand Method of Verification on anything 'verified'.",
    "Reduce revolving utilization below 30% (ideally <10%) before the next report pull.",
    "Add a positive tradeline / secured card if the file is thin.",
    "Escalate unresolved items to Round 2 with procedural-dispute language.",
  ];

  const longTerm = [
    "Build payment history depth (12+ months on-time) to lift the score band.",
    "Age accounts and keep oldest tradelines open to grow average age.",
    "Graduate to funding-readiness once derogatories are cleared and utilization is optimized.",
    "Quarterly monitoring to catch re-insertions and new inquiries.",
  ];

  return { immediate, shortTerm, longTerm };
}

/** Round 1/2/3 + CFPB escalation strategy tailored to the negatives present. */
export function disputeStrategy(negatives: NegativeAccount[]): DisputeStrategy {
  const open = negatives.filter((n) => n.status !== "deleted" && n.status !== "paid");
  const has = (t: string) => open.some((n) => n.accountType === t);

  const round1: StrategyItem[] = [
    { label: "Personal Info", detail: "Remove unauthorized addresses, names, and employers across all three bureaus." },
    { label: "Factual Disputes", detail: "Dispute clearly inaccurate items (wrong balances, dates, duplicates) by certified mail." },
  ];
  if (has("collection")) round1.push({ label: "Collections", detail: "Debt-validation demand to collectors; dispute as unverified with bureaus." });
  if (has("medical")) round1.push({ label: "Medical", detail: "Challenge sub-$500/paid medical collections for deletion." });
  if (has("inquiry")) round1.push({ label: "Inquiries", detail: "Dispute unauthorized hard inquiries; demand permissible-purpose proof." });

  const round2: StrategyItem[] = [
    { label: "Method of Verification", detail: "Demand MOV (§1681i(a)(7)) on every item returned 'verified' in Round 1." },
    { label: "Procedural Dispute", detail: "Attack the inadequacy of the reinvestigation, not just the item." },
  ];
  if (has("charge_off")) round2.push({ label: "Charge-Offs", detail: "Demand original signed contract; flag balance/status inconsistencies." });
  if (has("repossession")) round2.push({ label: "Repossession", detail: "Request notice of sale + resale accounting; challenge deficiency." });

  const round3: StrategyItem[] = [
    { label: "Furnisher Direct", detail: "Direct §1681s-2(b) disputes to furnishers in parallel with the bureaus." },
    { label: "Reinsertion Watch", detail: "Demand 5-day written notice for any re-inserted previously-deleted item." },
    { label: "Pre-Litigation", detail: "Document willful non-compliance; issue pre-suit demand to bureau legal." },
  ];
  if (has("bankruptcy") || has("public_record"))
    round3.push({ label: "Public Records", detail: "Dispute source — courts confirm they don't report to bureaus (verification impossible)." });

  const cfpbEscalation: StrategyItem[] = [
    { label: "CFPB Complaint", detail: "File against the bureau citing failed/stalled reinvestigation with evidence." },
    { label: "Furnisher CFPB", detail: "Separate complaint against the furnisher for continued inaccurate reporting." },
    { label: "State AG", detail: "Parallel complaint to the state Attorney General for added pressure." },
    { label: "Litigation Track", detail: "If unresolved, prepare FCRA/FDCPA action — statutory damages + attorney fees." },
  ];

  return { round1, round2, round3, cfpbEscalation };
}

/** Top prioritized recommendations (short, actionable). */
export function recommendations(
  diag: DiagnosisResult,
  negatives: NegativeAccount[],
  inquiries: Inquiry[],
): string[] {
  const recs: string[] = [];
  const open = negatives.filter((n) => n.status !== "deleted" && n.status !== "paid");

  if (open.some((n) => n.accountType === "medical"))
    recs.push("Fast win: dispute medical collections — high deletion rate under current policy.");
  if (open.some((n) => n.accountType === "collection"))
    recs.push("Send validation letters before bureau disputes to force unverifiable deletions.");
  if (open.some((n) => n.accountType === "charge_off"))
    recs.push("Audit charge-offs for monthly-balance reporting errors — common Metro 2 violation.");
  if (inquiries.length > 4) recs.push("Dispute unauthorized hard inquiries to recover lost points.");
  if (diag.healthScore < 55) recs.push("Run the aggressive Round 1→3 + CFPB escalation track.");
  recs.push("Drop revolving utilization under 10% before the next monitoring pull for a quick lift.");
  if (diag.healthBand === "Fair" || diag.healthBand === "Good")
    recs.push("Client is approaching funding-readiness — begin lender-fit prep.");

  return recs.slice(0, 6);
}

export type FundingBand = "Not Ready" | "Almost Ready" | "Funding Ready";
export interface FundingReadiness {
  band: FundingBand;
  score: number; // 0–100
  factors: { label: string; ok: boolean; detail: string }[];
  recommendedPath: string;
}

/** Funding / approval readiness from scores, utilization, inquiries, derogatories. */
export function fundingReadiness(
  avgScore: number,
  utilizationPct: number | undefined,
  inquiriesCount: number,
  negatives: NegativeAccount[],
): FundingReadiness {
  const open = negatives.filter((n) => n.status !== "deleted" && n.status !== "paid");
  const util = utilizationPct ?? 0;

  const factors = [
    { label: "Score threshold", ok: avgScore >= 640, detail: `Avg ${avgScore || "—"} (need 640+)` },
    { label: "Utilization", ok: util > 0 ? util <= 30 : true, detail: `${util}% (keep ≤30%, ideal <10%)` },
    { label: "Inquiry risk", ok: inquiriesCount <= 4, detail: `${inquiriesCount} hard inquiries (keep ≤4)` },
    { label: "Derogatories", ok: open.length === 0, detail: `${open.length} active derogatory item(s)` },
  ];

  const passed = factors.filter((f) => f.ok).length;
  const score = Math.round((passed / factors.length) * 100);
  const band: FundingBand = passed === 4 ? "Funding Ready" : passed >= 2 ? "Almost Ready" : "Not Ready";

  let recommendedPath: string;
  if (band === "Funding Ready") recommendedPath = "Pursue primary financing — prime cards / installment / business funding.";
  else if (band === "Almost Ready") {
    if (util > 30) recommendedPath = "Pay down revolving balances below 30% first, then re-pull.";
    else if (open.length) recommendedPath = "Clear remaining derogatories via dispute, then qualify.";
    else recommendedPath = "Add a positive tradeline and let inquiries age, then re-pull.";
  } else recommendedPath = "Run the full dispute track + utilization paydown before any funding application.";

  return { band, score, factors, recommendedPath };
}

/** Recommended dispute reason for a negative-account type. */
export function disputeReason(type: string): string {
  const map: Record<string, string> = {
    collection: "Debt not validated — demand validation, dispute as unverified.",
    charge_off: "Inaccurate balance/status — demand original contract.",
    repossession: "Challenge deficiency balance + notice of sale.",
    late_payment: "Dispute inaccurate payment history; goodwill request.",
    medical: "Sub-$500 / paid medical — removable under current policy.",
    public_record: "Bureaus can't verify with the court — dispute the source.",
    bankruptcy: "Courts don't report to bureaus — verification impossible.",
  };
  return map[type] ?? "Dispute as inaccurate/unverifiable.";
}

/** Dispute priority for a negative-account type. */
export function negativePriority(type: string): PriorityLevel {
  if (type === "repossession" || type === "public_record" || type === "bankruptcy") return "Critical";
  if (type === "charge_off" || type === "collection") return "High";
  if (type === "medical" || type === "late_payment") return "Medium";
  return "Low";
}

/* ── Live-AI seam (future) ────────────────────────────────────────────────────
 * When the `credit-analyze` Supabase Edge Function is deployed (Claude as the
 * reasoning engine), this is where the call goes. Until then the deterministic
 * engine above powers the UI identically, so nothing is a placeholder. */
export async function analyzeWithAI(): Promise<DiagnosisResult | null> {
  return null; // not yet wired — UI falls back to diagnose()
}
