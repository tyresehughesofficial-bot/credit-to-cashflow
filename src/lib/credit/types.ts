/**
 * TRIAD T — CREDIT SYSTEM data model (camelCase records ⇄ snake_case columns).
 *
 * Two distinct systems share these primitives but never the same data:
 *   • Client Command Center — operational client data (these tables).
 *   • Bureau Intelligence    — internal bureau knowledge (see ./bureau-intel).
 */

export type BureauName = "Experian" | "Equifax" | "TransUnion";
export const BUREAUS: BureauName[] = ["Experian", "Equifax", "TransUnion"];

export type ClientStatus =
  | "lead"
  | "imported"
  | "analyzing"
  | "active"
  | "disputing"
  | "funding_ready"
  | "graduated"
  | "paused";

export const CLIENT_STATUSES: ClientStatus[] = [
  "lead",
  "imported",
  "analyzing",
  "active",
  "disputing",
  "funding_ready",
  "graduated",
  "paused",
];

export type HealthBand = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export type RoundStatus = "drafted" | "sent" | "investigating" | "completed" | "escalated";

export type NegativeType =
  | "collection"
  | "charge_off"
  | "repossession"
  | "late_payment"
  | "public_record"
  | "bankruptcy"
  | "medical";

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export type ClientSource = "myfreescorenow" | "disputefox" | "manual";

/** clients */
export interface Client {
  id: string;
  createdAt?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: ClientStatus;
  round: number;
  myfreescorenowId?: string;
  source?: ClientSource;
  externalId?: string;
  enrollmentStatus?: string;
  dateAdded?: string;
  // Manual-entry extras
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  dob?: string;
  notes?: string;
  program?: string;
  startDate?: string;
  assignedTo?: string;
}

/** report_uploads */
export interface ReportUpload {
  id: string;
  clientId: string;
  source?: string;
  originalFilename?: string;
  fileType?: string;
  storagePath?: string;
  uploadedAt?: string;
  processingStatus?: string;
  processingError?: string;
  createdAt?: string;
}

/** tradelines */
export interface Tradeline {
  id: string;
  clientId: string;
  creditReportId?: string;
  creditor: string;
  accountType?: string;
  accountNumberMasked?: string;
  balance?: number;
  creditLimit?: number;
  paymentStatus?: string;
  dateOpened?: string;
  lastReported?: string;
  bureau?: string;
  isNegative?: boolean;
}

/** credit_reports */
export interface CreditReport {
  id: string;
  clientId: string;
  reportDate?: string;
  experianScore?: number;
  equifaxScore?: number;
  transunionScore?: number;
  overallHealthScore?: number;
  createdAt?: string;
}

/** negative_accounts */
export interface NegativeAccount {
  id: string;
  clientId: string;
  bureau: string; // BureauName | "All"
  accountType: NegativeType | string;
  creditor: string;
  balance: number;
  status: string; // open | disputing | deleted | verified | paid
  remarks?: string;
  createdAt?: string;
}

/** inquiries */
export interface Inquiry {
  id: string;
  clientId: string;
  bureau: string;
  inquiryDate?: string;
  creditor: string;
  createdAt?: string;
}

/** dispute_rounds */
export interface DisputeRound {
  id: string;
  clientId: string;
  roundNumber: number;
  bureau: string;
  dateSent?: string;
  status: RoundStatus;
  result?: string;
  createdAt?: string;
}

/** ai_diagnosis */
export interface AiDiagnosis {
  id: string;
  clientId: string;
  diagnosis: string;
  recommendations: string;
  priorityLevel: PriorityLevel | string;
  healthBand: HealthBand;
  createdAt?: string;
}

/** credit_utilization */
export interface CreditUtilization {
  id: string;
  clientId: string;
  reportId?: string;
  totalLimit: number;
  totalBalance: number;
  utilizationPct: number;
  createdAt?: string;
}

/** public_records */
export interface PublicRecord {
  id: string;
  clientId: string;
  bureau: string;
  recordType: string; // bankruptcy | judgment | lien
  status?: string;
  amount: number;
  filedDate?: string;
  reference?: string;
  remarks?: string;
  createdAt?: string;
}

/** personal_information */
export interface PersonalInformation {
  id: string;
  clientId: string;
  infoType: string; // name | address | employer | phone
  value: string;
  bureau?: string;
  status?: string; // current | old | unauthorized
  createdAt?: string;
}

export const fullName = (c: Pick<Client, "firstName" | "lastName">) =>
  `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unnamed Client";
