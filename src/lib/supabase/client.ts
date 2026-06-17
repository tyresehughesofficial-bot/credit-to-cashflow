"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Safe to import in client components.
 *
 * The project URL is baked in as a default (it's public). The anon key is
 * read from the build env (NEXT_PUBLIC_SUPABASE_ANON_KEY) — set it as a GitHub
 * Actions secret, or paste it to have it committed here (the anon key is
 * publishable / safe to expose; RLS protects the data). Returns `null` when the
 * key is absent so the app stays in local-only mode.
 */
const DEFAULT_URL = "https://ttbcxfgopvvjkqmquqfh.supabase.co";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
