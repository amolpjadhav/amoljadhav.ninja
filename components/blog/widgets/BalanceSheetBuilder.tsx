'use client';

import { useState } from 'react';

const BUILDING = 200_000;
const MAX_SCALE = 1_000_000;

export default function BalanceSheetBuilder() {
  const [cash, setCash] = useState(500_000);
  const [inventory, setInventory] = useState(300_000);
  const [loan, setLoan] = useState(400_000);
  const [payable, setPayable] = useState(100_000);

  const totalAssets = cash + inventory + BUILDING;
  const totalLiabilities = loan + payable;
  const equity = totalAssets - totalLiabilities;
  const isUnderwater = equity < 0;

  const assetScale = (v: number) => `${Math.min(100, (v / MAX_SCALE) * 100)}%`;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-5">
        Drag the sliders to change what this company owns and owes. Watch equity update on its own &mdash; it has
        to, because the two sides always balance.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#0aee3c]/70 mb-2">Assets</p>
          <label className="block text-white/70 text-xs mb-1">
            Cash: <strong className="text-white/90">${cash.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={500_000}
            step={10_000}
            value={cash}
            onChange={(e) => setCash(Number(e.target.value))}
            className="w-full mb-3 accent-[#0aee3c]"
          />
          <label className="block text-white/70 text-xs mb-1">
            Inventory: <strong className="text-white/90">${inventory.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={300_000}
            step={10_000}
            value={inventory}
            onChange={(e) => setInventory(Number(e.target.value))}
            className="w-full mb-3 accent-[#0aee3c]"
          />
          <p className="text-white/50 text-xs">
            Building (fixed): <strong className="text-white/70">${BUILDING.toLocaleString()}</strong>
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#f472b6]/70 mb-2">Liabilities</p>
          <label className="block text-white/70 text-xs mb-1">
            Bank loan: <strong className="text-white/90">${loan.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={400_000}
            step={10_000}
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value))}
            className="w-full mb-3 accent-[#f472b6]"
          />
          <label className="block text-white/70 text-xs mb-1">
            Owed to suppliers: <strong className="text-white/90">${payable.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={100_000}
            step={5_000}
            value={payable}
            onChange={(e) => setPayable(Number(e.target.value))}
            className="w-full accent-[#f472b6]"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-end gap-6 h-28 mb-3">
          <div className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full flex flex-col justify-end h-full rounded-t overflow-hidden">
              <div
                className="w-full bg-[#0aee3c]"
                style={{ height: assetScale(totalAssets) }}
              />
            </div>
            <p className="text-white/40 text-[10px] mt-1.5">Assets</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full flex flex-col justify-end h-full rounded-t overflow-hidden">
              {!isUnderwater && (
                <div
                  className="w-full bg-[#0aee3c]/40"
                  style={{ height: assetScale(equity) }}
                />
              )}
              <div
                className="w-full bg-[#f472b6]"
                style={{ height: assetScale(isUnderwater ? totalAssets : totalLiabilities) }}
              />
            </div>
            <p className="text-white/40 text-[10px] mt-1.5">Liabilities + Equity</p>
          </div>
        </div>

        <p className="text-white/85 text-sm text-center mb-1">
          <strong className="text-white/95">${totalAssets.toLocaleString()}</strong> (assets) ={' '}
          <strong className="text-[#f472b6]">${totalLiabilities.toLocaleString()}</strong> (liabilities) +{' '}
          <strong className={isUnderwater ? 'text-[#f472b6]' : 'text-[#0aee3c]'}>
            ${equity.toLocaleString()}
          </strong>{' '}
          (equity)
        </p>

        {isUnderwater && (
          <p className="text-[#f472b6] text-xs text-center mt-2">
            Equity just went negative — this company owes more than it owns. That&rsquo;s technically insolvent.
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why it always balances</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Equity isn&rsquo;t something the company decides — it&rsquo;s just whatever&rsquo;s left over once you
          subtract what&rsquo;s owed from what&rsquo;s owned. Move any slider and equity moves to compensate,
          automatically, because it was never an independent number in the first place. That&rsquo;s the whole
          rule: <code className="text-white/70">Assets = Liabilities + Equity</code> isn&rsquo;t something a
          healthy company achieves. It&rsquo;s just true, always, for every company, by definition.
        </p>
      </div>
    </div>
  );
}
