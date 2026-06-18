// Demo MyFreeScoreNow payloads — let the whole pipeline run end-to-end before
// live API credentials/endpoints are wired. Shape mirrors the normalized
// `MfsnClient` intermediate (see mfsn.ts), NOT a guess at MFSN's raw JSON.

import type { MfsnClient } from "./mfsn.ts";

export function demoClient(memberId?: string, hint?: { firstName?: string; lastName?: string; email?: string; phone?: string }): MfsnClient {
  const id = memberId || `MFSN-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    memberId: id,
    firstName: hint?.firstName || "Jordan",
    lastName: hint?.lastName || "Avery",
    email: hint?.email || "jordan.avery@example.com",
    phone: hint?.phone || "(470) 555-0123",
    enrollmentStatus: "active",
    dateAdded: new Date().toISOString().slice(0, 10),
    report: {
      reportDate: new Date().toISOString().slice(0, 10),
      scores: { experian: 561, equifax: 547, transunion: 573 },
      utilization: { totalLimit: 8200, totalBalance: 5740, utilizationPct: 70 },
      negatives: [
        { creditor: "Midland Credit Management", bureau: "All", accountType: "collection", balance: 1840, status: "open", remarks: "No validation on file.", dateOpened: "2023-02-10", dateReported: "2026-05-01" },
        { creditor: "Capital One", bureau: "Experian", accountType: "charge_off", balance: 2310, status: "open", remarks: "Still reporting monthly balance.", dateOpened: "2021-07-01", dateReported: "2026-05-01" },
        { creditor: "Santander Consumer USA", bureau: "TransUnion", accountType: "repossession", balance: 6420, status: "open", remarks: "Deficiency balance.", dateOpened: "2020-11-15", dateReported: "2026-04-01" },
        { creditor: "Northside Emergency", bureau: "All", accountType: "medical", balance: 410, status: "open", remarks: "Sub-$500 medical.", dateOpened: "2024-09-01", dateReported: "2026-03-01" },
      ],
      inquiries: [
        { creditor: "Credit One Bank", bureau: "Experian", inquiryDate: "2026-03-14" },
        { creditor: "Genesis FS Card", bureau: "TransUnion", inquiryDate: "2026-04-02" },
        { creditor: "Capital One Auto", bureau: "Equifax", inquiryDate: "2026-04-20" },
      ],
      publicRecords: [
        { bureau: "All", recordType: "judgment", status: "open", amount: 1250, filedDate: "2022-06-01", reference: "CV-2022-4471", remarks: "Civil judgment." },
      ],
      personalInfo: [
        { infoType: "name", value: "Jordan A. Avery", bureau: "All", status: "current" },
        { infoType: "address", value: "881 Old Mill Rd, Atlanta, GA 30318", bureau: "Experian", status: "old" },
        { infoType: "address", value: "12 Peachtree Ln, Atlanta, GA 30303", bureau: "All", status: "current" },
        { infoType: "employer", value: "Delta Logistics", bureau: "Equifax", status: "current" },
      ],
    },
  };
}
