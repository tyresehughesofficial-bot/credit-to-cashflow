"use client";

/**
 * Messaging seam. `sendMessage()` calls the `send-message` Edge Function
 * (Twilio SMS / SendGrid email, keys server-side). When no provider is
 * configured it returns { sent:false, simulated:true } so the CRM logs the
 * message as "queued (simulated)" instead of failing. Same graceful-fallback
 * pattern as AI + MyFreeScoreNow.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface SendInput {
  channel: "sms" | "email";
  to: string;
  subject?: string;
  body: string;
}
export interface SendResult {
  sent: boolean;
  simulated: boolean;
  reason?: string;
}

export async function sendMessage(input: SendInput): Promise<SendResult> {
  if (!isSupabaseConfigured) return { sent: false, simulated: true, reason: "no_backend" };
  const sb = createClient();
  if (!sb) return { sent: false, simulated: true, reason: "no_client" };
  try {
    const { data, error } = await sb.functions.invoke("send-message", { body: input });
    if (error) return { sent: false, simulated: true, reason: "invoke_error" };
    if (data?.sent) return { sent: true, simulated: false };
    return { sent: false, simulated: true, reason: data?.reason ?? "not_configured" };
  } catch {
    return { sent: false, simulated: true, reason: "exception" };
  }
}
