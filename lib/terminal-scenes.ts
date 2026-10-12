// Pure scene logic for the hero channels terminal. The React player only
// schedules ticks; everything here is deterministic given its inputs
// (randomness is injected) so `npm test` covers the behavior.

export interface HtopRow {
  pid: number;
  name: string;
  cpu: number;
  note?: string;
}

export const HTOP_SEED: HtopRow[] = [
  { pid: 101, name: 'curiosity', cpu: 97 },
  { pid: 204, name: 'chess_training', cpu: 41 },
  { pid: 311, name: 'coffee.daemon', cpu: 88 },
  { pid: 412, name: 'reading_books', cpu: 3, note: 'zombie' },
];

// Jitters CPU ±5, clamped to 1..99 — except the zombie, which never
// rises above 5%. Returns fresh rows; the seed is never mutated.
export function jitterHtop(rows: HtopRow[], rand: () => number): HtopRow[] {
  return rows.map((r) => {
    const next = r.cpu + Math.floor(rand() * 11) - 5;
    const cpu = r.note === 'zombie' ? Math.min(5, Math.max(0, next)) : Math.min(99, Math.max(1, next));
    return { ...r, cpu };
  });
}

export function formatHtopRow(r: HtopRow): string {
  return `${String(r.pid).padEnd(4)} ${r.name.padEnd(16)}${r.cpu}%${r.note ? `   (${r.note})` : ''}`;
}

export interface FlipState {
  flips: number;
  heads: number;
}

export function flipStep(s: FlipState, rand: () => number): FlipState {
  return { flips: s.flips + 1, heads: s.heads + (rand() < 0.5 ? 1 : 0) };
}

export function formatFlip(s: FlipState): string {
  const pct = s.flips === 0 ? 0 : (s.heads / s.flips) * 100;
  return `flips: ${s.flips}  heads: ${pct.toFixed(1)}%`;
}

// One-shot run for the single-output flip scene.
export function flipRun(flips: number, rand: () => number): FlipState {
  let s: FlipState = { flips: 0, heads: 0 };
  for (let i = 0; i < flips; i++) s = flipStep(s, rand);
  return s;
}

const BDAY_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BDAY_CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

export function dayLabel(doy: number): string {
  const d = Math.min(364, Math.max(0, doy));
  let m = 0;
  while (m < 11 && d >= (BDAY_CUM[m + 1] ?? 365)) m += 1;
  return `${BDAY_MONTHS[m] ?? 'Jan'} ${d - (BDAY_CUM[m] ?? 0) + 1}`;
}

export interface BirthdayClass {
  dates: string[];
  match: string | null;
}

// Rolls birthdays until the first repeat (capped so a freak run can't
// loop the scene forever). dates includes the repeat when one lands.
export function birthdayDraws(rand: () => number, maxDraws = 60): BirthdayClass {
  const seen = new Set<number>();
  const dates: string[] = [];
  for (let i = 0; i < maxDraws; i++) {
    const d = Math.floor(rand() * 365);
    dates.push(dayLabel(d));
    if (seen.has(d)) return { dates, match: dayLabel(d) };
    seen.add(d);
  }
  return { dates, match: null };
}

export interface MontyState {
  runs: number;
  switchWins: number;
}

// One batch of Monty Hall runs: the car hides behind a random door, you
// pick randomly, and switching wins unless your first pick was the car.
export function montyBatch(s: MontyState, n: number, rand: () => number): MontyState {
  let { runs, switchWins } = s;
  for (let i = 0; i < n; i++) {
    runs += 1;
    if (Math.floor(rand() * 3) !== Math.floor(rand() * 3)) switchWins += 1;
  }
  return { runs, switchWins };
}

export function formatMonty(s: MontyState): string {
  const pct = s.runs === 0 ? 0 : (s.switchWins / s.runs) * 100;
  return `runs: ${s.runs}  switch wins: ${pct.toFixed(1)}%`;
}

// One-shot run for the single-output monty scene.
export function montyRun(runs: number, rand: () => number): MontyState {
  return montyBatch({ runs: 0, switchWins: 0 }, runs, rand);
}

// Single-line birthday result: the match when one lands in n kids.
export function birthdayLine(room: BirthdayClass, kids: number): string {
  return room.match ? `match on ${room.match} · ${room.dates.length} kids` : `no match · ${kids} kids`;
}

// The ps scene shows one brain process per cycle, jittered once — the old
// 4-row table as a single honest top line.
export function psRow(cycle: number, rand: () => number): HtopRow {
  const i = ((cycle % HTOP_SEED.length) + HTOP_SEED.length) % HTOP_SEED.length;
  const seed = HTOP_SEED[i] ?? { pid: 101, name: 'curiosity', cpu: 97 };
  return jitterHtop([seed], rand)[0] ?? seed;
}

export interface CommitEntry {
  sha: string;
  message: string;
}

// Drops noisy history (wip/tmp scratch, merges) and caps the scroll.
export function filterCommitEntries(entries: CommitEntry[], limit = 8): CommitEntry[] {
  return entries.filter((e) => e.message.trim() && !/^(wip|tmp|merge)/i.test(e.message.trim())).slice(0, limit);
}

export function formatCommit(sha: string, message: string): string {
  const first = message.split('\n')[0].trim();
  return `${sha.slice(0, 6)}  ${first}`;
}

// One-line composers for the data scenes. Each takes preformatted
// primitives (the server feeds them with timeAgo/formatPerHour/formatPct)
// so this module stays dependency-free and node-testable.

export function blogLine(title: string, age: string | null): string {
  return age ? `${title} · ${age}` : title;
}

export function castLine(channel: string, perHour: string | null): string | null {
  return perHour ? `${channel} · ${perHour}` : null;
}

export interface MarketQuote {
  label: string;
  changePct: number | null;
}

// The market scene leads with the S&P 500, else the first quote carrying
// a number; null when the strip has no usable quote at all.
export function pickMarketQuote(items: MarketQuote[]): MarketQuote | null {
  const live = (q: MarketQuote) => q.changePct !== null && Number.isFinite(q.changePct);
  return items.find((q) => q.label === 'S&P 500' && live(q)) ?? items.find(live) ?? null;
}

export function marketLine(label: string, pct: string): string {
  return `${label} ${pct}`;
}
