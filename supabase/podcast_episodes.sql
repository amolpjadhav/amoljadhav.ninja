-- History store for the podcast episode pool (see lib/podcast-store.ts).
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Service-role only: RLS is enabled with no policies, so the anon key
-- (and browsers) can never read or write this table.

create table if not exists public.podcast_episodes (
  video_id text primary key,
  title text not null,
  description text not null default '',
  channel_id text not null,
  channel text not null,
  channel_thumb text,
  genre text not null,
  published_at timestamptz not null,
  views bigint not null,
  likes bigint,
  duration_sec integer,
  thumbnail text,
  url text not null,
  views_updated_at timestamptz not null
);

alter table public.podcast_episodes enable row level security;
