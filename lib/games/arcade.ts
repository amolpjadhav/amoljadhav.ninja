// Arcade shared state (spec §6): one versioned localStorage bucket for all
// five games — stats, streaks, saved games, daily seeds — plus the share
// helper every ResultSheet uses.
//
// Storage: localStorage['games:v1'] holds
//   { [gameSlug]: { history: number[], best, streak, maxStreak, saved, daily } }.
// Legacy per-game keys (records.ts + per-play SAVE_KEYs) are migrated once
// and left in place (read-only fallback, never written again).
export const ARCADE_KEY = 'games:v1';

export const GAME_SLUGS = ['five-letters', 'minesweeper', 'sudoku', 'code-breaker', '2048'] as const;
export type ArcadeSlug = (typeof GAME_SLUGS)[number];

export interface ArcadeGameState {
  /** Recent results: seconds, guesses, or score depending on the game. */
  history: number[];
  /** Best result in history units, null until the first win. */
  best: number | null;
  /** Consecutive-day streak (daily modes) or consecutive-win streak. */
  streak: number;
  maxStreak: number;
  /** Opaque autosave payload written by the play component. */
  saved: unknown;
  /** Last PT date (YYYY-MM-DD) this game was won. */
  lastWon: string | null;
}

export type ArcadeStore = Partial<Record<ArcadeSlug, ArcadeGameState>>;

export const EMPTY_GAME_STATE: ArcadeGameState = {
  history: [],
  best: null,
  streak: 0,
  maxStreak: 0,
  saved: null,
  lastWon: null,
};

// Legacy keys migrated into games:v1 (see lib/games/records.ts + the
// per-play SAVE_KEY / HOWTO_KEY values from the foundation pass).
const LEGACY_BEST_KEYS: Partial<Record<ArcadeSlug, string>> = {
  'five-letters': 'five-letters:stats:v1',
  'code-breaker': 'code-breaker:best:v1',
  minesweeper: 'minesweeper:best:v1',
  '2048': 'game-2048:best:v1',
  sudoku: 'sudoku:best:v1',
};

const LEGACY_SAVE_KEYS: Partial<Record<ArcadeSlug, string>> = {
  'five-letters': 'games:v1:five-letters',
  minesweeper: 'games:v1:minesweeper',
  sudoku: 'games:v1:sudoku',
  'code-breaker': 'games:v1:code-breaker',
  '2048': 'games:v1:2048',
};

function readRaw(key: string): unknown {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

/** Best value out of a legacy record: {best}, {won}, plain number, or null. */
export function legacyBestOf(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw !== null && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (typeof r.best === 'number' && Number.isFinite(r.best)) return r.best;
    if (typeof r.won === 'number' && Number.isFinite(r.won)) return r.won;
  }
  return null;
}

export function loadStore(): ArcadeStore {
  const raw = readRaw(ARCADE_KEY);
  if (raw !== null && typeof raw === 'object') return raw as ArcadeStore;
  return migrateLegacy();
}

/** One-time migration: fold legacy bests/saves into games:v1 and persist. */
export function migrateLegacy(): ArcadeStore {
  const store: ArcadeStore = {};
  for (const slug of GAME_SLUGS) {
    const bestKey = LEGACY_BEST_KEYS[slug];
    const saveKey = LEGACY_SAVE_KEYS[slug];
    const best = bestKey ? legacyBestOf(readRaw(bestKey)) : null;
    const saved = saveKey ? readRaw(saveKey) : null;
    if (best !== null || saved !== null) {
      store[slug] = {
        ...EMPTY_GAME_STATE,
        history: [],
        best,
        saved,
      };
    }
  }
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(ARCADE_KEY, JSON.stringify(store));
  } catch {
    // Private mode etc: records are best-effort.
  }
  return store;
}

export function saveStore(store: ArcadeStore): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(ARCADE_KEY, JSON.stringify(store));
  } catch {
    // Best-effort.
  }
}

export function gameState(store: ArcadeStore, slug: ArcadeSlug): ArcadeGameState {
  return store[slug] ?? { ...EMPTY_GAME_STATE, history: [] };
}

/** Record a finished game. `lowerIsBetter` picks min (time/guesses) vs max (score). */
export function recordResult(
  store: ArcadeStore,
  slug: ArcadeSlug,
  value: number,
  won: boolean,
  lowerIsBetter = true,
): ArcadeStore {
  const prev = gameState(store, slug);
  const history = [...prev.history, value].slice(-50);
  const best =
    won && Number.isFinite(value)
      ? (prev.best === null ? value : lowerIsBetter ? Math.min(prev.best, value) : Math.max(prev.best, value))
      : prev.best;
  const streak = won ? prev.streak + 1 : 0;
  const today = ptDate();
  return {
    ...store,
    [slug]: {
      ...prev,
      history,
      best,
      streak,
      maxStreak: Math.max(prev.maxStreak, streak),
      lastWon: won ? today : prev.lastWon,
    },
  };
}

// --- Daily seeds (spec §3/§5): one seed per PT calendar date. ---

/** YYYY-MM-DD in America/Los_Angeles — identical for all users. */
export function ptDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts; // en-CA yields YYYY-MM-DD
}

/** Stable uint32 seed from a YYYY-MM-DD string (FNV-1a). */
export function seedFromDate(dateStr: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < dateStr.length; i += 1) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Tiny seeded PRNG (mulberry32) for daily boards. */
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

// --- Share (spec §6): text first, every share ends with the play URL. ---

export function playUrl(slug: string): string {
  return `amoljadhav.ai/games/${slug}`;
}

/** Copy text, preferring navigator.share on mobile; returns true on success. */
export async function shareText(text: string, say: (m: string) => void): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && 'share' in navigator && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      await (navigator as Navigator & { share: (d: { text: string }) => Promise<void> }).share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
    say('Copied');
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      say('Copied');
    } catch {
      say('Copy failed');
    }
  }
}

/** Five Letters guess marks as an emoji grid (spec §6 share text). */
export function fiveLettersShareGrid(marks: string[][]): string {
  return marks
    .map((row) =>
      row.map((m) => (m === 'correct' ? '🟩' : m === 'present' ? '🟨' : '⬛')).join(''),
    )
    .join('\n');
}

/** Short PT day label for share text, e.g. "Oct 24". */
export function ptDayLabel(now: Date = new Date()): string {
  return now.toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
  });
}

/** Code Breaker peg rows as ⚫⚪ (black = filled, white = ring, miss = ·). */
export function codeBreakerShareRows(
  guesses: number[][],
  scores: { black: number; white: number }[],
  shapes: string[],
): string {
  return guesses
    .map((g, i) => {
      const s = scores[i] ?? { black: 0, white: 0 };
      const pegs = g.map((c) => shapes[c % shapes.length]).join('');
      const fb = '⚫'.repeat(s.black) + '⚪'.repeat(s.white);
      return `${pegs} ${fb || '·'}`;
    })
    .join('\n');
}
