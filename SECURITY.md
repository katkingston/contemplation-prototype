# Security checklist / safety protocol

Living document. Re-walk this list at each milestone: **[NOW]** = project setup
(today), **[TESTFLIGHT]** = before real testers, **[LAUNCH]** = before App Store
release. Status reflects July 2026 after the adversarial review round
(commits 30600f6, d2f5349, 7c3114e).

Legend: ✅ done · 🔒 handled by platform · ⏳ scheduled · ◻️ open action

## 1. Rate limits
- 🔒 Supabase applies built-in rate limits to ALL auth endpoints (OTP sends,
  verifications, sign-ins) — this is what protects the email quota.
- ◻️ **[NOW]** After project creation: Dashboard → Auth → Rate Limits — confirm
  defaults, lower "emails per hour" if the free email quota gets abused.
- ⏳ **[LAUNCH]** Data API has no per-user rate limit; if abuse appears,
  options are Supabase's API gateway settings / Cloudflare in front.

## 2. Row Level Security
- ✅ RLS enabled on all 9 tables + private storage bucket; own-rows-only
  policies; verified by independent adversarial review (no cross-user path).
- ✅ Content tables gate on `is_published` (drafts hidden).
- ◻️ **[NOW]** Live cross-account test once keys exist: user B must get zero
  rows querying user A's data (part of the Phase B verification run).
- ⏳ **[TESTFLIGHT→LAUNCH]** Remove the "own grants insert (PROTOTYPE ONLY)"
  policy when RevenueCat webhook lands (Phase C). THE top pre-launch item —
  until then a technical user can self-grant access.

## 3. CAPTCHA on auth + forms
- ⏳ **[LAUNCH]** Supabase Auth supports Cloudflare Turnstile/hCaptcha
  ("Bot and Abuse Protection"). Not enabled for the prototype — built-in auth
  rate limits are the interim protection, and the only public form is OTP
  login. Native apps are less bot-exposed, but enable Turnstile before launch
  so scripted signups can't burn the email quota.

## 4. Server-side validation
- ✅ DB constraints mirror every UI limit: diary word + character cap, memo
  duration, memo path bound to owner's folder, session/progress bounds,
  JSONB size caps (setup-extras.sql §4).
- ✅ Storage bucket enforces 8MB max + audio-only MIME types server-side.
- ✅ Client upload validates source scheme (local files only) + size.

## 5. .gitignore / source hygiene
- ✅ `.env` gitignored, never committed (verified against full git history).
- ✅ Public repo (`contemplation-prototype`) receives ONLY the compiled
  bundle — never source, never CLAUDE.md. Keep it that way.

## 6. JWT short expiry + refresh tokens
- 🔒 Supabase default: 1-hour access token + auto-rotating refresh token
  (supabase-js refreshes in the background). Fine for a consumer app.
- ◻️ **[NOW]** Optional: Dashboard → Auth → Sessions to shorten access-token
  TTL if desired. Don't go below ~10 min (refresh churn on mobile networks).

## 7. At-rest encryption
- 🔒 Supabase encrypts the database and storage at rest (AES-256) on every
  project — nothing to configure.
- ⏳ **[TESTFLIGHT]** Device side: move the session from AsyncStorage to
  `expo-secure-store` (keychain-backed) in the native build. Web-dev
  localStorage session is acceptable for dev only.

## 8. Logging
- 🔒 Supabase dashboard keeps API / auth / Edge Function logs.
- ✅ Edge Function logs error details server-side, returns constant bodies
  to clients (no schema/internals leakage).
- ✅ No tokens or PII logged client-side (reviewed).
- ◻️ **[LAUNCH]** Add a crash reporter (Sentry) with PII scrubbing ON —
  diary text/audio must never reach a third-party logger.

## 9. Environment variables
- ✅ Only `EXPO_PUBLIC_*` values exist client-side; the anon key is
  designed-public (RLS is the boundary). Service-role key exists ONLY in the
  Edge runtime (auto-injected, never in the repo or app).
- ◻️ **[NOW]** `cp .env.example .env`, paste project URL + anon key, set
  `EXPO_PUBLIC_DATA_PROVIDER=supabase`. Never paste the service-role key
  or DB password anywhere in the app.

## 10. CORS restriction
- ✅ Edge Function handles OPTIONS/POST-only with explicit headers. Auth is
  bearer-token (not cookies), so CORS is hygiene, not the security boundary.
- 🔒 Data API CORS is managed by Supabase; safe for the same reason.

## 11. Dependency audit
- ✅ `npm audit`: 0 vulnerabilities (July 5, 2026). All deps real, current,
  SDK-pinned; Edge Function dependency pinned to an exact version.
- ◻️ **[recurring]** Re-run `npm audit` before every TestFlight build and
  after every `npx expo install` round.

## 12. CSRF protection
- ✅ N/A by architecture: no cookie-based auth anywhere. Native app + bearer
  tokens = no cross-site request surface. (This is why the Edge Function's
  permissive CORS reflection is safe.) Revisit ONLY if a cookie-based web
  app is ever added.

## Not on the list but on the radar
- **Account deletion is fail-closed** (never claims success falsely);
  deploy the Edge Function during setup:
  `npx supabase login && npx supabase link --project-ref <ref> && npx supabase functions deploy delete-account`
- **Transcription/API keys** (Phase C): server-side Edge Function only.
- **Project-creation choices**: Data API ON, auto-expose ON (RLS is the
  boundary), automatic-RLS trigger ON, DB password in password manager only.
