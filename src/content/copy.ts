/**
 * App copy — verbatim from the V1 copy doc and approved wireframe rounds.
 * Hard rule (App-CLAUDE.md): keep disclaimer and crisis copy exactly as
 * written unless the owner changes it.
 */
import { APP_NAME } from '@/theme/tokens';

export const disclaimer = {
  title: APP_NAME,
  subtitle: 'A daily contemplation practice',
  paragraphs: [
    'This app explores themes of impermanence and mortality through daily contemplative practice. Content is offered for educational and reflective purposes only.',
    'This app is not a form of therapy, grief counseling, or medical treatment, and is not a substitute for professional mental health or medical care.',
    'If you are experiencing emotional distress, a mental health crisis, or thoughts of self-harm, please reach out for support.',
    'By continuing, you confirm you are 12 years of age or older and have read this notice.',
  ],
  resourcesButton: 'Mental Health Resources',
  continueButton: 'I Understand · Continue',
} as const;

export interface ResourceLink {
  label: string;
  detail: string;
  url: string | null;
  /** tel:/sms: link for one-tap contact — crisis surfaces must be tappable. */
  tel?: string;
}

export const mentalHealthResources: ResourceLink[] = [
  {
    label: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988 (US) · 988lifeline.org',
    url: 'https://988lifeline.org/',
    tel: 'tel:988',
  },
  {
    label: 'Crisis Text Line',
    detail: 'Text HOME to 741741 (US)',
    url: 'https://www.crisistextline.org/',
    tel: 'sms:741741',
  },
  {
    label: 'The Mental Health & Grief Hotline',
    detail: 'Call (866) 903-3787',
    url: null,
    tel: 'tel:+18669033787',
  },
  {
    label: 'GriefShare support groups',
    detail: 'griefshare.org',
    url: 'https://www.griefshare.org/',
  },
  {
    label: 'Compassionate Friends grief support',
    detail: 'compassionatefriends.org',
    url: 'https://www.compassionatefriends.org/find-support/',
  },
  {
    label: 'Psychology Today therapist finder',
    detail: 'psychologytoday.com/us/therapists',
    url: 'https://www.psychologytoday.com/us/therapists',
  },
  {
    label: 'Headway therapist finder',
    detail: 'provider.headway.co',
    url: 'https://provider.headway.co/',
  },
];

export const resourcesFootnote = `${APP_NAME} is not affiliated with any of the above organizations. These resources are provided for informational purposes only.`;

export const instructions = {
  title: 'How to contemplate',
  intro:
    'Set your in-app timer. Spend as much time as you like.\nTo get started, we recommend:',
  steps: [
    'Read the contemplation, then sit with your initial thoughts for 1–2 minutes.',
    'Read it again. Notice which words draw your attention, stay with those for 1–2 minutes.',
    'Read it a third time. Reflect on how these thoughts might be showing up in your relationships or choices.',
  ],
  outro:
    'The videos and artwork are there to spark curiosity. Sit with what arises, then when ready, use the thought diary to write, or voice-record your insights, follow what feels right.',
} as const;

export const journalHelp = {
  title: 'Your Thought Diary',
  paragraphs: [
    'Write or speak freely, there are no right answers.',
    'Your reflections are saved to your private bank and revealed back to you when you complete the series.',
    'If you return to a contemplation you have reflected on before, your past reflection will be shown.',
  ],
} as const;

export const paywall = {
  headline: 'Live more fully in the face of impermanence',
  subhead:
    'A daily practice that turns mortality from a source of fear into one of clarity, gratitude, and presence.',
  trialTitle: 'Start with 3 days free',
  // Verbatim from the Jul 30 paywall design.
  trialNote:
    'No charge today · payment confirmed now, billed only after trial. Cancel anytime in Subscription.',
  cta: 'Start free trial',
} as const;

export type ProductType = 'series_pack' | 'monthly' | 'annual';

export interface Plan {
  productType: ProductType;
  title: string;
  price: string;
  detail: string;
  /** Small boxed tag next to the title ("Save 66%"), Jul 30 designs. */
  badge?: string;
}

