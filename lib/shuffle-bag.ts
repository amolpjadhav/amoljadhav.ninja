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

// Peeks the next n draws without consuming them, threading each peek as
// the except for the next — so the peeked sequence is exactly what the
// next n draws will return (while the pool stays the same). Powers the
// upcoming queue; only a shuffle bag has a knowable future.
export function peekFromBag(
  bag: ShuffleBag,
  pool: string[],
  except: string | undefined,
  n: number,
): string[] {
  if (pool.length === 0 || n <= 0) return [];
  const sim: ShuffleBag = { key: bag.key, squares: [...bag.squares] };
  const out: string[] = [];
  let prev = except;
  for (let i = 0; i < n; i++) {
    const next = drawFromBag(sim, pool, prev);
    out.push(next);
    prev = next;
  }
  return out;
}
