// Bowling rolling simulation for the Law 1 lab (BowlingLab). Hold to push
// (the hand lets go at the foul line), friction from the lane surface pushes
// back the whole time, pins scatter on contact and push back on the ball,
// and the back cushion stops anything that reaches it. A speed graph and
// strobe dots make constant vs changing speed visible. Pure and DOM-free so
// the physics stays testable. (Pin scatter uses Math.random; everything the
// tests assert is deterministic.)

export interface BowPin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gone: boolean;
}

export interface BowState {
  x: number;
  v: number;
  t: number;
  started: boolean;
  pins: BowPin[];
  pinsHit: boolean;
  pinHitT: number;
  cushionT: number;
  stoppedBy: 'cushion' | 'friction' | null;
  samples: [number, number][];
  lastSampleT: number;
  dots: number[];
  lastDotT: number;
  pushingNow: boolean;
}

export const BOWL_START_X = 72;
export const BOWL_FOUL_X = 180;
export const BOWL_CUSHION_X = 624;
export const BOWL_BALL_R = 16;
export const BOWL_PIN_R = 8;
export const BOWL_PUSH = 600; // the hand's push
export const BOWL_HEAD_PIN_X = 500;
export const BOWL_LANE_CY = 110;
export const BOWL_GRAPH_TMAX = 6;

export interface BowSurface {
  label: string;
  mu: number;
  fill: string;
  line: string;
}

export const BOWL_SURFACES: Record<string, BowSurface> = {
  magic: { label: 'Magic-smooth', mu: 0, fill: '#4a3f6b', line: '#5d5285' },
  ice: { label: 'Ice', mu: 10, fill: '#9cc4e2', line: '#b9d8ee' },
  wood: { label: 'Wood', mu: 60, fill: '#6b4e33', line: '#5a4029' },
  carpet: { label: 'Carpet', mu: 120, fill: '#7a3d3d', line: '#673232' },
};

export function makeBowPins(): BowPin[] {
  const rows: [number, number[]][] = [
    [BOWL_HEAD_PIN_X, [0]],
    [518, [-10, 10]],
    [536, [-20, 0, 20]],
    [554, [-30, -10, 10, 30]],
  ];
  return rows.flatMap(([x, ys]) =>
    ys.map((dy) => ({ x, y: BOWL_LANE_CY + dy, vx: 0, vy: 0, gone: false })),
  );
}

export function freshBowState(): BowState {
  return {
    x: BOWL_START_X,
    v: 0,
    t: 0,
    started: false,
    pins: makeBowPins(),
    pinsHit: false,
    pinHitT: -1,
    cushionT: -1,
    stoppedBy: null,
    samples: [],
    lastSampleT: -1,
    dots: [],
    lastDotT: -1,
    pushingNow: false,
  };
}

export function stepBowling(s: BowState, dt: number, holding: boolean, mu: number): void {
  const inZone = s.x < BOWL_FOUL_X;
  const push = holding && inZone && s.stoppedBy !== 'cushion' ? BOWL_PUSH : 0;
  if (push) s.started = true;
  s.pushingNow = push > 0;

  const wasMoving = s.v > 0;
  const a = push - (s.v > 0 || push > mu ? mu : 0);
  s.v = Math.max(0, s.v + a * dt);
  s.x += s.v * dt;
  if (s.started) s.t += dt;

  // pins
  if (!s.pinsHit && s.x + BOWL_BALL_R >= BOWL_HEAD_PIN_X - BOWL_PIN_R) {
    s.pinsHit = true;
    s.pinHitT = s.t;
    const v = s.v;
    s.pins.forEach((p) => {
      const spread = (p.y - BOWL_LANE_CY) / 30;
      p.vx = v * (0.55 + Math.random() * 0.5);
      p.vy = v * (spread * (0.3 + Math.random() * 0.4) + (Math.random() - 0.5) * 0.35);
    });
    s.v *= 0.5; // the pins push back on the ball
  }
  s.pins.forEach((p) => {
    if (p.gone) return;
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > 0) {
      const k = Math.max(0, sp - 250 * dt) / sp;
      p.vx *= k;
      p.vy *= k;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y < 60 - 4 || p.y > 160 + 4 || p.x > BOWL_CUSHION_X) p.gone = true;
  });

  // back cushion
  if (s.x + BOWL_BALL_R >= BOWL_CUSHION_X) {
    s.x = BOWL_CUSHION_X - BOWL_BALL_R;
    if (s.v > 0) {
      s.cushionT = s.t;
      s.stoppedBy = 'cushion';
    }
    s.v = 0;
  }
  if (wasMoving && s.v === 0 && !s.stoppedBy) s.stoppedBy = 'friction';

  // motion record: strobe dots + speed graph
  if (s.v > 0 && s.t - s.lastDotT >= 0.15) {
    s.dots.push(s.x);
    s.lastDotT = s.t;
  }
  if (s.started && s.t <= BOWL_GRAPH_TMAX && s.t - s.lastSampleT >= 1 / 30) {
    s.samples.push([s.t, s.v]);
    s.lastSampleT = s.t;
  }
}

export function bowlingCaption(s: BowState, mu: number, surfaceLabel: string): string {
  const recentPins = s.pinHitT >= 0 && s.t - s.pinHitT < 0.6;
  if (s.stoppedBy === 'cushion')
    return 'Stopped by the cushion at the back. It needed an outside push to stop, and the cushion gave it one.';
  if (s.stoppedBy === 'friction')
    return `Stopped on the lane. Friction on the ${surfaceLabel.toLowerCase()} was pushing backward the whole time, and it won. On magic-smooth, this never happens.`;
  if (recentPins)
    return 'Smash! The pins push back on the ball, so it slows down. (It pushes them too, which is why they fly.)';
  if (s.pushingNow)
    return 'Your hand is pushing, so the ball speeds up. Let go any time, or the hand lets go at the line.';
  if (s.v === 0)
    return "Sitting still. Nothing's pushing it, so it stays still. That's half of the first law already. Hold Push to change it.";
  if (mu === 0)
    return 'Nothing is pushing it now, so its speed stays exactly the same. See the flat line on the graph and the evenly spaced dots.';
  return mu < 30
    ? 'Ice has a tiny bit of friction pushing back, so the ball slows down, just very slowly.'
    : 'Friction is pushing backward the whole time, so the ball slows down. Watch the dots bunch up and the graph slide down.';
}
