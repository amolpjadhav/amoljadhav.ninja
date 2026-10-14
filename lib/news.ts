// Finnhub news, server-side only (FINNHUB_API_KEY never leaves the
// server; client components reach this through /api/news routes).
// Headline + source + time + outbound link only — never article text.

export interface NewsItem {
  id: number;
  headline: string;
  source: string;
  url: string;
  /** Epoch seconds. */
  datetime: number;
  related: string;
  image: string | null;
}

const BASE = 'https://finnhub.io/api/v1';

function apiKey(): string | null {
  const k = process.env.FINNHUB_API_KEY;
  return k && k.trim() ? k.trim() : null;
}

async function finnhub(path: string): Promise<unknown[] | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${path}&token=${key}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return Array.isArray(json) ? json : null;
  } catch {
    return null;
  }
}

function toItem(raw: unknown): NewsItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const headline = typeof r.headline === 'string' ? r.headline.trim() : '';
  const url = typeof r.url === 'string' ? r.url : '';
  const datetime = typeof r.datetime === 'number' ? r.datetime : Number(r.datetime);
  if (!headline || !url || !Number.isFinite(datetime) || datetime <= 0) return null;
  return {
    id: typeof r.id === 'number' ? r.id : datetime,
    headline,
    source: typeof r.source === 'string' && r.source ? r.source : 'Finnhub',
    url,
    datetime,
    related: typeof r.related === 'string' ? r.related : '',
    image: typeof r.image === 'string' && r.image ? r.image : null,
  };
}

// --- Headline hygiene -------------------------------------------------
// Syndicated opinion bait ("Prediction: $5,000 invested in…") is noise
// next to market data. Drop it, tame ALL-CAPS wire headlines, prefer
// primary publishers, and collapse wire rewrites of the same story.

const CLICKBAIT: RegExp[] = [
  /^prediction:/i,
  /here'?s why/i,
  /could be worth/i,
  /\$[\d,]+ invested/i,
  /should you buy/i,
  /better buy/i,
  /millionaire/i,
  /\bvs\.?\b/i,
];

export function isClickbait(title: string): boolean {
  return CLICKBAIT.some((r) => r.test(title));
}

const KEEP_CAPS = new Set([
  'AI', 'US', 'USA', 'UK', 'EU', 'CEO', 'CFO', 'ETF', 'IPO', 'SEC', 'FED',
  'GDP', 'CPI', 'OPEC', 'FDA', 'EV', 'LG', 'TSMC',
]);

export function sentenceCase(title: string): string {
  const letters = title.replace(/[^A-Za-z]/g, '');
  if (!letters) return title;
  const upper = (letters.match(/[A-Z]/g) ?? []).length;
  if (upper / letters.length <= 0.7) return title;
  const fixed = title
    .toLowerCase()
    .split(/(\s+)/)
    .map((tok) => {
      const core = tok.replace(/[^A-Za-z]/g, '').toUpperCase();
      return KEEP_CAPS.has(core) && core.length > 0 ? tok.toUpperCase() : tok;
    })
    .join('');
  return fixed.charAt(0).toUpperCase() + fixed.slice(1);
}

function cleanItem(item: NewsItem): NewsItem | null {
  if (isClickbait(item.headline)) return null;
  return { ...item, headline: sentenceCase(item.headline) };
}

const SOURCE_RANK: Record<string, number> = {
  reuters: 0,
  'associated press': 1,
  ap: 1,
  bloomberg: 2,
  cnbc: 3,
  'wall street journal': 4,
  wsj: 4,
  marketwatch: 5,
  yahoo: 8,
};

