"use client";

/**
 * Manual client + report creation (no MyFreeScoreNow). Writes through the same
 * collections MFSN uses, so it persists locally + to Supabase when configured.
 * source = "manual". Never stores full SSNs or account numbers.
 */
import { collectionUpsert, type Row } from "@/lib/db/use-collection";
import type { Client, ClientStatus } from "./types";

export interface ManualClientInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  dob?: string;
  notes?: string;
  status?: ClientStatus;
  program?: string;
  startDate?: string;
  assignedTo?: string;
  // bureau scores
  experianScore?: number;
  equifaxScore?: number;
  transunionScore?: number;
  scoreDate?: string;
  // credit details
  totalLimit?: number;
  totalBalance?: number;
  utilizationPct?: number;
  negativeCount?: number;
  inquiryCount?: number;
  oldestAgeMonths?: number;
  avgAgeMonths?: number;
}

const uid = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;
const up = (table: string, rec: Record<string, unknown> & { id: string }) => collectionUpsert(table, rec as Row);

/** Create a manual client (+ optional report/utilization/address). Returns the new client id. */
export function createManualClient(input: ManualClientInput): string {
  const clientId = uid("cl");
  const fullAddress = [input.address, [input.city, input.state].filter(Boolean).join(", "), input.zip].filter(Boolean).join(", ");

  const client: Client = {
    id: clientId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email || undefined,
    phone: input.phone || undefined,
    status: input.status ?? "active",
    round: 0,
    source: "manual",
    dateAdded: input.startDate || new Date().toISOString().slice(0, 10),
    address: input.address || undefined,
    city: input.city || undefined,
    state: input.state || undefined,
    zip: input.zip || undefined,
    dob: input.dob || undefined,
    notes: input.notes || undefined,
    program: input.program || undefined,
    startDate: input.startDate || undefined,
    assignedTo: input.assignedTo || undefined,
  };
  up("clients", client as unknown as Row & { id: string });
  up("client_sources", { id: uid("cs"), clientId, source: "manual", externalId: null, status: input.status ?? "active" } as Row & { id: string });

  // Bureau scores → credit_reports
  const hasScores = input.experianScore || input.equifaxScore || input.transunionScore;
  let reportId: string | undefined;
  if (hasScores) {
    reportId = uid("cr");
    up("credit_reports", {
      id: reportId,
      clientId,
      reportDate: input.scoreDate || new Date().toISOString().slice(0, 10),
      experianScore: input.experianScore ?? null,
      equifaxScore: input.equifaxScore ?? null,
      transunionScore: input.transunionScore ?? null,
    } as Row & { id: string });
  }

  // Credit details → credit_utilization (+ summary counts in per_account)
  const hasUtil = input.totalLimit || input.totalBalance || input.utilizationPct || input.negativeCount || input.inquiryCount;
  if (hasUtil) {
    up("credit_utilization", {
      id: uid("ut"),
      clientId,
      reportId: reportId ?? null,
      totalLimit: input.totalLimit ?? 0,
      totalBalance: input.totalBalance ?? 0,
      utilizationPct:
        input.utilizationPct ?? (input.totalLimit ? Math.round(((input.totalBalance ?? 0) / input.totalLimit) * 100) : 0),
      perAccount: {
        negativeCount: input.negativeCount ?? null,
        inquiryCount: input.inquiryCount ?? null,
        oldestAgeMonths: input.oldestAgeMonths ?? null,
        avgAgeMonths: input.avgAgeMonths ?? null,
      },
    } as Row & { id: string });
  }

  // Address → personal_information (feeds the letter generators)
  if (fullAddress) {
    up("personal_information", {
      id: uid("pi"),
      clientId,
      infoType: "address",
      value: fullAddress,
      bureau: null,
      status: "current",
    } as Row & { id: string });
  }

  return clientId;
}
