'use client';

import { useState } from 'react';

// Voltage-only demo: same pipe as the Current/Resistance widgets, same
// number of dots always — only their speed changes with voltage. That's
// the deliberate contrast with the Current widget, which instead changes
// how many dots are moving (quantity vs. push).
const DOT_COUNT = 4;

export default function VoltageDemo() {
  const [voltage, setVoltage] = useState(9);
  const duration = Math.max(0.4, 4 / voltage);
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => i);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Drag the slider &mdash; the same amount of water is in the pipe either way. Higher voltage just pushes it through
        faster.
      </p>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Voltage (push)</span>
          <span>{voltage} V</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          value={voltage}
          onChange={(e) => setVoltage(Number(e.target.value))}
          className="w-full accent-[#5b9bf5]"
        />
      </div>

      <div className="bg-black/30 rounded-lg p-5">
        <svg viewBox="0 0 300 60" className="w-full h-auto overflow-visible">
          <rect x={0} y={20} width={300} height={20} rx={10} fill="rgba(91,155,245,0.12)" stroke="rgba(91,155,245,0.4)" />
          {dots.map((i) => (
            <circle key={i} cx={0} cy={30} r={5} fill="#5b9bf5">
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
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Push force</p>
        <p className="text-white/90 text-lg font-semibold">{voltage} volts</p>
      </div>
    </div>
  );
}
