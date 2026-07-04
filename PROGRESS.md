# PROGRESS

## Status: V1 prototype complete & verified (local-first)

Working end-to-end app prototype per the approved plan. All 22 screens from the
wireframes implemented as a real Expo app, fully testable today.

## What works (verified end-to-end on web, June 2026)

- **Onboarding:** splash routing (first-run vs returning) → disclaimer (real copy,
  resources pop-up, 12+ gate) → Get Ready (time 1/2/3/5 + music + instructions
  pop-up) → free contemplation → paywall (mock — 3 plans at spec prices) →
  login (mock auth, email/username validated, SSO buttons render) → baseline
  intro → 4-question intake (one per slide, all required).
- **Core loop:** Home (hero + play, titled series list, no day numbers, status
  pills) → gated series intro (no skip) → Get Ready → contemplation player
  (gradient drift, animated centered question, hidden timer, final-5s pulse,
  small Pause/End, dim Crisis pill) → Add Time (+N restarts contemplation
  automatically) → journal (150-word hard cap verified, ≤60s voice memo,
  prior-reflection display, save-then-hide) → day exit → resume-where-left-off
  (verified across full page reload).
- **Series boundary:** wrap-up slides + quality-of-life question → stats from
  real stored data (time, thoughts, n/n complete, streak) with diary entries
  revealed at completion → survey (mirrors intake) → next-step (next series /
  replay with same or alternate questions). Series 2 unlock gating verified.
- **Account:** menu, account, settings (notification/music prefs, JSON export,
  TRUE delete-account wipe → back to first-run — verified), subscription
  (mock current plan / upgrade / restore / cancel), Mental Health Resources
  with full copy. Crisis button on every contemplation screen (hard rule).
- **Dev tool:** Settings → "Fast-forward one contemplation" advances a day
  instantly for testing series boundaries.

## How to test

- **Web (anyone):** `npx expo export --platform web` → serve `dist/` (or use the
  shared URL). Voice memo works in browsers with MediaRecorder; otherwise hides.
- **Phone (Expo Go):** `cd contemplation-app && npx expo start` → scan the QR
  with the Expo Go app (App Store / Play Store). Full native experience incl.
  voice recording.
- Data is per-device (local). Delete account in Settings to reset to first-run.

## Backend (Phase B) — IMPLEMENTED, awaiting project keys

The Supabase adapter is fully implemented (`src/services/supabase/`):
passwordless email-code auth, full data sync (progress incl. the 6pm-drop
timestamp, diary with voice-memo uploads to a private `memos` bucket + signed
URLs, intake/surveys, grants), pre-auth onboarding held locally and imported
on first sign-in, sign-out, and true account deletion via the
`delete-account` Edge Function (fallback: sign-out until deployed).

**To activate (~10 min):** create a supabase.com project → SQL editor: run
`supabase/schema.sql` then `supabase/setup-extras.sql` → confirm Email auth
enabled → copy URL + anon key into `.env` and set
`EXPO_PUBLIC_DATA_PROVIDER=supabase`. Deploy deletion:
`npx supabase login && npx supabase link --project-ref <ref> && npx supabase functions deploy delete-account`.
The public share-URL build intentionally stays on the local provider.

## Architecture seams (for the real build-out)

- `src/services/types.ts` — service contract; screens import only this.
- `src/services/local/` — AsyncStorage adapter (active).
- `src/services/supabase/` — skeleton adapter; activation steps in file header.
- `supabase/schema.sql` — full schema + RLS, matches CLAUDE.md data model.
- `.env.example` — provider flag + Supabase keys.
- `src/content/series.ts` — all 4 series verbatim; `videoUri: null` slots ready
  for real loops (expo-video wiring already in the player). Series length is
  computed everywhere (`seriesLength()`), never hardcoded.
- `src/theme/tokens.ts` — single restyle point (colors/type/spacing/timing/limits).
- Payments: mock grants via `AccessService`; decoupled tiers per CLAUDE.md
  (pack→series, monthly/annual→time-windowed). RevenueCat replaces the grant
  write only. expo-dev-client installed for the dev-build phase.

## Deliberately deferred (seams in place)

Real Supabase auth/sync, Apple/Google SSO, RevenueCat IAP, voice transcription
Edge Function, push notification delivery, background music audio, real video
loops, final visual design.

## Flags for review

- Crisis button kept on the active contemplation screen (CLAUDE.md hard rule
  overrides wireframe round 7) — styled small/dim to stay out of the way.
- Word cap = 150 words (not characters), enforced with live counter.
- App name placeholder "Contemplation" (`APP_NAME` in tokens.ts); candidates in
  the copy doc: Atma, Lila, Rasa, Mujo, Ephemera.
