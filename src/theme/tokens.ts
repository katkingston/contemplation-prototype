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
 * Brand fonts per the Figma DESIGN SYSTEM page (Jul 30 file):
 * - Inter (SIL OFL) — ALL sans roles: display, titles, body, buttons, tab bar.
 * - HAL Timezone Mono — intended mono body voice. UNLICENSED trial in the
 *   design file; BIZ UD Mincho (OFL) stands in until a license + files exist.
 * - WT Garamono — intended caps micro-labels; BIZ UD Mincho stands in.
 * - Necto Mono — intended tiny date labels; BIZ UD Mincho stands in.
 * Swap the three mono role values below when the licensed files arrive.
 */
export const font = {
  /** Handwriting stand-in for the eventual handwritten contemplation images. */
  hand: 'Daniel-Regular',
  mono: 'BIZUDMincho-Regular', // stand-in for HAL Timezone Mono Book
  monoBold: 'BIZUDMincho-Bold',
  monoLabel: 'BIZUDMincho-Regular', // stand-in for WT Garamono Regular
  monoTiny: 'BIZUDMincho-Regular', // stand-in for Necto Mono Regular
  display: 'Inter-Bold',
  displayItalic: 'Inter-Bold',
  grotesk: 'Inter-Regular',
  groteskBold: 'Inter-Bold',
} as const;

// Palette extracted from the Figma DESIGN SYSTEM + JUL 30 DESIGNS pages.
export const color = {
  // Paper & ink
  ink: '#272b18', // deep olive ink — also THE dark surface per the Jul 30 screens
  paper: '#eaeae2', // light screen surface
  sage: '#dbdbcf', // secondary light surface (menu band, disabled fills)
  muted: '#726a57', // muted taupe text on light surfaces
  faint: '#d9d9c7', // input-field fill
  line: '#d8d2c2',
  // Dark surfaces (contemplation spaces)
  dark: '#272b18',
  darkElevated: '#4b4f3b',
  onDark: '#fbfbf6', // near-white cream on dark
  onDarkMuted: '#a89f8c',
  // Accents
  accent: '#6a6c36', // olive
  accentBright: '#99b955',
  /** NO RED rule (Kat, Jul 24): destructive/crisis = ink + weight + words. */
  danger: '#272b18',
  success: '#4a5a2e',
  successBg: '#e4e6d2',
  // Taupe overlay surfaces (paused / rating dialog / signed-out)
  overlay: '#726a57',
  overlayElevated: '#726a57',
  overlayBackdrop: '#a89f8c',
  onOverlay: '#fbfbf6',
  progress: '#6a6c36', // AA on progressBg
  progressBg: '#eae8d2',
  locked: '#9c9586', // disabled / locked content (per DS disabled buttons)
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
  /** DS "Heading 03": Inter Bold 20, sentence case. */
  heading: {
    fontFamily: font.groteskBold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.2, // -1%
  },
  body: { fontFamily: font.grotesk, fontSize: 15, lineHeight: 23, letterSpacing: -0.15 }, // -1%
  bodyBold: { fontFamily: font.groteskBold, fontSize: 15, lineHeight: 23, letterSpacing: -0.15 }, // -1%
  small: { fontFamily: font.grotesk, fontSize: 13, lineHeight: 19, letterSpacing: -0.13 }, // -1%
  caption: { fontFamily: font.grotesk, fontSize: 11, lineHeight: 15, letterSpacing: -0.11 }, // -1%
  /** DS "Mono Label": 12px, all caps, +3% tracking. */
  label: {
    fontFamily: font.monoLabel,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.36, // +3%
    textTransform: 'uppercase' as const,
  },
  /** Jul 30 designs: the contemplation question speaks in the typewriter mono. */
  contemplation: { fontFamily: font.mono, fontSize: 22, lineHeight: 36, letterSpacing: -0.88 }, // -4% (mono)
  /** DS "Display heading" / "Title 02": Inter Bold, sentence/lower case. */
  displayLower: { fontFamily: font.groteskBold, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  titleLower: { fontFamily: font.groteskBold, fontSize: 26, lineHeight: 31, letterSpacing: -0.52 },
  /** DS "Mono Medium" (HAL Timezone role): brand statements, quotes, prompts outside the player. */
  monoBody: { fontFamily: font.mono, fontSize: 16, lineHeight: 25, letterSpacing: -0.64 },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Print-like: sharp corners, stamped shapes. DS canon: 2px corners everywhere. */
export const radius = {
  sm: 2,
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

/** Rating-prompt logic — tune freely; RatingPrompt.tsx reads these. */
export const review = {
  minCompletions: 3,
  cooldownDays: 14,
  maxAsks: 2,
} as const;

export const limits = {
  diaryMaxWords: 150,
  voiceMaxSeconds: 60,
} as const;
