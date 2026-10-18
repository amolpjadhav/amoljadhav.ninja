// Tests for the chess notation speed ranks. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RANK_GLYPH, rankFor } from './ranks.ts';

describe('rankFor 30s ladder', () => {
  const cases = [
    [0, 'Pawn', 'Knight', 10],
    [9, 'Pawn', 'Knight', 10],
    [10, 'Knight', 'Bishop', 15],
    [14, 'Knight', 'Bishop', 15],
    [15, 'Bishop', 'Rook', 20],
    [20, 'Rook', 'Queen', 25],
    [24, 'Rook', 'Queen', 25],
    [25, 'Queen', 'King', 30],
    [30, 'King', null, null],
    [64, 'King', null, null],
  ];
  for (const [score, rank, next, nextAt] of cases) {
    it(`scores ${score} as ${rank}`, () => {
      assert.deepEqual(rankFor(score, 30), { rank, next, nextAt });
    });
  }
});

describe('rankFor 60s ladder', () => {
  const cases = [
    [0, 'Pawn', 'Knight', 20],
    [19, 'Pawn', 'Knight', 20],
    [20, 'Knight', 'Bishop', 30],
    [39, 'Bishop', 'Rook', 40],
    [49, 'Rook', 'Queen', 50],
    [59, 'Queen', 'King', 60],
    [60, 'King', null, null],
  ];
  for (const [score, rank, next, nextAt] of cases) {
    it(`scores ${score} as ${rank}`, () => {
      assert.deepEqual(rankFor(score, 60), { rank, next, nextAt });
    });
  }
});

describe('rankFor 15s ladder', () => {
  const cases = [
    [0, 'Pawn', 'Knight', 5],
    [4, 'Pawn', 'Knight', 5],
    [5, 'Knight', 'Bishop', 8],
    [7, 'Knight', 'Bishop', 8],
    [8, 'Bishop', 'Rook', 10],
    [12, 'Rook', 'Queen', 13],
    [14, 'Queen', 'King', 15],
    [15, 'King', null, null],
  ];
  for (const [score, rank, next, nextAt] of cases) {
    it(`scores ${score} as ${rank}`, () => {
      assert.deepEqual(rankFor(score, 15), { rank, next, nextAt });
    });
  }
});

describe('rankFor edge cases', () => {
  it('returns null for durations without a ladder', () => {
    assert.equal(rankFor(20, 45), null);
    assert.equal(rankFor(20, 10), null);
  });
  it('returns null for invalid scores', () => {
    assert.equal(rankFor(-1, 30), null);
    assert.equal(rankFor(NaN, 30), null);
  });
  it('has a glyph for every rank', () => {
    for (const rank of ['Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King']) {
      assert.ok(RANK_GLYPH[rank]?.length === 1, rank);
    }
  });
});
