"use client";

import { useRouter } from "next/navigation";
import { CircleUser, LogOut } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { authConfigured } from "@/lib/auth/client";
import { ROLE_DESCRIPTIONS, type Role } from "@/lib/auth/roles";

export default function ProfilePage() {
  const { profile, role, signOut, mode } = useAuth();
  const router = useRouter();
  return (
    <div>
      <PageHeader icon={<CircleUser className="h-5 w-5" />} title="Profile" description="Your account, preferences, and security." />
      <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Name</p>
          <p className="text-sm font-semibold">{profile?.fullName || "—"}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</p>
          <p className="text-sm">{profile?.email || "—"}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Role</p>
          <p className="text-sm text-gold">{role}{mode === "guest" && " · demo"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role as Role]}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Security</p>
          <p className="text-sm text-muted-foreground">2FA enrollment coming soon.</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { await signOut(); if (authConfigured) router.replace("/login"); }}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
