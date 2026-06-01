"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Wand2, Radar, CalendarPlus, PenLine, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FunnelChip, SourceChip } from "@/components/intelligence/bits";
import { setStage, useProductionItems } from "@/lib/intelligence/production";
import { CONTENT_IDEAS } from "@/lib/data/mock";
import { generateContent, type GeneratedContent } from "@/lib/generators";
import type { Funnel } from "@/types/database";

const FORMAT_MAP: Record<string, string> = {
  Reel: "reel",
  Carousel: "carousel",
  Story: "story",
  Short: "reel",
  "Long-form": "post",
  Thread: "post",
};

const FUNNELS: { value: Funnel; label: string; hint: string }[] = [
  { value: "TOF", label: "TOF — Awareness", hint: "Reach & attention" },
  { value: "MOF", label: "MOF — Consideration", hint: "Trust & authority" },
  { value: "BOF", label: "BOF — Conversion", hint: "Book & buy" },
];

const FORMATS = ["reel", "carousel", "story", "post"];

const funnelVariant: Record<Funnel, "default" | "secondary" | "success"> = {
  TOF: "secondary",
  MOF: "default",
  BOF: "success",
};

export default function ContentEnginePage() {
  const [topic, setTopic] = useState("");
  const [funnel, setFunnel] = useState<Funnel>("TOF");
  const [format, setFormat] = useState("reel");
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const approved = useProductionItems();

  function handleGenerate() {
    setResult(generateContent(topic, funnel, format));
  }

  function produceFrom(oppTitle: string, oppFunnel: Funnel, oppFormat: string) {
    setTopic(oppTitle);
    setFunnel(oppFunnel);
    const mapped = FORMAT_MAP[oppFormat] ?? "reel";
    setFormat(mapped);
    setResult(generateContent(oppTitle, oppFunnel, mapped));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="AI Content Engine"
        description="Generate TOF / MOF / BOF content ideas, reels, carousels, captions, and CTAs — built for credit & funding."
        actions={
          <Link href="/intelligence/queue">
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-gold/40 px-4 text-sm font-semibold text-gold hover:bg-gold/10">
              <Radar className="h-4 w-4" /> Opportunity Queue
            </span>
          </Link>
        }
      />

      {/* Approved opportunities flowing in from the Intelligence Engine */}
      <Card className="mb-6 border-gold/25">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-gold" /> From the Intelligence Engine
            </CardTitle>
            <CardDescription>
              {approved.length > 0
                ? "Approved opportunities ready to produce — generate the package or send to the calendar."
                : "Approve opportunities in the Opportunity Queue and they flow straight in here."}
            </CardDescription>
          </div>
          <Badge variant={approved.length ? "success" : "muted"}>{approved.length} approved</Badge>
        </CardHeader>
        <CardContent>
          {approved.length === 0 ? (
            <Link
              href="/intelligence/queue"
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/40 px-4 py-6 text-sm text-muted-foreground hover:text-foreground"
            >
              Open the Opportunity Queue to approve your first opportunity <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {approved.slice(0, 6).map((it) => (
                <div key={it.opp.id} className="flex flex-col rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center gap-1.5">
                    <SourceChip source={it.opp.source} />
                    <FunnelChip funnel={it.opp.funnel} />
                    <span className="ml-auto text-[11px] font-bold text-gold">{it.opp.total}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] font-medium leading-snug">{it.opp.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {it.stage}
                    {it.date ? ` · ${it.date}` : ""}
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 flex-1 text-[11px]"
                      onClick={() => {
                        setStage(it.opp.id, "Scripting");
                        produceFrom(it.opp.title, it.opp.funnel as Funnel, it.opp.format);
                      }}
                    >
                      <PenLine className="h-3 w-3" /> Produce
                    </Button>
                    <Link href="/content-calendar">
                      <Button size="sm" variant="outline" className="h-7 text-[11px]">
                        <CalendarPlus className="h-3 w-3" /> Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Generate</CardTitle>
            <CardDescription>Describe the topic and pick the funnel stage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic / angle</Label>
              <Input
                id="topic"
                placeholder="e.g. credit utilization, business funding, dispute myths"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Funnel stage</Label>
              <Select value={funnel} onValueChange={(v) => setFunnel(v as Funnel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNNELS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleGenerate}>
              <Wand2 className="h-4 w-4" /> Generate Content
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {result ? (
            <Card className="border-gold/30">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant={funnelVariant[result.funnel]}>{result.funnel}</Badge>
                    <span className="capitalize">{result.format}</span>
                  </CardTitle>
                  <CardDescription>Generated content package</CardDescription>
                </div>
                <CopyButton
                  label="Copy all"
                  value={`HOOK: ${result.hook}\n\nOUTLINE:\n${result.outline.join("\n")}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS: ${result.hashtags.join(" ")}`}
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <Field label="Hook" value={result.hook}>
                  <p className="text-base font-semibold leading-snug">{result.hook}</p>
                </Field>
                <Field label="Outline" value={result.outline.join("\n")}>
                  <ol className="space-y-1.5 text-sm text-muted-foreground">
                    {result.outline.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gold">{i + 1}.</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ol>
                </Field>
                <Field label="Caption" value={result.caption}>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{result.caption}</p>
                </Field>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Hashtags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags.map((h) => (
                      <Badge key={h} variant="outline">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter a topic and hit <span className="text-gold">Generate</span> to produce a full
                  content package.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Content Pipeline</CardTitle>
              <CardDescription>Recently planned ideas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {CONTENT_IDEAS.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{idea.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {idea.format} · {idea.pillar}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={funnelVariant[idea.funnel]}>{idea.funnel}</Badge>
                    <Badge variant="muted" className="capitalize">
                      {idea.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <CopyButton value={value} size="sm" variant="ghost" className="h-7" />
      </div>
      {children}
    </div>
  );
}
