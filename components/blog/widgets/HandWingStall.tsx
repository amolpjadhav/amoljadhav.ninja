'use client';

import { useState } from 'react';

// Can't stick your hand out of the car right now? Do it here instead.
// Drag the slider to tilt the hand-wing: lift grows, the backward shove
// grows too — and past the stall angle the lift suddenly dies.
// Illustrative curves, same shape as a real wing's lift curve.

const STALL_DEG = 16;
const MAX_DEG = 30;

// Lift rises with tilt, then collapses past the stall angle.
function liftAt(tilt: number) {
  if (tilt <= STALL_DEG) return tilt / STALL_DEG;
  return Math.max(0.12, 1 - (tilt - STALL_DEG) / 7);
}

// The backward shove on your arm grows all the way, faster after the stall.
function dragAt(tilt: number) {
  const t = tilt / MAX_DEG;
  return 0.06 + t * t * 1.4;
}

function statusFor(tilt: number) {
  if (tilt < 4) return 'Palm flat — barely any lift. Tilt a little!';
  if (tilt <= STALL_DEG) return 'Flying! More tilt, more lift.';
  return 'STALLED! Too much tilt — lift died and your hand gets blasted back.';
}

export default function HandWingStall() {
  const [tilt, setTilt] = useState(10);
  const stalled = tilt > STALL_DEG;
  const lift = liftAt(tilt);
  const drag = Math.min(1, dragAt(tilt));

  const liftLen = 12 + lift * 95;
  const dragLen = 10 + drag * 95;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-5 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        This is your hand out the car window, seen from the side. Drag the slider to tilt it.
      </p>

      <div className="bg-black/30 rounded-lg p-3 mb-4 overflow-hidden">
        <svg viewBox="0 0 600 240" className="w-full h-auto" role="img" aria-label="Tilting a hand like a wing increases lift until it stalls">
          {/* airflow */}
          <line x1={10} y1={90} x2={230} y2={90} stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} strokeDasharray="6 5" />
          <line x1={10} y1={140} x2={230} y2={140} stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} strokeDasharray="6 5" />
          <line x1={10} y1={190} x2={230} y2={190} stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} strokeDasharray="6 5" />

          {/* the hand: a plate rotating with the slider */}
          <g transform={`rotate(${-tilt} 320 140)`}>
            <rect x={230} y={130} width={180} height={20} rx={10} fill="#9aa3ad" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
            <text x={320} y={145} fontSize={14} fill="#1c1d20" fontWeight="bold" textAnchor="middle">
              hand
            </text>
          </g>

          {/* lift arrow: grows, then dies past the stall */}
          <line x1={320} y1={122} x2={320} y2={122 - liftLen} stroke={stalled ? 'rgba(10,238,60,0.35)' : '#0aee3c'} strokeWidth={4} />
          <polygon
            points={`314,${122 - liftLen} 320,${110 - liftLen} 326,${122 - liftLen}`}
            fill={stalled ? 'rgba(10,238,60,0.35)' : '#0aee3c'}
          />
          <text x={334} y={122 - liftLen + 4} fontSize={13} fill={stalled ? 'rgba(10,238,60,0.5)' : '#0aee3c'} fontWeight="bold">
            lift
          </text>

          {/* backward shove: grows the whole way */}
          <line x1={428} y1={140} x2={428 + dragLen} y2={140} stroke="#fb923c" strokeWidth={4} />
          <polygon
            points={`${428 + dragLen},133 ${442 + dragLen},140 ${428 + dragLen},147`}
            fill="#fb923c"
          />
          <text x={430} y={165} fontSize={13} fill="#fb923c" fontWeight="bold">
            backward shove
          </text>

          {/* stall marker */}
          {stalled && (
            <text x={300} y={225} fontSize={16} fill="#f87171" fontWeight="bold" textAnchor="middle">
              STALLED — too much tilt!
            </text>
          )}
        </svg>
      </div>

      <label className="block text-white/70 text-sm mb-1" htmlFor="hand-tilt">
        Tilt: <strong className="text-white">{tilt}°</strong> — {statusFor(tilt)}
      </label>
      <input
        id="hand-tilt"
        type="range"
        min={0}
        max={MAX_DEG}
        value={tilt}
        onChange={(e) => setTilt(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/70 mt-2">
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400 mr-1.5" />
          green arrow: lift pushing your hand up
        </span>
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 mr-1.5" />
          orange arrow: shove blasting your arm back
        </span>
      </div>
    </div>
  );
}
