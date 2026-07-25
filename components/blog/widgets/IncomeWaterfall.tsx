'use client';

import { useState } from 'react';

const REVENUE = 1_000;

interface Bar {
  label: string;
  value: number;
  color: string;
}

export default function IncomeWaterfall() {
  const [cogs, setCogs] = useState(300);
  const [opex, setOpex] = useState(200);
  const [taxRate, setTaxRate] = useState(20);

  const grossProfit = REVENUE - cogs;
  const operatingIncome = grossProfit - opex;
  const taxAmount = operatingIncome > 0 ? Math.round((operatingIncome * taxRate) / 100) : 0;
  const netIncome = operatingIncome - taxAmount;

  const bars: Bar[] = [
    { label: 'Revenue', value: REVENUE, color: '#8b8f98' },
    { label: 'Gross Profit', value: grossProfit, color: '#facc15' },
    { label: 'Operating Income', value: operatingIncome, color: '#38bdf8' },
    { label: 'Net Income', value: netIncome, color: netIncome >= 0 ? '#0aee3c' : '#f472b6' },
  ];

  const maxAbs = Math.max(REVENUE, ...bars.map((b) => Math.abs(b.value)));
  const barHeight = (v: number) => `${Math.max(2, (Math.abs(v) / maxAbs) * 100)}%`;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-5">
        This shop makes ${REVENUE.toLocaleString()} in revenue. Drag the sliders to change its costs and watch how
        much survives all the way down to net income.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3 mb-5">
        <div>
          <label className="block text-white/70 text-xs mb-1">
            Cost of goods: <strong className="text-white/90">${cogs}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={800}
            step={10}
            value={cogs}
            onChange={(e) => setCogs(Number(e.target.value))}
            className="w-full accent-[#facc15]"
          />
        </div>
        <div>
          <label className="block text-white/70 text-xs mb-1">
            Operating expenses: <strong className="text-white/90">${opex}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={opex}
            onChange={(e) => setOpex(Number(e.target.value))}
            className="w-full accent-[#38bdf8]"
          />
        </div>
        <div>
          <label className="block text-white/70 text-xs mb-1">
            Tax rate: <strong className="text-white/90">{taxRate}%</strong>
          </label>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full accent-[#0aee3c]"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-end gap-3 h-32 mb-2">
          {bars.map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <p className="text-white/85 text-xs mb-1">${bar.value.toLocaleString()}</p>
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t"
                  style={{ height: barHeight(bar.value), background: bar.color }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 text-[10px] text-white/40 text-center">
          {bars.map((bar) => (
            <span key={bar.label} className="flex-1">
              {bar.label}
            </span>
          ))}
        </div>

        {netIncome < 0 && (
          <p className="text-[#f472b6] text-sm mt-3">
            Costs outran revenue — this shop lost ${Math.abs(netIncome).toLocaleString()} this period.
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Every checkpoint costs a little more</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Revenue is the biggest, least useful number on the whole statement &mdash; it doesn&rsquo;t account for
          anything it cost to earn it. Each step down subtracts a different kind of cost, and each one answers a
          different question: gross profit asks &ldquo;is the product itself profitable,&rdquo; operating income
          asks &ldquo;is the business profitable,&rdquo; and net income asks &ldquo;is there anything left over,
          period.&rdquo; A company can look healthy at the top of the waterfall and still lose money by the
          bottom &mdash; that gap is exactly what these checkpoints are built to catch.
        </p>
      </div>
    </div>
  );
}
