"use client";

import { Eye, Users2, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlatformChip, SectionLabel, Stat } from "@/components/intelligence/bits";
import { DetectedOpportunities } from "@/components/intelligence/opp-list";
import { DataTable } from "@/components/intelligence/data-table";
import { useCollection } from "@/lib/db/use-collection";
import { COLL, FIELDS, SEED } from "@/lib/intelligence/collections";
import { CREATORS, TRENDING_TOPICS } from "@/lib/intelligence/data";
import type { CompetitorPost } from "@/lib/intelligence/types";

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`);

export default function CompetitorIntelligence() {
  const COMPETITOR_POSTS = useCollection(COLL.competitorPosts, SEED[COLL.competitorPosts])
    .records as unknown as CompetitorPost[];
  const topPosts = [...COMPETITOR_POSTS].sort((a, b) => b.views - a.views);
  const fastest = [...CREATORS].sort((a, b) => b.growth - a.growth);

  return (
    <div>
      <PageHeader
        icon={<Users2 className="h-5 w-5" />}
        title="Competitor Intelligence"
        description="Continuous monitoring of credit, funding, business-credit, finance and entrepreneurship creators across YouTube, TikTok, Instagram and X."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Creators Tracked" value={CREATORS.length} sub="across 4 platforms" accent />
        <Stat label="Posts Analyzed" value={COMPETITOR_POSTS.length} sub="rolling 7 days" />
        <Stat label="Top Reach" value={fmt(topPosts[0].views)} sub={topPosts[0].creator} />
        <Stat label="Fastest Growing" value={`+${fastest[0].growth}%`} sub={fastest[0].name} />
      </div>

      <SectionLabel>Top Performing Content</SectionLabel>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title / Hook</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Saves</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPosts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-[280px]">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">“{p.hook}”</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <PlatformChip platform={p.platform} />
                    <span className="text-[10px] text-muted-foreground">{p.postedAt}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[12px] text-muted-foreground">{p.creator}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-gold">{fmt(p.views)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(p.likes)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(p.comments)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(p.shares)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(p.saves)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionLabel>Fastest Growing Creators</SectionLabel>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {fastest.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <Users2 className="h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {c.name} <span className="text-muted-foreground">{c.handle}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {fmt(c.followers)} followers · {fmt(c.avgViews)} avg views · {c.niche}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                  <TrendingUp className="h-3 w-3" /> {c.growth}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Trending Topics & Emerging Themes</SectionLabel>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {TRENDING_TOPICS.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <Eye className="h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{t.topic}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold" style={{ width: `${t.momentum}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold tabular-nums text-gold">{t.momentum}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel>Competitor Posts — Add / Edit / Import</SectionLabel>
      <DataTable collection={COLL.competitorPosts} seed={SEED[COLL.competitorPosts]} fields={FIELDS[COLL.competitorPosts]} title="Competitor Posts" />

      <DetectedOpportunities source="competitor" />
    </div>
  );
}
