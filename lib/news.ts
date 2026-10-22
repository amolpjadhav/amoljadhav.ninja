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
  /** Finnhub summary: kept for ticker matching, stripped before JSON. */
  summary: string;
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
    summary: typeof r.summary === 'string' ? r.summary : '',
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

// Aggregators append the real outlet to the title ("…insider
// concerns - Reuters") while the source field says "Yahoo". Believe the
// byline: strip it from the title and credit the outlet. Allowlisted so a
// headline ending in "- Live updates" never becomes the outlet "Live".
const OUTLET_CREDIT: Record<string, string> = {
  reuters: 'Reuters',
  bloomberg: 'Bloomberg',
  cnbc: 'CNBC',
  'wall street journal': 'Wall Street Journal',
  wsj: 'WSJ',
  marketwatch: 'MarketWatch',
  "barron's": "Barron's",
  'barron’s': 'Barron’s',
  barrons: "Barron's",
  ap: 'AP',
  'associated press': 'Associated Press',
  'financial times': 'Financial Times',
  ft: 'FT',
  forbes: 'Forbes',
  fortune: 'Fortune',
  'business insider': 'Business Insider',
  techcrunch: 'TechCrunch',
  'the verge': 'The Verge',
  engadget: 'Engadget',
  'ars technica': 'Ars Technica',
  'motley fool': 'Motley Fool',
  benzinga: 'Benzinga',
  tipranks: 'TipRanks',
  investopedia: 'Investopedia',
  morningstar: 'Morningstar',
  'seeking alpha': 'Seeking Alpha',
  zacks: 'Zacks',
  thestreet: 'TheStreet',
  quartz: 'Quartz',
  axios: 'Axios',
  'fox business': 'Fox Business',
  cnn: 'CNN',
  bbc: 'BBC',
  npr: 'NPR',
  'yahoo finance': 'Yahoo Finance',
  "investor's business daily": "Investor's Business Daily",
};

export function splitTrailingSource(headline: string): { headline: string; source: string } | null {
  const m = headline.match(/\s+[-–—|:]\s+([^–—|:]+?)\s*$/);
  if (!m) return null;
  const canonical = OUTLET_CREDIT[m[1].trim().toLowerCase()];
  if (!canonical) return null;
  const clean = headline.slice(0, m.index).trim();
  if (!clean) return null;
  return { headline: clean, source: canonical };
}

