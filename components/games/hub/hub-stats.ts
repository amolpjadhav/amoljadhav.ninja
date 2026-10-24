// Shared helpers for the /games hub client islands. Every read from
// localStorage is defensive: keys may not exist yet and stored JSON may
// be corrupt or from an older shape. Never throw; return safe defaults.

import type { GameSlug } from '../registry';

export const STORE_KEY = 'games:v1';

// Games with a daily mode (spec section 3: daily seeds for Five Letters,
// Sudoku Medium and Minesweeper Intermediate).
export const DAILY_GAMES: GameSlug[] = ['five-letters', 'sudoku', 'minesweeper'];

export interface HubGameState {
  best?: string;
  streak?: number;
  solvedToday?: boolean;
  inProgress?: boolean;
  continueLabel?: string;
}

export interface HubStore {
  perGame: Record<string, HubGameState>;
  streakDays: number;
  dailyDone: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// PT calendar date as YYYY-MM-DD (daily seeds are identical for all users).
export function ptDateString(now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

// Milliseconds until next midnight America/Los_Angeles.
export function msUntilMidnightPT(now: Date = new Date()): number {
  try {
    const ptNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
    );
    const next = new Date(ptNow);
    next.setHours(24, 0, 0, 0);
    return Math.max(0, next.getTime() - ptNow.getTime());
  } catch {
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return Math.max(0, next.getTime() - now.getTime());
  }
}

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

/** Display best for an arcade-store numeric best (spec §6: history units
 *  are seconds for Sudoku/Minesweeper, score for 2048, guesses for the
 *  guess-count games). Unknown slugs fall back to the raw number. */
export function formatArcadeBest(slug: string, n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (slug === 'sudoku' || slug === 'minesweeper') {
    const s = Math.max(0, Math.floor(n));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  if (slug === '2048') return Math.floor(n).toLocaleString('en-US');
  if (slug === 'five-letters') return `${Math.floor(n)}/6`;
  if (slug === 'code-breaker') return `${Math.floor(n)}/10`;
  return String(Math.floor(n));
}

const MAX_LABEL = 48;

function cleanLabel(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim().slice(0, MAX_LABEL);
  return t ? t : undefined;
}

function cleanCount(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
    ? Math.floor(v)
    : undefined;
}

// Per-game autosave keys the play views write on every move. The hub
// treats a non-empty one as an in-progress game (Continue row, Resume
// chip) even before the arcade bucket records anything.
const SAVE_KEYS: Record<string, string> = {
  'five-letters': 'games:v1:five-letters',
  minesweeper: 'games:v1:minesweeper',
  sudoku: 'games:v1:sudoku',
  'code-breaker': 'games:v1:code-breaker',
  '2048': 'games:v1:2048',
  chess: 'games:v1:chess',
};

/** True when an autosave payload holds actual play (not a fresh deal). */
export function saveHasProgress(slug: string, save: unknown): boolean {
  if (!isRecord(save)) return save !== null && save !== undefined;
  if (slug === 'five-letters' || slug === 'code-breaker') {
    const rows = save.rows ?? save.guesses;
    return Array.isArray(rows) && rows.length > 0;
  }
  if (slug === 'minesweeper') {
    return (
      (Array.isArray(save.mines) && save.mines.length > 0) ||
      (Array.isArray(save.open) && save.open.length > 0)
    );
  }
  if (slug === 'sudoku') {
    if (typeof save.secs === 'number' && save.secs > 0) return true;
    if (typeof save.mistakes === 'number' && save.mistakes > 0) return true;
    if (Array.isArray(save.grid) && Array.isArray(save.puzzle)) {
      return save.grid.some((v: unknown, i: number) => v !== save.puzzle[i]);
    }
    return false;
  }
  if (slug === '2048') {
    return (typeof save.score === 'number' && save.score > 0) ||
      (Array.isArray(save.board) && save.board.some((v: unknown) => v !== 0));
  }
  if (slug === 'chess') {
    return Array.isArray(save.moves) && save.moves.length > 0;
  }
  return true;
}

// Reads localStorage['games:v1'] defensively. Expected shape:
// { [game]: { history: [...], best, streak, saved, lastWon } } per spec
// section 6, plus optional daily progress { [game]: { lastSolvedDay } }
// and { dailyStreak }. Anything missing or malformed falls back to
// defaults. Autosave keys (SAVE_KEYS) fill in in-progress state when the
// bucket has none yet.
export function readHubStore(): HubStore {
  const empty: HubStore = { perGame: {}, streakDays: 0, dailyDone: 0 };
  let get: ((key: string) => string | null) | null = null;
  try {
    if (typeof window === 'undefined' || !window.localStorage) return empty;
    const ls = window.localStorage;
    get = (key: string) => ls.getItem(key);
  } catch {
    return empty;
  }
  if (!get) return empty;
  let parsed: Record<string, unknown> = {};
  try {
    const raw = get(STORE_KEY);
    if (raw) {
      const v: unknown = JSON.parse(raw);
      if (isRecord(v)) parsed = v;
    }
  } catch {
    parsed = {};
  }

  const today = ptDateString();
  const perGame: Record<string, HubGameState> = {};
  let dailyDone = 0;
  let bestStreak = 0;

  for (const slug of new Set([...Object.keys(parsed), ...Object.keys(SAVE_KEYS)])) {
    const rawEntry: unknown = parsed[slug];
    const entry = isRecord(rawEntry) ? rawEntry : {};
    const state: HubGameState = {};
    // Arcade-store numeric bests (lib/games/arcade.ts) or legacy labels.
    const best = cleanLabel(entry.best);
    if (best) {
      state.best = best;
    } else if (typeof entry.best === 'number') {
      state.best = formatArcadeBest(slug, entry.best);
    }
    const streak = cleanCount(entry.streak ?? entry.maxStreak);
    if (streak !== undefined) {
      state.streak = streak;
      if (streak > bestStreak) bestStreak = streak;
    }
    // A saved mid-game exists (autosaved on every move; resume after reload).
    if (isRecord(entry.saved)) {
      state.inProgress = true;
      const detail =
        cleanLabel(entry.saved.label) ??
        cleanLabel((entry.saved as Record<string, unknown>).detail);
      if (detail) state.continueLabel = detail;
    }
    // Fall back to the play view's own autosave key — the arcade bucket
    // only learns about a game once it is finished.
    if (!state.inProgress) {
      const saveKey = SAVE_KEYS[slug];
      if (saveKey) {
        try {
          const rawSave = get(saveKey);
          if (rawSave && saveHasProgress(slug, JSON.parse(rawSave) as unknown)) {
            state.inProgress = true;
          }
        } catch {
          // Corrupt save: not in progress.
        }
      }
    }
    // Daily solved marker: arcade lastWon, legacy lastSolvedDay, or a
    // history entry matching PT today.
    const lastSolved = entry.lastSolvedDay;
    if (typeof lastSolved === 'string' && lastSolved === today) {
      state.solvedToday = true;
    } else if (typeof entry.lastWon === 'string' && entry.lastWon === today) {
      state.solvedToday = true;
    } else if (Array.isArray(entry.history)) {
      const hit = entry.history.some(
        (h: unknown) =>
          isRecord(h) &&
          (h.day === today || h.date === today) &&
          (h.won === true || h.solved === true || h.completed === true),
      );
      if (hit) state.solvedToday = true;
    }
    if (Object.keys(state).length > 0) perGame[slug] = state;
  }

  for (const slug of DAILY_GAMES) {
    if (perGame[slug]?.solvedToday) dailyDone += 1;
  }

  const streakDays =
    cleanCount(parsed.dailyStreak) ??
    cleanCount(parsed.overallStreak) ??
    bestStreak;

  return { perGame, streakDays, dailyDone };
}
