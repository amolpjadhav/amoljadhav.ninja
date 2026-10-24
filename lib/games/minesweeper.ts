// Minesweeper board logic. Cells are row-major indices; mines and
// opened/flagged sets live in the component, adjacency here.
export const MS_SIZE = 9;
export const MS_MINES = 10;

export interface MSDifficulty {
  cols: number;
  rows: number;
  mines: number;
}

// Spec §5.2 difficulties. Expert is desktop-first; on mobile the board
// pans inside its container.
export const MS_DIFFICULTIES: Record<string, MSDifficulty> = {
  Beginner: { cols: 9, rows: 9, mines: 10 },
  Intermediate: { cols: 16, rows: 16, mines: 40 },
  Expert: { cols: 30, rows: 16, mines: 99 },
};

export function difficultyForMode(mode: string): MSDifficulty {
  return MS_DIFFICULTIES[mode] ?? { cols: MS_SIZE, rows: MS_SIZE, mines: MS_MINES };
}

export function neighbors(idx: number, size: number = MS_SIZE, rows: number = size): number[] {
  const r = Math.floor(idx / size);
  const c = idx % size;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < size) out.push(nr * size + nc);
    }
  }
  return out;
}

// Mines avoid the first-clicked cell and its neighbors, so the opener
// always has room to breathe.
export function placeMines(
  size: number,
  mineCount: number,
  safeIdx: number,
  rand: () => number = Math.random,
  rows: number = size,
): Set<number> {
  const safe = new Set([safeIdx, ...neighbors(safeIdx, size, rows)]);
  const pool: number[] = [];
  for (let i = 0; i < size * rows; i += 1) {
    if (!safe.has(i)) pool.push(i);
  }
  const mines = new Set<number>();
  const target = Math.min(mineCount, pool.length);
  while (mines.size < target) {
    const pick = pool[Math.floor(rand() * pool.length)] as number;
    mines.add(pick);
  }
  return mines;
}

export function adjacency(
  idx: number,
  mines: Set<number>,
  size: number = MS_SIZE,
  rows: number = size,
): number {
  let n = 0;
  for (const nb of neighbors(idx, size, rows)) {
    if (mines.has(nb)) n += 1;
  }
  return n;
}

// Flood reveal: the clicked cell plus everything reachable through
// zero-adjacency cells. Flagged cells are never auto-opened.
export function reveal(
  opened: Set<number>,
  mines: Set<number>,
  flagged: Set<number>,
  start: number,
  size: number = MS_SIZE,
  rows: number = size,
): Set<number> {
  const next = new Set(opened);
  if (flagged.has(start) || next.has(start)) return next;
  next.add(start);
  if (mines.has(start) || adjacency(start, mines, size, rows) > 0) return next;
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.pop() as number;
    for (const nb of neighbors(cur, size, rows)) {
      if (next.has(nb) || flagged.has(nb) || mines.has(nb)) continue;
      next.add(nb);
      if (adjacency(nb, mines, size, rows) === 0) queue.push(nb);
    }
  }
  return next;
}

// Chord: tapping an open number whose flag count satisfies its adjacency
// reveals all unflagged, unopened neighbors. Returns the new opened set,
// or null when the number is not yet satisfied (tap was a no-op).
export function chord(
  opened: Set<number>,
  mines: Set<number>,
  flagged: Set<number>,
  idx: number,
  size: number = MS_SIZE,
  rows: number = size,
): Set<number> | null {
  if (!opened.has(idx) || mines.has(idx)) return null;
  const need = adjacency(idx, mines, size, rows);
  if (need === 0) return null;
  const nbs = neighbors(idx, size, rows);
  const flagCount = nbs.filter((n) => flagged.has(n)).length;
  if (flagCount !== need) return null;
  let next = new Set(opened);
  for (const nb of nbs) {
    if (flagged.has(nb) || next.has(nb)) continue;
    next = reveal(next, mines, flagged, nb, size, rows);
  }
  return next;
}
