// Five Letters logic. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  dailyIndex,
  dailyWord,
  dayKey,
  formatCountdown,
  keyAction,
  msUntilPTMidnight,
  revealedAnswer,
  sanitizeGuessInput,
  scoreGuess,
} from './five-letters.ts';

describe('five-letters', () => {
  it('marks exact matches', () => {
    assert.deepEqual(scoreGuess('apple', 'apple'), ['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('marks misses and partials', () => {
    assert.deepEqual(scoreGuess('raise', 'apple'), ['absent', 'present', 'absent', 'absent', 'correct']);
  });

  it('caps duplicate letters at the answer count', () => {
    // Answer holds one E (last slot): only one guess E may light up.
    assert.deepEqual(scoreGuess('eerie', 'apple'), ['absent', 'absent', 'absent', 'absent', 'correct']);
    // P is nowhere in CREED: absent, not present.
    assert.deepEqual(scoreGuess('speed', 'creed'), ['absent', 'absent', 'correct', 'correct', 'correct']);
    // Answer holds two Es: the first two guess Es light, the third dies.
    assert.deepEqual(scoreGuess('eerie', 'creed'), ['present', 'present', 'present', 'absent', 'absent']);
  });

  it('prefers exact slot over elsewhere for duplicates', () => {
    assert.deepEqual(scoreGuess('allee', 'apple'), ['correct', 'present', 'absent', 'absent', 'correct']);
  });

  it('shares one daily word per timezone day', () => {
    const answers = ['apple', 'brave', 'crisp', 'dwarf', 'eagle'];
    // Same LA day (1am and 1pm PDT), different UTC hours: one word.
    const a = dailyWord(answers, new Date('2026-10-12T08:00:00Z'));
    const b = dailyWord(answers, new Date('2026-10-12T20:00:00Z'));
    assert.equal(a.key, '2026-10-12');
    assert.equal(a.key, b.key);
    assert.equal(a.word, b.word);
    assert.equal(a.num, b.num);
    // Next LA day: a (deterministically) different pick path.
    const c = dailyWord(answers, new Date('2026-10-13T08:00:00Z'));
    assert.equal(c.key, '2026-10-13');
    assert.equal(c.num, a.num + 1);
    assert.ok(answers.includes(c.word));
  });

  it('dayKey honors the given timezone', () => {
    const at = new Date('2026-10-12T06:00:00Z'); // 11pm Oct 11 in LA
    assert.equal(dayKey(at, 'America/Los_Angeles'), '2026-10-11');
    assert.equal(dayKey(at, 'UTC'), '2026-10-12');
  });

  it('maps physical keystrokes to game actions', () => {
    // No on-screen keyboard needed where a real one exists: letters,
    // Enter, and Backspace drive the game directly.
    assert.deepEqual(keyAction('a'), { type: 'letter', letter: 'a' });
    assert.deepEqual(keyAction('Z'), { type: 'letter', letter: 'z' });
    assert.deepEqual(keyAction('Enter'), { type: 'enter' });
    assert.deepEqual(keyAction('Backspace'), { type: 'back' });
    // Everything else is ignored, never typed into the guess.
    assert.equal(keyAction('1'), null);
    assert.equal(keyAction(' '), null);
    assert.equal(keyAction('ArrowLeft'), null);
    assert.equal(keyAction('Dead'), null);
    assert.equal(keyAction('ab'), null);
    assert.equal(keyAction(''), null);
  });

  it('reveals the answer only after a loss', () => {
    assert.equal(revealedAnswer('lost', 'aisle'), 'AISLE');
    assert.equal(revealedAnswer('playing', 'aisle'), null);
    assert.equal(revealedAnswer('won', 'aisle'), null);
  });

  it('dailyIndex is stable and in range', () => {
    assert.equal(dailyIndex(5, '2026-10-12'), dailyIndex(5, '2026-10-12'));
    const i = dailyIndex(1373, '2026-10-12');
    assert.ok(i >= 0 && i < 1373);
  });

  it('sanitizes raw keyboard text (IME-safe: value, not keyCode)', () => {
    assert.equal(sanitizeGuessInput('apple'), 'APPLE');
    assert.equal(sanitizeGuessInput('aPpLe'), 'APPLE');
    assert.equal(sanitizeGuessInput('abcdefg'), 'ABCDE');
    assert.equal(sanitizeGuessInput('a1! b-c'), 'ABC');
    assert.equal(sanitizeGuessInput(''), '');
    // Composed/autocorrect artifacts and digits vanish.
    assert.equal(sanitizeGuessInput('HÉLLO'), 'HLLO');
    assert.equal(sanitizeGuessInput('12'), '');
  });

  it('counts down to the next PT midnight', () => {
    // 6:22:10 before midnight PT, whatever the machine zone.
    const at = new Date('2026-10-24T06:37:50Z'); // 23:37:50 PDT previous day
    const ms = msUntilPTMidnight(at);
    assert.ok(ms > 0 && ms <= 86_400_000);
    assert.equal(formatCountdown(6 * 3_600_000 + 22 * 60_000 + 10_000), '6:22:10');
    assert.equal(formatCountdown(0), '0:00:00');
    assert.equal(formatCountdown(-5000), '0:00:00');
    // A full day out lands within the same window.
    assert.ok(msUntilPTMidnight(new Date('2026-01-15T12:00:00Z')) < 86_400_000);
  });
});
