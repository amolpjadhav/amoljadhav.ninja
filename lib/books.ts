// Open Library + NYT Bestsellers data layer for the Book Finder utility.
// Pure normalizers are unit-tested (lib/books.test.mjs); the fetchers below
// run server-side in /api/books/* routes, which set their own cache headers.
export interface BookCard {
  key: string; // Open Library work key, e.g. /works/OL893414W
  title: string;
  authors: string[];
  coverId?: number;
  year?: number;
  rating?: number; // 0-5, when the source reports it
  ratingsCount?: number;
  editions?: number; // edition_count, a popularity proxy for genre views
  subjects?: string[];
}

export interface BookDetails extends BookCard {
  description?: string;
}

export interface NytBestseller {
  title: string;
  author: string;
  rank: number;
  weeks: number;
  blurb?: string;
  isbn?: string;
}

export interface NytList {
  name: string; // display name, e.g. "Combined Print & E-Book Fiction"
  slug: string; // list_name_encoded
  books: NytBestseller[];
}

export interface Genre {
  slug: string; // Open Library subject slug
  label: string;
  blurb: string;
}

// All slugs verified against /subjects/<slug>.json (work_count > 0).
export const GENRES: Genre[] = [
  { slug: 'fantasy', label: 'Fantasy', blurb: 'Dragons, quests & magic systems' },
  { slug: 'science_fiction', label: 'Sci-Fi', blurb: 'Space, AI & futures' },
  { slug: 'mystery', label: 'Mystery', blurb: 'Detectives & whodunits' },
  { slug: 'thriller', label: 'Thriller', blurb: 'Twists & page-turners' },
  { slug: 'romance', label: 'Romance', blurb: 'Love stories' },
  { slug: 'horror', label: 'Horror', blurb: 'Scares & dread' },
  { slug: 'history', label: 'History', blurb: 'The past, told well' },
  { slug: 'biography', label: 'Biography', blurb: 'Lives worth reading' },
  { slug: 'business', label: 'Business', blurb: 'Money & companies' },
  { slug: 'self-help', label: 'Self-Help', blurb: 'Habits & growth' },
  { slug: 'juvenile_fiction', label: 'Kids', blurb: 'For young readers' },
  { slug: 'classics', label: 'Classics', blurb: 'The canon' },
];

export function genreBySlug(slug: string): Genre | undefined {
  return GENRES.find((g) => g.slug === slug);
}

const OL = 'https://openlibrary.org';
const UA = { 'User-Agent': 'amoljadhav-book-finder/1.0 (contact: amoljadhav.ai)', Accept: 'application/json' };

export function coverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverId || !Number.isFinite(coverId) || coverId <= 0) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

// Work records list cover ids, but -1/0 entries are "no cover" sentinels.
// Take the first real (positive) id so a leading -1 can't break the image.
export function firstCoverId(covers: unknown): number | undefined {
  if (!Array.isArray(covers)) return undefined;
  for (const id of covers) {
    if (typeof id === 'number' && Number.isFinite(id) && id > 0) return id;
  }
  return undefined;
}

