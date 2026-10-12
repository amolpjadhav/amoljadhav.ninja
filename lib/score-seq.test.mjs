// Score-card sequence codec. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSeq, parseSeq, seqMissed, MAX_SEQ } from './score-seq.ts';

describe('score-seq', () => {
  it('round-trips a tape', () => {
    const tape = [
      { sq: 'b2', ok: true },
      { sq: 'e5', ok: false },
      { sq: 'a8', ok: true },
    ];
    assert.equal(encodeSeq(tape), 'b21e50a81');
    assert.deepEqual(parseSeq('b21e50a81'), tape);
  });

  it('rejects garbage without throwing', () => {
    assert.deepEqual(parseSeq(null), []);
    assert.deepEqual(parseSeq(''), []);
    assert.deepEqual(parseSeq('zzz!!!'), []);
    // Incomplete tail is dropped, valid chunks kept.
    assert.deepEqual(parseSeq('b21e5'), [{ sq: 'b2', ok: true }]);
  });

  it('caps long tapes', () => {
    const tape = Array.from({ length: 500 }, (_, i) => ({
      sq: `${'abcdefgh'[i % 8]}${(i % 8) + 1}`,
      ok: true,
    }));
    assert.equal(parseSeq(encodeSeq(tape)).length, MAX_SEQ);
  });

  it('lists missed squares in order, deduped', () => {
    const tape = [
      { sq: 'c5', ok: false },
      { sq: 'b2', ok: true },
      { sq: 'c5', ok: false },
      { sq: 'c2', ok: false },
    ];
    assert.deepEqual(seqMissed(tape), ['c5', 'c2']);
  });
});
