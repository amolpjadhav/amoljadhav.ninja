// Server-only data loaders for the homepage: Tools row (strip, episodes)
// plus hero terminal one-liners (post, cast, market, commit). Never
// imported by node tests (extensionless sibling imports).
import { supabaseAdmin } from '@/lib/supabase';
import { formatPerHour, mostWatched, timeAgo, trendingNow } from '@/lib/podcasts';
import { formatPct, getMarketStrip } from '@/lib/stocks';
import { memoizeTtl, stripHasMoves, toStripItems, toTopEpisode } from '@/lib/homepage';
import { getPool } from '@/lib/podcast-pool';
import {
  blogLine,
  castLine,
  filterCommitEntries,
  formatCommit,
  marketLine,
  pickMarketQuote,
  type CommitEntry,
} from '@/lib/terminal-scenes';

export const getStrip = memoizeTtl(5 * 60 * 1000, async () => {
  const { strip } = await getMarketStrip({ timeoutMs: 6000 });
  return toStripItems(strip);
});

// One memoized YouTube fan-out shared by the Tools card, the terminal, and
// both podcast API routes — every surface ranks the same hourly pool.
const getLists = async () => {
  const pool = await getPool().catch(() => null);
  if (!pool) return null;
  const now = Date.now();
  return { trending: trendingNow(pool, now), mostWatched: mostWatched(pool, now) };
};

export const getEpisode = async () => toTopEpisode((await getLists())?.trending[0]);

const getLatestPost = memoizeTtl(
  5 * 60 * 1000,
  async (): Promise<{ title: string; createdAt: string } | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('title, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) return null;
      const row = data[0] as { title?: unknown; created_at?: unknown };
      if (typeof row.title !== 'string' || typeof row.created_at !== 'string') return null;
      return { title: row.title, createdAt: row.created_at };
    } catch {
      return null;
    }
  },
);

export interface TerminalLines {
  blog: string | null;
  cast: string | null;
  market: string | null;
  commit: string | null;
}

// One output line per data scene, composed server-side; null drops the
// scene quietly. A flat strip reads as a dead feed, not a calm market,
// so it drops out too.
export const getTerminalLines = async (): Promise<TerminalLines> => {
  const [post, ep, strip, commits] = await Promise.all([
    getLatestPost(),
    getEpisode(),
    getStrip(),
    getCommits(),
  ]);
  const quote = stripHasMoves(strip) ? pickMarketQuote(strip) : null;
  const entry = filterCommitEntries(commits)[0];
  return {
    blog: post ? blogLine(post.title, timeAgo(post.createdAt)) : null,
    cast: ep ? castLine(ep.channel, formatPerHour(ep.viewsPerHour)) : null,
    market: quote && quote.changePct !== null ? marketLine(quote.label, formatPct(quote.changePct)) : null,
    commit: entry ? formatCommit(entry.sha, entry.message) : null,
  };
};

const COMMITS_URL = 'https://api.github.com/repos/amolpjadhav/amoljadhav.ninja/commits?per_page=20';

// Latest commits for the git log scene, refreshed hourly. Unauthenticated
// GitHub quota is shared and thin, so a token lifts it when set — either
// way the scene drops out quietly on failure.
export const getCommits = memoizeTtl(60 * 60 * 1000, async (): Promise<CommitEntry[]> => {
  try {
    const res = await fetch(COMMITS_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const raw: unknown = await res.json();
    if (!Array.isArray(raw)) return [];
    const out: CommitEntry[] = [];
    for (const item of raw) {
      if (typeof item !== 'object' || item === null) continue;
      const sha = (item as { sha?: unknown }).sha;
      const message = ((item as { commit?: unknown }).commit as { message?: unknown } | null)?.message;
      if (typeof sha === 'string' && typeof message === 'string') out.push({ sha, message });
    }
    return out;
  } catch {
    return [];
  }
});
