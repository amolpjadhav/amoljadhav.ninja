// Tests for the five-a-month spin engine (pure, seeded, deterministic).
// Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assignLadder,
  badgeFor,
  drawGenres,
  hashSeed,
  mulberry32,
  randomSeed,
  poolMeanRating,
  spinFive,
  spinFromSeed,
  swapPick,
  weightedRating,
} from './book-spins.ts';

const GENRES = ['fantasy', 'mystery', 'kids', 'horror', 'business', 'romance'];

function book(id, genre, difficulty) {
  return { id, genre, title: id, author: 'A', year: 2000, pages: 100, difficulty, hook: '', workKey: `/works/${id}` };
}

const POOL = [
  ...['fantasy', 'mystery', 'kids', 'horror', 'business', 'romance'].flatMap((g) => [
    book(`${g}-quick`, g, 'quick'),
    book(`${g}-medium-a`, g, 'medium'),
    book(`${g}-medium-b`, g, 'medium'),
    book(`${g}-classic`, g, 'classic'),
    book(`${g}-stretch`, g, 'stretch'),
  ]),
];

describe('seeded rng', () => {
  it('reproduces the same stream for the same seed', () => {
    const a = mulberry32(hashSeed('k3x9'));
    const b = mulberry32(hashSeed('k3x9'));
    assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
    assert.notEqual(mulberry32(hashSeed('k3x9'))(), mulberry32(hashSeed('other'))());
  });

  it('mints 4-char base36 seeds', () => {
    assert.match(randomSeed(() => 0.5), /^[0-9a-z]{4}$/);
  });
});

describe('drawGenres', () => {
  it('draws from the unused bag and records them used', () => {
    const { drawn, usedAfter, refilled } = drawGenres(GENRES, ['fantasy'], 5, mulberry32(1));
    assert.equal(drawn.length, 5);
    assert.ok(!drawn.includes('fantasy'));
    assert.equal(new Set(drawn).size, 5);
    assert.equal(usedAfter.length, 6);
    assert.equal(refilled, false);
  });

  it('refills the bag when fewer remain than drawn', () => {
    const { drawn, usedAfter, refilled } = drawGenres(
      GENRES,
      ['fantasy', 'mystery', 'kids', 'horror', 'business'],
      5,
      mulberry32(1),
    );
    assert.equal(drawn.length, 5);
    assert.equal(refilled, true);
    assert.deepEqual([...usedAfter].sort(), [...drawn].sort());
  });
});

describe('assignLadder', () => {
  it('deals one quick, two medium, one classic, one stretch', () => {
    const slotted = assignLadder(GENRES.slice(0, 5), mulberry32(7));
    assert.deepEqual(
      slotted.map((s) => s.slot).sort(),
      ['classic', 'medium', 'medium', 'quick', 'stretch'],
    );
    assert.deepEqual(
      slotted.map((s) => s.genre).sort(),
      GENRES.slice(0, 5).sort(),
    );
  });
});

describe('spinFive', () => {
  it('matches difficulty per genre without repeating books', () => {
    const slotted = assignLadder(GENRES.slice(0, 5), mulberry32(3));
    const picks = spinFive(POOL, slotted, mulberry32(3));
    assert.equal(picks.length, 5);
    assert.equal(new Set(picks.map((p) => p.book.id)).size, 5);
    for (const p of picks) {
      assert.equal(p.book.genre, p.genre);
      assert.equal(p.book.difficulty, p.slot);
    }
  });

  it('falls back gracefully when a difficulty is missing', () => {
    const thin = POOL.filter((b) => !(b.genre === 'kids' && b.difficulty === 'stretch'));
    const picks = spinFive(POOL.length ? thin : thin, [{ genre: 'kids', slot: 'stretch' }], mulberry32(1));
    assert.equal(picks[0].genre, 'kids');
    assert.equal(new Set(picks.map((p) => p.book.id)).size, 1);
  });
});

describe('spinFromSeed', () => {
  it('is deterministic per seed and varies across seeds', () => {
    const a = spinFromSeed(POOL, GENRES, 'k3x9');
    const b = spinFromSeed(POOL, GENRES, 'k3x9');
    const c = spinFromSeed(POOL, GENRES, 'zzzz');
    assert.deepEqual(
      a.picks.map((p) => p.book.id),
      b.picks.map((p) => p.book.id),
    );
    assert.notDeepEqual(
      a.picks.map((p) => p.book.id),
      c.picks.map((p) => p.book.id),
    );
  });
});

describe('swapPick', () => {
  it('rerolls exactly one slot to a different book', () => {
    const { picks } = spinFromSeed(POOL, GENRES, 'k3x9');
    const next = swapPick(POOL, picks, 2, mulberry32(99));
    assert.equal(next.length, 5);
    for (const i of [0, 1, 3, 4]) assert.equal(next[i].book.id, picks[i].book.id);
    assert.notEqual(next[2].book.id, picks[2].book.id);
    assert.equal(next[2].genre, picks[2].genre);
    assert.equal(new Set(next.map((p) => p.book.id)).size, 5);
  });
});

describe('badgeFor', () => {
  it('labels every slot', () => {
    assert.equal(badgeFor('quick'), 'Weekend read');
    assert.equal(badgeFor('medium'), "Week's read");
    assert.equal(badgeFor('classic'), 'Classic');
    assert.equal(badgeFor('stretch'), 'Slow burn');
  });
});

describe('weightedRating', () => {
  it('pulls thin books toward the pool mean (IMDb-style)', () => {
    // 5.0 from 8 votes must NOT beat 4.2 from 5000 when the mean is 4.0.
    const thin = weightedRating(5.0, 8, 4.0);
    const proven = weightedRating(4.2, 5000, 4.0);
    assert.ok(Math.abs(thin - 4.138) < 0.001, `thin=${thin}`);
    assert.ok(Math.abs(proven - 4.198) < 0.001, `proven=${proven}`);
    assert.ok(thin < proven);
  });

  it('converges to the raw average as votes grow', () => {
    assert.ok(Math.abs(weightedRating(4.5, 100000, 4.0) - 4.5) < 0.001);
  });

  it('poolMeanRating averages rated pool books', () => {
    const mean = poolMeanRating([
      { rating: 4.0, ratingsCount: 10 },
      { rating: 5.0, ratingsCount: 20 },
      { ratingsCount: 0 },
    ]);
    assert.equal(mean, 4.5);
  });
});