export function sourceRank(source: string): number {
  return SOURCE_RANK[source.trim().toLowerCase()] ?? 6;
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// Near-identical titles (wire rewrites) collapse: normalized edit
// distance under 20% of the longer title counts as the same story.
export function dedupeNear(items: NewsItem[], limit: number): NewsItem[] {
  const kept: { item: NewsItem; norm: string }[] = [];
  for (const item of items) {
    const norm = normalizeTitle(item.headline);
    const dup = kept.some(({ norm: k }) => {
      const max = Math.max(norm.length, k.length);
      return max > 0 && levenshtein(norm, k) / max < 0.2;
    });
    if (!dup) {
      kept.push({ item, norm });
      if (kept.length >= limit) break;
    }
  }
  return kept.map(({ item }) => item);
}

// Tickers a headline is about: the provider's related tags first, then
// case-sensitive symbol matches in the headline itself. Max two.
export function extractTickers(item: NewsItem, universe: string[]): string[] {
  const set = new Set(universe.map((s) => s.toUpperCase()));
  const out: string[] = [];
  const push = (s: string) => {
    const sym = s.toUpperCase();
    if (set.has(sym) && !out.includes(sym)) out.push(sym);
  };
  for (const tok of item.related.split(/[,\s]+/)) if (tok) push(tok);
  const byPos: { sym: string; pos: number }[] = [];
  for (const sym of set) {
    const m = new RegExp(`\\b${sym}\\b`).exec(item.headline);
    if (m) byPos.push({ sym, pos: m.index });
  }
  byPos.sort((a, b) => a.pos - b.pos);
  for (const { sym } of byPos) push(sym);
  return out.slice(0, 2);
}

function dedupeSort(items: NewsItem[], limit: number): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const it of [...items].sort((a, b) => b.datetime - a.datetime)) {
    const k = it.headline.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
    if (out.length >= limit) break;
  }
  return out;
}

// "What's moving markets": fresh headlines on the names that move the
// market (the general feed carries world news with no ticker tags).
// Cleaned, near-deduped, primary publishers first, five at most.
const TRENDING_SYMBOLS = ['NVDA', 'AAPL', 'MSFT', 'META', 'AMZN', 'GOOGL', 'TSLA'];
export async function getMarketNews(limit = 5): Promise<NewsItem[]> {
  const per = await Promise.all(
    TRENDING_SYMBOLS.map((s) => getCompanyNews(s, 2, 6).catch(() => [] as NewsItem[])),
  );
  let pool = per.flat();
  if (pool.length < 3) {
    const raw = await finnhub('/news?category=general');
    if (raw) {
      pool = [
        ...pool,
        ...raw
          .filter((r) => (r as Record<string, unknown>)?.category === 'business')
          .map(toItem)
          .filter((x): x is NewsItem => x !== null)
          .map(cleanItem)
          .filter((x): x is NewsItem => x !== null),
      ];
    }
  }
  const ranked = [...pool].sort(
    (a, b) => sourceRank(a.source) - sourceRank(b.source) || b.datetime - a.datetime,
  );
  return dedupeNear(ranked, limit);
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Per-ticker headlines, most recent first, clickbait filtered.
export async function getCompanyNews(symbol: string, days = 7, limit = 6): Promise<NewsItem[]> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return [];
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const raw = await finnhub(
    `/company-news?symbol=${encodeURIComponent(sym)}&from=${isoDay(from)}&to=${isoDay(to)}`,
  );
  if (!raw) return [];
  const cleaned = raw
    .map(toItem)
    .filter((x): x is NewsItem => x !== null)
    .map((x) => (x.related ? x : { ...x, related: sym }))
    .map(cleanItem)
    .filter((x): x is NewsItem => x !== null);
  return dedupeSort(cleaned, limit);
}

// Latest headline (≤24h) per symbol, for mover reason lines. One cached
// company-news call per symbol; a symbol with nothing fresh maps to null
// so the UI can fall back to silence instead of inventing a reason.
export async function getNewsReasons(
  symbols: string[],
  limitSymbols = 25,
): Promise<Record<string, NewsItem | null>> {
  const out: Record<string, NewsItem | null> = {};
  const list = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, limitSymbols);
  const cutoff = Date.now() / 1000 - 24 * 3600;
  await Promise.all(
    list.map(async (sym) => {
      const items = await getCompanyNews(sym, 2, 3).catch(() => []);
      out[sym] = items.find((i) => i.datetime >= cutoff) ?? null;
    }),
  );
  return out;
}

// "3h", "26m", "2d" — relative age for bylines.
export function newsAge(datetimeSec: number, nowMs: number = Date.now()): string {
  const s = Math.max(0, Math.floor(nowMs / 1000) - datetimeSec);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
