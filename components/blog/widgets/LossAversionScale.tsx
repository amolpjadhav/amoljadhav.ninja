'use client';

import { useState } from 'react';

// Interactive "would you take this bet" demo. Loss is fixed at $100; the
// reader drags the potential win amount and watches a seesaw tip between
// "feels like a loss" and "feels worth it" — landing near 2x is the
// research-average tipping point (Kahneman & Tversky's loss-aversion ratio).
const LOSS = 100;
const TIP_POINT = 200; // ~2x the loss, the typical research average

export default function LossAversionScale() {
  const [win, setWin] = useState(150);
  const ratio = win / LOSS;
  const tilt = Math.max(-14, Math.min(14, (win - TIP_POINT) / 8));

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        A coin flip: tails, you lose $100. Drag the slider until the potential win feels worth the risk to <em>you</em>.
      </p>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>If you win, you get</span>
          <span>${win}</span>
        </div>
        <input
          type="range"
          min={100}
          max={400}
          step={10}
          value={win}
          onChange={(e) => setWin(Number(e.target.value))}
          className="w-full accent-[#fb7185]"
        />
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        <svg viewBox="0 0 300 140" className="w-full h-auto overflow-visible">
          <rect x={145} y={60} width={10} height={50} fill="rgba(255,255,255,0.2)" />
          <circle cx={150} cy={58} r={5} fill="rgba(255,255,255,0.35)" />

          <g transform={`rotate(${tilt} 150 60)`}>
            <line x1={40} y1={60} x2={260} y2={60} stroke="rgba(255,255,255,0.3)" strokeWidth={4} strokeLinecap="round" />

            <g transform="translate(40 60)">
              <line x1={0} y1={0} x2={0} y2={30} stroke="rgba(251,113,133,0.5)" strokeWidth={2} />
              <rect x={-32} y={30} width={64} height={22} rx={4} fill="rgba(251,113,133,0.25)" stroke="rgba(251,113,133,0.6)" />
              <text x={0} y={45} fontSize={11} fill="rgba(255,255,255,0.75)" textAnchor="middle">
                Lose ${LOSS}
              </text>
            </g>

            <g transform="translate(260 60)">
              <line x1={0} y1={0} x2={0} y2={30} stroke="rgba(74,222,128,0.5)" strokeWidth={2} />
              <rect x={-32} y={30} width={64} height={22} rx={4} fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.55)" />
              <text x={0} y={45} fontSize={11} fill="rgba(255,255,255,0.75)" textAnchor="middle">
                Win ${win}
              </text>
            </g>
          </g>
        </svg>
      </div>

      <div className="border-t border-white/10 pt-4 mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Your ratio</p>
          <p className="text-white/90 text-lg font-semibold">{ratio.toFixed(1)}&times;</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Research average</p>
          <p className="text-white/90 text-lg font-semibold">~2.0&times;</p>
        </div>
      </div>
    </div>
  );
}
