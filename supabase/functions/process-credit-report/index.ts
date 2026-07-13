// Supabase Edge Function: process-credit-report  (single self-contained file)
//
// Securely extracts structured data from an uploaded credit report and RETURNS
// it for review (it does NOT auto-write to the credit tables — the frontend
// shows a "Review Extracted Data" step, then saves on confirm).
//
//   Browser → invoke("process-credit-report", { storagePath, fileType, filename, uploadId? })
//           → download from private 'credit-reports' bucket (service role)
//           → Claude structured extraction (PDF/image/text)
//           → validate → { ok, data, rawText }
//
// Secrets: ANTHROPIC_API_KEY (reused). SUPABASE_URL / SERVICE_ROLE auto.
// Deploy:  supabase functions deploy process-credit-report --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const ENV = (k: string) => Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? "";

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

const SCHEMA = `Return ONLY valid JSON (no markdown) matching:
{
 "client": { "name": string|null, "addresses": string[], "employers": string[], "phones": string[] },
 "scores": { "experian": number|null, "equifax": number|null, "transunion": number|null, "report_date": string|null },
 "tradelines": [ { "creditor": string, "account_type": string|null, "account_number_masked": string|null, "balance": number|null, "credit_limit": number|null, "payment_status": string|null, "date_opened": string|null, "last_reported": string|null, "bureau": string|null, "is_negative": boolean } ],
 "negatives": [ { "creditor": string, "account_type": string, "bureau": string|null, "balance": number|null, "status": string|null, "remarks": string|null } ],
 "inquiries": [ { "creditor": string, "bureau": string|null, "inquiry_date": string|null } ],
 "utilization": { "total_balance": number|null, "total_limit": number|null, "utilization_pct": number|null },
 "personal_information": [ { "info_type": "name"|"address"|"employer"|"phone", "value": string, "bureau": string|null } ]
}
Rules: If a value is unknown, use null (never invent). Mask account numbers to the last 4 (e.g. ****1234). Do NOT include full SSNs or full account numbers.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { storagePath, fileType, filename, uploadId } = await req.json().catch(() => ({}));
    if (!storagePath) return json({ ok: false, error: "Missing storagePath" }, 400);
    const key = ENV("ANTHROPIC_API_KEY");
    if (!key) return json({ ok: false, error: "ANTHROPIC_API_KEY not set." }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // Best-effort status writes — never let a missing report_uploads table break extraction.
    const setStatus = async (patch: Record<string, unknown>) => {
      if (!uploadId) return;
      try { await db.from("report_uploads").update(patch).eq("id", uploadId); } catch { /* ignore */ }
    };
    await setStatus({ processing_status: "processing" });

    const dl = await db.storage.from("credit-reports").download(storagePath);
    if (dl.error || !dl.data) return json({ ok: false, error: `Download failed: ${dl.error?.message}` }, 502);
    const bytes = new Uint8Array(await dl.data.arrayBuffer());

    const type = String(fileType || filename?.split(".").pop() || "").toLowerCase();
    const content: unknown[] = [];
    let isPdf = false;
    if (type === "pdf") {
      isPdf = true;
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: toBase64(bytes) } });
    } else if (["png", "jpg", "jpeg", "webp"].includes(type)) {
      const mt = type === "jpg" ? "jpeg" : type;
      content.push({ type: "image", source: { type: "base64", media_type: `image/${mt}`, data: toBase64(bytes) } });
    } else {
      const text = new TextDecoder().decode(bytes).slice(0, 120000);
      content.push({ type: "text", text: `CREDIT REPORT FILE (${type}):\n\n${text}` });
    }
    content.push({ type: "text", text: `Extract this credit report.\n${SCHEMA}` });

    // PDF support is GA on current Claude models — no beta header needed.
    const headers: Record<string, string> = { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" };
    void isPdf;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: ENV("CLAUDE_MODEL") || "claude-sonnet-4-6",
        max_tokens: 8192,
        system: "You are a precise credit-report data extractor. Output ONLY a single JSON object — no markdown, no commentary. Never fabricate values; use null when unknown.",
        messages: [
          { role: "user", content },
          { role: "assistant", content: "{" }, // prefill forces clean JSON, no prose/fences
        ],
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 400);
      await setStatus({ processing_status: "error", processing_error: detail });
      return json({ ok: false, error: `Anthropic ${res.status}: ${detail}` }, 502);
    }
    const out = await res.json();
    let textOut = (out.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    // Reattach the prefill and clean any stray fences.
    textOut = ("{" + textOut).replace(/```json/gi, "").replace(/```/g, "").trim();

    let data: unknown = null;
    // 1) direct parse; 2) outermost {...}; 3) trim to last closing brace (repairs truncation).
    const tryParse = (s: string) => { try { return JSON.parse(s); } catch { return null; } };
    data = tryParse(textOut);
    if (!data) {
      const m = textOut.match(/\{[\s\S]*\}/);
      if (m) data = tryParse(m[0]);
    }
    if (!data) {
      const last = textOut.lastIndexOf("}");
      if (last > 0) data = tryParse(textOut.slice(0, last + 1));
    }
    if (!data) {
      const stop = out.stop_reason;
      await setStatus({ processing_status: "error", processing_error: "Invalid/again JSON" });
      return json({ ok: false, error: `Could not parse the report JSON${stop === "max_tokens" ? " (response was truncated — the report may be very large)" : ""}. Try again or enter manually.`, rawText: textOut.slice(0, 400) }, 502);
    }

    await setStatus({ processing_status: "extracted", metadata: data });
    return json({ ok: true, data });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
