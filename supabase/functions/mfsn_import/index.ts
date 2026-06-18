// Supabase Edge Function: mfsn_import
//
// Securely connects the Client Command Center to MyFreeScoreNow. The MFSN_API_KEY
// secret lives only here — the frontend never sees it.
//
//   Browser → invoke("mfsn_import", { action, memberId, demo })
//           → MFSN adapter (live API or demo payload)
//           → normalize → write-through to Supabase (service role)
//           → import_logs audit row
//           → { success, mode, clientId, data }
//
// Actions:
//   "ping"        → config status (is MFSN_API_KEY set? which endpoints?)
//   "import"      → import one member (memberId optional → demo)
//   "import-all"  → bulk import every member (live only)
//
// Secrets: MFSN_API_KEY (required for live), optional MFSN_BASE_URL /
//   MFSN_AUTH_HEADER / MFSN_AUTH_PREFIX / MFSN_EP_* (see mfsn.ts).
// Deploy:  supabase functions deploy mfsn_import --no-verify-jwt
//   (the publishable key is not a JWT, so JWT verification must be off.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchClient, isConfigured, listMemberIds, MFSN, type MfsnClient } from "./mfsn.ts";
import { normalize } from "./normalize.ts";

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

// Camelize a snake_case row so the frontend collections can consume it directly.
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

  // Write-through. Failures are collected so a partial import is still reported.
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

  // Return camelCased records so the UI can upsert into local collections instantly.
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

    // default: import one
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
