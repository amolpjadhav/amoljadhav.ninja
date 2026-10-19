// Server-only Supabase store for the podcast episode pool. Only type-only
// sibling imports (erased at runtime), so node scripts import it with an
// explicit .ts extension while Next resolves normally. Service key only:
// the table has no anon policy, so browsers can never touch it.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ScoredInput } from './podcasts';

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('missing Supabase env');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface EpisodeRow {
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel: string;
  channel_thumb: string | null;
  genre: string;
  published_at: string;
  views: number;
  likes: number | null;
  duration_sec: number | null;
  thumbnail: string | null;
  url: string;
  views_updated_at: string;
}

// YouTube text occasionally carries lone surrogates (broken emoji), which
// Postgres rejects with 22P02. Replace unpaired halves with U+FFFD.
export function cleanText(s: string): string {
  return s
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '�')
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�');
}

function toRow(ep: ScoredInput): EpisodeRow {
  return {
    video_id: ep.videoId,
    title: cleanText(ep.title),
    description: cleanText(ep.description ?? ''),
    channel_id: ep.channelId,
    channel: cleanText(ep.channel),
    channel_thumb: ep.channelThumb ?? null,
    genre: ep.genre,
    published_at: ep.publishedAt,
    views: ep.views,
    likes: ep.likes ?? null,
    duration_sec: ep.durationSec ?? null,
    thumbnail: ep.thumbnail ?? null,
    url: ep.url,
    views_updated_at: new Date().toISOString(),
  };
}

function toEpisode(row: EpisodeRow): ScoredInput {
  return {
    videoId: row.video_id,
    title: row.title,
    channelId: row.channel_id,
    channel: row.channel,
    publishedAt: row.published_at,
    views: row.views,
    likes: row.likes ?? undefined,
    durationSec: row.duration_sec ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    url: row.url,
    description: row.description || undefined,
    genre: row.genre,
    channelThumb: row.channel_thumb ?? undefined,
  };
}

export async function readPool(): Promise<ScoredInput[]> {
  // PostgREST caps one response at 1000 rows (Supabase max-rows default):
  // page through so history is never silently truncated.
  const rows: EpisodeRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin().from('podcast_episodes').select('*').range(from, from + 999);
    if (error) throw error;
    const batch = (data ?? []) as EpisodeRow[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows.map(toEpisode);
}

// Exact row count via paged key-only scan (avoids PostgREST max-rows cap).
export async function countRows(): Promise<number> {
  let n = 0;
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin()
      .from('podcast_episodes')
      .select('video_id')
      .range(from, from + 999);
    if (error) throw error;
    n += (data ?? []).length;
    if ((data ?? []).length < 1000) break;
  }
  return n;
}

export async function existingIds(ids: string[]): Promise<Set<string>> {
  const found = new Set<string>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await admin()
      .from('podcast_episodes')
      .select('video_id')
      .in('video_id', ids.slice(i, i + 200));
    if (error) throw error;
    for (const row of (data ?? []) as { video_id: string }[]) found.add(row.video_id);
  }
  return found;
}

export async function upsertEpisodes(eps: ScoredInput[]): Promise<void> {
  for (let i = 0; i < eps.length; i += 500) {
    const { error } = await admin()
      .from('podcast_episodes')
      .upsert(
        eps.slice(i, i + 500).map(toRow),
        { onConflict: 'video_id' },
      );
    if (error) throw error;
  }
}

// Refresh-throttle clock: single 'pool' row stamped by whoever runs the
// YouTube fan-out, so N instances share a few refreshes a day.
export async function getLastRefresh(): Promise<string | null> {
  const { data, error } = await admin()
    .from('podcast_refresh_state')
    .select('refreshed_at')
    .eq('key', 'pool')
    .limit(1);
  if (error) throw error;
  const row = (data ?? [])[0] as { refreshed_at?: unknown } | undefined;
  return typeof row?.refreshed_at === 'string' ? row.refreshed_at : null;
}

export async function setLastRefresh(iso: string): Promise<void> {
  const { error } = await admin()
    .from('podcast_refresh_state')
    .upsert({ key: 'pool', refreshed_at: iso }, { onConflict: 'key' });
  if (error) throw error;
}

export async function setLastRefreshNow(): Promise<void> {
  return setLastRefresh(new Date().toISOString());
}

// Views-only refresh for known rows (partial upsert leaves other columns).
export async function updateViews(counts: Map<string, number>): Promise<void> {
  const rows = [...counts].map(([video_id, views]) => ({
    video_id,
    views,
    views_updated_at: new Date().toISOString(),
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin().from('podcast_episodes').upsert(rows.slice(i, i + 500), { onConflict: 'video_id' });
    if (error) throw error;
  }
}
