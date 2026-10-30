// Quiz engine: selection, Leitner progress, stats. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  blankProgress,
  categoryStats,
  isMastered,
  loadProgress,
  progressOf,
  qid,
  questionsForMode,
  recordAnswer,
  saveProgress,
  shuffle,
  smartPick,
} from './engine.ts';
const category = {
  id: 'test',
  title: 'Test',
  emoji: '🧪',
  description: 'test',
  source: 'https://example.com',
  topicLabel: 'topic',
  legacyStorageKey: 'test-quiz.v1',
  topics: { a: { name: 'A', short: 'aye' }, b: { name: 'B', short: 'bee' } },
  questions: [
    { topic: 'a', q: 'qa1', a: ['right', 'w1', 'w2', 'w3'], ex: 'ex1' },
    { topic: 'a', q: 'qa2', a: ['right', 'w1', 'w2', 'w3'], ex: 'ex2', type: 'which' },
    { topic: 'b', q: 'qb1', a: ['right', 'w1', 'w2', 'w3'], ex: 'ex3' },
  ],
};

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

describe('qid/progress', () => {
  it('ids by topic and text, defaults blank', () => {
    assert.equal(qid({ topic: 'a', q: 'qa1' }), 'a|qa1');
    assert.deepEqual(progressOf({}, { topic: 'a', q: 'qa1' }), blankProgress());
    assert.equal(isMastered(blankProgress()), false);
    assert.equal(isMastered({ streak: 3, seen: 3, wrong: 0, last: 0 }), true);
  });

  it('records answers without mutating input', () => {
    const before = {};
    const afterRight = recordAnswer(before, { topic: 'a', q: 'qa1' }, true, 1000);
    assert.deepEqual(before, {});
    assert.deepEqual(afterRight['a|qa1'], { streak: 1, seen: 1, wrong: 0, last: 1000 });
    const afterWrong = recordAnswer(afterRight, { topic: 'a', q: 'qa1' }, false, 2000);
    assert.deepEqual(afterWrong['a|qa1'], { streak: 0, seen: 2, wrong: 1, last: 2000 });
  });
});

describe('persistence', () => {
  it('round-trips progress and survives corrupt storage', () => {
    const restore = stubWindow({ 'test-quiz.v1': JSON.stringify({ 'a|qa1': { streak: 2, seen: 2, wrong: 0, last: 5 } }) });
    try {
      const loaded = loadProgress('test-quiz.v1');
      assert.equal(loaded['a|qa1'].streak, 2);
      saveProgress('test-quiz.v1', recordAnswer(loaded, { topic: 'b', q: 'qb1' }, true, 9));
      assert.equal(JSON.parse(globalThis.window.localStorage.getItem('test-quiz.v1'))['b|qb1'].streak, 1);
    } finally {
      restore();
    }
    const bad = stubWindow({ 'test-quiz.v1': '{oops' });
    try {
      assert.deepEqual(loadProgress('test-quiz.v1'), {});
    } finally {
      bad();
    }
  });
});

describe('selection', () => {
  it('shuffles deterministically with a seeded rand', () => {
    const rand = () => 0;
    assert.deepEqual(shuffle([1, 2, 3], rand), [2, 3, 1]);
    assert.deepEqual(shuffle([], rand), []);
  });

  it('smart-picks unseen first', () => {
    const seen = recordAnswer(recordAnswer(recordAnswer({}, { topic: 'a', q: 'qa1' }, true, 1), { topic: 'a', q: 'qa1' }, true, 2), { topic: 'a', q: 'qa1' }, true, 3);
    // qa1 has streak 3: it scores worst and falls out of a top-2 pick.
    const picked = smartPick(category.questions, seen, 2, () => 0, 10_000_000);
    assert.deepEqual(picked.map((q) => q.q).sort(), ['qa2', 'qb1']);
  });

  it('builds each mode list', () => {
    const all = questionsForMode(category, {}, 'all', undefined, 20, () => 0);
    assert.equal(all.length, 3);
    const which = questionsForMode(category, {}, 'which');
    assert.deepEqual(which.map((q) => q.q), ['qa2']);
    const drill = questionsForMode(category, {}, 'drill', 'b', 20, () => 0);
    assert.deepEqual(drill.map((q) => q.q), ['qb1']);
    assert.deepEqual(questionsForMode(category, {}, 'drill'), []);
    const prog = recordAnswer({}, { topic: 'a', q: 'qa1' }, false, 1);
    assert.deepEqual(questionsForMode(category, prog, 'mistakes', undefined, 20, () => 0).map((q) => q.q), ['qa1']);
    assert.deepEqual(questionsForMode(category, {}, 'mistakes'), []);
    assert.deepEqual(questionsForMode(category, {}, 'flash'), []);
  });
});

describe('categoryStats', () => {
  it('tallies seen, mastered, accuracy, per-topic bars', () => {
    let prog = {};
    prog = recordAnswer(recordAnswer(recordAnswer(prog, { topic: 'a', q: 'qa1' }, true, 1), { topic: 'a', q: 'qa1' }, true, 2), { topic: 'a', q: 'qa1' }, true, 3);
    prog = recordAnswer(prog, { topic: 'b', q: 'qb1' }, false, 4);
    const stats = categoryStats(category, prog);
    assert.equal(stats.total, 3);
    assert.equal(stats.seen, 2);
    assert.equal(stats.mastered, 1);
    assert.equal(stats.accuracy, 75);
    assert.deepEqual(stats.perTopic, [
      { key: 'a', mastered: 1, total: 2, pct: 50 },
      { key: 'b', mastered: 0, total: 1, pct: 0 },
    ]);
    assert.equal(categoryStats(category, {}).accuracy, null);
  });
});
