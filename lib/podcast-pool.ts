// Server-only shared YouTube episode pool: one hourly refresh serves the
// trending route, the person route, and the homepage. Never imported by
// node tests (extensionless sibling imports).
//
// History lives in Supabase (one-time backfill), so the hourly refresh only
// pays for page 1 per channel, details for brand-new videos, and fresh views
// for the last 35 days — about half today's fan-out. If the DB path fails
// (table missing, outage), refresh falls back to a direct fetch.
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
import { existingIds, readPool, updateViews, upsertEpisodes } from './podcast-store';
import { memoizeTtl } from './homepage';

async function refreshPool(): Promise<ScoredInput[] | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;
  try {
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
    return fetchEpisodePool(apiKey).catch(() => []);
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
