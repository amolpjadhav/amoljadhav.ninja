// Server-only data loaders for the homepage: Tools row (strip, episodes)
// plus the hero terminal's this-day-in-history feed. Never imported by
// node tests (extensionless sibling imports).
import { mostWatched, trendingNow } from '@/lib/podcasts';
import { getMarketStrip } from '@/lib/stocks';
import { memoizeTtl, toStripItems, toTopEpisode } from '@/lib/homepage';
import { getPool } from '@/lib/podcast-pool';
import { calProgressLine, pickHistoryEvents, type Fortune, type HistoryEvent } from '@/lib/terminal-scenes';

export const getStrip = memoizeTtl(5 * 60 * 1000, async () => {
  const { strip } = await getMarketStrip({ timeoutMs: 6000 });
  return toStripItems(strip);
});

// One memoized YouTube fan-out shared by the Tools card and both podcast
// API routes — every surface ranks the same pool.
const getLists = async () => {
  const pool = await getPool().catch(() => null);
  if (!pool) return null;
  const now = Date.now();
  return { trending: trendingNow(pool, now), mostWatched: mostWatched(pool, now) };
};

export const getEpisode = async () => toTopEpisode((await getLists())?.trending[0]);

// Reduced-motion snapshot, picked per request: a random fortune plus the
// year line. Plain loader (not render) so randomness is lint-clean.
export function snapshotFor(fortunes: Fortune[]): { fortune: Fortune; cal: string } {
  return {
    fortune: fortunes[Math.floor(Math.random() * fortunes.length)] ?? { text: 'No fortunes today.' },
    cal: calProgressLine(Date.now()),
  };
}

// Wikipedia On This Day, fetched once per day for the terminal's history
// scene. Empty (never throwing) when the feed is down — the scene drops.
export const getHistoryEvents = memoizeTtl(
  24 * 3600 * 1000,
  async (): Promise<HistoryEvent[]> => {
    try {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'amoljadhav-ninja/1.0 (hero-terminal)',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const raw: unknown = await res.json();
      const events = (raw as { events?: unknown } | null)?.events;
      return pickHistoryEvents(events);
    } catch {
      return [];
    }
  },
);
