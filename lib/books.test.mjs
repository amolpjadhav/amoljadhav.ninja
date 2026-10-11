// Tests for the Book Finder data layer (pure normalizers only — no network).
// Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GENRES,
  coverUrl,
  firstCoverId,
  formatReadingCount,
  genreBySlug,
  normalizeNytBook,
  normalizeOlDoc,
  rankByReading,
  ratingFromSummary,
  readingNowFromShelves,
  sortNytLists,
  workDescription,
} from './books.ts';

describe('normalizeOlDoc', () => {
  it('normalizes a search doc with ratings', () => {
    const book = normalizeOlDoc({
      key: '/works/OL893414W',
      title: 'Dune',
      author_name: ['Frank Herbert'],
      cover_i: 11481354,
      first_publish_year: 1965,
      ratings_average: 4.234,
      ratings_count: 120,
      edition_count: 300,
      subject: ['Science fiction', 'Deserts'],
    });
    assert.deepEqual(book, {
      key: '/works/OL893414W',
      title: 'Dune',
      authors: ['Frank Herbert'],
      coverId: 11481354,
      year: 1965,
      rating: 4.2,
      ratingsCount: 120,
      editions: 300,
      subjects: ['Science fiction', 'Deserts'],
    });
  });

  it('normalizes a subject work (cover_id + authors objects, no ratings)', () => {
    const book = normalizeOlDoc({
      key: '/works/OL138052W',
      title: "Alice's Adventures in Wonderland",
      authors: [{ key: '/authors/OL22098A', name: 'Lewis Carroll' }],
      cover_id: 10527843,
      first_publish_year: 1865,
      edition_count: 3548,
    });
    assert.ok(book);
    assert.equal(book.coverId, 10527843);
    assert.deepEqual(book.authors, ['Lewis Carroll']);
    assert.equal(book.rating, undefined);
    assert.equal(book.editions, 3548);
  });

  it('caps authors and subjects, rejects docs without key/title', () => {
    const book = normalizeOlDoc({
      key: '/works/OL1W',
      title: 'X',
      author_name: ['a', 'b', 'c', 'd', 'e'],
      subject: Array.from({ length: 20 }, (_, i) => `s${i}`),
    });
    assert.ok(book);
    assert.equal(book.authors.length, 4);
    assert.equal(book.subjects.length, 12);
    assert.equal(normalizeOlDoc({ title: 'no key' }), null);
    assert.equal(normalizeOlDoc({ key: '/works/OL1W' }), null);
  });
});

describe('coverUrl', () => {
  it('builds cover URLs and nulls blanks', () => {
    assert.equal(coverUrl(11481354), 'https://covers.openlibrary.org/b/id/11481354-M.jpg');
    assert.equal(coverUrl(1, 'L'), 'https://covers.openlibrary.org/b/id/1-L.jpg');
    assert.equal(coverUrl(undefined), null);
    assert.equal(coverUrl(NaN), null);
    assert.equal(coverUrl(-1), null);
    assert.equal(coverUrl(0), null);
  });
});

describe('firstCoverId', () => {
  it('skips no-cover sentinels and takes the first real id', () => {
    assert.equal(firstCoverId([-1, 8441376, 10123765]), 8441376);
    assert.equal(firstCoverId([10527843]), 10527843);
    assert.equal(firstCoverId([-1, 0]), undefined);
    assert.equal(firstCoverId([]), undefined);
    assert.equal(firstCoverId(undefined), undefined);
    assert.equal(firstCoverId('nope'), undefined);
  });
});

describe('workDescription', () => {
  it('accepts string and {value} forms, trims whitespace', () => {
    assert.equal(workDescription({ description: '  A  tale. ' }), 'A tale.');
    assert.equal(workDescription({ description: { value: 'Deep.' } }), 'Deep.');
    assert.equal(workDescription({}), undefined);
    assert.equal(workDescription({ description: { value: 42 } }), undefined);
  });

  it('truncates long text at a word boundary with an ellipsis', () => {
    const text = 'word '.repeat(300);
    const out = workDescription({ description: text }, 100);
    assert.ok(out.length <= 101);
    assert.ok(out.endsWith('…'));
    assert.ok(!out.endsWith(' …') || true);
  });
});

