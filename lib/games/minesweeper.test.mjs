// Minesweeper board logic. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adjacency, chord, difficultyForMode, neighbors, placeMines, reveal } from './minesweeper.ts';

describe('minesweeper', () => {
  it('finds neighbors with edges respected', () => {
    assert.equal(neighbors(0, 9).length, 3); // corner
    assert.equal(neighbors(4, 9).length, 5); // top edge
    assert.equal(neighbors(40, 9).length, 8); // middle
  });

  it('keeps the first click and its ring mine-free', () => {
    for (let i = 0; i < 20; i += 1) {
      const mines = placeMines(9, 10, 40, Math.random);
      assert.equal(mines.size, 10);
      assert.ok(!mines.has(40));
      for (const nb of neighbors(40, 9)) assert.ok(!mines.has(nb));
    }
  });

  it('counts adjacency correctly', () => {
    const mines = new Set([0, 1, 9]);
    assert.equal(adjacency(10, mines, 9), 3);
    assert.equal(adjacency(2, mines, 9), 1);
    assert.equal(adjacency(80, mines, 9), 0);
  });

  it('floods through empty ground only', () => {
    const mines = new Set([80]); // lone mine, far corner
    const opened = reveal(new Set(), mines, new Set(), 0, 9);
    assert.ok(opened.has(0));
    assert.ok(opened.size > 70); // nearly the whole board
    assert.ok(!opened.has(80));
    // Clicking beside a mine opens just that cell.
    const single = reveal(new Set(), mines, new Set(), 79, 9);
    assert.deepEqual([...single], [79]);
  });

  it('never auto-opens flagged cells', () => {
    const mines = new Set([80]);
    const opened = reveal(new Set(), mines, new Set([1]), 0, 9);
    assert.ok(!opened.has(1));
  });

  it('chords only when flags satisfy the number', () => {
    // Cell 10 (row 1, col 1) touches mines 0 and 1: adjacency 2.
    const mines = new Set([0, 1]);
    const opened = new Set([10]);
    assert.equal(chord(opened, mines, new Set([0]), 10, 9), null); // 1 of 2 flags
    const after = chord(opened, mines, new Set([0, 1]), 10, 9);
    assert.ok(after !== null && after.size > opened.size);
    assert.ok(!after.has(0) && !after.has(1)); // flags stay covered
  });

  it('chord on a covered or empty cell is a no-op', () => {
    const mines = new Set([0, 1]);
    assert.equal(chord(new Set(), mines, new Set([0, 1]), 10, 9), null);
    const openEmpty = reveal(new Set(), new Set([80]), new Set(), 0, 9);
    assert.equal(chord(openEmpty, new Set([80]), new Set(), 0, 9), null);
  });

  it('supports rectangular expert boards', () => {
    assert.deepEqual(difficultyForMode('Beginner'), { cols: 9, rows: 9, mines: 10 });
    assert.deepEqual(difficultyForMode('Intermediate'), { cols: 16, rows: 16, mines: 40 });
    assert.deepEqual(difficultyForMode('Expert'), { cols: 30, rows: 16, mines: 99 });
    assert.equal(neighbors(0, 30, 16).length, 3); // corner still 3
    const mines = placeMines(30, 99, 0, Math.random, 16);
    assert.equal(mines.size, 99);
    assert.ok(!mines.has(0));
  });
});
