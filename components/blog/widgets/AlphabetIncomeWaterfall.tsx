'use client';

import { useState } from 'react';

interface Bar {
  label: string;
  value: number;
  color: string;
  description: string;
}

// Q1 2026 (three months ended March 31, 2026), in $M
const BARS: Bar[] = [
  {
    label: 'Revenue',
    value: 109_896,
    color: '#8b8f98',
    description: 'Mostly advertising (Search, YouTube), plus a fast-growing slice from Google Cloud. For one quarter.',
  },
  {
    label: 'Gross Profit',
    value: 68_625,
    color: '#facc15',
    description:
      'Revenue minus Cost of Revenues ($41.3B). Alphabet’s real statement doesn’t even print this line — you compute it yourself.',
  },
  {
    label: 'Income from Operations',
    value: 39_696,
    color: '#38bdf8',
    description:
      'Gross Profit minus R&D ($17.0B), Sales & Marketing ($7.6B), and G&A ($4.3B). Alphabet’s name for "Operating Income."',
  },
  {
    label: 'Net Income',
    value: 62_578,
    color: '#0aee3c',
    description:
      'Income from Operations, plus $37.7B of "Other income, net" (mostly investment gains), minus $14.8B in taxes. Notice this bar is taller than the one before it — that almost never happens from cost-cutting alone.',
  },
];

const MAX = Math.max(...BARS.map((b) => b.value));

export default function AlphabetIncomeWaterfall() {
  const [selected, setSelected] = useState<string | null>(BARS[0].label);
  const active = BARS.find((b) => b.label === selected) ?? BARS[0];

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">
        Alphabet, three months ended March 31, 2026
      </p>
      <p className="text-white/70 text-sm mb-5">
        The same waterfall from Part 1, run on one real quarter. Click a bar to see how it was calculated.
      </p>

      <div className="flex items-end gap-3 h-40 mb-2">
        {BARS.map((bar) => (
          <button
            key={bar.label}
            onClick={() => setSelected(bar.label)}
            className="flex-1 flex flex-col items-center justify-end h-full transition-opacity"
            style={{ opacity: selected === null || selected === bar.label ? 1 : 0.4 }}
          >
            <p className="text-white/85 text-xs mb-1">${(bar.value / 1000).toFixed(1)}B</p>
            <div className="w-full flex flex-col justify-end h-full">
              <div
                className="w-full rounded-t"
                style={{ height: `${Math.max(2, (bar.value / MAX) * 100)}%`, background: bar.color }}
              />
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3 text-[10px] text-white/40 text-center mb-4">
        {BARS.map((bar) => (
          <span key={bar.label} className="flex-1">
            {bar.label}
          </span>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 min-h-[5rem]">
        <p className="text-sm font-semibold mb-1" style={{ color: active.color }}>
          {active.label}
        </p>
        <p className="text-white/60 text-sm leading-relaxed">{active.description}</p>
      </div>
    </div>
  );
}
