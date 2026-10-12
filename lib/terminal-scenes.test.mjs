// Focused checks for the hero channels scenes. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  birthdayDraws,
  birthdayLine,
  blogLine,
  castLine,
  dayLabel,
  filterCommitEntries,
  flipRun,
  flipStep,
  formatCommit,
  formatFlip,
  formatHtopRow,
  formatMonty,
  HTOP_SEED,
  jitterHtop,
  marketLine,
  montyBatch,
  montyRun,
  pickMarketQuote,
  psRow,
} from './terminal-scenes.ts';

describe('htop', () => {
  it('jitters within bounds and starves the zombie', () => {
    const up = jitterHtop(HTOP_SEED, () => 0.999);
    assert.deepEqual(
      up.map((r) => r.cpu),
      [99, 46, 93, 5],
    );
    const down = jitterHtop(HTOP_SEED, () => 0);
    assert.deepEqual(
      down.map((r) => r.cpu),
      [92, 36, 83, 0],
    );
    assert.deepEqual(
      HTOP_SEED.map((r) => r.cpu),
      [97, 41, 88, 3],
    );
  });

  it('formats aligned rows with the zombie note', () => {
    assert.equal(formatHtopRow(HTOP_SEED[0]), '101  curiosity       97%');
    assert.equal(formatHtopRow(HTOP_SEED[3]), '412  reading_books   3%   (zombie)');
  });
});

describe('flip', () => {
  it('counts heads and guards the empty readout', () => {
    let s = { flips: 0, heads: 0 };
    assert.equal(formatFlip(s), 'flips: 0  heads: 0.0%');
    const seq = [0.1, 0.9, 0.4];
    for (const r of seq) s = flipStep(s, () => r);
    assert.deepEqual(s, { flips: 3, heads: 2 });
    assert.equal(formatFlip(s), 'flips: 3  heads: 66.7%');
  });
});

describe('birthday', () => {
  it('labels day-of-year as month/day', () => {
    assert.equal(dayLabel(0), 'Jan 1');
    assert.equal(dayLabel(31), 'Feb 1');
    assert.equal(dayLabel(364), 'Dec 31');
  });

  it('stops at the first repeat with the match', () => {
    const days = [10, 20, 10];
    let i = 0;
    const room = birthdayDraws(() => days[i++] / 365);
    assert.deepEqual(room.dates, ['Jan 11', 'Jan 21', 'Jan 11']);
    assert.equal(room.match, 'Jan 11');
  });
});

describe('montyhall', () => {
  it('switching wins exactly when first pick misses the car', () => {
    // Scripted pairs (car, pick): miss, hit, miss → 2 switch wins.
    const seq = [0, 1, 2, 2, 1, 0];
    let i = 0;
    const s = montyBatch({ runs: 0, switchWins: 0 }, 3, () => seq[i++] / 3);
    assert.deepEqual(s, { runs: 3, switchWins: 2 });
    assert.equal(formatMonty(s), 'runs: 3  switch wins: 66.7%');
    assert.equal(formatMonty({ runs: 0, switchWins: 0 }), 'runs: 0  switch wins: 0.0%');
  });
});

describe('one-shot sims', () => {
  it('runs N flips and birthdays to a single line', () => {
    assert.deepEqual(flipRun(4, () => 0.1), { flips: 4, heads: 4 });
    assert.equal(formatFlip(flipRun(0, () => 0.5)), 'flips: 0  heads: 0.0%');
    const room = birthdayDraws(() => 0.5, 23);
    assert.equal(room.dates.length, 2);
    assert.equal(birthdayLine(room, 23), `match on ${room.match} · 2 kids`);
    assert.equal(birthdayLine({ dates: ['Jan 1'], match: null }, 23), 'no match · 23 kids');
  });

  it('runs N monty rounds at once', () => {
    const seq = [0, 1, 2, 2, 1, 0];
    let i = 0;
    assert.deepEqual(montyRun(3, () => seq[i++] / 3), { runs: 3, switchWins: 2 });
  });

  it('rotates one brain process per cycle, jittered once', () => {
    assert.equal(psRow(0, () => 0.5).name, 'curiosity');
    assert.equal(psRow(1, () => 0.5).name, 'chess_training');
    const zombie = psRow(3, () => 0.999);
    assert.equal(zombie.name, 'reading_books');
    assert.ok(zombie.cpu <= 5);
    assert.equal(psRow(4, () => 0.5).name, 'curiosity');
  });
});

describe('data one-liners', () => {
  it('composes post, cast, and market lines', () => {
    assert.equal(blogLine('Why the sky is blue', '2d ago'), 'Why the sky is blue · 2d ago');
    assert.equal(blogLine('Why the sky is blue', null), 'Why the sky is blue');
    assert.equal(castLine('MrBallen', '28.9K/hr'), 'MrBallen · 28.9K/hr');
    assert.equal(castLine('MrBallen', null), null);
    assert.equal(marketLine('S&P 500', '+0.6%'), 'S&P 500 +0.6%');
  });

  it('leads with the S&P 500, else the first live quote', () => {
    const spx = { label: 'S&P 500', changePct: 0.006 };
    const btc = { label: 'Bitcoin', changePct: 0.02 };
    assert.equal(pickMarketQuote([btc, spx]), spx);
    assert.equal(pickMarketQuote([btc]), btc);
    assert.equal(pickMarketQuote([{ label: 'S&P 500', changePct: null }, btc]), btc);
    assert.equal(pickMarketQuote([]), null);
    assert.equal(pickMarketQuote([{ label: 'S&P 500', changePct: null }]), null);
  });
});

describe('git log', () => {
  it('skips scratch and merge noise, first line only, capped', () => {
    const entries = [
      { sha: 'a3f9c21', message: 'ship: birthday paradox' },
      { sha: 'b71e0d9', message: 'WIP: half done' },
      { sha: 'c04d118', message: 'tmp save' },
      { sha: 'd5e6f72', message: "Merge branch 'x'\n\nbody" },
      { sha: 'e7f8a94', message: 'fix: covers\n\nlong body here' },
    ];
    assert.deepEqual(
      filterCommitEntries(entries, 8).map((e) => e.sha),
      ['a3f9c21', 'e7f8a94'],
    );
    assert.deepEqual(filterCommitEntries(entries, 1).map((e) => e.sha), ['a3f9c21']);
    assert.equal(formatCommit('a3f9c21', 'ship: it\nbody'), 'a3f9c2  ship: it');
  });
});
