// Server-only shared YouTube episode pool: one hourly refresh serves the
// trending route, the person route, and the homepage. Never imported by
// node tests (extensionless sibling imports).
//
// History lives in Supabase (one-time backfill), so each refresh only
// pays for page 1 per channel, details for brand-new videos, and fresh views
// for the last 35 days — about half today's fan-out. If YouTube fails
// (outage, spent quota), refresh serves last-known DB rows so the page
// degrades instead of emptying; a direct fetch is the last resort.
import {
  CHANNELS,
  channelMeta,
  fetchChannelUploads,
  fetchEpisodePool,
  fetchVideoDetails,
  fetchViewCounts,
  selectRecentIds,
  type ScoredInput,
} from './podcasts';
import { existingIds, getLastRefresh, readPool, setLastRefreshNow, updateViews, upsertEpisodes } from './podcast-store';
import { memoizeTtl } from './homepage';
import { shouldRefresh } from './refresh-guard';

async function refreshPool(): Promise<ScoredInput[] | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;
  try {
    // Throttle shared across instances: serve the DB unless the last
    // fan-out is older than the window. Missing table/row fails open to
    // a refresh (pre-DDL behavior), never to an empty page.
    const last = await getLastRefresh().catch(() => null);
    if (!shouldRefresh(last, Date.now())) {
      const cached = await readPool().catch(() => []);
      if (cached.length > 0) return cached;
    }
    // Claim the window BEFORE fetching so concurrent instances skip
    // instead of stampeding; a crash just leaves data 6h stale.
    await setLastRefreshNow().catch(() => {});
    const meta = await channelMeta(apiKey);
    const perChannel = await Promise.all(
      CHANNELS.map(async (c) => {
        try {
          return await fetchChannelUploads(apiKey, c.id, 1, meta.uploads.get(c.id));
        } catch {
          return [] as string[];
        }
      }),
    );
    const ids = [...new Set(perChannel.flat())];
    const known = await existingIds(ids);
    const fresh = ids.filter((id) => !known.has(id));
    if (fresh.length > 0) {
      await upsertEpisodes(await fetchVideoDetails(apiKey, fresh, meta));
    }
    const pool = await readPool();
    const now = Date.now();
    const recent = selectRecentIds(pool, now);
    if (recent.length > 0) {
      const counts = await fetchViewCounts(apiKey, recent);
      if (counts.size > 0) {
        await updateViews(counts).catch(() => {});
        for (const ep of pool) {
          const v = counts.get(ep.videoId);
          if (v !== undefined) ep.views = v;
        }
      }
    }
    return pool;
  } catch {
    // YouTube down or quota spent: the DB copy is free and needs no quota,
    // so serve it stale rather than nothing (and skip a doomed refetch).
    const stale = await readPool().catch(() => []);
    if (stale.length > 0) return stale;
    const direct = await fetchEpisodePool(apiKey).catch(() => []);
    // Never resolve empty: the memoizer caches resolutions but rescues
    // rejections with stale memory, and routes retry failures in 60s.
    if (direct.length === 0) throw new Error('podcast pool unavailable: YouTube and DB both failed');
    return direct;
  }
}

export const getPool = memoizeTtl(60 * 60 * 1000, refreshPool);

// Descriptions match people server-side but never leave it: stripping keeps
// API payloads small (2KB × hundreds of episodes otherwise).
export function stripDescriptions<T extends { description?: string }>(eps: T[]): Omit<T, 'description'>[] {
  return eps.map((ep) => {
    const { description: _description, ...rest } = ep;
    void _description;
    return rest;
  });
}
