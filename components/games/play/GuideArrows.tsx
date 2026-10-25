'use client';

import { markRings, nudgeLabels } from '@/lib/games/guide-geometry';

// Guide-arrow overlay for the chess coach. The board library's arrows
// carry color only (no width, caps, heads, or labels), so guided arrows
// render here as SVG over the board: offset starts (no tail under the
// piece), butt caps, uniform triangle heads, knight L-paths, and % labels
// inside each target square. Percentage geometry keeps arrows correct
// across resizes and board flips.
//
// Collinear options (e7→e5 hiding e7→e6) demote to target rings so every
// listed option has a board mark. The overlay NEVER intercepts pointer
// events (pointerEvents: none): board taps and drags work natively
// everywhere, including on arrow pixels. Arrow hover is passive mousemove
// hit-testing from the wrapping board div via hoverUciAt, which mirrors
// the drawn geometry (rings included).
export interface GuideArrowSpec {
  uci: string;
  from: string;
  to: string;
  color: string;
  main: boolean;
  pct: number;
  name: string;
  /** Demoted from arrow to destination ring (collinear overlap). */
  ring?: boolean;
}

/** Mark ring-demotions on popularity-ordered specs (most popular keeps the arrow). */
export function resolveGuideRings(specs: GuideArrowSpec[]): GuideArrowSpec[] {
  const rings = markRings(specs.map((s) => ({ from: s.from, to: s.to })));
  return specs.map((s, i) => ({ ...s, ring: rings[i] }));
}

const CELL = 100;
const TAIL_OFFSET = 30;
const HEAD_RATIO = 2.2;
const LABEL_FONT = 12;

export function shaftWidth(main: boolean, pct: number): number {
  return main ? 16 : 9 + 4 * (pct / 100);
}

/** Pill width for a % label: 8px side padding + ~7px per character. */
export function labelWidth(text: string): number {
  return 16 + 7 * text.length;
}

function center(sq: string, orientation: 'white' | 'black'): [number, number] {
  const f = sq.charCodeAt(0) - 97;
  const r = Number(sq[1]);
  const col = orientation === 'white' ? f : 7 - f;
  const row = orientation === 'white' ? 8 - r : r - 1;
  return [(col + 0.5) * CELL, (row + 0.5) * CELL];
}

function isKnight(from: string, to: string): boolean {
  const df = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
  const dr = Math.abs(Number(from[1]) - Number(to[1]));
  return df * dr === 2;
}

function sub(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] - b[0], a[1] - b[1]];
}

function add(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(v: [number, number], s: number): [number, number] {
  return [v[0] * s, v[1] * s];
}

function norm(v: [number, number]): [number, number] {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}

function perp(v: [number, number]): [number, number] {
  return [-v[1], v[0]];
}

function distToSeg(p: [number, number], a: [number, number], b: [number, number]): number {
  const ab = sub(b, a);
  const len2 = ab[0] * ab[0] + ab[1] * ab[1] || 1;
  const t = Math.min(1, Math.max(0, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / len2));
  const proj = add(a, scale(ab, t));
  return Math.hypot(p[0] - proj[0], p[1] - proj[1]);
}

/** Arrow uci under a point (0–800 space), if any. Mirrors the drawing. */
export function hoverUciAt(
  arrows: GuideArrowSpec[],
  orientation: 'white' | 'black',
  x: number,
  y: number,
): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const a of arrows) {
    const A = center(a.from, orientation);
    const B = center(a.to, orientation);
    if (a.ring) {
      const d = Math.hypot(x - B[0], y - B[1]);
      if (d < 42 && d < bestD) {
        bestD = d;
        best = a.uci;
      }
      continue;
    }
    const w = shaftWidth(a.main, a.pct);
    const legs: [[number, number], [number, number]][] = isKnight(a.from, a.to)
      ? [[A, [B[0], A[1]]], [[B[0], A[1]], B]]
      : [[A, B]];
    for (const [p, q] of legs) {
      const d = distToSeg([x, y], p, q);
      if (d < w / 2 + 10 && d < bestD) {
        bestD = d;
        best = a.uci;
      }
    }
  }
  return best;
}

