/**
 * Demo seed for the Client Command Center so the operational system is fully
 * populated (no placeholder screens). These records flow through the exact same
 * `useCollection` stores that MyFreeScoreNow imports and manual entry use, so
 * the UI is real on first load and writes through to Supabase when configured.
 */
import type {
  Client,
  CreditReport,
  CreditUtilization,
  DisputeRound,
  Inquiry,
  NegativeAccount,
  PersonalInformation,
  PublicRecord,
} from "./types";

export const CLIENT_SEED: Client[] = [
  {
    id: "cl-001",
    firstName: "Marcus",
    lastName: "Bennett",
    email: "marcus.bennett@example.com",
    phone: "(404) 555-0142",
    status: "disputing",
    round: 2,
    source: "myfreescorenow",
    myfreescorenowId: "MFSN-48213",
    dateAdded: "2026-04-10",
  },
  {
    id: "cl-002",
    firstName: "Alicia",
    lastName: "Reyes",
    email: "alicia.reyes@example.com",
    phone: "(305) 555-0188",
    status: "analyzing",
    round: 1,
    source: "myfreescorenow",
    myfreescorenowId: "MFSN-50917",
    dateAdded: "2026-06-09",
  },
];

export const UTILIZATION_SEED: CreditUtilization[] = [
  { id: "ut-001", clientId: "cl-001", reportId: "cr-001", totalLimit: 9200, totalBalance: 7360, utilizationPct: 80 },
  { id: "ut-002", clientId: "cl-002", reportId: "cr-002", totalLimit: 14500, totalBalance: 3915, utilizationPct: 27 },
];

export const PUBLIC_RECORD_SEED: PublicRecord[] = [
  {
    id: "pr-001",
    clientId: "cl-001",
    bureau: "All",
    recordType: "judgment",
    status: "open",
    amount: 1250,
    filedDate: "2022-06-01",
    reference: "CV-2022-4471",
    remarks: "Civil judgment — verify service & accuracy.",
  },
];

export const PERSONAL_INFO_SEED: PersonalInformation[] = [
  { id: "pi-001", clientId: "cl-001", infoType: "address", value: "881 Old Mill Rd, Atlanta, GA 30318", bureau: "Experian", status: "old" },
  { id: "pi-002", clientId: "cl-001", infoType: "address", value: "12 Peachtree Ln, Atlanta, GA 30303", bureau: "All", status: "current" },
  { id: "pi-003", clientId: "cl-001", infoType: "employer", value: "Delta Logistics", bureau: "Equifax", status: "current" },
  { id: "pi-004", clientId: "cl-002", infoType: "address", value: "455 Brickell Ave, Miami, FL 33131", bureau: "All", status: "current" },
];

export const REPORT_SEED: CreditReport[] = [
  {
    id: "cr-001",
    clientId: "cl-001",
    reportDate: "2026-06-01",
    experianScore: 552,
    equifaxScore: 538,
    transunionScore: 561,
    overallHealthScore: 41,
  },
  {
    id: "cr-002",
    clientId: "cl-002",
    reportDate: "2026-06-10",
    experianScore: 631,
    equifaxScore: 642,
    transunionScore: 628,
    overallHealthScore: 63,
  },
];

export const NEGATIVE_SEED: NegativeAccount[] = [
  {
    id: "na-001",
    clientId: "cl-001",
    bureau: "All",
    accountType: "collection",
    creditor: "Midland Credit Management",
    balance: 1840,
    status: "disputing",
    remarks: "No validation provided. DOFD appears re-aged — verify.",
  },
  {
    id: "na-002",
    clientId: "cl-001",
    bureau: "Experian",
    accountType: "charge_off",
    creditor: "Capital One",
    balance: 2310,
    status: "open",
    remarks: "Still reporting monthly balance on a charged-off account.",
  },
  {
    id: "na-003",
    clientId: "cl-001",
    bureau: "TransUnion",
    accountType: "repossession",
    creditor: "Santander Consumer USA",
    balance: 6420,
    status: "open",
    remarks: "Deficiency balance — request notice of sale + resale accounting.",
  },
  {
    id: "na-004",
    clientId: "cl-001",
    bureau: "All",
    accountType: "medical",
    creditor: "Northside Emergency Physicians",
    balance: 410,
    status: "open",
    remarks: "Sub-$500 medical — should no longer report under 2023 policy.",
  },
  {
    id: "na-005",
    clientId: "cl-002",
    bureau: "Equifax",
    accountType: "late_payment",
    creditor: "Synchrony Bank",
    balance: 0,
    status: "open",
    remarks: "Two 30-day lates in 2024. Goodwill + accuracy dispute.",
  },
  {
    id: "na-006",
    clientId: "cl-002",
    bureau: "All",
    accountType: "collection",
    creditor: "Portfolio Recovery Associates",
    balance: 920,
    status: "open",
    remarks: "Demand chain of title + assignment agreement.",
  },
];

export const INQUIRY_SEED: Inquiry[] = [
  { id: "iq-001", clientId: "cl-001", bureau: "Experian", inquiryDate: "2026-03-14", creditor: "Credit One Bank" },
  { id: "iq-002", clientId: "cl-001", bureau: "TransUnion", inquiryDate: "2026-04-02", creditor: "Genesis FS Card" },
  { id: "iq-003", clientId: "cl-002", bureau: "Equifax", inquiryDate: "2026-05-20", creditor: "Capital One Auto" },
];

export const ROUND_SEED: DisputeRound[] = [
  {
    id: "dr-001",
    clientId: "cl-001",
    roundNumber: 1,
    bureau: "All",
    dateSent: "2026-04-15",
    status: "completed",
    result: "2 of 4 items deleted (medical + 1 collection).",
  },
  {
    id: "dr-002",
    clientId: "cl-001",
    roundNumber: 2,
    bureau: "Experian",
    dateSent: "2026-05-28",
    status: "investigating",
    result: "MOV demand sent on Capital One charge-off.",
  },
];
