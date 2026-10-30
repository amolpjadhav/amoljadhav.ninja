'use client';

import { useEffect, useState } from 'react';
import { formatChangePct } from '@/lib/homepage';
import { TONE_TEXT } from './tone';

// Mag 7 as a one-line scrolling tape for the Stock Lookup tool card.
// Same scroll/pause/reduced-motion mechanics as the page-top tape
// (.tape/.tape-track in globals.css): it scrolls slowly, pauses on
// hover or focus, and renders as a static row for reduced motion.
// Every symbol links straight into its lookup. Rendered immediately
// with em-dashes, then filled in when the movers feed arrives.

const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';

// Same order as MAG7 in lib/stocks, which is what /api/markets/movers ranks.
const MAG7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'];

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function Mag7Summary({ limit = MAG7.length }: { limit?: number }) {
  const [moves, setMoves] = useState<Map<string, number | null>>(() => new Map());
  const symbols = MAG7.slice(0, Math.max(0, limit));

  // The quotes are a nicety on top of working shortcuts, so they wait
  // for idle rather than competing with the rest of the homepage for
  // the network.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/markets/movers');
        const json: unknown = await res.json();
        const rows = (json as { mag7?: { symbol?: unknown; changePct?: unknown }[] } | null)?.mag7 ?? [];
        const bySymbol = new Map<string, number | null>();
        for (const q of rows) {
          if (typeof q?.symbol === 'string') {
            bySymbol.set(q.symbol, typeof q.changePct === 'number' ? q.changePct : null);
          }
        }
        if (!cancelled && bySymbol.size > 0) setMoves(bySymbol);
      } catch {
        /* keep the shortcuts, just without the moves */
      }
    };
    const w = window as IdleWindow;
    const handle = w.requestIdleCallback ? w.requestIdleCallback(load) : window.setTimeout(load, 1200);
    return () => {
      cancelled = true;
      if (w.cancelIdleCallback && w.requestIdleCallback) w.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {symbols.map((symbol) => {
        const move = formatChangePct(moves.get(symbol) ?? null);
        return (
          <a
            key={symbol}
            href={`${LOOKUP_PATH}?ticker=${encodeURIComponent(symbol)}`}
            aria-label={`${symbol}, ${move.text}. Look up.`}
            className="flex items-center gap-1 px-2.5 font-sans text-sm tabular-nums"
          >
            <span className="text-white/80">{symbol}</span>
            <span className={TONE_TEXT[move.tone]}>
              {move.tone === 'up' ? '▲' : move.tone === 'down' ? '▼' : '•'} {move.text}
            </span>
          </a>
        );
      })}
    </div>
  );

  return (
    <div>
      <p className="mb-1 font-mono text-xs tracking-wide text-white/40 uppercase">Mag 7</p>
      <div
        className="tape min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
        role="marquee"
        aria-label="Mag 7 moves"
      >
        <div className="tape-track flex h-6 items-center">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
