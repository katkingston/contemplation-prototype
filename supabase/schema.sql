-- Contemplation V1 — Supabase schema (per App-CLAUDE.md data-model intent).
-- Run in the Supabase SQL editor when wiring the real backend.
-- Series length is COUNT of its contemplations — never assume a fixed length.

-- ---------- content ----------
create table if not exists series (
  id text primary key,
  theme text not null,
  title text not null,
  display_order int not null,
  intro_copy jsonb not null default '[]',          -- intro slides
  wrap_copy jsonb not null default '[]',           -- wrap-up slides
  alt_questions jsonb not null default '[]',
  is_published boolean not null default false
);

create table if not exists contemplations (
  id text primary key,
  series_id text not null references series(id) on delete cascade,
  sequence_index int not null,
  prompt text not null,
  media_ref text,                                   -- storage path or URL for video/artwork
  unique (series_id, sequence_index)
);

-- ---------- per-user ----------
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  disclaimer_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id text not null references series(id),
  current_index int not null default 0,
  completed_at timestamptz,
  last_opened date,
  replay_count int not null default 0,
  use_alt_questions boolean not null default false,
  primary key (user_id, series_id)
);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contemplation_id text not null references contemplations(id),
  prompt text not null,
  text text,
  audio_path text,                                  -- Supabase Storage path
  audio_duration_sec int,
  created_at timestamptz not null default now(),
  -- Saved immediately, hidden until series completion. Hiding is a FILTER on
  -- this flag (set true by series completion), never a withheld write.
  is_revealed boolean not null default false
);

create table if not exists contemplation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id text not null references series(id),
  contemplation_id text not null references contemplations(id),
  seconds int not null,
  session_date date not null default current_date
);

create table if not exists intake_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists survey_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id text not null references series(id),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

-- Source of truth for series-pack/monthly access. Written ONLY by the
-- RevenueCat NON_RENEWING_PURCHASE webhook Edge Function (service role).
-- Annual access = RevenueCat entitlement, checked client-side via the SDK.
create table if not exists access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_type text not null check (product_type in ('series_pack','monthly','annual')),
  series_id text references series(id),             -- set for series_pack only
  starts_at timestamptz not null default now(),
  expires_at timestamptz                             -- null = no expiry (series pack)
);

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table user_progress enable row level security;
alter table diary_entries enable row level security;
alter table contemplation_sessions enable row level security;
alter table intake_answers enable row level security;
alter table survey_answers enable row level security;
alter table access_grants enable row level security;
alter table series enable row level security;
alter table contemplations enable row level security;

-- Content: published series readable by any authenticated user. Drafts stay
-- hidden. (Note: while content ships inside the app bundle, per-purchase
-- gating here is moot — revisit if/when content moves fully server-side.)
create policy "series readable" on series
  for select to authenticated using (is_published);
create policy "contemplations readable" on contemplations
  for select to authenticated
  using (exists (select 1 from series s where s.id = series_id and s.is_published));

-- Per-user tables: a user can read/write only their own rows.
create policy "own profile" on profiles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own progress" on user_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own diary" on diary_entries
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own sessions" on contemplation_sessions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own intake" on intake_answers
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own surveys" on survey_answers
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- access_grants: read-only for the client; writes come from the webhook
-- Edge Function using the service-role key (bypasses RLS).
create policy "own grants readable" on access_grants
  for select to authenticated using (user_id = auth.uid());
