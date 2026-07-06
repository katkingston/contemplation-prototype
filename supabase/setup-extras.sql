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

-- 4. Server-side validation: mirror the UI limits at the database layer so a
--    tampered client can't write oversized or nonsensical rows. Limits live in
--    src/theme/tokens.ts (limits.diaryMaxWords=150, limits.voiceMaxSeconds=60);
--    keep these in sync if those change. Word count approximated generously as
--    whitespace-separated tokens with headroom (150 words + margin).
alter table diary_entries drop constraint if exists diary_text_word_cap;
alter table diary_entries add constraint diary_text_word_cap
  check (text is null or (
    char_length(text) <= 2000  -- hard byte-ish bound: word counts alone don't limit size
    and array_length(regexp_split_to_array(trim(text), '\s+'), 1) <= 160
  ));
alter table diary_entries drop constraint if exists diary_audio_duration_cap;
alter table diary_entries add constraint diary_audio_duration_cap
  check (audio_duration_sec is null or audio_duration_sec between 0 and 65);
alter table diary_entries drop constraint if exists diary_audio_path_own_folder;
alter table diary_entries add constraint diary_audio_path_own_folder
  check (audio_path is null or audio_path like (user_id::text || '/%'));
alter table contemplation_sessions drop constraint if exists session_seconds_sane;
alter table contemplation_sessions add constraint session_seconds_sane
  check (seconds between 0 and 7200);
alter table user_progress drop constraint if exists progress_index_sane;
alter table user_progress add constraint progress_index_sane
  check (current_index between 0 and 500 and replay_count between 0 and 10000);
-- JSONB payloads: bound size so a tampered client can't store megabyte blobs.
alter table intake_answers drop constraint if exists intake_answers_size_cap;
alter table intake_answers add constraint intake_answers_size_cap
  check (pg_column_size(answers) <= 16384);
alter table survey_answers drop constraint if exists survey_answers_size_cap;
alter table survey_answers add constraint survey_answers_size_cap
  check (pg_column_size(answers) <= 16384);
alter table profiles drop constraint if exists profiles_settings_size_cap;
alter table profiles add constraint profiles_settings_size_cap
  check (pg_column_size(settings) <= 16384);
alter table diary_entries drop constraint if exists diary_prompt_size_cap;
alter table diary_entries add constraint diary_prompt_size_cap
  check (char_length(prompt) <= 1000);

-- 5. Private storage bucket for voice memos. Server-side size + MIME caps so
--    a tampered client can't use the bucket as arbitrary file storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memos', 'memos', false, 8388608,
        array['audio/m4a','audio/x-m4a','audio/mp4','audio/webm'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "own memos read" on storage.objects
  for select to authenticated
  using (bucket_id = 'memos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own memos write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'memos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own memos delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'memos' and (storage.foldername(name))[1] = auth.uid()::text);
