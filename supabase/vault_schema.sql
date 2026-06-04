-- ============================================================================
-- TRIAD T ENTERPRISE — Knowledge Vault (Retrieval-Augmented) schema
-- ----------------------------------------------------------------------------
-- Turns the documents in the "AI command center triad t enterprise" Drive
-- folder into a searchable, agent-owned vector store.
-- Pipeline: read → extract → chunk → embed → store → categorize → assign agent.
-- Requires the pgvector extension (available on Supabase).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists vector;

do $$ begin
  create type agent_id as enum ('dispute','funding','sales','content');
  create type doc_status as enum ('queued','processing','embedded','error');
exception when duplicate_object then null;
end $$;

-- ───────────────────────── AI Agents ─────────────────────────
create table if not exists agents (
  id          agent_id primary key,
  name        text not null,
  tagline     text,
  functions   text[],            -- what the agent does
  keywords    text[],            -- routing keywords
  created_at  timestamptz default now()
);

insert into agents (id, name, tagline, functions, keywords) values
  ('dispute','TRIAD DISPUTE AGENT™','FCRA-grounded credit repair',
     array['Dispute letters','Collection analysis','Charge-off analysis','Inquiry removal strategy','Late payment strategy','CFPB escalation','FCRA-based workflows'],
     array['dispute','letter','collection','charge-off','chargeoff','inquiry','inquiries','late','fcra','bureau','metro 2','cfpb','removal','deletion','validation','credit report']),
  ('funding','TRIAD FUNDING AGENT™','Capital readiness & lender matching',
     array['Funding roadmap','Lender matching','Funding readiness analysis','Business credit building','Funding sequencing','Approval optimization'],
     array['funding','fund','lender','loan','capital','approval','underwriting','business credit','0%','bank','money','tradeline','net-30','sba','fundable']),
  ('sales','TRIAD SALES AGENT™','DM-to-close conversion engine',
     array['DM responses','Sales scripts','Consultation scripts','Objection handling','Lead qualification','Follow-up systems','CRM workflows'],
     array['dm','script','consultation','close','closing','call','book','objection','lead','follow-up','followup','crm','sales','qualify','pitch','offer']),
  ('content','TRIAD CONTENT AGENT™','Authority & lead-gen content',
     array['Reels','Carousels','Hooks','Captions','CTAs','Educational content','Authority content','Lead generation content'],
     array['reel','carousel','hook','caption','cta','content','post','video','story','educational','authority','viral','idea','script-video'])
on conflict (id) do nothing;

-- ───────────────────────── Knowledge documents ─────────────────────────
create table if not exists knowledge_documents (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text,
  file_type     text,                          -- doc | pdf | sheet | asset
  drive_id      text,                           -- source file in the Drive folder
  view_url      text,
  summary       text,                           -- extracted / authored synopsis
  keywords      text[],
  status        doc_status default 'queued',
  chunk_count   int default 0,                  -- vectors created for this doc
  uploaded_at   timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Many-to-many: a document can be owned by multiple agents (e.g. the Vocabulary
-- Workbook serves both Dispute and Content).
create table if not exists document_agents (
  document_id uuid references knowledge_documents(id) on delete cascade,
  agent_id    agent_id references agents(id) on delete cascade,
  primary key (document_id, agent_id)
);

-- ───────────────────────── Vector chunks ─────────────────────────
create table if not exists knowledge_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references knowledge_documents(id) on delete cascade,
  agent_id     agent_id,
  chunk_index  int,
  content      text not null,
  embedding    vector(1536),                    -- OpenAI text-embedding-3-small dims
  created_at   timestamptz default now()
);

create index if not exists idx_chunks_doc on knowledge_chunks (document_id);
-- Approximate nearest-neighbour index for fast semantic search.
create index if not exists idx_chunks_embedding
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ───────────────────────── Retrieval RPC ─────────────────────────
-- Returns the most similar chunks, optionally scoped to one agent (intelligent
-- routing picks the agent, then this fetches that agent's context).
create or replace function match_knowledge(
  query_embedding vector(1536),
  match_count int default 6,
  filter_agent agent_id default null
)
returns table (
  id uuid,
  document_id uuid,
  agent_id agent_id,
  content text,
  similarity float
)
language sql stable as $$
  select c.id, c.document_id, c.agent_id, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from knowledge_chunks c
  where filter_agent is null or c.agent_id = filter_agent
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ───────────────────────── updated_at + RLS ─────────────────────────
drop trigger if exists set_updated_at on knowledge_documents;
create trigger set_updated_at before update on knowledge_documents
  for each row execute function set_updated_at();

do $$
declare t text;
begin
  foreach t in array array['agents','knowledge_documents','document_agents','knowledge_chunks'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists staff_all on %I; create policy staff_all on %I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;
