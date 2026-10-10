// Official "Five for [Month]" spins: one fixed list per month, chosen once and
// stored here. Each entry references curated pool books by id (lib/book-pool)
// plus the editorial layer no API has: why it's here, and my verdict.
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
        bookId: 'charlottes-web',
        why: 'The Kids draw, and the month’s quick win: under 200 pages, perfect in every sentence.',
      },
      {
        bookId: 'hound-of-baskervilles',
        why: 'The Mystery draw: the one Sherlock to read if you read one.',
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
        bookId: 'shoe-dog',
        why: 'The Business draw: the best founder story ever written, full of near-bankruptcies.',
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
