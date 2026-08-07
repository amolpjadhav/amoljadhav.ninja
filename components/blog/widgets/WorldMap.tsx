'use client';

import { WORLD_DOTS } from './worldMapDots';

interface Pin {
  label: string;
  lon: number;
  lat: number;
  note?: string;
}

// Equirectangular projection, matching how WORLD_DOTS was generated —
// keep these in sync if the dot grid is ever regenerated at a different size.
const VIEW_W = 900;
const VIEW_H = 450;

function project(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * VIEW_W;
  const y = ((90 - lat) / 180) * VIEW_H;
  return [x, y];
}

const DEFAULT_PINS: Pin[] = [
  { label: 'Ethiopia', lon: 36.2, lat: 7.3 },
  { label: 'Yemen', lon: 43.25, lat: 13.3 },
];
const DEFAULT_EYEBROW = 'Where this happened';
const DEFAULT_CAPTION = '';

export default function WorldMap({
  pins,
  eyebrow,
  caption,
  accentColor,
}: {
  pins?: string;
  eyebrow?: string;
  caption?: string;
  accentColor?: string;
}) {
  const data: Pin[] = pins ? JSON.parse(pins) : DEFAULT_PINS;
  const accent = accentColor || '#facc15';

  const points = data.map((p) => project(p.lon, p.lat));
  const routeD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow || DEFAULT_EYEBROW}</p>
      {(caption || DEFAULT_CAPTION) && (
        <p className="text-white/70 text-sm mb-4">{caption || DEFAULT_CAPTION}</p>
      )}

      <div className="bg-black/30 rounded-lg mb-4 overflow-hidden">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">
          {Array.from({ length: WORLD_DOTS.length / 2 }, (_, i) => {
            const [x, y] = project(WORLD_DOTS[i * 2], WORLD_DOTS[i * 2 + 1]);
            return <circle key={i} cx={x} cy={y} r={1.3} fill="rgba(10,238,60,0.22)" />;
          })}

          {data.length > 1 && (
            <path d={routeD} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
          )}

          {points.map(([x, y], i) => (
            <g key={data[i].label}>
              <circle cx={x} cy={y} r={9} fill="#1c1d20" stroke={accent} strokeWidth={1.5} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill={accent}>
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ol className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs text-white/60">
        {data.map((p, i) => (
          <li key={p.label} className="flex items-baseline gap-1.5">
            <span className="font-bold shrink-0" style={{ color: accent }}>
              {i + 1}.
            </span>
            <span>
              {p.label}
              {p.note && <span className="text-white/35"> — {p.note}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
