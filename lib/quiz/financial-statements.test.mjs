// Financial Statements bank integrity: every topic ships Learn-more detail
// and every reference points at a real topic. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { financialStatements } from './financial-statements.ts';

describe('financial-statements bank', () => {
  it('covers 4 topics and 31 questions', () => {
    assert.equal(Object.keys(financialStatements.topics).length, 4);
    assert.equal(financialStatements.questions.length, 31);
  });

  it('gives every topic a Learn-more block with valid references', () => {
    for (const [key, t] of Object.entries(financialStatements.topics)) {
      assert.ok(t.learnMore, `${key} needs learnMore`);
      assert.ok(t.learnMore.origin.length > 40, `${key} origin too short`);
      assert.ok(t.learnMore.wild.length >= 2, `${key} needs 2+ wild examples`);
      for (const c of t.confusableWith ?? []) {
        assert.ok(financialStatements.topics[c], `${key} confusableWith unknown topic ${c}`);
      }
      const cw = t.learnMore.confusedWith;
      if (cw) {
        assert.ok(financialStatements.topics[cw.topic], `${key} confusedWith unknown topic ${cw.topic}`);
        assert.ok(cw.note.length > 20, `${key} confusion note too short`);
      }
    }
  });

  it('keeps every question well-formed with first option correct', () => {
    for (const q of financialStatements.questions) {
      assert.ok(financialStatements.topics[q.topic], `unknown topic ${q.topic}`);
      assert.equal(q.a.length, 4);
      assert.ok(q.q.length > 0 && q.ex.length > 0);
      if (q.type) assert.equal(q.type, 'which');
    }
  });

  it('covers every topic with 4+ questions', () => {
    const counts = new Map();
    for (const q of financialStatements.questions) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
    for (const key of Object.keys(financialStatements.topics)) {
      assert.ok((counts.get(key) ?? 0) >= 4, `${key} has fewer than 4 questions`);
    }
  });
});
