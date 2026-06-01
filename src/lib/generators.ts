/**
 * Phase-1 deterministic generators.
 *
 * The brief says "focus first on functionality before advanced AI
 * integrations." These functions produce real, structured, usable output
 * (content ideas, scripts, dispute letters, prompts, funding scores) using
 * template + heuristic logic — no external API required. Each is a clean seam
 * where a Claude API call can later be dropped in (see `src/lib/ai.ts`).
 */
import type { Funnel } from "@/types/database";

const PILLARS = ["Credit Education", "Funding", "Wealth Mindset", "Client Wins", "Behind the Scenes"];

/* ───────────────────────── Content Engine ───────────────────────── */

const HOOK_BANK: Record<Funnel, string[]> = {
  TOF: [
    "Your credit score is lying to you — here's the truth about {topic}",
    "Nobody talks about how {topic} actually works",
    "3 things about {topic} the banks hope you never learn",
    "If you have bad credit, watch this before you touch {topic}",
  ],
  MOF: [
    "Here's the exact {topic} system I used to change my life",
    "Why {topic} is the difference between broke and funded",
    "I tried every {topic} method — only this one worked",
    "The {topic} playbook my clients pay $1,000s for — free",
  ],
  BOF: [
    "Ready to fix your {topic}? Here's how we do it for you",
    "Stop guessing with {topic}. Let us build your plan.",
    "You're one decision away from solving {topic} for good",
    "We've helped 100+ people with {topic} — you're next",
  ],
};

const CTA_BANK: Record<Funnel, string[]> = {
  TOF: ["Follow for daily credit + funding tips", "Save this so you don't forget", "Share with someone who needs this"],
  MOF: ["Comment 'GUIDE' for the free playbook", "DM 'PLAN' and I'll send the roadmap", "Download the free funding checklist"],
  BOF: ["Book your free credit + funding audit", "DM 'AUDIT' to apply now", "Click the link to claim your strategy call"],
};

export interface GeneratedContent {
  funnel: Funnel;
  format: string;
  hook: string;
  outline: string[];
  caption: string;
  cta: string;
  hashtags: string[];
}

export function generateContent(topic: string, funnel: Funnel, format: string): GeneratedContent {
  const t = topic.trim() || "credit repair";
  const seed = t.length + funnel.length;
  const hook = HOOK_BANK[funnel][seed % HOOK_BANK[funnel].length].replace("{topic}", t);
  const cta = CTA_BANK[funnel][seed % CTA_BANK[funnel].length];

  const outline =
    format === "carousel"
      ? [
          `Slide 1 — Hook: ${hook}`,
          `Slide 2 — The painful truth about ${t}`,
          `Slide 3 — Why most people get ${t} wrong`,
          `Slide 4 — The 3-step framework`,
          `Slide 5 — A real result / proof`,
          `Slide 6 — CTA: ${cta}`,
        ]
      : [
          `0–2s — Pattern interrupt: "${hook}"`,
          `2–8s — Agitate the problem with ${t}`,
          `8–20s — Deliver the value / framework`,
          `20–28s — Proof or quick example`,
          `28–30s — ${cta}`,
        ];

  return {
    funnel,
    format,
    hook,
    outline,
    caption: `${hook}\n\nMost people overthink ${t}. Here's the simple version 👇\n\n${cta}`,
    cta,
    hashtags: ["#creditrepair", "#businessfunding", "#creditscore", "#financialfreedom", "#fundable"],
  };
}

/* ───────────────────────── Script Writer ───────────────────────── */

