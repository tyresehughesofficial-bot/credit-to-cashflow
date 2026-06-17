/**
 * BUREAU INTELLIGENCE — internal knowledge database.
 *
 * This is NOT client data and has NOTHING to do with MyFreeScoreNow. It is the
 * operator's reference knowledge for how each bureau behaves: addresses, contacts,
 * response patterns, verification behavior, escalation methods, and timelines —
 * plus cross-bureau intelligence for each negative-item category.
 *
 * Lives in the app (static knowledge), seeded into a `useCollection` so the
 * operator can edit/extend it. It does not write to the credit-system tables.
 */
import type { BureauName } from "./types";

export interface BureauProfile {
  id: string;
  bureau: BureauName;
  /** Dispute mailing address (certified mail). */
  disputeAddress: string;
  /** Phone / executive contacts. */
  contact: string;
  /** How they typically respond to disputes. */
  responsePatterns: string;
  /** Known verification behavior (e-OSCAR, parroting, etc.). */
  verificationBehavior: string;
  /** How to escalate past the front-line dispute. */
  escalationMethods: string;
  /** Investigation timelines & legal clocks. */
  investigationTimelines: string;
}

export const BUREAU_PROFILES: BureauProfile[] = [
  {
    id: "bp-experian",
    bureau: "Experian",
    disputeAddress: "Experian, P.O. Box 4500, Allen, TX 75013",
    contact:
      "Consumer disputes: 1-888-397-3742 · Executive escalation: NCAC (National Consumer Assistance Center). Corporate: 475 Anton Blvd, Costa Mesa, CA 92626.",
    responsePatterns:
      "Fast online responses (often < 15 days) via the Experian portal. Heavy reliance on automated e-OSCAR codes. Tends to mark items 'verified' without supplying method of verification unless pressed in writing.",
    verificationBehavior:
      "Uses ACDV/e-OSCAR to ping the furnisher. Rarely conducts a true manual reinvestigation. Will 'parrot' the furnisher's response. Frivolous-claim flags triggered by template letters — vary the language.",
    escalationMethods:
      "1) Demand Method of Verification (15 U.S.C. §1681i(a)(7)). 2) Reinsert-notice demand. 3) CFPB complaint. 4) State AG. 5) FCRA litigation / pre-suit demand to Experian legal.",
    investigationTimelines:
      "30 days standard (45 if new info added mid-cycle). MOV request: 15 days to disclose. Reinsertion: 5-day written notice required.",
  },
  {
    id: "bp-equifax",
    bureau: "Equifax",
    disputeAddress: "Equifax Information Services LLC, P.O. Box 740256, Atlanta, GA 30374",
    contact:
      "Consumer disputes: 1-866-349-5191 · Corporate: 1550 Peachtree St NW, Atlanta, GA 30309. Post-breach settlement portal still referenced in escalations.",
    responsePatterns:
      "Slower than Experian; frequently uses the full 30 days. More likely to request ID/proof-of-address, stalling the clock. Mails paper results.",
    verificationBehavior:
      "e-OSCAR driven. Known for 'stall' tactics: returning disputes as incomplete to reset timelines. Watch for suspicious same-day 'verified' on multiple accounts.",
    escalationMethods:
      "1) MOV demand. 2) Cite stall/clock-reset as willful non-compliance. 3) CFPB complaint (Equifax responds quickly to CFPB). 4) State AG. 5) Litigation.",
    investigationTimelines:
      "30 days (45 with added info). ID-verification stalls do NOT legally pause the clock once a valid dispute is on file — document the postmark.",
  },
  {
    id: "bp-transunion",
    bureau: "TransUnion",
    disputeAddress: "TransUnion LLC Consumer Dispute Center, P.O. Box 2000, Chester, PA 19016",
    contact:
      "Consumer disputes: 1-800-916-8800 · Corporate: 555 W Adams St, Chicago, IL 60661.",
    responsePatterns:
      "Aggressive use of 'frivolous/irrelevant' rejections for template letters. Online disputes resolve fast but with shallow investigation. Best results with certified-mail, individualized letters.",
    verificationBehavior:
      "e-OSCAR; quick to flag suspected credit-repair language. Will demand documentation before opening a dispute. Method-of-verification responses are often vague ('contacted the data furnisher').",
    escalationMethods:
      "1) Re-file by certified mail with unique wording. 2) MOV demand. 3) Procedural-dispute angle (15 U.S.C. §1681i(a)(6)/(7)). 4) CFPB complaint. 5) State AG / litigation.",
    investigationTimelines:
      "30 days (45 with added info). Frivolous-determination notice: 5 days. Keep certified-mail receipts to defeat 'frivolous' rejections.",
  },
];

