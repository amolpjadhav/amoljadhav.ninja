'use client';

import { useMemo, useState } from 'react';

const WIDTH = 600;
const HEIGHT = 160;
const MID = HEIGHT / 2;

// A fixed field of "molecules" — same positions every render, generated once
// with a simple seeded PRNG so the layout doesn't reshuffle on every slider
// move (that would be distracting, not illustrative).
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function useMolecules(count: number) {
  return useMemo(() => {
    const rand = seededRandom(7);
    return Array.from({ length: count }, () => ({
      x: 30 + rand() * (WIDTH - 60),
      y: 20 + rand() * (HEIGHT - 40),
    }));
  }, [count]);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number) {
  return `rgb(${Math.round(lerp(c1[0], c2[0], t))}, ${Math.round(lerp(c1[1], c2[1], t))}, ${Math.round(lerp(c1[2], c2[2], t))})`;
}

const VIOLET: [number, number, number] = [139, 92, 246];
const RED: [number, number, number] = [239, 68, 68];

export default function ScatteringDemo() {
  const [slider, setSlider] = useState(15);
  const t = slider / 100; // 0 = short wavelength, 1 = long wavelength
  const molecules = useMolecules(26);
  const color = lerpColor(VIOLET, RED, t);

  // Short wavelength -> many bounces (scatters constantly). Long wavelength
  // -> almost none (mostly slips straight through). Illustrative, not a
  // physics simulation.
  const bounces = Math.max(0, Math.round(lerp(9, 0, t)));

  const hitPoints = useMemo(() => {
    if (bounces === 0) return [];
    const sorted = [...molecules].sort((a, b) => a.x - b.x);
    const step = Math.max(1, Math.floor(sorted.length / (bounces + 1)));
    const picked: { x: number; y: number }[] = [];
    for (let i = 1; i <= bounces; i++) {
      const idx = Math.min(sorted.length - 1, i * step);
      picked.push(sorted[idx]);
    }
    return picked;
  }, [molecules, bounces]);

  const pathPoints = [{ x: 0, y: MID }, ...hitPoints, { x: WIDTH, y: MID }];
  const pathD = `M${pathPoints.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' L')}`;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        A beam of light, one wavelength at a time, crossing a patch of air full of molecules. Drag the slider and
        watch how often it gets knocked off course.
      </p>

      <div className="bg-black/30 rounded-lg p-3 mb-4">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
          {molecules.map((m, i) => (
            <circle key={i} cx={m.x} cy={m.y} r={3} fill="rgba(255,255,255,0.25)" />
          ))}
          {hitPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={5} fill={color} />
          ))}
          <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <text x={4} y={16} fill="rgba(255,255,255,0.4)" fontSize={11}>
            sun
          </text>
          <text x={WIDTH - 26} y={16} fill="rgba(255,255,255,0.4)" fontSize={11}>
            you
          </text>
        </svg>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={(e) => setSlider(Number(e.target.value))}
        className="w-full mb-1"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-white/40 mb-4">
        <span>Short wavelength (blue/violet)</span>
        <span>Long wavelength (red/orange)</span>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-sm">
          Bounced off <strong style={{ color }}>{bounces}</strong> {bounces === 1 ? 'molecule' : 'molecules'} on
          the way across.
        </p>
        <p className="text-white/60 text-xs mt-1">
          {bounces > 4
            ? 'This is what blue and violet light do constantly — bounce sideways so often that it ends up arriving from every direction in the sky.'
            : bounces > 0
              ? 'A middling wavelength — some scattering, but nowhere near as much as blue.'
              : 'This is what red and orange light do — slip through nearly untouched, arriving in a mostly straight line.'}
        </p>
      </div>
    </div>
  );
}
