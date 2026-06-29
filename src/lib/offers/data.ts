import type { Row } from "@/lib/db/use-collection";

export interface Offer extends Row {
  id: string;
  name: string;
  promise: string;
  audience: string;
  price: string;
  timeline: string;
  deliverables: string[];
  contract: string;
  upsell: string;
}

export const OFFER_SEED: Offer[] = [
  {
    id: "of-credit-repair",
    name: "Credit Repair",
    promise: "Clean the client's credit profile so they become fundable.",
    audience: "Individuals with negative items blocking approvals.",
    price: "$$",
    timeline: "3–6 months",
    deliverables: ["Intake + report review", "Round 1–4 disputes", "Progress tracker", "Client updates"],
    contract: "Credit repair agreement (DisputeFox)",
    upsell: "Credit Building → Business Funding",
  },
  {
    id: "of-credit-building",
    name: "Credit Building",
    promise: "Strengthen the positive profile and hit funding-ready scores.",
    audience: "Clients post-repair or with thin files.",
    price: "$$",
    timeline: "2–4 months",
    deliverables: ["Builder checklist", "Account-type plan", "Utilization strategy", "Funding readiness scorecard"],
    contract: "Service agreement",
    upsell: "Business Funding",
  },
  {
    id: "of-business-funding",
    name: "Business Funding",
    promise: "Access capital — DWY guidance or DFY execution.",
    audience: "Fundable clients seeking 0% / lines / loans.",
    price: "$$$ + funding fee",
    timeline: "30–90 days",
    deliverables: ["Funding intake", "Credit + structure review", "Lender match", "Bank sequence", "Approval tracking"],
    contract: "Funding agreement + funding fee agreement",
    upsell: "Business-in-a-Box",
  },
  {
    id: "of-biab",
    name: "Business-in-a-Box",
    promise: "Build the client's business infrastructure from scratch.",
    audience: "Entrepreneurs needing structure + systems.",
    price: "$$$",
    timeline: "2–6 weeks",
    deliverables: ["LLC + EIN", "Website + brand", "GoHighLevel + CRM", "Email/SMS automation", "Onboarding system"],
    contract: "Business-in-a-Box agreement",
    upsell: "Branding / Automation retainer",
  },
  {
    id: "of-affiliate",
    name: "Affiliate System",
    promise: "Brand yourself, build trust online, and earn as an affiliate.",
    audience: "Aspiring marketers / sales partners.",
    price: "$",
    timeline: "Ongoing",
    deliverables: ["Onboarding", "Commission tiers", "Training portal", "Scripts", "Tracking + payouts"],
    contract: "Affiliate agreement",
    upsell: "Accelerator / coaching",
  },
  {
    id: "of-brand",
    name: "Branding / Website / Automation",
    promise: "Operate professionally with a brand, site, and automation.",
    audience: "Business owners ready to scale.",
    price: "$$$",
    timeline: "2–4 weeks",
    deliverables: ["Brand + logo direction", "Website + funnel", "Email/SMS automation", "Lead capture"],
    contract: "Website + automation service agreement",
    upsell: "Growth retainer",
  },
];
