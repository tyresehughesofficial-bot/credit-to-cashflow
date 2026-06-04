"use client";

import { useMemo, useState } from "react";
import {
  Library,
  Send,
  Plus,
  ExternalLink,
  FileText,
  ShieldCheck,
  Landmark,
  Headphones,
  Sparkles,
  Bot,
  CircleCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel, Stat } from "@/components/intelligence/bits";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { AGENTS, AGENT_BY_ID, DOCUMENTS } from "@/lib/vault/data";
import { answerQuery, chunkText, type VaultAnswer } from "@/lib/vault/engine";
import type { AgentId, KnowledgeDoc } from "@/lib/vault/types";

const COLLECTION = "knowledge_documents";
const SEED = DOCUMENTS as unknown as Row[];

const AGENT_ICON: Record<AgentId, typeof ShieldCheck> = {
  dispute: ShieldCheck,
  funding: Landmark,
  sales: Headphones,
  content: Sparkles,
};

const EXAMPLES = [
  "Create a dispute letter for a collection",
  "How much funding can I get?",
  "Write a consultation script",
  "Create a reel about collections",
];

const CATEGORIES = [
  "Credit & Disputes",
  "Funding & Capital",
  "Sales & Conversion",
  "Content & Marketing",
  "Brand Assets",
];

