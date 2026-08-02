'use client';

import { useState } from 'react';

// Standalone current-only demo: a slider controls flow directly (not
// derived from voltage/resistance). Speed stays fixed here — only the
// number of dots changes — the deliberate opposite of the Voltage widget,
// which keeps the count fixed and changes speed. Current is "how much is
// moving," not "how hard it's pushed."
const SPEED = 1.6;

export default function CurrentDemo() {
  const [amps, setAmps] = useState(8);

  const dotCount = Math.max(2, Math.round(amps / 2));
  const dots = Array.from({ length: dotCount }, (_, i) => i);
  const duration = SPEED;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Drag the slider to change the flow &mdash; more current means more water moving past a point every second, not a harder
        push.
      </p>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Current (flow)</span>
          <span>{amps} A</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          value={amps}
          onChange={(e) => setAmps(Number(e.target.value))}
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
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Flow</p>
        <p className="text-white/90 text-lg font-semibold">{amps} amps</p>
      </div>
    </div>
  );
}
