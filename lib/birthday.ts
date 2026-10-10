// Pure birthday-paradox math for the BirthdayClassroom widget.
export const BIRTHDAY_DAYS = 365;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Pairs among n people: n(n-1)/2. */
export function pairCount(n: number): number {
  if (n < 2) return 0;
  return (n * (n - 1)) / 2;
}

/** Exact chance that at least two of n people share a birthday (365-day model). */
export function matchChance(n: number): number {
  if (n <= 1) return 0;
  if (n > BIRTHDAY_DAYS) return 1;
  let noMatch = 1;
  for (let i = 0; i < n; i++) noMatch *= (BIRTHDAY_DAYS - i) / BIRTHDAY_DAYS;
  return 1 - noMatch;
}

/** Median of a non-empty list, rounded to a whole number. */
export function median(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** Day-of-year (0-based) to a "March 14" label. */
export function dayLabel(day: number): string {
  let d = ((day % BIRTHDAY_DAYS) + BIRTHDAY_DAYS) % BIRTHDAY_DAYS;
  for (let m = 0; m < 12; m++) {
    if (d < MONTH_LENGTHS[m]) return `${MONTH_NAMES[m]} ${d + 1}`;
    d -= MONTH_LENGTHS[m];
  }
  return `${MONTH_NAMES[11]} 31`;
}

export function monthLengths(): number[] {
  return [...MONTH_LENGTHS];
}

export function monthNames(): string[] {
  return [...MONTH_NAMES];
}
