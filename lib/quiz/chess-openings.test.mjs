// Chess openings deck integrity (generated — see scripts/build-openings-quiz.mjs).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chessOpenings } from './chess-openings.ts';

describe('chess-openings bank', () => {
  it('ships only unique four-option questions with valid topics', () => {
    assert.ok(chessOpenings.questions.length >= 40);
    for (const q of chessOpenings.questions) {
      assert.equal(new Set(q.a).size, 4);
      assert.ok(chessOpenings.topics[q.topic], `unknown topic ${q.topic}`);
      assert.ok(q.ex.length > 0);
    }
    for (const key of Object.keys(chessOpenings.topics)) {
      assert.ok(chessOpenings.questions.some((q) => q.topic === key), `empty topic ${key}`);
    }
  });

  it('uses complete lines with no prefix-ambiguous options', () => {
    for (const q of chessOpenings.questions.filter((q) => q.q.startsWith('Which moves'))) {
      const [correct, ...rest] = q.a;
      assert.ok(q.ex.endsWith(correct), `${q.q}: answer differs from explanation line`);
      for (const d of rest) {
        assert.ok(
          !correct.startsWith(`${d} `) && !d.startsWith(`${correct} `),
          `${q.q}: distractor "${d}" is a prefix of (or extends) the answer`,
        );
      }
    }
  });
});
