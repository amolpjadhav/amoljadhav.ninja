// Finnhub earnings calendar, server-side only (FINNHUB_API_KEY never leaves
// the server; client components reach this through /api/stocks/earnings).
// One request per refresh covers the whole coming week, cached an hour —
// trivial against the 60-calls/min free tier. Estimates are always labeled
// as estimates; dates Finnhub hasn't confirmed stay that way in the UI.

export interface EarningsEvent {
  symbol: string;
  /** YYYY-MM-DD (Finnhub reports in ET). */
  date: string;
  /** bmo = before market open, amc = after market close, '' = unconfirmed. */
  hour: 'bmo' | 'amc' | '';
  quarter: number | null;
  year: number | null;
  epsEstimate: number | null;
  /** Dollars. */
  revenueEstimate: number | null;
  /** Set once the company has reported (null before). */
  epsActual: number | null;
  revenueActual: number | null;
}

export interface EarningsWeek {
  events: EarningsEvent[];
  /** ISO fetch time for "updated …" labels. */
  fetchedAt: string;
}

const BASE = 'https://finnhub.io/api/v1';
const DAY = 86400000;

function apiKey(): string | null {
  const k = process.env.FINNHUB_API_KEY;
  return k && k.trim() ? k.trim() : null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Pure parse of the /calendar/earnings payload: rows without a date or a
 *  symbol are dropped, everything else degrades to nulls. Exported for tests. */
export function parseEarnings(raw: unknown): EarningsEvent[] {
  const arr =
    raw && typeof raw === 'object' && Array.isArray((raw as Record<string, unknown>).earningsCalendar)
      ? ((raw as Record<string, unknown>).earningsCalendar as unknown[])
      : [];
  const out: EarningsEvent[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const symbol = typeof r.symbol === 'string' ? r.symbol.trim().toUpperCase() : '';
    const date = typeof r.date === 'string' ? r.date.slice(0, 10) : '';
    if (!symbol || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const hour = r.hour === 'bmo' || r.hour === 'amc' ? r.hour : '';
    out.push({
      symbol,
      date,
      hour,
      quarter: num(r.quarter),
      year: num(r.year),
      epsEstimate: num(r.epsEstimate),
      revenueEstimate: num(r.revenueEstimate),
      epsActual: num(r.epsActual),
      revenueActual: num(r.revenueActual),
    });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.symbol < b.symbol ? -1 : 1));
}

/** This week of earnings: today through six days out. Never throws — an
 *  unreachable API yields an empty week, not a broken page. */
export async function fetchEarningsWeek(nowMs: number = Date.now()): Promise<EarningsWeek> {
  const empty: EarningsWeek = { events: [], fetchedAt: new Date(nowMs).toISOString() };
  const key = apiKey();
  if (!key) return empty;
  try {
    const res = await fetch(
      `${BASE}/calendar/earnings?from=${isoDay(nowMs)}&to=${isoDay(nowMs + 6 * DAY)}&token=${key}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return empty;
    return { events: parseEarnings(await res.json()), fetchedAt: empty.fetchedAt };
  } catch {
    return empty;
  }
}

/** Nearest upcoming event for a ticker (today counts), or null when none is
 *  scheduled. Never invent a date. */
export function nextEarningsFor(
  events: EarningsEvent[],
  symbol: string,
  nowMs: number = Date.now(),
): EarningsEvent | null {
  const want = symbol.trim().toUpperCase();
  const today = isoDay(nowMs);
  let best: EarningsEvent | null = null;
  for (const e of events) {
    if (e.symbol !== want || e.date < today) continue;
    if (!best || e.date < best.date) best = e;
  }
  return best;
}

// --- Enrichment ------------------------------------------------------------
// Calendar rows are tickers + estimates. Company names, market caps, logos
// and beat histories come from two more Finnhub endpoints, cached hard:
// profiles barely move (30d), beat histories settle daily (24h). Everything
// degrades to nulls — a missing enrichment never drops the row.

export interface CompanyProfile {
  name: string | null;
  /** Dollars (Finnhub quotes millions). */
  marketCap: number | null;
  logo: string | null;
}

export interface Beats {
  wins: number;
  total: number;
}

export interface EnrichedEvent extends EarningsEvent {
  companyName: string | null;
  marketCap: number | null;
  logo: string | null;
  blueChip: boolean;
  beats: Beats | null;
  /** Today's session move (fraction, Nasdaq keyless quote) for rows that
   *  have already reported. Null before the report or when unavailable —
   *  never a reaction-to-earnings claim, just today's move. */
  priceChangePct: number | null;
  /** Extended-hours move vs the regular close, when the session produced
   *  one — the honest "after hours" number for result cards. */
  ahChangePct: number | null;
}

export interface QuarterDetail {
  /** "Q3". */
  q: string;
  year: number | null;
  actual: number | null;
  estimate: number | null;
  beat: boolean | null;
}

/** "Q3 '26: EPS $5.89 vs $5.92 est" for dot tooltips. Pure; exported for tests. */
export function quarterTip(qd: QuarterDetail): string {
  const yy = qd.year !== null ? ` '${String(qd.year).slice(2)}` : '';
  const a = formatEps(qd.actual);
  const e = formatEps(qd.estimate);
  if (a && e) return `${qd.q}${yy}: EPS ${a} vs ${e} est`;
  if (a) return `${qd.q}${yy}: EPS ${a} reported`;
  return `${qd.q}${yy}: no estimate`;
}

/** Last-4 quarters with actuals, oldest first, for dots + tooltips. Empty
 *  when the provider has no history. Server-side only. */
export async function fetchQuarterDetails(symbol: string): Promise<QuarterDetail[]> {
  const key = apiKey();
  if (!key) return [];
  try {
    const res = await fetch(`${BASE}/stock/earnings?symbol=${encodeURIComponent(symbol)}&token=${key}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];
    // Provider returns newest first; dots read oldest → newest.
    return json
      .slice(0, 4)
      .map((item): QuarterDetail | null => {
        if (!item || typeof item !== 'object') return null;
        const r = item as Record<string, unknown>;
        const qn = num(r.quarter);
        const yr = num(r.year);
        let q = qn !== null ? `Q${qn}` : null;
        let year = yr !== null ? yr : null;
        if (q === null && typeof r.period === 'string') {
          const m = r.period.match(/^(\d{4})-(\d{2})-\d{2}$/);
          if (m) {
            year = Number(m[1]);
            q = `Q${Math.floor((Number(m[2]) - 1) / 3) + 1}`;
          }
        }
        if (q === null) return null;
        return { q, year, actual: num(r.actual), estimate: num(r.estimate), beat: quarterBeat(r) };
      })
      .filter((d): d is QuarterDetail => d !== null)
      .reverse();
  } catch {
    return [];
  }
}

/** Last-4 quarter beat dots, oldest first, for preview cards. Empty when
 *  the provider has no history. Server-side only (used by the og route). */
export async function fetchQuarterBeats(symbol: string): Promise<boolean[]> {
  return (await fetchQuarterDetails(symbol)).map((d) => d.beat).filter((b): b is boolean => b !== null);
}

/** Curated household names (mega-cap S&P/Nasdaq-100 core), NOT an exhaustive
 *  index list — Finnhub gates the constituents endpoint behind paid plans.
 *  Only worth +2 popularity and the "big names" dot, so a stale entry is
 *  low-harm. Refresh eyeball-check quarterly. */
const BLUE_CHIP_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'BRK.A',
  'LLY', 'AVGO', 'JPM', 'XOM', 'UNH', 'V', 'MA', 'WMT', 'JNJ', 'PG',
  'ORCL', 'COST', 'HD', 'BAC', 'ABBV', 'NFLX', 'CRM', 'AMD', 'KO', 'TMO',
  'DIS', 'ABT', 'DHR', 'VZ', 'ADBE', 'PEP', 'NKE', 'INTC', 'IBM', 'QCOM',
  'TXN', 'HON', 'AMGN', 'PM', 'UPS', 'LOW', 'MS', 'GS', 'CAT', 'BA',
  'GE', 'MMM', 'AXP', 'SPGI', 'BLK', 'SCHW', 'NOW', 'ISRG', 'GILD', 'AMAT',
  'LRCX', 'MU', 'ADI', 'KLAC', 'PANW', 'SNPS', 'CDNS', 'MDT', 'SYK', 'ZTS',
  'LIN', 'NEE', 'DUK', 'SO', 'T', 'CVX', 'COP', 'PLD', 'AMT', 'EQIX',
];

export const BLUE_CHIP = new Set(BLUE_CHIP_SYMBOLS);

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = new Array(Math.min(size, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const at = i++;
      try {
        out[at] = await fn(items[at]);
      } catch {
        out[at] = undefined as R;
      }
    }
  });
  await Promise.all(workers);
  return out;
}

async function fetchProfiles(symbols: string[]): Promise<Map<string, CompanyProfile>> {
  const key = apiKey();
  const map = new Map<string, CompanyProfile>();
  if (!key) return map;
  const got = await pool([...new Set(symbols)], 8, async (symbol): Promise<[string, CompanyProfile] | null> => {
    try {
      const res = await fetch(`${BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 2592000 },
      });
      if (!res.ok) return null;
      const r = (await res.json()) as Record<string, unknown>;
      const mc = num(r.marketCapitalization);
      return [
        symbol,
        {
          name: typeof r.name === 'string' && r.name ? r.name : null,
          marketCap: mc === null ? null : mc * 1e6,
          logo: typeof r.logo === 'string' && r.logo ? r.logo : null,
        },
      ];
    } catch {
      return null;
    }
  });
  for (const g of got) {
    if (g) map.set(g[0], g[1]);
  }
  return map;
}

