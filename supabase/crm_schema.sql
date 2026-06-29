-- ============================================================================
-- TRIAD T — CRM (app replaces GoHighLevel)
-- ----------------------------------------------------------------------------
-- Contacts on a 10-stage pipeline + activity log + bookings. Run anytime.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists crm_contacts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text,
  email       text,
  phone       text,
  source      text,
  stage       text default 'New Lead',
  owner       text,
  offer       text,
  value       numeric default 0,
  tags        text[] default '{}',
  note        text
);

create table if not exists crm_activities (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  contact     text,
  type        text,
  summary     text,
  date        text
);

create table if not exists crm_bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  contact     text,
  type        text,
  summary     text,
  date        text
);

create table if not exists crm_deals (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text,
  contact     text,
  offer       text,
  amount      numeric default 0,
  status      text default 'open'           -- open | won | lost
);

create table if not exists crm_payments (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  contact     text,
  amount      numeric default 0,
  method      text,                          -- card | ach | cash | link
  status      text default 'pending',        -- pending | paid | refunded
  link        text,
  date        text
);

create index if not exists idx_crm_contacts_stage on crm_contacts (stage);

do $$
declare t text;
begin
  foreach t in array array['crm_contacts','crm_activities','crm_bookings','crm_deals','crm_payments'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists staff_all on %I; create policy staff_all on %I for all using (true) with check (true);', t, t);
  end loop;
end $$;
