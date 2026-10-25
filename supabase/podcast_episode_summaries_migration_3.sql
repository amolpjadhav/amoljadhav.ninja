-- Story sections (story split by chapter with headings), replacing the
-- single story blob for sectioned rendering.
-- Run once in the Supabase SQL editor AFTER migration 2.

alter table public.podcast_episode_summaries
  add column if not exists story_sections jsonb not null default '[]';