/** A quarter's beat signal. The provider's own surprise field wins when
 *  present — it matches their methodology (adjusted vs adjusted), while a
 *  naive actual > estimate can compare GAAP results against adjusted
 *  estimates and cry wolf (the Abbott false-miss). Falls back to the naive
 *  comparison when surprise is absent. Pure; exported for tests. */
export function quarterBeat(r: Record<string, unknown>): boolean | null {
  const surprise = num(r.surprise) ?? num(r.surprisePercent);
  if (surprise !== null) return surprise > 0;
  const actual = num(r.actual);
  const estimate = num(r.estimate);
  if (actual === null || estimate === null) return null;
  return actual > estimate;
}

/** Quarters where the naive comparison and the provider surprise disagree —
 *  a data-quality signal the fetcher logs per ticker. Pure; exported for
 *  tests. */
export function countDisagreements(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  let n = 0;
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const surprise = num(r.surprise) ?? num(r.surprisePercent);
    const actual = num(r.actual);
    const estimate = num(r.estimate);
    if (surprise === null || actual === null || estimate === null) continue;
    if (surprise > 0 !== actual > estimate) n++;
  }
  return n;
}

/** Count beats over the last reported quarters with a signal present.
 *  Pure over the payload shape; exported for tests. */
export function countBeats(raw: unknown): Beats | null {
  if (!Array.isArray(raw)) return null;
  let wins = 0;
  let total = 0;
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue;
    const beat = quarterBeat(item as Record<string, unknown>);
    if (beat === null) continue;
    total++;
    if (beat) wins++;
  }
  return total === 0 ? null : { wins, total };
}

