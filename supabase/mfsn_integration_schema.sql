-- ============================================================================
-- TRIAD T — MYFREESCORENOW INTEGRATION — additional normalization tables
-- ----------------------------------------------------------------------------
-- Run AFTER credit_system_schema.sql. Adds multi-source support + the data
-- categories MyFreeScoreNow returns that the 6 core tables don't cover
-- (utilization, public records, personal information) plus an import audit log.
-- Safe to re-run (idempotent).
-- ============================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type client_source as enum ('myfreescorenow','disputefox','manual');
  create type import_status as enum ('success','partial','error');
exception when duplicate_object then null;
end $$;

-- Extend clients with source/enrollment metadata (multi-source aware).
alter table clients add column if not exists source            client_source default 'manual';
alter table clients add column if not exists external_id        text;          -- id in the source system
alter table clients add column if not exists enrollment_status  text;          -- as reported by the source
alter table clients add column if not exists date_added         date default now();

-- One client can be present in multiple source systems.
create table if not exists client_sources (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete cascade,
  source       client_source not null,
  external_id  text,                          -- member/client id in that source
  status       text,
  created_at   timestamptz default now(),
  unique (client_id, source)
);

-- Aggregate utilization snapshot (tied to a report when available).
create table if not exists credit_utilization (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid references clients(id) on delete cascade,
  report_id        uuid references credit_reports(id) on delete set null,
  total_limit      numeric default 0,
  total_balance    numeric default 0,
  utilization_pct  numeric default 0,
  per_account      jsonb,                      -- optional per-tradeline utilization
  created_at       timestamptz default now()
);

create table if not exists public_records (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete cascade,
  bureau       text,
  record_type  text,                           -- bankruptcy | judgment | lien
  status       text,
  amount       numeric default 0,
  filed_date   date,
  reference    text,                           -- case/reference number
  remarks      text,
  created_at   timestamptz default now()
);

create table if not exists personal_information (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete cascade,
  info_type    text,                           -- name | address | employer | phone
  value        text,
  bureau       text,
  status       text default 'current',         -- current | old | unauthorized
  created_at   timestamptz default now()
);

-- Audit trail for every import attempt (live or demo).
create table if not exists import_logs (
  id           uuid primary key default gen_random_uuid(),
  source       client_source not null,
  member_id    text,
  client_id    uuid references clients(id) on delete set null,
  status       import_status not null,
  mode         text,                            -- live | demo
  counts       jsonb,                           -- {negatives, inquiries, ...}
  message      text,
  error        text,
  created_at   timestamptz default now()
);

create index if not exists idx_client_sources_client on client_sources (client_id);
create index if not exists idx_utilization_client     on credit_utilization (client_id);
create index if not exists idx_public_records_client  on public_records (client_id);
create index if not exists idx_personal_info_client   on personal_information (client_id);
create index if not exists idx_import_logs_client     on import_logs (client_id);

-- RLS (staff-operated; tighten to org membership later).
do $$
declare t text;
begin
  foreach t in array array['client_sources','credit_utilization','public_records','personal_information','import_logs'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists staff_all on %I; create policy staff_all on %I for all using (true) with check (true);', t, t);
  end loop;
end $$;
