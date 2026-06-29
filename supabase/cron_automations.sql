-- ============================================================================
-- TRIAD T — Schedule the run-automations Edge Function (pg_cron)
-- ----------------------------------------------------------------------------
-- Fires the backend automation engine every 15 minutes, regardless of where the
-- app is hosted (works for static Pages, Vercel, or Docker — it's all Supabase).
-- Deploy the function first:  supabase functions deploy run-automations --no-verify-jwt
-- Then run this in the SQL editor.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any prior schedule with this name (idempotent).
select cron.unschedule('run-automations') where exists (select 1 from cron.job where jobname = 'run-automations');

select cron.schedule(
  'run-automations',
  '*/15 * * * *',               -- every 15 minutes
  $$
    select net.http_post(
      url     := 'https://ttbcxfgopvvjkqmquqfh.functions.supabase.co/run-automations',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- Inspect:   select * from cron.job;
-- Unschedule: select cron.unschedule('run-automations');
