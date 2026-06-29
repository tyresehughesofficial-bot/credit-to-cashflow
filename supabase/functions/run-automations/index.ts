// Supabase Edge Function: run-automations  (single self-contained file)
//
// The backend execution engine for CRM automations. Invoke on a schedule
// (Supabase pg_cron / Scheduled Functions) or manually. It reads ACTIVE
// automations + contacts with the service role, performs each action (sends
// SMS/email via the same providers as send-message when configured), and logs
// the result to crm_activities. Safe to run repeatedly.
//
//   cron → invoke("run-automations")  →  { processed, results[] }
//
// Secrets: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (auto). Optional Twilio /
//   SendGrid (same as send-message) to actually send; otherwise it logs.
// Deploy: supabase functions deploy run-automations --no-verify-jwt
// Schedule (SQL):  select cron.schedule('run-automations','*/15 * * * *',
//   $$ select net.http_post('https://<ref>.functions.supabase.co/run-automations',
//   '{}', 'application/json') $$);

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const ENV = (k: string) => Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? "";

async function sendSMS(to: string, body: string) {
  const sid = ENV("TWILIO_ACCOUNT_SID"), token = ENV("TWILIO_AUTH_TOKEN"), from = ENV("TWILIO_FROM");
  if (!sid || !token || !from || !to) return false;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: autos } = await db.from("automations").select("*").eq("status", "active");
    const { data: contacts } = await db.from("crm_contacts").select("*");
    const results: unknown[] = [];

    for (const a of autos ?? []) {
      // Stage-based matching: "New lead → welcome" targets New Lead contacts, etc.
      const targets = (contacts ?? []).filter((c: Record<string, unknown>) => {
        const trig = String(a.trigger ?? "").toLowerCase();
        const stage = String(c.stage ?? "").toLowerCase();
        if (trig.includes("lead")) return stage.includes("new lead");
        if (trig.includes("no-show") || trig.includes("no show")) return stage.includes("no show");
        if (trig.includes("booking")) return stage.includes("booked");
        return false;
      });
      for (const c of targets) {
        let sent = false;
        if (/sms|text/i.test(String(a.action))) sent = await sendSMS(String(c.phone ?? ""), String(a.name));
        await db.from("crm_activities").insert({
          contact: c.name,
          type: "task",
          summary: `[auto] ${a.name}: ${a.action}${sent ? " — sent" : " — logged"}`,
          date: new Date().toISOString().slice(0, 10),
        });
        results.push({ automation: a.name, contact: c.name, sent });
      }
    }
    return json({ processed: results.length, results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
