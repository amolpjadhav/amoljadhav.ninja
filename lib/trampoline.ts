// Trampoline spring simulation for the Law 3 lab (TrampolineLab). A damped
// spring for the mat plus gravity on the buddy, integrated in small
// substeps. The contact force N is computed ONCE per step: it is both the
// mat-on-her arrow (up) and the her-on-mat arrow (down), so the pair is
// equal by construction — the demo can never teach otherwise. Pure and
// DOM-free so the physics stays testable.

export interface TrampolineState {
  hb: number; // hip height, px, up = +
  v: number; // vertical velocity
  L: number; // leg length (pumping straightens, falling bends)
  apex: number; // current flight's peak feet height
  best: number; // best bounce so far
  lastApex: number; // previous completed bounce height
  N: number; // contact force (the pair, in force units)
  depth: number; // mat dip depth
}

const G = 900; // gravity
const K = 75; // mat springiness
const C = 0.5; // mat damping (bounces fade unless you pump)
const L_CROUCH = 34; // leg length, bent
const L_EXT = 42; // leg length, pushing
const LEG_SPEED = 160;
const MAX_BODY = 195;
const PUMP_LIMIT = 130; // stop adding energy once bounces get this high
const REST_DEPTH = G / K;

export const TRAMPOLINE_GRAVITY = G;

export function restState(): TrampolineState {
  return {
    hb: L_CROUCH - REST_DEPTH,
    v: 0,
    L: L_CROUCH,
    apex: 0,
    best: 0,
    lastApex: 0,
    N: G,
    depth: REST_DEPTH,
  };
}

export function stepTrampoline(s: TrampolineState, dt: number, pushing: boolean): TrampolineState {
  let { hb, v, L, apex, best, lastApex } = s;
  const inContact = hb - L < 0;
  let Ldot = 0;
  // Pumping: straighten legs while the mat is launching her, bend them on the way down.
  if (inContact && pushing && v > -20 && lastApex < PUMP_LIMIT) {
    const nl = Math.min(L_EXT, L + LEG_SPEED * dt);
    Ldot = (nl - L) / dt;
    L = nl;
  } else if (L > L_CROUCH && (!inContact || v <= -20)) {
    const nl = Math.max(L_CROUCH, L - LEG_SPEED * dt);
    Ldot = (nl - L) / dt;
    L = nl;
  }
  const depth = Math.max(0, L - hb);
  // One contact force. It's BOTH arrows: mat-on-her (up) and her-on-mat (down).
  const N = depth > 0 ? Math.max(0, K * depth - C * (v - Ldot)) : 0;
  v += (N - G) * dt;
  hb += v * dt;
  const feet = hb - L;
  if (feet > 0) apex = Math.max(apex, feet);
  else if (apex > 0) {
    lastApex = apex;
    best = Math.max(best, apex);
    apex = 0;
  }
  if (hb > MAX_BODY) {
    hb = MAX_BODY;
    v = Math.min(v, 0);
  }
  return { hb, v, L, apex, best, lastApex, N, depth };
}

// Points for the force bars, with gravity pinned at 100.
export function forcePoints(force: number): number {
  return Math.round((force / G) * 100);
}

export function trampolineCaption(s: TrampolineState): string {
  const contact = s.depth > 0;
  if (!contact) {
    return s.v > 0
      ? "Flying up. Her feet aren't touching anything, so there's no push pair at all. Only gravity, slowing her down."
      : 'Falling. Still no touching, still no pair. Gravity is the only push on her.';
  }
  if (Math.abs(s.v) < 15 && Math.abs(s.N - G) < 0.06 * G)
    return 'Standing still. She pushes the mat, the mat pushes back just as hard, and that push exactly matches gravity.';
  if (Math.abs(s.v) < 60 && s.depth > REST_DEPTH * 2.5)
    return "The bottom. Biggest pushes of the whole bounce, and the two pair arrows are still exactly the same size.";
  if (s.v < 0)
    return s.N > G
      ? "Sinking. The mat's push is already beating gravity, so she's slowing down."
      : 'Landing. She pushes the mat, the mat pushes her back the same amount, right away.';
  return s.N > G
    ? "Launching. The stretched mat's push beats gravity, so up she goes."
    : 'Leaving the mat. The pair is shrinking toward zero as her feet let go.';
}
