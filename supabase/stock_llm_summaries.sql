-- Cached AI overviews for stock lookup pages (see lib/stock-llm.ts).
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Service-role only: RLS is enabled with no policies, so the anon key
-- (and browsers) can never read or write this table. The lookup route reads
-- through /api/stocks/[ticker] with the service key; the nightly
-- /api/stocks/summaries job writes. One row per (ticker, filing, kind):
-- filings are immutable, so a cached rewrite never goes stale — a new 10-K
-- (new accession number) simply misses and gets rewritten.
create table if not exists public.stock_llm_summaries (
  ticker text not null,
  accession text not null,
  kind text not null default 'overview',
  text text not null,
  model text not null default '',
  prompt_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (ticker, accession, kind)
);

alter table public.stock_llm_summaries enable row level security;
