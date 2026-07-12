-- Adds a subscribers table for email sign-ups on the blog.
-- Run this once in the Supabase SQL editor for this project.

CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Row Level Security: the public can insert (subscribe), but nobody can
-- read the list through the public API — only the service role (used by
-- scripts/list-subscribers.mjs and server-side API routes) can see it.
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);
