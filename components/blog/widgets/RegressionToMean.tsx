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
  /** Vertical offset so 240 dots on one line are readable. */
  jitter: number;
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
      // Drawn from the same stream rather than computed from the index. An
      // index-based offset gave only 13 distinct heights with a step of 11
      // between neighbours, which striped the cloud into diagonals.
      jitter: (next() * 2 - 1) * JITTER,
    };
  });
}

const W = 640;
const H = 214;
const PAD_X = 18;
const JITTER = 9;
const ROW_ONE = 52;
const ROW_TWO = 156;
// Total spread is 12, so 15-85 is three standard deviations either side of the
// mean and holds about 99.7% of the dots. The old 10-90 left a third of the
// width permanently empty on the right.
const LO = 15;
const HI = 85;

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

  const dotY = (p: Person, base: number) => base + p.jitter;

  const rowDots = (key: 'first' | 'second', base: number) =>
    people.map((p, i) => {
      const on = chosen.has(p);
      return (
        <circle
          key={i}
          cx={x(p[key])}
          cy={dotY(p, base)}
          r={on ? 3.2 : 1.9}
          fill={on ? color : DIM}
          opacity={on ? 0.95 : 0.55}
        />
      );
    });

  /** The group's own average, marked so "toward the middle" has two ends. */
  const groupMark = (value: number, base: number, label: string) => (
    <g>
      <line x1={x(value)} x2={x(value)} y1={base - 15} y2={base + 15} stroke={color} strokeWidth={2.5} />
      <text x={x(value)} y={base - 20} fontSize={9.5} fill={color} textAnchor="middle">
        {label} {value.toFixed(1)}
      </text>
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

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Scores in two rounds">
        {/* The mean, which the whole idea is named after and which the first
            version of this chart somehow did not draw. */}
        <line
          x1={x(MEAN)}
          x2={x(MEAN)}
          y1={ROW_ONE - 34}
          y2={ROW_TWO + 22}
          stroke="rgba(255,255,255,0.28)"
          strokeDasharray="3 4"
        />
        <text x={x(MEAN) + 5} y={ROW_ONE - 36} fontSize={9.5} fill="rgba(255,255,255,0.45)">
          the mean ({MEAN})
        </text>

        {[ROW_ONE, ROW_TWO].map((base) => (
          <line
            key={base}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={base}
            y2={base}
            stroke="rgba(255,255,255,0.07)"
          />
        ))}

        {/* One line per selected person, so the reader watches individuals move
            instead of comparing two clouds by eye. It also shows the honest
            part: a few of them go the other way. It is the group that falls
            back, not every member of it. */}
        {[...chosen].map((p, i) => (
          <line
            key={i}
            x1={x(p.first)}
            y1={dotY(p, ROW_ONE)}
            x2={x(p.second)}
            y2={dotY(p, ROW_TWO)}
            stroke={color}
            strokeWidth={1}
            opacity={0.28}
          />
        ))}

        <text x={PAD_X} y={ROW_ONE - 22} fontSize={10} fill="rgba(255,255,255,0.4)">
          Round 1 &mdash; nobody has done anything yet
        </text>
        {rowDots('first', ROW_ONE)}
        {groupMark(firstMean, ROW_ONE, 'their average')}

        <text x={PAD_X} y={ROW_TWO - 22} fontSize={10} fill="rgba(255,255,255,0.4)">
          Round 2 &mdash; same people, no coaching, no changes
        </text>
        {rowDots('second', ROW_TWO)}
        {groupMark(secondMean, ROW_TWO, 'their average')}

        {[30, 50, 70].map((t) => (
          <text key={t} x={x(t)} y={H - 6} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="middle">
            {t}
          </text>
        ))}
        <text x={PAD_X} y={H - 6} fontSize={9} fill="rgba(255,255,255,0.25)">
          score
        </text>
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
