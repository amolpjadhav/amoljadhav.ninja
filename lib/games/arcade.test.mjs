// Arcade store: daily seeds, streaks, migration, share rows. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  codeBreakerShareRows,
  fiveLettersShareGrid,
  gameShareLinks,
  legacyBestOf,
  migrateLegacy,
  mulberry32,
  playUrl,
  ptDate,
  ptDayLabel,
  recordResult,
  seedFromDate,
} from './arcade.ts';

// In-memory localStorage behind a stubbed window (arcade.ts guards
// server use with typeof window, so this only affects these tests).
function stubWindow() {
  const mem = new Map();
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

describe('arcade daily seeds', () => {
  it('formats the PT date as YYYY-MM-DD', () => {
    // 2026-10-24 02:00 UTC is still Oct 23 in Los Angeles (PDT, UTC-7).
    assert.equal(ptDate(new Date('2026-10-24T02:00:00Z')), '2026-10-23');
    // 2026-10-24 08:00 UTC is Oct 24 in Los Angeles.
    assert.equal(ptDate(new Date('2026-10-24T08:00:00Z')), '2026-10-24');
  });

  it('seeds deterministically per date', () => {
    assert.equal(seedFromDate('2026-10-24'), seedFromDate('2026-10-24'));
    assert.notEqual(seedFromDate('2026-10-24'), seedFromDate('2026-10-25'));
  });

  it('deals the same daily sequence for the same seed', () => {
    const a = mulberry32(seedFromDate('2026-10-24'));
    const b = mulberry32(seedFromDate('2026-10-24'));
    assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  });
});

describe('arcade results and streaks', () => {
  it('tracks best and streaks; a loss resets the streak, never the best', () => {
    let store = {};
    store = recordResult(store, 'sudoku', 400, true);
    store = recordResult(store, 'sudoku', 380, true);
    assert.equal(store.sudoku.best, 380);
    assert.equal(store.sudoku.streak, 2);
    assert.equal(store.sudoku.maxStreak, 2);
    store = recordResult(store, 'sudoku', 999, false);
    assert.equal(store.sudoku.streak, 0);
    assert.equal(store.sudoku.best, 380);
    assert.equal(store.sudoku.maxStreak, 2);
  });

  it('takes the max when higher is better (2048 score)', () => {
    let store = {};
    store = recordResult(store, '2048', 1000, true, false);
    store = recordResult(store, '2048', 800, true, false);
    assert.equal(store['2048'].best, 1000);
  });

  it('reads legacy best shapes', () => {
    assert.equal(legacyBestOf(9200), 9200);
    assert.equal(legacyBestOf({ best: 4 }), 4);
    assert.equal(legacyBestOf({ played: 3, won: 2, streak: 1, best: 3 }), 3);
    assert.equal(legacyBestOf(null), null);
    assert.equal(legacyBestOf('nope'), null);
  });
});

describe('arcade share', () => {
  it('points every share at the play URL', () => {
    assert.equal(playUrl('code-breaker'), 'amoljadhav.ai/games/code-breaker');
    const links = gameShareLinks('chess', 'Chess');
    assert.equal(links.url, 'https://amoljadhav.ai/games/chess');
    assert.ok(links.text.includes('Chess'));
    assert.ok(links.xUrl.startsWith('https://twitter.com/intent/tweet?'));
    assert.ok(links.xUrl.includes(encodeURIComponent(links.url)));
  });

  it('renders Five Letters marks as an emoji grid', () => {
    const grid = fiveLettersShareGrid([
      ['correct', 'correct', 'correct', 'correct', 'correct'],
      ['absent', 'present', 'absent', 'absent', 'correct'],
    ]);
    assert.equal(grid, '🟩🟩🟩🟩🟩\n⬛🟨⬛⬛🟩');
  });

  it('labels the PT day for share text', () => {
    // 08:00 UTC is 01:00 PDT: still Oct 24 in Los Angeles.
    assert.equal(ptDayLabel(new Date('2026-10-24T08:00:00Z')), 'Oct 24');
  });

  it('migrates legacy bests and saves into games:v1 once', () => {
    const restore = stubWindow();
    try {
      const ls = globalThis.window.localStorage;
      ls.setItem('five-letters:stats:v1', JSON.stringify({ played: 5, won: 3, streak: 2, best: 4 }));
      ls.setItem('game-2048:best:v1', JSON.stringify(9200));
      ls.setItem('games:v1:sudoku', JSON.stringify({ puzzle: [0], grid: [0], secs: 12 }));
      const store = migrateLegacy();
      assert.equal(store['five-letters'].best, 4);
      assert.equal(store['2048'].best, 9200);
      assert.deepEqual(store.sudoku.saved, { puzzle: [0], grid: [0], secs: 12 });
      assert.equal(store.sudoku.best, null);
      // Persisted under the versioned key for later loads.
      assert.deepEqual(JSON.parse(ls.getItem('games:v1')), store);
    } finally {
      restore();
    }
  });

  it('renders Code Breaker rows as shapes plus black/white dots', () => {
    const rows = codeBreakerShareRows(
      [
        [0, 1, 2, 3],
        [0, 0, 0, 0],
      ],
      [
        { black: 1, white: 2 },
        { black: 0, white: 0 },
      ],
      ['●', '▲', '■', '★'],
    );
    assert.ok(rows.includes('⚫') && rows.includes('⚪'));
    assert.ok(rows.includes('·'));
  });
});
