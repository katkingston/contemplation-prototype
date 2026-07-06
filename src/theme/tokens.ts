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

export const APP_NAME = 'Contemplate'; // chosen July 2026 (domain: contemplate.day)

/**
 * Brand fonts (owner-provided, all SIL OFL):
 * - BIZ UD Mincho — the body voice: monospaced-feeling literary serif.
 * - Karrik — bold vernacular grotesque, for limited display headlines.
 * - Miedinger — alternative sans, for letterspaced caps labels.
 */
export const font = {
  /** Handwriting stand-in for the eventual handwritten contemplation images. */
  hand: 'Daniel-Regular',
  mono: 'BIZUDMincho-Regular',
  monoBold: 'BIZUDMincho-Bold',
  display: 'Karrik-Regular',
  displayItalic: 'Karrik-Italic',
  grotesk: 'Miedinger-Book',
  groteskBold: 'Miedinger-Bold',
} as const;

export const color = {
  // Paper & ink (stone card / espresso card references)
  ink: '#272b18', // deep olive (was espresso near-black)
  paper: '#f0ece1',
  muted: '#6b665a', // WCAG AA 4.5:1 on paper & faint (was #8a8474 @ 3.2)
  faint: '#e9e4d6',
  line: '#d8d2c2',
  // Dark surfaces (contemplation spaces)
  dark: '#20240f', // dark olive green surface
  darkElevated: '#2e3319',
  onDark: '#efe9db',
  onDarkMuted: '#a89f8c',
  // Accents (Florilegium olive · Petit Merci chartreuse · oxblood)
  accent: '#6a6b33', // WCAG AA as text on paper/faint (was #6f7036 @ 4.4)
  accentBright: '#99b955',
  danger: '#7d332b',
  success: '#4a5a2e',
  successBg: '#e4e6d2',
  progress: '#6a6b33', // AA on progressBg
  progressBg: '#eae8d2',
  locked: '#696559', // AA on faint pills (was #b0a996 @ 1.8 — unreadable)
} as const;

/** Per-series ambient color continuum — gradient stops per contemplation drift between these. */
export const seriesPalettes: Record<string, [string, string, string]> = {
  's1-impermanence': ['#232619', '#4c5232', '#6f7036'], // moss → olive
  's2-connection': ['#2b1815', '#6e2a24', '#94493a'], // espresso → oxblood → rose
  's3-fear-identity': ['#1e1913', '#4a4436', '#7a7158'], // espresso → stone
  's4-intention': ['#2c2e17', '#7f8f3d', '#99b955'], // olive → chartreuse
};

/**
 * Type roles (per Kat, July 2026):
 * - Karrik: ALL CAPS, limited display headlines only (display, title).
 * - Mincho: ONLY certain small labels, all caps (the `label` variant).
 * - Miedinger: everything else (headings, body, small, caption, contemplation).
 */
export const type = {
  display: {
    fontFamily: font.display,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -0.42, // -1%
    textTransform: 'uppercase' as const,
  },
  title: {
    fontFamily: font.display,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.3, // -1%
    textTransform: 'uppercase' as const,
  },
  heading: {
    fontFamily: font.grotesk,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.15, // -1%
    textTransform: 'uppercase' as const,
  },
  body: { fontFamily: font.grotesk, fontSize: 15, lineHeight: 23, letterSpacing: -0.15 }, // -1%
  bodyBold: { fontFamily: font.groteskBold, fontSize: 15, lineHeight: 23, letterSpacing: -0.15 }, // -1%
  small: { fontFamily: font.grotesk, fontSize: 13, lineHeight: 19, letterSpacing: -0.13 }, // -1%
  caption: { fontFamily: font.grotesk, fontSize: 11, lineHeight: 15, letterSpacing: -0.11 }, // -1%
  /** Mincho's only role: deliberate small editorial labels, all caps. */
  label: {
    fontFamily: font.mono,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: -0.44, // -4% (mono)
    textTransform: 'uppercase' as const,
  },
  contemplation: { fontFamily: font.grotesk, fontSize: 26, lineHeight: 38, letterSpacing: -0.26 }, // -1%
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
