"use client";

/**
 * 2FA / MFA (TOTP) via Supabase Auth — client-side, so it works on both the
 * static (Pages) and Node (Vercel) hosts. Enrollment lives in Profile; the
 * AuthGate enforces the challenge on protected routes when a verified factor
 * exists. All calls are guarded and fail-open (never block a normal session
 * because of an MFA lookup error).
 */
import { authClient } from "./client";

export interface EnrollResult {
  factorId: string;
  qr: string; // SVG data-URI from Supabase
  secret: string;
}

interface Factor {
  id: string;
  status: string;
  friendly_name?: string;
}

export async function listVerifiedFactors(): Promise<Factor[]> {
  const sb = authClient();
  if (!sb) return [];
  try {
    const { data } = await sb.auth.mfa.listFactors();
    return (data?.totp ?? []).filter((f) => f.status === "verified") as Factor[];
  } catch {
    return [];
  }
}

/** Begin TOTP enrollment (cleans up any stale unverified factor first). */
export async function enrollTOTP(): Promise<EnrollResult | { error: string }> {
  const sb = authClient();
  if (!sb) return { error: "Auth not configured." };
  try {
    const { data: list } = await sb.auth.mfa.listFactors();
    for (const f of list?.totp ?? []) if (f.status !== "verified") await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) return { error: error?.message ?? "Enrollment failed." };
    return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Enrollment failed." };
  }
}

/** Verify a 6-digit code against a factor (used for both enroll + login challenge). */
export async function verifyCode(factorId: string, code: string): Promise<{ error?: string }> {
  const sb = authClient();
  if (!sb) return { error: "Auth not configured." };
  try {
    const ch = await sb.auth.mfa.challenge({ factorId });
    if (ch.error || !ch.data) return { error: ch.error?.message ?? "Challenge failed." };
    const v = await sb.auth.mfa.verify({ factorId, challengeId: ch.data.id, code });
    return v.error ? { error: v.error.message } : {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Verification failed." };
  }
}

export async function unenrollFactor(factorId: string): Promise<void> {
  const sb = authClient();
  if (!sb) return;
  try {
    await sb.auth.mfa.unenroll({ factorId });
  } catch {
    /* ignore */
  }
}

/** Does the current session need to step up to AAL2 (verified factor present)? */
export async function mfaChallengeNeeded(): Promise<{ required: boolean; factorId?: string }> {
  const sb = authClient();
  if (!sb) return { required: false };
  try {
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!aal || aal.currentLevel === "aal2" || aal.nextLevel !== "aal2") return { required: false };
    const verified = await listVerifiedFactors();
    return verified.length ? { required: true, factorId: verified[0].id } : { required: false };
  } catch {
    return { required: false };
  }
}
