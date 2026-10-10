// Tests for the birthday-paradox helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dayLabel, matchChance, median, pairCount } from './birthday.ts';

describe('pairCount', () => {
  it('counts handshakes: n(n-1)/2', () => {
    assert.equal(pairCount(0), 0);
    assert.equal(pairCount(3), 3);
    assert.equal(pairCount(4), 6);
    assert.equal(pairCount(23), 253);
    assert.equal(pairCount(100), 4950);
  });
});

describe('matchChance', () => {
  it('matches the textbook ladder', () => {
    assert.ok(Math.abs(matchChance(0) - 0) < 1e-12);
    assert.ok(Math.abs(matchChance(1) - 0) < 1e-12);
    assert.ok(Math.abs(matchChance(10) - 0.11695) < 0.0001);
    assert.ok(Math.abs(matchChance(22) - 0.4757) < 0.0001);
    assert.ok(Math.abs(matchChance(23) - 0.5073) < 0.0001);
    assert.ok(Math.abs(matchChance(50) - 0.9704) < 0.0001);
    assert.ok(Math.abs(matchChance(70) - 0.9992) < 0.0001);
  });

  it('hits certainty past 365 people (pigeonhole)', () => {
    assert.equal(matchChance(366), 1);
    assert.equal(matchChance(500), 1);
  });
});

describe('median', () => {
  it('takes the middle of odd and even lists', () => {
    assert.equal(median([19]), 19);
    assert.equal(median([31, 19, 22]), 22);
    assert.equal(median([19, 31]), 25);
  });
});

describe('dayLabel', () => {
  it('labels the first, a middle, and the last day', () => {
    assert.equal(dayLabel(0), 'January 1');
    assert.equal(dayLabel(31 + 28 + 13), 'March 14');
    assert.equal(dayLabel(364), 'December 31');
  });
});
