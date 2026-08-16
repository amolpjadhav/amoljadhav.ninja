'use client';

import { useState } from 'react';

// A nail wrapped in wire, connected to a battery. Flip the switch and the
// current starts flowing, the elementary magnets inside the nail swing into
// line, poles appear and paperclips stick. Add more turns of wire to make
// it stronger. Switch off and it all falls apart again.
//
// Colours follow the German textbook convention: north = red, south = green.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

const N_RED = '#e0533d';
const S_GREEN = '#3fa86a';
const WIRE = '#e0a33d';

const VIEW_W = 470;
const VIEW_H = 200;
const NAIL_Y = 92;
const NAIL_X0 = 96;
const NAIL_X1 = 388;

const FLOW_CSS = `
@keyframes emFlow { to { stroke-dashoffset: -10; } }
.em-flow { animation: emFlow 0.55s linear infinite; }
@media (prefers-reduced-motion: reduce) { .em-flow { animation: none; } }
`;

export default function Electromagnet({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [on, setOn] = useState(false);
  const [turns, setTurns] = useState(6);

  // Each turn adds a bit of pull. Illustrative, not a real calculation.
  const clips = on ? Math.round(turns * 1.5) : 0;
  const strength = on ? Math.min(100, Math.round((turns / 12) * 100)) : 0;

  const coilSpan = NAIL_X1 - NAIL_X0 - 56;
  const step = coilSpan / turns;

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <style>{FLOW_CSS}</style>
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setOn((v) => !v)}
          className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
          style={{
            background: on ? `${N_RED}22` : 'rgba(255,255,255,0.05)',
            color: on ? N_RED : 'rgba(255,255,255,0.55)',
            borderColor: on ? `${N_RED}66` : 'transparent',
          }}
        >
          {on ? '⏻ Switch off' : '⏻ Switch on'}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-white/35">Turns of wire</span>
          <input
            type="range"
            min={2}
            max={12}
            value={turns}
            onChange={(e) => setTurns(Number(e.target.value))}
            className="w-28 accent-white/70"
            aria-label="number of turns of wire"
          />
          <span className="text-[11px] font-semibold text-white/70 w-5">{turns}</span>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto" style={{ minWidth: 400 }}>
          {/* battery */}
          <g>
            <rect x={16} y={150} width={54} height={30} rx={4} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.3)" />
            <rect x={70} y={158} width={5} height={14} rx={1.5} fill="rgba(255,255,255,0.45)" />
            <text x={43} y={170} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.65)">
              battery
            </text>
          </g>

          {/* circuit wire from battery up to the coil and back */}
          {(() => {
            const out = `M 75 165 L ${NAIL_X0 + 20} 165 L ${NAIL_X0 + 20} ${NAIL_Y + 26}`;
            const back = `M ${NAIL_X1 - 36} ${NAIL_Y + 26} L ${NAIL_X1 - 36} 178 L 30 178 L 30 180`;
            return (
              <>
                {[out, back].map((d, i) => (
                  <g key={i}>
                    <path d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={3} />
                    {on && (
                      <path
                        d={d}
                        fill="none"
                        stroke={WIRE}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray="1 9"
                        className="em-flow"
                        style={{ filter: `drop-shadow(0 0 3px ${WIRE})` }}
                      />
                    )}
                  </g>
                ))}
              </>
            );
          })()}

          {/* the iron nail */}
          <g>
            <rect
              x={NAIL_X0}
              y={NAIL_Y - 15}
              width={NAIL_X1 - NAIL_X0}
              height={30}
              rx={4}
              fill={on ? 'rgba(224,83,61,0.13)' : 'rgba(255,255,255,0.07)'}
              stroke={on ? `${N_RED}77` : 'rgba(255,255,255,0.22)'}
              strokeWidth={1.5}
              style={{ transition: 'all 400ms' }}
            />
            <polygon
              points={`${NAIL_X1},${NAIL_Y - 15} ${NAIL_X1 + 22},${NAIL_Y} ${NAIL_X1},${NAIL_Y + 15}`}
              fill={on ? 'rgba(224,83,61,0.13)' : 'rgba(255,255,255,0.07)'}
              stroke={on ? `${N_RED}77` : 'rgba(255,255,255,0.22)'}
              strokeWidth={1.5}
              style={{ transition: 'all 400ms' }}
            />
            <text x={(NAIL_X0 + NAIL_X1) / 2} y={NAIL_Y - 26} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
              iron nail
            </text>
          </g>

          {/* the elementary magnets inside the nail */}
          {Array.from({ length: 11 }, (_, i) => {
            const x = NAIL_X0 + 16 + i * ((NAIL_X1 - NAIL_X0 - 32) / 10);
            const angle = on ? 0 : [28, 141, 297, 74, 205, 348, 96, 172, 251, 33, 316][i];
            return (
              <g key={i} transform={`rotate(${angle} ${x} ${NAIL_Y})`} style={{ transition: 'transform 600ms' }}>
                <rect x={x - 8} y={NAIL_Y - 2.5} width={8} height={5} rx={2} fill={S_GREEN} />
                <rect x={x} y={NAIL_Y - 2.5} width={8} height={5} rx={2} fill={N_RED} />
              </g>
            );
          })}

          {/* coil turns drawn over the nail */}
          {Array.from({ length: turns }, (_, i) => {
            const x = NAIL_X0 + 28 + i * step;
            const d = `M ${x} ${NAIL_Y + 26} C ${x - 14} ${NAIL_Y + 6}, ${x - 14} ${NAIL_Y - 6}, ${x} ${NAIL_Y - 26}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={3.4} />
                <path d={d} fill="none" stroke={on ? WIRE : 'rgba(224,163,61,0.4)'} strokeWidth={2.6} style={{ transition: 'stroke 300ms' }} />
                {on && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#fff5d6"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeDasharray="1 9"
                    className="em-flow"
                    opacity={0.9}
                  />
                )}
              </g>
            );
          })}

          {/* poles + paperclips, only while the current is on */}
          {on && (
            <>
              <text x={NAIL_X0 - 12} y={NAIL_Y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={S_GREEN}>
                S
              </text>
              <text x={NAIL_X1 + 34} y={NAIL_Y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={N_RED}>
                N
              </text>
              {Array.from({ length: Math.min(4, Math.ceil(turns / 3)) }, (_, i) => (
                <g key={i} opacity={0.85}>
                  <rect x={NAIL_X1 + 42 + i * 11} y={NAIL_Y - 9} width={5} height={18} rx={2.5} fill="rgba(255,255,255,0.55)" />
                </g>
              ))}
            </>
          )}
        </svg>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-xs text-white/60 leading-snug max-w-md">
          {on ? (
            <>
              Current is flowing. The swirling electricity has lined the tiny magnets up, so the nail{' '}
              <strong style={{ color: N_RED }}>is a magnet</strong> &mdash; it can hold about {clips} paperclips. More
              turns of wire, stronger magnet.
            </>
          ) : (
            <>
              No current. The tiny magnets inside are jumbled, so this is just{' '}
              <strong>an ordinary nail</strong>. Switch it on.
            </>
          )}
        </div>
        <div className="text-[11px] font-semibold shrink-0" style={{ color: on ? N_RED : 'rgba(255,255,255,0.35)' }}>
          {strength}% strength
        </div>
      </div>
    </div>
  );
}
