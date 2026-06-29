// Supabase Edge Function: stripe-webhook  (single self-contained file)
//
// Receives Stripe events, verifies the signature, and on a completed checkout
// marks the matching crm_payments row as paid (via metadata.payment_id).
//
//   Stripe → POST /stripe-webhook  (checkout.session.completed)  → 200
//
// Secrets: STRIPE_WEBHOOK_SECRET (whsec_...), SUPABASE_URL + SERVICE_ROLE (auto).
// Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
// Then in Stripe → Developers → Webhooks, add the function URL and subscribe to
// `checkout.session.completed`; paste the signing secret as STRIPE_WEBHOOK_SECRET.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ENV = (k: string) => Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? "";

// Verify Stripe's `t=...,v1=...` signature header (HMAC-SHA256 of `${t}.${body}`).
async function verify(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=")));
    const t = parts.t, sig = parts.v1;
    if (!t || !sig) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`));
    const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return expected === sig;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const secret = ENV("STRIPE_WEBHOOK_SECRET");
  const sigHeader = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  if (secret && !(await verify(body, sigHeader, secret))) {
    return new Response("bad signature", { status: 400 });
  }

  try {
    const event = JSON.parse(body);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentId = session?.metadata?.payment_id;
      const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      if (paymentId) {
        await db.from("crm_payments").update({ status: "paid" }).eq("id", paymentId);
      } else if (session?.customer_email) {
        // Fallback: mark the most recent pending payment for that email's contact.
        await db.from("crm_payments").update({ status: "paid" }).eq("status", "pending").eq("contact", session.customer_email);
      }
    }
    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500 });
  }
});