// Search, trending, and subject docs all normalize to BookCard. Shapes differ:
// search/trending use cover_i + author_name[], subjects use cover_id +
// authors:[{name}], and only search reliably carries ratings.
export function normalizeOlDoc(doc: Record<string, unknown>): BookCard | null {
  if (typeof doc.key !== 'string' || typeof doc.title !== 'string') return null;
  const authors: string[] = [];
  if (Array.isArray(doc.author_name)) {
    for (const a of doc.author_name) if (typeof a === 'string') authors.push(a);
  } else if (Array.isArray(doc.authors)) {
    for (const a of doc.authors) {
      const rec = a as Record<string, unknown>;
      if (rec && typeof rec.name === 'string') authors.push(rec.name);
    }
  }
  const coverId =
    typeof doc.cover_i === 'number' ? doc.cover_i : typeof doc.cover_id === 'number' ? doc.cover_id : undefined;
  const subjects = Array.isArray(doc.subject)
    ? (doc.subject as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 12)
    : undefined;
  return {
    key: doc.key,
    title: doc.title,
    authors: authors.slice(0, 4),
    coverId,
    year: typeof doc.first_publish_year === 'number' ? doc.first_publish_year : undefined,
    rating: typeof doc.ratings_average === 'number' ? round1(doc.ratings_average) : undefined,
    ratingsCount: typeof doc.ratings_count === 'number' ? doc.ratings_count : undefined,
    editions: typeof doc.edition_count === 'number' ? doc.edition_count : undefined,
    subjects,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Ratings endpoint shape: {summary: {average, count}}. Zero-count works stay
// unrated so the UI can say so honestly.
export function ratingFromSummary(json: unknown): { rating: number; ratingsCount: number } | undefined {
  const rec = json as Record<string, unknown> | null;
  const summary = rec?.summary as Record<string, unknown> | undefined;
  if (!summary || typeof summary.average !== 'number' || typeof summary.count !== 'number') return undefined;
  if (summary.count <= 0) return undefined;
  return { rating: round1(summary.average), ratingsCount: summary.count };
}

// Work descriptions come as a string or {value}; trim to readable prose.
export function workDescription(work: Record<string, unknown>, maxChars = 900): string | undefined {
  const raw = work.description;
  const text = typeof raw === 'string' ? raw : (raw as Record<string, unknown>)?.value;
  if (typeof text !== 'string') return undefined;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return undefined;
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', maxChars)).trimEnd() + '…';
}

// NYT overview books -> slim bestseller rows. Missing isbn13 falls back to
// primary_isbn13 so covers can still resolve via Open Library.
export function normalizeNytBook(book: Record<string, unknown>, fallbackRank: number): NytBestseller | null {
  if (typeof book.title !== 'string' || typeof book.author !== 'string') return null;
  const isbns = book.isbns as Array<Record<string, unknown>> | undefined;
  return {
    title: book.title,
    author: book.author,
    rank: typeof book.rank === 'number' ? book.rank : fallbackRank,
    weeks: typeof book.weeks_on_list === 'number' ? book.weeks_on_list : 0,
    blurb: typeof book.description === 'string' && book.description ? book.description : undefined,
    isbn:
      (Array.isArray(isbns) && typeof isbns[0]?.isbn10 === 'string' ? isbns[0].isbn10 : undefined) ??
      (typeof book.primary_isbn13 === 'string' ? book.primary_isbn13 : undefined),
  };
}

// Curated list order for the Bestsellers tab; unknown lists append after.
const NYT_LIST_ORDER = [
  'combined-print-and-e-book-fiction',
  'combined-print-and-e-book-nonfiction',
  'hardcover-fiction',
  'hardcover-nonfiction',
  'trade-fiction-paperback',
  'paperback-nonfiction',
  'advice-how-to-and-miscellaneous',
  'young-adult-hardcover',
  'childrens-middle-grade-hardcover',
  'picture-books',
];

export function sortNytLists<T extends { slug: string }>(lists: T[]): T[] {
  const order = new Map(NYT_LIST_ORDER.map((slug, i) => [slug, i]));
  return [...lists].sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999));
}

