// Crypto lookup data layer: CoinGecko-first coin profiles with a DeFiLlama
// price fallback. Server-side only: the demo key stays in an env var and
// every fetch carries Next revalidation so the free quota survives.
//
// Self-contained (no sibling lib imports): explicit .ts extensions fail tsc,
// extensionless ones fail node --test. Percent changes are FRACTIONS (0.0082)
// to match formatPct in lib/stocks — CoinGecko reports percent units, so the
// normalizer divides by 100.
export const COIN_RANK_CUTOFF = 500;

export interface CoinLinks {
  homepage: string | null;
  whitepaper: string | null;
  explorers: string[];
}

export interface CoinResponse {
  id: string; // CoinGecko id (bitcoin), the canonical lookup key
  symbol: string; // BTC
  name: string; // Bitcoin
  image: string | null;
  rank: number | null;
  price: number | null;
  change24h: number | null; // absolute USD move
  changePct24h: number | null; // fractions, not percents
  changePct7d: number | null;
  changePct30d: number | null;
  changePct1y: number | null;
  high24h: number | null;
  low24h: number | null;
  ath: number | null;
  athChangePct: number | null; // fraction, usually negative
  athDate: string | null; // YYYY-MM-DD
  atl: number | null;
  atlChangePct: number | null;
  atlDate: string | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  circulating: number | null;
  total: number | null;
  maxSupply: number | null;
  spark7d: number[];
  description: string | null;
  genesisDate: string | null; // YYYY-MM-DD
  categories: string[];
  links: CoinLinks;
  sentimentUp: number | null; // 0-100 (% voting bullish)
  lastUpdated: string | null;
  lowRank: boolean; // outside the top 500 (or unranked): thin, verify elsewhere
  degraded: boolean; // fallback price-only payload
  warnings: string[];
  fetchedAt: string;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s : null;
}

function frac(pct: unknown): number | null {
  const n = num(pct);
  return n === null ? null : n / 100;
}

function dateOnly(v: unknown): string | null {
  const s = str(v);
  return s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

// CoinGecko ids are lowercase slugs (bitcoin, solana). Symbols and names
// resolve through search; this only validates the id charset for direct
// fetches and the API route guard.
export function normalizeCoinId(input: string): string {
  const id = input.trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(id) ? id : '';
}

export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
}

export interface CoinSuggestion {
  id: string;
  name: string;
  symbol: string;
}

// Picks one coin from a /search coin list: every exact match (symbol, id,
// or name — case-insensitive) competes by rank, so "bitcoin" finds Bitcoin
// and not the memecoin with the $BITCOIN ticker. Otherwise the top three
// ranked suggestions for a "did you mean" error.
export function pickCoinResult(
  query: string,
  coins: SearchCoin[],
): { id: string } | { suggestions: CoinSuggestion[] } | null {
  const q = query.trim().toLowerCase();
  const qu = query.trim().toUpperCase();
  if (!q || coins.length === 0) return null;
  const byRank = (a: SearchCoin, b: SearchCoin) => (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity);
  const exact = coins
    .filter((c) => c.symbol.toUpperCase() === qu || c.id.toLowerCase() === q || c.name.toLowerCase() === q)
    .sort(byRank)[0];
  if (exact) return { id: exact.id };
  const suggestions = [...coins]
    .sort(byRank)
    .slice(0, 3)
    .map((c) => ({ id: c.id, name: c.name, symbol: c.symbol }));
  return suggestions.length > 0 ? { suggestions } : null;
}

// Prices span $80,000 to $0.00001: two decimals with commas above $1,
// otherwise four significant digits (never scientific notation in the UI).
export function formatCryptoPrice(p: number | null | undefined): string {
  if (p === null || p === undefined || !Number.isFinite(p) || p <= 0) return '—';
  if (p >= 1) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  // toPrecision emits scientific notation for dust (1.234e-7); expand via
  // toFixed with room for four significant digits instead.
  const places = Math.min(100, -Math.floor(Math.log10(p)) + 4);
  let s = p.toFixed(places);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  const [whole, dec = ''] = s.split('.');
  return `$${whole}.${(dec + '00').slice(0, Math.max(2, dec.length))}`;
}

// Share of max supply already emitted, as a fraction — null when max supply
// is unknown (ETH) or the figures disagree.
export function supplyEmittedPct(circulating: number | null, maxSupply: number | null): number | null {
  if (circulating === null || maxSupply === null || !Number.isFinite(circulating) || !Number.isFinite(maxSupply)) {
    return null;
  }
  if (maxSupply <= 0 || circulating < 0) return null;
  return Math.min(1, circulating / maxSupply);
}

