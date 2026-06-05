-- ============================================================================
-- TRIAD T ENTERPRISE — Thumbnail Studio (prompt history only)
-- ----------------------------------------------------------------------------
-- Stores generated thumbnail prompts so they can be saved, loaded, edited and
-- reused. No image storage / asset management yet — prompts + external tool
-- launching only. (Direct generation via OPENAI/FIREFLY keys is a later phase.)
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists thumbnail_requests (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid,
  topic                     text not null,
  platform                  text,
  content_category          text,
  emotion                   text,
  brand_style               text,
  generated_chatgpt_prompt  text,
  generated_firefly_prompt  text,
  generated_canva_prompt    text,
  created_at                timestamptz default now()
);

create index if not exists idx_thumbnail_requests_created on thumbnail_requests (created_at desc);

alter table thumbnail_requests enable row level security;
drop policy if exists staff_all on thumbnail_requests;
create policy staff_all on thumbnail_requests for all to authenticated using (true) with check (true);
