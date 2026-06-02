import { withTotals } from "./scoring";
import type {
  BureauAlert,
  ClientPattern,
  CompetitorPost,
  Creator,
  DemandSignal,
  FundingAlert,
  HookEntry,
  Myth,
  Objection,
  Opportunity,
  Outlier,
  RegAlert,
  VoiceProfile,
} from "./types";

/* ───────────────────────── #1 Competitor Intelligence ───────────────────────── */

export const CREATORS: Creator[] = [
  { id: "cr1", name: "CreditQueen", handle: "@thecreditqueen", platform: "Instagram", niche: "Credit Repair", followers: 412000, avgViews: 38000, growth: 7.4 },
  { id: "cr2", name: "FundedFounder", handle: "@fundedfounder", platform: "YouTube", niche: "Business Credit", followers: 286000, avgViews: 52000, growth: 5.1 },
  { id: "cr3", name: "ScoreSensei", handle: "@scoresensei", platform: "TikTok", niche: "Personal Credit", followers: 904000, avgViews: 120000, growth: 12.8 },
  { id: "cr4", name: "WealthWired", handle: "@wealthwired", platform: "YouTube", niche: "Wealth Building", followers: 540000, avgViews: 78000, growth: 3.2 },
  { id: "cr5", name: "TheFundingPlug", handle: "@thefundingplug", platform: "Instagram", niche: "Funding", followers: 198000, avgViews: 22000, growth: 9.6 },
  { id: "cr6", name: "MoneyMechanic", handle: "@moneymechanic", platform: "X", niche: "Financial Literacy", followers: 167000, avgViews: 14000, growth: 6.0 },
];

export const COMPETITOR_POSTS: CompetitorPost[] = [
  { id: "cp1", creator: "ScoreSensei", handle: "@scoresensei", platform: "TikTok", title: "The 1 letter that deleted my collection", hook: "Stop paying collections until you send THIS.", cta: "Comment LETTER for the template", views: 412000, likes: 38400, comments: 2210, shares: 9800, saves: 26100, postedAt: "2026-05-26", category: "Credit Repair" },
  { id: "cp2", creator: "FundedFounder", handle: "@fundedfounder", platform: "YouTube", title: "How I got $50k business credit with a new LLC", hook: "A 30-day-old LLC just got $50k. Here's the order.", cta: "Grab the vendor list (link below)", views: 96000, likes: 7100, comments: 880, shares: 1200, saves: 8400, postedAt: "2026-05-24", category: "Business Credit" },
  { id: "cp3", creator: "CreditQueen", handle: "@thecreditqueen", platform: "Instagram", title: "Why your 750 still got denied", hook: "A 750 score got denied — here's the real reason.", cta: "Save this before you apply", views: 188000, likes: 15200, comments: 1640, shares: 4300, saves: 21800, postedAt: "2026-05-28", category: "Funding" },
  { id: "cp4", creator: "MoneyMechanic", handle: "@moneymechanic", platform: "X", title: "Utilization myth thread", hook: "You don't need to keep utilization at 30%. That's a myth.", cta: "Bookmark for your next statement", views: 54000, likes: 3100, comments: 410, shares: 980, saves: 2600, postedAt: "2026-05-27", category: "Credit Myths" },
  { id: "cp5", creator: "TheFundingPlug", handle: "@thefundingplug", platform: "Instagram", title: "3 fintech lenders not checking personal credit", hook: "These 3 lenders don't pull personal credit.", cta: "DM 'FUND' for the list", views: 142000, likes: 11800, comments: 2050, shares: 5200, saves: 19400, postedAt: "2026-05-25", category: "Funding" },
  { id: "cp6", creator: "WealthWired", handle: "@wealthwired", platform: "YouTube", title: "Turn a 580 into a 720 in 6 months", hook: "580 to 720 in six months — exact timeline.", cta: "Watch the full roadmap", views: 81000, likes: 6200, comments: 720, shares: 1500, saves: 9100, postedAt: "2026-05-22", category: "Personal Credit" },
  { id: "cp7", creator: "FundedFounder", handle: "@fundedfounder", platform: "YouTube", title: "The exact order to build business credit (full walkthrough)", hook: "Build business credit in the RIGHT order or you'll stall at tier 1.", cta: "Download the tier list", views: 134000, likes: 9400, comments: 1180, shares: 2100, saves: 16700, postedAt: "2026-05-20", category: "Business Credit" },
  { id: "cp8", creator: "WealthWired", handle: "@wealthwired", platform: "YouTube", title: "5 funding mistakes that get you auto-denied", hook: "These 5 mistakes get you auto-denied before a human ever looks.", cta: "Get the pre-application checklist", views: 102000, likes: 7600, comments: 940, shares: 1700, saves: 12300, postedAt: "2026-05-18", category: "Funding" },
  { id: "cp9", creator: "ScoreSensei", handle: "@scoresensei", platform: "YouTube", title: "How credit scoring REALLY works (FICO vs Vantage)", hook: "Everything you were told about your score is half true.", cta: "Subscribe for the deep dives", views: 67000, likes: 4900, comments: 610, shares: 880, saves: 7400, postedAt: "2026-05-16", category: "Credit Education" },
  { id: "cp10", creator: "TheFundingPlug", handle: "@thefundingplug", platform: "TikTok", title: "POV: your LLC just got its first $10k", hook: "Your 2-week-old LLC can get $10k. Here's lender #1.", cta: "DM 'PLUG' for the list", views: 221000, likes: 18900, comments: 2600, shares: 7400, saves: 24100, postedAt: "2026-05-29", category: "Business Credit" },
  { id: "cp11", creator: "CreditQueen", handle: "@thecreditqueen", platform: "Instagram", title: "3 things to do BEFORE you dispute", hook: "Disputing first is why your rounds keep failing.", cta: "Save this checklist", views: 156000, likes: 13200, comments: 1490, shares: 3800, saves: 22600, postedAt: "2026-05-27", category: "Credit Repair" },
];

