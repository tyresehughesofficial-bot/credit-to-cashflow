-- ============================================================================
-- TRIAD T — Private storage bucket for uploaded credit reports
-- ----------------------------------------------------------------------------
-- PRIVATE (public=false). Files are never publicly accessible; access is via
-- the app's key + signed URLs only. Staff-operated policy (tighten to org
-- membership later). Run in the SQL editor, or create the bucket in the
-- Storage UI (name: credit-reports, Public: OFF) and run only the policies.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('credit-reports', 'credit-reports', false)
on conflict (id) do nothing;

-- Allow the app (anon/publishable + authenticated) to read/write ONLY this bucket.
drop policy if exists "credit-reports read" on storage.objects;
create policy "credit-reports read" on storage.objects
  for select using (bucket_id = 'credit-reports');

drop policy if exists "credit-reports write" on storage.objects;
create policy "credit-reports write" on storage.objects
  for insert with check (bucket_id = 'credit-reports');

drop policy if exists "credit-reports update" on storage.objects;
create policy "credit-reports update" on storage.objects
  for update using (bucket_id = 'credit-reports');

drop policy if exists "credit-reports delete" on storage.objects;
create policy "credit-reports delete" on storage.objects
  for delete using (bucket_id = 'credit-reports');
