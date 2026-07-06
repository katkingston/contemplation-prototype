/**
 * Series content — verbatim from the V1 copy doc ("Contemplations" tab).
 * Series length is data-driven: a series has as many contemplations as this
 * array holds. NOTHING in the app may assume a fixed length.
 * `videoUri: null` means the player renders the generated gradient artwork;
 * dropping in real video loops later is purely a data edit here.
 */

export interface Contemplation {
  id: string;
  /** 0-based order within the series. */
  sequenceIndex: number;
  prompt: string;
  /** One-or-two-word teaser shown BEFORE completion — the prompt itself stays hidden until done. */
  hint: string;
  videoUri: string | null;
  /** Gradient artwork stops for this contemplation (generated placeholder). */
  gradient: [string, string];
}

export interface Series {
  id: string;
  /** 1-based display order; also gating order (a series unlocks when the prior one completes). */
  displayOrder: number;
  /** Category tag shown in place of series numbers (catalog will keep growing). */
  tag: string;
  title: string;
  theme: string;
  introSlides: string[];
  contemplations: Contemplation[];
  wrapSlides: string[];
  /** Alternate questions offered when replaying the series. */
  altQuestions: string[];
  isPublished: boolean;
}

function mk(
  seriesId: string,
  prompts: string[],
  stops: [string, string][],
  hints: string[],
): Contemplation[] {
  return prompts.map((prompt, i) => ({
    id: `${seriesId}-c${i + 1}`,
    sequenceIndex: i,
    prompt,
    hint: hints[i] ?? 'Reflection',
    videoUri: null,
    gradient: stops[i % stops.length],
  }));
}

