"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authClient, authConfigured } from "./client";
import type { Role } from "./roles";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export type AuthMode = "supabase" | "guest" | "none";

interface AuthState {
  loading: boolean;
  /** Session present (real user OR guest). */
  isAuthed: boolean;
  mode: AuthMode;
  profile: Profile | null;
  role: Role;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const GUEST_KEY = "tt.auth.guest";
const AuthContext = createContext<AuthState | null>(null);

// Demo bypass keeps the static preview fully browsable (Administrator visibility).
// Real sign-ins get their actual role from the profiles table.
const GUEST_PROFILE: Profile = { id: "guest", email: "demo@local", fullName: "Demo", role: "Administrator" };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<AuthMode>("none");

  const loadProfile = useCallback(async (userId: string, email: string) => {
    const sb = authClient();
    if (!sb) return null;
    try {
      const { data } = await sb.from("profiles").select("*").eq("id", userId).single();
      if (data) {
        return { id: data.id, email: data.email ?? email, fullName: data.full_name ?? "", role: (data.role as Role) ?? "Guest" };
      }
    } catch {
      /* table may not exist yet */
    }
    // Fallback: treat any authed user as Administrator until profiles is populated.
    return { id: userId, email, fullName: "", role: "Administrator" as Role };
  }, []);

  useEffect(() => {
    let active = true;
    // Guest session (local bypass so the static preview is never locked out).
    if (typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1") {
      setProfile(GUEST_PROFILE);
      setMode("guest");
      setLoading(false);
      return;
    }
    if (!authConfigured) {
      setLoading(false);
      return;
    }
    const sb = authClient();
    if (!sb) {
      setLoading(false);
      return;
    }
    sb.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const u = data.session?.user;
      if (u) {
        const p = await loadProfile(u.id, u.email ?? "");
        if (active) {
          setProfile(p);
          setMode("supabase");
        }
      }
      if (active) setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user;
      if (u) {
        const p = await loadProfile(u.id, u.email ?? "");
        setProfile(p);
        setMode("supabase");
      } else if (localStorage.getItem(GUEST_KEY) !== "1") {
        setProfile(null);
        setMode("none");
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback<AuthState["signIn"]>(async (email, password) => {
    const sb = authClient();
    if (!sb) return { error: "Auth not configured." };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback<AuthState["signUp"]>(async (email, password, fullName) => {
    const sb = authClient();
    if (!sb) return { error: "Auth not configured." };
    const { error } = await sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    return error ? { error: error.message } : {};
  }, []);

  const continueAsGuest = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem(GUEST_KEY, "1");
    setProfile(GUEST_PROFILE);
    setMode("guest");
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") localStorage.removeItem(GUEST_KEY);
    const sb = authClient();
    if (sb) await sb.auth.signOut();
    setProfile(null);
    setMode("none");
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      isAuthed: !!profile,
      mode,
      profile,
      role: profile?.role ?? "Guest",
      signIn,
      signUp,
      continueAsGuest,
      signOut,
    }),
    [loading, profile, mode, signIn, signUp, continueAsGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
