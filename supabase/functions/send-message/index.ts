// Supabase Edge Function: send-message  (single self-contained file)
//
// Sends SMS (Twilio) or email (SendGrid) for the in-app CRM. Provider keys live
// server-side only. If a provider isn't configured it returns { sent:false,
// reason:"not_configured" } so the frontend logs the message as simulated and
// nothing breaks.
//
//   Browser → invoke("send-message", { channel:"sms"|"email", to, subject?, body })
//
// Secrets (optional — set the ones you use):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM        (SMS)
//   SENDGRID_API_KEY, SENDGRID_FROM                           (email)
// Deploy: supabase functions deploy send-message --no-verify-jwt

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const ENV = (k: string) => Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? "";

async function sendSMS(to: string, body: string) {
  const sid = ENV("TWILIO_ACCOUNT_SID"), token = ENV("TWILIO_AUTH_TOKEN"), from = ENV("TWILIO_FROM");
  if (!sid || !token || !from) return { sent: false, reason: "not_configured" };
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  if (!res.ok) return { sent: false, reason: `twilio_${res.status}`, detail: (await res.text()).slice(0, 200) };
  return { sent: true, channel: "sms" };
}

async function sendEmail(to: string, subject: string, body: string) {
  const key = ENV("SENDGRID_API_KEY"), from = ENV("SENDGRID_FROM");
  if (!key || !from) return { sent: false, reason: "not_configured" };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject: subject || "Message from Triad T",
      content: [{ type: "text/plain", value: body }],
    }),
  });
  if (!res.ok) return { sent: false, reason: `sendgrid_${res.status}`, detail: (await res.text()).slice(0, 200) };
  return { sent: true, channel: "email" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { channel, to, subject, body } = await req.json().catch(() => ({}));
    if (!to || !body) return json({ sent: false, error: "Missing to/body" }, 400);
    const result = channel === "email" ? await sendEmail(to, subject ?? "", body) : await sendSMS(to, body);
    return json(result);
  } catch (e) {
    return json({ sent: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