export const TRENDING_TOPICS = [
  { topic: "Collection deletion letters", momentum: 94, posts: 1280 },
  { topic: "No-personal-credit funding", momentum: 88, posts: 940 },
  { topic: "Why high scores get denied", momentum: 81, posts: 610 },
  { topic: "Business credit with new LLC", momentum: 77, posts: 1120 },
  { topic: "Utilization myths", momentum: 69, posts: 540 },
  { topic: "1-on-1 dispute walkthroughs", momentum: 63, posts: 320 },
];

/* ───────────────────────── #2 Viral Outlier Detection ───────────────────────── */

export const OUTLIERS: Outlier[] = [
  {
    id: "ol1", creator: "ScoreSensei", platform: "TikTok",
    title: "The 1 letter that deleted my collection", hook: "Stop paying collections until you send THIS.",
    topic: "Collection deletion", angle: "Counterintuitive — don't pay first", cta: "Comment LETTER for the template",
    format: "Reel", views: 412000, avgViews: 120000, multiple: 3.4, thumbnail: "Bold red 'DON'T PAY' overlay on a collection letter",
    timing: "Posted 7am ET, Monday", whyItWorked: "Pattern interrupt + loss-aversion in the first 2 seconds, a concrete artifact (the letter), and a low-friction comment CTA that farms the algorithm.",
    replication: ["Open with a 'stop doing X' interrupt", "Show the physical artifact on screen", "Use a one-word comment CTA to drive engagement", "Keep it under 30 seconds"],
    opportunityScore: 91, category: "Credit Repair",
  },
  {
    id: "ol2", creator: "CreditQueen", platform: "Instagram",
    title: "Why your 750 still got denied", hook: "A 750 score got denied — here's the real reason.",
    topic: "Approval factors beyond score", angle: "Myth-bust the 'high score = approval' belief", cta: "Save this before you apply",
    format: "Carousel", views: 188000, avgViews: 38000, multiple: 4.9, thumbnail: "'750 = DENIED' in gold on black",
    timing: "Posted Thursday evening", whyItWorked: "Names a specific, believable number (750) the audience identifies with, then reframes their mental model. Carousel format maximizes saves.",
    replication: ["Lead with a specific score number", "Reframe a belief the viewer holds", "Use a carousel to maximize saves", "End on 'save before you apply'"],
    opportunityScore: 88, category: "Funding",
  },
  {
    id: "ol3", creator: "TheFundingPlug", platform: "Instagram",
    title: "3 fintech lenders not checking personal credit", hook: "These 3 lenders don't pull personal credit.",
    topic: "No-PG funding", angle: "Insider list / access", cta: "DM 'FUND' for the list",
    format: "Reel", views: 142000, avgViews: 22000, multiple: 6.5, thumbnail: "Three blurred lender logos with 'NO PG'",
    timing: "Posted Sunday night", whyItWorked: "Highest multiple in the set (6.5x). Exclusivity + a DM CTA that builds a warm list for funding offers. Solves a top-of-mind pain (denials).",
    replication: ["Promise an insider list", "Blur logos to imply exclusivity", "Use a DM keyword to capture leads", "Tie to the denial pain point"],
    opportunityScore: 93, category: "Funding",
  },
  {
    id: "ol4", creator: "MoneyMechanic", platform: "X",
    title: "Utilization myth thread", hook: "You don't need to keep utilization at 30%. That's a myth.",
    topic: "Utilization myth", angle: "Contrarian / myth-bust", cta: "Bookmark for your next statement",
    format: "Thread", views: 54000, avgViews: 14000, multiple: 3.9, thumbnail: "n/a (text thread)",
    timing: "Posted mid-morning weekday", whyItWorked: "Contrarian claim against a widely-repeated 'rule' triggers debate in replies, which X rewards. Practical and immediately testable.",
    replication: ["Attack a widely-repeated rule", "Back it with the mechanic (how scoring actually works)", "Invite replies to fuel reach", "Give a one-line action"],
    opportunityScore: 79, category: "Credit Myths",
  },
];

