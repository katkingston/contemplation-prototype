/**
 * Service-layer contract. Screens depend ONLY on these interfaces.
 * Adapters: `local` (AsyncStorage — default for the prototype) and
 * `supabase` (skeleton; activated later via env keys + provider flag).
 * Shapes intentionally mirror the Supabase schema in /supabase/schema.sql.
 */
import type { ProductType } from '@/content/copy';

export interface Profile {
  email: string;
  username: string;
  createdAt: string; // ISO
}

export interface SeriesProgress {
  seriesId: string;
  /** 0-based index of the NEXT contemplation to do. completed = index past the last one (computed). */
  currentIndex: number;
  completedAt: string | null;
  lastOpened: string | null; // local date (YYYY-MM-DD) of last completed contemplation
  /** Full timestamp of the last completion — drives the 6pm daily-drop gate. */
  lastCompletedAt: string | null;
  /** Number of times this series has been completed before the current run. */
  replayCount: number;
  /** When replaying, serve alternate questions instead of the originals. */
  useAltQuestions: boolean;
}

export interface DiaryEntry {
  id: string;
  seriesId: string;
  contemplationId: string;
  /** Question text as served (original or alt) so stats can show it. */
  prompt: string;
  text: string | null;
  audioUri: string | null;
  audioDurationSec: number | null;
  createdAt: string; // ISO
  /** Entries are SAVED immediately but hidden until series completion. */
  isRevealed: boolean;
}

export interface ContemplationSession {
  id: string;
  seriesId: string;
  contemplationId: string;
  seconds: number;
  date: string; // ISO date (YYYY-MM-DD)
}

export interface AccessGrant {
  id: string;
  productType: ProductType;
  /** Set for series_pack grants only. */
  seriesId: string | null;
  startsAt: string; // ISO
  /** null = no expiry (series pack); monthly/annual are time-windowed. */
  expiresAt: string | null;
  /** Mock-purchase marker so it's obvious in exports this wasn't a real charge. */
  mock: boolean;
}

export interface Settings {
  notificationsEnabled: boolean;
  musicDefaultOn: boolean;
  timerDefaultMin: number;
  /** App Store rating prompt state (logic/tuning in tokens.ts `review`). */
  reviewAsks: number;
  reviewLastAt: string | null;
  reviewDone: boolean;
}

export type AnswerValue = number | string | string[];

export interface AppData {
  disclaimerAcceptedAt: string | null;
  profile: Profile | null;
  intake: Record<string, AnswerValue> | null;
  surveys: Array<{ seriesId: string; answers: Record<string, AnswerValue>; createdAt: string }>;
  progress: Record<string, SeriesProgress>;
  diary: DiaryEntry[];
  sessions: ContemplationSession[];
  grants: AccessGrant[];
  settings: Settings;
  /** Onboarding checkpoint so a relaunch resumes the right step. */
  onboardingStep: 'disclaimer' | 'free' | 'paywall' | 'login' | 'intake' | 'done';
}

export const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: false,
  musicDefaultOn: true,
  timerDefaultMin: 1,
  reviewAsks: 0,
  reviewLastAt: null,
  reviewDone: false,
};

export const EMPTY_DATA: AppData = {
  disclaimerAcceptedAt: null,
  profile: null,
  intake: null,
  surveys: [],
  progress: {},
  diary: [],
  sessions: [],
  grants: [],
  settings: DEFAULT_SETTINGS,
  onboardingStep: 'disclaimer',
};

/**
 * The full service contract. One object so the provider can swap adapters
 * wholesale; conceptually grouped by domain.
 */
export interface AppServices {
  /** Load everything (hydration). */
  loadAll(): Promise<AppData>;

  // -- auth / lifecycle --
  acceptDisclaimer(): Promise<void>;
  setOnboardingStep(step: AppData['onboardingStep']): Promise<void>;
  createAccount(email: string, username: string): Promise<void>;
  /**
   * Passwordless email auth (cloud adapters only — absent on the local mock).
   * The login screen switches to a two-step code flow when these exist.
   */
  requestEmailCode?(email: string): Promise<void>;
  verifyEmailCode?(email: string, code: string, username: string): Promise<void>;
  /** Sign out of the cloud session (cloud adapters only). */
  signOut?(): Promise<void>;
  /** Full wipe — Apple 5.1.1(v): really deletes data, not deactivates. */
  deleteAccount(): Promise<void>;
  exportData(): Promise<string>; // JSON string of everything

  // -- intake / surveys --
  saveIntake(answers: Record<string, AnswerValue>): Promise<void>;
  saveSurvey(seriesId: string, answers: Record<string, AnswerValue>): Promise<void>;

  // -- progress --
  recordContemplationComplete(
    seriesId: string,
    contemplationId: string,
    seconds: number,
    opts?: { backdate?: boolean },
  ): Promise<void>;
  markSeriesComplete(seriesId: string): Promise<void>;
  startReplay(seriesId: string, useAltQuestions: boolean): Promise<void>;

  // -- diary --
  saveDiaryEntry(e: Omit<DiaryEntry, 'id' | 'createdAt' | 'isRevealed'>): Promise<void>;

  // -- access --
  grantAccess(productType: ProductType, seriesId?: string | null): Promise<void>;
  /** Mock cancel: expires all active grants now. Real impl = store-managed. */
  cancelAccess(): Promise<void>;

  // -- settings --
  saveSettings(s: Partial<Settings>): Promise<void>;
}
