'use client';

import { useEffect, useRef, useState } from 'react';

// The killer experiment against the old story: a stunt plane's symmetric
// wing flipped upside down. The "long road" now points the wrong way — yet
// the downwash and the lift stay exactly the same. Press the button, flip
// the wing, watch nothing break.

export default function UpsideDownWing() {
  const [flipped, setFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Freeze the looping puff for readers who ask for reduced motion.
  // (The flip itself is a button press, so it stays instant for everyone.)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      containerRef.current
        ?.querySelectorAll<SVGSVGElement>('svg')
        .forEach((svg) => svg.pauseAnimations());
    }
  }, []);

  return (
    <div ref={containerRef} className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-5 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        This stunt-plane wing is symmetric — same curve top and bottom. Press the button to flip it
        upside down and watch what happens to the lift.
      </p>

      <div className="bg-black/30 rounded-lg p-3 mb-4 overflow-hidden">
        <svg viewBox="0 0 600 290" className="w-full h-auto" role="img" aria-label="A symmetric stunt-plane wing flipped upside down keeps producing lift">
          {/* The old story's "long road", drawn the way it claims to work */}
          {!flipped ? (
            <>
              <path
                d="M 60 150 C 160 80, 440 80, 540 150"
                fill="none"
                stroke="#fbbf24"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                opacity={0.85}
              />
              <text x={300} y={62} fontSize={13} fill="#fbbf24" fontWeight="bold" textAnchor="middle">
                the &ldquo;long road&rdquo; on top
              </text>
            </>
          ) : (
            <>
              <path
                d="M 60 150 C 160 222, 440 222, 540 150"
                fill="none"
                stroke="#fbbf24"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                opacity={0.85}
              />
              <text x={300} y={248} fontSize={13} fill="#fbbf24" fontWeight="bold" textAnchor="middle">
                the &ldquo;long road&rdquo; now points DOWN?!
              </text>
            </>
          )}

          {/* Incoming air */}
          <line x1={10} y1={150} x2={170} y2={150} stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} strokeDasharray="6 5" />

          {/* The wing: symmetric lens, red stripe on one side so the flip is visible.
              Kept at the same slight tilt in both states — the tilt is the point. */}
          <g
            className="motion-safe:transition-transform motion-safe:duration-700"
            style={{ transform: flipped ? 'rotate(180deg)' : 'rotate(0deg)', transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <g transform="rotate(-6 300 150)">
              <path
                d="M 180 150 C 240 116, 360 116, 420 150 C 360 184, 240 184, 180 150 Z"
                fill="#9aa3ad"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={2}
              />
              <path
                d="M 225 133 C 270 119, 335 119, 382 135"
                fill="none"
                stroke="#f87171"
                strokeWidth={7}
                strokeLinecap="round"
              />
            </g>
          </g>
          <text x={300} y={192} fontSize={12} fill="rgba(255,255,255,0.6)" textAnchor="middle">
            same slight tilt — the real engine
          </text>

          {/* Downwash: air leaves heading downward in BOTH states */}
          <line x1={424} y1={158} x2={500} y2={225} stroke="#5b9bf5" strokeWidth={3} strokeDasharray="6 5" />
          <polygon points="490,214 508,232 488,230" fill="#5b9bf5" />
          <circle r={7} fill="#5b9bf5">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M 10 150 L 180 150 L 420 158 L 500 225" />
          </circle>

          {/* Lift arrow: unchanged in BOTH states */}
          <line x1={300} y1={112} x2={300} y2={96} stroke="#0aee3c" strokeWidth={3} />
          <polygon points="293,96 300,84 307,96" fill="#0aee3c" />
          <text x={312} y={100} fontSize={13} fill="#0aee3c" fontWeight="bold">
            LIFT — still here!
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded"
        >
          {flipped ? 'Flip right-side up' : 'Flip upside down'}
        </button>
        <p className="text-white/70 text-sm">
          {flipped ? (
            <>Upside down — and it <strong className="text-white">still flies.</strong> The curve can&rsquo;t be the engine.</>
          ) : (
            <>Right-side up: flies. (The old story takes the credit — press the button to check.)</>
          )}
        </p>
      </div>
      <p className="text-white/50 text-xs mt-3">
        Same trick as kites (flat boards), paper planes (folded sheets), and the barn door: tilt plus
        speed shoves air down, air shoves back up. Shape was never the engine.
      </p>
    </div>
  );
}
