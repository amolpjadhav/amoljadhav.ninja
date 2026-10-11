// Homepage Tools row helpers. Self-contained like the other lib modules:
// the server component wires these to the real data libs (stocks, podcasts,
// books), which node --test can't resolve extensionless.
export const VIEW_COUNT_THRESHOLD = 10;

// Compact 1.5K/2M formatting, mirroring formatCount in lib/utils (which the
// Tools row can't import without breaking node resolution). A parity test
// below guards drift.
export function compactCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

// Null below the threshold so new posts don't wear a "1 views" badge.
export function viewCountLabel(views: number | null | undefined): string | null {
  if (typeof views !== 'number' || !Number.isFinite(views) || views < VIEW_COUNT_THRESHOLD) return null;
  return `${compactCount(Math.floor(views))} views`;
}

// Memoizes an async loader for ttlMs; concurrent callers share one flight,
// and a failure serves the last good value (or null) instead of throwing.
export function memoizeTtl<T>(ttlMs: number, fn: () => Promise<T>): () => Promise<T | null> {
  let cachedAt = 0;
  let value: T | null = null;
  let pending: Promise<T | null> | null = null;
  return () => {
    if (value !== null && Date.now() - cachedAt < ttlMs) return Promise.resolve(value);
    if (!pending) {
      pending = fn().then(
        (v) => {
          value = v;
          cachedAt = Date.now();
          pending = null;
          return v;
        },
        () => {
          pending = null;
          return value;
        },
      );
    }
    return pending;
  };
}

export interface StripQuote {
  label: string;
  changePct: number | null;
  spark: number[];
}

export interface StripItem {
  label: string;
  changePct: number | null;
  spark: number[];
}

export function toStripItems(strip: StripQuote[]): StripItem[] {
  return strip.map((q) => ({ label: q.label, changePct: q.changePct, spark: q.spark }));
}

// A strip where every quote rounds to 0.0% is a dead feed (seen on
// weekends), not real data — the card should fall back instead of printing
// a wall of +0.0%.
export function stripHasMoves(strip: Array<{ changePct: number | null }>): boolean {
  return strip.some(
    (q) => q.changePct !== null && Number.isFinite(q.changePct) && Math.abs(q.changePct * 100) >= 0.05,
  );
}

export interface TermLine {
  text: string;
  typed: boolean;
  href?: string;
}

export interface MarketLine {
  label: string;
  pct: string;
  changePct: number | null;
}

export interface TerminalPost {
  title: string;
  slug: string;
  createdAt: string; // ISO date
  views: number | null;
  category: string | null;
  readTime: number | null; // minutes
}

export interface BookSlot {
  title: string;
  pages: number;
}

export interface TerminalBooks {
  label: string; // e.g. 'November'
  verdictDate: string; // e.g. 'Nov 30'
  quick: BookSlot | null;
  classic: BookSlot | null;
  stretch: BookSlot | null;
  totalPages: number;
  poolBooks: number;
  poolGenres: number;
}

export interface TerminalData {
  posts: TerminalPost[] | null;
  latestAge: string | null;
  nowMs: number;
  quotes: MarketLine[] | null;
  topEp: { channel: string; vph: string | null } | null;
  monthEp: { title: string; views: string } | null;
  epCounts: { trending: number; month: number } | null;
  showCount: number;
  genreCount: number;
  books: TerminalBooks | null;
}

function shorten(s: string, max = 30): string {
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
}

// Final clamp so every output survives the ~44-character box on one line,
// whatever the data holds (long titles, channel names, dates).
function fit(s: string, max = 44): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

// Strip label -> its own command. Unmapped quotes (Russell, Oil) still count
// toward the leader line but get no command of their own.
const QUOTE_CMDS: Record<string, string> = {
  'S&P 500': '$ market',
  'Nasdaq 100': '$ nasdaq',
  Dow: '$ dow',
  Gold: '$ gold',
  Bitcoin: '$ btc',
};

const STOCK_HREF = '/blog/look-up-stock-and-company-details';
const PODS_HREF = '/blog/trending-podcasts';
const BOOKS_HREF = '/blog/monthly-book-spin';