// Share text takes preformatted price/pct (the client owns lib/stocks'
// formatters; this module stays import-free).
export function coinShareText(symbol: string, name: string, priceText: string | null, pctText: string | null): string {
  if (!priceText) return `$${symbol} — ${name}`;
  return `$${symbol} ${priceText}${pctText ? ` (${pctText})` : ''} — ${name}`;
}

function cleanDescription(v: unknown): string | null {
  const raw = str((v as Record<string, unknown> | null)?.en ?? v);
  if (!raw) return null;
  const text = raw
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  const para = text
    .split(/\n+/)
    .map((p) => p.trim())
    .find((p) => p.length > 0);
  if (!para) return null;
  return para.length > 1200 ? `${para.slice(0, 1200).trimEnd()}…` : para;
}

// Normalizes one /coins/{id} payload. Unknown fields degrade to null — the
// profile hides missing facts instead of printing dashes.
export function normalizeCoin(id: string, json: unknown): CoinResponse | null {
  if (typeof json !== 'object' || json === null) return null;
  const c = json as Record<string, unknown>;
  const m = (c.market_data ?? {}) as Record<string, unknown>;
  const usd = (v: unknown): number | null => num((v as Record<string, unknown> | null)?.usd);
  const links = (c.links ?? {}) as Record<string, unknown>;
  const homepage = links.homepage;
  const explorers = links.blockchain_site;
  const spark = (m.sparkline_7d as Record<string, unknown> | null)?.price;
  const rank = num(c.market_cap_rank ?? m.market_cap_rank);
  const now = new Date().toISOString();
  return {
    id,
    symbol: str(c.symbol)?.toUpperCase() ?? id.toUpperCase(),
    name: str(c.name) ?? id,
    image: str((c.image as Record<string, unknown> | null)?.large ?? (c.image as Record<string, unknown> | null)?.small),
    rank,
    price: usd(m.current_price),
    change24h: usd(m.price_change_24h),
    changePct24h: frac(m.price_change_percentage_24h),
    changePct7d: frac(m.price_change_percentage_7d),
    changePct30d: frac(m.price_change_percentage_30d),
    changePct1y: frac(m.price_change_percentage_1y),
    high24h: usd(m.high_24h),
    low24h: usd(m.low_24h),
    ath: usd(m.ath),
    athChangePct: frac(m.ath_change_percentage),
    athDate: dateOnly(m.ath_date),
    atl: usd(m.atl),
    atlChangePct: frac(m.atl_change_percentage),
    atlDate: dateOnly(m.atl_date),
    marketCap: usd(m.market_cap),
    fdv: usd(m.fully_diluted_valuation),
    volume24h: usd(m.total_volume),
    circulating: num(m.circulating_supply),
    total: num(m.total_supply),
    maxSupply: num(m.max_supply),
    spark7d: Array.isArray(spark) ? spark.filter((p): p is number => typeof p === 'number' && Number.isFinite(p)) : [],
    description: cleanDescription(c.description),
    genesisDate: dateOnly(c.genesis_date),
    categories: Array.isArray(c.categories) ? c.categories.filter((g): g is string => typeof g === 'string').slice(0, 6) : [],
    links: {
      homepage: Array.isArray(homepage) ? (str(homepage.find((h) => str(h))) ?? null) : str(homepage),
      whitepaper: str(links.whitepaper),
      explorers: Array.isArray(explorers) ? explorers.map((e) => str(e)).filter((e): e is string => e !== null).slice(0, 2) : [],
    },
    sentimentUp: num(c.sentiment_votes_up_percentage),
    lastUpdated: str(m.last_updated),
    lowRank: rank === null || rank > COIN_RANK_CUTOFF,
    degraded: false,
    warnings: [],
    fetchedAt: now,
  };
}

const CG = 'https://api.coingecko.com/api/v3';

function cgHeaders(): Record<string, string> {
  const key = process.env.COINGECKO_DEMO_API_KEY?.trim();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (key) headers['x-cg-demo-api-key'] = key;
  return headers;
}

