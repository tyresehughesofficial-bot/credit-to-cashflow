"use client";

import { Users2, CalendarDays, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Field } from "@/components/intelligence/data-table";
import { TEAM_SEED, WEEKLY_RHYTHM } from "@/lib/team/data";
import { ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth/use-auth";

const FIELDS: Field[] = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role", type: "select", options: ROLES },
  { key: "owns", label: "Owns" },
  { key: "reports", label: "Reports Weekly" },
  { key: "kpis", label: "KPIs" },
];

export default function TeamOSPage() {
  const { profile, role } = useAuth();

  return (
    <div>
      <PageHeader
        icon={<Users2 className="h-5 w-5" />}
        title="Team OS"
        description="Roles, ownership, weekly rhythm, and KPIs — so the business runs on the system, not on you."
      />

      {profile && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm">
            Signed in as <span className="font-semibold">{profile.fullName || profile.email}</span> ·{" "}
            <span className="text-gold">{role}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role as Role]}</p>
        </div>
      )}

      <DataTable collection="team_members" seed={TEAM_SEED} fields={FIELDS} title="Team Roster" searchKeys={["name", "role", "owns"]} />

      {/* Weekly rhythm */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-gold" /> Weekly Workflow
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {WEEKLY_RHYTHM.map((d) => (
            <div key={d.day} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-bold">{d.day}</p>
              <p className="mb-2 text-xs text-gold">{d.title}</p>
              <ul className="space-y-1">
                {d.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Roles reference */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-gold" /> Roles & Permissions
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r} className="rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-semibold">{r}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
