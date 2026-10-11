'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Ticker jump for the Stock Lookup tool card: typing here deep-links
// straight into a lookup (?ticker=), the same URL shares produce.
export default function TickerLookup() {
  const [value, setValue] = useState('');
  const router = useRouter();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = value.trim();
        if (t) router.push(`/blog/look-up-stock-and-company-details?ticker=${encodeURIComponent(t)}`);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Look up a ticker"
        aria-label="Look up a ticker"
        className="min-w-0 flex-1 rounded border border-[#0aee3c]/25 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs uppercase text-white/90 placeholder:text-white/30 placeholder:normal-case focus:border-[#0aee3c]/60 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded bg-[#0aee3c] px-3 py-1.5 text-xs font-bold text-black transition-all hover:brightness-110"
      >
        Go
      </button>
    </form>
  );
}
