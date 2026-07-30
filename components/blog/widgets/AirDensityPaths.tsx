'use client';

import { useState } from 'react';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

const VIEW_W = 400;
const VIEW_H = 200;
const GROUND_Y = 175;
const TOP_Y = 15;
const OBSERVER_X = 130;
// Real air is denser near the ground and thins out fast with altitude. This
// splits the panel into two bands: "thin" (most of it) and a shallow "dense"
// band near the ground, where the overwhelming majority of scattering
// actually happens. A simplification of a real density gradient, but it's
// the piece that explains why the rest of the sky stays blue at sunset.
const DENSE_TOP_Y = GROUND_Y - 35;

function sunPosition(sliderVal: number) {
  // Kept inside a narrower range than the other widget's — low enough to
  // show the effect clearly, not so low the sun itself dips into the dense
  // band, which would need extra geometry this widget doesn't model.
  const t = sliderVal / 100;
  const elevationDeg = lerp(85, 9, t);
  const theta = (elevationDeg * Math.PI) / 180;
  const dx = Math.cos(theta);
  const dy = Math.sin(theta);
  const tToTop = (GROUND_Y - TOP_Y) / dy;
  const xAtTop = OBSERVER_X + tToTop * dx;
  const rightEdge = VIEW_W - 20;
  let sunX: number;
  let sunY: number;
  if (xAtTop <= rightEdge) {
    sunX = xAtTop;
    sunY = TOP_Y;
  } else {
    const tToRight = (rightEdge - OBSERVER_X) / dx;
    sunX = rightEdge;
    sunY = Math.max(TOP_Y, GROUND_Y - tToRight * dy);
  }
  return { t, elevationDeg, sunX, sunY };
}

const DENSE_DECAY = 0.008; // illustrative, tuned so overhead stays clearly blue

export default function AirDensityPaths() {
  const [slider, setSlider] = useState(0);
  const { elevationDeg, sunX, sunY } = sunPosition(slider);

  // Path 1: sun straight to you (the "look toward the sun" view).
  const totalLen1 = dist(sunX, sunY, OBSERVER_X, GROUND_Y);
  const verticalDrop1 = GROUND_Y - sunY;
  const denseFrac1 = verticalDrop1 > 0 ? Math.min(1, (GROUND_Y - DENSE_TOP_Y) / verticalDrop1) : 1;
  const denseLen1 = totalLen1 * denseFrac1;
  const denseStart1X = lerp(sunX, OBSERVER_X, 1 - denseFrac1);
  const denseStart1Y = DENSE_TOP_Y;

  // Path 2: sun to a point directly overhead (still in thin air), then a
  // short straight drop through the dense band to reach you. The dense-air
  // distance here is always the same — that's the whole point.
  const denseLen2 = GROUND_Y - DENSE_TOP_Y;

  const blueToward = Math.max(1, Math.round(100 * Math.exp(-DENSE_DECAY * denseLen1)));
  const blueOverhead = Math.round(100 * Math.exp(-DENSE_DECAY * denseLen2));

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Real air isn&rsquo;t one uniform layer &mdash; it&rsquo;s thin almost everywhere, with a shallow, dense
        band right near the ground (shaded below) where nearly all the scattering actually happens. Drag the sun
        toward the horizon and compare two paths: straight toward the sun, versus straight up overhead.
      </p>

      <div className="bg-black/30 rounded-lg mb-4 overflow-hidden">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">
          <rect x={0} y={TOP_Y} width={VIEW_W} height={DENSE_TOP_Y - TOP_Y} fill="#38bdf8" opacity={0.06} />
          <rect x={0} y={DENSE_TOP_Y} width={VIEW_W} height={GROUND_Y - DENSE_TOP_Y} fill="#38bdf8" opacity={0.22} />
          <text x={10} y={TOP_Y + 12} fontSize={9} fill="rgba(255,255,255,0.35)">
            thin air
          </text>
          <text x={10} y={DENSE_TOP_Y + 12} fontSize={9} fill="rgba(255,255,255,0.5)">
            dense air
          </text>
          <line x1={0} y1={GROUND_Y} x2={VIEW_W} y2={GROUND_Y} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />

          {/* Path 1: sun -> you, thin-air segment then dense-air segment */}
          <line
            x1={sunX}
            y1={sunY}
            x2={denseStart1X}
            y2={denseStart1Y}
            stroke="rgba(91,155,245,0.8)"
            strokeWidth={2}
          />
          <line
            x1={denseStart1X}
            y1={denseStart1Y}
            x2={OBSERVER_X}
            y2={GROUND_Y}
            stroke="#ef4444"
            strokeWidth={3}
          />

          {/* Path 2: sun -> overhead point (thin air), then straight down (dense) */}
          <line x1={sunX} y1={sunY} x2={OBSERVER_X} y2={DENSE_TOP_Y} stroke="rgba(91,155,245,0.5)" strokeWidth={2} strokeDasharray="3,3" />
          <line x1={OBSERVER_X} y1={DENSE_TOP_Y} x2={OBSERVER_X} y2={GROUND_Y} stroke="#5b9bf5" strokeWidth={3} />
          <circle cx={OBSERVER_X} cy={DENSE_TOP_Y} r={3} fill="#facc15" />

          <circle cx={sunX} cy={sunY} r={11} fill="#fde68a" />
          <circle cx={OBSERVER_X} cy={GROUND_Y} r={4} fill="#0aee3c" />
          <text x={OBSERVER_X} y={GROUND_Y + 16} fontSize={10} fill="rgba(255,255,255,0.5)" textAnchor="middle">
            you
          </text>
          <text x={VIEW_W - 8} y={TOP_Y + 12} fontSize={10} fill="rgba(255,255,255,0.4)" textAnchor="end">
            {elevationDeg.toFixed(0)}&deg; above the horizon
          </text>
        </svg>
      </div>

      <p className="text-[10px] text-white/40 mb-4 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-1 rounded-full bg-[#ef4444] inline-block" /> toward the sun, in dense air
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-1 rounded-full bg-[#5b9bf5] inline-block" /> overhead, in dense air
        </span>
      </p>

      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={(e) => setSlider(Number(e.target.value))}
        className="w-full mb-1 accent-[#0aee3c]"
      />
      <div className="flex justify-between text-[10px] text-white/40 mb-4">
        <span>Higher in the sky</span>
        <span>Closer to the horizon</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Toward the sun</p>
          <p className="text-white/90 text-base font-semibold">{denseLen1.toFixed(0)} units in dense air</p>
          <p className="text-white/50 text-xs">blue surviving: {blueToward}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Straight overhead</p>
          <p className="text-white/90 text-base font-semibold">{denseLen2.toFixed(0)} units in dense air</p>
          <p className="text-white/50 text-xs">blue surviving: {blueOverhead}%</p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-white/60 text-sm leading-relaxed">
          Both paths travel the same total distance through thin air without much trouble. The difference is what
          happens after: the path toward the sun has to keep going, grazing through the dense band at a shallow
          angle for a long stretch &mdash; that stretch grows fast as the sun drops. The path overhead only needs
          a short, direct hop straight down through that same dense band, which barely changes no matter what
          time of day it is. Same rule as always &mdash; more distance through the air molecules means more
          chances to scatter &mdash; it just turns out almost all of that distance, for almost every direction,
          happens in one shallow band near the ground.
        </p>
      </div>
    </div>
  );
}
