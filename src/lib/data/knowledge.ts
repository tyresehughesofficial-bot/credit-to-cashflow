/** Credit Knowledge Center — FCRA, FDCPA, Metro 2, CFPB reference library. */

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: "FCRA" | "FDCPA" | "Metro 2" | "CFPB" | "General";
  summary: string;
  body: string;
  tags: string[];
  citation?: string;
}

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: "kb_fcra_611",
    title: "FCRA §611 — Reinvestigation of Disputed Information",
    category: "FCRA",
    summary:
      "Bureaus must reasonably reinvestigate disputed items within 30 days and delete anything unverifiable.",
    body: "When a consumer disputes the accuracy of an item, the consumer reporting agency must conduct a reasonable reinvestigation, generally within 30 days (extendable to 45 if new info is provided). If the information cannot be verified, it must be promptly deleted or modified. The CRA must forward all relevant data to the furnisher and notify the consumer of results within 5 days of completion. Under §611(a)(7), the consumer may request a description of the Method of Verification (MOV).",
    tags: ["dispute", "30-day", "MOV", "deletion"],
    citation: "15 U.S.C. §1681i",
  },
  {
    id: "kb_fcra_609",
    title: "FCRA §609 — Disclosures to Consumers",
    category: "FCRA",
    summary: "Consumers have the right to request all information in their file and the sources of it.",
    body: "§609 entitles a consumer to disclosure of all information in their file, the sources of the information, and (in most cases) identification of anyone who procured a report. A §609 letter is often used to request proof/documentation of an account. Note: §609 is a disclosure right — it does not by itself require deletion; pair it with a §611 dispute for reinvestigation.",
    tags: ["disclosure", "609-letter", "file"],
    citation: "15 U.S.C. §1681g",
  },
  {
    id: "kb_fcra_623",
    title: "FCRA §623 — Furnisher Responsibilities",
    category: "FCRA",
    summary: "Data furnishers must report accurately and investigate disputes sent through a CRA.",
    body: "Furnishers (creditors, collectors) must not report information they know or have reasonable cause to believe is inaccurate, and must correct and update information. When they receive a dispute from a CRA, they must investigate, review all relevant info, and report results back. Direct disputes to the furnisher are also permitted for certain items.",
    tags: ["furnisher", "accuracy", "investigation"],
    citation: "15 U.S.C. §1681s-2",
  },
  {
    id: "kb_fdcpa_809",
    title: "FDCPA §809 — Debt Validation",
    category: "FDCPA",
    summary: "Consumers can demand validation of a debt within 30 days of first contact.",
    body: "Within 5 days of initial communication, a debt collector must send written notice of the debt. The consumer has 30 days to dispute and request validation. Once validation is requested, the collector must cease collection until it mails verification of the debt. Use this for collection accounts before disputing with bureaus.",
    tags: ["validation", "collections", "30-day", "cease"],
    citation: "15 U.S.C. §1692g",
  },
  {
    id: "kb_fdcpa_807",
    title: "FDCPA §807 — False or Misleading Representations",
    category: "FDCPA",
    summary: "Collectors cannot misrepresent the amount, status, or legal standing of a debt.",
    body: "Prohibits false, deceptive, or misleading representations — including misstating the amount owed, falsely implying attorney involvement, or threatening action that cannot legally be taken. Re-aging a debt or reporting an inaccurate date of first delinquency can violate this section and the FCRA.",
    tags: ["harassment", "misrepresentation", "re-aging"],
    citation: "15 U.S.C. §1692e",
  },
  {
    id: "kb_metro2_dofd",
    title: "Metro 2 — Date of First Delinquency (DOFD)",
    category: "Metro 2",
    summary: "The DOFD field controls the 7-year reporting clock and must never be re-aged.",
    body: "Metro 2 is the standardized format furnishers use to report to bureaus. The Date of First Delinquency (Field controlling §605 obsolescence) starts the 7-year removal clock. Inconsistent or shifting DOFDs across bureaus are a prime, compliant dispute angle: challenge the data-field accuracy rather than just saying 'not mine.'",
    tags: ["DOFD", "7-year", "compliance", "dispute-angle"],
  },
  {
    id: "kb_metro2_fields",
    title: "Metro 2 — Key Data Fields to Audit",
    category: "Metro 2",
    summary: "Account status, payment history profile, balance, and dates must agree across bureaus.",
    body: "High-value audit fields: Account Status, Payment Rating, Payment History Profile (24-month string), Current Balance, High Credit, Amount Past Due, Date Opened, Date of Last Payment, and DOFD. Any internal contradiction (e.g., 'paid' status with a balance, or differing dates across EQ/EX/TU) is a factual inaccuracy you can dispute under FCRA §611.",
    tags: ["audit", "fields", "inconsistency"],
  },
  {
    id: "kb_cfpb_complaint",
    title: "CFPB Complaints — Escalation Process",
    category: "CFPB",
    summary: "File with the CFPB when a bureau or furnisher fails to properly investigate.",
    body: "The Consumer Financial Protection Bureau accepts complaints against bureaus and furnishers. Companies typically respond within 15 days and resolve within 60. Complaints create a regulatory paper trail and often prompt deletions where letters stalled. Include: dispute history, certified-mail proof, and the specific FCRA/FDCPA section violated. File at consumerfinance.gov/complaint.",
    tags: ["escalation", "complaint", "regulator"],
  },
  {
    id: "kb_cfpb_when",
    title: "CFPB — When to Escalate",
    category: "CFPB",
    summary: "Escalate after a 'verified' result that ignored your MOV request or after 2+ failed rounds.",
    body: "Escalate to the CFPB when: (1) a bureau marks an item 'verified' but cannot produce a Method of Verification, (2) the 30-day window lapsed with no response, (3) a furnisher continues reporting data you've proven inaccurate, or (4) re-aging is detected. Parallel-file against both the bureau and the furnisher for maximum pressure.",
    tags: ["escalation", "timing", "MOV"],
  },
  {
    id: "kb_general_utilization",
    title: "Credit Utilization — The 10% Rule",
    category: "General",
    summary: "Keeping revolving utilization under 10% maximizes score and funding approvals.",
    body: "Utilization is ~30% of a FICO score. Aim for under 10% overall and per-card before any funding application. Tactics: request credit-limit increases, pay before the statement cut date (not just the due date), and avoid closing old cards (it shrinks total available credit and average age).",
    tags: ["utilization", "fico", "funding-prep"],
  },
];

export const KNOWLEDGE_CATEGORIES = ["FCRA", "FDCPA", "Metro 2", "CFPB", "General"] as const;

/** Lightweight keyword "AI assistant" over the knowledge base (Phase 1). */
export function searchKnowledge(query: string): { article: KnowledgeArticle; answer: string } | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  let best: KnowledgeArticle | null = null;
  let bestScore = 0;
  for (const a of KNOWLEDGE_BASE) {
    const haystack = `${a.title} ${a.summary} ${a.body} ${a.tags.join(" ")} ${a.category}`.toLowerCase();
    const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  if (!best || bestScore === 0) return null;
  return {
    article: best,
    answer: `Based on **${best.title}** (${best.citation ?? best.category}): ${best.summary}\n\n${best.body}`,
  };
}
