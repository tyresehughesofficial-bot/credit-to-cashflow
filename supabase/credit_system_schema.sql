-- ============================================================================
-- TRIAD T — CREDIT SYSTEM / Client Command Center data model
-- ----------------------------------------------------------------------------
-- Client onboarding from MyFreeScoreNow → reports → negatives/inquiries →
-- AI diagnosis → dispute rounds. (Bureau Intelligence is internal knowledge,
-- NOT client data — it lives in the app, not here.)
-- ============================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type client_status   as enum ('lead','imported','analyzing','active','disputing','funding_ready','graduated','paused');
  create type bureau_name      as enum ('Experian','Equifax','TransUnion');
  create type health_band      as enum ('Excellent','Good','Fair','Poor','Critical');
  create type round_status      as enum ('drafted','sent','investigating','completed','escalated');
exception when duplicate_object then null;
end $$;

create table if not exists clients (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  first_name      text,
  last_name       text,
  email           text,
  phone           text,
  status          client_status default 'imported',
  round           int default 0,
  myfreescorenow_id text
);

create table if not exists credit_reports (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid references clients(id) on delete cascade,
  report_date          date default now(),
  experian_score       int,
  equifax_score        int,
  transunion_score     int,
  overall_health_score int,
  created_at           timestamptz default now()
);

create table if not exists negative_accounts (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete cascade,
  bureau       text,                 -- Experian | Equifax | TransUnion (or "All")
  account_type text,                 -- collection | charge_off | repossession | late_payment | public_record | medical
  creditor     text,
  balance      numeric default 0,
  status       text,
  remarks      text,
  created_at   timestamptz default now()
);

create table if not exists inquiries (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete cascade,
  bureau       text,
  inquiry_date date,
  creditor     text,
  created_at   timestamptz default now()
);

create table if not exists dispute_rounds (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients(id) on delete cascade,
  round_number  int,
  bureau        text,
  date_sent     date,
  status        round_status default 'drafted',
  result        text,
  created_at    timestamptz default now()
);

create table if not exists ai_diagnosis (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references clients(id) on delete cascade,
  diagnosis       text,
  recommendations text,
  priority_level  text,               -- Low | Medium | High | Critical
  health_band     health_band,
  created_at      timestamptz default now()
);

create index if not exists idx_reports_client   on credit_reports (client_id);
create index if not exists idx_negatives_client on negative_accounts (client_id);
create index if not exists idx_inquiries_client on inquiries (client_id);
create index if not exists idx_rounds_client    on dispute_rounds (client_id);
create index if not exists idx_diagnosis_client on ai_diagnosis (client_id);

-- RLS (staff-operated; tighten to org membership later)
do $$
declare t text;
begin
  foreach t in array array['clients','credit_reports','negative_accounts','inquiries','dispute_rounds','ai_diagnosis'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists staff_all on %I; create policy staff_all on %I for all using (true) with check (true);', t, t);
  end loop;
end $$;