async function fetchBeatsMap(symbols: string[]): Promise<Map<string, Beats>> {
  const key = apiKey();
  const map = new Map<string, Beats>();
  if (!key) return map;
  const got = await pool([...new Set(symbols)], 8, async (symbol): Promise<[string, Beats] | null> => {
    try {
      const res = await fetch(`${BASE}/stock/earnings?symbol=${encodeURIComponent(symbol)}&token=${key}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 86400 },
      });
      if (!res.ok) return null;
      const json = await res.json();
      const beats = countBeats(json);
      if (beats) {
        const d = countDisagreements(json);
        if (d > 0) console.warn(`[earnings] ${symbol}: beat history disagrees with provider surprise on ${d} quarter(s)`);
        return [symbol, beats];
      }
      return null;
    } catch {
      return null;
    }
  });
  for (const g of got) {
    if (g) map.set(g[0], g[1]);
  }
  return map;
}

/** Popularity: log10(market cap) dominates, +2 for household names. No
 *  volume term — neither free source carries it — so cap does the work
 *  (the feedback's own "90% of the way"). Missing cap sinks to the bottom,
 *  never out. */
export function popularity(e: { marketCap: number | null; blueChip: boolean }): number {
  return Math.log10(Math.max(e.marketCap ?? 0, 1)) + (e.blueChip ? 2 : 0);
}

/** Sort a day's rows biggest-first. Pure; exported for tests. */
export function rankDay<T extends { marketCap: number | null; blueChip: boolean }>(events: T[]): T[] {
  return [...events].sort((a, b) => popularity(b) - popularity(a));
}

/** Starred tickers persist client-side (localStorage) and pin matching
 *  reporters above the week strip. Storage itself lives in the component;
 *  these two stay pure for tests. */
export const WATCHLIST_KEY = 'stocks-watchlist';

export function cleanTickers(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const t of raw) {
    if (typeof t !== 'string') continue;
    const c = t.trim().toUpperCase();
    if (c && !out.includes(c)) out.push(c);
    if (out.length >= 50) break;
  }
  return out;
}

export function toggleInList(list: string[], ticker: string): string[] {
  const t = ticker.trim().toUpperCase();
  if (!t) return list;
  const next = list.includes(t) ? list.filter((x) => x !== t) : [t, ...list];
  return next.slice(0, 50);
}

/** Main view rule: rows without an EPS estimate hide until the list is
 *  expanded (they're almost always micro-caps), then an optional
 *  ticker/name query filters. Pure; exported for tests. */
export function visibleRows<T extends { symbol: string; companyName: string | null; epsEstimate: number | null }>(
  events: T[],
  query: string,
  expanded: boolean,
): T[] {
  const q = query.trim().toLowerCase();
  return events.filter((e) => {
    if (!expanded && e.epsEstimate === null) return false;
    if (!q) return true;
    return e.symbol.toLowerCase().includes(q) || (e.companyName ?? '').toLowerCase().includes(q);
  });
}

// --- Display + share -------------------------------------------------------

/** "Meta Platforms Inc" → "Meta Platforms". Corporate suffixes carry no
 *  information in a list. Pure; exported for tests. */
export function shortName(name: string | null): string | null {
  if (!name) return null;
  let out = name.trim();
  for (let i = 0; i < 2; i++) {
    const next = out.replace(/,?\s+(Inc|Incorporated|Corp|Corporation|Ltd|Limited|PLC|Holdings?|Co|Company)\.?$/i, '');
    if (next === out) break;
    out = next.trim();
  }
  return out || null;
}

/** Deterministic logo URL per symbol (Finnhub serves these keyless).
 *  Callers keep a monogram fallback — unknown tickers 404. */
export function logoUrl(symbol: string): string {
  return `https://finnhub.io/api/logo?symbol=${encodeURIComponent(symbol.trim().toUpperCase())}`;
}

/** $1.1T / $230B / $450M / $12K. Pure; exported for tests. */
export function formatMoneyShort(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

/** $1.43 / −$0.22. Pure; exported for tests. */
export function formatEps(eps: number | null): string | null {
  if (eps === null || !Number.isFinite(eps)) return null;
  return `${eps < 0 ? '−' : ''}$${Math.abs(eps).toFixed(2)}`;
}

/** The honest move for a reported row/card: the extended-hours print when
 *  the session produced one, else today's session move. Null when neither
 *  exists. Pure; exported for tests. */
export function pickMove(e: {
  priceChangePct: number | null;
  ahChangePct?: number | null;
}): { v: number; label: 'after hours' | 'today' } | null {
  const ah = e.ahChangePct ?? null;
  if (ah !== null && Number.isFinite(ah)) return { v: ah, label: 'after hours' };
  if (e.priceChangePct !== null && Number.isFinite(e.priceChangePct)) return { v: e.priceChangePct, label: 'today' };
  return null;
}

/** BEAT/MISS/INLINE from the EPS surprise; REPORTED when there's no
 *  estimate to judge against. ±1% is noise. Pure; exported for tests. */
export function beatVerdict(actual: number | null, estimate: number | null): 'BEAT' | 'MISS' | 'INLINE' | 'REPORTED' {
  if (actual === null) return 'REPORTED';
  if (estimate === null || estimate === 0) return 'REPORTED';
  const pct = (actual - estimate) / Math.abs(estimate);
  if (pct > 0.01) return 'BEAT';
  if (pct < -0.01) return 'MISS';
  return 'INLINE';
}

/** "4:32 PM ET" for card timestamps. Pure; exported for tests. */
export function etTimeLabel(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  return (
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(ms) +
    ' ET'
  );
}

/** "tonight" / "tomorrow before the open" / "Monday after the close" for
 *  share text and preview cards. Relative-day words follow the READER's
 *  calendar (viewer-local date), not the market's: at 9pm in Seattle an
 *  Oct-21 report is "tomorrow" even though it's already Oct 21 in ET.
 *  Session facts (open/close cutoffs, "as of ET") stay on ET. Pure;
 *  exported for tests. */
export function reportTimingLabel(date: string, hour: 'bmo' | 'amc' | '', nowMs: number = Date.now()): string {
  const half = hour === 'bmo' ? 'before the open' : 'after the close';
  const now = new Date(nowMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = localDay(now);
  if (date === today) {
    if (hour === 'bmo') return now.getHours() * 60 + now.getMinutes() < 12 * 60 ? 'this morning' : 'today before the open';
    if (hour === '') return 'today (time not announced)';
    return 'tonight';
  }
  const tomorrow = localDay(new Date(nowMs + 86400000));
  if (date === tomorrow) return `tomorrow ${half}`;
  const diffDays = Math.round((Date.parse(`${date}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86400000);
  if (diffDays > 0 && diffDays <= 6) {
    const wd = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
    return `${wd} ${half}`;
  }
  const md = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${md} ${half}`;
}

/** "$TSLA reports tonight: EPS est $0.44, rev est $28.4B. Beat 2/4 last
 *  quarters." Cashtagged for X ticker search. Pure; exported for tests. */
export function previewShareText(e: {
  symbol: string;
  date: string;
  hour: 'bmo' | 'amc' | '';
  epsEstimate: number | null;
  revenueEstimate: number | null;
  beats: Beats | null;
}): string {
  const bits = [`$${e.symbol} reports ${reportTimingLabel(e.date, e.hour)}`];
  const eps = formatEps(e.epsEstimate);
  const rev = formatMoneyShort(e.revenueEstimate);
  if (eps || rev) bits.push(`: ${[eps ? `EPS est ${eps}` : null, rev ? `rev est ${rev}` : null].filter(Boolean).join(', ')}`);
  else bits.push('');
  const tail = e.beats ? ` Beat ${e.beats.wins} of last ${e.beats.total}.` : '';
  return `${bits.join('')}${tail}`;
}

/** "$TSLA beats: EPS $0.52 vs $0.44 est (+18%), stock +6.2% after hours."
 *  The move is the extended-hours print when the session produced one
 *  (the honest reaction number), else today's session move — labeled
 *  accordingly. Pure; exported for tests. */
export function resultShareText(e: {
  symbol: string;
  epsActual: number | null;
  epsEstimate: number | null;
  priceChangePct: number | null;
  ahChangePct?: number | null;
}): string {
  const verdict = beatVerdict(e.epsActual, e.epsEstimate);
  const verb = verdict === 'BEAT' ? 'beats' : verdict === 'MISS' ? 'misses' : verdict === 'INLINE' ? 'meets' : 'reports';
  const a = formatEps(e.epsActual);
  const est = formatEps(e.epsEstimate);
  let line = `$${e.symbol} ${verb}`;
  if (a && est && verdict !== 'REPORTED') {
    const pct = ((e.epsActual! - e.epsEstimate!) / Math.abs(e.epsEstimate!)) * 100;
    line += `: EPS ${a} vs ${est} est (${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%)`;
  } else if (a) {
    line += `: EPS ${a} reported`;
  }
  const m = pickMove(e);
  if (m) {
    const p = m.v * 100;
    line += `, stock ${p >= 0 ? '+' : ''}${p.toFixed(1)}% ${m.label}`;
  }
  return `${line}.`;
}

export type EarningsCardType = 'preview' | 'result' | 'tonight' | 'morning';

// Earnings share links ride on a landing page, not the raw image: X (and
// iMessage/WhatsApp) only render a large card for an HTML page carrying
// twitter:card + og:image meta (same convention as the chess score cards).
// The image URL inside that metadata stays stable (no cache-buster) so
// re-shares reuse the cached card instead of refetching.
const EARNINGS_SITE = 'https://amoljadhav.ai';

/** Absolute card image URL (stable — crawlers cache per URL). */
export function earningsCardImageUrl(type: EarningsCardType, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ type, ...extra });
  return `${EARNINGS_SITE}/api/og/earnings?${params.toString()}`;
}

/** Absolute share landing URL: crawlers read the card meta, humans bounce. */
export function earningsSharePageUrl(type: EarningsCardType, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ type, ...extra });
  return `${EARNINGS_SITE}/share/earnings?${params.toString()}`;
}

/** X intent carrying the cashtagged text plus the share landing page. */
export function earningsXIntentUrl(type: EarningsCardType, text: string, extra?: Record<string, string>): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(earningsSharePageUrl(type, extra))}`;
}

/** ET calendar date (YYYY-MM-DD) for "tonight" math. Pure; exported for tests. */
export function etToday(nowMs: number = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(nowMs);
  return parts;
}

/** ET minutes since midnight. Pure; exported for tests. */
export function etMinutes(nowMs: number = Date.now()): number {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(nowMs);
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

/** Homepage teaser: the next evening reporting session. Before 4pm ET it's
 *  today's after-close list ("Tonight"); after the close it rolls to the
 *  next reporting day present in the week ("Monday after the close", …).
 *  Ranked blue-chips first (no market caps in the lean calendar path),
 *  top 3 tickers. Null when nothing is coming. Pure; exported for tests. */
export function upcomingAfterClose(
  events: EarningsEvent[],
  nowMs: number = Date.now(),
): { label: string; tickers: string[]; total: number } | null {
  const today = etToday(nowMs);
  const dates = [...new Set(events.filter((e) => e.hour === 'amc').map((e) => e.date))].sort();
  if (dates.length === 0) return null;
  const target = etMinutes(nowMs) < 16 * 60 ? dates.find((d) => d >= today) : dates.find((d) => d > today);
  if (!target) return null;
  const amc = events.filter((e) => e.date === target && e.hour === 'amc');
  const ranked = [...amc].sort(
    (a, b) => (BLUE_CHIP.has(b.symbol) ? 1 : 0) - (BLUE_CHIP.has(a.symbol) ? 1 : 0) || (a.symbol < b.symbol ? -1 : 1),
  );
  const label =
    target === today
      ? 'Tonight after the close'
      : `${new Date(`${target}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })} after the close`;
  return { label, tickers: ranked.slice(0, 3).map((e) => e.symbol), total: amc.length };
}

/** Full enrichment: calendar, then profiles for every reporter, then beat
 *  histories for the top 50 by popularity (the only rows that show the
 *  badge). The route adds today's move for reported rows on top. Never
 *  throws — partial data still renders. */
export async function fetchEnrichedWeek(nowMs: number = Date.now()): Promise<{ events: EnrichedEvent[]; fetchedAt: string }> {
  const { events, fetchedAt } = await fetchEarningsWeek(nowMs);
  if (events.length === 0) return { events: [], fetchedAt };
  const profiles = await fetchProfiles(events.map((e) => e.symbol));
  const withProfile: EnrichedEvent[] = events.map((e) => {
    const p = profiles.get(e.symbol);
    return {
      ...e,
      companyName: p?.name ?? null,
      marketCap: p?.marketCap ?? null,
      logo: p?.logo ?? null,
      blueChip: BLUE_CHIP.has(e.symbol),
      beats: null,
      priceChangePct: null,
      ahChangePct: null,
    };
  });
  const top = rankDay(withProfile).slice(0, 50);
  const beats = await fetchBeatsMap(top.map((e) => e.symbol));
  for (const e of withProfile) {
    const b = beats.get(e.symbol);
    if (b) e.beats = b;
  }
  return { events: withProfile.sort((a, b) => (a.date < b.date ? -1 : 1)), fetchedAt };
}
