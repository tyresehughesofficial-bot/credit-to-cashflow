-- ============================================================================
-- TRIAD T ENTERPRISE — Creative Asset Generation Engine
-- ----------------------------------------------------------------------------
-- Projects → generations → assets, plus the storage bucket for rendered files.
-- Generation runs against OpenAI / Adobe Firefly (server-side keys); assets are
-- uploaded to the `creative-assets` bucket and recorded here.
-- ============================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type creative_status as enum ('draft','generating','completed','failed');
exception when duplicate_object then null;
end $$;

create table if not exists creative_projects (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid,
  project_name        text not null,
  asset_type          text,
  topic               text,
  industry            text,
  offer               text,
  platform            text,
  brand_style         text,
  generation_provider text,                    -- OpenAI | Adobe Firefly | Canva
  status              creative_status default 'draft',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists creative_generations (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references creative_projects(id) on delete cascade,
  prompt          text,
  provider        text,
  generation_type text,                         -- image | motion | brief
  asset_type      text,
  status          creative_status default 'completed',
  created_at      timestamptz default now()
);

create table if not exists creative_assets (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references creative_projects(id) on delete cascade,
  generation_id   uuid references creative_generations(id) on delete set null,
  provider        text,
  asset_url       text,
  thumbnail_url   text,
  file_size       bigint,
  width           int,
  height          int,
  created_at      timestamptz default now()
);

create index if not exists idx_creative_assets_project on creative_assets (project_id);
create index if not exists idx_creative_gen_project    on creative_generations (project_id);

-- updated_at on projects
drop trigger if exists set_updated_at on creative_projects;
create trigger set_updated_at before update on creative_projects
  for each row execute function set_updated_at();

-- RLS
do $$
declare t text;
begin
  foreach t in array array['creative_projects','creative_generations','creative_assets'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists staff_all on %I; create policy staff_all on %I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- ───────────────────────── Storage bucket ─────────────────────────
-- Public bucket for rendered images (png/jpg/webp/svg). A future `motion-assets`
-- bucket will hold mp4/mov/webm.
insert into storage.buckets (id, name, public)
  values ('creative-assets','creative-assets', true)
  on conflict (id) do nothing;

drop policy if exists "creative read" on storage.objects;
create policy "creative read" on storage.objects
  for select using (bucket_id = 'creative-assets');

drop policy if exists "creative write" on storage.objects;
create policy "creative write" on storage.objects
  for insert to authenticated with check (bucket_id = 'creative-assets');

drop policy if exists "creative update" on storage.objects;
create policy "creative update" on storage.objects
  for update to authenticated using (bucket_id = 'creative-assets');

drop policy if exists "creative delete" on storage.objects;
create policy "creative delete" on storage.objects
  for delete to authenticated using (bucket_id = 'creative-assets');
