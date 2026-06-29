-- ============================================================================
-- TRIAD T — AUTH & ROLES (Supabase Auth + profiles)
-- ----------------------------------------------------------------------------
-- Works with the static frontend: Supabase Auth (email/password) + a profiles
-- table holding the role. The FIRST user to sign up becomes Administrator; all
-- later signups default to Guest until an admin promotes them.
-- ============================================================================

do $$ begin
  create type app_role as enum
    ('Administrator','Manager','Sales','Credit Specialist','Editor','Operations','Guest');
exception when duplicate_object then null;
end $$;

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        app_role default 'Guest',
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

-- Everyone signed in can read profiles (team directory); users update their own;
-- admins manage all. (Kept simple; tighten later.)
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select using (true);

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_admin_all on profiles;
create policy profiles_admin_all on profiles for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Administrator'))
  with check (true);

-- Auto-create a profile on signup; first user becomes Administrator.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  select count(*) = 0 into first_user from profiles;
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when first_user then 'Administrator'::app_role else 'Guest'::app_role end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
