# Prototype → App Store: the path

What exists today: a fully working local-first prototype (all screens, core loop,
series boundary, mock auth/payments, placeholder media) with real seams for every
production system. This file lists what remains, in order, split by who does it.

## Phase A — Accounts & foundations (you, ~a day of admin)
1. **Apple Developer Program** — enroll ($99/yr) at developer.apple.com. Needed for
   TestFlight and the store. Takes 1–2 days to approve.
2. **Supabase** — create a project (free tier fine to start). Run
   `supabase/schema.sql` in the SQL editor. Copy URL + anon key into `.env`.
3. **RevenueCat** — create account + project (free to $2.5k MTR). Will need the
   App Store Connect app created first (Phase C) to attach products.
4. **Decide the app name** (Atma / Lila / Rasa / Mujo / Ephemera / other) — it
   gates the bundle ID, store listing, and all the `[App name]` placeholders.
5. **Expo/EAS account** — expo.dev signup (free tier works; paid speeds builds).

## Phase B — Real backend (code, ~1–2 weeks)
1. Implement the Supabase adapter (`src/services/supabase/`) against the same
   `AppServices` interface — screens don't change. Flip `EXPO_PUBLIC_DATA_PROVIDER`.
2. Real auth: email (Supabase) first; then **Sign in with Apple** (required by
   Apple since we offer Google) + Google OAuth.
3. Voice memos → Supabase Storage upload; diary rows reference storage paths.
4. Account deletion Edge Function (true server-side delete — Apple 5.1.1(v)).
5. Transcription Edge Function (gpt-4o-mini-transcribe) — server-side key only.
6. Migrate content (series/contemplations) into the DB tables so new series ship
   without app updates.

## Phase C — Payments (joint, ~1 week + Apple lag)
1. You: create the app in **App Store Connect**; create the 3 IAP products
   (series pack = consumable, monthly = non-renewing sub, annual = auto-renewable
   with 3-day intro trial).
2. Code: `react-native-purchases` init, paywall wired to offerings, annual
   entitlement check, `NON_RENEWING_PURCHASE` webhook → Edge Function →
   `access_grants` (already modeled). Mock grants remain for testers.
3. Test in **sandbox** on a development build (IAP never works in Expo Go).

## Phase D — Native build & device testing (~2–4 days)
1. `eas build --profile development` → dev client on your iPhone (replaces Expo Go).
2. Real device pass: video/music behavior, background/foreground pauses, voice
   recording, haptics, notch/safe-area.
3. Push notifications (streak reminders) via expo-notifications + permissions flow.
4. Performance: compress per-contemplation video loops (short, muted, ≤5MB each),
   static artwork fallback per day (already in the player as gradients).

## Phase E — Store readiness (you + me, ~1 week)
1. **Assets**: app icon, splash, 6.7" + 6.1" screenshots (can generate from the
   design system), preview video optional.
2. **Copy**: store description (draft exists in your copy doc incl. the required
   disclaimer + auto-renew language), keywords, support URL.
3. **Privacy**: privacy policy URL (Termly per your doc), App Privacy nutrition
   labels (data collected: email, user content, purchases), age rating 12+.
4. **Review prep for sensitive content** (from your financial doc §3): content
   advisory in onboarding ✓ (already built), crisis resources beyond onboarding ✓
   (persistent button + settings), "not a clinical tool" disclaimer ✓. Budget
   extra review time; have the reviewer notes explain the death-education framing.
5. **TestFlight**: internal testers first (instant), then external (one-time
   beta review, ~1 day). This replaces the web-share URL for real testing.

## Phase F — Submission
1. `eas build --profile production` + `eas submit`.
2. Expect 1–3 days standard review; possibly a rejection-and-clarify round given
   the subject matter — the disclaimers above are the mitigations.

## Known placeholders to replace before launch
- App name + icon everywhere (`APP_NAME` token).
- Contemplation media: one shared loop + one track today → per-contemplation art.
- Handwritten contemplation images (Daniel font is the stand-in).
- Terms of Service + Privacy Policy documents (Termly, per your research doc).
- Real intro-offer configuration in App Store Connect (3-day trial on annual).
