// Guided recall nodes (stages, scheduling, move verdicts). Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_MS,
  decideUserMove,
  dueCount,
  dueNodeKeys,
  emptyNodeRecord,
  exitBanner,
  nextReviewLabel,
  recordNodeCorrect,
  recordNodeMiss,
  recordNodeUngraded,
  stageOf,
} from './trainer.ts';

describe('stages', () => {
  it('maps streaks to Learn / Practice / Test', () => {
    assert.equal(stageOf(0), 'learn');
    assert.equal(stageOf(1), 'learn');
    assert.equal(stageOf(2), 'practice');
    assert.equal(stageOf(3), 'practice');
    assert.equal(stageOf(4), 'test');
    assert.equal(stageOf(9), 'test');
  });
});

describe('recording', () => {
  it('Learn corrects build streak without scheduling a review', () => {
    let s = recordNodeCorrect({}, 'epd1', ['e4'], 1000);
    assert.equal(s.epd1.streak, 1);
    assert.equal(s.epd1.correct, 1);
    assert.equal(s.epd1.seen, 1);
    assert.equal(s.epd1.nextReview, 0);
    assert.deepEqual(s.epd1.path, ['e4']);
    s = recordNodeCorrect(s, 'epd1', ['e4', 'e5'], 2000);
    assert.equal(s.epd1.streak, 2);
    assert.equal(stageOf(s.epd1.streak), 'practice');
    assert.equal(s.epd1.nextReview, 0);
    // First recorded path wins.
    assert.deepEqual(s.epd1.path, ['e4']);
  });

  it('the fourth straight correct enters Test and reviews tomorrow', () => {
    let s = {};
    for (let i = 0; i < 3; i += 1) s = recordNodeCorrect(s, 'n', [], 1000);
    assert.equal(s.n.streak, 3);
    s = recordNodeCorrect(s, 'n', [], 5000);
    assert.equal(s.n.streak, 4);
    assert.equal(s.n.reviews, 1);
    assert.equal(s.n.nextReview, 5000 + DAY_MS);
  });

  it('Test corrects climb 1/3/7/14/30 days and cap at 30', () => {
    let s = {};
    for (let i = 0; i < 4; i += 1) s = recordNodeCorrect(s, 'n', [], 0);
    const expected = [1, 3, 7, 14, 30, 30];
    for (const [i, days] of expected.entries()) {
      if (i > 0) s = recordNodeCorrect(s, 'n', [], 0);
      assert.equal(s.n.nextReview, days * DAY_MS, `review ${i + 1}`);
    }
    assert.equal(s.n.reviews, 6);
  });

  it('a miss resets the ladder and requeues for tomorrow', () => {
    let s = recordNodeCorrect({}, 'n', [], 0);
    s = recordNodeCorrect(s, 'n', [], 0);
    s = recordNodeMiss(s, 'n', [], 9000);
    assert.equal(s.n.streak, 0);
    assert.equal(stageOf(s.n.streak), 'learn');
    assert.equal(s.n.nextReview, 9000 + DAY_MS);
    assert.equal(s.n.seen, 3);
  });

  it('a hinted correct counts as seen, never as correct', () => {
    let s = recordNodeCorrect({}, 'n', [], 0);
    s = recordNodeUngraded(s, 'n', [], 0);
    assert.equal(s.n.seen, 2);
    assert.equal(s.n.correct, 1);
    assert.equal(s.n.streak, 1);
    assert.equal(s.n.nextReview, 0);
  });
});

describe('decideUserMove', () => {
  const book = ['e2e4', 'd2d4'];
  it('main line is always correct', () => {
    assert.equal(
      decideUserMove({ bookUcis: book, mainUci: 'e2e4', playedUci: 'e2e4', acceptAnyBook: false, stage: 'test' }),
      'correct',
    );
  });
  it('another book move is correct only when accept-any is on', () => {
    const base = { bookUcis: book, mainUci: 'e2e4', playedUci: 'd2d4', stage: 'learn' };
    assert.equal(decideUserMove({ ...base, acceptAnyBook: true }), 'correct');
    assert.equal(decideUserMove({ ...base, acceptAnyBook: false }), 'branch');
  });
  it('off-book exits in Learn/Practice but snaps back in Test', () => {
    const base = { bookUcis: book, mainUci: 'e2e4', playedUci: 'e1e2', acceptAnyBook: false };
    assert.equal(decideUserMove({ ...base, stage: 'learn' }), 'offbook');
    assert.equal(decideUserMove({ ...base, stage: 'practice' }), 'offbook');
    assert.equal(decideUserMove({ ...base, stage: 'test' }), 'snapback');
  });
});

describe('exitBanner', () => {
  it('names the exit, the line, and the expected main line', () => {
    assert.equal(
      exitBanner('user-left', 'Italian Game', 3, 'Bc5'),
      'You left the book at move 3 — main line was Bc5',
    );
    assert.equal(
      exitBanner('user-left', 'Italian Game', 7, 'O-O', 'Be7'),
      'You left the book with Be7 — book was O-O',
    );
    assert.equal(
      exitBanner('playout', 'Giuoco Pianissimo', 5, null),
      'Opening complete: Giuoco Pianissimo — middlegame starts now',
    );
    assert.equal(
      exitBanner('line-ended', null, 8, null),
      'Opening complete: this line. Middlegame starts now',
    );
    assert.equal(
      exitBanner('line-ended', 'French Defense', 4, null, 'Bd3'),
      'Stockfish left the book with Bd3 — French Defense · middlegame starts now',
    );
  });
});

describe('due queue', () => {
  it('schedules oldest-first and ignores fresh nodes', () => {
    let s = recordNodeCorrect({}, 'fresh', [], 0);
    s = recordNodeMiss(s, 'due-late', [], 400);
    s = recordNodeMiss(s, 'due-early', [], 500);
    assert.deepEqual(dueNodeKeys(s, 500 + DAY_MS), ['due-late', 'due-early']);
    assert.equal(dueCount(s, 500 + DAY_MS), 2);
    // Fresh (unscheduled) nodes are never due.
    assert.deepEqual(dueNodeKeys({ fresh: s.fresh }, 10 * DAY_MS), []);
  });

  it('labels the next review date', () => {
    assert.equal(nextReviewLabel({}, 1000), null);
    let s = recordNodeMiss({}, 'n', [], 1000);
    assert.equal(nextReviewLabel(s, 1000), 'tomorrow');
    s = recordNodeMiss(s, 'm', [], 1000 - 3 * DAY_MS);
    void s;
    let t = {};
    for (let i = 0; i < 8; i += 1) t = recordNodeCorrect(t, 'n', [], 0);
    assert.equal(nextReviewLabel(t, 0), 'in 30 days');
  });

  it('emptyNodeRecord starts unseen and unscheduled', () => {
    assert.deepEqual(emptyNodeRecord(), {
      seen: 0,
      correct: 0,
      streak: 0,
      reviews: 0,
      lastSeen: 0,
      nextReview: 0,
      path: [],
    });
  });
});
