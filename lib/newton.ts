// Pure physics helpers for the Newton playground widget (NewtonPlayground).
// Cartoon units throughout: the demos care about relationships (heavier
// means slower, every push returns a push), not SI precision. Pure and
// DOM-free so the relationships stay testable.

export function acceleration(force: number, mass: number): number {
  return force / mass;
}

// How far a cart rolls after one push: d = 1/2 a t^2 with a = F/m.
export function pushDistance(force: number, mass: number, seconds = 2): number {
  return 0.5 * (force / mass) * seconds * seconds;
}

// Newton's third law: the reaction is equal in size, opposite in direction.
export function reactionForce(action: number): number {
  return -action;
}

// Newton's first law, bus version: an unbelted passenger keeps moving when
// the bus stops. Belted passengers stop with the bus.
export function passengerSlides(belted: boolean): boolean {
  return !belted;
}

// Demo racers: same mash, different loads.
export const CARTS = [
  { id: 'empty', label: 'Scooter', mass: 1 },
  { id: 'loaded', label: 'Monster truck', mass: 4 },
] as const;
