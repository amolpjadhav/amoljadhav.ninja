// Official "Five for [Month]" spins: one fixed list per month, chosen once and
// stored here. Each entry references curated pool books by id (lib/book-pool)
// plus the editorial layer no API has: why it's here, and my verdict.
// Selection policy: rank slot candidates with scripts/suggest-five.mjs
// (quality + finish rate + popularity) — the algorithm ranks, the human picks.
export interface MonthVerdict {
  score: number; // 0-10
  note: string;
}

export interface MonthPick {
  bookId: string;
  why: string;
  verdict?: MonthVerdict;
}

export type MonthStatus = 'todo' | 'reading' | 'read';

export interface MonthSpin {
  month: string; // YYYY-MM
  label: string;
  genres: string[]; // drawn genre slugs, in pick order
  picks: MonthPick[];
  verdictDate: string; // e.g. 'Nov 30' — when the ranking lands
  ajProgress: Record<string, MonthStatus>; // my public tracker; missing ids read as todo
}

export const MONTHS: MonthSpin[] = [
  {
    month: '2026-11',
    label: 'November',
    genres: ['juvenile_fiction', 'mystery', 'horror', 'fantasy', 'business'],
    verdictDate: 'Nov 30',
    ajProgress: {},
    picks: [
      {
        bookId: 'the-giver',
        why: 'The Kids draw, and the month’s quick win: the rare dystopia everyone finishes.',
      },
      {
        bookId: 'spy-who-came-in',
        why: 'The Mystery draw: the Cold War spy novel all others answer to.',
      },
      {
        bookId: 'frankenstein',
        why: 'The Horror draw and the month’s classic: 200 years old, reads like tomorrow.',
      },
      {
        bookId: 'name-of-the-wind',
        why: 'The Fantasy draw and the month’s stretch: 662 pages that earn every one. (Series unfinished — you’ve been warned.)',
      },
      {
        bookId: 'everything-store',
        why: 'The Business draw: Bezos and the making of Amazon — relentless, and readers tear through it.',
      },
    ],
  },
];

export function currentMonth(): MonthSpin {
  return MONTHS[MONTHS.length - 1];
}

export function pastMonths(): MonthSpin[] {
  return MONTHS.slice(0, -1).reverse();
}

// Genres already drawn across all stored months — the "used" display for the
// official bag. December draws from whatever remains.
export function usedGenres(): string[] {
  return [...new Set(MONTHS.flatMap((m) => m.genres))];
}
