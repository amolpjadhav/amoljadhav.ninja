'use client';

import { useState } from 'react';

type Market = 'network' | 'unproven';

const DATA: Record<
  Market,
  { winner: 'first' | 'second'; firstShare: number; secondShare: number; explanation: string }
> = {
  network: {
    winner: 'first',
    firstShare: 70,
    secondShare: 15,
    explanation:
      'Once enough people are already on it — enough friends, enough buyers and sellers — leaving means convincing everyone you know to leave too. A better competitor showing up later usually isn’t enough to overcome that.',
  },
  unproven: {
    winner: 'second',
    firstShare: 25,
    secondShare: 55,
    explanation:
      'The first company spends years and real money proving the idea even works, fixing the bugs nobody warned them about. A second company gets to skip straight to a cheaper, more polished version once customers already understand why they’d want one.',
  },
};

export default function FirstMoverAdvantage() {
  const [market, setMarket] = useState<Market | null>(null);

  const data = market ? DATA[market] : null;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        You&rsquo;re deciding whether to launch something now or wait and see what happens. Pick the kind of
        market you&rsquo;re actually in.
      </p>

      <div className="flex flex-col gap-2 mb-5">
        <button
          onClick={() => setMarket('network')}
          className={`text-left text-sm px-4 py-3 rounded-lg border transition-colors ${
            market === 'network'
              ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
              : 'border-white/15 text-white/70 hover:border-white/30'
          }`}
        >
          A network effects market &mdash; people need to convince their friends to join too (a marketplace, a
          social app, a dating app)
        </button>
        <button
          onClick={() => setMarket('unproven')}
          className={`text-left text-sm px-4 py-3 rounded-lg border transition-colors ${
            market === 'unproven'
              ? 'border-[#f472b6]/60 text-[#f472b6] bg-[#f472b6]/10'
              : 'border-white/15 text-white/70 hover:border-white/30'
          }`}
        >
          A new, unproven idea &mdash; nobody&rsquo;s done this before, and customers don&rsquo;t yet know they
          want it
        </button>
      </div>

      {data && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/85 text-sm mb-3">
            Winner: <strong className={data.winner === 'first' ? 'text-[#0aee3c]' : 'text-[#f472b6]'}>
              {data.winner === 'first' ? 'the first mover' : 'the second mover'}
            </strong>
          </p>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-white/50 text-xs w-24 shrink-0">First mover</span>
            <div className="flex-1 bg-white/5 rounded h-4 overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${data.firstShare}%`, background: data.winner === 'first' ? '#0aee3c' : 'rgba(255,255,255,0.25)' }}
              />
            </div>
            <span className="text-white/50 text-xs w-10 text-right">{data.firstShare}%</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/50 text-xs w-24 shrink-0">Second mover</span>
            <div className="flex-1 bg-white/5 rounded h-4 overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${data.secondShare}%`, background: data.winner === 'second' ? '#f472b6' : 'rgba(255,255,255,0.25)' }}
              />
            </div>
            <span className="text-white/50 text-xs w-10 text-right">{data.secondShare}%</span>
          </div>

          <p className="text-white/60 text-sm leading-relaxed">{data.explanation}</p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why the answer flips</p>
        <p className="text-white/60 text-sm leading-relaxed">
          There&rsquo;s no universal rule here &mdash; &ldquo;move fast&rdquo; and &ldquo;let someone else go
          first&rdquo; are both good advice, just in different situations. The real question isn&rsquo;t whether
          to go first. It&rsquo;s whether the advantage in your specific market comes from being early, or from
          being right after someone else already paid to find out what &ldquo;right&rdquo; looks like.
        </p>
      </div>
    </div>
  );
}
