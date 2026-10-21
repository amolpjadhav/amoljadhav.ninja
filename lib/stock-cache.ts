// Tiny SWR cache for the stock lookup: instant stale paint, background
// revalidate, hover prefetch. No dependency — the lookup keeps previous
// data across tickers (keepPreviousData) and refetches quietly, instead of
// flashing skeletons on every switch. Import-free on purpose: node:test
// imports this file directly and cannot resolve cross-file TS imports
// (same constraint as lib/earnings.ts). Fast/Full shapes stay generic so
// this module never imports them.
export interface StockCacheEntry<F, D> {
  fast: F | null;
  full: D | null;
  fastAt: number;
  fullAt: number;
}

export interface StockCache<F, D> {
  get(symbol: string): StockCacheEntry<F, D> | null;
  setFast(symbol: string, fast: F, at?: number): void;
  setFull(symbol: string, full: D, at?: number): void;
  clear(): void;
}

export function createStockCache<F, D>(): StockCache<F, D> {
  const map = new Map<string, StockCacheEntry<F, D>>();
  const key = (s: string) => s.trim().toUpperCase();
  return {
    get: (symbol) => map.get(key(symbol)) ?? null,
    setFast: (symbol, fast, at = Date.now()) => {
      const k = key(symbol);
      const prev = map.get(k);
      map.set(k, { fast, full: prev?.full ?? null, fastAt: at, fullAt: prev?.fullAt ?? 0 });
    },
    setFull: (symbol, full, at = Date.now()) => {
      const k = key(symbol);
      const prev = map.get(k);
      map.set(k, { fast: prev?.fast ?? null, full, fastAt: prev?.fastAt ?? 0, fullAt: at });
    },
    clear: () => map.clear(),
  };
}

/** Prefetch endpoints for a hovered/focused ticker: fast quote only — the
 *  hero's first paint. Full payloads warm on actual lookup. */
export function stockFastUrl(symbol: string): string {
  return `/api/stocks/${encodeURIComponent(symbol.trim().toUpperCase())}/fast`;
}

export function stockFullUrl(symbol: string): string {
  return `/api/stocks/${encodeURIComponent(symbol.trim().toUpperCase())}`;
}
