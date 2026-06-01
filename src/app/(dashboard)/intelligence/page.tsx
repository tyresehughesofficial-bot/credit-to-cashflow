"use client";

import Link from "next/link";
import {
  Radar,
  TrendingUp,
  Flame,
  MessageCircleQuestion,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionLabel, Stat } from "@/components/intelligence/bits";
import { OpportunityCard } from "@/components/intelligence/opportunity-card";
import { TierBadge } from "@/components/intelligence/score";
import { SOURCE_META } from "@/lib/intelligence/scoring";
import {
  DEMAND_SIGNALS,
  OBJECTIONS,
  OPPORTUNITIES,
  OUTLIERS,
  TRENDING_TOPICS,
} from "@/lib/intelligence/data";
import type { IntelSource } from "@/lib/intelligence/types";

const SOURCE_ORDER: IntelSource[] = [
  "competitor",
  "outlier",
  "demand",
  "hook",
  "voice",
  "myth",
  "bureau",
  "cfpb",
  "funding",
  "objection",
  "client",
];

export default function IntelligenceHQ() {
  const top = OPPORTUNITIES.slice(0, 5);
  const questions = DEMAND_SIGNALS.filter((d) => d.type === "Question" || d.type === "Confusion");

  return (
    <div>
      <PageHeader
        icon={<Radar className="h-5 w-5" />}
        title="Intelligence HQ"
        description="The proprietary engine that continuously discovers, scores and prioritizes content opportunities — answering one question: what should Triad T create next?"
        actions={
          <Link href="/intelligence/queue">
            <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-gold-gradient px-4 text-sm font-semibold text-primary-foreground shadow-gold">
              Open Opportunity Queue <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Top Opportunities" value={OPPORTUNITIES.length} sub="scored & ranked today" accent />
        <Stat label="New Outliers" value={OUTLIERS.length} sub="dramatically over average" />
        <Stat label="New Questions" value={questions.length} sub="from demand mining" />
        <Stat label="New Objections" value={OBJECTIONS.length} sub="from sales intelligence" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionLabel>Top Opportunities Today</SectionLabel>
          <div className="space-y-3">
            {top.map((o, i) => (
              <OpportunityCard key={o.id} opp={o} defaultOpen={i === 0} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Trending Topics</SectionLabel>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {TRENDING_TOPICS.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{t.topic}</p>
                  <p className="text-[11px] text-muted-foreground">{t.posts.toLocaleString()} posts tracked</p>
                </div>
                <span className="text-xs font-bold tabular-nums text-gold">{t.momentum}</span>
              </div>
            ))}
          </div>

          <SectionLabel>New Outliers</SectionLabel>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {OUTLIERS.slice(0, 3).map((o) => (
              <Link
                key={o.id}
                href="/intelligence/outliers"
                className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-secondary/50"
              >
                <Flame className="h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{o.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.creator} · {o.multiple}x average
                  </p>
                </div>
                <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                  {o.multiple}x
                </span>
              </Link>
            ))}
          </div>

          <SectionLabel>New Questions & Objections</SectionLabel>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {questions.slice(0, 2).map((q) => (
              <div key={q.id} className="flex items-start gap-2.5">
                <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <p className="text-[13px] leading-snug">{q.text}</p>
              </div>
            ))}
            {OBJECTIONS.slice(0, 2).map((o) => (
              <div key={o.id} className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-[13px] leading-snug">{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel>Intelligence Sources</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SOURCE_ORDER.map((s, i) => {
          const meta = SOURCE_META[s];
          return (
            <Link
              key={s}
              href={meta.href}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/30 hover:bg-gold/[0.03]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Source #{i + 1}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
              </div>
              <p className="mt-1.5 text-[14px] font-semibold leading-snug">{meta.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
