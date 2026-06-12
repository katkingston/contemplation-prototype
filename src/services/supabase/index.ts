/**
 * Supabase adapter — SKELETON, inert in the local-first prototype.
 *
 * To activate later:
 *   1. Create a Supabase project; run /supabase/schema.sql in the SQL editor.
 *   2. Copy .env.example → .env and fill EXPO_PUBLIC_SUPABASE_URL + ANON_KEY.
 *   3. Set EXPO_PUBLIC_DATA_PROVIDER=supabase.
 *   4. `npx expo install @supabase/supabase-js` and implement the TODOs below
 *      (each maps 1:1 to a table in schema.sql; RLS scopes rows to auth.uid()).
 *
 * Per App-CLAUDE.md: access_grants are written ONLY by the RevenueCat webhook
 * Edge Function — grantAccess() here must remain a no-op client-side except
 * for sandbox/testing flags.
 */
import { AppData, AppServices, AnswerValue, DiaryEntry, Settings } from '@/services/types';
import type { ProductType } from '@/content/copy';

const NOT_CONFIGURED =
  'SupabaseServices is not configured. Set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY and implement the adapter (see file header).';

export class SupabaseServices implements AppServices {
  constructor() {
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(NOT_CONFIGURED);
    }
  }
  loadAll(): Promise<AppData> {
    throw new Error(NOT_CONFIGURED); // TODO: select from all tables for auth.uid()
  }
  acceptDisclaimer(): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: profiles.disclaimer_accepted_at
  }
  setOnboardingStep(): Promise<void> {
    throw new Error(NOT_CONFIGURED);
  }
  createAccount(_email: string, _username: string): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: supabase.auth.signUp / signInWithOtp
  }
  deleteAccount(): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: Edge Function — true deletion (Apple 5.1.1(v))
  }
  exportData(): Promise<string> {
    throw new Error(NOT_CONFIGURED);
  }
  saveIntake(_a: Record<string, AnswerValue>): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: intake_answers insert
  }
  saveSurvey(_s: string, _a: Record<string, AnswerValue>): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: survey_answers insert
  }
  recordContemplationComplete(): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: user_progress upsert + sessions insert
  }
  markSeriesComplete(): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: user_progress.completed_at + diary_entries.is_revealed update
  }
  startReplay(): Promise<void> {
    throw new Error(NOT_CONFIGURED);
  }
  saveDiaryEntry(_e: Omit<DiaryEntry, 'id' | 'createdAt' | 'isRevealed'>): Promise<void> {
    throw new Error(NOT_CONFIGURED); // TODO: diary_entries insert; audio → Storage bucket
  }
  grantAccess(_p: ProductType, _s?: string | null): Promise<void> {
    throw new Error(NOT_CONFIGURED); // Webhook-only in production — see header.
  }
  saveSettings(_s: Partial<Settings>): Promise<void> {
    throw new Error(NOT_CONFIGURED);
  }
}
