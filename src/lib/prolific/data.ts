import type { IntakeQuestion, PhaseMeta, PlanStep, Phase } from "./types";

/* ── The 7 phases (faithful to the Prolific Method spec) ───────────────────── */
export const PHASES: PhaseMeta[] = [
  {
    id: "diagnose",
    n: 1,
    name: "Diagnose",
    pillar: "Credit",
    summary: "Find out exactly where the client stands today.",
    includes: [
      "Pull tri-bureau credit profile",
      "Identify negative items & inquiries",
      "Assess positive accounts & utilization",
      "Confirm business structure (LLC, EIN, bank)",
      "Determine the client's funding goal",
    ],
  },
  {
    id: "repair",
    n: 2,
    name: "Repair",
    pillar: "Credit",
    summary: "Fix the foundation — clean what's damaging the profile.",
    includes: [
      "Dispute negative items (Rounds 1–4)",
      "Review & challenge unauthorized inquiries",
      "Address late payments",
      "Resolve collections",
      "Resolve charge-offs",
      "Credit report cleanup",
    ],
  },
  {
    id: "rebuild",
    n: 3,
    name: "Rebuild",
    pillar: "Credit",
    summary: "Add positive credit structure.",
    includes: [
      "Open credit-builder accounts",
      "Add authorized users (if needed)",
      "Establish primary accounts",
      "Utilization strategy (<10%)",
      "Strengthen payment history",
    ],
  },
  {
    id: "structure",
    n: 4,
    name: "Structure",
    pillar: "Structure",
    summary: "Build the business foundation (Business-in-a-Box).",
    includes: [
      "Form the LLC",
      "Obtain EIN",
      "Business address",
      "Business phone",
      "Website",
      "Business email (Google Workspace)",
      "Open business bank accounts",
      "Prepare lender/banker documents",
      "Operating agreement",
      "Funding contracts (JotForm)",
    ],
  },
  {
    id: "position",
    n: 5,
    name: "Position",
    pillar: "Capital",
    summary: "Prepare the client for approvals.",
    includes: [
      "Lender readiness vs requirements",
      "Bank relationship setup",
      "Funding sequence plan",
      "Inquiry control",
      "Revenue / cashflow positioning",
      "Personal + business credit alignment",
    ],
  },
  {
    id: "fund",
    n: 6,
    name: "Access Capital",
    pillar: "Capital",
    summary: "Execute the funding strategy.",
    includes: [
      "Business credit cards",
      "Lines of credit",
      "Personal loans",
      "Business loans",
      "0% APR funding",
      "Stacking strategy",
    ],
  },
  {
    id: "grow",
    n: 7,
    name: "Grow",
    pillar: "Growth",
    summary: "Use the capital & structure to expand.",
    includes: [
      "Marketing",
      "Website & funnels",
      "Automation",
      "Branding",
      "Lead systems",
      "Wealth dashboard",
      "Business growth plan",
    ],
  },
];

export const PHASE_BY_ID: Record<Phase, PhaseMeta> = Object.fromEntries(
  PHASES.map((p) => [p.id, p]),
) as Record<Phase, PhaseMeta>;

/* ── Diagnostic intake ("James Bond" questionnaire) ────────────────────────── */
export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    key: "goal",
    label: "Primary goal",
    type: "select",
    options: ["Personal Funding", "Business Funding", "Grants", "Full Business Setup"],
    hint: "diagnose",
  },
  { key: "hasReport", label: "Do we have their credit report?", type: "boolean", hint: "diagnose" },
  { key: "hasNegatives", label: "Negative items on the report?", type: "boolean", hint: "repair" },
  { key: "hasPositive", label: "Strong positive accounts?", type: "boolean", hint: "rebuild" },
  { key: "highUtil", label: "Utilization over 30%?", type: "boolean", hint: "rebuild" },
  { key: "manyInquiries", label: "More than 4 recent hard inquiries?", type: "boolean", hint: "position" },
  { key: "hasLLC", label: "Do they have an LLC?", type: "boolean", hint: "structure" },
  { key: "hasEIN", label: "Do they have an EIN?", type: "boolean", hint: "structure" },
  { key: "hasBusinessBank", label: "Business bank account open?", type: "boolean", hint: "structure" },
  { key: "lenderReady", label: "Positioned & lender-ready (bank relationships)?", type: "boolean", hint: "position" },
  { key: "hasFunding", label: "Already accessed funding/capital?", type: "boolean", hint: "fund" },
];

/* ── Per-phase plan checklists (the deliverables for each phase) ────────────── */
export const PHASE_PLAYBOOK: Record<Phase, PlanStep[]> = Object.fromEntries(
  PHASES.map((p) => [p.id, p.includes.map((label, i) => ({ key: `${p.id}-${i}`, label }))]),
) as Record<Phase, PlanStep[]>;
