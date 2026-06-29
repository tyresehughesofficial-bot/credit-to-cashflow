"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Dedicated auth client (supabase-js) with localStorage session persistence —
// works on the static GitHub Pages build (no server needed). Reuses the same
// public project URL + publishable key as the DB client.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ttbcxfgopvvjkqmquqfh.supabase.co";
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_j4YRaaLd3IfXHvu3hLAPpQ_NEImZXgV";

export const authConfigured = Boolean(URL && KEY);

let _client: SupabaseClient | null = null;
export function authClient(): SupabaseClient | null {
  if (!authConfigured) return null;
  if (typeof window === "undefined") return null;
  if (!_client) {
    _client = createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return _client;
}
