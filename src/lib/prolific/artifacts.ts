/**
 * Prolific Method — phase artifacts. Each phase generates a concrete, tailored
 * deliverable from the client's real data (not just a checklist):
 *   Diagnose → diagnosis brief · Repair → FCRA dispute letters ·
 *   Rebuild → credit-building plan · Structure → Business-in-a-Box doc set ·
 *   Position → lender-readiness scorecard · Fund → funding sequence ·
 *   Grow → growth plan.
 */
import type { DiagnosisResult, FundingReadiness } from "@/lib/credit/engine";
import type { CreditUtilization, Inquiry, NegativeAccount } from "@/lib/credit/types";
import { BUREAU_PROFILES } from "@/lib/credit/bureau-intel";
import type { Phase } from "./types";

export type ArtifactBlock =
  | { type: "text"; title?: string; body: string }
  | { type: "list"; title: string; items: string[] }
  | { type: "letter"; bureau: string; address: string; subject: string; body: string };

export interface PhaseArtifact {
  phase: Phase;
  title: string;
  intro: string;
  blocks: ArtifactBlock[];
}

export interface ArtifactContext {
  firstName: string;
  lastName: string;
  address?: string;
  goal?: string;
  negatives: NegativeAccount[];
  inquiries: Inquiry[];
  utilization?: CreditUtilization;
  diagnosis?: DiagnosisResult | null;
  funding?: FundingReadiness | null;
}

const BUREAUS = ["Experian", "Equifax", "TransUnion"] as const;
const addressFor = (b: string) => BUREAU_PROFILES.find((p) => p.bureau === b)?.disputeAddress ?? b;

const reasonFor = (t: string): string => {
  const map: Record<string, string> = {
    collection: "This debt has not been validated and is reported as unverified.",
    charge_off: "The balance/status is inaccurate and the account is improperly reported.",
    repossession: "The deficiency balance and post-sale accounting are inaccurate.",
    late_payment: "The payment history is inaccurate.",
    medical: "This is a sub-$500/paid medical collection and should not be reported.",
    public_record: "This public record cannot be verified with the originating court.",
    bankruptcy: "The courts do not report to the bureaus; this item cannot be verified.",
  };
  return map[t] ?? "This item is inaccurate and/or unverifiable.";
};

function disputeLetters(ctx: ArtifactContext): ArtifactBlock[] {
  const name = `${ctx.firstName} ${ctx.lastName}`.trim();
  const open = ctx.negatives.filter((n) => n.status !== "deleted" && n.status !== "paid");
  const letters: ArtifactBlock[] = [];

  for (const bureau of BUREAUS) {
    const items = open.filter((n) => n.bureau === bureau || n.bureau === "All");
    if (!items.length) continue;
    const lines = items
      .map(
        (n, i) =>
          `  ${i + 1}. ${n.creditor} — ${String(n.accountType).replace("_", " ")} — Balance $${Number(
            n.balance,
          ).toLocaleString()}\n     Reason: ${reasonFor(String(n.accountType))}`,
      )
      .join("\n");
    const body =
      `[DATE]\n\n${name}\n${ctx.address ?? "[CLIENT MAILING ADDRESS]"}\nSSN: XXX-XX-${"" /* redacted */}____\n\n` +
      `${bureau}\n${addressFor(bureau)}\n\n` +
      `RE: Formal Dispute of Inaccurate Information\n\n` +
      `To Whom It May Concern,\n\n` +
      `I am disputing the following items on my credit report as inaccurate and/or unverifiable. ` +
      `Under the Fair Credit Reporting Act (15 U.S.C. §1681i), you must conduct a reasonable reinvestigation ` +
      `and delete any information that cannot be verified.\n\n${lines}\n\n` +
      `Please investigate these items and provide written confirmation of the results, including the method of ` +
      `verification (§1681i(a)(7)). Any item that cannot be fully verified with original documentation must be ` +
      `deleted (§1681i(a)(5)).\n\nSincerely,\n${name}`;
    letters.push({ type: "letter", bureau, address: addressFor(bureau), subject: `${bureau} — Round 1 Dispute`, body });
  }

  if (!letters.length)
    letters.push({ type: "text", body: "No active negative accounts on file — no dispute letters needed. Advance to Rebuild." });
  return letters;
}

