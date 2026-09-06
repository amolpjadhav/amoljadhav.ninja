'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// Gradient descent, run by hand.
//
// The reader drags one dial — how big a step to take — and watches the line
// walk toward the data on its own. Everything else is the algorithm: guess,
// measure how wrong the guess is, and nudge the guess in the direction that
// makes it less wrong.
//
// The learning rate is the point of the widget rather than a detail of it. The
// data below diverges above about 0.028, which is not a number anyone chose:
// it falls out of the data itself, and hitting it is how you learn that the
// step size is the difference between learning and exploding.
//
// The data is hardcoded, not generated. A seeded RNG would do, but a literal
// table cannot drift, cannot mismatch between server and client, and lets the
// exact best-fit answer be stated as a fact rather than computed hopefully.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain CSS
// (not Tailwind typography), so `not-prose` does not neutralize it — this
// widget uses <div> for text and pins font-sans.

const ACCENT = '#38bdf8';
const GUESS = '#ffc857';
const BEST = '#4ade80';
const DANGER = '#ff4655';

const DATA: [number, number][] = [
  [0.5, 4.2], [1.4, 5.4], [2.2, 8.1], [3.1, 9.0], [4.0, 11.6], [4.8, 12.4],
  [5.7, 15.1], [6.5, 15.8], [7.4, 18.6], [8.2, 19.2], [9.1, 22.0], [9.8, 22.6],
];

// Least squares, worked out once: the answer descent is trying to reach.
const BEST_M = 2.025;
const BEST_B = 3.087;
const BEST_LOSS = 0.196;

const START = { m: 0, b: 0 };
const MAX_STEPS = 300;
const BLOWN = 1e6;

function lossAt(m: number, b: number): number {
  return DATA.reduce((sum, [x, y]) => sum + (m * x + b - y) ** 2, 0) / DATA.length;
}

/** Slope of the error surface: which way is uphill, and how steeply. */
function gradient(m: number, b: number): [number, number] {
  let gm = 0;
  let gb = 0;
  for (const [x, y] of DATA) {
    const error = m * x + b - y;
    gm += 2 * error * x;
    gb += 2 * error;
  }
  return [gm / DATA.length, gb / DATA.length];
}

const PLOT = { w: 320, h: 210, pad: 26 };
const X_MAX = 10.5;
const Y_MAX = 26;

