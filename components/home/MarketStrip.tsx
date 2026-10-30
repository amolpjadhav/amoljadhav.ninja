'use client';

import { useEffect, useState } from 'react';
import { formatChangePct, type StripItem } from '@/lib/homepage';
import { marketStatus, type MarketStatus } from '@/lib/market-hours';
import { TONE_TEXT } from './tone';

// Index rows for the Stock Lookup tool card: name + day move per index,
// with a market status line. No chart — the card stays compact. Client-side
// only because the market status line has to be read off the viewer's clock
// rather than baked into a cached server render that might be hours old.

export default function MarketStrip({ items }: { items: StripItem[] }) {
  // Null until mount: the server has no business guessing whether the market
  // is open for the reader, and a mismatch here would be a hydration error.
  const [status, setStatus] = useState<MarketStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(marketStatus(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <p className="mb-2 flex min-h-4 items-center gap-1.5 font-sans text-sm text-white/45">
        {status && (
          <>
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${status.live ? 'bg-[#0aee3c]/80' : 'bg-white/25'}`}
            />
            {status.text}
          </>
        )}
      </p>

      <ul className="font-sans text-sm tabular-nums">
        {items.map((item) => {
          const move = formatChangePct(item.changePct);
          return (
            <li key={item.label} className="flex items-baseline justify-between gap-2 py-0.5">
              <span className="text-white/50">{item.label}</span>
              <span className={TONE_TEXT[move.tone]}>{move.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
