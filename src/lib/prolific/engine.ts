/**
 * Prolific Method engine — deterministic phase placement + plan generation.
 *
 * Combines the diagnostic intake with real credit signals (when the client's
 * report is imported) to place the client in one of 7 phases and build the plan.
 */
import type { DiagnosisResult, FundingReadiness } from "@/lib/credit/engine";
import { PHASE_BY_ID, PHASE_PLAYBOOK } from "./data";
import { PHASE_ORDER, type Intake, type Phase, type PhasePlan } from "./types";

const yes = (v: string | undefined) => v === "yes" || v === "true" || v === "Yes";
const no = (v: string | undefined) => v === "no" || v === "false" || v === "No";

/**
 * Optional real signals derived from the client's imported credit data — these
 * override unknown/blank intake answers so placement reflects the actual report.
 */
export interface CreditSignals {
  hasReport?: boolean;
  hasNegatives?: boolean;
  highUtil?: boolean;
  manyInquiries?: boolean;
  thinFile?: boolean;
  fundingReady?: boolean;
}

/** Merge intake answers with real credit signals (signals win when intake is blank). */
function resolve(intake: Intake, sig?: CreditSignals) {
  const get = (k: string, sigVal?: boolean) => {
    const a = intake[k];
    if (a === undefined || a === "") return sigVal; // fall back to signal
    return yes(a) ? true : no(a) ? false : sigVal;
  };
  return {
    goal: intake.goal || "",
    hasReport: get("hasReport", sig?.hasReport),
    hasNegatives: get("hasNegatives", sig?.hasNegatives),
    hasPositive: get("hasPositive", sig?.thinFile === undefined ? undefined : !sig.thinFile),
    highUtil: get("highUtil", sig?.highUtil),
    manyInquiries: get("manyInquiries", sig?.manyInquiries),
    hasLLC: get("hasLLC"),
    hasEIN: get("hasEIN"),
    hasBusinessBank: get("hasBusinessBank"),
    lenderReady: get("lenderReady", sig?.fundingReady),
    hasFunding: get("hasFunding"),
  };
}

/** Place the client in their current phase (first unmet gate, in order). */
export function placePhase(intake: Intake, sig?: CreditSignals): Phase {
  const r = resolve(intake, sig);

  if (r.hasReport === false || r.hasReport === undefined) return "diagnose";
  if (r.hasNegatives === true) return "repair";
  if (r.hasPositive === false || r.highUtil === true) return "rebuild";
  if (r.hasLLC === false || r.hasEIN === false || r.hasBusinessBank === false) return "structure";
  if (r.lenderReady === false || r.manyInquiries === true) return "position";
  if (r.hasFunding === false) return "fund";
  return "grow";
}

/** Build the full plan: every phase with done/current/upcoming state + steps. */
export function buildPlan(currentPhase: Phase): PhasePlan[] {
  const idx = PHASE_ORDER.indexOf(currentPhase);
  return PHASE_ORDER.map((id, i) => ({
    phase: id,
    meta: PHASE_BY_ID[id],
    state: i < idx ? "done" : i === idx ? "current" : "upcoming",
    steps: PHASE_PLAYBOOK[id],
  }));
}

/** One-line "next move" for the client, given their phase + goal. */
export function nextMove(currentPhase: Phase, goal: string): string {
  const base: Record<Phase, string> = {
    diagnose: "Pull the tri-bureau report and complete the diagnostic intake.",
    repair: "Open Round 1 disputes on the highest-impact derogatories.",
    rebuild: "Add a credit-builder tradeline and drive utilization under 10%.",
    structure: "Stand up the LLC/EIN/bank + business documents (Business-in-a-Box).",
    position: "Lock inquiry control and build the bank relationships before applying.",
    fund: "Execute the funding sequence — stack 0% business cards / lines.",
    grow: "Deploy capital into marketing, automation, and the growth plan.",
  };
  const goalNote = goal ? ` Goal: ${goal}.` : "";
  return base[currentPhase] + goalNote;
}

/** Convert a credit diagnosis + funding readiness into Prolific signals. */
export function signalsFromCredit(
  diag: DiagnosisResult | null,
  funding: FundingReadiness | null,
  hasReport: boolean,
): CreditSignals {
  if (!diag) return { hasReport };
  const negativeProblem = diag.problems.some((p) =>
    /collection|charge-off|repossession|public record|bankruptcy|medical|late-payment/i.test(p),
  );
  return {
    hasReport,
    hasNegatives: negativeProblem,
    highUtil: diag.problems.some((p) => /utiliz/i.test(p)) || diag.healthBand === "Poor" || diag.healthBand === "Critical",
    manyInquiries: diag.problems.some((p) => /inquir/i.test(p)),
    thinFile: diag.problems.some((p) => /thin file|optimization/i.test(p)),
    fundingReady: funding ? funding.band === "Funding Ready" : undefined,
  };
}
