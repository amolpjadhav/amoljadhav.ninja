// Five Letters (Wordle-style) logic: guess scoring with correct
// duplicate-letter handling, and the seeded daily word shared by
// everyone on a given day.
export type Mark = 'correct' | 'present' | 'absent';

export const WORD_LEN = 5;
export const MAX_GUESSES = 6;

export type KeyAction = { type: 'enter' } | { type: 'back' } | { type: 'letter'; letter: string };

// Physical-keyboard input: a desktop player never needs the on-screen
// keyboard. Maps a KeyboardEvent.key to the game action it drives;
// anything else (digits, arrows, dead keys) is ignored.
export function keyAction(key: string): KeyAction | null {
  if (key === 'Enter') return { type: 'enter' };
  if (key === 'Backspace') return { type: 'back' };
  if (/^[a-zA-Z]$/.test(key)) return { type: 'letter', letter: key.toLowerCase() };
  return null;
}
export const DAILY_TZ = 'America/Los_Angeles';

// Two passes: greens first (consuming one answer letter each), then
// yellows from what remains. A doubled guess letter only lights up
// twice when the answer also holds it twice.
export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(WORD_LEN).fill('absent');
  const remaining = new Map<string, number>();
  for (let i = 0; i < WORD_LEN; i += 1) {
    if (guess[i] === answer[i]) {
      marks[i] = 'correct';
    } else {
      const ch = answer[i] as string;
      remaining.set(ch, (remaining.get(ch) ?? 0) + 1);
    }
  }
  for (let i = 0; i < WORD_LEN; i += 1) {
    if (marks[i] === 'correct') continue;
    const ch = guess[i] as string;
    const left = remaining.get(ch) ?? 0;
    if (left > 0) {
      marks[i] = 'present';
      remaining.set(ch, left - 1);
    }
  }
  return marks;
}

// YYYY-MM-DD in the daily-word timezone. Pure in the Date given, so
// tests pin exact days without depending on the machine zone.
export function dayKey(at: Date, timeZone: string = DAILY_TZ): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Deterministic daily answer index. Epoch day 0 lands on answers[0]
// of the deployment era; rotation never repeats until the list does.
export function dailyIndex(count: number, key: string): number {
  if (count <= 0) return 0;
  return fnv1a(`five-letters:${key}`) % count;
}

// The answer is revealed only once a game is lost — never while playing
// (that would spoil it) and never after a win (the player already knows).
export function revealedAnswer(status: 'playing' | 'won' | 'lost', word: string): string | null {
  return status === 'lost' ? word.toUpperCase() : null;
}

/**
 * Raw device-keyboard text → guess prefix. Uppercase A–Z only, capped at
 * WORD_LEN. Driven from the input VALUE (not keydown): Android IMEs often
 * send keyCode 229, and autocorrect/compose through `value`.
 */
export function sanitizeGuessInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, WORD_LEN);
}

/** Milliseconds until the next PT midnight (the next daily word). */
export function msUntilPTMidnight(at: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DAILY_TZ,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const elapsed = (get('hour') % 24) * 3_600_000 + get('minute') * 60_000 + get('second') * 1000;
  return 86_400_000 - elapsed;
}

/** 6:22:10 style countdown. */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function dailyWord(answers: string[], at: Date = new Date()): { word: string; num: number; key: string } {
  const key = dayKey(at);
  const epoch = Date.UTC(2026, 9, 12); // day-number era start
  const dayMs = 86_400_000;
  const num = Math.max(1, Math.floor((Date.parse(`${key}T12:00:00Z`) - epoch) / dayMs) + 1);
  return { word: answers[dailyIndex(answers.length, key)] ?? '', num, key };
}
