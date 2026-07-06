/**
 * Learnings — editorial posts. Prototype content lives here; production
 * moves to the CMS/DB alongside series content. The first post is featured.
 */
export interface Post {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  minutes: number;
  gradient: [string, string];
  accent: string;
  paragraphs: string[];
}

export const POSTS: Post[] = [
  {
    id: 'why-contemplate-death',
    tag: 'Foundations',
    title: 'Why contemplate death at all?',
    excerpt:
      'Turning toward what we most avoid is one of the oldest practices in the world. Here is what the research and the traditions agree on.',
    minutes: 4,
    gradient: ['#232619', '#6f7036'],
    accent: '#99b955',
    paragraphs: [
      'Nearly every contemplative tradition arrives at the same instruction: remember that you will die. The Stoics carried the phrase memento mori. Buddhist monks practice maranasati, mindfulness of death. Medieval scholars kept skulls on their desks. These were not morbid habits. They were tools for waking up.',
      'Modern psychology has caught up with the intuition. Research on mortality awareness suggests that when we approach death reflectively, rather than avoiding it, the effect is not despair. It is clarity. Priorities reorganize themselves. Small resentments loosen. Gratitude for ordinary moments sharpens.',
      'Avoidance, on the other hand, has costs. Terror management research shows that unexamined fear of death quietly steers our behavior: what we buy, who we exclude, how we distract ourselves. The fear does not disappear when ignored. It just drives from the back seat.',
      'Contemplation is the practice of inviting it into the light, a few minutes at a time. Not to solve death, but to let its reality do what it has always done for people willing to look: make life feel less like a rehearsal.',
      'This app gives that practice a shape. One contemplation a day. A question worth sitting with. A place to leave a thought. The rest happens in your life, between sessions, which is exactly where it belongs.',
    ],
  },
  {
    id: 'how-to-sit-with-a-hard-question',
    tag: 'Practice',
    title: 'How to sit with a hard question',
    excerpt:
      'You do not need to answer a contemplation. You need to keep it company. A short guide to letting a question work on you.',
    minutes: 3,
    gradient: ['#2b1815', '#94493a'],
    accent: '#c9a288',
    paragraphs: [
      'A contemplation question is not a quiz. There is no correct answer waiting to be found, and finishing quickly is not the goal. The question is a companion for a few minutes, and its job is to show you where your attention goes.',
      'When the question lands, notice the first thing that arises. It might be a memory, a face, a flash of resistance. That first movement is information. You do not have to chase it or fix it. Just notice that it came.',
      'If nothing comes, that is also fine. Boredom, blankness, and restlessness are honest responses to questions about impermanence. Sitting through them, without reaching for your phone, is the practice working.',
      'When the timer ends, write or speak whatever is true. One sentence is enough. The reflections you leave are hidden until the series completes, so there is no audience to perform for. Not even future you, yet.',
      'Then let it go. The question will keep working after you stand up. If it resurfaces while you make dinner or wait in traffic, that is not a distraction from the practice. That is the practice, taking root.',
    ],
  },
];

export function getPost(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}
