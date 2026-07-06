/**
 * Pure domain logic shared by screens — gating, completion, streaks, stats.
 * All series-length math is computed from content, never hardcoded.
 */
import { orderedSeries, Series, seriesLength, getSeries } from '@/content/series';
import { AppData, SeriesProgress } from '@/services/types';

export function progressFor(data: AppData, seriesId: string): SeriesProgress {
  return (
    data.progress[seriesId] ?? {
      seriesId,
      currentIndex: 0,
      completedAt: null,
      lastOpened: null,
      lastCompletedAt: null,
      replayCount: 0,
      useAltQuestions: false,
    }
  );
}

// ---------- daily drop (6pm LOCAL) ----------

/** Default drop hour — users can change it in Settings (settings.dropHour/dropMinute). */
export const DROP_HOUR = 18;

/**
 * HARD CAP: one contemplation per calendar day, and drops happen at 6pm —
 * the next item unlocks at 6:00 PM (user's local time) on the calendar day
 * AFTER their last completion, no matter what time they completed. Sequential
 * order is already enforced by currentIndex. No completions yet → available now.
 */
export function nextDropAt(data: AppData, seriesId: string): Date | null {
  const p = progressFor(data, seriesId);
  const last = p.lastCompletedAt ?? null;
  if (!last) return null; // nothing completed → first item is available immediately
  const drop = new Date(last);
  drop.setDate(drop.getDate() + 1);
  drop.setHours(data.settings.dropHour ?? DROP_HOUR, data.settings.dropMinute ?? 0, 0, 0);
  return drop;
}

export function isDropAvailable(data: AppData, seriesId: string): boolean {
  const at = nextDropAt(data, seriesId);
  return at == null || Date.now() >= at.getTime();
}

/** "6:00 PM today" / "6:00 PM tomorrow" label — formats the drop's own time. */
export function dropLabel(at: Date): string {
  const now = new Date();
  const sameDay =
    at.getFullYear() === now.getFullYear() &&
    at.getMonth() === now.getMonth() &&
    at.getDate() === now.getDate();
  return `${formatTime(at.getHours(), at.getMinutes())} ${sameDay ? 'today' : 'tomorrow'}`;
}

/** 18,0 -> "6:00 PM". */
export function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

/**
 * Parse a typed time: "6", "6pm", "6:30 pm", "18:00" -> {hour, minute}.
 * Bare hours 1-7 assume PM (evening practice); returns null if unparseable.
 */
export function parseTimeInput(raw: string): { hour: number; minute: number } | null {
  const m = raw.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[3];
  if (hour > 23 || minute > 59) return null;
  if (mer?.startsWith('p') && hour < 12) hour += 12;
  if (mer?.startsWith('a') && hour === 12) hour = 0;
  if (!mer && hour >= 1 && hour <= 7) hour += 12; // bare "6" means evening
  return { hour, minute };
}

export function isSeriesCompleted(data: AppData, s: Series): boolean {
  const p = progressFor(data, s.id);
  return p.completedAt != null || p.currentIndex >= seriesLength(s);
}

/** Has the user finished every contemplation but not yet been through the wrap-up? */
export function isSeriesAtWrap(data: AppData, s: Series): boolean {
  const p = progressFor(data, s.id);
  return p.currentIndex >= seriesLength(s) && p.completedAt == null;
}

export function hasActiveAccess(data: AppData, seriesId: string): boolean {
  const now = Date.now();
  return data.grants.some((g) => {
    const started = new Date(g.startsAt).getTime() <= now;
    const unexpired = g.expiresAt == null || new Date(g.expiresAt).getTime() > now;
    const scope = g.productType === 'series_pack' ? g.seriesId === seriesId : true;
    return started && unexpired && scope;
  });
}

/**
 * A series is unlocked when the user has access AND the introductory series
 * (displayOrder 1) is completed — except the introductory series itself.
 */
export function isSeriesUnlocked(data: AppData, s: Series): boolean {
  if (!hasActiveAccess(data, s.id)) return false;
  if (s.displayOrder === 1) return true;
  const intro = orderedSeries()[0];
  return intro ? isSeriesCompleted(data, intro) : false;
}

