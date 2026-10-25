-- Cached AI summaries for trending podcast episodes (see lib/podcast-summary.ts).
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Service-role only: RLS is enabled with no policies, so the anon key
-- (and browsers) can never read or write this table. The widget reads
-- summaries through /api/podcasts/summaries, which uses the service key.
-- Summaries are written once per video and never refreshed: source text
-- (title + description) is immutable, so the cache never goes stale.

create table if not exists public.podcast_summaries (
  video_id text primary key,
  tldr text not null,
  bullets jsonb not null default '[]',
  moments jsonb not null default '[]',
  source text not null default 'description',
  model text not null default '',
  prompt_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.podcast_summaries enable row level security;
