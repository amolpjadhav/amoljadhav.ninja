-- Last-YouTube-refresh timestamp for the podcast pool. Routes refresh the
-- fan-out only when this is older than the window, so N serverless
-- instances share ~4 refreshes/day instead of each running its own.
-- Service key only (RLS on, no policies): browsers can never touch it.
create table if not exists public.podcast_refresh_state (
  key text primary key,
  refreshed_at timestamptz not null default now()
);

alter table public.podcast_refresh_state enable row level security;