function cleanItem(item: NewsItem): NewsItem | null {
  if (isClickbait(item.headline)) return null;
  const split = splitTrailingSource(item.headline);
  return {
    ...item,
    headline: sentenceCase((split?.headline ?? item.headline).trim()),
    source: split?.source ?? item.source,
  };
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

// Headlines name companies ("Meta lifts ad outlook"), not tickers
// ("META"). Provider `related` tags misattribute — a Corning story shows
// up in META's company-news feed — so pills match on headline + summary
// text only: the bare symbol or the company name with common aliases.
// Max two, headline hits before summary-only hits. Pure for tests.
const COMPANY_ALIASES: Record<string, string[]> = {
  AAPL: ['Apple'],
  MSFT: ['Microsoft'],
  GOOGL: ['Google', 'Alphabet', 'YouTube'],
  GOOG: ['Google', 'Alphabet', 'YouTube'],
  AMZN: ['Amazon'],
  NVDA: ['Nvidia'],
  META: ['Meta', 'Facebook', 'Instagram', 'WhatsApp'],
  TSLA: ['Tesla'],
  AVGO: ['Broadcom'],
  LLY: ['Eli Lilly'],
  JPM: ['JPMorgan', 'J.P. Morgan'],
  XOM: ['Exxon'],
  WMT: ['Walmart'],
  MA: ['Mastercard'],
  V: ['Visa'],
  ORCL: ['Oracle'],
  NFLX: ['Netflix'],
  CRM: ['Salesforce'],
  AMD: ['Advanced Micro Devices'],
  ADBE: ['Adobe'],
  COST: ['Costco'],
  UNH: ['UnitedHealth'],
  JNJ: ['Johnson & Johnson'],
  BAC: ['Bank of America'],
  KO: ['Coca-Cola'],
  PEP: ['Pepsi', 'PepsiCo'],
  DIS: ['Disney'],
  QCOM: ['Qualcomm'],
  INTC: ['Intel'],
  NKE: ['Nike'],
  MRK: ['Merck'],
  ABBV: ['AbbVie'],
  GS: ['Goldman Sachs'],
  HD: ['Home Depot'],
  TXN: ['Texas Instruments'],
  AMGN: ['Amgen'],
  COIN: ['Coinbase'],
  PLTR: ['Palantir'],
  UBER: ['Uber'],
  SHOP: ['Shopify'],
  ABNB: ['Airbnb'],
  TSM: ['TSMC', 'Taiwan Semiconductor'],
  MRVL: ['Marvell'],
  SPY: ['S&P 500'],
  QQQ: ['Nasdaq 100'],
  F: ['Ford'],
  GM: ['General Motors'],
  GE: ['General Electric'],
  IBM: ['IBM'],
  T: ['AT&T'],
  C: ['Citigroup', 'Citi'],
  X: ['U.S. Steel'],
};

function escRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Legal tail words headlines never use ("Physicians Realty Trust" is
// "Physicians Realty" in print). Stripped for a second match attempt.
const NAME_SUFFIX = new Set([
  'inc', 'incorporated', 'corp', 'corporation', 'ltd', 'limited', 'plc',
  'holdings', 'holding', 'co', 'company', 'trust', 'reit', 'group',
  'partners', 'properties', 'industries', 'international', 'systems',
  'technologies', 'technology', 'communications', 'financial', 'capital',
  'bancorp', 'bancshares', 'lp', 'llc', 'sa', 'ag', 'nv',
]);

export function companyCore(name: string): string {
  const toks = name.replace(/[.,]/g, ' ').split(/\s+/).filter(Boolean);
  while (toks.length > 1 && NAME_SUFFIX.has(toks[toks.length - 1].toLowerCase())) toks.pop();
  return toks.join(' ');
}

/** Earliest match position of a symbol or its names in text, else null. */
function matchPos(text: unknown, symbol: string, extraNames: string[]): number | null {
  const t = typeof text === 'string' ? text : '';
  if (!t) return null;
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;
  let best: number | null = null;
  const consider = (re: RegExp) => {
    const m = re.exec(t);
    if (m && (best === null || m.index < best)) best = m.index;
  };
  // Single-letter tickers (V, F, T…) match names only — a bare "V" in
  // prose is never the ticker.
  if (sym.length >= 2) consider(new RegExp(`\\b${escRe(sym)}\\b`));
  for (const n of [...(COMPANY_ALIASES[sym] ?? []), ...extraNames]) {
    const name = n.trim();
    if (name.length < 3) continue;
    consider(new RegExp(`\\b${escRe(name)}\\b`, 'i'));
    const core = companyCore(name);
    if (core.length >= 3 && core !== name) consider(new RegExp(`\\b${escRe(core)}\\b`, 'i'));
  }
  return best;
}

/** True when the headline or summary is actually about the symbol. */
export function mentionsTicker(
  item: { headline: string; summary?: string | null },
  symbol: string,
  extraNames: string[] = [],
): boolean {
  return (
    matchPos(item.headline, symbol, extraNames) !== null ||
    matchPos(item.summary, symbol, extraNames) !== null
  );
}

export function extractTickers(
  item: NewsItem,
  universe: string[],
  names: Record<string, string[] | string> = {},
): string[] {
  const set = [...new Set(universe.map((s) => s.trim().toUpperCase()).filter(Boolean))];
  const extra = (sym: string): string[] => {
    const v = names[sym];
    return v === undefined ? [] : Array.isArray(v) ? v : [v];
  };
  const head: { sym: string; pos: number }[] = [];
  const tail: string[] = [];
  for (const sym of set) {
    const p = matchPos(item.headline, sym, extra(sym));
    if (p !== null) head.push({ sym, pos: p });
    else if (matchPos(item.summary, sym, extra(sym)) !== null) tail.push(sym);
  }
  head.sort((a, b) => a.pos - b.pos);
  return [...head.map((h) => h.sym), ...tail].slice(0, 2);
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

// Provider `related` tags misattribute (a SpaceX story tagged MSFT, a
// Corning story in META's own feed), and matching ignores them entirely —
// this clears them at the source so no caller can lean on them. Pure.
export function stripGeneralRelated(items: NewsItem[]): NewsItem[] {
  return items.map((x) => (x.related ? { ...x, related: '' } : x));
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
        ...stripGeneralRelated(
          raw
            .filter((r) => (r as Record<string, unknown>)?.category === 'business')
            .map(toItem)
            .filter((x): x is NewsItem => x !== null),
        )
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
    .map(cleanItem)
    .filter((x): x is NewsItem => x !== null);
  return dedupeSort(cleaned, limit);
}

// Latest headline (≤24h) per symbol, for mover reason lines. One cached
// company-news call per symbol — but a feed for SYM carries other
// companies' stories, so a headline only counts when it names the symbol
// or company. `names` carries caller-known company names ("SNAP:
// Snapchat"); the static alias map covers the large caps. A symbol with
// nothing fresh maps to null so the UI hides the line instead of
// misattributing (a Snap story under AAPL).
export async function getNewsReasons(
  symbols: string[],
  limitSymbols = 25,
  names: Record<string, string[] | string> = {},
): Promise<Record<string, NewsItem | null>> {
  const out: Record<string, NewsItem | null> = {};
  const list = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, limitSymbols);
  const cutoff = Date.now() / 1000 - 24 * 3600;
  const extra = (sym: string): string[] => {
    const v = names[sym];
    return v === undefined ? [] : Array.isArray(v) ? v : [v];
  };
  await Promise.all(
    list.map(async (sym) => {
      const items = await getCompanyNews(sym, 2, 3).catch(() => []);
      out[sym] = items.find((i) => i.datetime >= cutoff && mentionsTicker(i, sym, extra(sym))) ?? null;
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
