/**
 * TRIAD T — Domain types.
 *
 * These mirror the Supabase schema in `supabase/schema.sql`. They are written
 * by hand so the UI can be built before the database is provisioned; once your
 * project is live you can regenerate with `supabase gen types typescript`.
 */

export type UUID = string;
export type Timestamp = string;

export type UserRole = "owner" | "admin" | "agent" | "viewer";

export interface User {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: Timestamp;
}

export type ClientStage =
  | "lead"
  | "consultation"
  | "onboarding"
  | "active"
  | "funding_ready"
  | "graduated"
  | "paused";

export type Bureau = "Equifax" | "Experian" | "TransUnion";

export interface Client {
  id: UUID;
  full_name: string;
  email: string | null;
  phone: string | null;
  stage: ClientStage;
  assigned_to: UUID | null;
  enrolled_at: Timestamp | null;
  goal: string | null;
  monthly_value: number;
  starting_score: number | null;
  current_score: number | null;
  target_score: number | null;
  notes: string | null;
  created_at: Timestamp;
}

export type DisputeStatus =
  | "drafted"
  | "sent"
  | "investigating"
  | "deleted"
  | "verified"
  | "escalated";

export type DisputeRound = 1 | 2 | 3 | 4 | 5;

export interface Dispute {
  id: UUID;
  client_id: UUID;
  bureau: Bureau;
  round: DisputeRound;
  status: DisputeStatus;
  strategy: string | null;
  reason: string | null;
  sent_at: Timestamp | null;
  response_due: Timestamp | null;
  outcome: string | null;
  created_at: Timestamp;
}

export type NegativeType =
  | "collection"
  | "charge_off"
  | "late_payment"
  | "inquiry"
  | "public_record"
  | "repossession"
  | "bankruptcy"
  | "student_loan";

export interface NegativeAccount {
  id: UUID;
  client_id: UUID;
  creditor: string;
  type: NegativeType;
  bureau: Bureau;
  balance: number;
  date_opened: Timestamp | null;
  status: "open" | "disputing" | "deleted" | "verified";
  notes: string | null;
  created_at: Timestamp;
}

export type Funnel = "TOF" | "MOF" | "BOF";
export type ContentFormat = "reel" | "carousel" | "story" | "post" | "long_form";
export type ContentStatus = "idea" | "scripted" | "designed" | "scheduled" | "published";

export interface ContentIdea {
  id: UUID;
  title: string;
  funnel: Funnel;
  format: ContentFormat;
  hook: string | null;
  caption: string | null;
  cta: string | null;
  status: ContentStatus;
  pillar: string | null;
  created_at: Timestamp;
}

export type ScriptType = "reel" | "carousel" | "sales" | "caption" | "vsl";

export interface Script {
  id: UUID;
  title: string;
  type: ScriptType;
  funnel: Funnel | null;
  body: string;
  word_count: number;
  created_at: Timestamp;
}

export type PsychologyType =
  | "curiosity"
  | "fear"
  | "desire"
  | "authority"
  | "social_proof"
  | "controversy"
  | "transformation"
  | "urgency";

export interface Hook {
  id: UUID;
  text: string;
  category: string;
  psychology: PsychologyType;
  funnel: Funnel;
  tags: string[];
  performance_score: number;
  created_at: Timestamp;
}

export type CreditType = "personal" | "business";

export interface FundingProfile {
  id: UUID;
  client_id: UUID;
  credit_type: CreditType;
  fico_score: number | null;
  utilization: number | null;
  total_revolving: number | null;
  derogatory_marks: number;
  inquiries_6mo: number;
  business_age_months: number | null;
  annual_revenue: number | null;
  readiness_score: number;
  recommended_products: string[];
  created_at: Timestamp;
}

export type SalesAssetType = "objection" | "sms" | "email" | "consultation";

export interface SalesScript {
  id: UUID;
  title: string;
  type: SalesAssetType;
  category: string | null;
  body: string;
  created_at: Timestamp;
}

export interface AnalyticsPoint {
  id: UUID;
  metric: string;
  category: "content" | "leads" | "clients" | "revenue";
  value: number;
  recorded_for: Timestamp;
  created_at: Timestamp;
}

export type RevenueSource =
  | "credit_repair"
  | "funding"
  | "education"
  | "consultation"
  | "affiliate";

export interface Revenue {
  id: UUID;
  client_id: UUID | null;
  source: RevenueSource;
  amount: number;
  recurring: boolean;
  recorded_for: Timestamp;
  created_at: Timestamp;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: UUID;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: UUID | null;
  client_id: UUID | null;
  due_date: Timestamp | null;
  created_at: Timestamp;
}

export type AutomationTrigger =
  | "new_lead"
  | "dispute_sent"
  | "round_complete"
  | "score_increase"
  | "payment_received"
  | "funding_ready";

export interface Automation {
  id: UUID;
  name: string;
  trigger: AutomationTrigger;
  action: string;
  enabled: boolean;
  runs: number;
  created_at: Timestamp;
}
