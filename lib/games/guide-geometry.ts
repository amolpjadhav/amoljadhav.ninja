// Pure board geometry for guide arrows: collinear demotion to target
// rings, and % label layout. Integer square space (file 0–7, rank 0–7),
// orientation-independent — the SVG layer maps to pixels.

export interface GuidePath {
  from: string;
  to: string;
}

function xy(sq: string): [number, number] {
  return [sq.charCodeAt(0) - 97, Number(sq[1]) - 1];
}

function isKnightPath(a: [number, number], b: [number, number]): boolean {
  return Math.abs(a[0] - b[0]) * Math.abs(a[1] - b[1]) === 2;
}

/**
 * Which paths to demote from arrows to target rings. Input order is
 * popularity order (most popular first): within each collinear group the
 * most popular keeps its arrow so the green main line never disappears.
 * Knights are never collinear. Two straight paths collide when they share
 * a line and direction and overlap by more than half of the shorter one
 * (e7→e5 hides e7→e6, so e6 becomes a ring).
 */
export function markRings(paths: GuidePath[]): boolean[] {
  const pts = paths.map((p) => ({ a: xy(p.from), b: xy(p.to) }));
  const groupOf = new Array<number>(paths.length).fill(-1);
  let groups = 0;
  for (let i = 0; i < pts.length; i += 1) {
    if (groupOf[i] !== -1) continue;
    groupOf[i] = groups;
    const pi = pts[i] as { a: [number, number]; b: [number, number] };
    if (isKnightPath(pi.a, pi.b)) {
      groups += 1;
      continue;
    }
    const dx = pi.b[0] - pi.a[0];
    const dy = pi.b[1] - pi.a[1];
    for (let j = i + 1; j < pts.length; j += 1) {
      if (groupOf[j] !== -1) continue;
      const pj = pts[j] as { a: [number, number]; b: [number, number] };
      if (isKnightPath(pj.a, pj.b)) continue;
      const ex = pj.b[0] - pj.a[0];
      const ey = pj.b[1] - pj.a[1];
      // Same line (direction and origin offset both parallel) and direction.
      if (dx * ey !== dy * ex || dx * ex + dy * ey <= 0) continue;
      const ox = pj.a[0] - pi.a[0];
      const oy = pj.a[1] - pi.a[1];
      if (dx * oy !== dy * ox) continue;
      // Overlap of the two segments along the shared direction.
      const len2 = dx * dx + dy * dy;
      const ti = (opp: [number, number]) => ((opp[0] - pi.a[0]) * dx + (opp[1] - pi.a[1]) * dy) / len2;
      const lo = Math.max(0, Math.min(ti(pj.a), ti(pj.b)));
      const hi = Math.min(1, Math.max(ti(pj.a), ti(pj.b)));
      const lenI = Math.hypot(dx, dy);
      const lenJ = Math.hypot(ex, ey);
      if ((hi - lo) * lenI > 0.5 * Math.min(lenI, lenJ)) groupOf[j] = groups;
    }
    groups += 1;
  }
  const seen = new Set<number>();
  return groupOf.map((g) => {
    if (seen.has(g)) return true;
    seen.add(g);
    return false;
  });
}

export interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function overlaps(a: LabelBox, b: LabelBox): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Separate overlapping % pills (later labels nudge down) and clamp every
 * pill inside the board. Pure — unit-tested.
 */
export function nudgeLabels(boxes: LabelBox[], board = 800): LabelBox[] {
  const out = boxes.map((b) => ({ ...b }));
  for (let i = 0; i < out.length; i += 1) {
    const cur = out[i] as LabelBox;
    for (let j = 0; j < i; j += 1) {
      const prev = out[j] as LabelBox;
      if (overlaps(cur, prev)) cur.y = prev.y + prev.h + 4;
    }
    cur.x = Math.min(Math.max(cur.x, 4), board - 4 - cur.w);
    cur.y = Math.min(Math.max(cur.y, 4), board - 4 - cur.h);
  }
  return out;
}
