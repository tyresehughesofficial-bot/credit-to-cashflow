-- ============================================================================
-- TRIAD T — THE PROLIFIC METHOD — client-journey state
-- ----------------------------------------------------------------------------
-- One journey per client: diagnostic intake answers, current phase placement,
-- operator override, and completed plan steps. Run after credit_system_schema.
-- ============================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type prolific_phase as enum
    ('diagnose','repair','rebuild','structure','position','fund','grow');
exception when duplicate_object then null;
end $$;

create table if not exists prolific_journeys (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references clients(id) on delete cascade,
  intake          jsonb default '{}'::jsonb,   -- { question_key: answer }
  phase           prolific_phase default 'diagnose',
  manual_phase    text,                          -- operator override ('' = auto)
  completed_steps text[] default '{}',
  updated_at      timestamptz default now(),
  unique (client_id)
);

create index if not exists idx_prolific_client on prolific_journeys (client_id);

alter table prolific_journeys enable row level security;
drop policy if exists staff_all on prolific_journeys;
create policy staff_all on prolific_journeys for all using (true) with check (true);
