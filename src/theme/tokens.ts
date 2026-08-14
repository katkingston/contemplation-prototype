/**
 * Theme tokens — the single restyle point for the whole app.
 *
 * DESIGN DIRECTION (Figma DESIGN SYSTEM page, Jul 30 canon):
 * Literary small-press anthology — typography-led, print-like, analog.
 * Inter as the workhorse sans, HAL Timezone Mono as the typewriter body
 * voice, WT Garamono for caps micro-labels. Green-gray ground, deep olive
 * ink, taupe/sage neutrals, olive accent. NO RED anywhere. Soft airbrushed
 * gradients inside hard shapes; sharp 2px print-like corners.
 */

export const APP_NAME = 'Contemplate'; // chosen July 2026 (domain: contemplate.day)

/**
 * Brand fonts per the Figma DESIGN SYSTEM page (Jul 30 file):
 * - Inter (SIL OFL) — ALL sans roles: display, titles, body, buttons, tab bar.
 * - HAL Timezone Mono — the mono body voice. TRIAL FONT: Kat purchases the
 *   license before any public/App Store release (fine for the prototype).
 * - WT Garamono — caps micro-labels + tiny date labels (Necto Mono retired
 *   per Kat, Jul 31; BIZ UD Mincho fully retired).
 */
export const font = {
  /** Handwriting stand-in for the eventual handwritten contemplation images. */
  hand: 'Daniel-Regular',
  mono: 'HALTimezoneMono-Book',
  monoBold: 'HALTimezoneMono-Bold',
  monoLabel: 'WTGaramono-Regular',
  monoTiny: 'WTGaramono-Regular',
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
 * Type roles (DS canon, Jul 30):
 * - Inter: all sans roles — display/titles (Bold), body, buttons, tab bar.
 * - HAL Timezone Mono: the mono voice (contemplation, monoBody statements).
 * - WT Garamono: caps micro-labels (`label`) + tiny date labels.
 */
// Measured off the JUL 30 DESIGNS frames (390x844). Figma states line-height
// as a PERCENT of font size — every value below is that percent resolved to
// px, and tracking is the Figma percent × size. Do not round these by eye.
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
  /** Paywall "Start with 3 days free": Inter Bold 20 / 120%. */
  heading: {
    fontFamily: font.groteskBold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.6, // -3%
  },
  /** Body: Inter Regular 15 / 140%, no tracking. */
  body: { fontFamily: font.grotesk, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  bodyBold: { fontFamily: font.groteskBold, fontSize: 15, lineHeight: 21, letterSpacing: -0.45 }, // -3%
  /** Quiet/secondary link text: 15 / 130%. */
  bodyLink: { fontFamily: font.grotesk, fontSize: 15, lineHeight: 19.5, letterSpacing: 0 },
  small: { fontFamily: font.grotesk, fontSize: 13, lineHeight: 19, letterSpacing: 0 },
  /** Field labels ("Add time", "Select music"): Inter Regular 11 / 140%. */
  caption: { fontFamily: font.grotesk, fontSize: 11, lineHeight: 15.4, letterSpacing: 0 },
  /** Mono caps micro-label (WT Garamono): 12 / 160%, +5% tracking. */
  label: {
    fontFamily: font.monoLabel,
    fontSize: 12,
    lineHeight: 19.2,
    letterSpacing: 0.6, // +5%
    textTransform: 'uppercase' as const,
  },
  /** The contemplation question (C4 Player): HAL 16 / 160%. */
  contemplation: { fontFamily: font.mono, fontSize: 16, lineHeight: 25.6, letterSpacing: -0.32 }, // -2%
  /** Get Ready / Add Time title: Inter Bold 40 / 120%, -3%. */
  displayLower: { fontFamily: font.groteskBold, fontSize: 40, lineHeight: 48, letterSpacing: -1.2 },
  /** Screen titles ("Reflect", "Settings"): Inter Bold 26 / 120%, -3%. */
  titleLower: { fontFamily: font.groteskBold, fontSize: 26, lineHeight: 31.2, letterSpacing: -0.78 },
  /** Home hero title: Inter Bold 34 / 115%, -3% (smaller than Get Ready). */
  heroTitle: { fontFamily: font.groteskBold, fontSize: 34, lineHeight: 39.1, letterSpacing: -1.02 },
  /** Mono voice — "get ready to contemplate", "write here…", options: HAL 14 / 160%, -2%. */
  monoBody: { fontFamily: font.mono, fontSize: 14, lineHeight: 22.4, letterSpacing: -0.28 },
  /** Day-exit closing line: HAL 16 / 160%. */
  monoStatement: { fontFamily: font.mono, fontSize: 16, lineHeight: 25.6, letterSpacing: -0.32 },
} as const;

/**
 * Vertical anchors measured off the JUL 30 flow frames, in px from the TOP OF
 * THE SCREEN (the Figma 390x844 frame includes the status-bar area, so these
 * are applied as fixed padding rather than stacked on a safe-area inset).
 */
export const anchor = {
  monoHeader: 77, // mono code/date row
  lead: 229, // "get ready to contemplate" / "want to keep contemplating?"
  leadTitle: 300, // big lowercase title under the lead
  screenTitle: 240, // "Reflect"
  statement: 248, // player question / day-exit closing line
  optionLabelA: 507,
  optionRowA: 534,
  optionLabelB: 588,
  optionRowB: 615,
  bottomLinks: 757, // link row (Begin / Submit / Resume …)
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
