-- Full-episode AI summaries from real podcast transcripts
-- (see lib/podcast-transcript.ts, lib/podcast-episode-summary.ts).
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Service-role only: RLS is enabled with no policies, so the anon key
-- (and browsers) can never read or write this table. Episode pages read
-- rows through /api/podcasts/episodes, which uses the service key.
-- Summaries are written once per video and never refreshed: a transcript
-- is immutable, so the cache never goes stale. Raw transcripts are never
-- stored — only the summary JSON below.

create table if not exists public.podcast_episode_summaries (
  video_id text primary key,
  show text not null,
  title text not null,
  tldr text not null,
  takeaways jsonb not null default '[]',
  chapters jsonb not null default '[]',
  moments jsonb not null default '[]',
  people jsonb not null default '[]',
  transcript_source text not null default 'rss',
  hook text not null default '',
  story text not null default '',
  story_sections jsonb not null default '[]',
  key_ideas jsonb not null default '[]',
  concepts jsonb not null default '[]',
  worth_it_for text not null default '',
  model text not null default '',
  prompt_tokens integer not null default 0,
  output_tokens integer not null default 0,
  chunks integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.podcast_episode_summaries enable row level security;
