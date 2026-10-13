// Shared localStorage records for the puzzle-games article. Each game
// writes its own key; the scorecard widget reads them all back.
export const FIVE_LETTERS_KEY = 'five-letters:stats:v1';
export const G2048_KEY = 'game-2048:best:v1';
export const CODE_BREAKER_KEY = 'code-breaker:best:v1';
export const MINESWEEPER_KEY = 'minesweeper:best:v1';

export interface FiveLettersStats {
  played: number;
  won: number;
  streak: number;
  best: number | null; // fewest guesses in a win
}

export const EMPTY_FL_STATS: FiveLettersStats = { played: 0, won: 0, streak: 0, best: null };

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode etc: records are best-effort.
  }
}
