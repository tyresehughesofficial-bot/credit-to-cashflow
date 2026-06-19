// Supabase Edge Function: mfsn_import  (single self-contained file)
//
// Securely connects the Client Command Center to MyFreeScoreNow. The MFSN_API_KEY
// secret lives only here — the frontend never sees it.
//
//   Browser → invoke("mfsn_import", { action, memberId, demo })
//           → MFSN adapter (live API or demo payload)
//           → normalize → write-through to Supabase (service role)
//           → import_logs audit row → { success, mode, clientId, data }
//
// Actions: "ping" | "import" | "import-all".
// Secrets: MFSN_API_KEY (required for live). Optional: MFSN_BASE_URL,
//   MFSN_AUTH_HEADER, MFSN_AUTH_PREFIX, MFSN_EP_LIST_MEMBERS, MFSN_EP_MEMBER,
//   MFSN_EP_REPORT. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected.
// Deploy:  supabase functions deploy mfsn_import --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ───────────────────────────── Types ───────────────────────────── */
interface MfsnNegative {
  creditor: string; bureau: string; accountType: string; balance: number; status: string;
  remarks?: string; dateOpened?: string; dateReported?: string;
}
interface MfsnInquiry { creditor: string; bureau: string; inquiryDate?: string }
interface MfsnPublicRecord {
  bureau: string; recordType: string; status?: string; amount?: number;
  filedDate?: string; reference?: string; remarks?: string;
}
interface MfsnPersonalInfo { infoType: string; value: string; bureau?: string; status?: string }
interface MfsnReport {
  reportDate?: string;
  scores: { experian?: number; equifax?: number; transunion?: number };
  utilization?: { totalLimit?: number; totalBalance?: number; utilizationPct?: number; perAccount?: unknown };
  negatives: MfsnNegative[]; inquiries: MfsnInquiry[];
  publicRecords: MfsnPublicRecord[]; personalInfo: MfsnPersonalInfo[];
}
interface MfsnClient {
  memberId: string; firstName: string; lastName: string; email?: string; phone?: string;
  enrollmentStatus?: string; dateAdded?: string; report: MfsnReport;
}

/* ─────────────────── MFSN config (EDIT FOR LIVE) ─────────────────── */
// Secret names matched case-insensitively (MFSN_API_KEY or mfsn_api_key).
const ENV = (k: string, d = "") =>
  Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? d;

const MFSN = {
  apiKey: ENV("MFSN_API_KEY"),
  baseUrl: ENV("MFSN_BASE_URL", "https://api.myfreescorenow.com/v1"), // TODO confirm
  authHeader: ENV("MFSN_AUTH_HEADER", "Authorization"),
  authPrefix: ENV("MFSN_AUTH_PREFIX", "Bearer "),
  endpoints: {
    listMembers: ENV("MFSN_EP_LIST_MEMBERS", "/members"),        // TODO confirm
    memberDetail: ENV("MFSN_EP_MEMBER", "/members/{id}"),        // TODO confirm
    creditReport: ENV("MFSN_EP_REPORT", "/members/{id}/report"), // TODO confirm
  },
};