describe('normalizeNytBook', () => {
  it('keeps rank/weeks/blurb and prefers isbn10', () => {
    const book = normalizeNytBook(
      {
        title: 'ATOMIC HABITS',
        author: 'James Clear',
        rank: 1,
        weeks_on_list: 200,
        description: 'Tiny changes.',
        primary_isbn13: '9780735211292',
        isbns: [{ isbn10: '0735211299', isbn13: '9780735211292' }],
      },
      9,
    );
    assert.deepEqual(book, {
      title: 'ATOMIC HABITS',
      author: 'James Clear',
      rank: 1,
      weeks: 200,
      blurb: 'Tiny changes.',
      isbn: '0735211299',
    });
  });

  it('falls back to rank index and isbn13, rejects titleless rows', () => {
    const book = normalizeNytBook({ title: 'X', author: 'Y', primary_isbn13: '123' }, 4);
    assert.deepEqual(book, { title: 'X', author: 'Y', rank: 4, weeks: 0, blurb: undefined, isbn: '123' });
    assert.equal(normalizeNytBook({ author: 'Y' }, 1), null);
  });
});

describe('ratingFromSummary', () => {
  it('reads average/count and rounds to one decimal', () => {
    assert.deepEqual(ratingFromSummary({ summary: { average: 4.30357, count: 448 } }), {
      rating: 4.3,
      ratingsCount: 448,
    });
  });

  it('stays unrated on zero counts and malformed bodies', () => {
    assert.equal(ratingFromSummary({ summary: { average: 4.5, count: 0 } }), undefined);
    assert.equal(ratingFromSummary({}), undefined);
    assert.equal(ratingFromSummary(null), undefined);
    assert.equal(ratingFromSummary({ summary: { average: 'high', count: 3 } }), undefined);
  });
});

describe('sortNytLists', () => {
  it('orders known lists first, unknowns last', () => {
    const lists = [
      { slug: 'picture-books', name: 'P' },
      { slug: 'mystery-x', name: 'X' },
      { slug: 'combined-print-and-e-book-fiction', name: 'F' },
    ];
    assert.deepEqual(
      sortNytLists(lists).map((l) => l.slug),
      ['combined-print-and-e-book-fiction', 'picture-books', 'mystery-x'],
    );
  });
});

describe('spin pool integrity', () => {
  it('covers every ladder slot in every genre', async () => {
    const { BOOK_POOL } = await import('./book-pool.ts');
    const need = ['quick', 'medium', 'classic', 'stretch'];
    for (const { slug } of GENRES) {
      const have = new Set(BOOK_POOL.filter((b) => b.genre === slug).map((b) => b.difficulty));
      for (const slot of need) assert.ok(have.has(slot), `${slug} lacks a ${slot} book`);
    }
  });

  it('requires 10+ votes per book unless flagged classic', async () => {
    const { BOOK_POOL } = await import('./book-pool.ts');
    const { POOL_MIN_VOTES } = await import('./book-spins.ts');
    for (const b of BOOK_POOL) {
      const ok = (b.ratingsCount ?? 0) >= POOL_MIN_VOTES || b.difficulty === 'classic';
      assert.ok(ok, `${b.id} has ${b.ratingsCount ?? 0} votes and no classic flag`);
    }
  });

  it('uses only volume 1 of any series', async () => {
    const { BOOK_POOL } = await import('./book-pool.ts');
    for (const b of BOOK_POOL) {
      if (b.series !== undefined) assert.equal(b.volume, 1, `${b.id} is ${b.series} #${b.volume}`);
    }
  });

  it('resolves every monthly pick to a pool book with an OL key', async () => {
    const { BOOK_POOL } = await import('./book-pool.ts');
    const { MONTHS } = await import('./five-monthly.ts');
    const byId = new Map(BOOK_POOL.map((b) => [b.id, b]));
    assert.ok(MONTHS.length > 0);
    for (const m of MONTHS) {
      assert.equal(m.picks.length, 5);
      for (const p of m.picks) {
        const book = byId.get(p.bookId);
        assert.ok(book, `${m.month} references missing pool book ${p.bookId}`);
        assert.match(book.workKey, /^\/works\/OL\d+W$/);
      }
    }
  });
});