/**
 * Introductory deal (recommendation, implemented): ONE intro offer — a 3-day
 * free trial on the ANNUAL plan (Apple allows a single intro offer per
 * subscription; trials outconvert discounts in wellness). The $7.99 series
 * pack is the low-commitment entry, so no extra discounting at launch.
 */
// Plan copy per the Jul 30 paywall design. NOTE (Aug 14): a "pack" unlocks ONE
// CHAPTER of Series 1, per Kat — the label follows that rather than the old
// four-separate-series framing.
export const plans: Plan[] = [
  { productType: 'series_pack', title: 'Single Chapter Pack', price: '$7.99', detail: 'Try without committing' },
  { productType: 'monthly', title: 'Monthly', price: '$21.99 / month', detail: '30 days of all-access' },
  { productType: 'annual', title: 'Annual', price: '$89.99 / year', detail: '$7.50 / mo equivalent', badge: 'Save 66%' },
];

export const intakeQuestions = [
  {
    id: 'mortality_frequency',
    prompt: 'How often do you think about your own mortality?',
    kind: 'scale' as const,
    min: 1,
    max: 5,
    minLabel: 'Never',
    maxLabel: 'Multiple times a day',
  },
  {
    id: 'comfortable_talking_to',
    prompt: 'Who do you feel comfortable talking to about death and dying?',
    kind: 'multi' as const,
    options: [
      'Friends',
      'Family',
      'Doctors',
      'No One',
      'Anyone',
      'Spiritual / Religious Leader',
      'Mental Health Professional / Counselor',
      'Other',
    ],
  },
  {
    id: 'fear_of_dying',
    prompt: 'How afraid are you of dying?',
    kind: 'scale' as const,
    min: 1,
    max: 10,
    minLabel: '1',
    maxLabel: '10',
  },
  {
    id: 'motivation',
    prompt: 'What makes you want to engage with this content?',
    kind: 'text' as const,
  },
];

/** Series-completion survey mirrors the intake instrument to measure change. */
export const surveyQuestions = intakeQuestions.map((q) => ({ ...q, id: `survey_${q.id}` }));

/** One quality-of-life question asked at the end of the series wrap-up. */
export const qualityOfLifeQuestion = {
  id: 'qol_overall',
  prompt: 'Compared to when you began this series, life feels…',
  kind: 'scale' as const,
  min: 1,
  max: 5,
  minLabel: 'Worse',
  maxLabel: 'Better',
};

export const baselineIntro = {
  title: 'A quick baseline',
  body: 'Before you begin, we’ll capture a short baseline of where you are today. We’ll refer back to it later so you can see how your relationship with these themes changes.',
} as const;

export const dayExit = {
  title: 'See you tomorrow',
  body: 'Your reflection is saved. What you noticed today will keep working quietly, some of the most important parts of this practice happen after you put the phone down.',
  body2:
    'Carry today’s question with you. If it resurfaces during your day, let it, that’s the practice taking root.',
  body3:
    'Come back tomorrow for the next contemplation. If you miss a day, you’ll resume right where you left off.',
  /** One rotating closing line per day (indexed by day-of-practice). */
  closers: [
    'Nothing to solve. Just noticing.',
    'A minute of attention is never wasted.',
    'You showed up. That is the practice.',
    'Let today be a little more deliberate.',
    'Small awareness, repeated, becomes a way of living.',
  ],
} as const;

export const splashTagline =
  'Cultivate acceptance of impermanence and inspire you into a fuller engagement with life itself.';

/** Rotates daily. Death-awareness voices across traditions. */
export const QUOTES: { text: string; by: string }[] = [
  {
    text: 'You could leave life right now. Let that determine what you do and say and think.',
    by: 'Marcus Aurelius',
  },
  { text: 'Death is not the opposite of life, but a part of it.', by: 'Haruki Murakami' },
  { text: 'Let me not die while I am still alive.', by: 'Jewish proverb' },
  { text: 'The trouble is, you think you have time.', by: 'attributed to Buddhist teaching' },
  {
    text: 'To begin depriving death of its greatest advantage over us, let us deprive death of its strangeness.',
    by: 'Michel de Montaigne',
  },
];

export function dailyQuote(): { text: string; by: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400_000,
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
