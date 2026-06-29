"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUser, LogOut, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { authConfigured } from "@/lib/auth/client";
import { ROLE_DESCRIPTIONS, type Role } from "@/lib/auth/roles";
import { enrollTOTP, verifyCode, unenrollFactor, listVerifiedFactors, type EnrollResult } from "@/lib/auth/mfa";

export default function ProfilePage() {
  const { profile, role, signOut, mode } = useAuth();
  const router = useRouter();
  return (
    <div>
      <PageHeader icon={<CircleUser className="h-5 w-5" />} title="Profile" description="Your account, preferences, and security." />
      <div className="max-w-lg space-y-4">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <Field label="Name" value={profile?.fullName || "—"} />
          <Field label="Email" value={profile?.email || "—"} />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Role</p>
            <p className="text-sm text-gold">{role}{mode === "guest" && " · demo"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role as Role]}</p>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); if (authConfigured) router.replace("/login"); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <TwoFactorCard isRealUser={mode === "supabase"} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function TwoFactorCard({ isRealUser }: { isRealUser: boolean }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<EnrollResult | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isRealUser) { setEnabled(false); return; }
    listVerifiedFactors().then((f) => { setEnabled(f.length > 0); setFactorId(f[0]?.id ?? null); });
  }, [isRealUser]);

  async function startEnroll() {
    setBusy(true); setErr(null);
    const res = await enrollTOTP();
    setBusy(false);
    if ("error" in res) setErr(res.error);
    else setEnroll(res);
  }
  async function confirm() {
    if (!enroll) return;
    setBusy(true); setErr(null);
    const res = await verifyCode(enroll.factorId, code.trim());
    setBusy(false);
    if (res.error) setErr(res.error);
    else { setEnabled(true); setFactorId(enroll.factorId); setEnroll(null); setCode(""); }
  }
  async function disable() {
    if (!factorId) return;
    setBusy(true);
    await unenrollFactor(factorId);
    setBusy(false);
    setEnabled(false); setFactorId(null);
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          {enabled ? <ShieldCheck className="h-4 w-4 text-success" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
          Two-Factor Authentication (TOTP)
        </p>
        {enabled !== null && (
          <span className={`text-xs ${enabled ? "text-success" : "text-muted-foreground"}`}>{enabled ? "Enabled" : "Off"}</span>
        )}
      </div>

      {!isRealUser ? (
        <p className="text-xs text-muted-foreground">Sign in with a real account to enable 2FA. (Demo/guest sessions can&apos;t enroll.)</p>
      ) : enabled ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Your account is protected with an authenticator app.</p>
          <Button variant="outline" size="sm" onClick={disable} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />} Disable 2FA
          </Button>
        </div>
      ) : enroll ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Scan this in your authenticator app, then enter the 6-digit code.</p>
          {/* Supabase returns an SVG data-URI QR */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="2FA QR code" className="h-40 w-40 rounded-lg border border-border bg-white p-1" />
          <p className="break-all text-[11px] text-muted-foreground">Secret: <span className="text-foreground/80">{enroll.secret}</span></p>
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-28 rounded-md border border-border bg-background px-3 py-2 text-center tracking-[0.3em] outline-none focus:border-gold/50"
            />
            <Button size="sm" onClick={confirm} disabled={busy || code.length !== 6}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Verify & enable
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" onClick={startEnroll} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Enable 2FA
        </Button>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