export const SERIES: Series[] = [
  {
    id: 's1-impermanence',
    tag: 'Impermanence',
    displayOrder: 1,
    title: 'Becoming Aware of Impermanence',
    theme:
      'Gentle awareness that life changes, moments pass, and everyday experiences are temporary.',
    introSlides: [
      'Everything changes.',
      'Moments pass, people grow, routines shift, and seasons come and go.',
      'By noticing the temporary nature of everyday experiences…',
      'We can begin to appreciate them more deeply while they are here.',
    ],
    contemplations: mk(
      's1-impermanence',
      [
        'What simple experience in your life might someday become a cherished memory?',
        'What is something from your past that you did not realize was precious until it was gone?',
        'What is one thing you often assume will always be there?',
        'If today could not be repeated, what would make it meaningful?',
        'What part of your daily routine would you miss if it suddenly disappeared?',
        'What small part of life feels especially precious to you right now?',
        'What moment from this week do you wish you had paid more attention to?',
      ],
      [
        ['#232619', '#4c5232'],
        ['#1f241a', '#5a6136'],
        ['#262b1c', '#6f7036'],
        ['#20261b', '#43522e'],
        ['#282e1e', '#767c3f'],
        ['#1d221a', '#515a30'],
        ['#242a1b', '#5f6633'],
      ],
    ['Small joys', 'Lost things', 'Taken for granted', 'Unrepeatable day', 'Daily rhythm', 'Precious now', 'Passing moments'],
    ),
    wrapSlides: [
      'Awareness of impermanence is not meant to make life feel smaller.',
      'It can help ordinary experiences feel richer, more meaningful, and more alive.',
      'There is nothing to solve.',
    ],
    altQuestions: [
      'What are you rushing through that deserves to be experienced more fully?',
      'What has ended in your life that ultimately taught you something important?',
      'What are you holding onto that is already changing?',
      'What would become clearer if you remembered that nothing lasts forever?',
      'What loss helped you recognize what truly matters?',
    ],
    isPublished: true,
  },
  {
    id: 's2-connection',
    tag: 'Connection',
    displayOrder: 2,
    title: 'Deepening Appreciation and Connection',
    theme: 'Connect awareness of impermanence to gratitude and relationships.',
    introSlides: [
      'When we remember that life is temporary…',
      'Relationships often come into sharper focus',
      'The people we care about become less ordinary and more precious',
      'This is your invitation to reflect on these meaningful connections',
    ],
    contemplations: mk(
      's2-connection',
      [
        'What do you spend time on that does not truly matter to you?',
        'Who in your life do you most appreciate, but least often express it to?',
        'What distractions keep you from fully experiencing your life?',
        'If someone you loved disappeared tomorrow, what would you regret not saying?',
        'If you were suddenly gone, who do you think would miss you most deeply, and why?',
        'What would become more precious if you knew it would not last?',
        'If someone you care about could only remember one moment they shared with you this week, what would you hope it would be?',
      ],
      [
        ['#2b1815', '#6e2a24'],
        ['#301a16', '#7d332b'],
        ['#271512', '#5f2620'],
        ['#331d17', '#8a3f31'],
        ['#2b1512', '#743028'],
        ['#361f19', '#94493a'],
        ['#241210', '#66281f'],
      ],
    ['Time spent', 'Unspoken thanks', 'Distractions', 'Unsaid words', 'Being missed', 'Fleeting bonds', 'One moment'],
    ),
    wrapSlides: [
      'This week you explored what and who matters most',
      'As you reflected on appreciation and connection',
      'You may have found meaning in the impact you have on others',
    ],
    altQuestions: [
      'What would living more intentionally look like for you today?',
      'Who has shaped your life in ways they may not fully realize?',
      'What expression of love or gratitude are you postponing?',
      'Who do you need to listen to more deeply?',
      'What relationship in your life deserves more care or honesty?',
      'When was the last time you felt truly seen by another person?',
      'What unfinished conversation have you been avoiding?',
      'How does awareness of your own mortality deepen your compassion for others?',
    ],
    isPublished: true,
  },
  {
    id: 's3-fear-identity',
    tag: 'Identity',
    displayOrder: 3,
    title: 'Exploring Fear and Identity',
    theme: 'Gently introducing emotional and existential reflection.',
    introSlides: [
      'Thoughts about death often bring us face-to-face with deeper questions',
      'Questions about meaning, purpose, fear, and who we are',
      'This week invites gentle exploration of those questions',
      'Approach each contemplation with kindness and curiosity rather than judgment',
    ],
    contemplations: mk(
      's3-fear-identity',
      [
        'What emotions arise when you think about death or impermanence?',
        'What aspect of death feels most difficult or unknown to you?',
        'What helps you feel grounded when life feels uncertain?',
        'If you were remembered for one quality, what would you hope it would be?',
        'What gives your life a sense of meaning right now?',
        'How does knowing that life is finite influence the way you think about today?',
        'What fear would you like to make peace with?',
      ],
      [
        ['#221c16', '#57503f'],
        ['#261f18', '#635a45'],
        ['#1e1913', '#4a4436'],
        ['#292219', '#6f6650'],
        ['#221b14', '#5b523f'],
        ['#2d251b', '#7a7158'],
        ['#1f1a14', '#514a39'],
      ],
    ['What arises', 'The unknown', 'Groundedness', 'One quality', 'Meaning', 'Finitude', 'Making peace'],
    ),
    wrapSlides: [
      'This week you practiced turning toward difficult questions rather than away from them',
      'That takes courage',
      'Awareness creates space for choice',
      'You have already begun clarifying how you want to live',
    ],
    altQuestions: [
      'What fear most prevents you from living fully or honestly?',
      'If your life ended sooner than expected, what would feel complete?',
      'What would you regret if you continued living exactly as you are now for the next ten years?',
      'What would become more precious if you knew it would not last?',
      'What does it mean to you to live a good life?',
    ],
    isPublished: true,
  },
  {
    id: 's4-intention',
    tag: 'Intention',
    displayOrder: 4,
    title: 'Living With Greater Intention',
    theme: 'Integrating mortality awareness into purposeful living.',
    introSlides: [
      'Mortality awareness is not really about death',
      'It is about life',
      'This week invites you to reflect on the life you want to create',
      'And the impact you hope to have while you are here',
    ],
    contemplations: mk(
      's4-intention',
      [
        'What feels meaningful enough that you would continue doing it even if no one noticed?',
        'What part of your life feels too important to postpone?',
        'What wisdom would you want to pass on to someone you love?',
        'What values do you want your daily actions to reflect?',
        'If you learned you had one year left to live, what would you spend more time doing?',
        'What would you like to be remembered for beyond your accomplishments?',
        'How do you hope people experience you when you are with them?',
      ],
      [
        ['#2c2e17', '#7f8f3d'],
        ['#31331a', '#8fa348'],
        ['#282a15', '#6f7f33'],
        ['#353721', '#99b955'],
        ['#2c2e17', '#87963f'],
        ['#383a20', '#a3b95a'],
        ['#262813', '#657529'],
      ],
    ['Unseen devotion', 'No postponing', 'Passing wisdom', 'Daily values', 'One year', 'Remembrance', 'Presence'],
    ),
    wrapSlides: [
      'Over the past four weeks…',
      'You have spent time reflecting on impermanence',
      'Relationships',
      'Meaning',
      'And purpose',
      'Live more fully',
      'More intentionally',
      'And with a deeper appreciation for the life that is already unfolding around you',
    ],
    altQuestions: [
      'What unfinished conversation would matter most to complete?',
      'What kind of legacy do you hope your daily actions create?',
      'What are you waiting for permission to begin?',
      'What matters most to you that receives the least amount of your time?',
      'What are you saying yes to that takes you away from what is most important?',
      'How would you spend today if success were not the goal?',
    ],
    isPublished: true,
  },
];

/**
 * Introductory contemplations — the ungated taste shown during onboarding,
 * before any purchase or account. Gentle, universal, no mortality framing yet.
 * The onboarding flow serves the first; the rest are available for rotation
 * or a future multi-day intro experience.
 */
export const INTRO_CONTEMPLATIONS: Contemplation[] = [
  {
    id: 'intro-1',
    sequenceIndex: 0,
    hint: 'What remains',
    prompt: 'What is present in your life right now that you would miss if it were gone tomorrow?',
    videoUri: null,
    gradient: ['#242a1b', '#6f7036'],
  },
  {
    id: 'intro-2',
    sequenceIndex: 1,
    hint: 'Full presence',
    prompt: 'When did you last feel fully present, and what made that moment different?',
    videoUri: null,
    gradient: ['#20261b', '#5a6136'],
  },
  {
    id: 'intro-3',
    sequenceIndex: 2,
    hint: 'Slowing down',
    prompt: 'What are you moving too quickly past that deserves a longer look?',
    videoUri: null,
    gradient: ['#262b1c', '#4c5232'],
  },
];

/** Back-compat alias: the single intro contemplation used by onboarding. */
export const FREE_CONTEMPLATION: Contemplation = INTRO_CONTEMPLATIONS[0];

export function getSeries(id: string): Series | undefined {
  return SERIES.find((s) => s.id === id);
}

export function orderedSeries(): Series[] {
  return [...SERIES].filter((s) => s.isPublished).sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Length of a series — ALWAYS via this, never a constant. */
export function seriesLength(s: Series): number {
  return s.contemplations.length;
}
