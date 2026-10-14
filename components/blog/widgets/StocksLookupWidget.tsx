'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StocksLookup from '@/components/stocks/StocksLookup';
import CryptoLookup from '@/components/stocks/CryptoLookup';

function LookupSwitch() {
  const searchParams = useSearchParams();
  // Shared ?coin= links open straight into crypto mode. A coin picked or
  // typed in the unified stock search swaps here; back returns to stocks.
  // No tabs: the search box figures out the type.
  const [coin, setCoin] = useState<string | null>(() => searchParams.get('coin'));
  if (coin) {
    return <CryptoLookup initialCoin={coin} onBack={() => setCoin(null)} />;
  }
  return <StocksLookup initialTicker="" onPickCoin={(id) => setCoin(id)} />;
}

// Article embed for the lookup tool (<div data-widget="stocks-lookup">).
// The Suspense boundary is required: the lookups read useSearchParams() for
// shareable ?ticker= / ?coin= links, which suspends during prerender.
export default function StocksLookupWidget() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm animate-pulse">Loading lookup…</p>}>
      <LookupSwitch />
    </Suspense>
  );
}
