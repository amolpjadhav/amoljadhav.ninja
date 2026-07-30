'use client';

import { useState } from 'react';

const WIDTH = 600;
const HEIGHT = 120;
const MID = HEIGHT / 2;
const AMPLITUDE = 32;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number) {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

// Short wavelength (violet) -> long wavelength (red), roughly matching the
// visible spectrum order. Purely illustrative, same spirit as elsewhere.
const STOPS: { t: number; color: [number, number, number]; name: string }[] = [
  { t: 0, color: [139, 92, 246], name: 'Violet' },
  { t: 0.22, color: [91, 155, 245], name: 'Blue' },
  { t: 0.45, color: [34, 197, 94], name: 'Green' },
  { t: 0.65, color: [234, 179, 8], name: 'Yellow' },
  { t: 0.82, color: [249, 115, 22], name: 'Orange' },
  { t: 1, color: [239, 68, 68], name: 'Red' },
];

function colorAt(t: number) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const localT = (t - a.t) / (b.t - a.t);
      return { color: lerpColor(a.color, b.color, localT), name: localT < 0.5 ? a.name : b.name };
    }
  }
  return { color: `rgb(${STOPS[STOPS.length - 1].color.join(',')})`, name: STOPS[STOPS.length - 1].name };
}

function wavePath(wavelength: number) {
  const points: string[] = [];
  for (let x = 0; x <= WIDTH; x += 4) {
    const y = MID + AMPLITUDE * Math.sin((2 * Math.PI * x) / wavelength);
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(' L')}`;
}

export default function WavelengthWave() {
  const [slider, setSlider] = useState(50);
  const t = slider / 100;

  // Short wavelength (tight squiggle) at slider=0, long (spread out) at slider=100.
  const wavelength = lerp(30, 220, t);
  const { color, name } = colorAt(t);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Drag the slider to squish or stretch the wave, and watch which color it becomes.
      </p>

      <div className="bg-black/30 rounded-lg p-3 mb-4">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
          <path d={wavePath(wavelength)} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
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
        <span>Short, tight squiggle</span>
        <span>Long, spread-out squiggle</span>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-sm">
          This is <strong style={{ color }}>{name.toLowerCase()}</strong> light &mdash; a wavelength of about{' '}
          <strong className="text-white/90">{wavelength.toFixed(0)} units</strong>.
        </p>
        <p className="text-white/60 text-xs mt-1">
          Nothing about the light changed except the size of its squiggle. That size is the entire difference
          between every color there is.
        </p>
      </div>
    </div>
  );
}
