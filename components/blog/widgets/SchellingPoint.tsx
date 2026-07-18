'use client';

import { useState } from 'react';

const SPOTS = [
  { id: 'grand-central', label: 'Grand Central Terminal', pct: 58 },
  { id: 'times-square', label: 'Times Square', pct: 22 },
  { id: 'central-park', label: 'Central Park', pct: 12 },
  { id: 'empire-state', label: 'The Empire State Building', pct: 8 },
];

const NUMBERS = [
  { value: 1, pct: 34 },
  { value: 7, pct: 4 },
  { value: 13, pct: 3 },
  { value: 42, pct: 5 },
  { value: 50, pct: 28 },
  { value: 73, pct: 2 },
  { value: 100, pct: 24 },
];

export default function SchellingPoint() {
  const [spotPick, setSpotPick] = useState<string | null>(null);
  const [numberPick, setNumberPick] = useState<number | null>(null);

  const spotResult = SPOTS.find((s) => s.id === spotPick);
  const numberResult = NUMBERS.find((n) => n.value === numberPick);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        You have to meet a friend somewhere in New York City tomorrow. You have no way to reach them &mdash; no
        call, no text, nothing. Where do you go?
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {SPOTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSpotPick(s.id)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              spotPick === s.id
                ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
                : 'border-white/15 text-white/70 hover:border-white/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {spotResult && (
        <div className="border-t border-white/10 pt-4 mb-2">
          <p className="text-white/85 text-sm mb-3">
            You picked <strong>{spotResult.label}</strong>. Here&rsquo;s what other readers picked:
          </p>
          {SPOTS.map((s) => (
            <div key={s.id} className="flex items-center gap-2 mb-1.5">
              <span className="text-white/50 text-xs w-40 shrink-0">{s.label}</span>
              <div className="flex-1 bg-white/5 rounded h-4 overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${s.pct}%`,
                    background: s.id === spotPick ? '#0aee3c' : 'rgba(255,255,255,0.25)',
                  }}
                />
              </div>
              <span className="text-white/50 text-xs w-8 text-right">{s.pct}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-white/10 pt-5 mt-4">
        <p className="text-white/70 text-sm mb-4">
          Now a different one: pick a number from 1 to 100. If a stranger picks the exact same number, you both
          win. You can&rsquo;t discuss it &mdash; you&rsquo;re just trying to guess what they&rsquo;d pick.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {NUMBERS.map((n) => (
            <button
              key={n.value}
              onClick={() => setNumberPick(n.value)}
              className={`text-sm w-12 h-10 rounded-lg border transition-colors ${
                numberPick === n.value
                  ? 'border-[#f472b6]/60 text-[#f472b6] bg-[#f472b6]/10'
                  : 'border-white/15 text-white/70 hover:border-white/30'
              }`}
            >
              {n.value}
            </button>
          ))}
        </div>

        {numberResult && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/85 text-sm mb-3">
              You picked <strong>{numberResult.value}</strong>. Here&rsquo;s what other readers picked:
            </p>
            {NUMBERS.map((n) => (
              <div key={n.value} className="flex items-center gap-2 mb-1.5">
                <span className="text-white/50 text-xs w-8 shrink-0">{n.value}</span>
                <div className="flex-1 bg-white/5 rounded h-4 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${n.pct}%`,
                      background: n.value === numberPick ? '#f472b6' : 'rgba(255,255,255,0.25)',
                    }}
                  />
                </div>
                <span className="text-white/50 text-xs w-8 text-right">{n.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why this happens</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Nobody told you to pick Grand Central, or 1, or 50, or 100. But most people do anyway. These options
          feel obvious, even though nothing in the rules says they&rsquo;re better than any other choice. That
          shared sense of &ldquo;this is the obvious one&rdquo; is called a Schelling point &mdash; a solution
          people land on without talking, just because it stands out from all the other options.
        </p>
      </div>
    </div>
  );
}
