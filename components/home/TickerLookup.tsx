'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatChangePct } from '@/lib/homepage';
import { TONE_TEXT } from './tone';

// Ticker jump for the Stock Lookup tool card: typing here deep-links
// straight into a lookup (?ticker=), the same URL shares produce.
//
// An empty box is a dead end — most people can't name a ticker on the spot —
// so it suggests while you type (company name or symbol, via the SEC map)
// and puts the Mag 7 underneath as one-tap shortcuts that double as a read
// on where the market's heaviest names are today.

const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';

// Same order as MAG7 in lib/stocks, which is what /api/markets/movers ranks.
// Rendered immediately with em-dashes for the moves, so the shortcuts work
// even when the quote feed is slow or down.
const MAG7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'];

interface Candidate {
  ticker: string;
  title: string;
}

interface Mover {
  symbol: string;
  changePct: number | null;
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function TickerLookup() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState<Candidate[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [mag7, setMag7] = useState<Mover[]>(() => MAG7.map((symbol) => ({ symbol, changePct: null })));
  const [mag7Loaded, setMag7Loaded] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const go = (ticker: string) => {
    const t = ticker.trim();
    if (!t) return;
    setOpen(false);
    router.push(`${LOOKUP_PATH}?ticker=${encodeURIComponent(t)}`);
  };

  // Debounced so a four-letter ticker costs one request, not four. Every
  // state write lands in the timer rather than the effect body, which keeps
  // a keystroke to one render pass.
  useEffect(() => {
    const q = value.trim();
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      if (!q) {
        setResults([]);
        setOpen(false);
        return;
      }
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`);
        const json: unknown = await res.json();
        if (cancelled) return;
        const list = (json as { results?: Candidate[] } | null)?.results ?? [];
        setResults(list);
        setOpen(list.length > 0);
        setActive(-1);
      } catch {
        if (!cancelled) {
          setResults([]);
          setOpen(false);
        }
      }
    }, q ? 180 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  // The Mag 7 quotes are a nicety on top of working shortcuts, so they wait
  // for idle rather than competing with the rest of the homepage for the
  // network. The movers route is a slower two-phase fan-out than the strip.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/markets/movers');
        const json: unknown = await res.json();
        const rows = (json as { mag7?: { symbol?: unknown; changePct?: unknown }[] } | null)?.mag7 ?? [];
        const bySymbol = new Map(
          rows
            .filter((q): q is { symbol: string; changePct: unknown } => typeof q?.symbol === 'string')
            .map((q) => [q.symbol, typeof q.changePct === 'number' ? q.changePct : null] as const),
        );
        if (!cancelled && bySymbol.size > 0) {
          // Keep the fixed order rather than the response's: a block that
          // reshuffles between loads is harder to read than a stale one.
          setMag7(MAG7.map((symbol) => ({ symbol, changePct: bySymbol.get(symbol) ?? null })));
        }
      } catch {
        /* keep the shortcuts, just without the moves */
      } finally {
        if (!cancelled) setMag7Loaded(true);
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

  // A click anywhere else dismisses the list.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      // Only hijack Enter when a suggestion is highlighted; otherwise the
      // form submits whatever was typed, as it always did.
      e.preventDefault();
      go(results[active].ticker);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(results.length > 0)}
          placeholder="Look up a ticker"
          aria-label="Look up a ticker"
          role="combobox"
          aria-expanded={open}
          aria-controls="ticker-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `ticker-option-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded border border-[#0aee3c]/25 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs uppercase text-white/90 placeholder:text-white/30 placeholder:normal-case focus:border-[#0aee3c]/60 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded bg-[#0aee3c] px-3 py-1.5 text-xs font-bold text-black transition-all hover:brightness-110"
        >
          Go
        </button>
      </form>

      {open && results.length > 0 && (
        // Opens upward: the card sits at the bottom of the Tools row, so a
        // downward list would hang off the card.
        <ul
          id="ticker-suggestions"
          role="listbox"
          aria-label="Ticker suggestions"
          className="absolute bottom-full left-0 right-0 z-20 mb-1 overflow-hidden rounded border border-[#0aee3c]/30 bg-black shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        >
          {results.map((r, i) => (
            <li
              key={r.ticker}
              id={`ticker-option-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              // Pointer down would blur the input before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(r.ticker)}
              className={`flex cursor-pointer items-baseline gap-2 px-2.5 py-1.5 ${
                i === active ? 'bg-[#0aee3c]/10' : ''
              }`}
            >
              <span className="font-mono text-xs text-[#0aee3c]">{r.ticker}</span>
              <span className="truncate text-[11px] text-white/45">{r.title}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-white/25">Mag 7</p>
        <div className="grid grid-cols-4 gap-1" aria-busy={!mag7Loaded}>
          {mag7.map((m) => {
            const move = formatChangePct(m.changePct);
            return (
              <button
                key={m.symbol}
                type="button"
                onClick={() => go(m.symbol)}
                aria-label={`${m.symbol}, ${move.text}. Look up.`}
                className="flex min-w-0 flex-col items-center rounded border border-[#0aee3c]/20 px-1 py-1 transition-colors hover:border-[#0aee3c]/50 hover:bg-white/[0.03]"
              >
                <span className="font-mono text-[11px] leading-tight text-[#0aee3c]/80">{m.symbol}</span>
                <span
                  aria-hidden={!mag7Loaded}
                  className={`font-mono text-[10px] leading-tight ${TONE_TEXT[move.tone]} ${
                    mag7Loaded ? '' : 'motion-safe:animate-pulse blur-[2px]'
                  }`}
                >
                  {move.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
