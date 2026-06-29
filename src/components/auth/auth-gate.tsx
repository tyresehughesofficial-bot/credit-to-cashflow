"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

import { authConfigured } from "@/lib/auth/client";
import { useAuth } from "@/lib/auth/use-auth";
import { mfaChallengeNeeded, verifyCode } from "@/lib/auth/mfa";

/** Gates the dashboard. Static-host friendly: client-side redirect to /login.
 *  When auth isn't configured at all, it lets everything through (local/demo).
 *  Enforces a 2FA step-up when the signed-in user has a verified TOTP factor. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthed, mode } = useAuth();
  const router = useRouter();
  const [mfa, setMfa] = useState<{ checked: boolean; required: boolean; factorId?: string }>({ checked: false, required: false });

  useEffect(() => {
    if (authConfigured && !loading && !isAuthed) router.replace("/login");
  }, [loading, isAuthed, router]);

  // Check whether the session must step up to AAL2 (real Supabase session only).
  useEffect(() => {
    let active = true;
    if (mode === "supabase" && isAuthed) {
      mfaChallengeNeeded().then((r) => active && setMfa({ checked: true, required: r.required, factorId: r.factorId }));
    } else {
      setMfa({ checked: true, required: false });
    }
    return () => { active = false; };
  }, [mode, isAuthed]);

  if (!authConfigured) return <>{children}</>;

  if (loading || !isAuthed || !mfa.checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-gold" /> Loading…
        </div>
      </div>
    );
  }

  if (mfa.required && mfa.factorId) {
    return <MfaChallenge factorId={mfa.factorId} onVerified={() => setMfa({ checked: true, required: false })} />;
  }

  return <>{children}</>;
}

function MfaChallenge({ factorId, onVerified }: { factorId: string; onVerified: () => void }) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);
    const res = await verifyCode(factorId, code.trim());
    setBusy(false);
    if (res.error) setErr(res.error);
    else onVerified();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold">Two-factor verification</h1>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
        <input
          autoFocus
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && code.length === 6 && submit()}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:border-gold/50"
          placeholder="••••••"
        />
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
        <button
          onClick={submit}
          disabled={busy || code.length !== 6}
          className="mt-3 w-full rounded-md bg-gold-gradient px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
        <button onClick={async () => { await signOut(); router.replace("/login"); }} className="mt-3 text-xs text-muted-foreground hover:text-foreground">
          Sign out
        </button>
      </div>
    </div>
  );
}
