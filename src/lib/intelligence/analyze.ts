import { computeTotal } from "./scoring";
import type {
  CompetitorPost,
  DemandSignal,
  HookEntry,
  Opportunity,
  OpportunityScores,
  Outlier,
  Platform,
  TopicCategory,
} from "./types";

/**
 * Opportunity Analyzer.
 * Converts any raw scraped record (long/short-form post, viral outlier, audience
 * demand signal, hook) into a scored `Opportunity` using deterministic
 * heuristics. The collectors plug in later; the analysis contract stays the same.
 */

const clamp = (n: number) => Math.max(5, Math.min(99, Math.round(n)));
export const fmtN = (n: number) =>
  n >= 1_000_000 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

const FORMAT_BY_PLATFORM: Record<string, string> = {
  YouTube: "Long-form",
  TikTok: "Reel",
  Instagram: "Carousel",
  X: "Thread",
};

export interface Analysis extends Opportunity {
  angle: string;
  whyItWorked: string;
}

function suggestAngle(category: string, kind: "post" | "outlier" | "demand" | "hook"): string {
  const base: Record<string, string> = {
    post: "Re-skin the winning structure onto a Triad-T proof point and close the loop the original left open.",
    outlier: "Replicate the pattern interrupt, then redirect the spike toward your offer with a low-friction CTA.",
    demand: "Answer the exact question in the first 3 seconds, correct the misconception, give one action.",
    hook: "Keep the psychological trigger, swap the topic to your highest-intent category, add a receipt.",
  };
  return `${base[kind]} (category: ${category}).`;
}

function finalize(o: Omit<Opportunity, "total" | "createdAt">, angle: string, why: string): Analysis {
  return {
    ...o,
    total: computeTotal(o.scores),
    createdAt: new Date().toISOString().slice(0, 10),
    angle,
    whyItWorked: why,
  };
}

export function analyzePost(p: CompetitorPost): Analysis {
  const eng = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
  const er = p.views ? (eng / p.views) * 100 : 0;
  const saveRate = p.views ? (p.saves / p.views) * 100 : 0;
  const long = p.platform === "YouTube";
  const scores: OpportunityScores = {
    demand: clamp(46 + Math.log10(Math.max(100, p.views)) * 9),
    virality: clamp(38 + er * 3.2),
    competition: clamp(72 - er * 2.4),
    conversion: clamp(44 + saveRate * 5),
    authority: clamp(58 + saveRate * 2),
  };
  const why = `${p.creator}'s "${p.title}" pulled ${fmtN(p.views)} views at a ${er.toFixed(1)}% engagement rate${
    saveRate > 3 ? ` with a high ${saveRate.toFixed(1)}% save rate (intent signal)` : ""
  }. The hook front-loads the payoff.`;
  return finalize(
    {
      id: `gen-post-${p.id}`,
      source: "competitor",
      title: p.title,
      category: p.category as TopicCategory,
      funnel: long ? "MOF" : "TOF",
      format: FORMAT_BY_PLATFORM[p.platform] ?? "Reel",
      platform: p.platform as Platform,
      hook: p.hook,
      cta: p.cta,
      rationale: why,
      evidence: `${fmtN(p.views)} views · ${er.toFixed(1)}% ER · ${fmtN(p.saves)} saves`,
      scores,
    },
    suggestAngle(p.category, "post"),
    why,
  );
}

export function analyzeOutlier(o: Outlier): Analysis {
  const scores: OpportunityScores = {
    demand: clamp(o.opportunityScore * 0.85 + 10),
    virality: clamp(45 + o.multiple * 9),
    competition: clamp(70 - o.multiple * 4),
    conversion: clamp(o.opportunityScore * 0.7),
    authority: clamp(64),
  };
  return finalize(
    {
      id: `gen-outlier-${o.id}`,
      source: "outlier",
      title: o.title,
      category: o.category as TopicCategory,
      funnel: "TOF",
      format: o.format,
      platform: o.platform as Platform,
      hook: o.hook,
      cta: o.cta,
      rationale: o.whyItWorked,
      evidence: `${fmtN(o.views)} views vs ${fmtN(o.avgViews)} avg (${o.multiple}x)`,
      scores,
    },
    suggestAngle(o.category, "outlier"),
    o.whyItWorked,
  );
}

export function analyzeDemand(d: DemandSignal): Analysis {
  const pain = d.sentiment < 0 ? Math.abs(d.sentiment) : 0;
  const scores: OpportunityScores = {
    demand: clamp(40 + Math.log10(Math.max(10, d.mentions)) * 18),
    virality: clamp(48 + (d.type === "Misconception" || d.type === "Confusion" ? 18 : 6)),
    competition: clamp(58 - Math.log10(Math.max(10, d.mentions)) * 4),
    conversion: clamp(50 + pain * 0.4),
    authority: clamp(70),
  };
  const why = `${d.mentions} mentions of this ${d.type.toLowerCase()} across ${d.sourceLabel}. Unanswered demand = guaranteed watch-time.`;
  return finalize(
    {
      id: `gen-demand-${d.id}`,
      source: "demand",
      title: d.text,
      category: d.category as TopicCategory,
      funnel: pain > 30 ? "MOF" : "TOF",
      format: "Reel",
      platform: "TikTok",
      hook: `${d.text} — here's the real answer.`,
      cta: "Comment your situation and I'll point you to the fix.",
      rationale: why,
      evidence: `${d.mentions} mentions · sentiment ${d.sentiment}`,
      scores,
    },
    suggestAngle(d.category, "demand"),
    why,
  );
}

export function analyzeHook(h: HookEntry): Analysis {
  const scores: OpportunityScores = {
    demand: clamp(44 + Math.log10(Math.max(100, h.views)) * 8),
    virality: clamp(40 + h.engagementRate * 4),
    competition: clamp(66 - h.engagementRate * 2),
    conversion: clamp(52),
    authority: clamp(h.type === "Authority" || h.type === "Proof" ? 78 : 60),
  };
  const why = `${h.type} hook from ${h.creator} hit ${fmtN(h.views)} views at ${h.engagementRate}% ER. The trigger transfers cleanly to a Triad-T topic.`;
  return finalize(
    {
      id: `gen-hook-${h.id}`,
      source: "hook",
      title: `Hook play: "${h.hook}"`,
      category: h.category as TopicCategory,
      funnel: "TOF",
      format: FORMAT_BY_PLATFORM[h.platform] ?? "Reel",
      platform: h.platform as Platform,
      hook: h.hook,
      cta: "Comment a keyword and I'll send the breakdown.",
      rationale: why,
      evidence: `${fmtN(h.views)} views · ${h.engagementRate}% ER · ${h.type}`,
      scores,
    },
    suggestAngle(h.category, "hook"),
    why,
  );
}
