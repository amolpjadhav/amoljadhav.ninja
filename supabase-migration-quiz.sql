-- Adds an optional quiz to blog_posts for the "Quick Check" component —
-- a few multiple-choice questions rendered at the end of a post to
-- reinforce the concepts just covered. Nullable: most posts won't have one.
-- Run this once in the Supabase SQL editor for this project.

ALTER TABLE blog_posts ADD COLUMN quiz JSONB;

-- Shape (array of questions), stored per post:
-- [
--   {
--     "question": "...",
--     "options": ["...", "...", "...", "..."],
--     "correctIndex": 0,
--     "explanation": "..."
--   }
-- ]
