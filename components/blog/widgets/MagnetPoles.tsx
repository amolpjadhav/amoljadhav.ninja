'use client';

import { useState } from 'react';

// Two bar magnets you can flip and slide apart, with the invisible field
// lines drawn in: streams flowing out of each north pole and back into each
// south pole. Attracting poles show the streams joining across the gap;
// repelling poles show them clashing and splaying away.
//
// The field lines are stylised bezier curves, not a physics simulation —
// enough to build the right mental picture, not a numerical solution.
//
// Colours follow the German textbook convention: north = red, south = green.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

const N_RED = '#e0533d';
const S_GREEN = '#3fa86a';
const PUSH = '#f0a35e';
const PULL = '#4ade80';

const VIEW_W = 470;
const VIEW_H = 210;
const CY = 105;
const BAR_W = 128;
const BAR_H = 46;
const CENTER = VIEW_W / 2;

const FLOW_CSS = `
@keyframes mpFlowFwd { to { stroke-dashoffset: -9; } }
@keyframes mpFlowRev { to { stroke-dashoffset: 9; } }
.mp-fwd { animation: mpFlowFwd 0.9s linear infinite; }
.mp-rev { animation: mpFlowRev 0.9s linear infinite; }
@media (prefers-reduced-motion: reduce) { .mp-fwd, .mp-rev { animation: none; } }
`;

export default function MagnetPoles({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  // flipped = false renders the bar as S | N (north on the right)
  const [leftFlipped, setLeftFlipped] = useState(false);
  const [rightFlipped, setRightFlipped] = useState(false);
  const [gap, setGap] = useState(70);

  const leftFacing = leftFlipped ? 'S' : 'N';
  const rightFacing = rightFlipped ? 'N' : 'S';
  const same = leftFacing === rightFacing;

  const strength = Math.round(100 - ((gap - 26) / 130) * 88);
  const color = same ? PUSH : PULL;

  const lr = CENTER - gap / 2; // right edge of the left bar
  const rl = CENTER + gap / 2; // left edge of the right bar
  const ll = lr - BAR_W;
  const rr = rl + BAR_W;

  // Flow direction: streams always leave a north pole and enter a south one.
  const bridgeDir = leftFacing === 'N' ? 'mp-fwd' : 'mp-rev';
  const splayDir = leftFacing === 'N' ? 'mp-fwd' : 'mp-rev';

  const bridge = [
    `M ${lr} ${CY} L ${rl} ${CY}`,
    `M ${lr} ${CY - 12} Q ${CENTER} ${CY - 52} ${rl} ${CY - 12}`,
    `M ${lr} ${CY + 12} Q ${CENTER} ${CY + 52} ${rl} ${CY + 12}`,
  ];
  const splay = [
    `M ${lr} ${CY - 9} Q ${CENTER - 22} ${CY - 34} ${CENTER - 9} ${CY - 68}`,
    `M ${lr} ${CY + 9} Q ${CENTER - 22} ${CY + 34} ${CENTER - 9} ${CY + 68}`,
    `M ${rl} ${CY - 9} Q ${CENTER + 22} ${CY - 34} ${CENTER + 9} ${CY - 68}`,
    `M ${rl} ${CY + 9} Q ${CENTER + 22} ${CY + 34} ${CENTER + 9} ${CY + 68}`,
  ];

  function Bar({ x, flipped }: { x: number; flipped: boolean }) {
    const leftHalf = flipped ? N_RED : S_GREEN;
    const rightHalf = flipped ? S_GREEN : N_RED;
    return (
      <g>
        <rect x={x} y={CY - BAR_H / 2} width={BAR_W / 2} height={BAR_H} fill={leftHalf} rx={3} />
        <rect x={x + BAR_W / 2} y={CY - BAR_H / 2} width={BAR_W / 2} height={BAR_H} fill={rightHalf} rx={3} />
        <text x={x + BAR_W / 4} y={CY + 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">
          {flipped ? 'N' : 'S'}
        </text>
        <text x={x + (BAR_W * 3) / 4} y={CY + 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">
          {flipped ? 'S' : 'N'}
        </text>
      </g>
    );
  }

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <style>{FLOW_CSS}</style>
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setLeftFlipped((f) => !f)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded bg-white/5 text-white/60 hover:text-white/90 transition-colors"
        >
          Turn the left magnet around
        </button>
        <button
          onClick={() => setRightFlipped((f) => !f)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded bg-white/5 text-white/60 hover:text-white/90 transition-colors"
        >
          Turn the right magnet around
        </button>
      </div>

      <div className="bg-black/30 rounded-lg p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto" style={{ minWidth: 380 }}>
          {(same ? splay : bridge).map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke={`${color}44`} strokeWidth={1.6} />
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeDasharray="1 8"
                className={same ? splayDir : bridgeDir}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }}
              />
            </g>
          ))}

          <Bar x={ll} flipped={leftFlipped} />
          <Bar x={rl} flipped={rightFlipped} />

          {/* which way they'd actually move */}
          <g opacity={0.9}>
            {same ? (
              <>
                <path d={`M ${ll - 10} ${CY} L ${ll - 30} ${CY}`} stroke={color} strokeWidth={2.4} />
                <path d={`M ${ll - 24} ${CY - 6} L ${ll - 32} ${CY} L ${ll - 24} ${CY + 6}`} fill="none" stroke={color} strokeWidth={2.4} />
                <path d={`M ${rr + 10} ${CY} L ${rr + 30} ${CY}`} stroke={color} strokeWidth={2.4} />
                <path d={`M ${rr + 24} ${CY - 6} L ${rr + 32} ${CY} L ${rr + 24} ${CY + 6}`} fill="none" stroke={color} strokeWidth={2.4} />
              </>
            ) : (
              <>
                <path d={`M ${ll - 32} ${CY} L ${ll - 12} ${CY}`} stroke={color} strokeWidth={2.4} />
                <path d={`M ${ll - 18} ${CY - 6} L ${ll - 10} ${CY} L ${ll - 18} ${CY + 6}`} fill="none" stroke={color} strokeWidth={2.4} />
                <path d={`M ${rr + 32} ${CY} L ${rr + 12} ${CY}`} stroke={color} strokeWidth={2.4} />
                <path d={`M ${rr + 18} ${CY - 6} L ${rr + 10} ${CY} L ${rr + 18} ${CY + 6}`} fill="none" stroke={color} strokeWidth={2.4} />
              </>
            )}
          </g>
        </svg>
      </div>

      <div className="text-center mt-3">
        <div className="text-sm font-bold" style={{ color }}>
          {same ? 'They push apart' : 'They pull together'}
        </div>
        <div className="text-[11px] text-white/45 mt-0.5">
          {same ? (
            <>
              Two {leftFacing} poles facing each other &mdash; the streams clash head-on, like two hoses pointed at
              each other
            </>
          ) : (
            <>
              {leftFacing} facing {rightFacing} &mdash; the stream flows straight out of one and into the other
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.07]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] uppercase tracking-wide text-white/35">Move them apart</div>
          <div className="text-[11px] font-semibold" style={{ color }}>
            {strength}% strength
          </div>
        </div>
        <input
          type="range"
          min={26}
          max={156}
          value={gap}
          onChange={(e) => setGap(Number(e.target.value))}
          className="w-full accent-white/70"
          aria-label="distance between the magnets"
        />
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${strength}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}