/* ── Additional cross-bureau intelligence categories ───────────────────────── */

export interface IntelCategory {
  id: string;
  category: string;
  summary: string;
  /** Operator playbook / known behavior. */
  playbook: string;
  /** Primary legal levers. */
  legalBasis: string;
}

export const INTEL_CATEGORIES: IntelCategory[] = [
  {
    id: "ic-collection",
    category: "Collection Intelligence",
    summary: "Third-party debt collectors reporting on the bureaus.",
    playbook:
      "Debt-validation first (FDCPA §809). Demand the agreement assigning the debt + chain of title. Many collectors cannot validate; non-response forces deletion. Re-aged collections are FCRA violations — verify DOFD.",
    legalBasis: "FDCPA §809 (validation) · FCRA §1681s-2 (furnisher duties) · §1681c (7-yr DOFD reporting limit).",
  },
  {
    id: "ic-inquiry",
    category: "Inquiry Intelligence",
    summary: "Hard inquiries impacting score and signaling unauthorized pulls.",
    playbook:
      "Distinguish hard vs soft. Dispute unauthorized hard inquiries directly with the bureau AND the creditor; demand the signed permissible-purpose authorization. No authorization on file = removal. Rate-shopping windows (14–45 days) cluster as one.",
    legalBasis: "FCRA §1681b (permissible purpose) · §1681m (adverse action).",
  },
  {
    id: "ic-pii",
    category: "Personal Information Intelligence",
    summary: "Names, addresses, employers, SSN variations on file.",
    playbook:
      "Clean PII FIRST — mismatched/old addresses and name variants are how mixed files and re-insertions happen. Remove unauthorized aliases and addresses to weaken the furnisher's ability to 'verify' tied accounts.",
    legalBasis: "FCRA §1681i (reinvestigation) · §1681e(b) (maximum possible accuracy).",
  },
  {
    id: "ic-chargeoff",
    category: "Charge-Off Intelligence",
    summary: "Accounts the original creditor has written off.",
    playbook:
      "Audit for balance/status inconsistencies across the three bureaus (a charge-off still reporting a monthly balance or 'past due' is a violation). Demand the original signed contract. Settlement should be 'paid/deleted' in writing before payment.",
    legalBasis: "FCRA §1681e(b)/§1681s-2 (accuracy) · Metro 2 reporting standards.",
  },
  {
    id: "ic-repo",
    category: "Repossession Intelligence",
    summary: "Voluntary/involuntary auto and secured-asset repossessions.",
    playbook:
      "Challenge deficiency balance accuracy and post-sale accounting (was the consumer sent a proper notice of sale?). Demand auction/resale documentation. Improper notice under the UCC can invalidate the deficiency the bureaus are reporting.",
    legalBasis: "UCC Art. 9 (notice of sale) · FCRA accuracy provisions.",
  },
  {
    id: "ic-bankruptcy",
    category: "Bankruptcy Intelligence",
    summary: "Public-record bankruptcies (Ch. 7 / Ch. 13).",
    playbook:
      "Bureaus no longer buy public records from courts — they cannot 'verify' with the court directly. Dispute the bureau's source: courts confirm they do not report to bureaus, so verification is procedurally impossible. Discharged debts must show $0 balance.",
    legalBasis: "FCRA §1681i (procedure) · §1681c (10-yr limit Ch.7 / 7-yr Ch.13).",
  },
  {
    id: "ic-medical",
    category: "Medical Collection Intelligence",
    summary: "Healthcare debts in collection.",
    playbook:
      "Paid medical collections must be removed. Sub-$500 medical collections should no longer report (2023 bureau policy). Demand HIPAA-compliant validation — collectors often cannot share itemized records, forcing deletion. Insurance/coordination-of-benefits errors are common.",
    legalBasis: "FCRA · bureau medical-debt policy (2022–2023) · HIPAA limits on disclosure.",
  },
];
