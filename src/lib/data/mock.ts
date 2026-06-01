/**
 * Bundled demo data. The app runs fully against this when Supabase is not yet
 * configured (Phase 1 focus: functionality before live data + AI). Each array
 * mirrors a table in `supabase/schema.sql`.
 */
import type {
  Automation,
  Client,
  ContentIdea,
  Dispute,
  FundingProfile,
  Hook,
  NegativeAccount,
  Revenue,
  SalesScript,
  Script,
  Task,
  User,
} from "@/types/database";

export const CURRENT_USER: User = {
  id: "u_owner",
  email: "tyrese@triadt.ai",
  full_name: "Tyrese Hughes",
  role: "owner",
  avatar_url: null,
  created_at: "2025-01-04T12:00:00Z",
};

export const USERS: User[] = [
  CURRENT_USER,
  {
    id: "u_agent_1",
    email: "marcus@triadt.ai",
    full_name: "Marcus Allen",
    role: "agent",
    avatar_url: null,
    created_at: "2025-02-10T12:00:00Z",
  },
  {
    id: "u_agent_2",
    email: "dana@triadt.ai",
    full_name: "Dana Whitfield",
    role: "agent",
    avatar_url: null,
    created_at: "2025-03-01T12:00:00Z",
  },
];

export const CLIENTS: Client[] = [
  {
    id: "c_1",
    full_name: "Jasmine Carter",
    email: "jasmine.c@gmail.com",
    phone: "(404) 555-0142",
    stage: "active",
    assigned_to: "u_agent_1",
    enrolled_at: "2026-02-12T00:00:00Z",
    goal: "Delete 6 collections, qualify for $75K business funding",
    monthly_value: 297,
    starting_score: 548,
    current_score: 631,
    target_score: 720,
    notes: "Highly responsive. Round 2 in progress across all 3 bureaus.",
    created_at: "2026-02-12T00:00:00Z",
  },
  {
    id: "c_2",
    full_name: "Andre Wallace",
    email: "andre.wallace@outlook.com",
    phone: "(305) 555-0199",
    stage: "funding_ready",
    assigned_to: "u_agent_1",
    enrolled_at: "2025-11-03T00:00:00Z",
    goal: "Approved for $100K+ in 0% business credit",
    monthly_value: 497,
    starting_score: 612,
    current_score: 728,
    target_score: 740,
    notes: "Personal credit optimized. Building business credit profile.",
    created_at: "2025-11-03T00:00:00Z",
  },
  {
    id: "c_3",
    full_name: "Priya Nair",
    email: "priya.nair@gmail.com",
    phone: "(678) 555-0123",
    stage: "onboarding",
    assigned_to: "u_agent_2",
    enrolled_at: "2026-05-20T00:00:00Z",
    goal: "Remove 2 charge-offs and a repossession",
    monthly_value: 297,
    starting_score: 502,
    current_score: 502,
    target_score: 680,
    notes: "Pulling reports. Power of attorney + IDs received.",
    created_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "c_4",
    full_name: "Devon Brooks",
    email: "devon.brooks@gmail.com",
    phone: "(312) 555-0177",
    stage: "active",
    assigned_to: "u_agent_2",
    enrolled_at: "2026-01-08T00:00:00Z",
    goal: "Hit 700 across all bureaus before mortgage app",
    monthly_value: 397,
    starting_score: 581,
    current_score: 668,
    target_score: 700,
    notes: "Round 3 escalation drafted for TransUnion verified item.",
    created_at: "2026-01-08T00:00:00Z",
  },
  {
    id: "c_5",
    full_name: "Sofia Ramirez",
    email: "sofia.r@gmail.com",
    phone: "(602) 555-0188",
    stage: "consultation",
    assigned_to: "u_agent_1",
    enrolled_at: null,
    goal: "Exploring program — wants to fix credit + start trucking LLC",
    monthly_value: 0,
    starting_score: 534,
    current_score: 534,
    target_score: 700,
    notes: "Consultation booked. High intent, mentioned budget concerns.",
    created_at: "2026-05-28T00:00:00Z",
  },
  {
    id: "c_6",
    full_name: "Marcus Greene",
    email: "mgreene@gmail.com",
    phone: "(770) 555-0111",
    stage: "graduated",
    assigned_to: "u_agent_1",
    enrolled_at: "2025-06-01T00:00:00Z",
    goal: "Completed — 742 score, $120K funding secured",
    monthly_value: 0,
    starting_score: 559,
    current_score: 742,
    target_score: 720,
    notes: "Success story + video testimonial captured.",
    created_at: "2025-06-01T00:00:00Z",
  },
];

