"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

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
import { CONTENT_IDEAS } from "@/lib/data/mock";
import { generateContent, type GeneratedContent } from "@/lib/generators";
import type { Funnel } from "@/types/database";

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

  function handleGenerate() {
    setResult(generateContent(topic, funnel, format));
  }

  return (
    <div>
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="AI Content Engine"
        description="Generate TOF / MOF / BOF content ideas, reels, carousels, captions, and CTAs — built for credit & funding."
      />

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
