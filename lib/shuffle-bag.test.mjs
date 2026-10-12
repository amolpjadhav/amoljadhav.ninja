// Regression tests for shuffle-bag dealing. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createShuffleBag, drawAvoiding, drawFromBag } from './shuffle-bag.ts';

const pool8 = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'];

function drawCycle(pool, n, except) {
  const bag = createShuffleBag();
  return Array.from({ length: n }, () => drawFromBag(bag, pool, except));
}

describe('drawFromBag', () => {
  it('deals every square exactly once before any repeat', () => {
    const draws = drawCycle(pool8, pool8.length);
    assert.deepEqual([...draws].sort(), [...pool8].sort());
  });

  it('refills with a fresh cycle after exhaustion', () => {
    const draws = drawCycle(pool8, pool8.length + 1);
    assert.ok(pool8.includes(draws[pool8.length]));
    assert.equal(new Set(draws.slice(0, pool8.length)).size, pool8.length);
  });

  it('avoids the previous target whenever an alternative exists', () => {
    for (let i = 0; i < 30; i++) {
      const [first] = drawCycle(pool8.slice(0, 4), 1, pool8[0]);
      assert.notEqual(first, pool8[0]);
    }
  });

  it('returns the only square when the pool has one item', () => {
    assert.deepEqual(drawCycle(['e4'], 3, 'e4'), ['e4', 'e4', 'e4']);
  });

  it('re-keys when the drill pool changes mid-cycle', () => {
    const bag = createShuffleBag();
    drawFromBag(bag, pool8.slice(0, 4));
    drawFromBag(bag, pool8.slice(0, 4));
    const rest = Array.from({ length: 4 }, () => drawFromBag(bag, pool8.slice(4)));
    assert.deepEqual([...rest].sort(), pool8.slice(4).sort());
  });

  it('throws on an empty pool instead of hanging', () => {
    assert.throws(() => drawFromBag(createShuffleBag(), []), /empty pool/);
  });
});

describe('drawAvoiding', () => {
  it('still deals every square exactly once per cycle', () => {
    const bag = createShuffleBag();
    // Reject half the pool so the reinsert path is definitely exercised.
    const out = Array.from({ length: 8 }, () =>
      drawAvoiding(bag, pool8, undefined, (s) => ['a1', 'b2', 'c3', 'd4'].includes(s)),
    );
    assert.deepEqual([...out].sort(), [...pool8].sort());
  });

  it('returns a pool member when everything is avoided', () => {
    const s = drawAvoiding(createShuffleBag(), pool8, undefined, () => true);
    assert.ok(pool8.includes(s));
  });

  it('keeps the except guarantee', () => {
    const bag = createShuffleBag();
    for (let i = 0; i < 4; i++) {
      assert.notEqual(drawAvoiding(bag, pool8, 'a1', () => false), 'a1');
    }
  });
});