/* ───────────────────────── #3 Audience Demand Mining ───────────────────────── */

export const DEMAND_SIGNALS: DemandSignal[] = [
  { id: "d1", text: "Can collections still be removed in 2026?", type: "Question", sourceLabel: "Triad T reels", mentions: 312, sentiment: -10, category: "Credit Repair" },
  { id: "d2", text: "How do inquiries actually affect approval odds?", type: "Question", sourceLabel: "Competitor comments", mentions: 268, sentiment: -5, category: "Personal Credit" },
  { id: "d3", text: "Why was I denied with a 750 score?", type: "Confusion", sourceLabel: "Funding content", mentions: 401, sentiment: -42, category: "Funding" },
  { id: "d4", text: "Does paying off a collection delete it?", type: "Misconception", sourceLabel: "Credit content", mentions: 356, sentiment: -8, category: "Credit Myths" },
  { id: "d5", text: "Is credit repair even legal?", type: "Objection", sourceLabel: "DMs", mentions: 142, sentiment: -30, category: "Consumer Rights" },
  { id: "d6", text: "How do I build business credit with a brand-new LLC?", type: "Request", sourceLabel: "Comments", mentions: 289, sentiment: 12, category: "Business Credit" },
  { id: "d7", text: "I keep getting denied — am I just stuck?", type: "Pain Point", sourceLabel: "Lead forms", mentions: 198, sentiment: -55, category: "Funding" },
  { id: "d8", text: "What's the difference between FICO and Vantage?", type: "Question", sourceLabel: "Triad T content", mentions: 176, sentiment: 0, category: "Credit Education" },
  { id: "d9", text: "Will closing a card hurt my score?", type: "Confusion", sourceLabel: "Competitor comments", mentions: 233, sentiment: -12, category: "Personal Credit" },
  { id: "d10", text: "How fast can I realistically see results?", type: "Objection", sourceLabel: "Consultation notes", mentions: 264, sentiment: -18, category: "Credit Repair" },
];

