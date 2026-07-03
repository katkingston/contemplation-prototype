/**
 * Theme tokens — the single restyle point for the whole app.
 *
 * DESIGN DIRECTION (from reference round 1):
 * Literary small-press anthology. Literary mono-serif (BIZ UD Mincho) as the
 * body voice, bold grotesque (Karrik) for headlines, Miedinger for labels. Warm stone paper,
 * espresso ink, olive/moss/chartreuse greens, oxblood accent. Soft
 * airbrushed gradients inside hard shapes (nail-art reference). Sharp,
 * print-like corners. Generous whitespace, letterspaced caps labels.
 */

export const APP_NAME = 'Contemplation'; // placeholder — candidates: Atma, Lila, Rasa, Mujo, Ephemera

/**
 * Brand fonts (owner-provided, all SIL OFL):
 * - BIZ UD Mincho — the body voice: monospaced-feeling literary serif.
 * - Karrik — bold vernacular grotesque, for limited display headlines.
 * - Miedinger — alternative sans, for letterspaced caps labels.
 */
export const font = {
  mono: 'BIZUDMincho-Regular',
  monoBold: 'BIZUDMincho-Bold',
  display: 'Karrik-Regular',
  displayItalic: 'Karrik-Italic',
  grotesk: 'Miedinger-Book',
  groteskBold: 'Miedinger-Bold',
} as const;

export const color = {
  // Paper & ink (stone card / espresso card references)
  ink: '#221c16',
  paper: '#f0ece1',
  muted: '#8a8474',
  faint: '#e9e4d6',
  line: '#d8d2c2',
  // Dark surfaces (contemplation spaces)
  dark: '#221c16',
  darkElevated: '#322a22',
  onDark: '#efe9db',
  onDarkMuted: '#a89f8c',
  // Accents (Florilegium olive · Petit Merci chartreuse · oxblood)
  accent: '#6f7036',
  accentBright: '#99b955',
  danger: '#7d332b',
  success: '#4a5a2e',
  successBg: '#e4e6d2',
  progress: '#6f7036',
  progressBg: '#eae8d2',
  locked: '#b0a996',
} as const;

/** Per-series ambient color continuum — gradient stops per contemplation drift between these. */
export const seriesPalettes: Record<string, [string, string, string]> = {
  's1-impermanence': ['#232619', '#4c5232', '#6f7036'], // moss → olive
  's2-connection': ['#2b1815', '#6e2a24', '#94493a'], // espresso → oxblood → rose
  's3-fear-identity': ['#1e1913', '#4a4436', '#7a7158'], // espresso → stone
  's4-intention': ['#2c2e17', '#7f8f3d', '#99b955'], // olive → chartreuse
};

export const type = {
  display: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: 0.2 },
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30, letterSpacing: 0.2 },
  heading: {
    fontFamily: font.grotesk,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  body: { fontFamily: font.mono, fontSize: 15, lineHeight: 23 },
  bodyBold: { fontFamily: font.monoBold, fontSize: 15, lineHeight: 23 },
  small: { fontFamily: font.mono, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: font.mono, fontSize: 11, lineHeight: 15, letterSpacing: 0.3 },
  contemplation: { fontFamily: font.mono, fontSize: 26, lineHeight: 40, letterSpacing: 0.4 },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Print-like: sharp corners, stamped shapes. */
export const radius = {
  sm: 3,
  md: 5,
  lg: 12,
  pill: 999,
} as const;

export const timing = {
  /** Contemplation timer choices, in minutes. */
  timerChoicesMin: [1, 2, 3, 5] as readonly number[],
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
