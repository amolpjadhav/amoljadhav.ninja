// Code Breaker peg scoring. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackPegs, randomCode, scoreCode } from './code-breaker.ts';

describe('code-breaker', () => {
  it('scores a perfect crack', () => {
    assert.deepEqual(scoreCode([0, 1, 2, 3], [0, 1, 2, 3]), { black: 4, white: 0 });
  });

  it('separates blacks from whites', () => {
    assert.deepEqual(scoreCode([0, 1, 2, 3], [0, 2, 1, 5]), { black: 1, white: 2 });
  });

  it('caps duplicates at the code count', () => {
    // Code holds one 1: three guessed 1s score a single white.
    assert.deepEqual(scoreCode([0, 1, 2, 3], [1, 1, 1, 1]), { black: 1, white: 0 });
    assert.deepEqual(scoreCode([0, 1, 2, 3], [5, 1, 1, 1]), { black: 1, white: 0 });
    // Code holds two 2s: both score.
    assert.deepEqual(scoreCode([2, 2, 3, 4], [5, 2, 2, 5]), { black: 1, white: 1 });
  });

  it('always renders four feedback pegs: blacks, then whites, then misses', () => {
    assert.deepEqual(feedbackPegs({ black: 4, white: 0 }), ['black', 'black', 'black', 'black']);
    assert.deepEqual(feedbackPegs({ black: 1, white: 2 }), ['black', 'white', 'white', 'miss']);
    assert.deepEqual(feedbackPegs({ black: 0, white: 3 }), ['white', 'white', 'white', 'miss']);
    assert.deepEqual(feedbackPegs({ black: 0, white: 0 }), ['miss', 'miss', 'miss', 'miss']);
  });

  it('deals valid random codes', () => {
    for (let i = 0; i < 20; i += 1) {
      const code = randomCode();
      assert.equal(code.length, 4);
      assert.ok(code.every((c) => c >= 0 && c < 6));
    }
  });
});
