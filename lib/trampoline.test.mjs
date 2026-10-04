// Tests for the trampoline spring simulation. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TRAMPOLINE_GRAVITY,
  forcePoints,
  restState,
  stepTrampoline,
  trampolineCaption,
} from './trampoline.ts';

const DT = 0.002;

function drop(height, steps, pushing = false) {
  let s = { ...restState(), hb: height, v: 0, N: 0, depth: 0 };
  for (let i = 0; i < steps; i++) s = stepTrampoline(s, DT, pushing);
  return s;
}

describe('trampoline physics', () => {
  it('rests in equilibrium: the mat matches gravity', () => {
    const s = stepTrampoline(restState(), DT, false);
    assert.ok(Math.abs(s.N - TRAMPOLINE_GRAVITY) < TRAMPOLINE_GRAVITY * 0.05);
    assert.ok(Math.abs(s.hb - restState().hb) < 0.5);
  });

  it('falls freely in the air: no pair, gravity only', () => {
    // 0.2 s of falling: 18 px down, still far above the mat.
    const s = drop(180, 100);
    assert.equal(s.N, 0);
    assert.equal(s.depth, 0);
    assert.ok(Math.abs(s.v - -TRAMPOLINE_GRAVITY * 0.2) < 5);
  });

  it('the contact force never goes negative over a whole drop', () => {
    let s = { ...restState(), hb: 180, v: 0, N: 0, depth: 0 };
    for (let i = 0; i < 3000; i++) {
      s = stepTrampoline(s, DT, false);
      assert.ok(s.N >= 0 && Number.isFinite(s.N));
      assert.ok(Number.isFinite(s.hb) && Number.isFinite(s.v));
    }
  });

  it('lands, records a bounce, and settles without pumping', () => {
    const s = drop(180, 20000);
    assert.ok(s.best > 0);
    assert.ok(Math.abs(s.v) < 30);
  });

  it('gravity is pinned at 100 points', () => {
    assert.equal(forcePoints(TRAMPOLINE_GRAVITY), 100);
  });
});

describe('trampoline captions', () => {
  it('names gravity as the only push mid-flight', () => {
    assert.match(trampolineCaption(drop(180, 100)), /gravity/i);
  });

  it('names the matched pushes at rest', () => {
    assert.match(trampolineCaption(restState()), /just as hard/);
  });
});
