// 2048 board logic. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canMove, maxTile, moveBoard } from './g2048.ts';

const row = (a, b, c, d) => [a, b, c, d, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

describe('g2048', () => {
  it('slides tiles without merging strangers', () => {
    const { board, gained, moved } = moveBoard(row(2, 0, 4, 0), 'left');
    assert.deepEqual(board.slice(0, 4), [2, 4, 0, 0]);
    assert.equal(gained, 0);
    assert.equal(moved, true);
  });

  it('merges each pair once per move', () => {
    // [2,2,4] -> [4,4], not [8]: the fresh 4 must rest.
    const r = moveBoard(row(2, 2, 4, 0), 'left');
    assert.deepEqual(r.board.slice(0, 4), [4, 4, 0, 0]);
    assert.equal(r.gained, 4);
    const q = moveBoard(row(2, 2, 2, 2), 'left');
    assert.deepEqual(q.board.slice(0, 4), [4, 4, 0, 0]);
    assert.equal(q.gained, 8);
  });

  it('merges toward every direction', () => {
    const down = moveBoard([2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'down');
    assert.equal(down.board[12], 4);
    const right = moveBoard(row(2, 2, 0, 0), 'right');
    assert.deepEqual(right.board.slice(0, 4), [0, 0, 0, 4]);
    const up = moveBoard([0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0], 'up');
    assert.equal(up.board[0], 4);
  });

  it('reports no-move boards', () => {
    const stuck = moveBoard(row(2, 4, 2, 4), 'left');
    assert.equal(stuck.moved, false);
  });

  it('detects life and death', () => {
    assert.equal(canMove(row(2, 4, 2, 4)), true); // empties remain
    const full = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
    assert.equal(canMove(full), false);
    full[0] = 4; // now two 4s touch
    assert.equal(canMove(full), true);
  });

  it('tracks the biggest tile', () => {
    assert.equal(maxTile(row(2, 128, 16, 4)), 128);
  });
});
