'use client';

import { useMemo, useState } from 'react';

const WIDTH = 400;
const HEIGHT = 220;
const EARTH_CX = 200;
const EARTH_CY = 110;
const EARTH_R = 70;
const RING_WIDTH = 5;

// The point on the ring we zoom into — the right edge of the atmosphere band.
const TARGET_X = EARTH_CX + EARTH_R + RING_WIDTH / 2;
const TARGET_Y = EARTH_CY;
const TARGET_SIZE = 16; // final viewBox width, in the same units as WIDTH/HEIGHT

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function useMolecules(count: number) {
  return useMemo(() => {
    const rand = seededRandom(11);
    return Array.from({ length: count }, () => ({
      x: TARGET_X + (rand() - 0.5) * 26,
      y: TARGET_Y + (rand() - 0.5) * 26,
      r: 0.25 + rand() * 0.25,
    }));
  }, [count]);
}

export default function AtmosphereZoom() {
  const [slider, setSlider] = useState(0);
  const t = slider / 100;
  const easeT = t * t; // gentle at first, dramatic as it closes in on the molecules
  const molecules = useMolecules(90);

  const curW = lerp(WIDTH, TARGET_SIZE, easeT);
  const curH = curW * (HEIGHT / WIDTH);
  const centerX = lerp(WIDTH / 2, TARGET_X, easeT);
  const centerY = lerp(HEIGHT / 2, TARGET_Y, easeT);
  const viewBox = `${centerX - curW / 2} ${centerY - curH / 2} ${curW} ${curH}`;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Drag the slider to zoom the camera in &mdash; from all of Earth, into one tiny patch of the atmosphere
        wrapped around it. The molecules were there the whole time; they&rsquo;re just too small to see until you
        get close enough.
      </p>

      <div className="bg-black/30 rounded-lg overflow-hidden mb-4" style={{ height: HEIGHT / 1.8 }}>
        <svg viewBox={viewBox} className="w-full h-full">
          <circle cx={EARTH_CX} cy={EARTH_CY} r={EARTH_R} fill="#14204a" />
          <circle
            cx={EARTH_CX}
            cy={EARTH_CY}
            r={EARTH_R + RING_WIDTH / 2}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={RING_WIDTH}
          />
          <text x={EARTH_CX} y={EARTH_CY} fontSize={14} fill="rgba(255,255,255,0.5)" textAnchor="middle">
            EARTH
          </text>
          <text
            x={EARTH_CX - 40}
            y={EARTH_CY - EARTH_R - 10}
            fontSize={10}
            fill="#38bdf8"
            textAnchor="middle"
          >
            atmosphere &darr;
          </text>
          {molecules.map((m, i) => (
            <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="#5b9bf5" />
          ))}
        </svg>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={(e) => setSlider(Number(e.target.value))}
        className="w-full mb-1 accent-[#0aee3c]"
      />
      <div className="flex justify-between text-[10px] text-white/40 mb-4">
        <span>Earth, from space</span>
        <span>A patch of air, up close</span>
      </div>

      <div className="border-t border-white/10 pt-4 min-h-[4.5rem]">
        {t < 0.5 ? (
          <p className="text-white/60 text-sm leading-relaxed">
            Earth&rsquo;s atmosphere (the blue ring) is only about 100 km (62 miles) thick. Compared to the size
            of the whole planet, that&rsquo;s proportionally{' '}
            <strong className="text-white/85">thinner than the skin on an apple</strong> is to the apple itself.
          </p>
        ) : (
          <p className="text-white/60 text-sm leading-relaxed">
            Keep zooming into that thin ring, and this is what&rsquo;s actually in it: a single cubic centimeter
            of air, smaller than a sugar cube, holds about{' '}
            <strong className="text-white/85">25,000,000,000,000,000,000 molecules</strong>. There are more
            molecules in the breath you just took than there are stars in the observable universe.
          </p>
        )}
      </div>
    </div>
  );
}
