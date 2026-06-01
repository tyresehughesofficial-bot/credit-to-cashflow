import Link from "next/link";

import { cn } from "@/lib/utils";
import { SOURCE_META } from "@/lib/intelligence/scoring";
import type { Funnel, IntelSource, Platform, TopicCategory } from "@/lib/intelligence/types";

const FUNNEL_CLASS: Record<Funnel, string> = {
  TOF: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  MOF: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
  BOF: "bg-gold/10 text-gold border border-gold/25",
};

export function FunnelChip({ funnel }: { funnel: Funnel }) {
  return (
    <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide", FUNNEL_CLASS[funnel])}>
      {funnel}
    </span>
  );
}

export function CategoryChip({ category }: { category: TopicCategory }) {
  return (
    <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {category}
    </span>
  );
}

export function PlatformChip({ platform }: { platform: Platform }) {
  return (
    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {platform}
    </span>
  );
}

export function SourceChip({ source, link = true }: { source: IntelSource; link?: boolean }) {
  const meta = SOURCE_META[source];
  const inner = (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/[0.06] px-2 py-0.5 text-[10px] font-semibold text-gold/90">
      {meta.short}
    </span>
  );
  if (!link) return inner;
  return (
    <Link href={meta.href} className="transition-opacity hover:opacity-80">
      {inner}
    </Link>
  );
}

/** Small KPI tile used across intel pages. */
export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-extrabold tracking-tight", accent && "gold-text")}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground first:mt-0">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      {children}
    </div>
  );
}
