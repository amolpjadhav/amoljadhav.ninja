'use client';

import { useMemo, useState } from 'react';

// Regression to the mean, done to the reader rather than described at them.
//
// Every dot is a person with a fixed hidden ability. Each round they score
// ability + luck. Pick the top performers of round one and watch round two:
// they fall back toward the middle on their own, because what made them extreme
// was partly luck and luck does not repeat. No intervention, no effect, and yet
// a measurable "improvement" appears the moment you select on the bottom
// instead of the top.
//
// The RNG is seeded on purpose. The server and the browser have to draw the
// same picture or React complains, and a reader who reloads should see the same
// numbers they were just reading about.

const HIGH = '#ffc857';
const LOW = '#60a5fa';
const DIM = 'rgba(255,255,255,0.16)';

const N = 240;
const MEAN = 50;
const SPREAD = 12;

// mulberry32: small, fast, and identical everywhere.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller, so the scores pile up in the middle like real ones do. */
function normal(next: () => number) {
  const u = Math.max(next(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
}

interface Person {
  ability: number;
  first: number;
  second: number;
}

function makePeople(seed: number, luck: number): Person[] {
  const next = rng(seed);
  // luck is the share of a score that is noise, so skill and luck always add to
  // the same total spread — turning luck up must not make everyone spread out.
  const skillSd = SPREAD * (1 - luck);
  const luckSd = SPREAD * luck;
  return Array.from({ length: N }, () => {
    const ability = MEAN + normal(next) * skillSd;
    return {
      ability,
      first: ability + normal(next) * luckSd,
      second: ability + normal(next) * luckSd,
    };
  });
}

const W = 640;
const ROW_H = 54;
const PAD_X = 16;
const LO = 10;
const HI = 90;

export default function RegressionToMean({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [luck, setLuck] = useState(0.5);
  const [pick, setPick] = useState<'top' | 'bottom'>('top');
  const [seed, setSeed] = useState(7);

  const { people, chosen, firstMean, secondMean } = useMemo(() => {
    const people = makePeople(seed, luck);
    const sorted = [...people].sort((a, b) => b.first - a.first);
    const cut = Math.round(N * 0.1);
    const chosen = new Set(pick === 'top' ? sorted.slice(0, cut) : sorted.slice(-cut));
    const list = [...chosen];
    const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
    return {
      people,
      chosen,
      firstMean: mean(list.map((p) => p.first)),
      secondMean: mean(list.map((p) => p.second)),
    };
  }, [seed, luck, pick]);

  const color = pick === 'top' ? HIGH : LOW;
  const x = (score: number) => PAD_X + ((Math.min(HI, Math.max(LO, score)) - LO) / (HI - LO)) * (W - PAD_X * 2);
  const move = secondMean - firstMean;

  const row = (key: 'first' | 'second', label: string, y: number) => (
    <g>
      <text x={PAD_X} y={y - 16} fontSize={10} fill="rgba(255,255,255,0.4)">
        {label}
      </text>
      <line x1={PAD_X} x2={W - PAD_X} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
      {people.map((p, i) => {
        const on = chosen.has(p);
        return (
          <circle
            key={i}
            cx={x(p[key])}
            cy={y + ((i * 37) % 13) - 6}
            r={on ? 3 : 2}
            fill={on ? color : DIM}
            opacity={on ? 0.95 : 0.5}
          />
        );
      })}
      <line
        x1={x(key === 'first' ? firstMean : secondMean)}
        x2={x(key === 'first' ? firstMean : secondMean)}
        y1={y - 11}
        y2={y + 11}
        stroke={color}
        strokeWidth={2}
      />
    </g>
  );

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: HIGH }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 mb-4">
        <div className="flex gap-1.5">
          {(['top', 'bottom'] as const).map((p) => {
            const on = pick === p;
            const c = p === 'top' ? HIGH : LOW;
            return (
              <button
                key={p}
                onClick={() => setPick(p)}
                className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg border transition-all"
                style={{
                  background: on ? `${c}22` : 'rgba(255,255,255,0.04)',
                  borderColor: on ? c : 'rgba(255,255,255,0.12)',
                  color: on ? c : 'rgba(255,255,255,0.55)',
                }}
              >
                Pick the {p} 10%
              </button>
            );
          })}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            How much of a score is luck <span className="text-white/70 font-bold">{Math.round(luck * 100)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={luck * 100}
            onChange={(e) => setLuck(Number(e.target.value) / 100)}
            className="w-[160px] accent-amber-300"
          />
        </label>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="text-[12px] px-2.5 py-1.5 rounded-lg border border-white/15 text-white/55 hover:text-white/85"
        >
          New group
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${ROW_H * 2 + 30}`} width="100%" role="img" aria-label="Scores in two rounds">
        {row('first', 'Round 1 — nobody has done anything yet', 28)}
        {row('second', 'Round 2 — same people, no coaching, no changes', 28 + ROW_H + 18)}
      </svg>

      <div className="mt-3 rounded-lg px-3 py-2.5 text-[13px] leading-relaxed" style={{ background: `${color}12` }}>
        The {pick} 10% averaged <span className="font-bold tabular-nums">{firstMean.toFixed(1)}</span> in round one and{' '}
        <span className="font-bold tabular-nums">{secondMean.toFixed(1)}</span> in round two &mdash; a move of{' '}
        <span className="font-bold tabular-nums" style={{ color }}>
          {move > 0 ? '+' : ''}
          {move.toFixed(1)}
        </span>{' '}
        toward the middle.
        {luck === 0 ? (
          <> With no luck in the scores there is nothing to regress: ability is all there is, so the group stays put.</>
        ) : (
          <>
            {' '}
            Nothing was done to them between rounds. Had you {pick === 'top' ? 'praised' : 'punished'} them, this is the
            number you would have called the effect.
          </>
        )}
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        240 people, each with a fixed hidden ability, scoring ability plus luck twice. Skill and luck always sum to the
        same spread, so moving the slider changes the mix rather than making everyone more extreme.
      </div>
    </div>
  );
}
