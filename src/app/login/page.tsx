"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

import { authConfigured } from "@/lib/auth/client";
import { useAuth } from "@/lib/auth/use-auth";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/50";

// Base path prefix (set to /credit-to-cashflow on the GitHub Pages build).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function LoginPage() {
  const { isAuthed, signIn, signUp, continueAsGuest } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed) router.replace("/command-center");
  }, [isAuthed, router]);

  async function submit() {
    setBusy(true);
    setMsg(null);
    const res =
      mode === "signin"
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form.fullName);
    setBusy(false);
    if (res.error) setMsg(res.error);
    else if (mode === "signup") setMsg("Account created. Check your email to confirm, then sign in.");
    // on success the auth listener redirects via the effect above
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          {/* Logo — uses your gold logo (triad-t-login-logo.png) when present,
              otherwise falls back to the existing brand mark. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE}/brand/triad-t-login-logo.png`}
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.dataset.fallback) {
                el.dataset.fallback = "1";
                el.src = `${BASE}/brand/tte-mark.png`;
              }
            }}
            alt="Triad T Enterprise"
            className="mx-auto mb-4 h-44 w-auto object-contain drop-shadow-[0_0_32px_rgba(212,175,55,0.30)]"
          />
          <h1 className="text-xl font-bold tracking-tight">Triad T AI Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your workspace" : "Create your account"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-gold">
          {!authConfigured && (
            <p className="mb-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">
              Auth not configured — use Guest access.
            </p>
          )}

          <div className="space-y-3">
            {mode === "signup" && (
              <input
                className={input}
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            )}
            <input
              className={input}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className={input}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember this device
              </label>
              <span className="opacity-60" title="2FA enrollment coming soon">
                2FA: soon
              </span>
            </div>

            {msg && <p className="text-xs text-gold">{msg}</p>}

            <button
              onClick={submit}
              disabled={busy || !authConfigured || !form.email || !form.password}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-gold-gradient px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              className="text-muted-foreground hover:text-gold"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMsg(null);
              }}
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
            <button
              onClick={() => continueAsGuest()}
              className={cn("inline-flex items-center gap-1 text-gold hover:opacity-80")}
            >
              Continue as Guest <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          First account created becomes the Administrator.
        </p>
      </div>
    </div>
  );
}
