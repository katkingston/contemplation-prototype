# CLAUDE.md

## Project
A daily contemplation practice app exploring impermanence and mortality, to help people engage more fully with life. Content is organized into **contemplation series** — themed sequences of daily contemplations. Series length is variable and must never be hardcoded; more series of different lengths will be added over time. Frame series by theme, not time commitment — no "7-day challenge" or "week" language in UI copy unless I approve it. This is V1. Treat the subject matter as serious wellness content, not entertainment.

## Stack (do not substitute without asking me)
- **Framework:** Expo SDK 55, Expo Router (file-based routing), TypeScript strict mode.
- **Media:** `expo-video` for background loops, `expo-audio` for voice memo recording. `expo-av` was REMOVED in SDK 55 — never import it. Use `useVideoPlayer` + `<VideoView>` and the `expo-audio` recording API.
- **Backend:** Supabase (Postgres + Auth + Storage + Row Level Security). Auth via email, Sign in with Apple, and Google.
- **Payments:** RevenueCat (`react-native-purchases`). Three products: series pack (consumable, unlocks one series), monthly (non-renewing subscription), annual (auto-renewable subscription). **Purchase tiers are decoupled from series length** — a pack unlocks a series regardless of how many contemplations it contains; monthly/annual are time-windowed access to all series. Never tie access logic to a 7-day assumption.
  - Only the **annual** product gets a RevenueCat entitlement. RevenueCat auto-manages its expiration/renewal.
  - **Never attach the series pack or monthly products to an entitlement** — Apple provides no expiration date for consumables or non-renewing subs, so RevenueCat would report the entitlement unlocked forever.
  - For series pack and monthly: validate the purchase via RevenueCat, then grant access in Supabase (an `access_grants` table with `user_id`, `product_type`, `series_id` nullable, `starts_at`, `expires_at` nullable). Series pack grants reference a specific series and need no expiry; monthly grants are time-windowed. Drive grants from RevenueCat `NON_RENEWING_PURCHASE` webhooks to a Supabase Edge Function. App-side access check = active entitlement OR valid grant.
  - IAP cannot run in Expo Go — the SDK returns mocked Preview API values there. Real purchase testing requires a development build.
- **Animation:** Reanimated 4 (New Architecture only) for text intros and color/ombre transitions.
- **Notifications:** `expo-notifications` for streak reminders.
- **Transcription:** OpenAI `gpt-4o-mini-transcribe` (or AssemblyAI Universal-2), called server-side from a Supabase Edge Function. Never put the transcription API key in the client.

## Hard rules
- Use a **development build** (`expo-dev-client`), not Expo Go, from day one — the app needs native modules (RevenueCat, audio, video).
- No secrets or API keys in client code. Route third-party API calls through Supabase Edge Functions.
- Crisis resources (988, Crisis Text Line) must be reachable from a **persistent button on every contemplation screen**, not only onboarding. Apple reviewers check this for sensitive-content apps.
- All user progress, intake answers, survey answers, and diary entries live in Supabase keyed to the user, never local-only, so they survive reinstall and device change.
- Age gate is 12+. Keep the disclaimer and crisis copy exactly as written in the spec unless I change it.
- The app supports account creation, so Apple requires **in-app account deletion** (Guideline 5.1.1(v)). It must actually delete the account and data, not just deactivate — already in the spec's Settings, treat it as mandatory, not optional.

## Data model intent (Postgres)
- `series` (theme, title, display_order, intro/wrap copy, is_published) and `contemplations` (series_id, sequence_index, prompt text, media ref). Series length = count of its contemplations; never assume 7.
- `user_progress` (user_id, series_id, current_index, completed_at, last_opened) drives resume-where-left-off and the completion stats page. Completion = current_index past the last contemplation in that series, computed, not hardcoded.
- `diary_entries` (user_id, contemplation_id, text, audio_path, created_at, **is_revealed boolean**). Entries are SAVED immediately but hidden from the user until series completion. Implement hiding as a query filter on `is_revealed` / completion state, never by withholding the write.
- `intake_answers` and `survey_answers` stored, never shown back to the user.
- `access_grants` (user_id, product_type, series_id nullable, starts_at, expires_at nullable) — source of truth for series-pack/monthly access; written by the RevenueCat webhook Edge Function, never by the client.
- Enable RLS on every table; a user can read/write only their own rows. `access_grants` is read-only for the client.

## Workflow
- Use **Plan Mode** (Shift+Tab) for any multi-file or architectural step. Output a plan, wait for my approval, then implement.
- Define "done" per task with a concrete verification step (runs on device, specific screen behaves as specced).
- Read generated code before I accept it. Keep architectural decisions with me.
- Commit after each working phase. Keep a `PROGRESS.md` summary so new sessions inherit context.

## Build order (do not jump ahead)
1. Scaffold: Expo + Router + TS + dev client, Supabase client, RevenueCat init, theme tokens (color continuum, type scale).
2. Data model + auth: Supabase schema, RLS, auth screens (email/Apple/Google).
3. Core contemplation loop: disclaimer → intake → instructions → contemplation (video bg + animated text + confirmable timer + mute) → thought diary (text 150-word cap + 1-min voice) → progress save → resume.
4. Series completion: stats page from real data, completion survey, series intro/wrap-up.
5. Account, settings, subscription management, paywall (RevenueCat), crisis resources screen.
6. Badges/streaks, animations polish, empty states.

## App-specific traps to avoid
- Looping background video drains battery and janks. Use short, compressed, muted loops; pause on app background; provide a static-artwork fallback per day.
- The contemplation timer defaults to 1 minute but the user must confirm before it starts.
- Voice memo: 1-minute max, text diary: 150-word max. Enforce both in the UI with clear empty states.
- Don't claim subscriptions work when tested in Expo Go — they are mocked there.
