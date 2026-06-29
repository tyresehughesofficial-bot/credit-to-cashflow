"use client";

/**
 * Stripe seam. `createPaymentLink()` calls the `stripe-checkout` Edge Function
 * (STRIPE_SECRET_KEY server-side). Returns a checkout URL when configured, or
 * { ok:false } so the CRM records a manual payment instead. Same graceful
 * fallback pattern as AI / messaging.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface PaymentLinkResult {
  ok: boolean;
  url?: string;
  reason?: string;
}

export async function createPaymentLink(input: { amount: number; description: string; email?: string }): Promise<PaymentLinkResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "no_backend" };
  const sb = createClient();
  if (!sb) return { ok: false, reason: "no_client" };
  try {
    const { data, error } = await sb.functions.invoke("stripe-checkout", { body: input });
    if (error) return { ok: false, reason: "invoke_error" };
    if (data?.ok && data?.url) return { ok: true, url: data.url };
    return { ok: false, reason: data?.reason ?? "not_configured" };
  } catch {
    return { ok: false, reason: "exception" };
  }
}
