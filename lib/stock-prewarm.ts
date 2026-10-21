// Nightly stock prewarm plan: which tickers to warm on which endpoints.
// Pure — the route supplies the universe and the earnings-week symbols, so
// tests pin the ordering and caps without network. Import-free on purpose:
// node:test imports this file directly and cannot resolve cross-file TS
// imports (same constraint as lib/earnings.ts).
export interface PrewarmPlan {
  /** Broad universe: fast quotes only (Nasdaq, no Finnhub budget). */
  light: string[];
  /** Priority reporters: fast + dots + news + full payload (Finnhub-bound). */
  full: string[];
}

function cleanTickers(list: string[]): string[] {
  const out: string[] = [];
  for (const raw of list) {
    const s = (raw ?? '').trim().toUpperCase();
    if (/^[A-Z][A-Z0-9.]{0,9}$/.test(s) && !out.includes(s)) out.push(s);
  }
  return out;
}

/** Blue-chip reporters first (highest value), then universe order (Mag 7
 *  lead the curated list). Caps keep the nightly job inside serverless and
 *  Finnhub 60/min budgets. */
export function buildPrewarmPlan(opts: {
  universe: string[];
  earnings: string[];
  blueChips: string[];
  lightLimit?: number;
  fullLimit?: number;
}): PrewarmPlan {
  const blue = new Set(cleanTickers(opts.blueChips));
  const earningsBlue = cleanTickers(opts.earnings).filter((s) => blue.has(s));
  const universe = cleanTickers(opts.universe);
  const ordered = [...earningsBlue, ...universe].filter((s, i, a) => a.indexOf(s) === i);
  return {
    light: ordered.slice(0, opts.lightLimit ?? 48),
    full: ordered.slice(0, opts.fullLimit ?? 8),
  };
}
