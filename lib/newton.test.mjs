// Tests for the Newton playground helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { acceleration, passengerSlides, pushDistance, reactionForce } from './newton.ts';

describe('second law', () => {
  it('divides force by mass', () => {
    assert.equal(acceleration(10, 2), 5);
    assert.equal(acceleration(10, 5), 2);
  });

  it('no push means no roll', () => {
    assert.equal(pushDistance(0, 1), 0);
  });

  it('the loaded cart rolls a quarter as far on the same push', () => {
    assert.equal(pushDistance(8, 4), pushDistance(8, 1) / 4);
  });

  it('scales linearly with mash strength, so readouts stay honest', () => {
    assert.equal(pushDistance(16, 2), 2 * pushDistance(8, 2));
    assert.equal(pushDistance(8, 1), 16);
    assert.equal(pushDistance(8, 4), 4);
  });
});

describe('third law', () => {
  it('returns an equal and opposite push', () => {
    assert.equal(reactionForce(10), -10);
    assert.equal(reactionForce(-3), 3);
    assert.equal(reactionForce(10) + 10, 0);
  });
});

describe('first law', () => {
  it('only the unbelted passenger keeps sliding', () => {
    assert.equal(passengerSlides(false), true);
    assert.equal(passengerSlides(true), false);
  });
});
