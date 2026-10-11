// Regression tests for shuffle-bag dealing. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createShuffleBag, drawFromBag, peekFromBag } from './shuffle-bag.ts';

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

describe('peekFromBag', () => {
  it('predicts exactly the next n draws without consuming', () => {
    const bag = createShuffleBag();
    const first = drawFromBag(bag, pool8);
    const peeked = peekFromBag(bag, pool8, first, 5);
    const drawn = [];
    let prev = first;
    for (let i = 0; i < 5; i++) {
      prev = drawFromBag(bag, pool8, prev);
      drawn.push(prev);
    }
    assert.deepEqual(drawn, peeked);
  });

  it('peeks across refill boundaries with valid members', () => {
    const bag = createShuffleBag();
    const peeked = peekFromBag(bag, ['e4', 'd5'], undefined, 5);
    assert.equal(peeked.length, 5);
    assert.ok(peeked.every((s) => s === 'e4' || s === 'd5'));
    // Nothing consumed: a fresh draw cycle still yields both squares once.
    const cycle = [drawFromBag(bag, ['e4', 'd5']), drawFromBag(bag, ['e4', 'd5'])];
    assert.deepEqual([...cycle].sort(), ['d5', 'e4']);
  });

  it('never previews the current square when alternatives exist', () => {
    for (let i = 0; i < 20; i++) {
      const bag = createShuffleBag();
      const current = drawFromBag(bag, pool8);
      const [next] = peekFromBag(bag, pool8, current, 3);
      assert.notEqual(next, current);
    }
  });

  it('returns empty for empty peeks and empty pools', () => {
    assert.deepEqual(peekFromBag(createShuffleBag(), pool8, undefined, 0), []);
    assert.deepEqual(peekFromBag(createShuffleBag(), [], undefined, 3), []);
  });
});
