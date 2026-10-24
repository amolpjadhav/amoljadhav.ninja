// Hub stats reader: arcade-store shape, autosave fallback, formatting.
// Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatArcadeBest,
  ptDateString,
  readHubStore,
  saveHasProgress,
} from './hub-stats.ts';

function stubWindow(entries = {}) {
  const mem = new Map(Object.entries(entries));
  const prev = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => void mem.set(k, String(v)),
      removeItem: (k) => void mem.delete(k),
    },
  };
  return () => {
    if (prev === undefined) delete globalThis.window;
    else globalThis.window = prev;
  };
}

describe('formatArcadeBest', () => {
  it('formats seconds as m:ss for time games', () => {
    assert.equal(formatArcadeBest('sudoku', 402), '6:42');
    assert.equal(formatArcadeBest('minesweeper', 48), '0:48');
  });

  it('formats scores and guess counts per game', () => {
    assert.equal(formatArcadeBest('2048', 9920), '9,920');
    assert.equal(formatArcadeBest('five-letters', 3), '3/6');
    assert.equal(formatArcadeBest('code-breaker', 4), '4/10');
  });
});

describe('saveHasProgress', () => {
  it('ignores fresh deals, sees real play', () => {
    assert.equal(saveHasProgress('five-letters', { rows: [], marks: [] }), false);
    assert.equal(saveHasProgress('five-letters', { rows: ['ABOUT'] }), true);
    assert.equal(saveHasProgress('code-breaker', { guesses: [] }), false);
    assert.equal(saveHasProgress('minesweeper', { mines: [], open: [] }), false);
    assert.equal(saveHasProgress('minesweeper', { mines: [1], open: [5] }), true);
    const puzzle = new Array(81).fill(0);
    assert.equal(saveHasProgress('sudoku', { puzzle, grid: [...puzzle], secs: 0 }), false);
    assert.equal(saveHasProgress('sudoku', { puzzle, grid: [...puzzle], secs: 7 }), true);
    assert.equal(saveHasProgress('2048', { board: [2, 2], score: 0 }), true);
    assert.equal(saveHasProgress('chess', { moves: [] }), false);
    assert.equal(saveHasProgress('chess', { moves: ['e4'] }), true);
  });
});

describe('readHubStore', () => {
  it('reads arcade numeric bests, streaks, and today wins', () => {
    const today = ptDateString();
    const restore = stubWindow({
      'games:v1': JSON.stringify({
        sudoku: { history: [380], best: 380, streak: 2, maxStreak: 2, saved: null, lastWon: today },
        '2048': { history: [1000], best: 1000, streak: 1, maxStreak: 1, saved: null, lastWon: '2020-01-01' },
      }),
    });
    try {
      const store = readHubStore();
      assert.equal(store.perGame.sudoku.best, '6:20');
      assert.equal(store.perGame.sudoku.solvedToday, true);
      assert.equal(store.perGame['2048'].best, '1,000');
      assert.equal(store.perGame['2048'].solvedToday, undefined);
      assert.equal(store.streakDays, 2);
      assert.equal(store.dailyDone, 1);
    } finally {
      restore();
    }
  });

  it('marks in-progress games from their autosave keys', () => {
    const restore = stubWindow({
      'games:v1:sudoku': JSON.stringify({
        puzzle: [0],
        grid: [5],
        secs: 0,
        mistakes: 0,
      }),
    });
    try {
      const store = readHubStore();
      assert.equal(store.perGame.sudoku.inProgress, true);
    } finally {
      restore();
    }
  });

  it('keeps legacy string bests and lastSolvedDay markers', () => {
    const today = ptDateString();
    const restore = stubWindow({
      'games:v1': JSON.stringify({
        sudoku: { best: '6:42', streak: 5, lastSolvedDay: today },
      }),
    });
    try {
      const store = readHubStore();
      assert.equal(store.perGame.sudoku.best, '6:42');
      assert.equal(store.perGame.sudoku.solvedToday, true);
      assert.equal(store.streakDays, 5);
    } finally {
      restore();
    }
  });

  it('falls back to defaults on corrupt storage', () => {
    const restore = stubWindow({ 'games:v1': '{oops' });
    try {
      assert.deepEqual(readHubStore(), { perGame: {}, streakDays: 0, dailyDone: 0 });
    } finally {
      restore();
    }
  });
});