async function cgJson(path: string, revalidate: number, timeoutMs: number): Promise<{ status: number; json: unknown }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${CG}${path}`, {
      headers: cgHeaders(),
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate },
    });
    // CoinGecko throttles bursts: one retry after a beat, per their docs.
    if (res.status === 429 && attempt === 0) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    const json: unknown = await res.json().catch(() => null);
    return { status: res.status, json };
  }
  throw new Error('coingecko retries exhausted');
}

// Reference-price fallback when CoinGecko is down or throttled: DeFiLlama is
// keyless and generous, but carries no metadata — the profile renders the
// snapshot only and says so.
async function llamaFallback(id: string): Promise<CoinResponse | null> {
  try {
    const res = await fetch(`https://coins.llama.fi/prices/current/coingecko:${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as {
      coins?: Record<string, { price?: unknown; symbol?: unknown }>;
    } | null;
    const entry = json?.coins?.[`coingecko:${id}`];
    const price = num(entry?.price);
    if (price === null) return null;
    const now = new Date().toISOString();
    return {
      id,
      symbol: str(entry?.symbol)?.toUpperCase() ?? id.toUpperCase(),
      name: id,
      image: null,
      rank: null,
      price,
      change24h: null,
      changePct24h: null,
      changePct7d: null,
      changePct30d: null,
      changePct1y: null,
      high24h: null,
      low24h: null,
      ath: null,
      athChangePct: null,
      athDate: null,
      atl: null,
      atlChangePct: null,
      atlDate: null,
      marketCap: null,
      fdv: null,
      volume24h: null,
      circulating: null,
      total: null,
      maxSupply: null,
      spark7d: [],
      description: null,
      genesisDate: null,
      categories: [],
      links: { homepage: null, whitepaper: null, explorers: [] },
      sentimentUp: null,
      lastUpdated: null,
      lowRank: true,
      degraded: true,
      warnings: ['CoinGecko is unreachable — showing a reference price only.'],
      fetchedAt: now,
    };
  } catch {
    return null;
  }
}

// Full coin profile. Null on unknown id (route 404s); throws when every
// upstream is down (route 502s).
export async function getCoinData(id: string): Promise<CoinResponse | null> {
  let status = 0;
  try {
    const r = await cgJson(
      `/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
      300,
      10000,
    );
    status = r.status;
    if (r.status === 200) return normalizeCoin(id, r.json);
    if (r.status === 404) return null;
  } catch {
    status = 0;
  }
  if (status === 404) return null;
  return (await llamaFallback(id)) ?? (() => {
    throw new Error('crypto upstreams unreachable');
  })();
}

export interface CoinCard {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  price: number | null;
  changePct24h: number | null;
  marketCap: number | null;
  spark7d: number[];
}

// Lean quote for social metadata and the OG card: full getCoinData is
// seconds cold and crawlers give up before reading og:image.
export async function getCoinCard(id: string): Promise<CoinCard | null> {
  try {
    const r = await cgJson(
      `/coins/markets?vs_currency=usd&ids=${encodeURIComponent(id)}&sparkline=true&price_change_percentage=24h`,
      300,
      8000,
    );
    if (r.status !== 200 || !Array.isArray(r.json)) return null;
    const row = r.json[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    const spark = (row.sparkline_in_7d as Record<string, unknown> | null)?.price;
    return {
      id,
      symbol: str(row.symbol)?.toUpperCase() ?? id.toUpperCase(),
      name: str(row.name) ?? id,
      image: str(row.image),
      price: num(row.current_price),
      changePct24h: frac(row.price_change_percentage_24h),
      marketCap: num(row.market_cap),
      spark7d: Array.isArray(spark) ? spark.filter((p): p is number => typeof p === 'number' && Number.isFinite(p)) : [],
    };
  } catch {
    return null;
  }
}

// Daily top-250 board for instant resolution: /search takes 10-20s cold,
// while one markets call (cached a day) answers every major locally.
async function fetchTopCoins(): Promise<SearchCoin[] | null> {
  try {
    const r = await cgJson(
      '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false',
      86400,
      10000,
    );
    if (r.status !== 200 || !Array.isArray(r.json)) return null;
    return (r.json as Record<string, unknown>[])
      .map((row) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        symbol: String(row.symbol ?? ''),
        market_cap_rank: num(row.market_cap_rank),
      }))
      .filter((c) => c.id !== '');
  } catch {
    return null;
  }
}

// Symbol/name resolution: exact matches settle from the daily top-250 board
// ({ id }); anything else goes to CoinGecko search ({ id } when unambiguous,
// { suggestions } for a "did you mean" error), null when nothing matches or
// every endpoint is down. Exact-in-250 always wins by rank — anything search
// alone could add ranks worse. Mappings barely change, so callers cache the
// search leg an hour.
export async function searchCoins(query: string): Promise<{ id: string } | { suggestions: CoinSuggestion[] } | null> {
  const top = await fetchTopCoins();
  if (top) {
    const hit = pickCoinResult(query, top);
    if (hit && 'id' in hit) return hit;
  }
  try {
    const r = await cgJson(`/search?query=${encodeURIComponent(query.trim())}`, 3600, 20000);
    if (r.status !== 200) return null;
    const coins = ((r.json as Record<string, unknown> | null)?.coins ?? []) as SearchCoin[];
    if (!Array.isArray(coins)) return null;
    return pickCoinResult(query, coins);
  } catch {
    return null;
  }
}
