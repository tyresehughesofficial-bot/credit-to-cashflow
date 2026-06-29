/**
 * THE PROLIFIC METHOD — Triad T's core client-transformation mechanism.
 *   Credit → Structure → Capital → Growth
 *   Diagnose → Repair → Rebuild → Structure → Position → Fund → Grow
 *
 * The engine asks a short diagnostic ("James Bond" intake) + reads the client's
 * credit data, auto-places them in one of 7 phases, and generates a full plan.
 * It reuses the credit engine (diagnose / fundingReadiness) — see ./engine.ts.
 */

export type Phase =
  | "diagnose"
  | "repair"
  | "rebuild"
  | "structure"
  | "position"
  | "fund"
  | "grow";

export const PHASE_ORDER: Phase[] = [
  "diagnose",
  "repair",
  "rebuild",
  "structure",
  "position",
  "fund",
  "grow",
];

export interface PhaseMeta {
  id: Phase;
  n: number;
  name: string;
  /** Branded mechanism word (Credit → Structure → Capital → Growth). */
  pillar: "Credit" | "Structure" | "Capital" | "Growth";
  summary: string;
  includes: string[];
}

/** Intake answer values: "yes" | "no" | "" (unknown) or a select string. */
export type Answer = string;
export type Intake = Record<string, Answer>;

export interface IntakeQuestion {
  key: string;
  label: string;
  type: "boolean" | "select";
  options?: string[];
  /** Phase this question most informs (for grouping). */
  hint?: Phase;
}

/** Per-client journey state persisted in the `prolific_journeys` collection. */
export interface Journey {
  id: string;
  clientId: string;
  intake: Intake;
  phase: Phase; // current placement (auto unless overridden)
  manualPhase?: Phase | ""; // operator override
  completedSteps: string[]; // checklist step keys marked done
  updatedAt?: string;
}

export interface PlanStep {
  key: string;
  label: string;
}
export interface PhasePlan {
  phase: Phase;
  meta: PhaseMeta;
  /** Where this phase sits relative to the client's current phase. */
  state: "done" | "current" | "upcoming";
  steps: PlanStep[];
}
