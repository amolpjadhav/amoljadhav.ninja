'use client';

import { useState } from 'react';

type Mode = 'cooperate' | 'compete';

const NON_ZERO: Record<Mode, { total: number; you: number; them: number }> = {
  cooperate: { total: 200, you: 100, them: 100 },
  compete: { total: 60, you: 30, them: 30 },
};

export default function ZeroSum() {
  const [yourShare, setYourShare] = useState(50);
  const [mode, setMode] = useState<Mode>('cooperate');

  const theirShare = 100 - yourShare;
  const nonZero = NON_ZERO[mode];

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        You&rsquo;re splitting a $100 pizza with a friend. Drag the slider to change how it&rsquo;s split.
      </p>

      <input
        type="range"
        min={0}
        max={100}
        value={yourShare}
        onChange={(e) => setYourShare(Number(e.target.value))}
        className="w-full mb-3 accent-[#0aee3c]"
      />
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/85">
          You: <strong className="text-[#0aee3c]">${yourShare}</strong>
        </span>
        <span className="text-white/85">
          Them: <strong className="text-[#f472b6]">${theirShare}</strong>
        </span>
      </div>
      <p className="text-white/50 text-xs mb-6">
        Total: ${yourShare + theirShare}
        {' '}&mdash; always $100, no matter where you drag it. Every dollar you gain is a dollar they lose. That&rsquo;s
        zero-sum.
      </p>

      <div className="border-t border-white/10 pt-5">
        <p className="text-white/70 text-sm mb-4">
          Now imagine running a business with a partner instead. How do you both decide to operate?
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setMode('cooperate')}
            className={`border rounded-lg py-3 px-4 text-sm transition-colors ${
              mode === 'cooperate'
                ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
                : 'border-white/15 text-white/70 hover:border-white/30'
            }`}
          >
            Both invest &amp; cooperate
          </button>
          <button
            onClick={() => setMode('compete')}
            className={`border rounded-lg py-3 px-4 text-sm transition-colors ${
              mode === 'compete'
                ? 'border-[#f472b6]/60 text-[#f472b6] bg-[#f472b6]/10'
                : 'border-white/15 text-white/70 hover:border-white/30'
            }`}
          >
            Both cut corners &amp; compete
          </button>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/85">
            You: <strong className="text-white/95">${nonZero.you}k</strong>
          </span>
          <span className="text-white/85">
            Them: <strong className="text-white/95">${nonZero.them}k</strong>
          </span>
        </div>
        <p className="text-white/50 text-xs">
          Total: <strong className="text-white/80">${nonZero.total}k</strong> &mdash;{' '}
          {mode === 'cooperate'
            ? 'the whole pie grew, because you both invested in it.'
            : 'the whole pie shrank, because distrust wasted effort on both sides.'}{' '}
          Your payout didn&rsquo;t come out of their pocket. That&rsquo;s non-zero-sum.
        </p>
      </div>

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">What this shows</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Most everyday conflicts get treated like the pizza, even when they&rsquo;re actually more like the
          business. A salary negotiation, a group project, a relationship &mdash; in each of these, the total
          available can grow or shrink depending on how everyone plays, not just how it gets divided up. Before
          assuming someone else&rsquo;s gain has to be your loss, it&rsquo;s worth checking which situation
          you&rsquo;re actually in.
        </p>
      </div>
    </div>
  );
}
