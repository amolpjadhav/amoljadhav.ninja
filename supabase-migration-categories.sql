-- Adds a category to blog_posts for grouping articles by topic (AI, Gaming, etc).
-- Run this once in the Supabase SQL editor for this project.

ALTER TABLE blog_posts ADD COLUMN category TEXT;

CREATE INDEX idx_blog_posts_category ON blog_posts(category);

-- Backfill existing posts based on their current topic/tags.
-- Adjust these before running if any of the groupings don't look right.
UPDATE blog_posts SET category = 'AI' WHERE slug IN (
  'ai-made-code-cheap-verification-just-got-expensive',
  'when-ai-codes-the-future-what-becomes-of-human-ingenuity',
  'what-stands-in-the-way-of-agi-the-looming-energy-crisis'
);

UPDATE blog_posts SET category = 'Gaming' WHERE slug IN (
  'teamfight-tactics-tftitems-your-super-simple-guide-to-gearing-up-your-champions'
);

UPDATE blog_posts SET category = 'Travel' WHERE slug IN (
  'running-through-history-10ks-in-europes-greatest-cities'
);

UPDATE blog_posts SET category = 'Engineering' WHERE slug IN (
  'the-power-of-2-in-computer-science-fundamentals',
  'understanding-sharding-scaling-databases-horizontally',
  'message-queues-the-backbone-of-scalable-software-systems',
  'hashing-101-from-passwords-to-blockchain',
  'java-garbage-collection-explained'
);
