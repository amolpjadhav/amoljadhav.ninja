// Sudoku generation and solving. Grids are 81 numbers, row-major,
// 0 means empty. Randomness enters only through the caller's `rand`
// so tests can seed it; Math.random is the default everywhere else.
export type Grid = number[];

export type Difficulty = 'easy' | 'medium' | 'hard';

/** Givens left on the board per difficulty (unique solution enforced). */
export const DIFFICULTY_GIVENS: Record<Difficulty, number> = {
  easy: 42,
  medium: 32,
  hard: 28,
};

export function rowOf(i: number): number {
  return Math.floor(i / 9);
}

export function colOf(i: number): number {
  return i % 9;
}

export function boxOf(i: number): number {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
}

/** All indices sharing the row, column, or box with i (not i itself). */
export function peers(i: number): number[] {
  const out = new Set<number>();
  const r = rowOf(i);
  const c = colOf(i);
  for (let k = 0; k < 9; k += 1) {
    out.add(r * 9 + k);
    out.add(k * 9 + c);
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr += 1) {
    for (let dc = 0; dc < 3; dc += 1) {
      out.add((br + dr) * 9 + (bc + dc));
    }
  }
  out.delete(i);
  return [...out];
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Digits 1-9 not already used by i's peers. */
export function candidates(grid: Grid, i: number): number[] {
  if (grid[i] !== 0) return [];
  const used = new Set<number>();
  for (const p of peers(i)) {
    if (grid[p] !== 0) used.add(grid[p]);
  }
  const out: number[] = [];
  for (let v = 1; v <= 9; v += 1) {
    if (!used.has(v)) out.push(v);
  }
  return out;
}

/** True when placing v at i breaks no row/column/box. */
export function isValidPlacement(grid: Grid, i: number, v: number): boolean {
  if (v < 1 || v > 9) return false;
  for (const p of peers(i)) {
    if (grid[p] === v) return false;
  }
  return true;
}

// Backtracking with minimum-remaining-values: always branch on the
// emptiest constrained cell. Fast enough to count solutions (capped)
// during puzzle digging.
function emptiest(grid: Grid): number {
  let best = -1;
  let bestCount = 10;
  for (let i = 0; i < 81; i += 1) {
    if (grid[i] !== 0) continue;
    const n = candidates(grid, i).length;
    if (n === 0) return i;
    if (n < bestCount) {
      bestCount = n;
      best = i;
      if (n === 1) break;
    }
  }
  return best;
}

/** Up to `limit` solutions, in grid order (deterministic). */
export function countSolutions(grid: Grid, limit = 2): number {
  let count = 0;
  const work = [...grid];
  const rec = (): boolean => {
    if (count >= limit) return true;
    const i = emptiest(work);
    if (i === -1) {
      count += 1;
      return count >= limit;
    }
    for (const v of candidates(work, i)) {
      work[i] = v;
      if (rec()) return true;
      work[i] = 0;
    }
    return false;
  };
  rec();
  return count;
}

/** One full solution, randomized for varied puzzles. Null when unsolvable. */
export function solveRandom(grid: Grid, rand: () => number = Math.random): Grid | null {
  const work = [...grid];
  const rec = (): boolean => {
    const i = emptiest(work);
    if (i === -1) return true;
    for (const v of shuffled(candidates(work, i), rand)) {
      work[i] = v;
      if (rec()) return true;
      work[i] = 0;
    }
    return false;
  };
  return rec() ? work : null;
}

/** A complete valid grid: every cell filled, no peer conflicts. */
export function isComplete(grid: Grid): boolean {
  for (let i = 0; i < 81; i += 1) {
    const v = grid[i];
    if (v === 0) return false;
    for (const p of peers(i)) {
      if (grid[p] === v) return false;
    }
  }
  return true;
}

/** A random complete grid (rejection-free: fill an empty board). */
export function fullSolution(rand: () => number = Math.random): Grid {
  const solved = solveRandom(new Array(81).fill(0), rand);
  // An empty board always solves; this guards the type, not reality.
  if (!solved) throw new Error('sudoku: empty board unsolvable');
  return solved;
}

// Digging: remove cells in random order, restoring any removal that
// admits a second solution. Stops at the givens target, so every
// puzzle has exactly one solution by construction.
export function digPuzzle(solution: Grid, givens: number, rand: () => number = Math.random): Grid {
  const puzzle = [...solution];
  let filled = 81;
  for (const i of shuffled([...Array(81).keys()], rand)) {
    if (filled <= givens) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[i] = keep;
    } else {
      filled -= 1;
    }
  }
  return puzzle;
}

export interface Puzzle {
  puzzle: Grid;
  solution: Grid;
  givens: number;
}

export function generatePuzzle(
  difficulty: Difficulty,
  rand: () => number = Math.random,
): Puzzle {
  const givens = DIFFICULTY_GIVENS[difficulty];
  const solution = fullSolution(rand);
  const puzzle = digPuzzle(solution, givens, rand);
  return { puzzle, solution, givens };
}

/** mulberry32: tiny seeded PRNG for tests. */
export function seededRand(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
