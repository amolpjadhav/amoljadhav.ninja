'use client';

import { useState } from 'react';

type Mode = 'sustainable' | 'greedy';

const REGROWTH = 1.3;
const CAP = 100;
const HARVEST: Record<Mode, number> = {
  sustainable: 20, // 4 fishermen, 5 fish each
  greedy: 45, // 4 fishermen, ~11-15 fish each
};

function simulate(mode: Mode, rounds: number): number[] {
  const harvest = HARVEST[mode];
  const population = [100];
  let current = 100;

  for (let i = 0; i < rounds; i++) {
    const taken = Math.min(harvest, current);
    const remaining = current - taken;
    current = Math.min(CAP, remaining * REGROWTH);
    population.push(Math.round(current));
  }

  return population;
}

export default function TragedyOfCommons() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [population, setPopulation] = useState<number[] | null>(null);

  function run(m: Mode) {
    setMode(m);
    setPopulation(simulate(m, 8));
  }

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        You and 3 other fishermen share a lake. It starts with 100 fish. Whatever&rsquo;s left after everyone
        fishes grows back by 30% before the next round &mdash; up to the lake&rsquo;s natural limit of 100. Pick
        how everyone fishes, and watch 8 rounds play out.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => run('sustainable')}
          className={`text-sm px-3 py-2.5 rounded-lg border transition-colors ${
            mode === 'sustainable'
              ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
              : 'border-white/15 text-white/70 hover:border-white/30'
          }`}
        >
          Everyone fishes sustainably
        </button>
        <button
          onClick={() => run('greedy')}
          className={`text-sm px-3 py-2.5 rounded-lg border transition-colors ${
            mode === 'greedy'
              ? 'border-[#f472b6]/60 text-[#f472b6] bg-[#f472b6]/10'
              : 'border-white/15 text-white/70 hover:border-white/30'
          }`}
        >
          Everyone fishes as much as they can
        </button>
      </div>

      {population && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-end gap-1.5 h-24 mb-3">
            {population.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max(2, (p / 100) * 100)}%`,
                    background: p === 0 ? '#f472b6' : mode === 'greedy' ? '#facc15' : '#0aee3c',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mb-4 text-[10px] text-white/30">
            {population.map((_, i) => (
              <span key={i} className="flex-1 text-center">
                {i === 0 ? 'Start' : `R${i}`}
              </span>
            ))}
          </div>
          <p className="text-white/85 text-sm">
            After 8 rounds: <strong className={population[8] === 0 ? 'text-[#f472b6]' : 'text-[#0aee3c]'}>
              {population[8]} fish left
            </strong>
            {population[8] === 0 ? ' — the lake is empty. Nobody can fish here again.' : ' — the lake is still healthy.'}
          </p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why shared resources collapse</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Nobody in the greedy version decided to destroy the lake. Each fisherman just took as much as they
          personally could, every round, the same way they would from a lake that was entirely their own. The
          problem is that it wasn&rsquo;t entirely their own &mdash; three other people were making the exact same
          reasonable-feeling decision at the same time. No single fisherman felt responsible for the collapse,
          because no single fisherman caused it alone.
        </p>
      </div>
    </div>
  );
}
