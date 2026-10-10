// Seeded spin engine for "Five a month": genre bag, ladder slots, and picks.
// Pure functions (tested in lib/book-spins.test.mjs) shared by the official
// monthly spin and visitors' "spin your own".
export type Difficulty = 'quick' | 'medium' | 'classic' | 'stretch';

export interface PoolBook {
  id: string;
  genre: string;
  title: string;
  author: string;
  year: number;
  pages: number;
  difficulty: Difficulty;
  hook: string;
  workKey: string;
  coverId?: number;
  rating?: number;
  ratingsCount?: number;
  series?: string;
  volume?: number;
}

// Curation rule (IMDb-style): rank by weighted rating, no fixed cutoff.
// OL vote counts are sparse vs Goodreads, so the hard minimum is 10 votes
// (median pool book has ~66); m = 50 pulls thin books toward the pool mean.
export const POOL_MIN_VOTES = 10;
export const WEIGHT_M = 50;

export function weightedRating(avg: number, votes: number, poolMean: number, m = WEIGHT_M): number {
  return (votes / (votes + m)) * avg + (m / (votes + m)) * poolMean;
}

export function poolMeanRating(pool: PoolBook[]): number {
  const rated = pool.filter((b) => b.rating !== undefined && (b.ratingsCount ?? 0) > 0);
  return rated.reduce((sum, b) => sum + (b.rating as number), 0) / rated.length;
}

export interface SlottedGenre {
  genre: string;
  slot: Difficulty;
}

export interface SpinPick {
  book: PoolBook;
  genre: string;
  slot: Difficulty;
}

// One quick, two medium, one classic, one stretch — every five.
export const LADDER: Difficulty[] = ['quick', 'medium', 'medium', 'classic', 'stretch'];

export function badgeFor(slot: Difficulty): string {
  switch (slot) {
    case 'quick':
      return 'Weekend read';
    case 'medium':
      return "Week's read";
    case 'classic':
      return 'Classic';
    case 'stretch':
      return 'Slow burn';
  }
}

// FNV-1a hash -> uint32, so short shareable seeds become RNG states.
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(rng: () => number = Math.random): string {
  return Math.floor(rng() * 36 * 36 * 36 * 36)
    .toString(36)
    .padStart(4, '0');
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Draw n genres from the bag of not-yet-used ones. When fewer than n remain,
// the bag refills (all genres back in play) so a spin never comes up short.
export function drawGenres(
  allGenres: string[],
  used: string[],
  n: number,
  rng: () => number,
): { drawn: string[]; usedAfter: string[]; refilled: boolean } {
  const usedSet = new Set(used);
  let bag = allGenres.filter((g) => !usedSet.has(g));
  let refilled = false;
  if (bag.length < n) {
    bag = [...allGenres];
    refilled = true;
  }
  const drawn = shuffle(bag, rng).slice(0, n);
  const usedAfter = refilled ? [...drawn] : [...used, ...drawn];
  return { drawn, usedAfter, refilled };
}

// Deal ladder slots across genres in shuffled order.
export function assignLadder(genres: string[], rng: () => number): SlottedGenre[] {
  const slots = shuffle(LADDER.slice(0, genres.length), rng);
  return genres.map((genre, i) => ({ genre, slot: slots[i] }));
}

// Pick one pool book per slotted genre, preferring the slot's difficulty and
// never repeating a book already picked.
export function spinFive(
  pool: PoolBook[],
  slotted: SlottedGenre[],
  rng: () => number,
  excludeIds: Set<string> = new Set(),
): SpinPick[] {
  const taken = new Set(excludeIds);
  return slotted.map(({ genre, slot }) => {
    const exact = pool.filter((b) => b.genre === genre && b.difficulty === slot && !taken.has(b.id));
    const anyGenre = pool.filter((b) => b.genre === genre && !taken.has(b.id));
    const anyBook = pool.filter((b) => !taken.has(b.id));
    const candidates = exact.length > 0 ? exact : anyGenre.length > 0 ? anyGenre : anyBook;
    const book = candidates[Math.floor(rng() * candidates.length)];
    taken.add(book.id);
    return { book, genre, slot };
  });
}

// Deterministic spin from a shareable seed (?spin=k3x9). Same seed + same
// pool version always deals the same five.
export function spinFromSeed(
  pool: PoolBook[],
  allGenres: string[],
  seed: string,
): { picks: SpinPick[]; genres: string[] } {
  const rng = mulberry32(hashSeed(seed));
  const { drawn } = drawGenres(allGenres, [], 5, rng);
  const slotted = assignLadder(drawn, rng);
  return { picks: spinFive(pool, slotted, rng), genres: drawn };
}

// Reroll a single slot ("already read this"), keeping the other four. The old
// book is excluded so a swap always changes something; when its genre has no
// other unpicked book the picks come back unchanged.
export function swapPick(
  pool: PoolBook[],
  picks: SpinPick[],
  index: number,
  rng: () => number,
): SpinPick[] {
  const { genre, slot } = picks[index];
  const exclude = new Set(picks.map((p) => p.book.id));
  const exact = pool.filter((b) => b.genre === genre && b.difficulty === slot && !exclude.has(b.id));
  const anyGenre = pool.filter((b) => b.genre === genre && !exclude.has(b.id));
  const candidates = exact.length > 0 ? exact : anyGenre;
  if (candidates.length === 0) return picks;
  const book = candidates[Math.floor(rng() * candidates.length)];
  return picks.map((p, i) => (i === index ? { book, genre, slot } : p));
}