/* ───────────────────────── #4 Hook Intelligence ───────────────────────── */

export const HOOKS: HookEntry[] = [
  { id: "h1", hook: "Stop paying collections until you send THIS.", type: "Contrarian", creator: "ScoreSensei", platform: "TikTok", date: "2026-05-26", views: 412000, engagementRate: 9.1, category: "Credit Repair" },
  { id: "h2", hook: "A 750 score got denied — here's the real reason.", type: "Curiosity", creator: "CreditQueen", platform: "Instagram", date: "2026-05-28", views: 188000, engagementRate: 11.6, category: "Funding" },
  { id: "h3", hook: "These 3 lenders don't pull personal credit.", type: "Authority", creator: "TheFundingPlug", platform: "Instagram", date: "2026-05-25", views: 142000, engagementRate: 13.8, category: "Funding" },
  { id: "h4", hook: "You don't need 30% utilization. That's a myth.", type: "Myth", creator: "MoneyMechanic", platform: "X", date: "2026-05-27", views: 54000, engagementRate: 5.7, category: "Credit Myths" },
  { id: "h5", hook: "The bureaus pray you never learn this one rule.", type: "Fear", creator: "ScoreSensei", platform: "TikTok", date: "2026-05-20", views: 233000, engagementRate: 8.2, category: "Bureau Reporting" },
  { id: "h6", hook: "I deleted 14 negatives in 90 days. Receipts below.", type: "Proof", creator: "CreditQueen", platform: "Instagram", date: "2026-05-19", views: 121000, engagementRate: 10.4, category: "Credit Repair" },
  { id: "h7", hook: "I was homeless at 22. Today I fund 6-figure deals.", type: "Story", creator: "WealthWired", platform: "YouTube", date: "2026-05-15", views: 98000, engagementRate: 6.9, category: "Wealth Building" },
  { id: "h8", hook: "Last day before this reporting change hits your file.", type: "Urgency", creator: "MoneyMechanic", platform: "X", date: "2026-05-29", views: 41000, engagementRate: 7.1, category: "Bureau Reporting" },
];

/* ───────────────────────── #5 Voice Intelligence ───────────────────────── */

export const VOICE_PROFILE: VoiceProfile = {
  vocabulary: ["receipts", "the system", "real talk", "leverage", "fundable", "your file", "the order", "deletion", "approval odds", "wealth"],
  sentence: "Short, punchy openers. One idea per line. Direct address ('you', 'your file'). Frequent rhetorical questions before the payoff.",
  storytelling: "Personal proof first ('I went from… to…'), then generalizes the lesson to the viewer. Uses concrete numbers and timelines.",
  educational: "Names the myth, explains the mechanic in plain English, then gives one actionable step. Never lectures — teaches like a mentor.",
  sales: "Leads with empathy for the denial/pain, reframes the cost of inaction, then offers the next step as the obvious move. Low-pressure, high-certainty.",
  cta: "One-word comment/DM keywords ('LETTER', 'FUND'), 'save this before you apply', and 'book your free consult' for BOF.",
  signatures: ["\"Real talk —\"", "\"Here's the order:\"", "\"Save this before you apply.\"", "\"The system taught you wrong.\""],
  avoid: ["corporate jargon", "hedging ('it depends')", "generic AI phrasing", "fearmongering without a solution", "promising specific score numbers"],
};

/* ───────────────────────── #6 Credit Myth Intelligence ───────────────────────── */