/** The series the user is currently working through (first with progress not completed), else first unlocked, else intro. */
export function activeSeries(data: AppData): Series {
  const all = orderedSeries();
  for (const s of all) {
    const p = progressFor(data, s.id);
    if ((p.currentIndex > 0 || p.replayCount > 0) && !isSeriesCompleted(data, s)) return s;
  }
  for (const s of all) {
    if (!isSeriesCompleted(data, s) && isSeriesUnlocked(data, s)) return s;
  }
  return all[0];
}

/** Next series after the given one that exists and is published. */
export function nextSeriesAfter(seriesId: string): Series | null {
  const all = orderedSeries();
  const i = all.findIndex((s) => s.id === seriesId);
  return i >= 0 && i + 1 < all.length ? all[i + 1] : null;
}

/** Question for a contemplation honoring replay-with-alt-questions. */
export function questionFor(data: AppData, s: Series, index: number): string {
  const p = progressFor(data, s.id);
  const base = s.contemplations[index]?.prompt ?? '';
  if (p.useAltQuestions && s.altQuestions.length > 0) {
    return s.altQuestions[index % s.altQuestions.length];
  }
  return base;
}

// ---------- stats ----------

export interface SeriesStats {
  totalSeconds: number;
  thoughtsShared: number;
  daysComplete: number;
  seriesLength: number;
  streak: number;
  revealedEntries: { prompt: string; text: string | null; audioUri: string | null }[];
}

export function statsFor(data: AppData, seriesId: string): SeriesStats {
  const s = getSeries(seriesId);
  const sessions = data.sessions.filter((x) => x.seriesId === seriesId);
  const entries = data.diary.filter((e) => e.seriesId === seriesId && e.isRevealed);
  return {
    totalSeconds: sessions.reduce((a, b) => a + b.seconds, 0),
    thoughtsShared: data.diary.filter((e) => e.seriesId === seriesId).length,
    daysComplete: progressFor(data, seriesId).currentIndex,
    seriesLength: s ? seriesLength(s) : 0,
    streak: computeStreak(data),
    revealedEntries: entries
      .slice(-3)
      .map((e) => ({ prompt: e.prompt, text: e.text, audioUri: e.audioUri })),
  };
}

/** Consecutive-day streak ending today or yesterday, from session dates. */
export function computeStreak(data: AppData): number {
  const days = [...new Set(data.sessions.map((s) => s.date))].sort().reverse();
  if (days.length === 0) return 0;
  // LOCAL calendar dates — must match how sessions are stamped.
  const p = (n: number) => String(n).padStart(2, '0');
  const dayStr = (d: Date) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400_000);
  if (days[0] !== dayStr(today) && days[0] !== dayStr(yesterday)) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + 'T00:00:00Z').getTime();
    const cur = new Date(days[i] + 'T00:00:00Z').getTime();
    if (prev - cur === 86400_000) streak += 1;
    else break;
  }
  return streak;
}

export function formatMinutes(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  return m < 1 ? '<1m' : `${m}m`;
}

// ---------- lifetime stats (Account page, per Open reference) ----------

export interface LifetimeStats {
  contemplations: number;
  minutes: number;
  currentStreak: number;
  bestStreak: number;
}

export function lifetimeStats(data: AppData): LifetimeStats {
  const secs = data.sessions.reduce((a, b) => a + b.seconds, 0);
  return {
    contemplations: data.sessions.length,
    minutes: Math.round(secs / 60),
    currentStreak: computeStreak(data),
    bestStreak: bestStreak(data),
  };
}

/** Longest consecutive-day run across all session dates. */
export function bestStreak(data: AppData): number {
  const days = [...new Set(data.sessions.map((s) => s.date))].sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of days) {
    const t = new Date(d + 'T00:00:00Z').getTime();
    run = prev != null && t - prev === 86400_000 ? run + 1 : 1;
    prev = t;
    best = Math.max(best, run);
  }
  return best;
}

/** Milestones for the accomplishments wall. */
export const MILESTONES = {
  contemplations: [1, 5, 10, 20] as readonly number[],
  streaks: [2, 5, 10] as readonly number[],
};
