// Lock rules for the haunted-arcade treasure hunt (TreasureHunt.tsx).
// Chapters open in order; each gate, once passed, stays passed in
// localStorage. Pure and DOM-free so the ordering rules stay testable.

export const CHAPTERS = [
  'meadow',
  'gate',
  'lanterns',
  'lights',
  'doors',
  'falls',
  'chest',
  'treasure',
] as const;

export type ChapterId = (typeof CHAPTERS)[number];

export type Progress = Partial<Record<ChapterId, true>>;

// A chapter is playable when every chapter before it is done. The lobby is
// always open; the treasure opens when the doors are solved.
export function isOpen(progress: Progress, chapter: ChapterId): boolean {
  const i = CHAPTERS.indexOf(chapter);
  if (i <= 0) return true;
  return CHAPTERS.slice(0, i).every((c) => progress[c] === true);
}

export function markDone(progress: Progress, chapter: ChapterId): Progress {
  return { ...progress, [chapter]: true };
}

export function isFinished(progress: Progress): boolean {
  return CHAPTERS.every((c) => progress[c] === true);
}

// Normalize whatever storage holds: unknown keys and non-true values are
// dropped so a corrupt or future save can never wedge the hunt.
export function normalizeProgress(raw: unknown): Progress {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Progress = {};
  for (const c of CHAPTERS) {
    if ((raw as Record<string, unknown>)[c] === true) out[c] = true;
  }
  return out;
}

// Room puzzles: every stop is solved by reasoning — visual, mathematical,
// or logical — never by guessing a word or a name. Ordered easy to hard
// along the trail. Wrong picks teach, never punish.
export const ODD_PUZZLE = {
  // Exactly one item differs; options keep trail order so position matters.
  options: ['🍎', '🍎', '🍐', '🍎'],
  answer: '🍐',
  hint: 'Not quite — three match. Tap the one that does not belong. Try again, no penalty.',
} as const;

export const LOCK_PUZZLE = {
  answer: '20',
  options: ['16', '18', '20', '25'],
  hint: 'Not quite — count by fives: 5, 10, 15… what comes next? Try again, no penalty.',
} as const;

export const COINS_PUZZLE = {
  answer: '4',
  options: ['3', '4', '5', '6'],
  hint: 'Not quite — 12 minus 5 minus 3… count what is left. Try again, no penalty.',
} as const;

export const DOORS_PUZZLE = {
  answer: 'Green',
  options: ['Red', 'Blue', 'Green'],
  hint: 'Not quite — re-read the warning: red is trapped, and blue hides no prize. Try again, no penalty.',
} as const;

export const POUCHES_PUZZLE = {
  answer: '7',
  options: ['5', '6', '7', '8'],
  hint: 'Not quite — 3 pouches times 4 coins, minus 5 for the ferryman. Try again, no penalty.',
} as const;

export const FRUIT_PUZZLE = {
  answer: '3',
  options: ['2', '3', '4', '5'],
  hint: 'Not quite — 3 apples make 12, so one apple is 4. Then the banana is easy. Try again, no penalty.',
} as const;

export const ROOM_PUZZLES = [LOCK_PUZZLE, COINS_PUZZLE, DOORS_PUZZLE, POUCHES_PUZZLE, FRUIT_PUZZLE] as const;

// Memory gate ("ghost lights"): a sequence of pad indexes. Grows one light
// per round; finishing ROUND_GOAL rounds earns the key.
export const LIGHT_ROUNDS_GOAL = 5;

export function nextLights(sequence: number[], pads: number, random: () => number): number[] {
  return [...sequence, Math.floor(random() * pads)];
}

export function lightsComplete(sequence: number[], roundsWon: number): boolean {
  return roundsWon >= LIGHT_ROUNDS_GOAL && sequence.length > 0;
}