export const MYTHS: Myth[] = [
  { id: "m1", claim: "Dispute everything on your report.", truth: "Mass-disputing valid items triggers 'frivolous' flags and can stall removals. Strategy beats volume.", prevalence: 86, platforms: ["TikTok", "Instagram"], category: "Credit Repair" },
  { id: "m2", claim: "Paying a collection always raises your score.", truth: "On older FICO models a paid collection still scores as a derogatory; pay-for-delete or deletion is what moves the needle.", prevalence: 78, platforms: ["TikTok", "YouTube"], category: "Credit Myths" },
  { id: "m3", claim: "Only your score matters for approval.", truth: "Lenders weigh utilization, income, inquiries, age of file and DTI — a high score with thin/utilized file still gets denied.", prevalence: 71, platforms: ["Instagram", "X"], category: "Funding" },
  { id: "m4", claim: "A 700 score guarantees approval.", truth: "Approval is a matrix, not a threshold. A 700 with 4 recent inquiries and 90% utilization is high risk.", prevalence: 64, platforms: ["TikTok", "Instagram"], category: "Funding" },
  { id: "m5", claim: "Checking your own credit hurts your score.", truth: "Self-checks are soft pulls and never affect your score. Only hard inquiries from applications do.", prevalence: 58, platforms: ["TikTok"], category: "Credit Education" },
];

/* ───────────────────────── #7 Bureau Intelligence ───────────────────────── */

export const BUREAU_ALERTS: BureauAlert[] = [
  { id: "b1", bureau: "All Bureaus", type: "Reporting Change", headline: "Medical collections under $500 no longer reported", detail: "Paid and sub-$500 medical collections continue to be excluded from consumer files — a removal lever many consumers don't know about.", date: "2026-05-21", category: "Bureau Reporting" },
  { id: "b2", bureau: "Experian", type: "Scoring Change", headline: "Experian expands 'Boost' to rent + BNPL", detail: "On-time rent and select BNPL now eligible to be added to the file, changing thin-file strategy.", date: "2026-05-18", category: "Personal Credit" },
  { id: "b3", bureau: "Equifax", type: "Policy Change", headline: "Equifax updates dispute response SLAs", detail: "Reinvestigation timelines tightened; furnishers face stricter verification windows — a timing edge for disputes.", date: "2026-05-15", category: "Consumer Rights" },
  { id: "b4", bureau: "TransUnion", type: "Consumer Alert", headline: "TransUnion flags rise in mixed-file errors", detail: "Uptick in files merged across similar names/SSNs; consumers should audit personal info sections.", date: "2026-05-24", category: "Bureau Reporting" },
];

/* ───────────────────────── #8 CFPB Intelligence ───────────────────────── */

export const CFPB_ALERTS: RegAlert[] = [
  { id: "c1", type: "Enforcement Action", headline: "CFPB fines a major furnisher for reinvestigation failures", detail: "Action centers on ignoring documented disputes — strong proof point that disputing your rights works.", date: "2026-05-20", category: "Consumer Rights" },
  { id: "c2", type: "Complaint Trend", headline: "Inaccurate-info complaints up 19% QoQ", detail: "Credit reporting remains the #1 complaint category; inaccurate information leads.", date: "2026-05-17", category: "Consumer Rights" },
  { id: "c3", type: "Regulatory Update", headline: "Proposed rule on data-broker credit reports", detail: "Could expand what counts as a consumer report — relevant to background/tenant screening content.", date: "2026-05-12", category: "Consumer Rights" },
  { id: "c4", type: "Announcement", headline: "CFPB consumer guide on medical debt refreshed", detail: "New official guidance consumers can be pointed to — high-authority citation for content.", date: "2026-05-23", category: "Financial Literacy" },
];

/* ───────────────────────── #9 Funding Intelligence ───────────────────────── */

