/**
 * Content Intelligence & Opportunity Discovery Engine — domain model.
 *
 * The engine treats AI as the *final* layer. Value is produced by the pipeline:
 *   Collect → Detect → Recognize patterns → Score → Approve → Generate.
 * Every intelligence source emits `Opportunity` records that flow through the
 * scoring engine and approval workflow into the content production pipeline.
 */

export type Platform = "YouTube" | "TikTok" | "Instagram" | "X";
export type Funnel = "TOF" | "MOF" | "BOF";

export type TopicCategory =
  | "Credit Repair"
  | "Personal Credit"
  | "Business Credit"
  | "Funding"
  | "Financial Literacy"
  | "Consumer Rights"
  | "Bureau Reporting"
  | "Credit Myths"
  | "Credit Education"
  | "Entrepreneurship"
  | "Wealth Building";

export type HookType =
  | "Curiosity"
  | "Fear"
  | "Authority"
  | "Myth"
  | "Contrarian"
  | "Proof"
  | "Story"
  | "Urgency";

/** The 11 intelligence sources that feed the opportunity queue. */
export type IntelSource =
  | "competitor"
  | "outlier"
  | "demand"
  | "hook"
  | "voice"
  | "myth"
  | "bureau"
  | "cfpb"
  | "funding"
  | "objection"
  | "client";

export type OppStatus = "new" | "approved" | "rejected" | "archived" | "saved";

export interface OpportunityScores {
  /** Proven audience appetite — questions, searches, comment volume. */
  demand: number;
  /** Probability of outsized reach — outlier signal, hook strength. */
  virality: number;
  /** Saturation in-niche (higher = more crowded → lower opportunity). */
  competition: number;
  /** Likelihood of driving consults / funding apps / sales. */
  conversion: number;
  /** How strongly it builds Triad T authority & trust. */
  authority: number;
}

export interface Opportunity {
  id: string;
  title: string;
  source: IntelSource;
  category: TopicCategory;
  funnel: Funnel;
  format: string;
  platform: Platform;
  scores: OpportunityScores;
  /** Computed weighted score (0-100); set by the scoring engine. */
  total: number;
  hook: string;
  cta: string;
  /** Why this is an opportunity / "why this worked". */
  rationale: string;
  /** The supporting datum from the source (the receipt). */
  evidence: string;
  createdAt: string;
}

/* ───────────────────────── Source-specific records ───────────────────────── */

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  niche: string;
  followers: number;
  avgViews: number;
  /** 30-day follower growth %. */
  growth: number;
}

export interface CompetitorPost {
  id: string;
  creator: string;
  handle: string;
  platform: Platform;
  title: string;
  hook: string;
  cta: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  postedAt: string;
  category: TopicCategory;
}

export interface Outlier {
  id: string;
  creator: string;
  platform: Platform;
  title: string;
  hook: string;
  topic: string;
  angle: string;
  cta: string;
  format: string;
  views: number;
  avgViews: number;
  /** views / avgViews. */
  multiple: number;
  thumbnail: string;
  timing: string;
  whyItWorked: string;
  replication: string[];
  opportunityScore: number;
  category: TopicCategory;
}

export type DemandType =
  | "Question"
  | "Pain Point"
  | "Objection"
  | "Misconception"
  | "Confusion"
  | "Request";

export interface DemandSignal {
  id: string;
  text: string;
  type: DemandType;
  sourceLabel: string;
  mentions: number;
  /** -100..100 sentiment. */
  sentiment: number;
  category: TopicCategory;
}

export interface HookEntry {
  id: string;
  hook: string;
  type: HookType;
  creator: string;
  platform: Platform;
  date: string;
  views: number;
  engagementRate: number;
  category: TopicCategory;
}

export interface VoiceProfile {
  vocabulary: string[];
  sentence: string;
  storytelling: string;
  educational: string;
  sales: string;
  cta: string;
  signatures: string[];
  avoid: string[];
}

export interface Myth {
  id: string;
  claim: string;
  truth: string;
  /** 0-100 how widespread the misinformation is. */
  prevalence: number;
  platforms: Platform[];
  category: TopicCategory;
}

export interface BureauAlert {
  id: string;
  bureau: "Experian" | "Equifax" | "TransUnion" | "All Bureaus";
  type: "Reporting Change" | "Scoring Change" | "Policy Change" | "Consumer Alert";
  headline: string;
  detail: string;
  date: string;
  category: TopicCategory;
}

export interface RegAlert {
  id: string;
  type: "Announcement" | "Enforcement Action" | "Complaint Trend" | "Regulatory Update";
  headline: string;
  detail: string;
  date: string;
  category: TopicCategory;
}

export interface FundingAlert {
  id: string;
  channel: "SBA" | "Fintech Lender" | "Business Program" | "Personal Program" | "Underwriting";
  headline: string;
  detail: string;
  date: string;
  category: TopicCategory;
}

export interface Objection {
  id: string;
  text: string;
  type: "Trust" | "Price" | "Timing" | "Skepticism";
  channel: "Sales Call" | "DM" | "Consultation" | "Email" | "Lead Form";
  frequency: number;
  category: TopicCategory;
}

export interface ClientPattern {
  id: string;
  metric:
    | "Inquiry Removals"
    | "Collection Removals"
    | "Charge-off Removals"
    | "Score Increase"
    | "Funding Approval";
  stat: string;
  detail: string;
  category: TopicCategory;
}

export interface FunnelOutput {
  stage: Funnel;
  angle: string;
  hook: string;
  body: string;
  cta: string;
  format: string;
  platform: Platform;
}
