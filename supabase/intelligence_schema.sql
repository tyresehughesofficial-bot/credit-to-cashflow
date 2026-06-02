-- ============================================================================
-- TRIAD T ENTERPRISE — Intelligence Engine schema
-- ----------------------------------------------------------------------------
-- Run AFTER schema.sql. Creates the 13 Intelligence Engine tables that back
-- the Idea Intelligence Engine, opportunity scoring and the content pipeline.
-- Mirrors the conventions in schema.sql (pgcrypto, set_updated_at, RLS).
-- ============================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type intel_source   as enum
    ('competitor','outlier','demand','hook','voice','myth','bureau','cfpb','funding','objection','client');
  create type opp_status      as enum ('new','approved','rejected','archived','saved');
  create type pipeline_stage  as enum ('Backlog','Scripting','Scheduled','Published');
exception when duplicate_object then null;
end $$;

-- ───────────────────────── #1 Competitor Intelligence ─────────────────────────
create table if not exists competitors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  handle        text,
  platform      text,                       -- YouTube | TikTok | Instagram | X
  niche         text,
  followers     bigint default 0,
  avg_views     bigint default 0,
  growth        numeric default 0,          -- 30-day %
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists competitor_posts (
  id            uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors(id) on delete set null,
  creator       text,
  handle        text,
  platform      text,
  title         text not null,
  hook          text,
  cta           text,
  views         bigint default 0,
  likes         bigint default 0,
  comments      bigint default 0,
  shares        bigint default 0,
  saves         bigint default 0,
  posted_at     date,
  category      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ───────────────────────── #2 Viral Outlier Detection ─────────────────────────
create table if not exists viral_outliers (
  id              uuid primary key default gen_random_uuid(),
  creator         text,
  platform        text,
  title           text not null,
  hook            text,
  topic           text,
  angle           text,
  cta             text,
  format          text,
  views           bigint default 0,
  avg_views       bigint default 0,
  multiple        numeric default 0,        -- views / avg_views (kept in sync by the app)
  thumbnail       text,
  timing          text,
  why_it_worked   text,
  replication     text[],                   -- bullet suggestions
  opportunity_score int default 0,
  category        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ───────────────────────── #3 Audience Demand Mining ─────────────────────────
create table if not exists audience_comments (
  id            uuid primary key default gen_random_uuid(),
  body          text not null,
  author        text,
  source_label  text,                       -- where it was mined from
  platform      text,
  sentiment     int default 0,              -- -100..100
  processed     boolean default false,      -- has it been extracted?
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists extracted_questions (
  id            uuid primary key default gen_random_uuid(),
  comment_id    uuid references audience_comments(id) on delete set null,
  text          text not null,
  type          text,                       -- Question | Confusion | Misconception | Request | Pain Point
  source_label  text,
  mentions      int default 1,
  sentiment     int default 0,
  category      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists extracted_objections (
  id            uuid primary key default gen_random_uuid(),
  comment_id    uuid references audience_comments(id) on delete set null,
  text          text not null,
  type          text,                       -- Trust | Price | Timing | Skepticism
  channel       text,                       -- Sales Call | DM | Consultation | Email | Lead Form
  frequency     int default 1,
  category      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ───────────────────────── #4 Hook Intelligence ─────────────────────────
create table if not exists hooks (
  id              uuid primary key default gen_random_uuid(),
  hook            text not null,
  type            text,                     -- Curiosity | Fear | Authority | Myth | Contrarian | Proof | Story | Urgency
  creator         text,
  platform        text,
  posted_on       date,
  views           bigint default 0,
  engagement_rate numeric default 0,
  category        text,
  favorite        boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ───────────────────────── #6 Credit Myth Intelligence ─────────────────────────
create table if not exists credit_myths (
  id            uuid primary key default gen_random_uuid(),
  claim         text not null,
  truth         text,
  prevalence    int default 0,              -- 0..100
  platforms     text[],
  category      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ───────────────────────── #11 Client Intelligence ─────────────────────────
create table if not exists client_patterns (
  id            uuid primary key default gen_random_uuid(),
  metric        text not null,              -- Inquiry/Collection/Charge-off Removals | Score Increase | Funding Approval
  stat          text,
  detail        text,
  category      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ───────────────────────── Analytics (editable KPIs) ─────────────────────────
create table if not exists analytics_metrics (
  id          text primary key,           -- stable key (e.g. 'reach')
  label       text not null,
  value       text,
  delta       text,
  period      text,
  "group"     text,                        -- content | leads | clients | revenue
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ───────────────────────── Opportunity Scoring Engine ─────────────────────────
create table if not exists content_opportunities (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  source        intel_source not null default 'demand',
  category      text,
  funnel        funnel_t default 'TOF',
  format        text,
  platform      text,
  hook          text,
  cta           text,
  rationale     text,
  evidence      text,
  status        opp_status default 'new',
  -- denormalized scores (also normalized in opportunity_scores) so the app can
  -- read/write a single row; total mirrors the scoring engine weights.
  demand        int default 0,
  virality      int default 0,
  competition   int default 0,
  conversion    int default 0,
  authority     int default 0,
  total         numeric default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- One scorecard per opportunity (1:1). Total is computed in SQL too, mirroring
-- the app's scoring engine: demand .30 + virality .25 + conversion .20 +
-- authority .10 + (100 - competition) .15.
create table if not exists opportunity_scores (
  id              uuid primary key default gen_random_uuid(),
  opportunity_id  uuid not null references content_opportunities(id) on delete cascade,
  demand          int default 0,
  virality        int default 0,
  competition     int default 0,
  conversion      int default 0,
  authority       int default 0,
  total           numeric generated always as (
                    round(demand*0.30 + virality*0.25 + conversion*0.20
                          + authority*0.10 + (100 - competition)*0.15)
                  ) stored,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (opportunity_id)
);

-- ───────────────────────── Approval Workflow → AI output ─────────────────────────
create table if not exists approved_ideas (
  id              uuid primary key default gen_random_uuid(),
  opportunity_id  uuid references content_opportunities(id) on delete set null,
  title           text not null,
  category        text,
  total_score     numeric default 0,
  -- generated package
  tof             text,
  mof             text,
  bof             text,
  hook            text,
  caption         text,
  cta             text,
  format          text,
  platform        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists rejected_ideas (
  id              uuid primary key default gen_random_uuid(),
  opportunity_id  uuid references content_opportunities(id) on delete set null,
  title           text not null,
  reason          text,
  created_at      timestamptz default now()
);

create table if not exists content_pipeline (
  id              uuid primary key default gen_random_uuid(),
  idea_id         uuid references approved_ideas(id) on delete set null,
  opportunity_id  uuid references content_opportunities(id) on delete set null,
  title           text not null,
  stage           pipeline_stage default 'Backlog',
  scheduled_for   date,
  platform        text,
  funnel          funnel_t,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ───────────────────────── updated_at triggers ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'competitors','competitor_posts','viral_outliers','audience_comments',
    'extracted_questions','extracted_objections','hooks','credit_myths',
    'content_opportunities','opportunity_scores','approved_ideas','content_pipeline','client_patterns','analytics_metrics'
  ] loop
    execute format(
      'drop trigger if exists set_updated_at on %I; create trigger set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t);
  end loop;
end $$;

-- ───────────────────────── Indexes ─────────────────────────
create index if not exists idx_comp_posts_views   on competitor_posts (views desc);
create index if not exists idx_outliers_multiple   on viral_outliers (multiple desc);
create index if not exists idx_questions_mentions  on extracted_questions (mentions desc);
create index if not exists idx_objections_freq     on extracted_objections (frequency desc);
create index if not exists idx_hooks_views         on hooks (views desc);
create index if not exists idx_myths_prevalence    on credit_myths (prevalence desc);
create index if not exists idx_opps_status         on content_opportunities (status);
create index if not exists idx_scores_total        on opportunity_scores (total desc);
create index if not exists idx_pipeline_stage      on content_pipeline (stage);

-- ───────────────────────── Row Level Security ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'competitors','competitor_posts','viral_outliers','audience_comments',
    'extracted_questions','extracted_objections','hooks','credit_myths',
    'content_opportunities','opportunity_scores','approved_ideas',
    'rejected_ideas','content_pipeline','client_patterns','analytics_metrics'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'drop policy if exists staff_all on %I; create policy staff_all on %I for all to authenticated using (true) with check (true);',
      t, t);
  end loop;
end $$;

-- A convenience view: opportunities ranked by total score (highest first).
create or replace view ranked_opportunities as
  select o.*, s.demand, s.virality, s.competition, s.conversion, s.authority, s.total
  from content_opportunities o
  left join opportunity_scores s on s.opportunity_id = o.id
  order by s.total desc nulls last;
