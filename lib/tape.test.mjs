// Tape window transitions for the coordinate trainer. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildView, missedSquares, slideView } from './tape.ts';

describe('buildView', () => {
  it('deals current plus next from the queue', () => {
    assert.deepEqual(buildView(['f3', 'a8', 'd2', 'f8'], 3), {
      past: [],
      current: 'f3',
      next: ['a8', 'd2', 'f8'],
    });
  });

  it('slices next to count and guards empties', () => {
    assert.deepEqual(buildView(['f3', 'a8', 'd2', 'f8', 'b5'], 3).next, ['a8', 'd2', 'f8']);
    assert.deepEqual(buildView(['f3', 'a8'], 3).next, ['a8']);
    assert.deepEqual(buildView([], 3), { past: [], current: '', next: [] });
  });
});

describe('slideView', () => {
  const view = {
    past: [{ sq: 'd4', ok: true }],
    current: 'f3',
    next: ['a8', 'd2', 'f8'],
  };

  it('shifts one slot: result to past, first next promotes, incoming lands last', () => {
    assert.deepEqual(slideView(view, { sq: 'f3', ok: true }, 'c1', 3), {
      past: [
        { sq: 'd4', ok: true },
        { sq: 'f3', ok: true },
      ],
      current: 'a8',
      next: ['d2', 'f8', 'c1'],
    });
  });

  it('caps the past at three and keeps misses', () => {
    const full = {
      past: [
        { sq: 'd4', ok: true },
        { sq: 'g7', ok: false },
        { sq: 'e4', ok: true },
      ],
      current: 'f3',
      next: ['a8'],
    };
    const slid = slideView(full, { sq: 'f3', ok: false }, 'c1', 3);
    assert.deepEqual(slid.past, [
      { sq: 'g7', ok: false },
      { sq: 'e4', ok: true },
      { sq: 'f3', ok: false },
    ]);
    assert.equal(slid.current, 'a8');
  });

  it('holds current when no next tile exists', () => {
    const slid = slideView({ past: [], current: 'f3', next: [] }, { sq: 'f3', ok: true }, 'c1', 3);
    assert.equal(slid.current, 'f3');
    assert.deepEqual(slid.next, ['c1']);
  });
});

describe('missedSquares', () => {
  it('lists unique misses in first-miss order', () => {
    assert.deepEqual(
      missedSquares([
        { sq: 'd4', ok: true },
        { sq: 'g7', ok: false },
        { sq: 'f3', ok: true },
        { sq: 'g7', ok: false },
        { sq: 'b2', ok: false },
      ]),
      ['g7', 'b2'],
    );
    assert.deepEqual(missedSquares([{ sq: 'd4', ok: true }]), []);
  });
});
