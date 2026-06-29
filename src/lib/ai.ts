"use client";

/**
 * Real-AI seam. `aiText()` calls Claude through the `generate-text` Supabase
 * Edge Function (which holds ANTHROPIC_API_KEY server-side — never in the
 * browser). It returns `null` whenever AI is unavailable (function not
 * deployed, secret unset, network error) so every caller can fall back to the
 * deterministic generators. The UI never breaks; it only gets smarter.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AIRequest {
  system?: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/** True when the backend *could* serve AI (Supabase configured). Runtime still
 *  falls back gracefully if the secret/function isn't actually live. */
export const aiConfigured = isSupabaseConfigured;

/** Generate text via Claude. Returns null if AI is unavailable — callers fall back. */
export async function aiText(req: AIRequest): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const sb = createClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.functions.invoke("generate-text", { body: req });
    if (error || !data || data.error || !data.text) return null;
    return String(data.text);
  } catch {
    return null;
  }
}

/** Back-compat: throws when AI is unavailable (prefer aiText for graceful fallback). */
export async function generateWithAI(req: AIRequest): Promise<string> {
  const text = await aiText(req);
  if (text == null) throw new Error("AI is unavailable — deploy generate-text and set ANTHROPIC_API_KEY.");
  return text;
}