async function fetchJson(url: string, timeoutMs = 15000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: UA, signal: ctrl.signal });
    if (!res.ok) throw new Error(`upstream ${res.status} for ${url}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

const SEARCH_FIELDS = 'key,title,author_name,cover_i,first_publish_year,ratings_average,ratings_count,edition_count,subject';

export async function searchBooks(query: string, limit = 12): Promise<BookCard[]> {
  const q = query.trim().slice(0, 120);
  if (!q) return [];
  const data = (await fetchJson(
    `${OL}/search.json?q=${encodeURIComponent(q)}&limit=${Math.min(limit, 24)}&fields=${SEARCH_FIELDS}`,
  )) as { docs?: Record<string, unknown>[] };
  const books = (data.docs ?? []).map(normalizeOlDoc).filter((b): b is BookCard => b !== null);
  return enrichRatings(books);
}

// Trending/subject feeds carry no ratings, so fill the gaps with one small
// ratings.json fan-out per unrated work. Failures keep the book unrated.
async function enrichRatings(books: BookCard[]): Promise<BookCard[]> {
  const missing = books.filter((b) => b.rating === undefined);
  if (missing.length === 0) return books;
  const fetched = await Promise.all(
    missing.map((b) => fetchJson(`${OL}${b.key}/ratings.json`, 8000).then(ratingFromSummary).catch(() => undefined)),
  );
  const byKey = new Map(missing.map((b, i) => [b.key, fetched[i]]));
  return books.map((b) => {
    const r = byKey.get(b.key);
    return r ? { ...b, rating: r.rating, ratingsCount: r.ratingsCount } : b;
  });
}

export type TrendingPeriod = 'now' | 'daily' | 'weekly' | 'monthly';

export async function trendingBooks(period: TrendingPeriod = 'daily', limit = 12): Promise<MostReadBook[]> {
  const data = (await fetchJson(
    `${OL}/trending/${period}.json?limit=${Math.min(limit + 6, 24)}`,
  )) as { works?: Record<string, unknown>[] };
  const books = (data.works ?? []).map(normalizeOlDoc).filter((b): b is BookCard => b !== null);
  const rated = await enrichRatings(books);
  const counts = await fetchReadingCounts(rated.map((b) => b.key));
  return attachReading(rated, counts).slice(0, Math.max(limit, 1));
}

export async function genreBooks(subject: string, limit = 24): Promise<BookCard[]> {
  if (!genreBySlug(subject)) throw new Error(`unknown genre: ${subject}`);
  const data = (await fetchJson(`${OL}/subjects/${subject}.json?limit=${Math.min(limit, 48)}`)) as {
    works?: Record<string, unknown>[];
  };
  const books = (data.works ?? []).map(normalizeOlDoc).filter((b): b is BookCard => b !== null);
  // Subject feeds carry no ratings; edition count is the popularity proxy.
  const sorted = books.sort((a, b) => (b.editions ?? 0) - (a.editions ?? 0));
  return enrichRatings(sorted);
}

// --- Currently-reading counts (Open Library reading logs) ---

export interface MostReadBook extends BookCard {
  readingNow: number;
}

// bookshelves.json reports per-shelf log counts; parse defensively since
// the shape has varied ({ counts: {...} } vs flat at the root).
export function readingNowFromShelves(json: unknown): number | null {
  if (!json || typeof json !== 'object') return null;
  const root = json as Record<string, unknown>;
  const inner = root.counts;
  const counts = (inner && typeof inner === 'object' ? inner : root) as Record<string, unknown>;
  for (const key of ['currently_reading', 'currently-reading', 'currentlyReading']) {
    const v = counts[key];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return Math.floor(v);
  }
  return null;
}

export function formatReadingCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1000) return String(Math.floor(n));
  return `${parseFloat((n / 1000).toFixed(1))}k`;
}

export async function fetchReadingCounts(keys: string[]): Promise<Map<string, number>> {
  const valid = [...new Set(keys)].filter((k) => /^\/works\/OL\d+W$/.test(k));
  const out = new Map<string, number>();
  // 12 per batch to stay polite to OL; callers cap their own totals.
  for (let i = 0; i < valid.length; i += 12) {
    const batch = valid.slice(i, i + 12);
    const fetched = await Promise.all(
      batch.map((k) => fetchJson(`${OL}${k}/bookshelves.json`, 8000).then(readingNowFromShelves).catch(() => null)),
    );
    batch.forEach((k, j) => {
      const n = fetched[j];
      if (n !== null) out.set(k, n);
    });
  }
  return out;
}

// True when enrichment totally failed: no ratings and no counts on any
// book. Routes use this to cache degraded responses briefly, so a poisoned
// CDN entry self-heals in a minute instead of lingering for hours.
export function isBareFeed(books: (BookCard & { readingNow?: number })[]): boolean {
  return books.length > 0 && books.every((b) => b.rating === undefined && (b.readingNow ?? 0) === 0);
}

// Pure attach step (tested offline): every book gets readingNow (0 when
// unknown); ranked desc only when at least one count landed, so a counts
// outage keeps the feed's original order instead of emptying it.
export function attachReading(books: BookCard[], counts: Map<string, number>): MostReadBook[] {
  const attached = books.map((b) => ({ ...b, readingNow: counts.get(b.key) ?? 0 }));
  if (counts.size > 0) attached.sort((a, b) => b.readingNow - a.readingNow);
  return attached;
}

// Pure rank step (tested offline): attach counts, drop uncounted, sort desc.
export function rankByReading(books: BookCard[], counts: Map<string, number>, limit = 5): MostReadBook[] {
  return books
    .filter((b) => counts.has(b.key))
    .map((b) => ({ ...b, readingNow: counts.get(b.key) as number }))
    .sort((a, b) => b.readingNow - a.readingNow)
    .slice(0, Math.max(limit, 1));
}

// Top currently-read books on a genre shelf: 12 subject candidates ranked
// by live reading-log counts. No ratings fan-out — the strip shows counts.
export async function mostReadBooks(subject: string, limit = 5): Promise<MostReadBook[]> {
  if (!genreBySlug(subject)) throw new Error(`unknown genre: ${subject}`);
  const data = (await fetchJson(`${OL}/subjects/${subject}.json?limit=12`)) as {
    works?: Record<string, unknown>[];
  };
  const books = (data.works ?? []).map(normalizeOlDoc).filter((b): b is BookCard => b !== null);
  if (books.length === 0) return [];
  const counts = await fetchReadingCounts(books.map((b) => b.key));
  return rankByReading(books, counts, limit);
}

export async function bookDetails(workKey: string): Promise<BookDetails | null> {
  if (!/^\/works\/OL\d+W$/.test(workKey)) return null;
  const [work, ratings] = await Promise.all([
    fetchJson(`${OL}${workKey}.json`).catch(() => null) as Promise<Record<string, unknown> | null>,
    fetchJson(`${OL}${workKey}/ratings.json`).catch(() => null) as Promise<Record<string, unknown> | null>,
  ]);
  if (!work) return null;
  const authors: string[] = [];
  if (Array.isArray(work.authors)) {
    for (const entry of work.authors as Array<Record<string, unknown>>) {
      const key = (entry.author as Record<string, unknown>)?.key;
      if (typeof key === 'string') {
        const author = (await fetchJson(`${OL}${key}.json`).catch(() => null)) as Record<
          string,
          unknown
        > | null;
        if (author && typeof author.name === 'string') authors.push(author.name);
        if (authors.length >= 4) break;
      }
    }
  }
  const r = ratingFromSummary(ratings);
  return {
    key: workKey,
    title: typeof work.title === 'string' ? work.title : 'Unknown title',
    authors,
    coverId: firstCoverId(work.covers),
    description: workDescription(work),
    rating: r?.rating,
    ratingsCount: r?.ratingsCount,
  };
}

export interface NytOverview {
  publishedDate: string;
  lists: NytList[];
}

export async function nytBestsellers(apiKey: string | undefined): Promise<NytOverview | null> {
  if (!apiKey) return null;
  const data = (await fetchJson(
    `https://api.nytimes.com/svc/books/v3/lists/overview.json?published_date=current&api-key=${encodeURIComponent(apiKey)}`,
    20000,
  )) as {
    status?: string;
    results?: { published_date?: string; lists?: Record<string, unknown>[] };
  };
  if (data.status !== 'OK' || !data.results) throw new Error('NYT overview not OK');
  const lists: NytList[] = [];
  for (const list of data.results.lists ?? []) {
    if (typeof list.display_name !== 'string' || typeof list.list_name_encoded !== 'string') continue;
    const books = ((list.books as Record<string, unknown>[]) ?? [])
      .map((b, i) => normalizeNytBook(b, i + 1))
      .filter((b): b is NytBestseller => b !== null);
    if (books.length > 0) lists.push({ name: list.display_name, slug: list.list_name_encoded, books });
  }
  return { publishedDate: data.results.published_date ?? '', lists: sortNytLists(lists) };
}
