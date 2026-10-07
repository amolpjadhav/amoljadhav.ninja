'use client';

import { Suspense } from 'react';
import StocksLookup from '@/components/stocks/StocksLookup';

// Article embed for the stock lookup tool (<div data-widget="stocks-lookup">).
// The Suspense boundary is required: StocksLookup reads useSearchParams() for
// shareable ?ticker= links, which suspends during prerender.
export default function StocksLookupWidget() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm animate-pulse">Loading stock lookup…</p>}>
      <StocksLookup initialTicker="" />
    </Suspense>
  );
}
