// 2048 board logic. Board is 16 cells row-major, 0 = empty.
export type Dir = 'up' | 'down' | 'left' | 'right';

export const SIZE = 4;

function slideLine(line: number[]): { line: number[]; gained: number } {
  const tiles = line.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i += 1) {
    const cur = tiles[i] as number;
    if (tiles[i + 1] === cur) {
      out.push(cur * 2);
      gained += cur * 2;
      i += 1; // merged tile rests — no chain merges in one move
    } else {
      out.push(cur);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { line: out, gained };
}

function linesFor(dir: Dir): number[][] {
  const idx = (r: number, c: number) => r * SIZE + c;
  const lines: number[][] = [];
  for (let i = 0; i < SIZE; i += 1) {
    if (dir === 'left') lines.push([0, 1, 2, 3].map((c) => idx(i, c)));
    else if (dir === 'right') lines.push([3, 2, 1, 0].map((c) => idx(i, c)));
    else if (dir === 'up') lines.push([0, 1, 2, 3].map((r) => idx(r, i)));
    else lines.push([3, 2, 1, 0].map((r) => idx(r, i)));
  }
  return lines;
}

export function moveBoard(board: number[], dir: Dir): { board: number[]; gained: number; moved: boolean } {
  const next = [...board];
  let gained = 0;
  for (const line of linesFor(dir)) {
    const { line: slid, gained: g } = slideLine(line.map((i) => board[i] as number));
    gained += g;
    line.forEach((cell, k) => {
      next[cell] = slid[k] as number;
    });
  }
  const moved = next.some((v, i) => v !== board[i]);
  return { board: next, gained, moved };
}

export function emptyCells(board: number[]): number[] {
  const out: number[] = [];
  board.forEach((v, i) => {
    if (v === 0) out.push(i);
  });
  return out;
}

// Classic spawn: 90% a 2, 10% a 4. Random source injected for tests.
export function spawnTile(board: number[], rand: () => number = Math.random): number[] {
  const empty = emptyCells(board);
  if (empty.length === 0) return board;
  const cell = empty[Math.floor(rand() * empty.length)] as number;
  const next = [...board];
  next[cell] = rand() < 0.9 ? 2 : 4;
  return next;
}

export function canMove(board: number[]): boolean {
  if (board.includes(0)) return true;
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const v = board[r * SIZE + c];
      if (c + 1 < SIZE && board[r * SIZE + c + 1] === v) return true;
      if (r + 1 < SIZE && board[(r + 1) * SIZE + c] === v) return true;
    }
  }
  return false;
}

export function maxTile(board: number[]): number {
  return Math.max(...board);
}