export function generateScript(
  topic: string,
  type: "reel" | "carousel" | "sales" | "caption" | "vsl",
  funnel: Funnel,
): string {
  const t = topic.trim() || "fixing your credit";
  switch (type) {
    case "reel":
      return `HOOK (0–3s): Stop scrolling if you want to fix ${t}.\n\nLINE 1: Here's what nobody tells you about ${t}.\nLINE 2: The mistake costing you points (and approvals).\nLINE 3: Do this instead — the 3-step move.\nLINE 4: This is exactly how my clients see deletions in 30–45 days.\n\nCTA: Follow + DM 'PLAN' for the full breakdown.`;
    case "carousel":
      return `S1: ${t} — the truth (Hook)\nS2: Why it matters more than your income\nS3: Mistake #1 most people make\nS4: The framework that actually works\nS5: Real client result\nS6: Your next step → DM 'GUIDE'`;
    case "sales":
      return `FRAME: So you want to solve ${t} and be funding-ready. Right?\nGAP: Staying where you are costs you every approval and every rate.\nBRIDGE: Our program handles the strategy, disputes, and funding roadmap for you.\nPROOF: We've helped 100+ clients do exactly this.\nCLOSE: Two ways to start — full-pay or 3-pay. Which fits better?`;
    case "caption":
      return `${t} doesn't have to be complicated. 🧠\n\nMost people stay stuck because they're guessing. The ones who win follow a system.\n\nSave this. Then DM 'PLAN' and let's build yours. 💳📈\n\n#creditrepair #funding #${funnel.toLowerCase()}`;
    case "vsl":
      return `1. PATTERN INTERRUPT: If your credit is holding you back from funding, watch this.\n2. STORY: I was denied for ${t} too — until I learned the system.\n3. PROBLEM: Why willpower and DIY don't work.\n4. MECHANISM: The TRIAD T method (dispute → optimize → fund).\n5. PROOF: Client results and numbers.\n6. OFFER: What you get when you join.\n7. CTA: Book your free audit now.`;
  }
}

/* ───────────────────────── Dispute Strategy ───────────────────────── */

export interface DisputeStrategy {
  bureau: string;
  legalBasis: string[];
  approach: string;
  letter: string;
  callScript: string;
  cfpbPlan: string[];
}

const BUREAU_ADDRESS: Record<string, string> = {
  Equifax: "Equifax Information Services LLC, P.O. Box 740256, Atlanta, GA 30374",
  Experian: "Experian, P.O. Box 4500, Allen, TX 75013",
  TransUnion: "TransUnion LLC Consumer Dispute Center, P.O. Box 2000, Chester, PA 19016",
};

export function generateDisputeStrategy(
  bureau: "Equifax" | "Experian" | "TransUnion",
  creditor: string,
  reason: string,
  round: number,
): DisputeStrategy {
  const c = creditor.trim() || "the furnisher";
  const r = reason.trim() || "inaccurate / unverifiable information";

  const legalBasis =
    round >= 3
      ? ["FCRA §611 (reinvestigation)", "FCRA §609 (disclosure)", "FCRA §623 (furnisher duties)", "Request Method of Verification (MOV)"]
      : ["FCRA §611 (reinvestigation)", "FCRA §609 (disclosure)", "Metro 2 reporting accuracy"];

  const approach =
    round === 1
      ? "Open with a factual accuracy + unverifiable challenge under FCRA §611. Keep it clean and specific."
      : round === 2
        ? "Escalate: demand the Method of Verification and challenge Metro 2 data-field inconsistencies (dates, balances, status codes)."
        : "Final escalation: invoke failure-to-verify, request deletion, and prepare a CFPB + state AG complaint if unresolved.";

  const letter = `${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

To: ${BUREAU_ADDRESS[bureau]}

Re: Formal Dispute — Request for Reinvestigation (Round ${round})

To Whom It May Concern,

I am exercising my rights under the Fair Credit Reporting Act (FCRA) to dispute the following item reporting on my credit file:

  • Creditor / Furnisher: ${c}
  • Reason for dispute: ${r}

Under FCRA §611, you are required to conduct a reasonable reinvestigation of this item within 30 days. ${
    round >= 2
      ? "I further demand, under §611(a)(7), the Method of Verification used — including the name, address, and telephone number of any furnisher contacted. Please also verify that all Metro 2 data fields (date of first delinquency, balance, account status, and date of last activity) are reported with 100% accuracy."
      : "If this item cannot be fully verified as accurate and complete, it must be deleted from my file."
  }

This information is ${r}. Please delete it or provide complete verification. Send your written results to my address on file.

Sincerely,
[CLIENT NAME]
[ADDRESS] · [SSN last 4] · [DOB]`;

  const callScript = `Hi, I'm calling about a dispute on my credit report with ${bureau}.

1. Confirm identity (have report # / SSN ready).
2. "I'm disputing the ${c} account — it's ${r}."
3. "Under FCRA §611 I'm requesting a reinvestigation${round >= 2 ? " and the Method of Verification" : ""}."
4. "Can you confirm the dispute is logged and give me the reference number?"
5. "What is the expected completion date? I'll follow up in writing."
Stay calm, factual, and documented. Note the rep's name + time.`;

  const cfpbPlan = [
    `Wait for the 30-day window (Round ${round}) to expire or for a "verified" result.`,
    "Gather proof: dispute letters, certified-mail receipts, bureau responses.",
    `File a CFPB complaint against ${bureau} citing FCRA §611 failure-to-verify and §623 furnisher inaccuracy.`,
    `File a parallel complaint against ${c} for furnishing inaccurate data.`,
    "Send a copy to your state Attorney General for added pressure.",
    "If still unresolved, consult an FCRA attorney — violations carry statutory damages.",
  ];

  return { bureau, legalBasis, approach, letter, callScript, cfpbPlan };
}

