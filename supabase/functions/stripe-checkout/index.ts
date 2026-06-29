// Supabase Edge Function: stripe-checkout  (single self-contained file)
//
// Creates a Stripe Checkout payment link for an arbitrary amount so the CRM can
// collect money. STRIPE_SECRET_KEY lives server-side only. If it's not set, the
// function returns { ok:false, reason:"not_configured" } and the CRM falls back
// to a manual payment record — nothing breaks.
//
//   Browser → invoke("stripe-checkout", { amount, description, email?, successUrl?, cancelUrl? })
//           → { ok:true, url }
//
// Secret:  STRIPE_SECRET_KEY (sk_live_... or sk_test_...)
// Deploy:  supabase functions deploy stripe-checkout --no-verify-jwt

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const ENV = (k: string) => Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { amount, description, email, successUrl, cancelUrl } = await req.json().catch(() => ({}));
    const dollars = Number(amount);
    if (!dollars || dollars <= 0) return json({ ok: false, error: "Invalid amount" }, 400);

    const key = ENV("STRIPE_SECRET_KEY");
    if (!key) return json({ ok: false, reason: "not_configured" });

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", successUrl || "https://tyresehughesofficial-bot.github.io/credit-to-cashflow/crm/?paid=1");
    form.set("cancel_url", cancelUrl || "https://tyresehughesofficial-bot.github.io/credit-to-cashflow/crm/");
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", "usd");
    form.set("line_items[0][price_data][unit_amount]", String(Math.round(dollars * 100)));
    form.set("line_items[0][price_data][product_data][name]", description || "Triad T payment");
    if (email) form.set("customer_email", email);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) return json({ ok: false, error: data?.error?.message ?? `stripe_${res.status}` }, 502);
    return json({ ok: true, url: data.url, id: data.id });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
