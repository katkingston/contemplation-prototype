-- Generated from src/content/series.ts (July 2026) — run in the SQL editor.
-- Idempotent. Satisfies the FKs on diary_entries / user_progress / sessions;
-- the app still renders content from the bundle (full DB migration is a later phase).

insert into series (id, theme, title, display_order, is_published) values
  ('intro', 'Introduction', 'Introduction', 0, true),
  ('s1-impermanence', 'Gentle awareness that life changes, moments pass, and everyday experiences are temporary.', 'Becoming Aware of Impermanence', 1, true),
  ('s2-connection', 'Connect awareness of impermanence to gratitude and relationships.', 'Deepening Appreciation and Connection', 2, true),
  ('s3-fear-identity', 'Gently introducing emotional and existential reflection.', 'Exploring Fear and Identity', 3, true),
  ('s4-intention', 'Integrating mortality awareness into purposeful living.', 'Living With Greater Intention', 4, true)
on conflict (id) do update set title = excluded.title, theme = excluded.theme, is_published = true;

insert into contemplations (id, series_id, sequence_index, prompt) values
  ('intro-1', 'intro', 0, 'What is present in your life right now that you would miss if it were gone tomorrow?'),
  ('intro-2', 'intro', 1, 'When did you last feel fully present — and what made that moment different?'),
  ('intro-3', 'intro', 2, 'What are you moving too quickly past that deserves a longer look?'),
  ('s1-impermanence-c1', 's1-impermanence', 0, 'What simple experience in your life might someday become a cherished memory?'),
  ('s1-impermanence-c2', 's1-impermanence', 1, 'What is something from your past that you did not realize was precious until it was gone?'),
  ('s1-impermanence-c3', 's1-impermanence', 2, 'What is one thing you often assume will always be there?'),
  ('s1-impermanence-c4', 's1-impermanence', 3, 'If today could not be repeated, what would make it meaningful?'),
  ('s1-impermanence-c5', 's1-impermanence', 4, 'What part of your daily routine would you miss if it suddenly disappeared?'),
  ('s1-impermanence-c6', 's1-impermanence', 5, 'What small part of life feels especially precious to you right now?'),
  ('s1-impermanence-c7', 's1-impermanence', 6, 'What moment from this week do you wish you had paid more attention to?'),
  ('s2-connection-c1', 's2-connection', 0, 'What do you spend time on that does not truly matter to you?'),
  ('s2-connection-c2', 's2-connection', 1, 'Who in your life do you most appreciate, but least often express it to?'),
  ('s2-connection-c3', 's2-connection', 2, 'What distractions keep you from fully experiencing your life?'),
  ('s2-connection-c4', 's2-connection', 3, 'If someone you loved disappeared tomorrow, what would you regret not saying?'),
  ('s2-connection-c5', 's2-connection', 4, 'If you were suddenly gone, who do you think would miss you most deeply, and why?'),
  ('s2-connection-c6', 's2-connection', 5, 'What would become more precious if you knew it would not last?'),
  ('s2-connection-c7', 's2-connection', 6, 'If someone you care about could only remember one moment they shared with you this week, what would you hope it would be?'),
  ('s3-fear-identity-c1', 's3-fear-identity', 0, 'What emotions arise when you think about death or impermanence?'),
  ('s3-fear-identity-c2', 's3-fear-identity', 1, 'What aspect of death feels most difficult or unknown to you?'),
  ('s3-fear-identity-c3', 's3-fear-identity', 2, 'What helps you feel grounded when life feels uncertain?'),
  ('s3-fear-identity-c4', 's3-fear-identity', 3, 'If you were remembered for one quality, what would you hope it would be?'),
  ('s3-fear-identity-c5', 's3-fear-identity', 4, 'What gives your life a sense of meaning right now?'),
  ('s3-fear-identity-c6', 's3-fear-identity', 5, 'How does knowing that life is finite influence the way you think about today?'),
  ('s3-fear-identity-c7', 's3-fear-identity', 6, 'What fear would you like to make peace with?'),
  ('s4-intention-c1', 's4-intention', 0, 'What feels meaningful enough that you would continue doing it even if no one noticed?'),
  ('s4-intention-c2', 's4-intention', 1, 'What part of your life feels too important to postpone?'),
  ('s4-intention-c3', 's4-intention', 2, 'What wisdom would you want to pass on to someone you love?'),
  ('s4-intention-c4', 's4-intention', 3, 'What values do you want your daily actions to reflect?'),
  ('s4-intention-c5', 's4-intention', 4, 'If you learned you had one year left to live, what would you spend more time doing?'),
  ('s4-intention-c6', 's4-intention', 5, 'What would you like to be remembered for beyond your accomplishments?'),
  ('s4-intention-c7', 's4-intention', 6, 'How do you hope people experience you when you are with them?')
on conflict (id) do update set prompt = excluded.prompt, series_id = excluded.series_id;
