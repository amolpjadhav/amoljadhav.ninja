'use client';

import { useState } from 'react';

// Earth as a giant bar magnet, with the twist the Bayern 7 syllabus makes a
// point of: the magnet's SOUTH end sits up near the geographic North Pole,
// which is exactly why a compass needle's north end is pulled that way.
//
// Colours follow the German textbook convention: north = red, south = green.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

const N_RED = '#e0533d';
const S_GREEN = '#3fa86a';
const TILT = -15; // degrees between the rotation axis and the magnetic axis

export default function EarthMagnet({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [showMagnet, setShowMagnet] = useState(true);

  const cx = 175;
  const cy = 160;
  const r = 98;

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="mb-4">
        <button
          onClick={() => setShowMagnet((v) => !v)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors"
          style={{
            background: showMagnet ? `${N_RED}22` : 'rgba(255,255,255,0.05)',
            color: showMagnet ? N_RED : 'rgba(255,255,255,0.55)',
            borderColor: showMagnet ? `${N_RED}55` : 'transparent',
          }}
        >
          {showMagnet ? 'Hide the magnet inside' : 'Show the magnet inside'}
        </button>
      </div>

      <div className="bg-black/30 rounded-lg p-3 overflow-x-auto">
        <svg viewBox="0 0 500 330" className="w-full h-auto" style={{ minWidth: 380 }}>
          {/* spin axis */}
          <line x1={cx} y1={cy - r - 34} x2={cx} y2={cy + r + 34} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" strokeWidth="1.2" />
          <text x={cx} y={cy - r - 42} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)">
            geographic North Pole
          </text>
          <text x={cx} y={cy + r + 52} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)">
            geographic South Pole
          </text>

          {/* the planet */}
          <circle cx={cx} cy={cy} r={r} fill="rgba(91,155,245,0.10)" stroke="rgba(91,155,245,0.45)" strokeWidth="1.5" />
          <ellipse cx={cx} cy={cy} rx={r} ry={30} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* the hidden bar magnet, tilted off the spin axis */}
          {showMagnet && (
            <g transform={`rotate(${TILT} ${cx} ${cy})`} opacity={0.95}>
              <rect x={cx - 15} y={cy - 82} width={30} height={82} rx={7} fill={S_GREEN} />
              <rect x={cx - 15} y={cy} width={30} height={82} rx={7} fill={N_RED} />
              <text x={cx} y={cy - 58} textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">S</text>
              <text x={cx} y={cy + 68} textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">N</text>
            </g>
          )}

          {/* compass sitting on the surface */}
          <g>
            <circle cx={415} cy={cy} r={46} fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
            <text x={415} y={cy - 33} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)">N</text>
            <g transform={`rotate(${TILT} 415 ${cy})`}>
              <polygon points={`415,${cy - 30} 409,${cy} 421,${cy}`} fill={N_RED} />
              <polygon points={`415,${cy + 30} 409,${cy} 421,${cy}`} fill={S_GREEN} />
            </g>
            <circle cx={415} cy={cy} r={3.5} fill="rgba(255,255,255,0.75)" />
            <text x={415} y={cy + 66} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">
              your compass
            </text>
          </g>

          {/* pull line from the needle's red end toward Earth's green (south) end */}
          {showMagnet && (
            <path
              d={`M 383 ${cy - 22} Q 300 ${cy - 96} ${cx + 6} ${cy - 96}`}
              fill="none"
              stroke={N_RED}
              strokeWidth="1.3"
              strokeDasharray="4 4"
              opacity={0.75}
            />
          )}
        </svg>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 text-xs text-white/60 leading-snug">
        {showMagnet ? (
          <>
            Look at which end is which. The <span style={{ color: S_GREEN, fontWeight: 700 }}>green S end</span> of
            Earth&rsquo;s magnet is up near the geographic <em>North</em> Pole. Your compass needle&rsquo;s{' '}
            <span style={{ color: N_RED, fontWeight: 700 }}>red N end</span> gets pulled toward it &mdash; because
            opposite poles attract. That is the whole reason a compass points north.
          </>
        ) : (
          <>Turn the magnet back on to see why the needle points the way it does.</>
        )}
      </div>
    </div>
  );
}
