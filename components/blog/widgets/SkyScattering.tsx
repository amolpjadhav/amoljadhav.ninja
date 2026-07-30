'use client';

import { useEffect, useRef, useState } from 'react';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number) {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

const NOON: [number, number, number] = [91, 155, 245]; // sky blue
const GOLD: [number, number, number] = [245, 185, 74]; // late afternoon
const SUNSET: [number, number, number] = [214, 62, 36]; // deep red-orange

function skyColor(t: number) {
  if (t < 0.5) return lerpColor(NOON, GOLD, t / 0.5);
  return lerpColor(GOLD, SUNSET, (t - 0.5) / 0.5);
}

const VIEW_W = 400;
const VIEW_H = 200;
const GROUND_Y = 175;
const TOP_Y = 15;
const OBSERVER_X = 130;

// Same geometry the rest of the widget uses — the real "air mass"
// approximation (1 / sin(elevation)) for how much atmosphere sunlight
// crosses at a given angle, not a made-up curve.
function geometryAt(sliderVal: number) {
  const t = sliderVal / 100;
  const elevationDeg = lerp(88, 2, t);
  const theta = (elevationDeg * Math.PI) / 180;
  const pathMultiplier = 1 / Math.sin(theta);
  const blueSurviving = 100 * Math.exp(-0.1 * pathMultiplier);
  const redSurviving = 100 * Math.exp(-0.006 * pathMultiplier);
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
  return { t, elevationDeg, pathMultiplier, blueSurviving, redSurviving, sunX, sunY };
}

interface Photon {
  startX: number;
  startY: number;
  color: 'blue' | 'red';
  progress: number;
  speed: number;
  scatterFrac: number | null; // null = survives all the way to you
  scattered: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
}

export default function SkyScattering({ initialSlider }: { initialSlider?: string }) {
  const initial = initialSlider ? Number(initialSlider) : 0;
  const [slider, setSlider] = useState(initial);
  const sliderRef = useRef(initial);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const g = geometryAt(slider);
  const blueSurviving = Math.round(g.blueSurviving);
  const redSurviving = Math.round(g.redSurviving);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let photons: Photon[] = [];

    function spawn() {
      const cur = geometryAt(sliderRef.current);
      const isBlue = Math.random() < 0.55;
      const survivalPct = isBlue ? cur.blueSurviving : cur.redSurviving;
      const survives = Math.random() * 100 < survivalPct;
      photons.push({
        startX: cur.sunX,
        startY: cur.sunY,
        color: isBlue ? 'blue' : 'red',
        progress: 0,
        speed: 0.012 + Math.random() * 0.006,
        scatterFrac: survives ? null : 0.12 + Math.random() * 0.7,
        scattered: false,
        x: cur.sunX,
        y: cur.sunY,
        vx: 0,
        vy: 0,
        opacity: 1,
      });
    }

    let frame: number;
    function tick() {
      const cur = geometryAt(sliderRef.current);

      ctx!.clearRect(0, 0, VIEW_W, VIEW_H);
      ctx!.fillStyle = skyColor(cur.t);
      ctx!.globalAlpha = 0.45;
      ctx!.fillRect(0, TOP_Y, VIEW_W, GROUND_Y - TOP_Y);
      ctx!.globalAlpha = 1;

      ctx!.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(0, GROUND_Y);
      ctx!.lineTo(VIEW_W, GROUND_Y);
      ctx!.stroke();

      // A faint guide line along the current beam — the particles carry the
      // color story now, this just shows the path they're following.
      ctx!.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(OBSERVER_X, GROUND_Y);
      ctx!.lineTo(cur.sunX, cur.sunY);
      ctx!.stroke();

      photons = photons.filter((p) => p.opacity > 0.02 && p.progress < 1.4);
      for (const p of photons) {
        if (!p.scattered) {
          p.progress += p.speed;
          if (p.scatterFrac !== null && p.progress >= p.scatterFrac) {
            p.scattered = true;
            const ang = Math.random() * Math.PI * 2;
            const spd = 0.6 + Math.random() * 0.9;
            p.vx = Math.cos(ang) * spd;
            p.vy = Math.sin(ang) * spd;
          } else {
            const f = Math.min(p.progress, 1);
            p.x = lerp(p.startX, OBSERVER_X, f);
            p.y = lerp(p.startY, GROUND_Y, f);
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;
          p.opacity -= 0.028;
        }

        const color = p.color === 'blue' ? '91,155,245' : '239,68,68';
        ctx!.fillStyle = `rgba(${color},${Math.max(p.opacity, 0).toFixed(2)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.scattered ? 2 : 2.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.fillStyle = '#fde68a';
      ctx!.beginPath();
      ctx!.arc(cur.sunX, cur.sunY, 12, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = '#0aee3c';
      ctx!.beginPath();
      ctx!.arc(OBSERVER_X, GROUND_Y, 4, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = 'rgba(255,255,255,0.5)';
      ctx!.font = '10px monospace';
      ctx!.textAlign = 'center';
      ctx!.fillText('you', OBSERVER_X, GROUND_Y + 16);

      ctx!.textAlign = 'right';
      ctx!.fillStyle = 'rgba(255,255,255,0.4)';
      ctx!.fillText(`${cur.elevationDeg.toFixed(0)}° above the horizon`, VIEW_W - 8, TOP_Y + 12);

      ctx!.textAlign = 'left';
      ctx!.fillStyle = 'rgba(255,255,255,0.55)';
      ctx!.font = 'bold 11px monospace';
      const curLabel = cur.t < 0.15 ? 'HIGH NOON' : cur.t < 0.55 ? 'AFTERNOON' : cur.t < 0.85 ? 'LATE AFTERNOON' : 'SUNSET';
      ctx!.fillText(curLabel, 10, TOP_Y + 12);

      frame = requestAnimationFrame(tick);
    }

    tick();
    const spawnInterval = setInterval(spawn, 90);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(spawnInterval);
    };
  }, []);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Blue scatters off air molecules far more than red does (Rule 2) &mdash; and the more air a
        beam has to cross, the more chances it gets to happen. Drag the sun from overhead toward the horizon to
        stretch that trip out. Each dot below is a photon leaving the sun, heading for the green dot (you) &mdash;
        watch how many more blue ones peel off sideways as the trip gets longer, versus red, which barely
        changes.
      </p>

      <div className="bg-black/30 rounded-lg mb-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          className="w-full h-auto block"
        />
      </div>
      <p className="text-[10px] text-white/40 mb-4 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#5b9bf5] inline-block" /> blue photon
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> red photon
        </span>
        <span>&mdash; a dot that peels off sideways just scattered</span>
      </p>

      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={(e) => {
          const v = Number(e.target.value);
          setSlider(v);
          sliderRef.current = v;
        }}
        className="w-full mb-1 accent-[#0aee3c]"
      />
      <div className="flex justify-between text-[10px] text-white/40 mb-4">
        <span>Noon (sun overhead)</span>
        <span>Sunset (sun on the horizon)</span>
      </div>

      <div className="mb-2">
        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
          How far light travels through the air
        </p>
        <p className="text-white/90 text-lg font-semibold mb-3">
          {g.pathMultiplier.toFixed(1)}&times; farther{' '}
          <span className="text-white/40 text-sm font-normal">than if the sun were straight overhead</span>
        </p>

        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">
          What&rsquo;s left of each color in the direct beam
        </p>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-white/50 w-9 shrink-0">Blue</span>
          <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-[#5b9bf5]" style={{ width: `${blueSurviving}%` }} />
          </div>
          <span className="text-xs text-white/80 w-10 text-right shrink-0">{blueSurviving}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 w-9 shrink-0">Red</span>
          <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-[#ef4444]" style={{ width: `${redSurviving}%` }} />
          </div>
          <span className="text-xs text-white/80 w-10 text-right shrink-0">{redSurviving}%</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 mt-3">
        <p className="text-white/60 text-sm leading-relaxed">
          {g.t < 0.15 ? (
            <>
              At high noon, the sun sits {g.elevationDeg.toFixed(0)}&deg; above the horizon &mdash; almost
              straight up &mdash; so its beam takes the shortest possible path through the atmosphere.{' '}
              {blueSurviving}% of its blue and {redSurviving}% of its red both survive that short trip, so the mix
              reaching your eyes is close to the full, balanced blend it started as &mdash; which is why the sun
              still looks close to white.
            </>
          ) : g.t < 0.55 ? (
            <>
              The sun has dropped to {g.elevationDeg.toFixed(0)}&deg; above the horizon, and its beam is now{' '}
              {g.pathMultiplier.toFixed(1)}&times; longer than at noon. Blue&rsquo;s share has already dropped to{' '}
              {blueSurviving}%, while red is still at {redSurviving}% &mdash; the mix is quietly shifting, even
              though the sun still looks close to white to the eye.
            </>
          ) : g.t < 0.85 ? (
            <>
              Now the sun is just {g.elevationDeg.toFixed(0)}&deg; above the horizon, with a beam{' '}
              {g.pathMultiplier.toFixed(1)}&times; longer than at noon. Only {blueSurviving}% of its blue survives
              that trip now, versus {redSurviving}% of its red &mdash; enough of a gap that the sun itself is
              visibly turning gold.
            </>
          ) : (
            <>
              At sunset, the sun is right on the horizon, and its beam is cutting through so much air that only{' '}
              {blueSurviving}% of its blue survives the trip &mdash; almost all of it has scattered away. Red
              barely scatters at all, even after traveling this far: {redSurviving}% of it still gets through.
              What&rsquo;s left in the beam is almost entirely red and orange &mdash; not because there&rsquo;s
              dramatically less light overall, but because nearly everything except red got filtered out along
              the way. That&rsquo;s the sunset &mdash; but notice it&rsquo;s specifically what you see looking
              toward the sun. Look away from it, up overhead or the opposite direction, and you&rsquo;ll often
              still catch a deep blue: that&rsquo;s scattered light doing exactly what it does at noon. Only the
              direct view toward the sun is the one losing its blue.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