export const NEGATIVE_ACCOUNTS: NegativeAccount[] = [
  { id: "n_1", client_id: "c_1", creditor: "Portfolio Recovery", type: "collection", bureau: "Equifax", balance: 1240, date_opened: "2023-04-01", status: "disputing", notes: "No signed contract on file", created_at: "2026-02-13" },
  { id: "n_2", client_id: "c_1", creditor: "Midland Credit", type: "collection", bureau: "Experian", balance: 890, date_opened: "2022-11-01", status: "deleted", notes: "Deleted round 1", created_at: "2026-02-13" },
  { id: "n_3", client_id: "c_1", creditor: "Capital One", type: "charge_off", bureau: "TransUnion", balance: 2300, date_opened: "2021-07-01", status: "disputing", notes: "Metro 2 date inconsistency", created_at: "2026-02-13" },
  { id: "n_4", client_id: "c_3", creditor: "Santander", type: "repossession", bureau: "Equifax", balance: 8400, date_opened: "2020-02-01", status: "open", notes: "Balance reporting after repo sale", created_at: "2026-05-21" },
  { id: "n_5", client_id: "c_3", creditor: "Synchrony Bank", type: "charge_off", bureau: "Experian", balance: 1650, date_opened: "2022-01-01", status: "open", notes: "", created_at: "2026-05-21" },
  { id: "n_6", client_id: "c_4", creditor: "LVNV Funding", type: "collection", bureau: "TransUnion", balance: 540, date_opened: "2023-09-01", status: "verified", notes: "Verified R2 — escalating", created_at: "2026-01-09" },
  { id: "n_7", client_id: "c_4", creditor: "Comenity Bank", type: "late_payment", bureau: "Equifax", balance: 0, date_opened: "2024-03-01", status: "disputing", notes: "Goodwill + dispute combo", created_at: "2026-01-09" },
];

export const DISPUTES: Dispute[] = [
  { id: "d_1", client_id: "c_1", bureau: "Equifax", round: 2, status: "investigating", strategy: "FCRA 611 reinvestigation — lack of signed agreement", reason: "Not mine / unverifiable", sent_at: "2026-05-10", response_due: "2026-06-09", outcome: null, created_at: "2026-05-10" },
  { id: "d_2", client_id: "c_1", bureau: "Experian", round: 1, status: "deleted", strategy: "Metro 2 compliance challenge", reason: "Inaccurate balance", sent_at: "2026-03-01", response_due: "2026-03-31", outcome: "Deleted", created_at: "2026-03-01" },
  { id: "d_3", client_id: "c_3", bureau: "Equifax", round: 1, status: "drafted", strategy: "Repossession deficiency challenge", reason: "Inaccurate balance after sale", sent_at: null, response_due: null, outcome: null, created_at: "2026-05-25" },
  { id: "d_4", client_id: "c_4", bureau: "TransUnion", round: 3, status: "escalated", strategy: "CFPB complaint — failure to provide method of verification", reason: "MOV not provided", sent_at: "2026-05-18", response_due: "2026-06-02", outcome: null, created_at: "2026-05-18" },
  { id: "d_5", client_id: "c_4", bureau: "Equifax", round: 2, status: "sent", strategy: "Goodwill + 611 combo on late payments", reason: "Goodwill adjustment", sent_at: "2026-05-22", response_due: "2026-06-21", outcome: null, created_at: "2026-05-22" },
];

export const CONTENT_IDEAS: ContentIdea[] = [
  { id: "ci_1", title: "The 3 credit myths keeping you broke", funnel: "TOF", format: "reel", hook: "Your credit score is lying to you — here's why", caption: "Most people believe these 3 myths…", cta: "Follow for daily credit tips", status: "published", pillar: "Education", created_at: "2026-05-29" },
  { id: "ci_2", title: "How I deleted 9 collections in 90 days", funnel: "MOF", format: "carousel", hook: "9 collections. Gone. Here's the exact playbook.", caption: "Swipe to see the system →", cta: "Comment 'FUND' for the free guide", status: "scheduled", pillar: "Authority", created_at: "2026-05-30" },
  { id: "ci_3", title: "Why your business got denied $50K", funnel: "BOF", format: "reel", hook: "The bank didn't deny you. Your data did.", caption: "Book a free funding audit…", cta: "DM 'AUDIT' to apply", status: "idea", pillar: "Funding", created_at: "2026-05-31" },
  { id: "ci_4", title: "Personal vs business credit explained", funnel: "TOF", format: "carousel", hook: "Stop using personal credit for business", caption: "The separation that builds wealth", cta: "Save this for later", status: "designed", pillar: "Education", created_at: "2026-05-28" },
];

