-- Adds a view counter to blog_posts and an atomic increment function.
-- Run this once in the Supabase SQL editor for this project.

ALTER TABLE blog_posts ADD COLUMN views INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE slug = post_slug
  RETURNING views INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
