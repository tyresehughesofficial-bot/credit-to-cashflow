"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCircle, Search, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { CLIENT_SEED } from "@/lib/credit/data";
import { type Client, fullName } from "@/lib/credit/types";
import { initials } from "@/lib/utils";

export default function ClientProfilesPage() {
  const clients = useCollection<Client & Row>("clients", CLIENT_SEED as (Client & Row)[]);
  const [q, setQ] = useState("");
  const rows = clients.records.filter((c) => {
    const n = fullName(c).toLowerCase();
    return !q || n.includes(q.toLowerCase()) || (c.email ?? "").toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <PageHeader icon={<UserCircle className="h-5 w-5" />} title="Client Profiles" description="Full client directory — contacts, source, and program status." />
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <Link key={c.id} href="/clients" className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/40">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials(fullName(c))}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fullName(c)}</p>
                <p className="truncate text-xs text-muted-foreground">{c.email || c.phone || "—"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{c.status.replace("_", " ")}</Badge>
              {c.source && <Badge variant="outline" className="text-[10px]">{c.source === "myfreescorenow" ? "MFSN" : c.source}</Badge>}
            </div>
          </Link>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No clients match.</p>}
      </div>
    </div>
  );
}
