import { AGENTS, AGENT_BY_ID } from "./data";
import type { AgentId, KnowledgeDoc } from "./types";

/**
 * Retrieval engine.
 *
 * In production the embeddings come from OpenAI `text-embedding-3-small`
 * (1536-d) stored in pgvector and queried via the `match_knowledge` RPC.
 * Here — with no backend in the static preview — we use a deterministic local
 * embedding (token-hashing into a fixed vector) + cosine similarity so search,
 * routing and retrieval genuinely work offline. The contract is identical, so
 * swapping in the real provider is a one-function change.
 */

const DIM = 256;

function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9%]+/g) ?? []).filter((t) => t.length > 1);
}

function hash(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function embed(text: string): number[] {
  const v = new Array(DIM).fill(0);
  for (const t of tokenize(text)) v[hash(t) % DIM] += 1;
  const norm = Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < DIM; i++) dot += a[i] * b[i];
  return dot;
}

/** Split text into ~`size`-word chunks (the ingestion chunker). */
export function chunkText(text: string, size = 120): string[] {
  const words = text.split(/\s+/);
  if (words.length <= size) return [text.trim()];
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(" "));
  return out;
}

const docText = (d: KnowledgeDoc) => `${d.title}. ${d.summary} ${(d.keywords ?? []).join(" ")}`;
const _cache = new Map<string, number[]>();
function docEmbed(d: KnowledgeDoc): number[] {
  const key = `${d.id}:${d.summary?.length ?? 0}`;
  let e = _cache.get(key);
  if (!e) {
    e = embed(docText(d));
    _cache.set(key, e);
  }
  return e;
}

/* ───────────────────────── Intelligent routing ───────────────────────── */

export interface RouteResult {
  agent: AgentId;
  confidence: number; // 0..1
  scores: Record<AgentId, number>;
}

export function routeQuery(query: string): RouteResult {
  const q = query.toLowerCase();
  const qVec = embed(query);
  const scores = { dispute: 0, funding: 0, sales: 0, content: 0 } as Record<AgentId, number>;

  for (const agent of AGENTS) {
    // keyword hits (whole-string contains so multi-word terms match)
    let kw = 0;
    for (const k of agent.keywords) if (q.includes(k)) kw += k.includes(" ") || k.length > 6 ? 3 : 2;
    // semantic similarity to the agent profile
    const sim = cosine(qVec, embed([...agent.functions, ...agent.keywords].join(" ")));
    scores[agent.id] = kw + sim * 4;
  }

  // Strong intent boosts so the canonical examples route crisply.
  if (/\b(reel|carousel|caption|hook|thumbnail|content|post|video)\b/.test(q)) scores.content += 4;
  if (/\b(dispute|letter|charge[- ]?off|collection|inquiry|fcra)\b/.test(q)) scores.dispute += 4;
  if (/\b(funding|lender|loan|capital|approv\w*|underwrit\w*|0%)\b/.test(q)) scores.funding += 4;
  if (/\b(script|consultation|dm|close|objection|crm|book a? call)\b/.test(q)) scores.sales += 4;

  const entries = Object.entries(scores) as [AgentId, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [topAgent, topScore] = entries[0];
  const total = entries.reduce((a, [, s]) => a + Math.max(0, s), 0) || 1;
  return { agent: topAgent, confidence: Math.min(0.99, topScore / total), scores };
}

/* ───────────────────────── Retrieval ───────────────────────── */

export interface Retrieved {
  doc: KnowledgeDoc;
  score: number;
}

export function retrieve(query: string, docs: KnowledgeDoc[], agent?: AgentId, k = 4): Retrieved[] {
  const qVec = embed(query);
  const qTokens = new Set(tokenize(query));
  return docs
    .filter((d) => d.status === "embedded" && (!agent || d.agents.includes(agent)))
    .map((d) => {
      const sim = cosine(qVec, docEmbed(d));
      let overlap = 0;
      for (const k2 of d.keywords ?? []) if (qTokens.has(k2) || query.toLowerCase().includes(k2)) overlap += 0.05;
      return { doc: d, score: sim + overlap };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/* ───────────────────────── Grounded answer ───────────────────────── */

export interface VaultAnswer {
  agent: AgentId;
  agentName: string;
  confidence: number;
  sources: Retrieved[];
  draftTitle: string;
  draft: string;
}

export function answerQuery(query: string, docs: KnowledgeDoc[]): VaultAnswer {
  const route = routeQuery(query);
  const sources = retrieve(query, docs, route.agent, 4);
  const cited = sources.map((s) => s.doc.title);
  const grounding = cited.length ? cited.join(", ") : "the assigned knowledge base";
  const draft = buildDraft(route.agent, query, grounding);
  return {
    agent: route.agent,
    agentName: AGENT_BY_ID[route.agent].name,
    confidence: route.confidence,
    sources,
    draftTitle: draft.title,
    draft: draft.body,
  };
}

function buildDraft(agent: AgentId, query: string, grounding: string): { title: string; body: string } {
  switch (agent) {
    case "dispute":
      return {
        title: "Dispute draft (FCRA-grounded)",
        body:
          `Re: Formal dispute of inaccurate information\n\n` +
          `Per FCRA §611, I am disputing the item(s) referenced in: "${query}". The furnisher and bureau must complete a reasonable reinvestigation within 30 days and provide method of verification under §611(a)(7). Absent complete, accurate Metro 2 verification (including DOFD and payment history), the item must be deleted under §607(b).\n\n` +
          `Pulled from: ${grounding}. Next step: send certified, then escalate to CFPB if unverified.`,
      };
    case "funding":
      return {
        title: "Funding readiness response",
        body:
          `Goal: "${query}". Sequence to maximize approvals: (1) drive utilization under 9%, (2) clear inquiry-sensitive denials, (3) apply in order — personal → 0% business → bank lines, (4) match each app to the lender's pulled bureau and data points.\n\n` +
          `Pulled from: ${grounding}. I can build the exact lender-matched roadmap from the SECRET LENDERS LIST + Bank Data Points.`,
      };
    case "sales":
      return {
        title: "Sales / consultation script",
        body:
          `Use-case: "${query}".\n• Open with rapport + permission.\n• Recap their credit/funding goal and agitate the cost of staying stuck.\n• Present the Triad T plan tied to their timeline.\n• Pre-handle the price objection with the Cash Closing frame.\n• Close to the next step (book / payment link).\n\n` +
          `Pulled from: ${grounding}.`,
      };
    case "content":
    default:
      return {
        title: "Content brief (TOF/MOF/BOF)",
        body:
          `Topic: "${query}".\n• Hook: open with a pattern interrupt or myth.\n• Talking points: 3 beats — the misconception, the mechanic, the one action.\n• CTA: comment a keyword to pull the resource into the DMs.\n• Recommended platform: Reels / TikTok for TOF, carousel for MOF.\n\n` +
          `Pulled from: ${grounding}.`,
      };
  }
}