// Hero terminal scripts: one command plus exactly one output line each, so
// every result reads as the answer to its command. Data sections drop out
// when their feed is down, while static lines keep the terminal alive —
// nothing here is ever faked. With a full rotation (~40 scripts) no command
// repeats for minutes.
export function buildTerminalScripts(d: TerminalData): TermLine[][] {
  const scripts: TermLine[][] = [];
  const now = new Date(d.nowMs);
  const posts = [...(d.posts ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const latest = posts[0] ?? null;
  scripts.push([
    { text: '$ tail -1 blog', typed: true },
    latest
      ? {
          text: fit(`${shorten(latest.title)}${d.latestAge ? ` · ${d.latestAge}` : ''}`),
          typed: false,
          href: `/blog/${latest.slug}`,
        }
      : { text: '(no posts yet)', typed: false },
  ]);

  scripts.push([
    { text: '$ top podcasts', typed: true },
    d.topEp
      ? {
          text: fit(`${d.topEp.channel}${d.topEp.vph ? ` · ${d.topEp.vph}` : ''}`),
          typed: false,
          href: PODS_HREF,
        }
      : { text: 'charts unavailable', typed: false },
  ]);

  const quotes = d.quotes ?? [];
  const live = stripHasMoves(quotes);
  const sp = quotes.find((q) => q.label === 'S&P 500') ?? null;
  if (live && sp && stripHasMoves([sp])) {
    scripts.push([
      { text: '$ market', typed: true },
      { text: fit(`${sp.label} ${sp.pct} today`), typed: false, href: STOCK_HREF },
    ]);
  }

  if (posts.length > 0) {
    const tailN = (i: number, cmd: string) => {
      const p = posts[i];
      if (p) scripts.push([{ text: cmd, typed: true }, { text: fit(`${shorten(p.title)}`), typed: false, href: `/blog/${p.slug}` }]);
    };
    tailN(1, '$ tail -2 blog');
    tailN(2, '$ tail -3 blog');

    const oldest = posts[posts.length - 1];
    if (oldest && posts.length > 1) {
      scripts.push([
        { text: '$ head -1 blog', typed: true },
        { text: fit(`${shorten(oldest.title)} · ${oldest.createdAt.slice(0, 4)}`), typed: false, href: `/blog/${oldest.slug}` },
      ]);
    }

    const ranked = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    const topCmds = ['$ top posts', '$ top posts --2', '$ top posts --3'];
    ranked.slice(0, 3).forEach((p, i) => {
      scripts.push([
        { text: topCmds[i] ?? '$ top posts', typed: true },
        { text: fit(`${shorten(p.title)} · ${compactCount(p.views ?? 0)} views`), typed: false, href: `/blog/${p.slug}` },
      ]);
    });

    const totalViews = posts.reduce((n, p) => n + (p.views ?? 0), 0);
    scripts.push([
      { text: '$ stats', typed: true },
      { text: `${plural(posts.length, 'post', 'posts')} · ${compactCount(totalViews)} views`, typed: false, href: '/blog' },
    ]);

    const months = new Set(posts.map((p) => p.createdAt.slice(0, 7)));
    scripts.push([
      { text: '$ months', typed: true },
      { text: `${plural(months.size, 'month', 'months')} of writing`, typed: false },
    ]);

    const fortune = posts[Math.floor(d.nowMs / 86400000) % posts.length] ?? posts[0];
    if (fortune) {
      scripts.push([
        { text: '$ fortune', typed: true },
        { text: fit(`${shorten(fortune.title)}`), typed: false, href: `/blog/${fortune.slug}` },
      ]);
    }

    const yyyymm = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const thisMonth = posts.filter((p) => p.createdAt.startsWith(yyyymm)).length;
    scripts.push([
      { text: '$ this-month', typed: true },
      { text: `${plural(thisMonth, 'post', 'posts')} in ${MONTH_SHORT[now.getUTCMonth()] ?? ''}`, typed: false },
    ]);

    const minutes = posts.reduce((n, p) => n + (p.readTime ?? 0), 0);
    if (minutes > 0) {
      scripts.push([{ text: '$ minutes', typed: true }, { text: `${plural(minutes, 'min', 'min')} of reading`, typed: false }]);
    }

    const cats = new Map<string, number>();
    for (const p of posts) {
      const c = (p.category ?? '').trim();
      if (c) cats.set(c, (cats.get(c) ?? 0) + 1);
    }
    for (const c of [...cats.keys()].sort()) {
      scripts.push([
        { text: `$ ls ${c}`, typed: true },
        { text: `${plural(cats.get(c) ?? 0, 'post', 'posts')}`, typed: false, href: `/blog?category=${encodeURIComponent(c)}` },
      ]);
    }
  }

  if (live) {
    for (const [label, cmd] of Object.entries(QUOTE_CMDS)) {
      if (label === 'S&P 500') continue; // already up top
      const q = quotes.find((x) => x.label === label);
      if (q && stripHasMoves([q])) {
        scripts.push([{ text: cmd, typed: true }, { text: fit(`${q.label} ${q.pct} today`), typed: false, href: STOCK_HREF }]);
      }
    }
    const leader = quotes
      .filter((q) => q.changePct !== null && Number.isFinite(q.changePct))
      .sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0))[0];
    if (leader) {
      const verb = (leader.changePct ?? 0) >= 0 ? 'leads' : 'lags';
      scripts.push([
        { text: '$ leader', typed: true },
        { text: fit(`${leader.label} ${leader.pct} ${verb} today`), typed: false, href: STOCK_HREF },
      ]);
    }
  }

  if (d.monthEp) {
    scripts.push([
      { text: '$ month', typed: true },
      { text: fit(`${shorten(d.monthEp.title)} · ${d.monthEp.views}`), typed: false, href: PODS_HREF },
    ]);
  }
  if (d.epCounts) {
    scripts.push([
      { text: '$ episodes', typed: true },
      { text: `${d.epCounts.trending} trending · ${d.epCounts.month} this month`, typed: false, href: PODS_HREF },
    ]);
  }
  scripts.push([
    { text: '$ shows', typed: true },
    { text: `${plural(d.showCount, 'show', 'shows')} tracked`, typed: false, href: PODS_HREF },
  ]);
  scripts.push([
    { text: '$ genres', typed: true },
    { text: `${plural(d.genreCount, 'genre', 'genres')} covered`, typed: false, href: PODS_HREF },
  ]);

  const b = d.books;
  if (b) {
    scripts.push([
      { text: '$ spin', typed: true },
      { text: fit(`${b.label} five · verdicts ${b.verdictDate}`), typed: false, href: BOOKS_HREF },
    ]);
    scripts.push([
      { text: '$ pool', typed: true },
      { text: `${plural(b.poolBooks, 'book', 'books')} · ${plural(b.poolGenres, 'genre', 'genres')}`, typed: false, href: BOOKS_HREF },
    ]);
    const slot = (cmd: string, s: BookSlot | null) => {
      if (s) scripts.push([{ text: cmd, typed: true }, { text: fit(`${shorten(s.title, 28)} · ${s.pages}p`), typed: false, href: BOOKS_HREF }]);
    };
    slot('$ quick', b.quick);
    slot('$ classic', b.classic);
    slot('$ stretch', b.stretch);
    scripts.push([{ text: '$ pages', typed: true }, { text: `${b.totalPages} pages this month`, typed: false, href: BOOKS_HREF }]);
  }

  scripts.push([{ text: '$ whoami', typed: true }, { text: "aj · this site's human", typed: false }]);
  scripts.push([{ text: '$ uptime', typed: true }, { text: 'writing since 2025', typed: false }]);
  scripts.push([{ text: '$ date', typed: true }, { text: `${now.toUTCString().slice(0, 16)}`, typed: false }]);
  scripts.push([{ text: '$ tools', typed: true }, { text: 'stock · books · podcasts', typed: false, href: '/#tools' }]);
  const daysLeft = Math.max(0, Math.ceil((Date.UTC(now.getUTCFullYear() + 1, 0, 1) - d.nowMs) / 86400000));
  scripts.push([
    { text: '$ countdown', typed: true },
    { text: `${plural(daysLeft, 'day', 'days')} left in ${now.getUTCFullYear()}`, typed: false },
  ]);

  // Help counts the finished rotation (including itself) so the number is
  // always true, then jumps the queue to fourth.
  const total = scripts.length + 1;
  scripts.splice(3, 0, [
    { text: '$ help', typed: true },
    { text: `${total} commands · try: tail, top…`, typed: false },
  ]);
  return scripts;
}

export interface EpisodeSource {
  title: string;
  channel: string;
  thumbnail?: string | null;
  viewsPerHour: number | null;
  url: string;
}

export interface TopEpisode {
  title: string;
  channel: string;
  thumbnail: string | null;
  viewsPerHour: number | null;
  url: string;
}

export function toTopEpisode(ep: EpisodeSource | undefined): TopEpisode | null {
  if (!ep) return null;
  return {
    title: ep.title,
    channel: ep.channel,
    thumbnail: ep.thumbnail ?? null,
    viewsPerHour: ep.viewsPerHour,
    url: ep.url,
  };
}