export default function KnowledgeVault() {
  const { records, add } = useCollection(COLLECTION, SEED);
  const docs = records as unknown as KnowledgeDoc[];

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<VaultAnswer | null>(null);
  const [filter, setFilter] = useState<AgentId | "all">("all");
  const [showIngest, setShowIngest] = useState(false);

  const stats = useMemo(() => {
    const embeddable = docs.filter((d) => d.status !== "asset");
    const embedded = docs.filter((d) => d.status === "embedded");
    const vectorCount = docs.reduce((a, d) => a + (d.chunks || 0), 0);
    const assignments = docs.reduce((a, d) => a + d.agents.length, 0);
    const categories = new Set(docs.map((d) => d.category)).size;
    const agentsCovered = new Set(docs.flatMap((d) => d.agents)).size;
    const lastUploaded = docs.reduce((m, d) => (d.uploadedAt > m ? d.uploadedAt : m), "");
    const now = Date.now();
    const fresh = embeddable.filter((d) => now - new Date(d.uploadedAt).getTime() < 60 * 864e5).length;
    const health = Math.round(
      (embeddable.length ? embedded.length / embeddable.length : 0) * 55 +
        (agentsCovered / 4) * 25 +
        (embeddable.length ? fresh / embeddable.length : 0) * 20,
    );
    return { total: docs.length, vectorCount, assignments, categories, lastUploaded, health };
  }, [docs]);

  const visible = docs.filter((d) => filter === "all" || d.agents.includes(filter));

  function ask(q: string) {
    const text = q.trim();
    if (!text) return;
    setQuery(text);
    setAnswer(answerQuery(text, docs));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader
        icon={<Library className="h-5 w-5" />}
        title="Knowledge Vault"
        description="Your business documents, transformed into a retrieval-augmented brain: read → chunk → embed → store → categorize → assign to an AI agent. Ask anything; the right agent and files are retrieved automatically."
      />

      {/* Dashboard stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Total Documents" value={stats.total} sub="in the vault" accent />
        <Stat label="Categories" value={stats.categories} sub="knowledge domains" />
        <Stat label="Agent Assignments" value={stats.assignments} sub="across 4 agents" />
        <Stat label="Vector Count" value={stats.vectorCount.toLocaleString()} sub="embedded chunks" />
        <Stat label="Last Uploaded" value={stats.lastUploaded || "—"} sub="most recent file" />
        <Stat label="Health Score" value={`${stats.health}%`} sub="vault readiness" accent />
      </div>

      {/* Ask the Vault — intelligent routing */}
      <SectionLabel>Ask the Vault — Intelligent Routing</SectionLabel>
      <div className="rounded-xl border border-gold/25 bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Bot className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(query)}
              placeholder="e.g. Create a dispute letter for a charge-off…"
              className="pl-9"
            />
          </div>
          <Button onClick={() => ask(query)}>
            <Send className="h-4 w-4" /> Route &amp; Retrieve
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => ask(ex)}
              className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-gold/30 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>

        {answer && (
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_300px]">
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold">
                  <Bot className="h-3.5 w-3.5" /> Routed → {answer.agentName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {Math.round(answer.confidence * 100)}% confidence
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {answer.draftTitle}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed">{answer.draft}</p>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Retrieved context ({answer.sources.length})
              </p>
              <div className="space-y-2">
                {answer.sources.map((s) => (
                  <div key={s.doc.id} className="rounded-lg border border-border bg-card p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-medium leading-snug">{s.doc.title}</p>
                      {s.doc.viewUrl && (
                        <a href={s.doc.viewUrl} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-gold" title="Open source file">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      match {(s.score * 100).toFixed(0)}% · {s.doc.chunks} vectors
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agents */}
      <SectionLabel>AI Agent Ownership</SectionLabel>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((a) => {
          const Icon = AGENT_ICON[a.id];
          const owned = docs.filter((d) => d.agents.includes(a.id));
          const vectors = owned.reduce((s, d) => s + (d.chunks || 0), 0);
          return (
            <button
              key={a.id}
              onClick={() => setFilter(filter === a.id ? "all" : a.id)}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-4 text-left transition-colors",
                filter === a.id ? "border-gold/40 bg-gold/[0.04]" : "border-border hover:border-gold/25",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-bold">{a.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{a.tagline}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {a.functions.slice(0, 4).map((f) => (
                  <span key={f} className="rounded-full bg-secondary/60 px-2 py-0.5 text-[9.5px] text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                <span className="font-bold text-gold">{owned.length}</span> docs ·{" "}
                <span className="font-bold text-foreground">{vectors.toLocaleString()}</span> vectors
              </p>
            </button>
          );
        })}
      </div>

      {/* Documents */}
      <div className="mt-8 flex items-center justify-between">
        <SectionLabel>
          Knowledge Documents {filter !== "all" && `· ${AGENT_BY_ID[filter].name}`}
        </SectionLabel>
        <Button size="sm" variant="outline" onClick={() => setShowIngest((s) => !s)}>
          <Plus className="h-3.5 w-3.5" /> Ingest Document
        </Button>
      </div>

      {showIngest && <IngestForm onIngest={(d) => { add(d as unknown as Row); setShowIngest(false); }} />}

      <div className="space-y-2">
        {visible.map((d) => (
          <DocRow key={d.id} doc={d} />
        ))}
      </div>
    </div>
  );
}

function DocRow({ doc }: { doc: KnowledgeDoc }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-medium">{doc.title}</p>
          {doc.viewUrl && (
            <a href={doc.viewUrl} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-gold" title="Open in Drive">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{doc.summary}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 text-[9.5px] text-muted-foreground">{doc.category}</span>
          {doc.agents.map((ag) => (
            <span key={ag} className="rounded-full border border-gold/20 bg-gold/[0.06] px-2 py-0.5 text-[9.5px] font-semibold text-gold/90">
              {AGENT_BY_ID[ag].name.replace("TRIAD ", "").replace("™", "")}
            </span>
          ))}
          {doc.agents.length === 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9.5px] text-muted-foreground">Brand asset</span>
          )}
        </div>
      </div>
      <div className="text-right text-[11px]">
        <p className="font-bold tabular-nums text-gold">{doc.chunks} vectors</p>
        <p className="inline-flex items-center gap-1 text-muted-foreground">
          {doc.status === "embedded" ? (
            <>
              <CircleCheck className="h-3 w-3 text-success" /> embedded
            </>
          ) : (
            doc.status
          )}
        </p>
      </div>
    </div>
  );
}

function IngestForm({ onIngest }: { onIngest: (d: KnowledgeDoc) => void }) {
  const [title, setTitle] = useState("");
  const [agent, setAgent] = useState<AgentId>("dispute");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");

  const inputCls = "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-gold/50";

  function submit() {
    if (!title.trim() || !content.trim()) return;
    const chunks = chunkText(content).length;
    const keywords = Array.from(new Set((content.toLowerCase().match(/[a-z]{5,}/g) ?? []).slice(0, 8)));
    onIngest({
      id: `doc-${Date.now()}`,
      title: title.trim(),
      agents: [agent],
      category: category as KnowledgeDoc["category"],
      fileType: "doc",
      summary: content.trim().slice(0, 600),
      keywords,
      chunks,
      status: "embedded",
      uploadedAt: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-gold/25 bg-card p-4">
      <p className="mb-3 text-[12px] font-semibold">
        Ingest a document <span className="text-muted-foreground">— extract → chunk → embed → assign</span>
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={inputCls} placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <select className={inputCls} value={agent} onChange={(e) => setAgent(e.target.value as AgentId)}>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <textarea
        className={cn(inputCls, "mt-2 min-h-[110px] resize-y")}
        placeholder="Paste the document text — it will be chunked and embedded into the vault."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          ~{content.trim() ? chunkText(content).length : 0} chunks will be created
        </p>
        <Button size="sm" onClick={submit}>
          <Sparkles className="h-3.5 w-3.5" /> Ingest &amp; embed
        </Button>
      </div>
    </div>
  );
}
