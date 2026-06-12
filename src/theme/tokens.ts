/**
 * Theme tokens — the single restyle point for the whole app.
 * Final visual design lands here later; screens consume only these tokens.
 */

export const APP_NAME = 'Contemplation'; // placeholder — candidates: Atma, Lila, Rasa, Mujo, Ephemera

export const color = {
  // Base neutrals (low-fi for now)
  ink: '#1a1a1f',
  paper: '#ffffff',
  muted: '#8a8a90',
  faint: '#f7f7f8',
  line: '#e2e2e5',
  dark: '#141417',
  darkElevated: '#26262c',
  onDark: '#f2f2f4',
  onDarkMuted: '#9a9aa2',
  accent: '#8a6d3b',
  danger: '#b5544e',
  success: '#3d6b3d',
  successBg: '#f1f7f1',
  progress: '#866a32',
  progressBg: '#f9f5ee',
  locked: '#b0b0b0',
} as const;

/** Per-series ambient color continuum — gradient stops per contemplation drift between these. */
export const seriesPalettes: Record<string, [string, string, string]> = {
  's1-impermanence': ['#1f2430', '#3a4a5a', '#6e7f8d'],
  's2-connection': ['#241f2e', '#4a3a56', '#8d6e85'],
  's3-fear-identity': ['#1f2a26', '#3a564a', '#6e8d7f'],
  's4-intention': ['#2e261f', '#56443a', '#8d7c6e'],
};

export const type = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  title: { fontSize: 24, fontWeight: '700' as const, lineHeight: 31 },
  heading: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 15 },
  contemplation: { fontSize: 28, fontWeight: '600' as const, lineHeight: 40 },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const timing = {
  /** Contemplation timer choices, in minutes. */
  timerChoicesMin: [1, 2, 3, 5],
  /** Default timer (user must still confirm via Begin). */
  defaultTimerMin: 1,
  /** Final pulse window before the timer ends, ms. */
  endPulseMs: 5000,
  /** Add-time choices on the time's-up screen, minutes. */
  addTimeChoicesMin: [1, 2, 3, 5],
} as const;

export const limits = {
  diaryMaxWords: 150,
  voiceMaxSeconds: 60,
} as const;
