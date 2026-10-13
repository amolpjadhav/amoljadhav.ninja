// Minesweeper board logic. Cells are row-major indices; mines and
// opened/flagged sets live in the component, adjacency here.
export const MS_SIZE = 9;
export const MS_MINES = 10;

export function neighbors(idx: number, size: number = MS_SIZE): number[] {
  const r = Math.floor(idx / size);
  const c = idx % size;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc);
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
): Set<number> {
  const safe = new Set([safeIdx, ...neighbors(safeIdx, size)]);
  const pool: number[] = [];
  for (let i = 0; i < size * size; i += 1) {
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

export function adjacency(idx: number, mines: Set<number>, size: number = MS_SIZE): number {
  let n = 0;
  for (const nb of neighbors(idx, size)) {
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
): Set<number> {
  const next = new Set(opened);
  if (flagged.has(start) || next.has(start)) return next;
  next.add(start);
  if (mines.has(start) || adjacency(start, mines, size) > 0) return next;
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.pop() as number;
    for (const nb of neighbors(cur, size)) {
      if (next.has(nb) || flagged.has(nb) || mines.has(nb)) continue;
      next.add(nb);
      if (adjacency(nb, mines, size) === 0) queue.push(nb);
    }
  }
  return next;
}
