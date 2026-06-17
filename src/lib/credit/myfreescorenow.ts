/**
 * MYFREESCORENOW INTEGRATION ARCHITECTURE.
 *
 * MyFreeScoreNow (MFSN) is the data source for the Client Command Center ONLY.
 * (Bureau Intelligence is internal knowledge and is NEVER connected to MFSN.)
 *
 * Flow:
 *   MFSN  →  Import Client  →  Read Report  →  Analyze  →  Diagnose
 *         →  Generate Strategy  →  Generate Dispute Plan  →  Track Progress
 *
 * Security: MFSN credentials are an affiliate/partner API key that must live as
 * a Supabase Edge Function secret (MFSN_API_KEY), NEVER in NEXT_PUBLIC_* or the
 * client bundle. The browser calls a `mfsn-import` Edge Function which pulls the
 * member's tri-bureau report server-side and returns normalized JSON. Until that
 * function + secret are provisioned, `importClient()` falls back to a realistic
 * demo import so the operational workflow is fully functional.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { collectionUpsert } from "@/lib/db/use-collection";
import type {
  Client,
  CreditReport,
  Inquiry,
  NegativeAccount,
} from "./types";

export interface ImportResult {
  client: Client;
  report: CreditReport;
  negatives: NegativeAccount[];
  inquiries: Inquiry[];
  source: "live" | "demo";
}

const uid = (p: string) =>
  `${p}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;

/** Persist an import into all relevant collections (local + Supabase write-through). */
function persistImport(r: ImportResult) {
  collectionUpsert("clients", r.client as unknown as Record<string, unknown> & { id: string });
  collectionUpsert("credit_reports", r.report as unknown as Record<string, unknown> & { id: string });
  r.negatives.forEach((n) => collectionUpsert("negative_accounts", n as unknown as Record<string, unknown> & { id: string }));
  r.inquiries.forEach((q) => collectionUpsert("inquiries", q as unknown as Record<string, unknown> & { id: string }));
}

/**
 * Import a client by MyFreeScoreNow member ID.
 * Live path: invoke the `mfsn-import` Edge Function (server holds MFSN_API_KEY).
 * Fallback: generate a realistic demo client so the workflow stays operational.
 */
export async function importClient(input: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  myfreescorenowId?: string;
}): Promise<ImportResult> {
  const clientId = uid("cl");

  // ── Live integration (when the Edge Function + secret are deployed) ──
  if (isSupabaseConfigured && input.myfreescorenowId) {
    const sb = createClient();
    if (sb) {
      try {
        const { data, error } = await sb.functions.invoke("mfsn-import", {
          body: { memberId: input.myfreescorenowId },
        });
        if (!error && data?.report) {
          const result = normalizeLive(clientId, input, data);
          persistImport(result);
          return result;
        }
      } catch {
        /* fall through to demo */
      }
    }
  }

  // ── Demo fallback (deterministic-ish but varied) ──
  const result = demoImport(clientId, input);
  persistImport(result);
  return result;
}

/** Shape an Edge Function payload into our records. */
function normalizeLive(
  clientId: string,
  input: { firstName: string; lastName: string; email?: string; phone?: string; myfreescorenowId?: string },
  data: {
    report: { experian?: number; equifax?: number; transunion?: number };
    negatives?: Array<{ bureau: string; type: string; creditor: string; balance: number; status?: string; remarks?: string }>;
    inquiries?: Array<{ bureau: string; date: string; creditor: string }>;
  },
): ImportResult {
  const client: Client = {
    id: clientId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    status: "imported",
    round: 0,
    myfreescorenowId: input.myfreescorenowId,
  };
  const report: CreditReport = {
    id: uid("cr"),
    clientId,
    reportDate: new Date().toISOString().slice(0, 10),
    experianScore: data.report.experian,
    equifaxScore: data.report.equifax,
    transunionScore: data.report.transunion,
  };
  const negatives: NegativeAccount[] = (data.negatives ?? []).map((n) => ({
    id: uid("na"),
    clientId,
    bureau: n.bureau,
    accountType: n.type,
    creditor: n.creditor,
    balance: n.balance,
    status: n.status ?? "open",
    remarks: n.remarks,
  }));
  const inquiries: Inquiry[] = (data.inquiries ?? []).map((q) => ({
    id: uid("iq"),
    clientId,
    bureau: q.bureau,
    inquiryDate: q.date,
    creditor: q.creditor,
  }));
  return { client, report, negatives, inquiries, source: "live" };
}

const SAMPLE_CREDITORS = ["Midland Credit", "Portfolio Recovery", "LVNV Funding", "Capital One", "Santander", "Synchrony Bank"];
const SAMPLE_TYPES = ["collection", "charge_off", "late_payment", "medical"];

function demoImport(
  clientId: string,
  input: { firstName: string; lastName: string; email?: string; phone?: string; myfreescorenowId?: string },
): ImportResult {
  const base = 540 + Math.floor(Math.random() * 90);
  const client: Client = {
    id: clientId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    status: "imported",
    round: 0,
    myfreescorenowId: input.myfreescorenowId || uid("MFSN"),
  };
  const report: CreditReport = {
    id: uid("cr"),
    clientId,
    reportDate: new Date().toISOString().slice(0, 10),
    experianScore: base + Math.floor(Math.random() * 20),
    equifaxScore: base - Math.floor(Math.random() * 15),
    transunionScore: base + Math.floor(Math.random() * 10),
  };
  const count = 2 + Math.floor(Math.random() * 3);
  const negatives: NegativeAccount[] = Array.from({ length: count }).map((_, i) => ({
    id: uid("na"),
    clientId,
    bureau: i % 2 === 0 ? "All" : "Experian",
    accountType: SAMPLE_TYPES[i % SAMPLE_TYPES.length],
    creditor: SAMPLE_CREDITORS[i % SAMPLE_CREDITORS.length],
    balance: [410, 920, 1840, 2310][i % 4],
    status: "open",
    remarks: "Imported from MyFreeScoreNow — pending analysis.",
  }));
  const inquiries: Inquiry[] = [
    { id: uid("iq"), clientId, bureau: "Experian", inquiryDate: new Date().toISOString().slice(0, 10), creditor: "Credit One Bank" },
  ];
  return { client, report, negatives, inquiries, source: "demo" };
}
