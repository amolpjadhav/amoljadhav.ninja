import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { markRings, nudgeLabels } from './guide-geometry.ts';

describe('markRings', () => {
  it('demotes the shorter same-origin same-direction move (e7e5 hides e7e6)', () => {
    assert.deepEqual(
      markRings([
        { from: 'e7', to: 'e5' },
        { from: 'c7', to: 'c5' },
        { from: 'e7', to: 'e6' },
        { from: 'c7', to: 'c6' },
      ]),
      [false, false, true, true],
    );
  });

  it('keeps divergent moves as arrows', () => {
    assert.deepEqual(
      markRings([
        { from: 'e2', to: 'e4' },
        { from: 'd2', to: 'd4' },
        { from: 'g1', to: 'f3' },
      ]),
      [false, false, false],
    );
  });

  it('never demotes knights, even from a shared origin', () => {
    assert.deepEqual(
      markRings([
        { from: 'g1', to: 'f3' },
        { from: 'g1', to: 'h3' },
      ]),
      [false, false],
    );
  });

  it('demotes different-origin majority overlaps (e2e4 vs e3e5 stays: tie is not > half)', () => {
    // Overlap is exactly half of the shorter: both keep arrows.
    assert.deepEqual(
      markRings([
        { from: 'e2', to: 'e4' },
        { from: 'e3', to: 'e5' },
      ]),
      [false, false],
    );
  });

  it('most popular wins the group even when shorter', () => {
    assert.deepEqual(
      markRings([
        { from: 'f1', to: 'c4' },
        { from: 'f1', to: 'b5' },
      ]),
      [false, true],
    );
  });
});

describe('nudgeLabels', () => {
  it('separates stacked pills and clamps them inside the board', () => {
    const out = nudgeLabels([
      { x: 100, y: 100, w: 40, h: 20 },
      { x: 110, y: 105, w: 40, h: 20 },
      { x: 790, y: 790, w: 40, h: 20 },
    ]);
    assert.equal(out[1].y, 124);
    assert.ok(out[2].x + out[2].w <= 800);
    assert.ok(out[2].y + out[2].h <= 800);
  });
});
