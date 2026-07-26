'use client';

import { useState } from 'react';

interface Slider {
  key: string;
  label: string;
  value: number; // $B
  min: number;
  max: number;
  step: number;
  color: string;
}

const INITIAL_ASSETS: Slider[] = [
  { key: 'cash', label: 'Cash & marketable securities', value: 126.8, min: 0, max: 300, step: 5, color: '#38bdf8' },
  { key: 'receivable', label: 'Accounts receivable', value: 63.0, min: 0, max: 150, step: 5, color: '#c084fc' },
  { key: 'nonmarketable', label: 'Non-marketable securities', value: 106.9, min: 0, max: 250, step: 5, color: '#fb923c' },
  { key: 'ppe', label: 'Property & equipment, net', value: 281.0, min: 0, max: 500, step: 10, color: '#0aee3c' },
  { key: 'goodwill', label: 'Goodwill & intangibles', value: 67.2, min: 0, max: 150, step: 5, color: '#f472b6' },
];

const INITIAL_LIABILITIES: Slider[] = [
  { key: 'payable', label: 'Accounts payable', value: 16.9, min: 0, max: 50, step: 2, color: '#38bdf8' },
  { key: 'accrued', label: 'Accrued compensation & expenses', value: 77.0, min: 0, max: 150, step: 5, color: '#c084fc' },
  { key: 'deferred', label: 'Deferred revenue & revenue share', value: 17.4, min: 0, max: 50, step: 2, color: '#fb923c' },
  { key: 'debt', label: 'Long-term debt', value: 77.5, min: 0, max: 300, step: 10, color: '#f472b6' },
];

function fmt(v: number) {
  return `$${v.toFixed(0)}B`;
}

export default function AlphabetBalanceSheet() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [liabilities, setLiabilities] = useState(INITIAL_LIABILITIES);

  const totalAssets = assets.reduce((sum, s) => sum + s.value, 0);
  const totalLiabilities = liabilities.reduce((sum, s) => sum + s.value, 0);
  const equity = totalAssets - totalLiabilities;
  const isUnderwater = equity < 0;
  const maxScale = Math.max(totalAssets, totalLiabilities + Math.max(equity, 0), 700);

  function updateAsset(key: string, value: number) {
    setAssets((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  function updateLiability(key: string, value: number) {
    setLiabilities((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-5">
        These are Alphabet&rsquo;s real numbers, as sliders. Drag any of them and watch equity respond &mdash; the
        same rule holds no matter how far you push it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#0aee3c]/70 mb-2">Assets</p>
          {assets.map((s) => (
            <div key={s.key} className="mb-3">
              <label className="block text-white/70 text-xs mb-1">
                {s.label}: <strong className="text-white/90">{fmt(s.value)}</strong>
              </label>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => updateAsset(s.key, Number(e.target.value))}
                className="w-full"
                style={{ accentColor: s.color }}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#f472b6]/70 mb-2">Liabilities</p>
          {liabilities.map((s) => (
            <div key={s.key} className="mb-3">
              <label className="block text-white/70 text-xs mb-1">
                {s.label}: <strong className="text-white/90">{fmt(s.value)}</strong>
              </label>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => updateLiability(s.key, Number(e.target.value))}
                className="w-full"
                style={{ accentColor: s.color }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-end gap-6 h-28 mb-3">
          <div className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full flex flex-col justify-end h-full rounded-t overflow-hidden">
              <div className="w-full bg-[#0aee3c]" style={{ height: `${(totalAssets / maxScale) * 100}%` }} />
            </div>
            <p className="text-white/40 text-[10px] mt-1.5">Assets</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full flex flex-col justify-end h-full rounded-t overflow-hidden">
              {!isUnderwater && (
                <div className="w-full bg-[#0aee3c]/40" style={{ height: `${(equity / maxScale) * 100}%` }} />
              )}
              <div
                className="w-full bg-[#f472b6]"
                style={{ height: `${((isUnderwater ? totalAssets : totalLiabilities) / maxScale) * 100}%` }}
              />
            </div>
            <p className="text-white/40 text-[10px] mt-1.5">Liabilities + Equity</p>
          </div>
        </div>

        <p className="text-white/85 text-sm text-center mb-1">
          <strong className="text-white/95">{fmt(totalAssets)}</strong> (assets) ={' '}
          <strong className="text-[#f472b6]">{fmt(totalLiabilities)}</strong> (liabilities) +{' '}
          <strong className={isUnderwater ? 'text-[#f472b6]' : 'text-[#0aee3c]'}>{fmt(equity)}</strong> (equity)
        </p>

        {isUnderwater && (
          <p className="text-[#f472b6] text-xs text-center mt-2">
            Equity just went negative — even a company this size would be technically insolvent if its debts ever
            actually looked like this.
          </p>
        )}
      </div>
    </div>
  );
}
