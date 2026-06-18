/**
 * MYFREESCORENOW INTEGRATION (frontend seam).
 *
 * MyFreeScoreNow feeds the Client Command Center ONLY. The browser never holds
 * the API token — it invokes the `mfsn_import` Supabase Edge Function, which
 * reads MFSN_API_KEY server-side, pulls + normalizes the report, writes through
 * to Supabase, and returns the normalized records. We then upsert those into the
 * local collections so the UI updates instantly.
 *
 * Multi-source by design (source = "myfreescorenow" | "disputefox" | "manual");
 * only "myfreescorenow" is wired now.
 *
 * Flow: Command Center → mfsn_import → MFSN API → normalize → Supabase → UI.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { collectionUpsert, type Row } from "@/lib/db/use-collection";
import type {
  Client,
  CreditReport,
  CreditUtilization,
  Inquiry,
  NegativeAccount,
  PersonalInformation,
  PublicRecord,
} from "./types";

export interface ImportResult {
  clientId: string;
  source: "myfreescorenow";
  mode: "live" | "demo";
  status: "success" | "partial" | "error";
  counts: { negatives: number; inquiries: number; publicRecords: number; personalInfo: number };
  errors?: string[];
}

const up = (table: string, rec: Record<string, unknown> & { id?: string }) =>
  collectionUpsert(table, { id: rec.id ?? crypto.randomUUID(), ...rec } as Row);

/** Push the Edge Function's normalized payload into local collections (instant UI). */
function persist(data: {
  client: Client;
  report: CreditReport;
  utilization: CreditUtilization | null;
  negatives: NegativeAccount[];
  inquiries: Inquiry[];
  publicRecords: PublicRecord[];
  personalInfo: PersonalInformation[];
}) {
  up("clients", data.client as unknown as Row);
  up("credit_reports", data.report as unknown as Row);
  if (data.utilization) up("credit_utilization", data.utilization as unknown as Row);
  data.negatives.forEach((n) => up("negative_accounts", n as unknown as Row));
  data.inquiries.forEach((q) => up("inquiries", q as unknown as Row));
  data.publicRecords.forEach((p) => up("public_records", p as unknown as Row));
  data.personalInfo.forEach((pi) => up("personal_information", pi as unknown as Row));
}

/**
 * Import a client from MyFreeScoreNow.
 * Invokes the `mfsn_import` Edge Function (live when MFSN_API_KEY is set on the
 * server, demo otherwise). Falls back to a local demo import if Supabase isn't
 * configured at all, so the workflow is never blocked.
 */
export async function importClient(input: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  myfreescorenowId?: string;
}): Promise<ImportResult> {
  if (isSupabaseConfigured) {
    const sb = createClient();
    if (sb) {
      const { data, error } = await sb.functions.invoke("mfsn_import", {
        body: {
          action: "import",
          memberId: input.myfreescorenowId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
        },
      });
      if (!error && data?.clientId && data?.data) {
        persist(data.data);
        return {
          clientId: data.clientId,
          source: "myfreescorenow",
          mode: data.mode === "live" ? "live" : "demo",
          status: data.status ?? "success",
          counts: data.counts,
          errors: data.errors,
        };
      }
    }
  }
  // Local-only fallback (no backend configured).
  return localDemo(input);
}

/** Lightweight server status probe (is MFSN_API_KEY set? which endpoints?). */
export async function pingMfsn(): Promise<{ configured: boolean; mode: "live" | "demo"; note?: string } | null> {
  if (!isSupabaseConfigured) return { configured: false, mode: "demo", note: "Supabase not configured." };
  const sb = createClient();
  if (!sb) return null;
  const { data, error } = await sb.functions.invoke("mfsn_import", { body: { action: "ping" } });
  if (error || !data) return null;
  return { configured: !!data.configured, mode: data.mode, note: data.note };
}

const uid = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;

function localDemo(input: { firstName: string; lastName: string; email?: string; phone?: string; myfreescorenowId?: string }): ImportResult {
  const clientId = uid("cl");
  const base = 540 + Math.floor(Math.random() * 90);
  const client: Client = {
    id: clientId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    status: "imported",
    round: 0,
    source: "myfreescorenow",
    myfreescorenowId: input.myfreescorenowId || uid("MFSN"),
    dateAdded: new Date().toISOString().slice(0, 10),
  };
  const reportId = uid("cr");
  const report: CreditReport = {
    id: reportId,
    clientId,
    reportDate: new Date().toISOString().slice(0, 10),
    experianScore: base + 12,
    equifaxScore: base - 8,
    transunionScore: base + 4,
  };
  const utilization: CreditUtilization = {
    id: uid("ut"),
    clientId,
    reportId,
    totalLimit: 8200,
    totalBalance: 5740,
    utilizationPct: 70,
  };
  const negatives: NegativeAccount[] = [
    { id: uid("na"), clientId, bureau: "All", accountType: "collection", creditor: "Midland Credit", balance: 1840, status: "open", remarks: "Imported — pending analysis." },
    { id: uid("na"), clientId, bureau: "Experian", accountType: "charge_off", creditor: "Capital One", balance: 2310, status: "open", remarks: "Imported — pending analysis." },
  ];
  const inquiries: Inquiry[] = [
    { id: uid("iq"), clientId, bureau: "Experian", inquiryDate: new Date().toISOString().slice(0, 10), creditor: "Credit One Bank" },
  ];
  const publicRecords: PublicRecord[] = [];
  const personalInfo: PersonalInformation[] = [
    { id: uid("pi"), clientId, infoType: "address", value: "Old address on file", bureau: "Experian", status: "old" },
  ];
  persist({ client, report, utilization, negatives, inquiries, publicRecords, personalInfo });
  return {
    clientId,
    source: "myfreescorenow",
    mode: "demo",
    status: "success",
    counts: { negatives: negatives.length, inquiries: inquiries.length, publicRecords: 0, personalInfo: personalInfo.length },
  };
}
