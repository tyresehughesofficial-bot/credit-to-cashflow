import type { Field } from "@/components/intelligence/data-table";
import type { Row } from "@/lib/db/use-collection";
import {
  CLIENT_PATTERNS,
  COMPETITOR_POSTS,
  DEMAND_SIGNALS,
  HOOKS,
  MYTHS,
  OBJECTIONS,
  OUTLIERS,
} from "./data";

/** Supabase / localStorage collection (table) names. */
export const COLL = {
  competitorPosts: "competitor_posts",
  outliers: "viral_outliers",
  questions: "extracted_questions",
  objections: "extracted_objections",
  hooks: "hooks",
  myths: "credit_myths",
  clientPatterns: "client_patterns",
  opportunities: "content_opportunities",
  analytics: "analytics_metrics",
} as const;

/** Editable, database-driven KPIs for the Analytics Center. */
export const ANALYTICS_SEED: Row[] = [
  { id: "posts", label: "Posts Published", value: "0", delta: "", period: "this week", group: "content" },
  { id: "reach", label: "Reach", value: "412000", delta: "+28.4%", period: "30-day", group: "content" },
  { id: "engagement", label: "Engagement Rate", value: "6.8%", delta: "+1.9%", period: "avg / post", group: "content" },
  { id: "saves", label: "Saves + Shares", value: "9200", delta: "+34.1%", period: "30-day", group: "content" },
  { id: "leads", label: "Leads Generated", value: "214", delta: "+18.2%", period: "this month", group: "leads" },
  { id: "consults", label: "Consultations Booked", value: "63", delta: "+22.0%", period: "this month", group: "leads" },
  { id: "clients", label: "Clients Closed", value: "27", delta: "+9.0%", period: "this month", group: "clients" },
  { id: "revenue", label: "Revenue Generated", value: "92640", delta: "+19.5%", period: "this month", group: "revenue" },
];

export const ANALYTICS_FIELDS: Field[] = [
  { key: "label", label: "Metric" },
  { key: "value", label: "Value" },
  { key: "delta", label: "Delta" },
  { key: "period", label: "Period" },
  { key: "group", label: "Group", type: "select", options: ["content", "leads", "clients", "revenue"] },
];

const PLATFORMS = ["YouTube", "TikTok", "Instagram", "X"];
const CATEGORIES = [
  "Credit Repair", "Personal Credit", "Business Credit", "Funding", "Financial Literacy",
  "Consumer Rights", "Bureau Reporting", "Credit Myths", "Credit Education",
  "Entrepreneurship", "Wealth Building",
];

export const SEED: Record<string, Row[]> = {
  [COLL.competitorPosts]: COMPETITOR_POSTS as unknown as Row[],
  [COLL.outliers]: OUTLIERS as unknown as Row[],
  [COLL.questions]: DEMAND_SIGNALS as unknown as Row[],
  [COLL.objections]: OBJECTIONS as unknown as Row[],
  [COLL.hooks]: HOOKS as unknown as Row[],
  [COLL.myths]: MYTHS as unknown as Row[],
  [COLL.clientPatterns]: CLIENT_PATTERNS as unknown as Row[],
};

export const FIELDS: Record<string, Field[]> = {
  [COLL.competitorPosts]: [
    { key: "title", label: "Title", placeholder: "Video / post title" },
    { key: "creator", label: "Creator" },
    { key: "hook", label: "Hook", type: "textarea", hideInTable: true },
    { key: "cta", label: "CTA", hideInTable: true },
    { key: "platform", label: "Platform", type: "select", options: PLATFORMS },
    { key: "views", label: "Views", type: "number" },
    { key: "likes", label: "Likes", type: "number", hideInTable: true },
    { key: "comments", label: "Comments", type: "number", hideInTable: true },
    { key: "shares", label: "Shares", type: "number", hideInTable: true },
    { key: "saves", label: "Saves", type: "number" },
    { key: "postedAt", label: "Posted", placeholder: "YYYY-MM-DD" },
    { key: "category", label: "Category", type: "select", options: CATEGORIES },
  ],
  [COLL.outliers]: [
    { key: "title", label: "Title" },
    { key: "creator", label: "Creator" },
    { key: "hook", label: "Hook", type: "textarea", hideInTable: true },
    { key: "topic", label: "Topic", hideInTable: true },
    { key: "angle", label: "Angle", hideInTable: true },
    { key: "cta", label: "CTA", hideInTable: true },
    { key: "format", label: "Format" },
    { key: "platform", label: "Platform", type: "select", options: PLATFORMS },
    { key: "views", label: "Views", type: "number" },
    { key: "avgViews", label: "Avg Views", type: "number" },
    { key: "multiple", label: "Multiple", type: "number" },
    { key: "whyItWorked", label: "Why it worked", type: "textarea", hideInTable: true },
    { key: "opportunityScore", label: "Opp Score", type: "number" },
    { key: "category", label: "Category", type: "select", options: CATEGORIES, hideInTable: true },
  ],
  [COLL.questions]: [
    { key: "text", label: "Question / Signal", type: "textarea" },
    { key: "type", label: "Type", type: "select", options: ["Question", "Confusion", "Misconception", "Request", "Pain Point", "Objection"] },
    { key: "sourceLabel", label: "Source" },
    { key: "mentions", label: "Mentions", type: "number" },
    { key: "sentiment", label: "Sentiment", type: "number", hideInTable: true },
    { key: "category", label: "Category", type: "select", options: CATEGORIES },
  ],
  [COLL.objections]: [
    { key: "text", label: "Objection", type: "textarea" },
    { key: "type", label: "Type", type: "select", options: ["Trust", "Price", "Timing", "Skepticism"] },
    { key: "channel", label: "Channel", type: "select", options: ["Sales Call", "DM", "Consultation", "Email", "Lead Form"] },
    { key: "frequency", label: "Frequency", type: "number" },
    { key: "category", label: "Category", type: "select", options: CATEGORIES, hideInTable: true },
  ],
  [COLL.hooks]: [
    { key: "hook", label: "Hook", type: "textarea" },
    { key: "type", label: "Type", type: "select", options: ["Curiosity", "Fear", "Authority", "Myth", "Contrarian", "Proof", "Story", "Urgency"] },
    { key: "creator", label: "Creator" },
    { key: "platform", label: "Platform", type: "select", options: PLATFORMS },
    { key: "date", label: "Date", placeholder: "YYYY-MM-DD", hideInTable: true },
    { key: "views", label: "Views", type: "number" },
    { key: "engagementRate", label: "ER %", type: "number" },
    { key: "category", label: "Category", type: "select", options: CATEGORIES, hideInTable: true },
  ],
  [COLL.myths]: [
    { key: "claim", label: "Myth (claim)", type: "textarea" },
    { key: "truth", label: "Truth", type: "textarea", hideInTable: true },
    { key: "prevalence", label: "Prevalence %", type: "number" },
    { key: "platforms", label: "Platforms", type: "tags", placeholder: "TikTok; Instagram", hideInTable: true },
    { key: "category", label: "Category", type: "select", options: CATEGORIES },
  ],
  [COLL.clientPatterns]: [
    { key: "metric", label: "Metric", type: "select", options: ["Inquiry Removals", "Collection Removals", "Charge-off Removals", "Score Increase", "Funding Approval"] },
    { key: "stat", label: "Stat" },
    { key: "detail", label: "Detail", type: "textarea", hideInTable: true },
    { key: "category", label: "Category", type: "select", options: CATEGORIES },
  ],
};