export default function GradientDescent({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [rate, setRate] = useState(0.008);
  const [{ m, b }, setParams] = useState(START);
  const [history, setHistory] = useState<number[]>([lossAt(START.m, START.b)]);
  const [running, setRunning] = useState(false);

  const loss = lossAt(m, b);
  const blownUp = !Number.isFinite(loss) || loss > BLOWN;

  // Reads m and b from the closure rather than nesting one setState inside
  // another's updater: an updater must be pure, and React can run it twice in
  // development, which was appending the same loss to the history twice.
  const step = useCallback(() => {
    const [gm, gb] = gradient(m, b);
    const next = { m: m - rate * gm, b: b - rate * gb };
    setParams(next);
    setHistory((h) => (h.length > MAX_STEPS ? h : [...h, lossAt(next.m, next.b)]));
  }, [m, b, rate]);

  // Derived, not stored. Stopping the run by calling setState from inside the
  // effect would schedule a render from within a render pass; letting the
  // condition simply stop being true does the same job with no cascade.
  const canRun = running && !blownUp && history.length <= MAX_STEPS;

  useEffect(() => {
    if (!canRun) return;
    const id = setTimeout(step, 60);
    return () => clearTimeout(id);
  }, [canRun, step]);

  const reset = () => {
    setParams(START);
    setHistory([lossAt(START.m, START.b)]);
    setRunning(false);
  };

  const px = (x: number) => PLOT.pad + (x / X_MAX) * (PLOT.w - PLOT.pad * 2);
  const py = (y: number) => PLOT.h - PLOT.pad - (Math.max(0, Math.min(Y_MAX, y)) / Y_MAX) * (PLOT.h - PLOT.pad * 2);

  const lossPath = useMemo(() => {
    const shown = history.slice(0, 60);
    const finite = shown.filter(Number.isFinite);
    const top = Math.max(...finite, BEST_LOSS * 2);
    const span = PLOT.h - PLOT.pad * 2;
    return shown
      .map((l, i) => {
        const x = PLOT.pad + (i / Math.max(12, shown.length - 1)) * (PLOT.w - PLOT.pad * 2);
        const value = Math.max(0, Math.min(top, Number.isFinite(l) ? l : top));
        const y = PLOT.h - PLOT.pad - ((top - value) / top) * span;
        return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [history]);

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 mb-4">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            Step size <span className="text-white/70 font-bold tabular-nums">{rate.toFixed(3)}</span>
          </span>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={Math.round(rate * 1000)}
            onChange={(e) => setRate(Number(e.target.value) / 1000)}
            className="w-[170px] accent-sky-400"
          />
        </label>
        <div className="flex gap-1.5">
          <button
            onClick={() => setRunning((r) => !r)}
            disabled={blownUp}
            className="text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40"
            style={{ background: `${ACCENT}22`, borderColor: `${ACCENT}88`, color: ACCENT }}
          >
            {canRun ? 'Pause' : 'Learn'}
          </button>
          <button
            onClick={step}
            disabled={canRun || blownUp}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-white/15 text-white/60 disabled:opacity-40"
          >
            One step
          </button>
          <button onClick={reset} className="text-[12px] px-3 py-1.5 rounded-lg border border-white/15 text-white/60">
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1">The guess against the data</div>
          <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} width="100%" role="img" aria-label="Data points and the current line">
            <line x1={PLOT.pad} x2={PLOT.w - PLOT.pad} y1={py(0)} y2={py(0)} stroke="rgba(255,255,255,0.12)" />
            <line x1={px(0)} x2={px(0)} y1={PLOT.pad} y2={py(0)} stroke="rgba(255,255,255,0.12)" />

            <line
              x1={px(0)}
              y1={py(BEST_B)}
              x2={px(X_MAX)}
              y2={py(BEST_M * X_MAX + BEST_B)}
              stroke={BEST}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.7}
            />

            {/* How wrong the guess is, one stick per point. This is the number
                being minimised, drawn rather than described. */}
            {DATA.map(([x, y], i) => (
              <line
                key={i}
                x1={px(x)}
                y1={py(y)}
                x2={px(x)}
                y2={py(m * x + b)}
                stroke={blownUp ? DANGER : GUESS}
                strokeWidth={1}
                opacity={0.4}
              />
            ))}

            {!blownUp && (
              <line
                x1={px(0)}
                y1={py(b)}
                x2={px(X_MAX)}
                y2={py(m * X_MAX + b)}
                stroke={GUESS}
                strokeWidth={2.5}
              />
            )}

            {DATA.map(([x, y], i) => (
              <circle key={i} cx={px(x)} cy={py(y)} r={3.2} fill={ACCENT} />
            ))}
          </svg>
        </div>

        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1">How wrong it is, step by step</div>
          <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} width="100%" role="img" aria-label="Loss over steps">
            <line x1={PLOT.pad} x2={PLOT.w - PLOT.pad} y1={PLOT.h - PLOT.pad} y2={PLOT.h - PLOT.pad} stroke="rgba(255,255,255,0.12)" />
            <path d={lossPath} fill="none" stroke={blownUp ? DANGER : ACCENT} strokeWidth={2} />
            <text x={PLOT.pad} y={PLOT.pad - 8} fontSize={9} fill="rgba(255,255,255,0.35)">
              wrongness
            </text>
            <text x={PLOT.w - PLOT.pad} y={PLOT.h - 8} fontSize={9} fill="rgba(255,255,255,0.35)" textAnchor="end">
              steps
            </text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-3 text-[12px]">
        <span className="text-white/45">
          steps <span className="text-white/80 font-bold tabular-nums">{history.length - 1}</span>
        </span>
        <span className="text-white/45">
          wrongness{' '}
          <span className="font-bold tabular-nums" style={{ color: blownUp ? DANGER : GUESS }}>
            {blownUp ? 'exploded' : loss.toFixed(3)}
          </span>
        </span>
        <span className="text-white/45">
          slope <span className="text-white/80 font-bold tabular-nums">{blownUp ? '—' : m.toFixed(2)}</span>
        </span>
        <span className="text-white/45">
          height <span className="text-white/80 font-bold tabular-nums">{blownUp ? '—' : b.toFixed(2)}</span>
        </span>
      </div>

      <div
        className="mt-3 rounded-lg px-3 py-2.5 text-[13px] leading-relaxed"
        style={{ background: blownUp ? `${DANGER}14` : `${ACCENT}12` }}
      >
        {blownUp ? (
          <>
            Too big a step. Each nudge overshot the bottom and landed further up the other side, so the guess threw
            itself apart instead of settling. Nothing was wrong with the method &mdash; only with how far it was
            allowed to move at once.
          </>
        ) : (
          <>
            The dashed green line is the best line that exists for this data, scoring{' '}
            <span className="font-bold" style={{ color: BEST }}>
              {BEST_LOSS}
            </span>
            . Nobody told the yellow line where it was. It only ever knew which way was downhill from wherever it
            happened to be standing.
          </>
        )}
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        Twelve fixed points, one straight line, and a step size you control. Above roughly 0.028 this data cannot be
        fitted at all &mdash; that ceiling comes from the numbers themselves, not from a choice anyone made.
      </div>
    </div>
  );
}
