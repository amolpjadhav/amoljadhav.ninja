-- Adds what's needed for the "notify subscribers on new post" feature:
-- a per-subscriber unsubscribe token, and a notified_at marker on posts
-- so the notify script won't accidentally email the same post twice.
-- Run this once in the Supabase SQL editor for this project.

ALTER TABLE subscribers ADD COLUMN unsubscribe_token UUID DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE blog_posts ADD COLUMN notified_at TIMESTAMP WITH TIME ZONE;
