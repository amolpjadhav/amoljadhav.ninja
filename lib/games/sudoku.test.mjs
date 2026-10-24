// Tests for the Sudoku generator/solver. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  boxOf,
  candidates,
  colOf,
  countSolutions,
  digPuzzle,
  DIFFICULTY_GIVENS,
  fullSolution,
  generatePuzzle,
  isComplete,
  isValidPlacement,
  peers,
  rowOf,
  seededRand,
  solveRandom,
} from './sudoku.ts';

const EASY = [
  5, 3, 0, 0, 7, 0, 0, 0, 0,
  6, 0, 0, 1, 9, 5, 0, 0, 0,
  0, 9, 8, 0, 0, 0, 0, 6, 0,
  8, 0, 0, 0, 6, 0, 0, 0, 3,
  4, 0, 0, 8, 0, 3, 0, 0, 1,
  7, 0, 0, 0, 2, 0, 0, 0, 6,
  0, 6, 0, 0, 0, 0, 2, 8, 0,
  0, 0, 0, 4, 1, 9, 0, 0, 5,
  0, 0, 0, 0, 8, 0, 0, 7, 9,
];

describe('geometry', () => {
  it('maps rows, columns, and boxes', () => {
    assert.equal(rowOf(0), 0);
    assert.equal(rowOf(80), 8);
    assert.equal(colOf(10), 1);
    assert.equal(boxOf(0), 0);
    assert.equal(boxOf(40), 4);
    assert.equal(boxOf(80), 8);
  });

  it('peers share a row, column, or box', () => {
    const p = peers(40);
    assert.equal(p.length, 20);
    assert.ok(!p.includes(40));
    assert.ok(p.includes(41) && p.includes(31) && p.includes(50));
  });
});

describe('solver', () => {
  it('solves the classic example completely', () => {
    const solved = solveRandom(EASY, seededRand(7));
    assert.ok(solved);
    assert.ok(isComplete(solved));
  });

  it('counts exactly one solution for a valid puzzle', () => {
    assert.equal(countSolutions(EASY, 2), 1);
  });

  it('finds multiple solutions for an empty board', () => {
    assert.equal(countSolutions(new Array(81).fill(0), 2), 2);
  });

  it('rejects conflicting placements', () => {
    assert.equal(isValidPlacement(EASY, 2, 5), false); // 5 already in row/col/box
    assert.equal(isValidPlacement(EASY, 2, 1), true);
    assert.equal(isValidPlacement(EASY, 2, 0), false);
    assert.equal(isValidPlacement(EASY, 2, 10), false);
  });

  it('candidates exclude peer digits', () => {
    const c = candidates(EASY, 2);
    assert.ok(!c.includes(5) && !c.includes(3));
    assert.ok(c.includes(1));
    assert.deepEqual(candidates(EASY, 0), []);
  });
});

describe('generator', () => {
  it('deals complete valid solutions', () => {
    const s = fullSolution(seededRand(3));
    assert.equal(s.length, 81);
    assert.ok(isComplete(s));
  });

  for (const diff of ['easy', 'medium', 'hard']) {
    it(`${diff} digs to its givens with a unique solution`, () => {
      const { puzzle, solution, givens } = generatePuzzle(diff, seededRand(11));
      assert.equal(givens, DIFFICULTY_GIVENS[diff]);
      const filled = puzzle.filter((v) => v !== 0).length;
      assert.equal(filled, DIFFICULTY_GIVENS[diff]);
      assert.equal(countSolutions(puzzle, 2), 1);
      // Givens agree with the solution everywhere.
      for (let i = 0; i < 81; i += 1) {
        if (puzzle[i] !== 0) assert.equal(puzzle[i], solution[i]);
      }
      assert.ok(isComplete(solution));
    });
  }

  it('digPuzzle never breaks uniqueness', () => {
    const dug = digPuzzle(fullSolution(seededRand(5)), 30, seededRand(9));
    assert.equal(dug.filter((v) => v !== 0).length, 30);
    assert.equal(countSolutions(dug, 2), 1);
  });
});