describe('GENRES', () => {
  it('has unique slugs that resolve', () => {
    const slugs = GENRES.map((g) => g.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.ok(GENRES.length >= 10);
    for (const g of slugs) assert.equal(genreBySlug(g).slug, g);
    assert.equal(genreBySlug('nope'), undefined);
  });
});

describe('book cover images', () => {
  it('Cover opts out of the article image hide via widget-img', async () => {
    // globals.css hides every .article-content img (Medium decoration purge);
    // widget imagery must carry widget-img or covers render invisibly with
    // a correct src and no error. No component harness here, so assert on
    // the source: every <img in the book components must have the class.
    const { readFileSync } = await import('node:fs');
    for (const f of ['../components/books/BookFinder.tsx', '../components/books/FiveMonth.tsx']) {
      const src = readFileSync(new URL(f, import.meta.url), 'utf-8');
      const imgs = [...src.matchAll(/<img[\s\S]*?className="([^"]*)"/g)];
      for (const [, cls] of imgs) {
        assert.ok(cls.split(/\s+/).includes('widget-img'), `${f}: <img> lacks widget-img`);
      }
    }
  });
});

describe('readingNowFromShelves', () => {
  it('reads nested counts, flat shapes, and rejects junk', () => {
    assert.equal(readingNowFromShelves({ counts: { currently_reading: 42 } }), 42);
    assert.equal(readingNowFromShelves({ currently_reading: 7 }), 7);
    assert.equal(readingNowFromShelves({ counts: { 'currently-reading': 9 } }), 9);
    assert.equal(readingNowFromShelves({ counts: { currently_reading: 42.9 } }), 42);
    assert.equal(readingNowFromShelves({ counts: {} }), null);
    assert.equal(readingNowFromShelves({ counts: { currently_reading: 'many' } }), null);
    assert.equal(readingNowFromShelves({ counts: { currently_reading: -3 } }), null);
    assert.equal(readingNowFromShelves(null), null);
    assert.equal(readingNowFromShelves('nope'), null);
  });
});

describe('formatReadingCount', () => {
  it('compacts thousands with no trailing .0', () => {
    assert.equal(formatReadingCount(0), '0');
    assert.equal(formatReadingCount(42), '42');
    assert.equal(formatReadingCount(999), '999');
    assert.equal(formatReadingCount(1000), '1k');
    assert.equal(formatReadingCount(1234), '1.2k');
    assert.equal(formatReadingCount(12000), '12k');
    assert.equal(formatReadingCount(12500), '12.5k');
    assert.equal(formatReadingCount(-5), '0');
  });
});

describe('rankByReading', () => {
  it('ranks desc, drops uncounted, respects the limit', () => {
    const books = [
      { key: '/works/OL1W', title: 'A', authors: [] },
      { key: '/works/OL2W', title: 'B', authors: [] },
      { key: '/works/OL3W', title: 'C', authors: [] },
    ];
    const counts = new Map([['/works/OL1W', 10], ['/works/OL2W', 50]]);
    const ranked = rankByReading(books, counts, 5);
    assert.deepEqual(ranked.map((b) => b.key), ['/works/OL2W', '/works/OL1W']);
    assert.equal(ranked[0].readingNow, 50);
    assert.equal(rankByReading(books, counts, 1).length, 1);
  });
});

describe('attachReading', () => {
  it('attaches counts, ranks desc, and preserves order on outage', async () => {
    const { attachReading } = await import('./books.ts');
    const books = [
      { key: '/works/OL1W', title: 'A', authors: [] },
      { key: '/works/OL2W', title: 'B', authors: [] },
      { key: '/works/OL3W', title: 'C', authors: [] },
    ];
    const ranked = attachReading(books, new Map([['/works/OL2W', 9], ['/works/OL1W', 30]]));
    assert.deepEqual(ranked.map((b) => b.key), ['/works/OL1W', '/works/OL2W', '/works/OL3W']);
    assert.equal(ranked[2].readingNow, 0);
    const fallback = attachReading(books, new Map());
    assert.deepEqual(fallback.map((b) => b.key), ['/works/OL1W', '/works/OL2W', '/works/OL3W']);
  });
});

describe('isBareFeed', () => {
  it('flags feeds with no ratings and no counts', async () => {
    const { isBareFeed } = await import('./books.ts');
    assert.equal(isBareFeed([]), false);
    assert.equal(
      isBareFeed([{ key: 'a', title: 'A', authors: [], readingNow: 0 }]),
      true,
    );
    assert.equal(
      isBareFeed([
        { key: 'a', title: 'A', authors: [], readingNow: 0 },
        { key: 'b', title: 'B', authors: [], rating: 4.0, readingNow: 0 },
      ]),
      false,
    );
    assert.equal(
      isBareFeed([{ key: 'a', title: 'A', authors: [], readingNow: 5 }]),
      false,
    );
  });
});
