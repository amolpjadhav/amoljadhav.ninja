// Pocket Laws bank integrity: every topic ships Learn-more detail and
// every reference points at a real topic. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pocketLaws } from './pocket-laws.ts';

describe('pocket-laws bank', () => {
  it('covers 14 topics and 73 questions', () => {
    assert.equal(Object.keys(pocketLaws.topics).length, 14);
    assert.equal(pocketLaws.questions.length, 73);
  });

  it('gives every topic a Learn-more block with valid references', () => {
    for (const [key, t] of Object.entries(pocketLaws.topics)) {
      assert.ok(t.learnMore, `${key} needs learnMore`);
      assert.ok(t.learnMore.origin.length > 40, `${key} origin too short`);
      assert.ok(t.learnMore.wild.length >= 2, `${key} needs 2+ wild examples`);
      for (const c of t.confusableWith ?? []) {
        assert.ok(pocketLaws.topics[c], `${key} confusableWith unknown topic ${c}`);
      }
      const cw = t.learnMore.confusedWith;
      if (cw) {
        assert.ok(pocketLaws.topics[cw.topic], `${key} confusedWith unknown topic ${cw.topic}`);
        assert.ok(cw.note.length > 20, `${key} confusion note too short`);
      }
    }
  });

  it('keeps every question well-formed with first option correct', () => {
    for (const q of pocketLaws.questions) {
      assert.ok(pocketLaws.topics[q.topic], `unknown topic ${q.topic}`);
      assert.equal(q.a.length, 4);
      assert.ok(q.q.length > 0 && q.ex.length > 0);
      if (q.type) assert.equal(q.type, 'which');
    }
  });
});
