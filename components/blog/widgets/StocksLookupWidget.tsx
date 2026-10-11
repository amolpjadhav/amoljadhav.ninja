'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StocksLookup from '@/components/stocks/StocksLookup';
import CryptoLookup from '@/components/stocks/CryptoLookup';

type Mode = 'stocks' | 'crypto';

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const btn = (active: boolean) =>
    `text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
      active ? 'bg-white/10 text-white/90' : 'text-white/40 hover:text-white/70'
    }`;
  return (
    <div role="tablist" aria-label="Lookup type" className="flex gap-1 mb-6 border-b border-white/10 pb-3">
      <button role="tab" aria-selected={mode === 'stocks'} type="button" onClick={() => onChange('stocks')} className={btn(mode === 'stocks')}>
        Stocks
      </button>
      <button role="tab" aria-selected={mode === 'crypto'} type="button" onClick={() => onChange('crypto')} className={btn(mode === 'crypto')}>
        Crypto
      </button>
    </div>
  );
}

function LookupWithMode() {
  const searchParams = useSearchParams();
  // Shared ?coin= links open straight into crypto mode.
  const [mode, setMode] = useState<Mode>(() => (searchParams.get('coin') ? 'crypto' : 'stocks'));
  return (
    <div>
      <ModeToggle mode={mode} onChange={setMode} />
      {mode === 'stocks' ? <StocksLookup initialTicker="" /> : <CryptoLookup initialCoin="" />}
    </div>
  );
}

// Article embed for the lookup tool (<div data-widget="stocks-lookup">).
// The Suspense boundary is required: the lookups read useSearchParams() for
// shareable ?ticker= / ?coin= links, which suspends during prerender.
export default function StocksLookupWidget() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm animate-pulse">Loading lookup…</p>}>
      <LookupWithMode />
    </Suspense>
  );
}
