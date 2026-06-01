/** Aggregated metrics + time series for the Command Center & Analytics modules. */

export interface MetricSummary {
  label: string;
  value: string;
  rawDelta: number; // percent change vs prior period
  hint: string;
}

export const CONTENT_METRICS: MetricSummary[] = [
  { label: "Posts Published", value: "18", rawDelta: 12.5, hint: "this week" },
  { label: "Total Reach", value: "412K", rawDelta: 28.4, hint: "30-day rolling" },
  { label: "Engagement Rate", value: "6.8%", rawDelta: 1.9, hint: "avg / post" },
  { label: "Saves + Shares", value: "9.2K", rawDelta: 34.1, hint: "high-intent signal" },
];

export const LEAD_METRICS: MetricSummary[] = [
  { label: "New Leads", value: "146", rawDelta: 22.0, hint: "this month" },
  { label: "Booked Consults", value: "38", rawDelta: 9.4, hint: "this month" },
  { label: "Show Rate", value: "71%", rawDelta: 4.2, hint: "consults attended" },
  { label: "Lead → Client", value: "31%", rawDelta: -2.1, hint: "conversion" },
];

export const CLIENT_METRICS: MetricSummary[] = [
  { label: "Active Clients", value: "84", rawDelta: 7.1, hint: "in program" },
  { label: "Avg Score Lift", value: "+74", rawDelta: 11.0, hint: "since enrollment" },
  { label: "Items Deleted", value: "1,284", rawDelta: 18.6, hint: "all-time" },
  { label: "Funding-Ready", value: "19", rawDelta: 26.7, hint: "clients" },
];

export const REVENUE_METRICS: MetricSummary[] = [
  { label: "MRR", value: "$28,940", rawDelta: 14.2, hint: "recurring" },
  { label: "Funding Commissions", value: "$41,200", rawDelta: 31.8, hint: "this month" },
  { label: "Total Revenue", value: "$92,640", rawDelta: 19.5, hint: "this month" },
  { label: "LTV : CAC", value: "5.4x", rawDelta: 8.0, hint: "blended" },
];

export interface SeriesPoint {
  month: string;
  [key: string]: string | number;
}

export const REVENUE_SERIES: SeriesPoint[] = [
  { month: "Dec", recurring: 18200, funding: 21000, education: 3200 },
  { month: "Jan", recurring: 20100, funding: 24500, education: 4100 },
  { month: "Feb", recurring: 21900, funding: 19800, education: 2900 },
  { month: "Mar", recurring: 23800, funding: 28400, education: 5200 },
  { month: "Apr", recurring: 26100, funding: 33900, education: 4800 },
  { month: "May", recurring: 28940, funding: 41200, education: 6100 },
];

export const LEADS_SERIES: SeriesPoint[] = [
  { month: "Dec", leads: 88, consults: 24, clients: 9 },
  { month: "Jan", leads: 102, consults: 28, clients: 12 },
  { month: "Feb", leads: 96, consults: 26, clients: 10 },
  { month: "Mar", leads: 121, consults: 31, clients: 14 },
  { month: "Apr", leads: 134, consults: 35, clients: 17 },
  { month: "May", leads: 146, consults: 38, clients: 18 },
];

export const CONTENT_SERIES: SeriesPoint[] = [
  { month: "Dec", reach: 180000, engagement: 4.1 },
  { month: "Jan", reach: 224000, engagement: 4.8 },
  { month: "Feb", reach: 251000, engagement: 5.2 },
  { month: "Mar", reach: 309000, engagement: 5.9 },
  { month: "Apr", reach: 366000, engagement: 6.4 },
  { month: "May", reach: 412000, engagement: 6.8 },
];

export const FUNNEL_MIX = [
  { name: "TOF (Awareness)", value: 52, color: "#E6C65A" },
  { name: "MOF (Consideration)", value: 31, color: "#D4AF37" },
  { name: "BOF (Conversion)", value: 17, color: "#A07D1F" },
];

export const REVENUE_BY_SOURCE = [
  { name: "Funding", value: 41200, color: "#D4AF37" },
  { name: "Credit Repair", value: 28940, color: "#E6C65A" },
  { name: "Education", value: 6100, color: "#A07D1F" },
  { name: "Consultation", value: 9800, color: "#7A5F16" },
  { name: "Affiliate", value: 6600, color: "#54410E" },
];