export const HOOKS: Hook[] = [
  { id: "h_1", text: "Your credit score is lying to you — here's why", category: "Credit Education", psychology: "curiosity", funnel: "TOF", tags: ["myth-busting", "score"], performance_score: 92, created_at: "2026-04-01" },
  { id: "h_2", text: "I deleted 9 collections in 90 days. Here's the exact playbook.", category: "Authority", psychology: "transformation", funnel: "MOF", tags: ["proof", "playbook"], performance_score: 88, created_at: "2026-04-03" },
  { id: "h_3", text: "The bank didn't deny you. Your data did.", category: "Funding", psychology: "controversy", funnel: "BOF", tags: ["funding", "reframe"], performance_score: 85, created_at: "2026-04-05" },
  { id: "h_4", text: "If you have a 600 credit score, watch this before you apply for anything.", category: "Credit Education", psychology: "fear", funnel: "TOF", tags: ["warning", "score"], performance_score: 90, created_at: "2026-04-08" },
  { id: "h_5", text: "Broke people fix their credit. Rich people leverage it.", category: "Wealth", psychology: "desire", funnel: "MOF", tags: ["mindset", "leverage"], performance_score: 81, created_at: "2026-04-10" },
  { id: "h_6", text: "The credit repair company won't tell you this one secret.", category: "Authority", psychology: "curiosity", funnel: "TOF", tags: ["insider", "secret"], performance_score: 87, created_at: "2026-04-12" },
  { id: "h_7", text: "This is why 9 out of 10 funding applications get denied.", category: "Funding", psychology: "social_proof", funnel: "MOF", tags: ["funding", "stats"], performance_score: 79, created_at: "2026-04-15" },
  { id: "h_8", text: "You have 30 days to dispute this — or it stays for 7 years.", category: "Credit Education", psychology: "urgency", funnel: "BOF", tags: ["deadline", "dispute"], performance_score: 83, created_at: "2026-04-18" },
];

export const SCRIPTS: Script[] = [
  {
    id: "s_1",
    title: "Reel — 3 Credit Myths",
    type: "reel",
    funnel: "TOF",
    body: "HOOK: Your credit score is lying to you.\n\nBODY: Myth 1 — checking your own credit hurts your score. False. That's a soft pull.\nMyth 2 — closing old cards helps. Wrong — it tanks your utilization and age.\nMyth 3 — you need to carry a balance. Never. Pay in full, keep utilization under 10%.\n\nCTA: Follow for the credit game they never taught you.",
    word_count: 64,
    created_at: "2026-05-29",
  },
  {
    id: "s_2",
    title: "Sales — Consultation Close",
    type: "sales",
    funnel: "BOF",
    body: "FRAME: So based on what you told me, you've got 6 negatives dragging your score and you want to be funding-ready in 90 days. Is that right?\n\nGAP: Right now those items are costing you every loan, every approval, every opportunity. Doing nothing keeps you exactly where you are.\n\nBRIDGE: Our program handles the disputes, the strategy, and the funding roadmap so you don't have to guess.\n\nCLOSE: We have two ways to start — full-pay or the 3-pay plan. Which works better for you?",
    word_count: 92,
    created_at: "2026-05-20",
  },
];

export const FUNDING_PROFILES: FundingProfile[] = [
  {
    id: "f_1",
    client_id: "c_2",
    credit_type: "personal",
    fico_score: 728,
    utilization: 6,
    total_revolving: 24000,
    derogatory_marks: 0,
    inquiries_6mo: 2,
    business_age_months: null,
    annual_revenue: null,
    readiness_score: 88,
    recommended_products: ["0% intro APR business cards", "Personal LOC", "SBA pre-qual"],
    created_at: "2026-05-15",
  },
  {
    id: "f_2",
    client_id: "c_2",
    credit_type: "business",
    fico_score: null,
    utilization: null,
    total_revolving: null,
    derogatory_marks: 0,
    inquiries_6mo: 1,
    business_age_months: 14,
    annual_revenue: 96000,
    readiness_score: 64,
    recommended_products: ["Net-30 vendor accounts", "Tier 2 store cards", "Revenue-based LOC"],
    created_at: "2026-05-15",
  },
  {
    id: "f_3",
    client_id: "c_1",
    credit_type: "personal",
    fico_score: 631,
    utilization: 41,
    total_revolving: 9800,
    derogatory_marks: 3,
    inquiries_6mo: 4,
    business_age_months: null,
    annual_revenue: null,
    readiness_score: 38,
    recommended_products: ["Credit-builder loan", "Secured card", "Utilization paydown plan"],
    created_at: "2026-05-15",
  },
];

