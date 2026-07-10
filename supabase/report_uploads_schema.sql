-- ============================================================================
-- TRIAD T — Manual credit-report uploads (report_uploads, tradelines, jobs)
-- ----------------------------------------------------------------------------
-- Run AFTER credit_system_schema.sql + mfsn_integration_schema.sql.
-- Reuses existing clients/credit_reports/negative_accounts/etc — no duplicates.
-- Never stores full SSNs or full account numbers (account_number_masked only).
-- ============================================================================

create extension if not exists "pgcrypto";

-- Manual-entry extras on clients (safe to re-run).
alter table clients add column if not exists address     text;
alter table clients add column if not exists city        text;
alter table clients add column if not exists state       text;
alter table clients add column if not exists zip         text;
alter table clients add column if not exists dob         text;
alter table clients add column if not exists notes       text;
alter table clients add column if not exists program     text;
alter table clients add column if not exists start_date  date;
alter table clients add column if not exists assigned_to text;

create table if not exists report_uploads (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid references clients(id) on delete cascade,
  source            text,                       -- manual | myfreescorenow | disputefox
  original_filename text,
  file_type         text,                       -- pdf | csv | json | txt | png | jpg
  storage_path      text,                       -- path in the private credit-reports bucket
  uploaded_at       timestamptz default now(),
  processing_status text default 'uploaded',    -- uploaded | processing | extracted | saved | error
  processing_error  text,
  raw_text          text,
  metadata          jsonb
);

create table if not exists tradelines (
  id                     uuid primary key default gen_random_uuid(),
  client_id              uuid references clients(id) on delete cascade,
  credit_report_id       uuid references credit_reports(id) on delete set null,
  creditor               text,
  account_type           text,
  account_number_masked  text,                  -- masked only, e.g. ****1234
  balance                numeric,
  credit_limit           numeric,
  payment_status         text,
  date_opened            date,
  last_reported          date,
  bureau                 text,
  is_negative            boolean default false,
  created_at             timestamptz default now()
);

create table if not exists report_processing_jobs (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid references clients(id) on delete cascade,
  report_upload_id  uuid references report_uploads(id) on delete cascade,
  status            text default 'queued',      -- queued | processing | done | error
  started_at        timestamptz,
  completed_at      timestamptz,
  error             text,
  parser_version    text
);

create index if not exists idx_report_uploads_client on report_uploads (client_id);
create index if not exists idx_tradelines_client     on tradelines (client_id);
create index if not exists idx_jobs_upload           on report_processing_jobs (report_upload_id);

do $$
declare t text;
begin
  foreach t in array array['report_uploads','tradelines','report_processing_jobs'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists staff_all on %I; create policy staff_all on %I for all using (true) with check (true);', t, t);
  end loop;
end $$;
