"use client";

import { useMemo, useState } from "react";
import { BookOpen, Bot, Search, Send } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  KNOWLEDGE_BASE,
  KNOWLEDGE_CATEGORIES,
  searchKnowledge,
  type KnowledgeArticle,
} from "@/lib/data/knowledge";

const catVariant: Record<string, "default" | "secondary" | "success" | "warning" | "muted"> = {
  FCRA: "default",
  FDCPA: "success",
  "Metro 2": "warning",
  CFPB: "secondary",
  General: "muted",
};

export default function KnowledgePage() {
  const [category, setCategory] = useState<string>("all");
  const [browseQuery, setBrowseQuery] = useState("");
  const [active, setActive] = useState<KnowledgeArticle | null>(null);

  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState<{ article: KnowledgeArticle; answer: string } | null>(null);
  const [asked, setAsked] = useState(false);

  const articles = useMemo(() => {
    const q = browseQuery.toLowerCase();
    return KNOWLEDGE_BASE.filter((a) => {
      const matchesCat = category === "all" || a.category === category;
      const matchesQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q));
      return matchesCat && matchesQ;
    });
  }, [category, browseQuery]);

  function handleAsk() {
    setAsked(true);
    setAnswer(searchKnowledge(ask));
  }

  return (
    <div>
      <PageHeader
        icon={<BookOpen className="h-5 w-5" />}
        title="Credit Knowledge Center"
        description="Your searchable FCRA, FDCPA, Metro 2 & CFPB knowledge base, with an AI assistant."
      />

      {/* AI Assistant */}
      <Card className="mb-6 border-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-gold" /> Knowledge Assistant
          </CardTitle>
          <CardDescription>
            Ask a credit-law question — get a cited answer from the knowledge base.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. How long do I have to dispute? What is Method of Verification?"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={handleAsk}>
              <Send className="h-4 w-4" /> Ask
            </Button>
          </div>
          {asked &&
            (answer ? (
              <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                <Badge variant={catVariant[answer.article.category]} className="mb-2">
                  {answer.article.category}
                  {answer.article.citation ? ` · ${answer.article.citation}` : ""}
                </Badge>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {answer.answer}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No matching article found. Try keywords like &quot;dispute&quot;, &quot;validation&quot;,
                &quot;utilization&quot;, or &quot;CFPB&quot;.
              </p>
            ))}
        </CardContent>
      </Card>

      {/* Browse */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search the knowledge base…"
            className="pl-9"
            value={browseQuery}
            onChange={(e) => setBrowseQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={category === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategory("all")}
          >
            All
          </Button>
          {KNOWLEDGE_CATEGORIES.map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "secondary"}
              size="sm"
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((a) => (
          <Card
            key={a.id}
            className="cursor-pointer transition-colors hover:border-gold/40"
            onClick={() => setActive(active?.id === a.id ? null : a)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm">{a.title}</CardTitle>
                <Badge variant={catVariant[a.category]}>{a.category}</Badge>
              </div>
              <CardDescription>{a.summary}</CardDescription>
            </CardHeader>
            {active?.id === a.id && (
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-foreground/90">{a.body}</p>
                {a.citation && (
                  <p className="text-xs text-gold">Citation: {a.citation}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      #{t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