export const FUNDING_ALERTS: FundingAlert[] = [
  { id: "f1", channel: "SBA", headline: "SBA 7(a) working-capital tweaks for small loans", detail: "Streamlined criteria for sub-$150k loans — relevant to new-business owners building fundability.", date: "2026-05-19", category: "Funding" },
  { id: "f2", channel: "Fintech Lender", headline: "Two fintech lenders drop personal-guarantee for revenue accounts", detail: "Revenue-based approvals expanding — strong 'no PG funding' content angle.", date: "2026-05-22", category: "Business Credit" },
  { id: "f3", channel: "Underwriting", headline: "Several lenders tighten inquiry sensitivity", detail: "Recent hard inquiries weighing heavier in auto-decisioning — reinforces 'space out your apps' guidance.", date: "2026-05-16", category: "Funding" },
  { id: "f4", channel: "Business Program", headline: "New net-30 vendor reporting to all 3 business bureaus", detail: "Fresh tradeline option for early business-credit files.", date: "2026-05-25", category: "Business Credit" },
  { id: "f5", channel: "Personal Program", headline: "Credit-builder loan APRs fall at major CUs", detail: "Cheaper builder products — practical starter step for thin files.", date: "2026-05-14", category: "Personal Credit" },
];

/* ───────────────────────── #10 Objection Intelligence ───────────────────────── */

export const OBJECTIONS: Objection[] = [
  { id: "o1", text: "How do I know this isn't a scam?", type: "Trust", channel: "DM", frequency: 184, category: "Consumer Rights" },
  { id: "o2", text: "Why pay you when I can dispute for free?", type: "Price", channel: "Sales Call", frequency: 213, category: "Credit Repair" },
  { id: "o3", text: "I've tried credit repair before and nothing happened.", type: "Skepticism", channel: "Consultation", frequency: 167, category: "Credit Repair" },
  { id: "o4", text: "I need results before my closing in 60 days.", type: "Timing", channel: "Lead Form", frequency: 142, category: "Funding" },
  { id: "o5", text: "Is this going to hurt my score more?", type: "Skepticism", channel: "DM", frequency: 121, category: "Personal Credit" },
  { id: "o6", text: "It's too expensive right now.", type: "Price", channel: "Email", frequency: 156, category: "Credit Repair" },
];

/* ───────────────────────── #11 Client Intelligence ───────────────────────── */

export const CLIENT_PATTERNS: ClientPattern[] = [
  { id: "ci1", metric: "Collection Removals", stat: "1,243 removed in 12 months", detail: "Medical collections had the highest deletion rate (71%) — a repeatable, provable angle.", category: "Credit Repair" },
  { id: "ci2", metric: "Score Increase", stat: "Avg +72 points in 90 days", detail: "Largest jumps came from utilization fixes + 2 deletions in the same cycle.", category: "Personal Credit" },
  { id: "ci3", metric: "Inquiry Removals", stat: "418 unauthorized inquiries removed", detail: "Inquiry disputes are fast wins clients love to see early.", category: "Consumer Rights" },
  { id: "ci4", metric: "Funding Approval", stat: "$41,200 avg approved post-program", detail: "Clients who fixed utilization before applying approved at 2.3x the rate.", category: "Funding" },
  { id: "ci5", metric: "Charge-off Removals", stat: "286 charge-offs deleted", detail: "Validation + Metro 2 challenges drove most charge-off deletions.", category: "Credit Repair" },
];

/* ───────────────────────── Unified Opportunity Set ─────────────────────────
 * Each opportunity is detected by a source and scored by the engine. Totals are
 * computed by `withTotals` so the ranking is always derived, never hard-coded.
 */
