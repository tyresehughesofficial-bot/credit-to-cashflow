// MyFreeScoreNow API adapter.
//
// THE ONLY FILE TO EDIT WHEN LIVE ENDPOINTS ARE KNOWN. It isolates:
//   1) the endpoint map (ENDPOINTS),
//   2) auth (reads the MFSN_API_KEY secret — never returned to the client),
//   3) the raw→normalized mapping (mapRawClient).
// The rest of the function works against the normalized `MfsnClient` shape.

import { demoClient } from "./demo.ts";

// ── Normalized intermediate (provider-agnostic) ─────────────────────────────
export interface MfsnNegative {
  creditor: string;
  bureau: string;            // Experian | Equifax | TransUnion | All
  accountType: string;       // collection | charge_off | repossession | late_payment | public_record | medical
  balance: number;
  status: string;
  remarks?: string;
  dateOpened?: string;
  dateReported?: string;
}
export interface MfsnInquiry {
  creditor: string;
  bureau: string;
  inquiryDate?: string;
}
export interface MfsnPublicRecord {
  bureau: string;
  recordType: string;        // bankruptcy | judgment | lien
  status?: string;
  amount?: number;
  filedDate?: string;
  reference?: string;
  remarks?: string;
}
export interface MfsnPersonalInfo {
  infoType: string;          // name | address | employer | phone
  value: string;
  bureau?: string;
  status?: string;           // current | old | unauthorized
}
export interface MfsnReport {
  reportDate?: string;
  scores: { experian?: number; equifax?: number; transunion?: number };
  utilization?: { totalLimit?: number; totalBalance?: number; utilizationPct?: number; perAccount?: unknown };
  negatives: MfsnNegative[];
  inquiries: MfsnInquiry[];
  publicRecords: MfsnPublicRecord[];
  personalInfo: MfsnPersonalInfo[];
}
export interface MfsnClient {
  memberId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  enrollmentStatus?: string;
  dateAdded?: string;
  report: MfsnReport;
}

// ── Endpoint map — FILL FROM "Secure API Control" ────────────────────────────
// Override any of these via Edge Function secrets without code changes:
//   supabase secrets set MFSN_BASE_URL=...  MFSN_AUTH_HEADER=Authorization
//   supabase secrets set MFSN_AUTH_PREFIX="Bearer "  (use "" for raw key / X-API-Key)
// Secret names are matched case-insensitively (MFSN_API_KEY or mfsn_api_key).
const ENV = (k: string, d = "") =>
  Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? d;

export const MFSN = {
  apiKey: ENV("MFSN_API_KEY"),
  baseUrl: ENV("MFSN_BASE_URL", "https://api.myfreescorenow.com/v1"), // TODO confirm
  authHeader: ENV("MFSN_AUTH_HEADER", "Authorization"),
  authPrefix: ENV("MFSN_AUTH_PREFIX", "Bearer "),
  endpoints: {
    listMembers: ENV("MFSN_EP_LIST_MEMBERS", "/members"),          // TODO confirm
    memberDetail: ENV("MFSN_EP_MEMBER", "/members/{id}"),          // TODO confirm
    creditReport: ENV("MFSN_EP_REPORT", "/members/{id}/report"),   // TODO confirm
  },
};

export function isConfigured(): boolean {
  return Boolean(MFSN.apiKey);
}

function authHeaders(): HeadersInit {
  return {
    [MFSN.authHeader]: `${MFSN.authPrefix}${MFSN.apiKey}`,
    "Accept": "application/json",
  };
}

async function get(path: string): Promise<unknown> {
  const url = `${MFSN.baseUrl}${path}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`MFSN ${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

// ── Raw → normalized mapping. EDIT to match MFSN's real JSON field names. ────
// Until live shape is known, this is only exercised on the live path; demo mode
// returns already-normalized data.
function mapRawClient(raw: Record<string, unknown>, report: Record<string, unknown>): MfsnClient {
  const r = report ?? {};
  const num = (v: unknown) => (v == null ? undefined : Number(v));
  return {
    memberId: String(raw.id ?? raw.memberId ?? raw.client_id ?? ""),
    firstName: String(raw.first_name ?? raw.firstName ?? ""),
    lastName: String(raw.last_name ?? raw.lastName ?? ""),
    email: raw.email as string | undefined,
    phone: (raw.phone ?? raw.phone_number) as string | undefined,
    enrollmentStatus: (raw.status ?? raw.enrollment_status) as string | undefined,
    dateAdded: (raw.created_at ?? raw.date_added) as string | undefined,
    report: {
      reportDate: (r.report_date ?? r.date) as string | undefined,
      scores: {
        experian: num((r.scores as Record<string, unknown>)?.experian ?? r.experian),
        equifax: num((r.scores as Record<string, unknown>)?.equifax ?? r.equifax),
        transunion: num((r.scores as Record<string, unknown>)?.transunion ?? r.transunion),
      },
      utilization: r.utilization as MfsnReport["utilization"],
      negatives: (r.negatives ?? r.negative_accounts ?? []) as MfsnNegative[],
      inquiries: (r.inquiries ?? []) as MfsnInquiry[],
      publicRecords: (r.public_records ?? r.publicRecords ?? []) as MfsnPublicRecord[],
      personalInfo: (r.personal_information ?? r.personalInfo ?? []) as MfsnPersonalInfo[],
    },
  };
}

/** Fetch one member + report. Falls back to demo when not configured or demo=true. */
export async function fetchClient(
  opts: { memberId?: string; demo?: boolean; hint?: { firstName?: string; lastName?: string; email?: string; phone?: string } },
): Promise<{ client: MfsnClient; mode: "live" | "demo" }> {
  if (opts.demo || !isConfigured()) {
    return { client: demoClient(opts.memberId, opts.hint), mode: "demo" };
  }
  const id = opts.memberId ?? "";
  const raw = (await get(MFSN.endpoints.memberDetail.replace("{id}", id))) as Record<string, unknown>;
  const report = (await get(MFSN.endpoints.creditReport.replace("{id}", id))) as Record<string, unknown>;
  return { client: mapRawClient(raw, report), mode: "live" };
}

/** List member IDs for bulk import (live only). */
export async function listMemberIds(): Promise<string[]> {
  if (!isConfigured()) return [];
  const data = (await get(MFSN.endpoints.listMembers)) as unknown;
  const arr = Array.isArray(data) ? data : ((data as Record<string, unknown>)?.members as unknown[]) ?? [];
  return arr.map((m) => String((m as Record<string, unknown>).id ?? (m as Record<string, unknown>).memberId ?? "")).filter(Boolean);
}
