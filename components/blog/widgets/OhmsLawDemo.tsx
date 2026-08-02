'use client';

import { useState } from 'react';

// Interactive voltage/resistance sliders showing current and power respond
// live, with an animated pipe visual (width = resistance, flow speed =
// current, glow = power) tying back to the water-hose analogy.
export default function OhmsLawDemo() {
  const [voltage, setVoltage] = useState(9);
  const [resistance, setResistance] = useState(3);

  const current = voltage / resistance;
  const power = voltage * current;

  const pipeHeight = Math.max(8, 44 - resistance * 1.8);
  const flowDuration = Math.max(0.4, 4 / current);
  const dotRadius = Math.max(2, pipeHeight / 5);
  const bulbGlow = Math.min(1, power / 60);

  const dots = [0, 1, 2, 3, 4];

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Drag the sliders. Voltage is the push, resistance is the pipe&rsquo;s narrowness &mdash; current and power respond live.
      </p>

      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Voltage (pressure)</span>
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
        <div>
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
      </div>

      <div className="bg-black/30 rounded-lg p-5 mb-5 flex items-center gap-5">
        <svg viewBox="0 0 300 60" className="flex-1 h-14 overflow-visible">
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
            <circle key={i} cx={0} cy={30} r={dotRadius} fill="#5b9bf5">
              <animate
                attributeName="cx"
                values="0;300"
                dur={`${flowDuration}s`}
                begin={`${(i * flowDuration) / dots.length}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
        <div
          className="shrink-0"
          style={{ filter: `drop-shadow(0 0 ${6 + power / 2}px rgba(250,204,21,${bulbGlow}))` }}
        >
          <svg width="40" height="56" viewBox="0 0 40 56">
            <circle
              cx={20}
              cy={20}
              r={15}
              fill={`rgba(250,204,21,${0.15 + bulbGlow * 0.85})`}
              stroke="rgba(250,204,21,0.6)"
              strokeWidth={1.5}
            />
            <path
              d="M13,33 L27,33 L24,39 L16,39 Z"
              fill="rgba(200,200,200,0.25)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1}
            />
            <rect x={15} y={39} width={10} height={2.5} fill="rgba(170,170,170,0.4)" />
            <rect x={15} y={43} width={10} height={2.5} fill="rgba(170,170,170,0.4)" />
            <rect x={16} y={47} width={8} height={4} rx={1} fill="rgba(150,150,150,0.5)" />
            <path
              d="M14,22 L18,14 L22,26 L26,18"
              fill="none"
              stroke={`rgba(255,220,150,${0.4 + bulbGlow * 0.6})`}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Current</p>
          <p className="text-white/90 text-lg font-semibold">{current.toFixed(2)} A</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Power</p>
          <p className="text-white/90 text-lg font-semibold">{power.toFixed(1)} W</p>
        </div>
      </div>
    </div>
  );
}
