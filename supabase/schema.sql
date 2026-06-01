-- ============================================================================
-- TRIAD T ENTERPRISE AI COMMAND CENTER — Supabase schema
-- ----------------------------------------------------------------------------
-- Run in the Supabase SQL editor (or `supabase db push`). Enables UUID gen,
-- creates all 14 tables, helpful enums, indexes, an updated_at trigger, and
-- baseline Row Level Security so authenticated staff can operate the platform.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─────────────────────────── Enums ───────────────────────────
do $$ begin
  create type user_role        as enum ('owner','admin','agent','viewer');
  create type client_stage     as enum ('lead','consultation','onboarding','active','funding_ready','graduated','paused');
  create type bureau_t          as enum ('Equifax','Experian','TransUnion');
  create type dispute_status    as enum ('drafted','sent','investigating','deleted','verified','escalated');
  create type negative_type     as enum ('collection','charge_off','late_payment','inquiry','public_record','repossession','bankruptcy','student_loan');
  create type funnel_t          as enum ('TOF','MOF','BOF');
  create type content_format    as enum ('reel','carousel','story','post','long_form');
  create type content_status    as enum ('idea','scripted','designed','scheduled','published');
  create type script_type       as enum ('reel','carousel','sales','caption','vsl');
  create type psychology_type   as enum ('curiosity','fear','desire','authority','social_proof','controversy','transformation','urgency');
  create type credit_type       as enum ('personal','business');
  create type sales_asset_type  as enum ('objection','sms','email','consultation');
  create type analytics_cat     as enum ('content','leads','clients','revenue');
  create type revenue_source    as enum ('credit_repair','funding','education','consultation','affiliate');
  create type task_status       as enum ('todo','in_progress','done');
  create type task_priority     as enum ('low','medium','high','urgent');
  create type automation_trig   as enum ('new_lead','dispute_sent','round_complete','score_increase','payment_received','funding_ready');
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────── Helper: updated_at ───────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─────────────────────────── 1. users ───────────────────────────
-- Mirrors auth.users; profile + role for staff.
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text unique not null,
  full_name   text not null default '',
  role        user_role not null default 'agent',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────── 2. clients ───────────────────────────
create table if not exists public.clients (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  email          text,
  phone          text,
  stage          client_stage not null default 'lead',
  assigned_to    uuid references public.users (id) on delete set null,
  enrolled_at    timestamptz,
  goal           text,
  monthly_value  numeric(10,2) not null default 0,
  starting_score int,
  current_score  int,
  target_score   int,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists clients_stage_idx on public.clients (stage);
create index if not exists clients_assigned_idx on public.clients (assigned_to);

-- ─────────────────────────── 3. bureaus ───────────────────────────
-- Per-client bureau snapshot (score + report metadata per bureau).
create table if not exists public.bureaus (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  bureau        bureau_t not null,
  score         int,
  report_pulled timestamptz,
  notes         text,
  created_at    timestamptz not null default now(),
  unique (client_id, bureau)
);

-- ─────────────────────────── 4. negative_accounts ───────────────────────────
create table if not exists public.negative_accounts (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  creditor    text not null,
  type        negative_type not null,
  bureau      bureau_t not null,
  balance     numeric(12,2) not null default 0,
  date_opened date,
  status      text not null default 'open',
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists negatives_client_idx on public.negative_accounts (client_id);

-- ─────────────────────────── 5. disputes ───────────────────────────
create table if not exists public.disputes (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  negative_id  uuid references public.negative_accounts (id) on delete set null,
  bureau       bureau_t not null,
  round        int not null default 1 check (round between 1 and 10),
  status       dispute_status not null default 'drafted',
  strategy     text,
  reason       text,
  letter_body  text,
  sent_at      timestamptz,
  response_due timestamptz,
  outcome      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists disputes_client_idx on public.disputes (client_id);
create index if not exists disputes_status_idx on public.disputes (status);

-- ─────────────────────────── 6. content_ideas ───────────────────────────
create table if not exists public.content_ideas (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  funnel      funnel_t not null default 'TOF',
  format      content_format not null default 'reel',
  hook        text,
  caption     text,
  cta         text,
  status      content_status not null default 'idea',
  pillar      text,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────── 7. scripts ───────────────────────────
create table if not exists public.scripts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        script_type not null,
  funnel      funnel_t,
  body        text not null,
  word_count  int not null default 0,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────── 8. hooks ───────────────────────────
create table if not exists public.hooks (
  id                uuid primary key default gen_random_uuid(),
  text              text not null,
  category          text not null default 'General',
  psychology        psychology_type not null default 'curiosity',
  funnel            funnel_t not null default 'TOF',
  tags              text[] not null default '{}',
  performance_score int not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists hooks_psychology_idx on public.hooks (psychology);

-- ─────────────────────────── 9. funding_profiles ───────────────────────────
create table if not exists public.funding_profiles (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references public.clients (id) on delete cascade,
  credit_type          credit_type not null default 'personal',
  fico_score           int,
  utilization          numeric(5,2),
  total_revolving      numeric(12,2),
  derogatory_marks     int not null default 0,
  inquiries_6mo        int not null default 0,
  business_age_months  int,
  annual_revenue       numeric(14,2),
  readiness_score      int not null default 0,
  recommended_products text[] not null default '{}',
  created_at           timestamptz not null default now()
);
create index if not exists funding_client_idx on public.funding_profiles (client_id);

-- ─────────────────────────── 10. sales_scripts ───────────────────────────
create table if not exists public.sales_scripts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  type       sales_asset_type not null,
  category   text,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────── 11. analytics ───────────────────────────
create table if not exists public.analytics (
  id           uuid primary key default gen_random_uuid(),
  metric       text not null,
  category     analytics_cat not null,
  value        numeric(14,2) not null default 0,
  recorded_for date not null default current_date,
  created_at   timestamptz not null default now()
);
create index if not exists analytics_cat_idx on public.analytics (category, recorded_for);

-- ─────────────────────────── 12. revenue ───────────────────────────
create table if not exists public.revenue (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients (id) on delete set null,
  source       revenue_source not null,
  amount       numeric(12,2) not null default 0,
  recurring    boolean not null default false,
  recorded_for date not null default current_date,
  created_at   timestamptz not null default now()
);
create index if not exists revenue_recorded_idx on public.revenue (recorded_for);

-- ─────────────────────────── 13. tasks ───────────────────────────
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      task_status not null default 'todo',
  priority    task_priority not null default 'medium',
  assigned_to uuid references public.users (id) on delete set null,
  client_id   uuid references public.clients (id) on delete cascade,
  due_date    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists tasks_status_idx on public.tasks (status);

-- ─────────────────────────── 14. automations ───────────────────────────
create table if not exists public.automations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  trigger    automation_trig not null,
  action     text not null,
  enabled    boolean not null default true,
  runs       int not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────────── updated_at triggers ───────────────────────────
do $$
declare t text;
begin
  foreach t in array array['users','clients','disputes','tasks'] loop
    execute format(
      'drop trigger if exists set_%1$s_updated_at on public.%1$s;
       create trigger set_%1$s_updated_at before update on public.%1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ─────────────────────────── New-user profile sync ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- Baseline: any authenticated staff member may read/write operational data.
-- Tighten per-role (e.g. agents only see assigned clients) in production.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'users','clients','bureaus','negative_accounts','disputes','content_ideas',
    'scripts','hooks','funding_profiles','sales_scripts','analytics','revenue',
    'tasks','automations'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'drop policy if exists "staff_all_%1$s" on public.%1$s;
       create policy "staff_all_%1$s" on public.%1$s
         for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
