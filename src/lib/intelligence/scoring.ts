import type { IntelSource, Opportunity, OpportunityScores } from "./types";

/**
 * Opportunity Scoring Engine.
 *
 * Total = weighted blend of the five sub-scores. Competition is *inverted*
 * (a less crowded topic is a bigger opportunity), so it contributes
 * `(100 - competition)`.
 */
export const SCORE_WEIGHTS = {
  demand: 0.3,
  virality: 0.25,
  conversion: 0.2,
  authority: 0.1,
  competition: 0.15, // applied to (100 - competition)
} as const;

export function computeTotal(s: OpportunityScores): number {
  const total =
    s.demand * SCORE_WEIGHTS.demand +
    s.virality * SCORE_WEIGHTS.virality +
    s.conversion * SCORE_WEIGHTS.conversion +
    s.authority * SCORE_WEIGHTS.authority +
    (100 - s.competition) * SCORE_WEIGHTS.competition;
  return Math.round(total);
}

export type ScoreTier = "Priority" | "Strong" | "Watch" | "Low";

export function tier(total: number): ScoreTier {
  if (total >= 80) return "Priority";
  if (total >= 68) return "Strong";
  if (total >= 55) return "Watch";
  return "Low";
}

export const TIER_CLASS: Record<ScoreTier, string> = {
  Priority: "bg-gold/15 text-gold border border-gold/30",
  Strong: "bg-success/15 text-success border border-success/25",
  Watch: "bg-secondary text-muted-foreground border border-border",
  Low: "bg-muted/60 text-muted-foreground/70 border border-border",
};

/** Ensure every opportunity carries an up-to-date computed total. */
export function withTotals<T extends Opportunity>(opps: T[]): T[] {
  return opps
    .map((o) => ({ ...o, total: computeTotal(o.scores) }))
    .sort((a, b) => b.total - a.total);
}

export const SCORE_META: { key: keyof OpportunityScores; label: string; hint: string; invert?: boolean }[] = [
  { key: "demand", label: "Demand", hint: "Proven audience appetite" },
  { key: "virality", label: "Virality", hint: "Probability of outsized reach" },
  { key: "conversion", label: "Conversion", hint: "Drives consults & funding apps" },
  { key: "authority", label: "Authority", hint: "Builds Triad T trust" },
  { key: "competition", label: "Competition", hint: "Lower is better (less crowded)", invert: true },
];

export const SOURCE_META: Record<
  IntelSource,
  { label: string; short: string; href: string }
> = {
  competitor: { label: "Competitor Intelligence", short: "Competitor", href: "/intelligence/competitors" },
  outlier: { label: "Viral Outlier Detection", short: "Outlier", href: "/intelligence/outliers" },
  demand: { label: "Audience Demand Mining", short: "Demand", href: "/intelligence/demand" },
  hook: { label: "Hook Intelligence", short: "Hook", href: "/intelligence/hooks" },
  voice: { label: "Voice Intelligence", short: "Voice", href: "/intelligence/voice" },
  myth: { label: "Credit Myth Intelligence", short: "Myth", href: "/intelligence/myths" },
  bureau: { label: "Bureau Intelligence", short: "Bureau", href: "/intelligence/bureaus" },
  cfpb: { label: "CFPB Intelligence", short: "CFPB", href: "/intelligence/cfpb" },
  funding: { label: "Funding Intelligence", short: "Funding", href: "/intelligence/funding" },
  objection: { label: "Objection Intelligence", short: "Objection", href: "/intelligence/objections" },
  client: { label: "Client Intelligence", short: "Client", href: "/intelligence/clients" },
};
