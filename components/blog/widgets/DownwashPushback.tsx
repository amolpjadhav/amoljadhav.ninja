'use client';

import { useEffect, useRef } from 'react';

// The article's core idea in two pictures: shove stuff one way, get shoved
// the other. Left: hands push water back, you glide forward. Right: wing
// throws air down, air throws the wing up. Same law (Newton's third), two
// places. Small companion to the "swimming pool proof" paragraphs.

export default function DownwashPushback() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Freeze the looping puffs for readers who ask for reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      containerRef.current
        ?.querySelectorAll<SVGSVGElement>('svg')
        .forEach((svg) => svg.pauseAnimations());
    }
  }, []);

  return (
    <div ref={containerRef} className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-5 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Same shove, two places</p>
      <p className="text-white/70 text-sm mb-4">
        Shove something one way, and it shoves you right back. Watch for it in both pictures.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Panel 1: the pool */}
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/85 text-sm font-bold mb-2 text-center">In the pool</p>
          <svg viewBox="0 0 300 150" className="w-full h-auto" role="img" aria-label="Hands push water backwards and the swimmer glides forwards">
            {/* water push-back arrows */}
            <line x1={150} y1={55} x2={60} y2={55} stroke="#5b9bf5" strokeWidth={3} strokeDasharray="6 5" />
            <polygon points="60,48 44,55 60,62" fill="#5b9bf5" />
            <line x1={150} y1={100} x2={60} y2={100} stroke="#5b9bf5" strokeWidth={3} strokeDasharray="6 5" />
            <polygon points="60,93 44,100 60,107" fill="#5b9bf5" />
            {/* swimmer */}
            <rect x={150} y={48} width={90} height={58} rx={29} fill="#9aa3ad" />
            <text x={195} y={82} fontSize={15} fill="#1c1d20" fontWeight="bold" textAnchor="middle">
              you
            </text>
            {/* glide-forward arrow */}
            <line x1={240} y1={78} x2={285} y2={78} stroke="#0aee3c" strokeWidth={3} />
            <polygon points="285,71 299,78 285,85" fill="#0aee3c" />
            {/* travelling water puffs */}
            <circle r={6} fill="#5b9bf5">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 150 55 L 50 55" />
            </circle>
            <circle r={6} fill="#5b9bf5">
              <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M 150 100 L 50 100" />
            </circle>
          </svg>
          <p className="text-white/70 text-xs mt-2 text-center">
            <span className="text-blue-400 font-bold">push water back</span> →{' '}
            <span className="text-green-400 font-bold">you glide forward</span>
          </p>
        </div>

        {/* Panel 2: the wing */}
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/85 text-sm font-bold mb-2 text-center">In the sky</p>
          <svg viewBox="0 0 300 150" className="w-full h-auto" role="img" aria-label="Wing throws air downward and the air throws the wing upward">
            {/* incoming air */}
            <line x1={10} y1={60} x2={110} y2={60} stroke="rgba(255,255,255,0.45)" strokeWidth={2.5} strokeDasharray="6 5" />
            {/* wing, tilted slightly */}
            <g transform="rotate(-10 170 75)">
              <path
                d="M 120 60 C 145 40, 195 40, 225 62 L 225 74 L 120 78 Z"
                fill="#9aa3ad"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
              />
            </g>
            {/* downwash */}
            <line x1={228} y1={72} x2={278} y2={125} stroke="#5b9bf5" strokeWidth={3} strokeDasharray="6 5" />
            <polygon points="270,114 285,132 266,129" fill="#5b9bf5" />
            <text x={252} y={142} fontSize={11} fill="#5b9bf5" fontWeight="bold" textAnchor="middle">
              downwash
            </text>
            {/* lift arrow */}
            <line x1={172} y1={52} x2={172} y2={14} stroke="#0aee3c" strokeWidth={3} />
            <polygon points="165,14 172,2 179,14" fill="#0aee3c" />
            <text x={186} y={30} fontSize={11} fill="#0aee3c" fontWeight="bold">
              lift
            </text>
            {/* travelling air puffs: in level, out downward */}
            <circle r={6} fill="#f87171">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M 10 60 L 120 60 L 225 72 L 278 125" />
            </circle>
          </svg>
          <p className="text-white/70 text-xs mt-2 text-center">
            <span className="text-blue-400 font-bold">wing throws air down</span> →{' '}
            <span className="text-green-400 font-bold">air lifts wing up</span>
          </p>
        </div>
      </div>

      <p className="text-white/50 text-xs mt-3 text-center">
        One law, two places: every shove gets an equal shove back.
      </p>
    </div>
  );
}
