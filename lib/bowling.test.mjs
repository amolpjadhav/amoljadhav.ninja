// Tests for the bowling rolling simulation. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BOWL_BALL_R,
  BOWL_CUSHION_X,
  BOWL_HEAD_PIN_X,
  bowlingCaption,
  freshBowState,
  stepBowling,
} from './bowling.ts';

const DT = 0.004;

function rollingNoPins(x, v) {
  // A lane with no pins, so only friction and the cushion can stop the ball.
  return {
    ...freshBowState(),
    pins: [],
    pinsHit: true,
    x,
    v,
    started: true,
    t: 0,
  };
}

describe('bowling physics', () => {
  it('starts at rest with the whole rack standing', () => {
    const s = freshBowState();
    assert.equal(s.v, 0);
    assert.equal(s.started, false);
    assert.equal(s.pins.length, 10);
    assert.ok(s.pins.every((p) => !p.gone));
  });

  it('holding accelerates, then the hand lets go at the foul line', () => {
    const s = freshBowState();
    // 300 steps: 150 pushing to the foul line, 150 coasting — still short of
    // the cushion, so nothing else can touch the speed.
    for (let i = 0; i < 300; i++) stepBowling(s, DT, true, 0);
    assert.equal(s.started, true);
    assert.ok(s.x > 180 && s.x < 608);
    // 600/s^2 for 0.6 s, then coasting frictionless at whatever it reached.
    assert.ok(Math.abs(s.v - 360) < 1);
  });

  it('the pins push back: the ball loses half its speed on contact', () => {
    const s = {
      ...freshBowState(),
      x: BOWL_HEAD_PIN_X - BOWL_BALL_R - 1,
      v: 200,
      started: true,
      t: 0,
    };
    stepBowling(s, DT, false, 0);
    assert.equal(s.pinsHit, true);
    assert.equal(s.v, 100);
    assert.ok(s.pins.every((p) => p.vx > 0));
  });

  it('the back cushion stops the ball cold and says so', () => {
    const s = {
      ...freshBowState(),
      pins: [],
      pinsHit: true,
      x: BOWL_CUSHION_X - BOWL_BALL_R - 0.5,
      v: 200,
      started: true,
      t: 0,
    };
    stepBowling(s, DT, false, 0);
    assert.equal(s.stoppedBy, 'cushion');
    assert.equal(s.v, 0);
  });

  it('carpet friction stops the ball and takes the credit', () => {
    const s = rollingNoPins(200, 300);
    for (let i = 0; i < 2000; i++) stepBowling(s, DT, false, 120);
    assert.equal(s.stoppedBy, 'friction');
    assert.equal(s.v, 0);
  });

  it('magic-smooth never friction-stops: only the cushion can end it', () => {
    const s = rollingNoPins(200, 300);
    for (let i = 0; i < 2000; i++) stepBowling(s, DT, false, 0);
    assert.notEqual(s.stoppedBy, 'friction');
    assert.equal(s.stoppedBy, 'cushion');
  });
});

describe('bowling captions', () => {
  it('starts with sitting still', () => {
    assert.match(bowlingCaption(freshBowState(), 0, 'Magic-smooth'), /sitting still/i);
  });

  it('names the surface that won on a friction stop', () => {
    const s = rollingNoPins(200, 300);
    for (let i = 0; i < 2000; i++) stepBowling(s, DT, false, 120);
    assert.match(bowlingCaption(s, 120, 'Carpet'), /carpet/i);
  });

  it('names the flat line while coasting on magic-smooth', () => {
    const s = rollingNoPins(200, 300);
    stepBowling(s, DT, false, 0);
    assert.match(bowlingCaption(s, 0, 'Magic-smooth'), /flat line/);
  });
});
