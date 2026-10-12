// Shuffle-bag dealing for drills: each item appears exactly once per cycle
// before any repeat, so coverage is uniform and prompts can't cluster.
// Keyed by pool, so different drill subsets each get their own cycle.
export interface ShuffleBag {
  key: string;
  squares: string[];
}

export function createShuffleBag(): ShuffleBag {
  return { key: '', squares: [] };
}

function shuffled(pool: string[]): string[] {
  const rest = [...pool];
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return rest;
}

// Draws one item, refilling (and reshuffling) when the bag runs out or the
// pool changes. Avoids `except` whenever another item is available; a
// single-item pool returns its only item. Rejected draws are reinserted
// at a random spot instead of discarded, so every square still appears
// exactly once per cycle — avoidance only reorders, never starves.
export function drawAvoiding(
  bag: ShuffleBag,
  pool: string[],
  except: string | undefined,
  avoid: (s: string) => boolean,
  tries = 8,
): string {
  for (let i = 0; i < tries; i++) {
    const s = drawFromBag(bag, pool, except);
    if (!avoid(s)) return s;
    const at = Math.floor(Math.random() * (bag.squares.length + 1));
    bag.squares.splice(at, 0, s);
  }
  return drawFromBag(bag, pool, except);
}

// Draws one item, refilling (and reshuffling) when the bag runs out or the
// pool changes. Avoids `except` whenever another item is available; a
// single-item pool returns its only item.
export function drawFromBag(bag: ShuffleBag, pool: string[], except?: string): string {
  if (pool.length === 0) throw new Error('drawFromBag: empty pool');
  const key = pool.join(',');
  if (bag.key !== key || bag.squares.length === 0) {
    bag.key = key;
    bag.squares = shuffled(pool);
  }
  const first = bag.squares.pop();
  if (first === undefined) throw new Error('drawFromBag: empty bag');
  if (first !== except || bag.squares.length === 0) return first;
  const second = bag.squares.pop();
  if (second === undefined) return first;
  bag.squares.push(first);
  return second;
}

