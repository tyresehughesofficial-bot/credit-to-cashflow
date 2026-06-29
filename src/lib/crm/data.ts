import type { Row } from "@/lib/db/use-collection";

/** The 10-stage pipeline from the Business OS spec. */
export const PIPELINE_STAGES = [
  "New Lead",
  "Booked Call",
  "Showed Call",
  "No Show",
  "Follow-Up",
  "Closed Client",
  "Onboarding",
  "Active Fulfillment",
  "Completed",
  "Upsell / Next Offer",
] as const;
export type Stage = (typeof PIPELINE_STAGES)[number];

export interface Contact extends Row {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string; // ad | referral | organic | affiliate | manual
  stage: Stage;
  owner: string;
  offer: string;
  value: number;
  tags: string[];
  note: string;
}

export const CONTACT_SOURCES = ["Ad", "Referral", "Organic", "Affiliate", "Manual"];

export const CONTACT_SEED: Contact[] = [
  { id: "cn-1", name: "Marcus Bennett", email: "marcus.bennett@example.com", phone: "(404) 555-0142", source: "Referral", stage: "Active Fulfillment", owner: "David", offer: "Credit Repair", value: 1497, tags: ["credit"], note: "Round 2 in progress." },
  { id: "cn-2", name: "Alicia Reyes", email: "alicia.reyes@example.com", phone: "(305) 555-0188", source: "Ad", stage: "Onboarding", owner: "Adonis", offer: "Business-in-a-Box", value: 2500, tags: ["biab"], note: "Kickoff scheduled." },
  { id: "cn-3", name: "Devon Clark", email: "devon.clark@example.com", phone: "(312) 555-0110", source: "Organic", stage: "Booked Call", owner: "Jeffrey", offer: "Business Funding", value: 3200, tags: ["funding"], note: "Consult Thu 2pm." },
  { id: "cn-4", name: "Priya Nair", email: "priya.nair@example.com", phone: "(646) 555-0173", source: "Affiliate", stage: "New Lead", owner: "Jeffrey", offer: "", value: 0, tags: [], note: "From Jordan's link." },
  { id: "cn-5", name: "Carlos Mendez", email: "carlos.m@example.com", phone: "(702) 555-0199", source: "Ad", stage: "Follow-Up", owner: "Jeffrey", offer: "Credit Repair", value: 1497, tags: ["warm"], note: "Wants to think about it." },
  { id: "cn-6", name: "Tanya Brooks", email: "tanya.b@example.com", phone: "(214) 555-0122", source: "Referral", stage: "Closed Client", owner: "Jeffrey", offer: "Credit Building", value: 800, tags: [], note: "Paid — ready to onboard." },
  { id: "cn-7", name: "Sam Okafor", email: "sam.okafor@example.com", phone: "(773) 555-0166", source: "Organic", stage: "No Show", owner: "Jeffrey", offer: "", value: 0, tags: [], note: "Missed consult — re-book." },
];

export const ACTIVITY_TYPES = ["call", "sms", "email", "note", "task"];
export interface Activity extends Row {
  id: string;
  contact: string;
  type: string;
  summary: string;
  date: string;
}
export const ACTIVITY_SEED: Activity[] = [
  { id: "ac-1", contact: "Marcus Bennett", type: "call", summary: "Round 2 update call — happy with progress.", date: "2026-06-22" },
  { id: "ac-2", contact: "Devon Clark", type: "sms", summary: "Sent consult confirmation + prep.", date: "2026-06-24" },
  { id: "ac-3", contact: "Carlos Mendez", type: "task", summary: "Follow up Friday re: decision.", date: "2026-06-27" },
];

export const BOOKING_SEED: Activity[] = [
  { id: "bk-1", contact: "Devon Clark", type: "Consult", summary: "Funding strategy consult", date: "2026-07-02 14:00" },
  { id: "bk-2", contact: "Priya Nair", type: "Discovery", summary: "Intro call", date: "2026-07-03 11:00" },
];

export interface Deal extends Row {
  id: string;
  name: string;
  contact: string;
  offer: string;
  amount: number;
  status: string; // open | won | lost
}
export const DEAL_STATUS = ["open", "won", "lost"];
export const DEAL_SEED: Deal[] = [
  { id: "dl-1", name: "Bennett — Credit Repair", contact: "Marcus Bennett", offer: "Credit Repair", amount: 1497, status: "won" },
  { id: "dl-2", name: "Reyes — BIAB", contact: "Alicia Reyes", offer: "Business-in-a-Box", amount: 2500, status: "won" },
  { id: "dl-3", name: "Clark — Funding", contact: "Devon Clark", offer: "Business Funding", amount: 3200, status: "open" },
  { id: "dl-4", name: "Mendez — Repair", contact: "Carlos Mendez", offer: "Credit Repair", amount: 1497, status: "open" },
];

export interface Payment extends Row {
  id: string;
  contact: string;
  amount: number;
  method: string; // card | ach | cash | link
  status: string; // pending | paid | refunded
  link: string;
  date: string;
}
export const PAYMENT_METHODS = ["card", "ach", "cash", "link"];
export const PAYMENT_STATUS = ["pending", "paid", "refunded"];
export const PAYMENT_SEED: Payment[] = [
  { id: "pm-1", contact: "Marcus Bennett", amount: 1497, method: "card", status: "paid", link: "", date: "2026-06-03" },
  { id: "pm-2", contact: "Alicia Reyes", amount: 1250, method: "card", status: "paid", link: "", date: "2026-06-14" },
  { id: "pm-3", contact: "Devon Clark", amount: 3200, method: "link", status: "pending", link: "triadt.co/pay/devon", date: "2026-06-28" },
];

export function pipelineValue(contacts: Contact[]): number {
  return contacts
    .filter((c) => c.stage !== "Completed" && c.stage !== "No Show")
    .reduce((a, c) => a + Number(c.value || 0), 0);
}
