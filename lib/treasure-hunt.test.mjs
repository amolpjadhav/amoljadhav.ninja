// Tests for the treasure-hunt lock rules. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTERS,
  LIGHT_ROUNDS_GOAL,
  ODD_PUZZLE,
  ROOM_PUZZLES,
  isFinished,
  isOpen,
  lightsComplete,
  markDone,
  nextLights,
  normalizeProgress,
} from './treasure-hunt.ts';

describe('locks', () => {
  it('opens the meadow first, nothing else', () => {
    assert.equal(isOpen({}, 'meadow'), true);
    assert.equal(isOpen({}, 'gate'), false);
    assert.equal(isOpen({}, 'treasure'), false);
  });

  it('opens each chapter when all before it are done', () => {
    let p = {};
    for (const c of CHAPTERS) {
      assert.equal(isOpen(p, c), true);
      p = markDone(p, c);
    }
    assert.equal(isFinished(p), true);
  });

  it('a later chapter stays shut while an earlier one is open-but-unsolved', () => {
    const p = markDone({}, 'meadow');
    assert.equal(isOpen(p, 'gate'), true);
    assert.equal(isOpen(p, 'lanterns'), false);
  });

  it('markDone never unmarks', () => {
    const p = markDone(markDone({}, 'meadow'), 'gate');
    assert.deepEqual(markDone(p, 'meadow'), { meadow: true, gate: true });
  });
});

describe('room puzzles', () => {
  it('each has one answer among unique options, plus a hint', () => {
    for (const puzzle of ROOM_PUZZLES) {
      assert.ok(puzzle.options.includes(puzzle.answer));
      assert.equal(new Set(puzzle.options).size, puzzle.options.length);
      assert.ok(puzzle.hint.length > 0);
    }
  });

  it('the meadow hides exactly one odd item', () => {
    const counts = new Map();
    for (const item of ODD_PUZZLE.options) counts.set(item, (counts.get(item) ?? 0) + 1);
    assert.equal(counts.get(ODD_PUZZLE.answer), 1);
    assert.deepEqual([...counts.values()].sort(), [1, 3]);
    assert.ok(ODD_PUZZLE.hint.length > 0);
  });
});

describe('saved progress', () => {
  it('drops garbage and unknown chapters', () => {
    assert.deepEqual(normalizeProgress(null), {});
    assert.deepEqual(normalizeProgress(['lobby']), {});
    assert.deepEqual(normalizeProgress({ meadow: true, attic: true, gate: 'yes' }), { meadow: true });
  });
});

describe('ghost lights', () => {
  it('grows the sequence by one light per round', () => {
    const seq = nextLights([0, 2], 4, () => 0.99);
    assert.deepEqual(seq, [0, 2, 3]);
  });

  it('earns the key at the goal round', () => {
    assert.equal(lightsComplete([0], LIGHT_ROUNDS_GOAL), true);
    assert.equal(lightsComplete([0], LIGHT_ROUNDS_GOAL - 1), false);
  });
});
