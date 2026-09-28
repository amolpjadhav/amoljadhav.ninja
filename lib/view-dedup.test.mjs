// Focused regression test for the once-per-day view count.
// Run: npm test   (Node's built-in runner — no test framework dependency.)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayString,
  normalizeStored,
  isCountedToday,
  withCounted,
} from './view-dedup.ts';

const TODAY = '2026-09-28';
const YESTERDAY = '2026-09-27';

describe('day rollover', () => {
  it('counts a slug last seen yesterday', () => {
    assert.equal(isCountedToday({ 'chess-notation': YESTERDAY }, 'chess-notation', TODAY), false);
  });

  it('skips a slug already counted today', () => {
    assert.equal(isCountedToday({ 'chess-notation': TODAY }, 'chess-notation', TODAY), true);
  });

  it('counts an unseen slug', () => {
    assert.equal(isCountedToday({}, 'chess-notation', TODAY), false);
  });

  it('withCounted stamps today without touching other slugs', () => {
    const next = withCounted({ other: YESTERDAY }, 'chess-notation', TODAY);
    assert.deepEqual(next, { other: YESTERDAY, 'chess-notation': TODAY });
  });

  it('dayString honors the local calendar across month boundaries', () => {
    assert.equal(dayString(0, new Date(2026, 8, 28, 12)), '2026-09-28');
    assert.equal(dayString(-1, new Date(2026, 8, 1, 12)), '2026-08-31');
  });
});

describe('v1 migration (once-ever slug list)', () => {
  it('maps old entries to the fallback day so each recounts once', () => {
    assert.deepEqual(
      normalizeStored(['chess-notation', 'italian-game'], YESTERDAY),
      { 'chess-notation': YESTERDAY, 'italian-game': YESTERDAY },
    );
  });

  it('drops non-string entries from old lists', () => {
    assert.deepEqual(normalizeStored(['chess-notation', 42, null], YESTERDAY), {
      'chess-notation': YESTERDAY,
    });
  });
});

describe('garbage input', () => {
  it('treats null, strings, and numbers as unseen', () => {
    for (const raw of [null, 'oops', 42, '["unclosed']) {
      assert.deepEqual(normalizeStored(raw, YESTERDAY), {});
    }
  });

  it('keeps valid maps but strips non-string values', () => {
    assert.deepEqual(normalizeStored({ a: TODAY, b: 7 }, YESTERDAY), { a: TODAY });
  });
});
