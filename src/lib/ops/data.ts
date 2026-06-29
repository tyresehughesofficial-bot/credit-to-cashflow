import type { Row } from "@/lib/db/use-collection";

/* ── SOPs ──────────────────────────────────────────────────────────────────── */
export interface SOP extends Row {
  id: string;
  title: string;
  category: string;
  owner: string;
  steps: string;
  version: string;
}
export const SOP_CATEGORIES = ["Onboarding", "Credit", "Funding", "Structure", "Sales", "Operations", "Finance", "Marketing"];

export const SOP_SEED: SOP[] = [
  {
    id: "sop-onboard",
    title: "Onboard a credit repair client",
    category: "Onboarding",
    owner: "Operations",
    steps:
      "1. Send intake form + service agreement (DisputeFox).\n2. Collect ID + proof of address.\n3. Import credit report (MyFreeScoreNow).\n4. Run diagnosis in the Prolific Method.\n5. Place client in phase + generate plan.\n6. Schedule kickoff call.",
    version: "1.0",
  },
  {
    id: "sop-review",
    title: "Review a credit report",
    category: "Credit",
    owner: "Credit Specialist",
    steps:
      "1. Pull tri-bureau report.\n2. Catalog negatives, inquiries, utilization, PII.\n3. Flag inaccuracies + priority.\n4. Record in Negative Tracking.\n5. Draft Round 1 strategy.",
    version: "1.0",
  },
  {
    id: "sop-update",
    title: "Update a client",
    category: "Operations",
    owner: "Operations",
    steps: "1. Check round status + bureau responses.\n2. Update statuses in the app.\n3. Send templated progress update.\n4. Log next action + due date.",
    version: "1.0",
  },
  {
    id: "sop-llc",
    title: "Create an LLC package",
    category: "Structure",
    owner: "Operations",
    steps: "1. File Articles of Organization.\n2. Obtain EIN.\n3. Set up business address + phone.\n4. Open business bank account.\n5. Draft operating agreement.\n6. Assemble lender document set.",
    version: "1.0",
  },
  {
    id: "sop-ghl",
    title: "Set up GoHighLevel",
    category: "Operations",
    owner: "Operations",
    steps: "1. Create sub-account.\n2. Build pipelines (New Lead → Upsell).\n3. Connect calendars + forms.\n4. Load email/SMS automations.\n5. Set missed-call text-back + payment links.",
    version: "1.0",
  },
  {
    id: "sop-payout",
    title: "Process affiliate payouts",
    category: "Finance",
    owner: "Administrator",
    steps: "1. Pull approved commissions.\n2. Verify against closed clients.\n3. Approve payout batch.\n4. Send payments + update status.\n5. Record in Finance.",
    version: "1.0",
  },
];

/* ── Training ──────────────────────────────────────────────────────────────── */
export interface TrainingModule extends Row {
  id: string;
  title: string;
  category: string;
  assignee: string;
  content: string;
}
export const TRAINING_CATEGORIES = ["Sales", "Product", "Operations", "Brand"];

export const TRAINING_SEED: TrainingModule[] = [
  { id: "tr-sales-offer", title: "Offer Breakdown & Scripts", category: "Sales", assignee: "Sales", content: "Offer stack, sales scripts, DM scripts, objection handling, follow-up, closing, qualification." },
  { id: "tr-prod-credit", title: "Credit Repair & Building Process", category: "Product", assignee: "Credit Specialist", content: "Dispute rounds, Metro 2, utilization strategy, funding readiness." },
  { id: "tr-prod-funding", title: "Business Funding Process", category: "Product", assignee: "Credit Specialist", content: "Lender match, bank sequence, stacking, 0% APR, approval tracking." },
  { id: "tr-ops-tools", title: "Using the Command Center", category: "Operations", assignee: "Operations", content: "Clients, Prolific Method, pipelines, SOPs, reporting." },
  { id: "tr-brand-voice", title: "Brand Voice & Mission", category: "Brand", assignee: "Editor", content: "What Triad T stands for, tone, how to speak to clients, building trust online." },
];

/* ── Contracts ─────────────────────────────────────────────────────────────── */
export interface Contract extends Row {
  id: string;
  name: string;
  type: string;
  provider: string;
  url: string;
  status: string;
}
export const CONTRACT_STATUS = ["template", "sent", "signed", "expired"];

export const CONTRACT_SEED: Contract[] = [
  { id: "ct-credit", name: "Credit Repair Agreement", type: "Service", provider: "DisputeFox", url: "", status: "template" },
  { id: "ct-funding", name: "Funding Agreement", type: "Funding", provider: "JotForm", url: "", status: "template" },
  { id: "ct-funding-fee", name: "Funding Fee Agreement", type: "Funding", provider: "JotForm", url: "", status: "template" },
  { id: "ct-affiliate", name: "Affiliate Agreement", type: "Affiliate", provider: "JotForm", url: "", status: "template" },
  { id: "ct-biab", name: "Business-in-a-Box Agreement", type: "Service", provider: "JotForm", url: "", status: "template" },
  { id: "ct-website", name: "Website Creation Agreement", type: "Service", provider: "JotForm", url: "", status: "template" },
  { id: "ct-auth", name: "Client Authorization / LOA", type: "Authorization", provider: "JotForm", url: "", status: "template" },
];

/* ── IP Library ────────────────────────────────────────────────────────────── */
export interface IPItem extends Row {
  id: string;
  name: string;
  type: string;
  notes: string;
}
export const IP_SEED: IPItem[] = [
  { id: "ip-prolific", name: "The Prolific Method", type: "Methodology", notes: "Diagnose → Repair → Rebuild → Structure → Position → Fund → Grow." },
  { id: "ip-csc", name: "Credit → Structure → Capital → Growth", type: "Mechanism", notes: "Core branded mechanism / pillars." },
  { id: "ip-ccc", name: "Credit → Capital → Cashflow", type: "Mechanism", notes: "Alternate framing." },
  { id: "ip-bankable", name: "Bankable Profile System", type: "Framework", notes: "Lender-ready profile standard." },
  { id: "ip-clarity", name: "Credit Clarity Principle", type: "Framework", notes: "Client education principle." },
  { id: "ip-sequence", name: "Funding Sequence", type: "Framework", notes: "Order of funding execution / stacking." },
  { id: "ip-biab", name: "Business-in-a-Box", type: "Offer System", notes: "Full business infrastructure build." },
  { id: "ip-wealthmap", name: "Wealth Map", type: "Dashboard", notes: "Company + client wealth tracking." },
];
