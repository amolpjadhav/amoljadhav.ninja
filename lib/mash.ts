// Mash race simulation for the Law 2 lab (MashLab). Every mash pushes both
// racers with exactly the same push; each racer's speed-up is that push
// divided by its mass. Crates change the masses (locked once racing), a speed
// graph draws both racers live, and the finish line calls the winner. Pure
// and DOM-free so the race math stays testable.

export interface MashRacer {
  x: number;
  v: number;
  finishT: number | null;
}

export interface MashState {
  t: number;
  started: boolean;
  mashes: number;
  lastMashT: number;
  r: {
    scooter: MashRacer;
    truck: MashRacer;
  };
  samples: [number, number | null, number | null][];
}

export interface MashMass {
  scooter: number;
  truck: number;
}

export const MASH_START_X = 150;
export const MASH_FINISH_X = 600;
export const MASH_PUSH = 12; // every mash gives (PUSH / mass) of extra speed
export const MASH_TIE_WINDOW = 0.15; // seconds
export const MASH_MAX_MASS = 8;

export const MASH_RACERS = {
  scooter: { name: 'Scooter', base: 1, color: '#f6d34a' },
  truck: { name: 'Monster truck', base: 4, color: '#f07d3a' },
} as const;

export function freshMash(): MashState {
  return {
    t: 0,
    started: false,
    mashes: 0,
    lastMashT: -9,
    r: {
      scooter: { x: MASH_START_X, v: 0, finishT: null },
      truck: { x: MASH_START_X, v: 0, finishT: null },
    },
    samples: [],
  };
}

export function stepMash(s: MashState, dt: number): void {
  if (!s.started) return;
  s.t += dt;
  for (const k of ['scooter', 'truck'] as const) {
    const r = s.r[k];
    if (r.finishT !== null) continue;
    r.x += r.v * dt;
    if (r.x >= MASH_FINISH_X) {
      r.x = MASH_FINISH_X;
      r.finishT = s.t;
    }
  }
  const last = s.samples[s.samples.length - 1];
  if (!last || s.t - last[0] >= 1 / 20) {
    s.samples.push([
      s.t,
      s.r.scooter.finishT === null ? s.r.scooter.v : null,
      s.r.truck.finishT === null ? s.r.truck.v : null,
    ]);
  }
}

export function mashPush(s: MashState, mass: MashMass): void {
  if (s.r.scooter.finishT !== null && s.r.truck.finishT !== null) return;
  s.started = true;
  s.mashes += 1;
  s.lastMashT = s.t;
  for (const k of ['scooter', 'truck'] as const) {
    if (s.r[k].finishT === null) s.r[k].v += MASH_PUSH / mass[k]; // same push, divided by mass
  }
}

export function fmtSpeed(n: number): string {
  return Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : n.toFixed(1);
}

export function mashCaption(s: MashState, mass: MashMass): string {
  const { scooter: a, truck: b } = s.r;
  const done = a.finishT !== null && b.finishT !== null;
  const ratio = mass.truck / mass.scooter;
  if (done) {
    if (Math.abs((a.finishT ?? 0) - (b.finishT ?? 0)) < MASH_TIE_WINDOW)
      return 'Dead heat! Same mass, same pushes, same speed-up. You just worked out F = ma.';
    if ((a.finishT ?? Infinity) < (b.finishT ?? Infinity))
      return mass.scooter === 1 && mass.truck === 4
        ? 'Scooter wins. Same pushes, but it has a quarter of the mass, so every push gave it 4× the speed-up.'
        : `Scooter wins. It's lighter, so each push bought it ${fmtSpeed(ratio)}× the speed-up.`;
    return 'The monster truck wins! You made the scooter heavier than the truck, so now the truck gets more speed-up from every push.';
  }
  if (a.finishT !== null || b.finishT !== null) {
    const slow = a.finishT === null ? 'scooter' : 'monster truck';
    return `Finished one! The ${slow} is still rolling at the speed your pushes gave it. Keep mashing to help it home.`;
  }
  if (!s.started)
    return mass.scooter === mass.truck
      ? 'Same mass now. Mash and see what happens to the race.'
      : 'Every mash pushes both racers exactly the same. Who gets going faster? Mash to find out.';
  if (s.t - s.lastMashT > 0.5)
    return "You stopped mashing, so no more pushes. Both keep the speed they had: flat lines on the graph. (That's Law 1 sneaking in.)";
  if (mass.scooter === mass.truck) return 'Same push, same mass, same speed-up. Neck and neck.';
  const light = mass.scooter < mass.truck ? 'scooter' : 'truck';
  const r = Math.max(ratio, 1 / ratio);
  return `Every mash is the same push on both. The ${light} is lighter, so it gets ${fmtSpeed(r)}× the speed-up from each one.`;
}