/* ───────────────────────── Funding Engine ───────────────────────── */

export interface FundingInput {
  creditType: "personal" | "business";
  fico: number;
  utilization: number;
  derogatoryMarks: number;
  inquiries6mo: number;
  businessAgeMonths?: number;
  annualRevenue?: number;
}

export interface FundingResult {
  readiness: number;
  tier: "Not Ready" | "Building" | "Approaching" | "Funding-Ready";
  factors: { label: string; status: "good" | "warn" | "bad"; note: string }[];
  recommendations: string[];
  estimatedApproval: string;
}

export function analyzeFunding(input: FundingInput): FundingResult {
  const factors: FundingResult["factors"] = [];
  let score = 0;

  if (input.creditType === "personal") {
    // FICO — 40 pts
    if (input.fico >= 720) { score += 40; factors.push({ label: "FICO Score", status: "good", note: `${input.fico} — prime tier` }); }
    else if (input.fico >= 680) { score += 28; factors.push({ label: "FICO Score", status: "warn", note: `${input.fico} — near prime` }); }
    else { score += 10; factors.push({ label: "FICO Score", status: "bad", note: `${input.fico} — below funding threshold` }); }

    // Utilization — 25 pts
    if (input.utilization <= 10) { score += 25; factors.push({ label: "Utilization", status: "good", note: `${input.utilization}% — ideal` }); }
    else if (input.utilization <= 30) { score += 15; factors.push({ label: "Utilization", status: "warn", note: `${input.utilization}% — pay down to <10%` }); }
    else { score += 4; factors.push({ label: "Utilization", status: "bad", note: `${input.utilization}% — too high for approvals` }); }

    // Derogatory — 20 pts
    if (input.derogatoryMarks === 0) { score += 20; factors.push({ label: "Derogatory Marks", status: "good", note: "Clean file" }); }
    else if (input.derogatoryMarks <= 2) { score += 8; factors.push({ label: "Derogatory Marks", status: "warn", note: `${input.derogatoryMarks} — dispute before applying` }); }
    else { score += 0; factors.push({ label: "Derogatory Marks", status: "bad", note: `${input.derogatoryMarks} — must clean up first` }); }

    // Inquiries — 15 pts
    if (input.inquiries6mo <= 2) { score += 15; factors.push({ label: "Recent Inquiries", status: "good", note: `${input.inquiries6mo} in 6mo` }); }
    else if (input.inquiries6mo <= 5) { score += 8; factors.push({ label: "Recent Inquiries", status: "warn", note: `${input.inquiries6mo} — let them age` }); }
    else { score += 2; factors.push({ label: "Recent Inquiries", status: "bad", note: `${input.inquiries6mo} — too many` }); }
  } else {
    const age = input.businessAgeMonths ?? 0;
    const rev = input.annualRevenue ?? 0;
    if (age >= 24) { score += 35; factors.push({ label: "Business Age", status: "good", note: `${age} months` }); }
    else if (age >= 6) { score += 20; factors.push({ label: "Business Age", status: "warn", note: `${age} months — keep building` }); }
    else { score += 5; factors.push({ label: "Business Age", status: "bad", note: `${age} months — under 6mo` }); }

    if (rev >= 120000) { score += 35; factors.push({ label: "Annual Revenue", status: "good", note: `$${rev.toLocaleString()}` }); }
    else if (rev >= 50000) { score += 22; factors.push({ label: "Annual Revenue", status: "warn", note: `$${rev.toLocaleString()}` }); }
    else { score += 8; factors.push({ label: "Annual Revenue", status: "bad", note: `$${rev.toLocaleString()} — thin` }); }

    if (input.derogatoryMarks === 0) { score += 15; factors.push({ label: "Personal Guarantor Credit", status: "good", note: "Clean" }); }
    else { score += 5; factors.push({ label: "Personal Guarantor Credit", status: "warn", note: `${input.derogatoryMarks} marks on PG` }); }

    if (input.inquiries6mo <= 2) { score += 15; factors.push({ label: "Recent Inquiries", status: "good", note: `${input.inquiries6mo} in 6mo` }); }
    else { score += 6; factors.push({ label: "Recent Inquiries", status: "warn", note: `${input.inquiries6mo} — slow down` }); }
  }

  const readiness = Math.min(100, Math.round(score));
  const tier: FundingResult["tier"] =
    readiness >= 80 ? "Funding-Ready" : readiness >= 60 ? "Approaching" : readiness >= 35 ? "Building" : "Not Ready";

  const recommendations: string[] = [];
  if (input.creditType === "personal") {
    if (input.utilization > 10) recommendations.push("Pay all revolving balances below 10% utilization before applying.");
    if (input.derogatoryMarks > 0) recommendations.push("Run dispute rounds to remove derogatory marks first.");
    if (input.fico < 680) recommendations.push("Add a credit-builder loan + secured card to lift FICO.");
    if (input.inquiries6mo > 2) recommendations.push("Let recent inquiries age 3–6 months before new applications.");
    if (readiness >= 80) recommendations.push("Target 0% intro-APR business cards and a personal line of credit.");
  } else {
    recommendations.push("Open 3–5 Net-30 vendor accounts to build business tradelines.");
    if ((input.businessAgeMonths ?? 0) < 24) recommendations.push("Maintain consistent revenue deposits to strengthen bank ratings.");
    if (readiness >= 60) recommendations.push("Apply for Tier 2 store cards, then revenue-based lines of credit.");
  }

  const estimatedApproval =
    readiness >= 80 ? "$50K–$150K likely" : readiness >= 60 ? "$15K–$50K with optimization" : readiness >= 35 ? "$2K–$10K starter products" : "Cleanup required before applying";

  return { readiness, tier, factors, recommendations, estimatedApproval };
}

