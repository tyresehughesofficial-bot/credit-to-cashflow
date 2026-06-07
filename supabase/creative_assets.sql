-- ============================================================================
-- TRIAD T — Motion Graphics Studio: creative_assets + storage bucket
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL editor. It (re)creates the creative_assets table
-- exactly as the Edge Function expects, and ensures the `creative-assets`
-- storage bucket exists. Supersedes the creative_assets table in
-- creative_schema.sql.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Table ──
drop table if exists creative_assets cascade;
create table creative_assets (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  title         text,
  prompt        text,
  provider      text,
  asset_type    text,
  image_url     text,
  storage_path  text,
  tags          text[] default '{}',
  favorite      boolean default false
);

create index if not exists idx_creative_assets_created on creative_assets (created_at desc);

alter table creative_assets enable row level security;

-- Demo policies (no auth yet): readable + writable by anon/authenticated.
-- Tighten to `to authenticated` once login is added.
drop policy if exists creative_assets_all on creative_assets;
create policy creative_assets_all on creative_assets
  for all using (true) with check (true);

-- ── Storage bucket (public) ──
insert into storage.buckets (id, name, public)
  values ('creative-assets', 'creative-assets', true)
  on conflict (id) do nothing;

drop policy if exists "creative-assets read" on storage.objects;
create policy "creative-assets read" on storage.objects
  for select using (bucket_id = 'creative-assets');

-- (Writes happen from the Edge Function via the service role, which bypasses RLS.)
