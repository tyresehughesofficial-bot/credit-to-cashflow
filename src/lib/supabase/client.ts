"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Safe to import in client components.
 * Returns `null` when env vars are absent so the app can run in
 * "demo mode" against the bundled mock data (Phase 1 focus: functionality).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createBrowserClient(url, key);
}

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
