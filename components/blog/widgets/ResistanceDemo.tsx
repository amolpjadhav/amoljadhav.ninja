'use client';

import { useState } from 'react';

// Standalone resistance-only demo: a slider narrows the pipe directly.
// Pressure is held fixed here (unlike OhmsLawDemo, which varies both) so
// the reader sees resistance's effect in isolation: same push, less gets
// through when the pipe narrows.
export default function ResistanceDemo() {
  const [resistance, setResistance] = useState(6);

  const pipeHeight = Math.max(6, 40 - resistance * 1.6);
  const dotCount = Math.max(2, Math.round(10 - resistance / 2.5));
  const dots = Array.from({ length: dotCount }, (_, i) => i);
  const duration = Math.max(0.6, 1 + resistance / 6);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        The push stays the same here &mdash; only the pipe&rsquo;s width changes. Watch how much less gets through as it narrows.
      </p>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Resistance (pipe narrowness)</span>
          <span>{resistance} &Omega;</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          value={resistance}
          onChange={(e) => setResistance(Number(e.target.value))}
          className="w-full accent-[#5b9bf5]"
        />
      </div>

      <div className="bg-black/30 rounded-lg p-5">
        <svg viewBox="0 0 300 60" className="w-full h-auto overflow-visible">
          <rect
            x={0}
            y={30 - pipeHeight / 2}
            width={300}
            height={pipeHeight}
            rx={pipeHeight / 2}
            fill="rgba(91,155,245,0.12)"
            stroke="rgba(91,155,245,0.4)"
          />
          {dots.map((i) => (
            <circle key={i} cx={0} cy={30} r={Math.max(2, pipeHeight / 5)} fill="#5b9bf5">
              <animate
                attributeName="cx"
                values="0;300"
                dur={`${duration}s`}
                begin={`${(i * duration) / dots.length}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>

      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Resistance</p>
        <p className="text-white/90 text-lg font-semibold">{resistance} ohms</p>
      </div>
    </div>
  );
}
