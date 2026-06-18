// Pure mapping: normalized MfsnClient → Supabase row objects (snake_case).
// No I/O here — index.ts performs the writes with the service-role client.

import type { MfsnClient } from "./mfsn.ts";

export interface NormalizedRows {
  client: Record<string, unknown>;
  report: Record<string, unknown>;
  utilization: Record<string, unknown> | null;
  negatives: Record<string, unknown>[];
  inquiries: Record<string, unknown>[];
  publicRecords: Record<string, unknown>[];
  personalInfo: Record<string, unknown>[];
}

export function normalize(c: MfsnClient, clientId: string, reportId: string): NormalizedRows {
  const u = c.report.utilization;
  return {
    client: {
      id: clientId,
      first_name: c.firstName,
      last_name: c.lastName,
      email: c.email ?? null,
      phone: c.phone ?? null,
      status: "imported",
      round: 0,
      myfreescorenow_id: c.memberId,
      source: "myfreescorenow",
      external_id: c.memberId,
      enrollment_status: c.enrollmentStatus ?? null,
      date_added: c.dateAdded ?? new Date().toISOString().slice(0, 10),
    },
    report: {
      id: reportId,
      client_id: clientId,
      report_date: c.report.reportDate ?? new Date().toISOString().slice(0, 10),
      experian_score: c.report.scores.experian ?? null,
      equifax_score: c.report.scores.equifax ?? null,
      transunion_score: c.report.scores.transunion ?? null,
    },
    utilization: u
      ? {
          client_id: clientId,
          report_id: reportId,
          total_limit: u.totalLimit ?? 0,
          total_balance: u.totalBalance ?? 0,
          utilization_pct:
            u.utilizationPct ?? (u.totalLimit ? Math.round(((u.totalBalance ?? 0) / u.totalLimit) * 100) : 0),
          per_account: u.perAccount ?? null,
        }
      : null,
    negatives: c.report.negatives.map((n) => ({
      client_id: clientId,
      bureau: n.bureau,
      account_type: n.accountType,
      creditor: n.creditor,
      balance: n.balance ?? 0,
      status: n.status ?? "open",
      remarks: n.remarks ?? null,
    })),
    inquiries: c.report.inquiries.map((q) => ({
      client_id: clientId,
      bureau: q.bureau,
      inquiry_date: q.inquiryDate ?? null,
      creditor: q.creditor,
    })),
    publicRecords: c.report.publicRecords.map((p) => ({
      client_id: clientId,
      bureau: p.bureau,
      record_type: p.recordType,
      status: p.status ?? null,
      amount: p.amount ?? 0,
      filed_date: p.filedDate ?? null,
      reference: p.reference ?? null,
      remarks: p.remarks ?? null,
    })),
    personalInfo: c.report.personalInfo.map((pi) => ({
      client_id: clientId,
      info_type: pi.infoType,
      value: pi.value,
      bureau: pi.bureau ?? null,
      status: pi.status ?? "current",
    })),
  };
}
