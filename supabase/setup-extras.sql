-- Contemplation — setup extras. Run AFTER schema.sql in the Supabase SQL editor.

-- 1. Profile extras: settings + onboarding checkpoint + email mirror,
--    and the daily-drop timestamp on progress.
alter table profiles add column if not exists email text;
alter table profiles add column if not exists settings jsonb not null default '{}'::jsonb;
alter table profiles add column if not exists onboarding_step text not null default 'disclaimer';
alter table user_progress add column if not exists last_completed_at timestamptz;

-- 2. Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email) values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. PROTOTYPE ONLY: allow the client to insert mock grants (paywall simulation).
--    REMOVE this policy in Phase C — production grants are written exclusively
--    by the RevenueCat webhook Edge Function (service role bypasses RLS).
create policy "own grants insert (PROTOTYPE ONLY)" on access_grants
  for insert to authenticated with check (user_id = auth.uid());

-- 4. Private storage bucket for voice memos.
insert into storage.buckets (id, name, public) values ('memos', 'memos', false)
on conflict (id) do nothing;

create policy "own memos read" on storage.objects
  for select to authenticated
  using (bucket_id = 'memos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own memos write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'memos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own memos delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'memos' and (storage.foldername(name))[1] = auth.uid()::text);