export default function GuideArrows({
  orientation,
  arrows,
  highlightUci,
  soloUci,
  hoverUci,
}: {
  orientation: 'white' | 'black';
  arrows: GuideArrowSpec[];
  highlightUci: string | null;
  soloUci: string | null;
  hoverUci: string | null;
}) {
  const visible = soloUci ? arrows.filter((a) => a.uci === soloUci) : arrows;
  const ordered = [...visible].sort((a, b) => Number(a.main) - Number(b.main));
  // % pills live inside their target square; nudge stacked pills apart.
  const labels = nudgeLabels(
    ordered.map((a) => {
      const B = center(a.to, orientation);
      const text = `${a.pct}%`;
      const w = labelWidth(text);
      const h = 20;
      if (a.ring) return { x: B[0] - w / 2, y: B[1] - h / 2, w, h };
      const A = center(a.from, orientation);
      const toward = norm(sub(B, A));
      const anchor = add(B, scale(toward, -14));
      return { x: anchor[0] - w / 2, y: anchor[1] - h / 2, w, h };
    }),
  );
  return (
    <svg
      viewBox="0 0 800 800"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {ordered.map((a, i) => {
        const A = center(a.from, orientation);
        const B = center(a.to, orientation);
        const w = shaftWidth(a.main, a.pct);
        const headLen = HEAD_RATIO * w;
        const headHalf = HEAD_RATIO * w * 0.5;
        let d: [number, number];
        let path: string;
        if (isKnight(a.from, a.to)) {
          const C: [number, number] = [B[0], A[1]];
          const d0 = norm(sub(C, A));
          const P0 = add(A, scale(d0, TAIL_OFFSET));
          d = norm(sub(B, C));
          path = `M ${P0[0]} ${P0[1]} L ${C[0]} ${C[1]} L ${B[0]} ${B[1]}`;
        } else {
          d = norm(sub(B, A));
          const P0 = add(A, scale(d, TAIL_OFFSET));
          path = `M ${P0[0]} ${P0[1]} L ${B[0]} ${B[1]}`;
        }
        const tip = B;
        const base = add(B, scale(d, -headLen));
        const pv = perp(d);
        const p1 = add(base, scale(pv, headHalf));
        const p2 = add(base, scale(pv, -headHalf));
        const baseOpacity = a.main ? 0.8 : 0.65;
        const opacity = soloUci
          ? 1
          : highlightUci
            ? a.uci === highlightUci
              ? 1
              : 0.3
            : baseOpacity;
        const hovered = hoverUci === a.uci;
        const label = labels[i] as { x: number; y: number; w: number; h: number };
        const nameAt = add(add(tip, scale(d, -(headLen + 44))), scale(pv, -(headHalf + 40)));
        return (
          <g key={a.uci} opacity={opacity}>
            {a.ring ? (
              <circle
                cx={B[0]}
                cy={B[1]}
                r={35}
                fill="none"
                stroke={a.color}
                strokeWidth={4}
                opacity={0.9}
              />
            ) : (
              <>
                <path
                  d={path}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={w}
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                />
                <polygon points={`${tip[0]},${tip[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={a.color} />
              </>
            )}
            <g>
              <rect
                x={label.x}
                y={label.y}
                width={label.w}
                height={label.h}
                rx={10}
                fill="rgba(0,0,0,.65)"
              />
              <text
                x={label.x + label.w / 2}
                y={label.y + label.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={LABEL_FONT}
                fontWeight={700}
                fill="#fff"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {a.pct}%
              </text>
            </g>
            {hovered && (
              <g>
                <rect
                  x={nameAt[0] - 150}
                  y={nameAt[1] - 24}
                  width={300}
                  height={48}
                  rx={24}
                  fill="rgba(10,10,12,.9)"
                  stroke="rgba(255,255,255,.25)"
                />
                <text
                  x={nameAt[0]}
                  y={nameAt[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={27}
                  fill="#fff"
                >
                  {a.name.length > 26 ? `${a.name.slice(0, 25)}…` : a.name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
