-- Adds a like counter to blog_posts and an atomic increment/decrement function.
-- Run this once in the Supabase SQL editor for this project.

ALTER TABLE blog_posts ADD COLUMN likes INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_post_likes(post_slug TEXT, delta INT)
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE blog_posts
  SET likes = GREATEST(0, likes + delta)
  WHERE slug = post_slug
  RETURNING likes INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