/* ───────────────────────── Creative Center ───────────────────────── */

export type CreativeEngine = "thumbnail" | "chatgpt" | "firefly" | "rich_cinema_x";

export function generateCreativePrompt(engine: CreativeEngine, subject: string): string {
  const s = subject.trim() || "a confident entrepreneur reviewing a rising credit score on a phone";
  switch (engine) {
    case "thumbnail":
      return `YOUTUBE/REEL THUMBNAIL — ${s}. Bold, high-contrast, black & gold luxury palette. Subject center-frame with exaggerated emotion, 3-word text overlay in heavy condensed font ("STOP DOING THIS"), subtle gold glow rim light, dramatic studio lighting, 9:16 and 16:9 variants, leave negative space top-right for a number/stat.`;
    case "chatgpt":
      return `Create a photorealistic image: ${s}. Cinematic lighting, shallow depth of field, luxury financial aesthetic, black and gold color grade, 4k, sharp focus on the subject, soft bokeh background of a modern office at dusk. Style: editorial, aspirational, premium fintech brand.`;
    case "firefly":
      return `Adobe Firefly prompt — Subject: ${s}. Style: luxury editorial photography. Lighting: dramatic rim + soft key. Color: deep black background with metallic gold accents. Composition: rule-of-thirds, generous negative space for text. Mood: powerful, trustworthy, premium. Aspect: 9:16. Render: ultra-detailed, no text, no logos.`;
    case "rich_cinema_x":
      return `RICH CINEMA X — ${s}. Anamorphic cinematic frame, teal-and-gold luxury grade leaning heavy gold, volumetric haze, 35mm film grain, golden-hour key light with deep contrast shadows, motion-blur energy, opulent set design (marble, brass, glass), shallow DOF, 2.39:1 cinematic crop, hyper-premium "money & power" mood board. Camera: ARRI Alexa look, 50mm.`;
  }
}
