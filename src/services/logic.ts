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
      replayCount: 0,
      useAltQuestions: false,
    }
  );
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
  const today = new Date();
  const dayStr = (d: Date) => d.toISOString().slice(0, 10);
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
