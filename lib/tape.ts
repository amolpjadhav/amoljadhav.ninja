// Sliding sequence tape for the coordinate trainer: a fixed window (past
// results, current target, upcoming targets) that shifts left one slot
// per answer. Pure transitions — the component owns deal timing.
export interface TapeMark {
  sq: string;
  ok: boolean;
}

export interface TapeView {
  past: TapeMark[];
  current: string;
  next: string[];
}

export const TAPE_PAST = 3;
export const TAPE_NEXT = 3;

// Compose the initial view from a fresh deal queue ([current, ...next]).
export function buildView(queue: string[], nextCount: number): TapeView {
  const [current = '', ...rest] = queue;
  return { past: [], current, next: rest.slice(0, Math.max(0, nextCount)) };
}

// Shift the window one slot left: the result joins the past (capped),
// the first upcoming promotes to current, and the fresh draw lands last.
export function slideView(
  view: TapeView,
  result: TapeMark,
  incoming: string,
  nextCount: number,
): TapeView {
  return {
    past: [...view.past, result].slice(-TAPE_PAST),
    current: view.next[0] ?? view.current,
    next: [...view.next.slice(1), incoming].slice(0, Math.max(0, nextCount)),
  };
}

// Unique missed squares in first-miss order, for the results summary.
export function missedSquares(past: TapeMark[]): string[] {
  const out: string[] = [];
  for (const m of past) {
    if (!m.ok && !out.includes(m.sq)) out.push(m.sq);
  }
  return out;
}
