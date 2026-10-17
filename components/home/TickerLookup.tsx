'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Ticker jump for the Stock Lookup tool card: typing here deep-links
// straight into a lookup (?ticker=), the same URL shares produce.
//
// An empty box is a dead end — most people can't name a ticker on the spot —
// so it suggests while you type (company name or symbol, via the SEC map).

const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';

interface Candidate {
  ticker: string;
  title: string;
}

export default function TickerLookup() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState<Candidate[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
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
          placeholder="Ticker…"
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
          className="shrink-0 rounded border border-[#0aee3c]/50 bg-transparent px-3 py-1.5 text-xs font-semibold text-[#0aee3c] transition-all hover:bg-[#0aee3c]/10"
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
    </div>
  );
}
