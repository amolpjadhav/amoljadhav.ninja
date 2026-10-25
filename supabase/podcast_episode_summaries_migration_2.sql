-- Story-driven summary fields (see lib/podcast-episode-summary.ts).
-- Run once in the Supabase SQL editor AFTER supabase/podcast_episode_summaries.sql.
-- Old rows (tldr/takeaways shape) should be deleted and regenerated: their
-- chapters predate the transcript-span checks.

alter table public.podcast_episode_summaries
  add column if not exists hook text not null default '',
  add column if not exists story text not null default '',
  add column if not exists key_ideas jsonb not null default '[]',
  add column if not exists concepts jsonb not null default '[]',
  add column if not exists worth_it_for text not null default '';
