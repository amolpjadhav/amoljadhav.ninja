// Server-only data loaders shared by the homepage hero terminal and the
// Tools row. Never imported by node tests (extensionless sibling imports).
// TTLs bound upstream cost: the page revalidates every 60s, but the YouTube
// fan-out stays hourly and the index strip every 5 minutes.
import { supabase } from '@/lib/supabase';
import { trendingPodcasts } from '@/lib/podcasts';
import { getMarketStrip } from '@/lib/stocks';
import { currentMonth, MONTHS } from '@/lib/five-monthly';
import { BOOK_POOL, poolById } from '@/lib/book-pool';
import type { Difficulty } from '@/lib/book-spins';
import { memoizeTtl, toStripItems, toTopEpisode } from '@/lib/homepage';

export const getStrip = memoizeTtl(5 * 60 * 1000, async () => {
  const { strip } = await getMarketStrip({ timeoutMs: 6000 });
  return toStripItems(strip);
});

// One memoized YouTube fan-out shared by the Tools card (top episode) and
// the terminal (top episode, monthly #1, counts) — a second loader would
// double the quota burn.
const getLists = memoizeTtl(60 * 60 * 1000, () =>
  trendingPodcasts(process.env.YOUTUBE_API_KEY).catch(() => null),
);

export const getEpisode = async () => toTopEpisode((await getLists())?.trending[0]);

export const getPodcastLists = getLists;

// Request clock for the terminal's date, countdown, and fortune rotation.
// Lives here (not in the component) so render stays a pure function of data.
export function requestNowMs(): number {
  return Date.now();
}

export interface PostRow {
  title: string;
  slug: string;
  createdAt: string;
  views: number | null;
  category: string | null;
  readTime: number | null;
}

export interface PostStats {
  latest: { title: string; slug: string; createdAt: string } | null;
  posts: PostRow[];
}

// One cheap query (~50 rows) feeds every post-derived terminal command:
// tails, tops, stats, months, fortune, per-category counts.
export const getPostStats = memoizeTtl(60 * 1000, async (): Promise<PostStats> => {
  const empty: PostStats = { latest: null, posts: [] };
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, slug, created_at, views, category, read_time')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return empty;
  const posts: PostRow[] = (data ?? []).map((r) => ({
    title: r.title,
    slug: r.slug,
    createdAt: r.created_at,
    views: typeof r.views === 'number' ? r.views : null,
    category: typeof r.category === 'string' ? r.category : null,
    readTime: typeof r.read_time === 'number' ? r.read_time : null,
  }));
  const l = posts[0];
  return { latest: l ? { title: l.title, slug: l.slug, createdAt: l.createdAt } : null, posts };
});

export interface BookSlotData {
  title: string;
  pages: number;
}

export interface BookSpinData {
  label: string;
  verdictDate: string;
  quick: BookSlotData | null;
  classic: BookSlotData | null;
  stretch: BookSlotData | null;
  totalPages: number;
  poolBooks: number;
  poolGenres: number;
}

// Official monthly spin plus pool totals, resolved from the static data
// files — no fetch, so the book commands always render.
export function getBookSpin(): BookSpinData | null {
  if (MONTHS.length === 0) return null;
  const month = currentMonth();
  const books = month.picks.map((p) => poolById(p.bookId)).filter((b) => b !== undefined);
  if (books.length === 0) return null;
  const slot = (diff: Difficulty): BookSlotData | null => {
    const b = books.find((x) => x.difficulty === diff);
    return b ? { title: b.title, pages: b.pages } : null;
  };
  return {
    label: month.label,
    verdictDate: month.verdictDate,
    quick: slot('quick'),
    classic: slot('classic'),
    stretch: slot('stretch'),
    totalPages: books.reduce((n, b) => n + b.pages, 0),
    poolBooks: BOOK_POOL.length,
    poolGenres: new Set(BOOK_POOL.map((b) => b.genre)).size,
  };
}
