"use client";

/**
 * Credit-report upload → extract → review → save.
 *   1) uploadReport  — file → private 'credit-reports' bucket + report_uploads row
 *   2) processReport — process-credit-report Edge Function (Claude) → structured data
 *                      (CSV/JSON/TXT fall back to a light client-side parse)
 *   3) saveExtracted — write reviewed data into the credit tables (on confirm)
 * Never stores full SSNs / full account numbers (masked only).
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { collectionUpsert, type Row } from "@/lib/db/use-collection";

export interface ExtractedData {
  client?: { name?: string | null; addresses?: string[]; employers?: string[]; phones?: string[] };
  scores?: { experian?: number | null; equifax?: number | null; transunion?: number | null; report_date?: string | null };
  tradelines?: Array<{ creditor: string; account_type?: string | null; account_number_masked?: string | null; balance?: number | null; credit_limit?: number | null; payment_status?: string | null; date_opened?: string | null; last_reported?: string | null; bureau?: string | null; is_negative?: boolean }>;
  negatives?: Array<{ creditor: string; account_type: string; bureau?: string | null; balance?: number | null; status?: string | null; remarks?: string | null }>;
  inquiries?: Array<{ creditor: string; bureau?: string | null; inquiry_date?: string | null }>;
  utilization?: { total_balance?: number | null; total_limit?: number | null; utilization_pct?: number | null };
  personal_information?: Array<{ info_type: string; value: string; bureau?: string | null }>;
}

const uid = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;
const up = (table: string, rec: Record<string, unknown> & { id: string }) => collectionUpsert(table, rec as Row);
const ext = (name: string) => (name.split(".").pop() || "").toLowerCase();

export interface UploadResult {
  uploadId: string;
  storagePath: string;
  fileType: string;
  filename: string;
  error?: string;
}

/** Upload the file to private storage + create a report_uploads record. */
export async function uploadReport(input: { file: File; clientId: string; source?: string }): Promise<UploadResult> {
  const { file, clientId } = input;
  const fileType = ext(file.name);
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${clientId}/${Date.now()}-${safe}`;
  const uploadId = uid("ru");

  if (isSupabaseConfigured) {
    const sb = createClient();
    if (sb) {
      try {
        const upl = await sb.storage.from("credit-reports").upload(storagePath, file, { upsert: true, contentType: file.type || undefined });
        if (upl.error) return { uploadId, storagePath, fileType, filename: file.name, error: `Upload failed: ${upl.error.message}` };
      } catch (e) {
        return { uploadId, storagePath, fileType, filename: file.name, error: e instanceof Error ? e.message : "Upload failed" };
      }
    }
  }
  // Record the upload (also visible in the Uploaded Files tab).
  up("report_uploads", {
    id: uploadId,
    clientId,
    source: input.source ?? "manual",
    originalFilename: file.name,
    fileType,
    storagePath,
    uploadedAt: new Date().toISOString(),
    processingStatus: isSupabaseConfigured ? "uploaded" : "local",
  } as Row & { id: string });

  return { uploadId, storagePath, fileType, filename: file.name };
}

/** Extract structured data via the Edge Function (or a light local fallback). */
export async function processReport(u: UploadResult, rawFile?: File): Promise<{ ok: boolean; data: ExtractedData; error?: string }> {
  if (isSupabaseConfigured) {
    const sb = createClient();
    if (sb) {
      // If the file never made it to storage, extraction can't run.
      if (u.error) {
        const local = await localParse(u.fileType, rawFile);
        if (local) return { ok: true, data: local };
        return { ok: false, data: {}, error: `Upload to storage failed: ${u.error}. Create the private "credit-reports" bucket (run storage_credit_reports.sql), then retry.` };
      }
      const { data, error } = await sb.functions.invoke("process-credit-report", {
        body: { storagePath: u.storagePath, fileType: u.fileType, filename: u.filename, uploadId: u.uploadId },
      });
      if (!error && data?.ok && data.data) return { ok: true, data: data.data as ExtractedData };
      const local = await localParse(u.fileType, rawFile);
      if (local) return { ok: true, data: local };
      // Explain the most common cause: function not deployed / secret / download.
      const reason =
        data?.error ||
        (error?.message?.includes("Failed to fetch") || error?.message?.includes("not found")
          ? "The process-credit-report function isn't deployed. Deploy it (Edge Functions → new function → process-credit-report, Verify JWT off) — it reuses ANTHROPIC_API_KEY."
          : error?.message) ||
        "Extraction unavailable.";
      return { ok: false, data: {}, error: reason };
    }
  }
  const local = await localParse(u.fileType, rawFile);
  return { ok: !!local, data: local ?? {}, error: local ? undefined : "AI extraction needs Supabase + the process-credit-report function. Enter the fields manually below, or deploy it and re-upload." };
}

/** Minimal client-side parse for JSON (matching our schema); empty skeleton otherwise. */
async function localParse(fileType: string, file?: File): Promise<ExtractedData | null> {
  if (!file) return null;
  if (fileType === "json") {
    try {
      const obj = JSON.parse(await file.text());
      return obj as ExtractedData;
    } catch {
      return null;
    }
  }
  return null;
}

/** Write reviewed data into the credit tables. Returns counts. */
export function saveExtracted(clientId: string, data: ExtractedData, reportDate: string, uploadId?: string) {
  let reportId: string | undefined;
  const s = data.scores;
  if (s && (s.experian || s.equifax || s.transunion)) {
    reportId = uid("cr");
    up("credit_reports", { id: reportId, clientId, reportDate: s.report_date || reportDate, experianScore: s.experian ?? null, equifaxScore: s.equifax ?? null, transunionScore: s.transunion ?? null } as Row & { id: string });
  }
  (data.tradelines ?? []).forEach((t) =>
    up("tradelines", { id: uid("tl"), clientId, creditReportId: reportId ?? null, creditor: t.creditor, accountType: t.account_type ?? null, accountNumberMasked: t.account_number_masked ?? null, balance: t.balance ?? null, creditLimit: t.credit_limit ?? null, paymentStatus: t.payment_status ?? null, dateOpened: t.date_opened ?? null, lastReported: t.last_reported ?? null, bureau: t.bureau ?? null, isNegative: !!t.is_negative } as Row & { id: string }),
  );
  (data.negatives ?? []).forEach((n) =>
    up("negative_accounts", { id: uid("na"), clientId, bureau: n.bureau ?? "All", accountType: n.account_type, creditor: n.creditor, balance: n.balance ?? 0, status: n.status ?? "open", remarks: n.remarks ?? null } as Row & { id: string }),
  );
  (data.inquiries ?? []).forEach((q) =>
    up("inquiries", { id: uid("iq"), clientId, bureau: q.bureau ?? "All", inquiryDate: q.inquiry_date ?? null, creditor: q.creditor } as Row & { id: string }),
  );
  const u = data.utilization;
  if (u && (u.total_limit || u.total_balance || u.utilization_pct)) {
    up("credit_utilization", { id: uid("ut"), clientId, reportId: reportId ?? null, totalLimit: u.total_limit ?? 0, totalBalance: u.total_balance ?? 0, utilizationPct: u.utilization_pct ?? (u.total_limit ? Math.round(((u.total_balance ?? 0) / u.total_limit) * 100) : 0) } as Row & { id: string });
  }
  (data.personal_information ?? []).forEach((p, i) =>
    up("personal_information", { id: uid("pi"), clientId, infoType: p.info_type, value: p.value, bureau: p.bureau ?? null, status: i === 0 && p.info_type === "address" ? "current" : "current" } as Row & { id: string }),
  );
  if (uploadId) up("report_uploads", { id: uploadId, processingStatus: "saved" } as Row & { id: string });
  return {
    reportId,
    counts: {
      tradelines: data.tradelines?.length ?? 0,
      negatives: data.negatives?.length ?? 0,
      inquiries: data.inquiries?.length ?? 0,
      pii: data.personal_information?.length ?? 0,
    },
  };
}

/** Signed URL to view a stored report (private bucket). */
export async function reportSignedUrl(storagePath: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const sb = createClient();
  if (!sb) return null;
  try {
    const { data } = await sb.storage.from("credit-reports").createSignedUrl(storagePath, 300);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
