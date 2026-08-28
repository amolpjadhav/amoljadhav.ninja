'use client';

import { useState } from 'react';

// A box of particles that starts perfectly sorted and refuses to re-sort
// itself. Every "shake" gives each particle a fresh random side, so nothing
// forbids them landing back where they started — it's just staggeringly
// unlikely once there are more than a handful. That's the whole point of the
// article: entropy isn't a force, it's a counting problem.
//
// Odds of landing perfectly sorted again = 1 / 2^N.
//
// The initial render is deterministic (everything sorted, fixed jitter table)
// so there's no server/client hydration mismatch. Randomness only ever runs
// in response to a click.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

const BLUE = '#5b9bf5';
const RED = '#e0533d';

// Fixed jitter so the first paint is identical on server and client.
const JITTER = [
  0.18, 0.72, 0.41, 0.93, 0.06, 0.55, 0.29, 0.84, 0.63, 0.11, 0.47, 0.78, 0.34, 0.9, 0.22, 0.66,
  0.51, 0.03, 0.87, 0.39, 0.75, 0.14, 0.6, 0.31, 0.96, 0.44, 0.08, 0.69, 0.26, 0.81, 0.57, 0.36,
  0.99, 0.2, 0.64, 0.49, 0.12, 0.86, 0.42, 0.71, 0.05, 0.58, 0.33, 0.91, 0.24, 0.77, 0.53, 0.16,
  0.83, 0.38, 0.68, 0.09, 0.61, 0.28, 0.94, 0.46, 0.02, 0.73, 0.35, 0.88, 0.19, 0.65, 0.5, 0.13,
  0.79, 0.43, 0.7, 0.07, 0.56, 0.3, 0.97, 0.45, 0.23, 0.82, 0.52, 0.15, 0.89, 0.4, 0.67, 0.1,
  0.62, 0.27, 0.95, 0.48, 0.04, 0.74, 0.37, 0.85, 0.21, 0.59, 0.32, 0.92, 0.25, 0.8, 0.54, 0.17,
  0.76, 0.47, 0.66, 0.01,
];

function oddsLabel(n: number) {
  const exp = n * Math.log10(2);
  if (exp < 6) {
    return `1 in ${Math.round(Math.pow(2, n)).toLocaleString()}`;
  }
  return `1 in 10^${Math.round(exp)}`;
}

export default function MixingBox({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [n, setN] = useState(8);
  const [sides, setSides] = useState<number[] | null>(null); // null = still in the starting sorted state
  const [shakes, setShakes] = useState(0);
  const [sorted, setSorted] = useState(0);

  const half = Math.floor(n / 2);

  // Starting state: blues (index < half) on the left, reds on the right.
  const current = sides && sides.length === n ? sides : Array.from({ length: n }, (_, i) => (i < half ? 0 : 1));

  const isSorted = current.every((side, i) => side === (i < half ? 0 : 1));

  function shake() {
    const next = Array.from({ length: n }, () => (Math.random() < 0.5 ? 0 : 1));
    const nowSorted = next.every((side, i) => side === (i < half ? 0 : 1));
    setSides(next);
    setShakes((s) => s + 1);
    if (nowSorted) setSorted((s) => s + 1);
  }

  function reset(newN?: number) {
    const size = newN ?? n;
    if (newN !== undefined) setN(newN);
    setSides(null);
    setShakes(0);
    setSorted(0);
    void size;
  }

  // Rough scale anchor: one shake per second since the Big Bang (~4.35e17 s).
  const neverInUniverse = n * Math.log10(2) > 17.64;

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={shake}
          className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
          style={{ background: `${BLUE}22`, color: BLUE, borderColor: `${BLUE}66` }}
        >
          Shake the box
        </button>
        <button
          onClick={() => reset()}
          className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-white/5 text-white/50 hover:text-white/80 transition-colors"
        >
          Put it back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-white/35">Particles</span>
          <input
            type="range"
            min={4}
            max={100}
            step={2}
            value={n}
            onChange={(e) => reset(Number(e.target.value))}
            className="w-24 accent-white/70"
            aria-label="number of particles"
          />
          <span className="text-[11px] font-semibold text-white/70 w-7">{n}</span>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3">
        <div className="relative rounded-md border border-white/10 bg-black/30" style={{ height: 150 }}>
          {/* the divider is only a visual reference — nothing stops particles crossing it */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />

          {current.map((side, i) => {
            const isBlue = i < half;
            const j = JITTER[i % JITTER.length];
            const j2 = JITTER[(i * 7 + 3) % JITTER.length];
            const left = side === 0 ? 4 + j * 42 : 54 + j * 42;
            const top = 6 + j2 * 84;
            return (
              <div
                key={i}
                className="absolute rounded-full transition-all duration-500 ease-out"
                style={{
                  width: 9,
                  height: 9,
                  left: `${left}%`,
                  top: `${top}%`,
                  background: isBlue ? BLUE : RED,
                  boxShadow: `0 0 6px ${isBlue ? BLUE : RED}`,
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-2.5 text-[10px] text-white/35">
          <span>shakes: {shakes}</span>
          <span
            className="font-semibold"
            style={{ color: isSorted ? BLUE : 'rgba(255,255,255,0.45)' }}
          >
            {isSorted ? 'perfectly sorted' : 'mixed up'}
          </span>
          <span>came back sorted: {sorted}</span>
        </div>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3">
        <div className="text-[11px] font-bold mb-1" style={{ color: BLUE }}>
          Odds of it landing perfectly sorted on any one shake: {oddsLabel(n)}
        </div>
        <div className="text-xs text-white/55 leading-snug">
          {n <= 10 ? (
            <>
              With only {n} particles the odds are small but real &mdash; keep shaking and you will genuinely see it
              sort itself. Nothing is stopping it. Now drag the slider up.
            </>
          ) : neverInUniverse ? (
            <>
              At {n} particles you could shake this box once a second, starting at the Big Bang, and still almost
              certainly never see it come back sorted. And a single breath of air holds around 10,000,000,000,000,000,000,000
              particles.
            </>
          ) : (
            <>
              At {n} particles it is still <em>possible</em> &mdash; just wildly unlikely. Nothing forbids it. There
              are simply far more mixed-up arrangements than sorted ones.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
