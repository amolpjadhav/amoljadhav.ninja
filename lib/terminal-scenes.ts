// Scene logic for the hero terminal: fortune and trivia rotation,
// scene picking, year progress, date factoring, this-day-in-history picks.
// Pure and dependency-free so node tests cover it.

export interface Fortune {
  text: string;
  link?: string;
}

export interface Trivia {
  text: string;
}

export type TerminalScene = 'fortune' | 'trivia' | 'cal' | 'factor' | 'history';

// Pick the next scene at random from every scene except the previous
// three, so no command repeats until at least three others have run.
export function pickScene(
  recent: TerminalScene[],
  hasHistory: boolean,
  rand: () => number,
): TerminalScene {
  const all: TerminalScene[] = hasHistory
    ? ['fortune', 'trivia', 'cal', 'factor', 'history']
    : ['fortune', 'trivia', 'cal', 'factor'];
  const blocked = new Set(recent.slice(-3));
  const candidates = all.filter((scene) => !blocked.has(scene));
  const pool = candidates.length > 0 ? candidates : all.filter((scene) => scene !== recent[recent.length - 1]);
  return pool[Math.floor(rand() * pool.length)] ?? 'fortune';
}

// Draw one fortune index with no repeats until all shown; the pool
// refills itself on exhaustion. `remaining` carries across scenes.
export function drawFortune(
  remaining: number[],
  total: number,
  rand: () => number,
): { pick: number; remaining: number[] } {
  const pool = remaining.length > 0 ? remaining : Array.from({ length: total }, (_, i) => i);
  if (pool.length === 0) return { pick: 0, remaining: [] };
  const at = Math.floor(rand() * pool.length);
  const pick = pool[at] ?? 0;
  return { pick, remaining: [...pool.slice(0, at), ...pool.slice(at + 1)] };
}

// "2026 ████████████████████░░░░░ 78.1%": 25-char bar of the elapsed
// share of the current year in local time, 1 decimal.
export function calProgressLine(nowMs: number): string {
  const now = new Date(nowMs);
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
  const pct = ((nowMs - start) / (end - start)) * 100;
  const filled = Math.round((pct / 100) * 25);
  return `${now.getFullYear()} ${'█'.repeat(filled)}${'░'.repeat(25 - filled)} ${pct.toFixed(1)}%`;
}

export function yyyymmdd(nowMs: number): string {
  const d = new Date(nowMs);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

// Trial division at runtime — never hard-code, factor post dates were
// wrong before. Ascending, with multiplicity.
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let m = Math.max(2, Math.floor(n));
  for (let d = 2; d * d <= m; d++) {
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

export function factorLine(n: number): string {
  return `${n}: ${primeFactors(n).join(' ')}`;
}

export interface HistoryEvent {
  year: number;
  text: string;
}

// Shape Wikipedia On-This-Day events: keep short readable ones, collapse
// whitespace. Unknown shapes pass through as empty, never throw.
export function pickHistoryEvents(raw: unknown, maxLen = 70): HistoryEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryEvent[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { year, text } = item as { year?: unknown; text?: unknown };
    if (typeof year !== 'number' || !Number.isInteger(year)) continue;
    if (typeof text !== 'string') continue;
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length === 0 || clean.length > maxLen) continue;
    out.push({ year, text: clean });
  }
  return out;
}

export function historyLine(e: HistoryEvent): string {
  return `${e.year}  ${e.text}`;
}