export function phaseArtifact(phase: Phase, ctx: ArtifactContext): PhaseArtifact {
  const name = `${ctx.firstName} ${ctx.lastName}`.trim() || "Client";

  switch (phase) {
    case "diagnose":
      return {
        phase,
        title: "Diagnosis Brief",
        intro: `AI assessment of ${name}'s current position.`,
        blocks: [
          { type: "text", title: "Summary", body: ctx.diagnosis?.summary ?? "Import the client's credit report to generate the diagnosis." },
          { type: "list", title: "Main Problems", items: ctx.diagnosis?.problems ?? ["No report on file yet."] },
          {
            type: "list",
            title: "Profile Snapshot",
            items: [
              `Health score: ${ctx.diagnosis?.healthScore ?? "—"}/100 (${ctx.diagnosis?.healthBand ?? "unknown"})`,
              `Negative accounts: ${ctx.negatives.length}`,
              `Hard inquiries: ${ctx.inquiries.length}`,
              `Utilization: ${ctx.utilization ? `${ctx.utilization.utilizationPct}%` : "—"}`,
              `Goal: ${ctx.goal || "not set"}`,
            ],
          },
        ],
      };

    case "repair":
      return {
        phase,
        title: "Round 1 Dispute Letters",
        intro: `Certified-mail dispute letters for ${name}, one per bureau, generated from the negative accounts on file.`,
        blocks: disputeLetters(ctx),
      };

    case "rebuild":
      return {
        phase,
        title: "Credit Rebuild Plan",
        intro: `Add positive structure and optimize utilization.`,
        blocks: [
          {
            type: "list",
            title: "Recommended Actions",
            items: [
              "Open a credit-builder account or secured card (report to all 3 bureaus).",
              ctx.utilization && ctx.utilization.utilizationPct > 10
                ? `Pay revolving balances down from ${ctx.utilization.utilizationPct}% to under 10%.`
                : "Keep revolving utilization under 10%.",
              "Add a seasoned authorized-user tradeline if the file is thin.",
              "Establish 1–2 primary tradelines with on-time autopay.",
              "Maintain 12+ months of perfect payment history before funding.",
            ],
          },
          { type: "text", title: "Target", body: "Lift the score band to Good (670+) with utilization <10% and zero new derogatories." },
        ],
      };

    case "structure":
      return {
        phase,
        title: "Business-in-a-Box Document Set",
        intro: `Stand up ${name}'s business foundation so it is lender-ready.`,
        blocks: [
          {
            type: "list",
            title: "Formation",
            items: ["LLC Articles of Organization", "EIN confirmation (IRS CP575)", "Operating Agreement", "Business address (non-PO box)", "Dedicated business phone"],
          },
          {
            type: "list",
            title: "Digital + Banking",
            items: ["Business website (live)", "Business email (Google Workspace)", "Business bank account(s)", "Business email + domain match"],
          },
          {
            type: "list",
            title: "Lender Documents",
            items: ["Business license/permits", "Voided business check", "3 months business bank statements", "Funding contract (JotForm)", "411 listing / web presence"],
          },
        ],
      };

    case "position":
      return {
        phase,
        title: "Lender-Readiness Scorecard",
        intro: `Close the gaps before any application.`,
        blocks: [
          {
            type: "list",
            title: "Readiness Factors",
            items:
              ctx.funding?.factors.map((f) => `${f.ok ? "✓" : "✗"} ${f.label} — ${f.detail}`) ?? [
                "Import the report to compute readiness factors.",
              ],
          },
          { type: "text", title: "Recommended Path", body: ctx.funding?.recommendedPath ?? "Complete the diagnosis first." },
          {
            type: "list",
            title: "Pre-Application Controls",
            items: ["Freeze unnecessary inquiries", "Establish 2–3 primary bank relationships", "Align personal + business credit", "Confirm revenue/cashflow positioning"],
          },
        ],
      };

    case "fund":
      return {
        phase,
        title: "Funding Sequence & Stacking Plan",
        intro: `Execute the capital strategy in the right order.`,
        blocks: [
          {
            type: "list",
            title: "Sequence",
            items: [
              "Round 1: 0% APR business credit cards (stack same-day where possible).",
              "Round 2: Business lines of credit.",
              "Round 3: Personal/business installment loans as needed.",
              "Keep utilization low between rounds to preserve approvals.",
            ],
          },
          { type: "text", title: "Goal", body: ctx.goal ? `Aligned to client goal: ${ctx.goal}.` : "Maximize approved capital while protecting the profile." },
        ],
      };

    case "grow":
      return {
        phase,
        title: "Growth Plan",
        intro: `Deploy the capital and structure to scale.`,
        blocks: [
          {
            type: "list",
            title: "Deploy Into",
            items: ["Marketing & lead systems", "Website + funnels", "Automation (CRM/email/SMS)", "Branding", "Wealth dashboard tracking", "Quarterly business growth plan"],
          },
          { type: "text", title: "Outcome", body: "Client operates professionally with capital deployed into revenue-generating systems." },
        ],
      };
  }
}