function isConfigured(): boolean { return Boolean(MFSN.apiKey); }
function authHeaders(): HeadersInit {
  return { [MFSN.authHeader]: `${MFSN.authPrefix}${MFSN.apiKey}`, "Accept": "application/json" };
}
async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${MFSN.baseUrl}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`MFSN ${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

/* ───────────────────────────── Demo ───────────────────────────── */
function demoClient(memberId?: string, hint?: { firstName?: string; lastName?: string; email?: string; phone?: string }): MfsnClient {
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

/* ─────────────── Live fetch + raw→normalized mapping ─────────────── */
// EDIT mapRawClient to match MFSN's real JSON field names.
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

async function fetchClient(
  opts: { memberId?: string; demo?: boolean; hint?: { firstName?: string; lastName?: string; email?: string; phone?: string } },
): Promise<{ client: MfsnClient; mode: "live" | "demo" }> {
  if (opts.demo || !isConfigured()) return { client: demoClient(opts.memberId, opts.hint), mode: "demo" };
  const id = opts.memberId ?? "";
  const raw = (await apiGet(MFSN.endpoints.memberDetail.replace("{id}", id))) as Record<string, unknown>;
  const report = (await apiGet(MFSN.endpoints.creditReport.replace("{id}", id))) as Record<string, unknown>;
  return { client: mapRawClient(raw, report), mode: "live" };
}

async function listMemberIds(): Promise<string[]> {
  if (!isConfigured()) return [];
  const data = (await apiGet(MFSN.endpoints.listMembers)) as unknown;
  const arr = Array.isArray(data) ? data : ((data as Record<string, unknown>)?.members as unknown[]) ?? [];
  return arr.map((m) => String((m as Record<string, unknown>).id ?? (m as Record<string, unknown>).memberId ?? "")).filter(Boolean);
}

/* ──────────────── Normalize → Supabase row objects ──────────────── */
interface NormalizedRows {
  client: Record<string, unknown>;
  report: Record<string, unknown>;
  utilization: Record<string, unknown> | null;
  negatives: Record<string, unknown>[];
  inquiries: Record<string, unknown>[];
  publicRecords: Record<string, unknown>[];
  personalInfo: Record<string, unknown>[];
}

function normalize(c: MfsnClient, clientId: string, reportId: string): NormalizedRows {
  const u = c.report.utilization;
  return {
    client: {
      id: clientId, first_name: c.firstName, last_name: c.lastName,
      email: c.email ?? null, phone: c.phone ?? null, status: "imported", round: 0,
      myfreescorenow_id: c.memberId, source: "myfreescorenow", external_id: c.memberId,
      enrollment_status: c.enrollmentStatus ?? null,
      date_added: c.dateAdded ?? new Date().toISOString().slice(0, 10),
    },
    report: {
      id: reportId, client_id: clientId,
      report_date: c.report.reportDate ?? new Date().toISOString().slice(0, 10),
      experian_score: c.report.scores.experian ?? null,
      equifax_score: c.report.scores.equifax ?? null,
      transunion_score: c.report.scores.transunion ?? null,
    },
    utilization: u ? {
      client_id: clientId, report_id: reportId,
      total_limit: u.totalLimit ?? 0, total_balance: u.totalBalance ?? 0,
      utilization_pct: u.utilizationPct ?? (u.totalLimit ? Math.round(((u.totalBalance ?? 0) / u.totalLimit) * 100) : 0),
      per_account: u.perAccount ?? null,
    } : null,
    negatives: c.report.negatives.map((n) => ({
      client_id: clientId, bureau: n.bureau, account_type: n.accountType, creditor: n.creditor,
      balance: n.balance ?? 0, status: n.status ?? "open", remarks: n.remarks ?? null,
    })),
    inquiries: c.report.inquiries.map((q) => ({
      client_id: clientId, bureau: q.bureau, inquiry_date: q.inquiryDate ?? null, creditor: q.creditor,
    })),
    publicRecords: c.report.publicRecords.map((p) => ({
      client_id: clientId, bureau: p.bureau, record_type: p.recordType, status: p.status ?? null,
      amount: p.amount ?? 0, filed_date: p.filedDate ?? null, reference: p.reference ?? null, remarks: p.remarks ?? null,
    })),
    personalInfo: c.report.personalInfo.map((pi) => ({
      client_id: clientId, info_type: pi.infoType, value: pi.value, bureau: pi.bureau ?? null, status: pi.status ?? "current",
    })),
  };
}

/* ───────────────────────────── HTTP ───────────────────────────── */
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const uid = () => crypto.randomUUID();
function db() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
function camelRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out;
}

async function importOne(client: MfsnClient, mode: "live" | "demo") {
  const supabase = db();
  const clientId = uid();
  const reportId = uid();
  const rows = normalize(client, clientId, reportId);

  const errors: string[] = [];
  const tryWrite = async (table: string, payload: Record<string, unknown> | Record<string, unknown>[]) => {
    if (Array.isArray(payload) && payload.length === 0) return;
    const { error } = await supabase.from(table).upsert(payload);
    if (error) errors.push(`${table}: ${error.message}`);
  };

  await tryWrite("clients", rows.client);
  await tryWrite("client_sources", { client_id: clientId, source: "myfreescorenow", external_id: client.memberId, status: client.enrollmentStatus ?? null });
  await tryWrite("credit_reports", rows.report);
  if (rows.utilization) await tryWrite("credit_utilization", rows.utilization);
  await tryWrite("negative_accounts", rows.negatives);
  await tryWrite("inquiries", rows.inquiries);
  await tryWrite("public_records", rows.publicRecords);
  await tryWrite("personal_information", rows.personalInfo);

  const counts = {
    negatives: rows.negatives.length,
    inquiries: rows.inquiries.length,
    publicRecords: rows.publicRecords.length,
    personalInfo: rows.personalInfo.length,
  };
  const status = errors.length === 0 ? "success" : "partial";

  await supabase.from("import_logs").insert({
    source: "myfreescorenow",
    member_id: client.memberId,
    client_id: clientId,
    status,
    mode,
    counts,
    message: `Imported ${client.firstName} ${client.lastName}`,
    error: errors.length ? errors.join("; ") : null,
  });

  return {
    clientId,
    status,
    errors,
    counts,
    data: {
      client: camelRow(rows.client),
      report: camelRow(rows.report),
      utilization: rows.utilization ? camelRow(rows.utilization) : null,
      negatives: rows.negatives.map(camelRow),
      inquiries: rows.inquiries.map(camelRow),
      publicRecords: rows.publicRecords.map(camelRow),
      personalInfo: rows.personalInfo.map(camelRow),
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = body.action ?? "import";

    if (action === "ping") {
      return json({
        success: true,
        configured: isConfigured(),
        mode: isConfigured() ? "live" : "demo",
        baseUrl: MFSN.baseUrl,
        endpoints: MFSN.endpoints,
        note: isConfigured()
          ? "MFSN_API_KEY is set. Confirm baseUrl/endpoints match your Secure API Control docs."
          : "MFSN_API_KEY not set — running in demo mode. Set the secret to go live.",
      });
    }

    if (action === "import-all") {
      if (!isConfigured()) return json({ success: false, error: "Live import requires MFSN_API_KEY." }, 400);
      const ids = await listMemberIds();
      const results = [];
      for (const id of ids) {
        const { client, mode } = await fetchClient({ memberId: id });
        results.push(await importOne(client, mode));
      }
      return json({ success: true, mode: "live", imported: results.length, results });
    }

    const { client, mode } = await fetchClient({
      memberId: body.memberId,
      demo: body.demo === true,
      hint: { firstName: body.firstName, lastName: body.lastName, email: body.email, phone: body.phone },
    });
    const result = await importOne(client, mode);
    return json({ success: result.status !== "error", mode, ...result });
  } catch (e) {
    return json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
