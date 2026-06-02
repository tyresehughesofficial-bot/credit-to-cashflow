import { VOICE_PROFILE } from "./data";
import type { FunnelOutput, Opportunity, Platform } from "./types";

/**
 * Output Generation — the *final* layer of the engine.
 * Turns an approved, scored opportunity into TOF / MOF / BOF briefs written in
 * the founder's voice (see VOICE_PROFILE). Deterministic today; swap the body
 * builders for a Claude call later without changing the UI contract.
 */

const PLATFORM_BY_FUNNEL: Record<string, Platform> = {
  TOF: "TikTok",
  MOF: "Instagram",
  BOF: "YouTube",
};

const sig = (i: number) => VOICE_PROFILE.signatures[i % VOICE_PROFILE.signatures.length];

export function generateOutputs(opp: Opportunity): FunnelOutput[] {
  const platform = opp.platform ?? PLATFORM_BY_FUNNEL[opp.funnel];

  const tof: FunnelOutput = {
    stage: "TOF",
    angle: "Stop the scroll & reframe — pure value, no pitch.",
    hook: opp.hook,
    body: `${sig(3)} ${opp.title}. Name the problem in plain English, drop one counter-intuitive truth from the evidence (${opp.evidence}), then give ONE action they can take today. Keep it under 30 seconds, one idea per line.`,
    cta: `Comment a one-word keyword to pull the resource (e.g. "${keyword(opp)}").`,
    format: opp.format,
    platform: opp.funnel === "TOF" ? platform : "TikTok",
  };

  const mof: FunnelOutput = {
    stage: "MOF",
    angle: "Teach the mechanic — earn the save & the trust.",
    hook: `${opp.hook} (carousel/explainer)`,
    body: `${sig(1)} Break down WHY it works in 3-5 beats. Use Triad T vocabulary (${VOICE_PROFILE.vocabulary.slice(0, 4).join(", ")}). Reference the receipt: ${opp.evidence}. Close the loop the competitor leaves open.`,
    cta: "Save this before you apply — then follow for the next step.",
    format: opp.format === "Reel" ? "Carousel" : opp.format,
    platform: "Instagram",
  };

  const bof: FunnelOutput = {
    stage: "BOF",
    angle: "Proof + low-pressure offer — convert intent to a consult.",
    hook: `${opp.hook} … and here's what it looks like when we do it for you.`,
    body: `Lead with empathy for the denial/pain, show real results, then make the consult the obvious next move. ${sig(2)} Avoid: ${VOICE_PROFILE.avoid.slice(0, 2).join(", ")}.`,
    cta: "Book your free consult — we'll map your fastest wins.",
    format: "Short",
    platform: "YouTube",
  };

  // Order so the opportunity's native funnel stage leads.
  const order = [tof, mof, bof];
  return order.sort((a) => (a.stage === opp.funnel ? -1 : 0));
}

function keyword(opp: Opportunity): string {
  const m = opp.cta.match(/\b([A-Z]{3,})\b/);
  if (m) return m[1];
  return opp.category.split(" ")[0].toUpperCase();
}

const HASHTAGS: Record<string, string[]> = {
  "Credit Repair": ["#creditrepair", "#creditrestoration", "#fixyourcredit"],
  Funding: ["#businessfunding", "#fundingexpert", "#getfunded"],
  "Business Credit": ["#businesscredit", "#net30", "#fundable"],
  "Personal Credit": ["#creditscore", "#creditbuilding", "#700club"],
  "Credit Myths": ["#creditmyths", "#creditfacts", "#realtalk"],
};

/** The full package created when an opportunity is approved → fed to production. */
export interface ContentPackage {
  tof: string;
  mof: string;
  bof: string;
  hook: string;
  caption: string;
  cta: string;
  format: string;
  platform: string;
}

export function generatePackage(opp: Opportunity): ContentPackage {
  const outs = generateOutputs(opp);
  const byStage = Object.fromEntries(outs.map((o) => [o.stage, o]));
  const tags = (HASHTAGS[opp.category] ?? ["#triadt", "#crediteducation"]).join(" ");
  const caption = `${opp.hook}\n\nReal talk — here's what most people get wrong about ${opp.category.toLowerCase()}, and the one move that actually works.\n\n${opp.cta}\n\n${tags}`;
  return {
    tof: byStage.TOF?.body ?? "",
    mof: byStage.MOF?.body ?? "",
    bof: byStage.BOF?.body ?? "",
    hook: opp.hook,
    caption,
    cta: opp.cta,
    format: opp.format,
    platform: opp.platform,
  };
}

/** Suggested hook variants in different psychological registers. */
export function hookVariants(opp: Opportunity): { type: string; hook: string }[] {
  return [
    { type: "Curiosity", hook: opp.hook },
    { type: "Contrarian", hook: `Everyone says the opposite, but: ${opp.title.toLowerCase()}.` },
    { type: "Proof", hook: `We have the receipts on this — ${opp.evidence.split(".")[0].toLowerCase()}.` },
    { type: "Urgency", hook: `Before your next application: ${opp.title.toLowerCase()}.` },
  ];
}