export const SALES_SCRIPTS: SalesScript[] = [
  { id: "ss_1", title: "“It’s too expensive”", type: "objection", category: "Price", body: "I hear you. Let me ask — what's it costing you right now to stay where you are? Every denied loan, every high-interest approval. The program pays for itself the first time you get approved at a real rate. We also have a 3-pay option so it's not all upfront.", created_at: "2026-04-01" },
  { id: "ss_2", title: "“I can do this myself”", type: "objection", category: "DIY", body: "You absolutely can — and some people do. The question is do you know the FCRA, FDCPA, and Metro 2 angles cold, and do you have the time to run rounds for 6 months? Most clients come to us after trying alone for a year. We compress that into a fraction of the time.", created_at: "2026-04-02" },
  { id: "ss_3", title: "Booked consultation reminder", type: "sms", category: "Reminder", body: "Hey {{first_name}}! Confirming your free credit + funding audit with TRIAD T tomorrow at {{time}}. Reply C to confirm or R to reschedule. Bring your goals — we'll map the plan. 💳📈", created_at: "2026-04-03" },
  { id: "ss_4", title: "Welcome / onboarding email", type: "email", category: "Onboarding", body: "Subject: Welcome to TRIAD T — let's get you funded 🚀\n\nHi {{first_name}},\n\nYou just made a decision your future self will thank you for. Here's what happens next:\n1) Upload your IDs + reports in the portal\n2) We build your dispute + funding strategy\n3) You start seeing deletions within 30–45 days\n\nReply to this email any time. We've got you.\n— The TRIAD T Team", created_at: "2026-04-04" },
  { id: "ss_5", title: "Discovery → close consultation script", type: "consultation", category: "Closing", body: "1. Rapport: What made you finally decide to fix this now?\n2. Discovery: Walk me through your credit + your goals.\n3. Diagnose: Here's what I'm seeing and what it's costing you.\n4. Prescribe: Here's the exact plan to get you there.\n5. Close: Which start option works best — full or 3-pay?", created_at: "2026-04-05" },
];

export const TASKS: Task[] = [
  { id: "t_1", title: "Send Round 2 letters for Jasmine (EQ/EX/TU)", status: "in_progress", priority: "high", assigned_to: "u_agent_1", client_id: "c_1", due_date: "2026-06-02", created_at: "2026-05-30" },
  { id: "t_2", title: "File CFPB complaint for Devon (TransUnion)", status: "todo", priority: "urgent", assigned_to: "u_agent_2", client_id: "c_4", due_date: "2026-06-01", created_at: "2026-05-29" },
  { id: "t_3", title: "Pull reports for Priya", status: "done", priority: "medium", assigned_to: "u_agent_2", client_id: "c_3", due_date: "2026-05-22", created_at: "2026-05-20" },
  { id: "t_4", title: "Follow up with Sofia after consult", status: "todo", priority: "high", assigned_to: "u_agent_1", client_id: "c_5", due_date: "2026-06-03", created_at: "2026-05-29" },
  { id: "t_5", title: "Record 3 TOF reels for the week", status: "todo", priority: "medium", assigned_to: "u_owner", client_id: null, due_date: "2026-06-04", created_at: "2026-05-30" },
];

export const AUTOMATIONS: Automation[] = [
  { id: "a_1", name: "New lead → SMS + email sequence", trigger: "new_lead", action: "Send welcome SMS, add to 5-day nurture email sequence", enabled: true, runs: 142, created_at: "2025-03-01" },
  { id: "a_2", name: "Dispute sent → set 30-day follow-up", trigger: "dispute_sent", action: "Create task 30 days out to check bureau response", enabled: true, runs: 318, created_at: "2025-03-01" },
  { id: "a_3", name: "Score +40 → request testimonial", trigger: "score_increase", action: "Trigger testimonial request + Google review ask", enabled: true, runs: 47, created_at: "2025-04-12" },
  { id: "a_4", name: "Funding ready → notify funding desk", trigger: "funding_ready", action: "Alert funding team + send pre-qual application", enabled: false, runs: 12, created_at: "2025-05-20" },
  { id: "a_5", name: "Payment received → send receipt + next steps", trigger: "payment_received", action: "Email receipt, advance client stage", enabled: true, runs: 261, created_at: "2025-03-15" },
];

export const REVENUE: Revenue[] = [
  { id: "r_1", client_id: "c_1", source: "credit_repair", amount: 297, recurring: true, recorded_for: "2026-05-01", created_at: "2026-05-01" },
  { id: "r_2", client_id: "c_2", source: "funding", amount: 4500, recurring: false, recorded_for: "2026-05-12", created_at: "2026-05-12" },
  { id: "r_3", client_id: "c_4", source: "credit_repair", amount: 397, recurring: true, recorded_for: "2026-05-01", created_at: "2026-05-01" },
  { id: "r_4", client_id: null, source: "education", amount: 197, recurring: false, recorded_for: "2026-05-20", created_at: "2026-05-20" },
];

/** Helper: resolve a client name from id. */
export function clientName(id: string | null): string {
  if (!id) return "—";
  return CLIENTS.find((c) => c.id === id)?.full_name ?? "Unknown";
}

export function userName(id: string | null): string {
  if (!id) return "Unassigned";
  return USERS.find((u) => u.id === id)?.full_name ?? "Unknown";
}