const RAW_OPPORTUNITIES: Opportunity[] = [
  {
    id: "op-ol3", source: "outlier", title: "No-PG funding list: '3 lenders that don't pull personal credit'",
    category: "Funding", funnel: "TOF", format: "Reel", platform: "Instagram",
    scores: { demand: 92, virality: 95, competition: 58, conversion: 88, authority: 70 },
    total: 0, hook: "These lenders don't pull your personal credit. Most people never hear about #2.",
    cta: "Comment FUND and I'll send the breakdown.",
    rationale: "6.5x outlier on @thefundingplug — highest multiple detected this week. Exclusivity + denial pain = mass saves and a warm funding list.",
    evidence: "Outlier: 142k views vs 22k avg (6.5x). Mirrors demand signal d7 (denials).", createdAt: "2026-05-29",
  },
  {
    id: "op-ol2", source: "outlier", title: "'Why your 750 still got denied' — approval is a matrix, not a threshold",
    category: "Funding", funnel: "MOF", format: "Carousel", platform: "Instagram",
    scores: { demand: 90, virality: 86, competition: 62, conversion: 84, authority: 82 },
    total: 0, hook: "A 750 score got denied. The number was never the problem.",
    cta: "Save this before your next application.",
    rationale: "4.9x outlier + 401 demand mentions of 'denied with a 750'. Reframes the audience's mental model and positions Triad T as the authority.",
    evidence: "Outlier 188k vs 38k avg (4.9x); demand signal d3 (401 mentions).", createdAt: "2026-05-28",
  },
  {
    id: "op-myth2", source: "myth", title: "Myth-bust: 'Paying a collection always raises your score'",
    category: "Credit Myths", funnel: "TOF", format: "Reel", platform: "TikTok",
    scores: { demand: 84, virality: 82, competition: 55, conversion: 72, authority: 80 },
    total: 0, hook: "Paying that collection might do nothing. Here's what actually deletes it.",
    cta: "Comment DELETE for the play.",
    rationale: "MYTH DETECTED at 78% prevalence and reinforced by demand misconception d4 (356 mentions). High-authority correction with a clean funnel.",
    evidence: "Myth m2 (78% prevalence) + demand d4 (356 mentions).", createdAt: "2026-05-27",
  },
  {
    id: "op-demand1", source: "demand", title: "'Can collections still be removed in 2026?' — definitive answer",
    category: "Credit Repair", funnel: "TOF", format: "Reel", platform: "TikTok",
    scores: { demand: 88, virality: 74, competition: 60, conversion: 78, authority: 76 },
    total: 0, hook: "Yes — collections still come off in 2026. The method changed, not the result.",
    cta: "Comment 2026 for the current method.",
    rationale: "312 mentions across Triad T reels. Directly answers a high-volume question while showcasing current expertise.",
    evidence: "Demand signal d1 (312 mentions).", createdAt: "2026-05-26",
  },
  {
    id: "op-bureau1", source: "bureau", title: "Reporting change: sub-$500 medical collections excluded",
    category: "Bureau Reporting", funnel: "MOF", format: "Carousel", platform: "Instagram",
    scores: { demand: 76, virality: 70, competition: 40, conversion: 74, authority: 88 },
    total: 0, hook: "If you have a medical collection under $500, the bureaus already can't report it.",
    cta: "Save this and check your report tonight.",
    rationale: "Low competition (timely, few creators covering it) + high authority. A removal lever most consumers don't know exists.",
    evidence: "Bureau alert b1 (reporting change).", createdAt: "2026-05-21",
  },
  {
    id: "op-cfpb1", source: "cfpb", title: "CFPB fined a furnisher for ignoring disputes — proof your rights work",
    category: "Consumer Rights", funnel: "MOF", format: "Short", platform: "YouTube",
    scores: { demand: 72, virality: 68, competition: 38, conversion: 70, authority: 92 },
    total: 0, hook: "The government just fined a company for ignoring disputes like yours.",
    cta: "Watch how to use this in your next round.",
    rationale: "Highest authority signal available — official enforcement as a citation. Counters the 'does disputing even work?' skepticism.",
    evidence: "CFPB alert c1 (enforcement) + objection o3 (skepticism).", createdAt: "2026-05-20",
  },
  {
    id: "op-funding2", source: "funding", title: "Fintech lenders dropping personal guarantee on revenue accounts",
    category: "Business Credit", funnel: "TOF", format: "Reel", platform: "Instagram",
    scores: { demand: 80, virality: 78, competition: 52, conversion: 82, authority: 74 },
    total: 0, hook: "Two lenders just dropped the personal guarantee. Your LLC can stand on its own.",
    cta: "Comment LLC for the fundability checklist.",
    rationale: "Fresh funding-channel change feeding the high-demand 'no PG' theme without the saturation of evergreen lists.",
    evidence: "Funding alert f2 + trending topic 'No-personal-credit funding'.", createdAt: "2026-05-22",
  },
  {
    id: "op-obj2", source: "objection", title: "'Why pay you when I can dispute for free?' — the cost of DIY",
    category: "Credit Repair", funnel: "BOF", format: "Carousel", platform: "Instagram",
    scores: { demand: 70, virality: 60, competition: 48, conversion: 90, authority: 78 },
    total: 0, hook: "You can dispute for free. Here's what it actually costs you to do it alone.",
    cta: "Book your free consult — we'll map your fastest wins.",
    rationale: "Top sales objection (213 occurrences). BOF content that pre-handles the #1 price objection lifts close rate.",
    evidence: "Objection o2 (213 occurrences, Price).", createdAt: "2026-05-25",
  },
  {
    id: "op-client1", source: "client", title: "Case study: 1,243 collections removed — medical led at 71%",
    category: "Credit Repair", funnel: "BOF", format: "Short", platform: "YouTube",
    scores: { demand: 74, virality: 72, competition: 50, conversion: 92, authority: 90 },
    total: 0, hook: "We deleted 1,243 collections last year. Here's the type that comes off fastest.",
    cta: "See if yours qualifies — free consult.",
    rationale: "Real-results proof from client data. Pairs the strongest conversion + authority scores for a bottom-funnel closer.",
    evidence: "Client pattern ci1 (1,243 removals, 71% medical).", createdAt: "2026-05-24",
  },
  {
    id: "op-hook5", source: "hook", title: "Fear-hook angle: 'The bureaus pray you never learn this rule'",
    category: "Bureau Reporting", funnel: "TOF", format: "Reel", platform: "TikTok",
    scores: { demand: 78, virality: 84, competition: 64, conversion: 66, authority: 72 },
    total: 0, hook: "The bureaus pray you never learn this one rule about your file.",
    cta: "Comment RULE and I'll break it down.",
    rationale: "Top-performing fear hook (233k views, 8.2% ER) ready to be re-skinned onto a Metro 2 accuracy lesson in Triad T's voice.",
    evidence: "Hook h5 (233k views, Fear) — replicate angle.", createdAt: "2026-05-20",
  },
  {
    id: "op-demand2", source: "demand", title: "'How do inquiries affect approval odds?' explainer",
    category: "Personal Credit", funnel: "MOF", format: "Carousel", platform: "Instagram",
    scores: { demand: 82, virality: 66, competition: 56, conversion: 76, authority: 78 },
    total: 0, hook: "Inquiries don't tank your score — but they can tank your approval. Different thing.",
    cta: "Save this before you apply anywhere.",
    rationale: "268 mentions + reinforced by underwriting alert f3 (inquiry sensitivity rising). Timely education with conversion intent.",
    evidence: "Demand d2 (268) + funding alert f3.", createdAt: "2026-05-23",
  },
  {
    id: "op-comp2", source: "competitor", title: "Business credit with a 30-day-old LLC — 'here's the order'",
    category: "Business Credit", funnel: "MOF", format: "Long-form", platform: "YouTube",
    scores: { demand: 79, virality: 70, competition: 66, conversion: 80, authority: 76 },
    total: 0, hook: "A 30-day-old LLC got funded. The secret is the ORDER you build in.",
    cta: "Grab the vendor order list — link below.",
    rationale: "Competitor @fundedfounder is converting on this theme; trending topic momentum 77. Triad T can out-teach with the exact sequence.",
    evidence: "Competitor post cp2 + trending 'Business credit with new LLC'.", createdAt: "2026-05-24",
  },
];

export const OPPORTUNITIES: Opportunity[] = withTotals(RAW_OPPORTUNITIES);

export function opportunitiesBySource(source: Opportunity["source"]): Opportunity[] {
  return OPPORTUNITIES.filter((o) => o.source === source);
}
