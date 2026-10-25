-- Play-counts for the Classic Games arcade (hub article + six games).
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Service-role only: RLS is enabled with no policies, so the anon key
-- (and browsers) can never read or write this table. Hub cards read
-- counts through GET /api/games/views and play pages increment through
-- POST /api/games/[slug]/view, both using the service key.
-- The 'hub' slug counts visits to the Classic Games article itself.

create table if not exists public.game_views (
  slug text primary key,
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.game_views enable row level security;

create or replace function public.increment_game_views(game_slug text)
returns bigint
language plpgsql
security definer
as $$
declare
  new_count bigint;
begin
  insert into public.game_views (slug, views)
  values (game_slug, 1)
  on conflict (slug)
  do update set views = public.game_views.views + 1, updated_at = now()
  returning public.game_views.views into new_count;
  return new_count;
end;
$$;
