'use client';

import { useMemo, useState } from 'react';

// Interest in TFT: at the end of each round you gain 1 gold for every 10 you
// are holding, up to 5. Left alone, a pile of gold therefore grows faster the
// bigger it is — until 50, where the cap turns compounding into a flat 5 a
// round.
//
// That kink is the whole point of the widget, and it is the one thing a table
// of numbers hides: the curve bends upward, hits the ceiling, and straightens
// out. Real compound interest has no ceiling, which is the comparison the
// article ends on.
//
// Deliberately models only interest, not income. Base income and streak gold
// change between sets and are not published anywhere I can verify, so putting
// them in would mean inventing numbers to make a curve look nicer.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain CSS
// (not Tailwind typography), so `not-prose` does not neutralize it — this
// widget uses <div> for text and pins font-sans.

const GOLD = '#ffc857';
const SPENDER = '#ff6b81';
const CAP = 50;
const ROUNDS = 14;
const INTEREST_PER = 10;
const MAX_INTEREST = 5;

const interestOn = (gold: number) => Math.min(MAX_INTEREST, Math.floor(gold / INTEREST_PER));

/** Holds everything: the pile grows by its own interest each round. */
function saverCurve(start: number): number[] {
  const out = [start];
  for (let r = 0; r < ROUNDS; r++) out.push(out[out.length - 1] + interestOn(out[out.length - 1]));
  return out;
}

/**
 * Rolls down to `floor` every round. Interest is paid on what is left at the
 * end of the round, so their pile settles at floor + interest on the floor and
 * stays there: nothing ever accumulates to earn on.
 */
function spenderCurve(start: number, floor: number): number[] {
  const settled = floor + interestOn(floor);
  return Array.from({ length: ROUNDS + 1 }, (_, r) => (r === 0 ? start : settled));
}

const W = 640;
const H = 210;
const PAD = { top: 14, right: 14, bottom: 26, left: 30 };

export default function TftGoldCurve({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [start, setStart] = useState(20);
  const [floor, setFloor] = useState(10);

  const saver = useMemo(() => saverCurve(start), [start]);
  // You cannot roll down to more gold than you have, and letting the slider
  // claim otherwise made the roller finish ahead of the saver from a start of 0.
  const rollTo = Math.min(floor, start);
  const spender = useMemo(() => spenderCurve(start, rollTo), [start, rollTo]);

  const top = Math.max(80, Math.ceil(Math.max(...saver) / 10) * 10);
  const x = (i: number) => PAD.left + (i / ROUNDS) * (W - PAD.left - PAD.right);
  const y = (g: number) => H - PAD.bottom - (g / top) * (H - PAD.top - PAD.bottom);
  const path = (series: number[]) => series.map((g, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(g).toFixed(1)}`).join(' ');

  const capAt = saver.findIndex((g) => g >= CAP);
  const gap = saver[ROUNDS] - spender[ROUNDS];

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: GOLD }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            Starting gold <span className="text-white/70 font-bold tabular-nums">{start}</span>
          </span>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-[150px] accent-amber-300"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            The other player rolls down to{' '}
            <span className="text-white/70 font-bold tabular-nums">{rollTo}</span>
          </span>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            className="w-[150px] accent-rose-400"
          />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block" role="img" aria-label="Gold over rounds">
        {[0, CAP, top].map((g) => (
          <g key={g}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(g)}
              y2={y(g)}
              stroke={g === CAP ? `${GOLD}44` : 'rgba(255,255,255,0.08)'}
              strokeDasharray={g === CAP ? '4 4' : undefined}
            />
            <text x={4} y={y(g) + 3} fontSize={9} fill="rgba(255,255,255,0.35)">
              {g}
            </text>
          </g>
        ))}
        <text x={W - PAD.right} y={y(CAP) - 5} fontSize={9} fill={`${GOLD}aa`} textAnchor="end">
          interest caps at 50
        </text>

        <path d={path(spender)} fill="none" stroke={SPENDER} strokeWidth={2} />
        <path d={path(saver)} fill="none" stroke={GOLD} strokeWidth={2.5} />

        {capAt > 0 && capAt <= ROUNDS && (
          <circle cx={x(capAt)} cy={y(saver[capAt])} r={3.5} fill={GOLD} stroke="#17181b" strokeWidth={1.5} />
        )}

        {[0, 4, 8, 12].map((i) => (
          <text key={i} x={x(i)} y={H - 8} fontSize={9} fill="rgba(255,255,255,0.35)" textAnchor="middle">
            {i === 0 ? 'now' : `+${i}`}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-[2px]" style={{ background: GOLD }} />
          <span style={{ color: GOLD }}>You hold it</span>
          <span className="text-white/40 tabular-nums">{saver[ROUNDS]} gold</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-[2px]" style={{ background: SPENDER }} />
          <span style={{ color: SPENDER }}>They roll it away</span>
          <span className="text-white/40 tabular-nums">{spender[ROUNDS]} gold</span>
        </span>
      </div>

      <div className="mt-3 rounded-lg px-3 py-2.5 text-[13px]" style={{ background: `${GOLD}12` }}>
        {gap > 0 ? (
          <>
            After {ROUNDS} rounds you are <span className="font-bold" style={{ color: GOLD }}>{gap} gold</span> ahead
            &mdash; about <span className="font-bold">{Math.floor(gap / 2)}</span> extra rolls, from doing nothing but
            waiting.
            {capAt > 0 && <> Your pile stops speeding up at round {capAt}, where the cap bites.</>}
          </>
        ) : (
          <>
            At this setting nobody is compounding: below 10 gold the interest is zero, so waiting earns you nothing.
            That is the floor the whole rule sits on.
          </>
        )}
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        Interest only &mdash; 1 gold per 10 held, capped at 5 a round. Base income and streak gold are left out
        deliberately: they move between sets and are not published anywhere checkable, so including them would mean
        inventing numbers.
      </div>
    </div>
  );
}
