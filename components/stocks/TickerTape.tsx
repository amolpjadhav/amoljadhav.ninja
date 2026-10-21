'use client';

import { useMemo } from 'react';
import type { MarketQuote } from '@/lib/stocks';
import { TickerTape, useMarketMovers, useMarketStrip } from './MarketOverview';

// Page-top tape: indexes paint first (the fast 7-symbol strip), movers
// append as the slower fan-out lands. One deduped stream, symbols in
// index order first so the tape always opens SPY-style.
export default function TapeBar() {
  const { data: strip } = useMarketStrip();
  const { data: movers } = useMarketMovers();
  const items = useMemo(() => {
    const seen = new Set<string>();
    const out: MarketQuote[] = [];
    for (const q of [
      ...(strip?.strip ?? []),
      ...(movers?.mag7 ?? []),
      ...(movers?.gainers ?? []),
      ...(movers?.losers ?? []),
    ]) {
      // A blank symbol renders as a bare "▼ −0.3%" with no name — drop
      // those rows at the boundary instead of showing a nameless tile.
      const sym = q.symbol?.trim();
      if (!sym || seen.has(sym)) continue;
      seen.add(sym);
      out.push(q);
    }
    return out;
  }, [strip, movers]);
  if (items.length === 0) return null;
  return <TickerTape items={items} />;
}
