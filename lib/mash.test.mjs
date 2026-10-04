// Tests for the mash race simulation. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MASH_FINISH_X,
  MASH_PUSH,
  MASH_START_X,
  fmtSpeed,
  freshMash,
  mashCaption,
  mashPush,
  stepMash,
} from './mash.ts';

describe('mash race', () => {
  it('starts side by side at zero speed', () => {
    const s = freshMash();
    assert.equal(s.r.scooter.x, MASH_START_X);
    assert.equal(s.r.truck.x, MASH_START_X);
    assert.equal(s.r.scooter.v, 0);
    assert.equal(s.r.truck.finishT, null);
  });

  it('divides one mash by mass: 12 vs 3', () => {
    const s = freshMash();
    mashPush(s, { scooter: 1, truck: 4 });
    assert.equal(s.r.scooter.v, MASH_PUSH);
    assert.equal(s.r.truck.v, MASH_PUSH / 4);
    assert.equal(s.mashes, 1);
  });

  it('ignores mashes after both racers finish', () => {
    const s = freshMash();
    mashPush(s, { scooter: 1, truck: 4 });
    s.r.scooter.finishT = 5;
    s.r.truck.finishT = 9;
    mashPush(s, { scooter: 1, truck: 4 });
    assert.equal(s.mashes, 1);
    assert.equal(s.r.scooter.v, MASH_PUSH);
  });

  it('the lighter racer wins a fair race', () => {
    const s = freshMash();
    for (let i = 0; i < 20; i++) mashPush(s, { scooter: 1, truck: 4 });
    let guard = 0;
    while ((s.r.scooter.finishT === null || s.r.truck.finishT === null) && guard++ < 5000) {
      stepMash(s, 1 / 60);
    }
    assert.ok(s.r.scooter.finishT !== null && s.r.truck.finishT !== null);
    assert.ok(s.r.scooter.finishT < s.r.truck.finishT);
    assert.ok(s.r.scooter.x <= MASH_FINISH_X && s.r.truck.x <= MASH_FINISH_X);
  });

  it('loading the scooter flips the winner', () => {
    const s = freshMash();
    for (let i = 0; i < 20; i++) mashPush(s, { scooter: 5, truck: 4 });
    let guard = 0;
    while ((s.r.scooter.finishT === null || s.r.truck.finishT === null) && guard++ < 5000) {
      stepMash(s, 1 / 60);
    }
    assert.ok(s.r.truck.finishT < s.r.scooter.finishT);
  });
});

describe('mash captions', () => {
  it('calls the default win correctly', () => {
    const s = freshMash();
    s.r.scooter.finishT = 5;
    s.r.truck.finishT = 9;
    assert.match(mashCaption(s, { scooter: 1, truck: 4 }), /Scooter wins/);
  });

  it('calls a dead heat when masses match', () => {
    const s = freshMash();
    s.r.scooter.finishT = 5;
    s.r.truck.finishT = 5.05;
    assert.match(mashCaption(s, { scooter: 4, truck: 4 }), /Dead heat/);
  });

  it('invites a first mash before the start', () => {
    assert.match(mashCaption(freshMash(), { scooter: 1, truck: 4 }), /Who gets going faster/);
  });

  it('formats whole and fractional speed-ups', () => {
    assert.equal(fmtSpeed(4), '4');
    assert.equal(fmtSpeed(8 / 3), '2.7');
  });
});
