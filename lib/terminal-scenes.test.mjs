// Hero terminal scene logic. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calProgressLine,
  drawFortune,
  factorLine,
  historyLine,
  pickHistoryEvents,
  pickScene,
  primeFactors,
  yyyymmdd,
} from './terminal-scenes.ts';

describe('fortunes', () => {
  const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'fortunes.json');
  const fortunes = JSON.parse(readFileSync(path, 'utf8'));

  it('ships 20+ linkable facts that fit two terminal lines', () => {
    assert.ok(Array.isArray(fortunes));
    assert.ok(fortunes.length >= 20);
    for (const f of fortunes) {
      assert.equal(typeof f.text, 'string');
      assert.ok(f.text.length > 0 && f.text.length <= 100, `fits 2 lines: ${f.text}`);
      if (f.link !== undefined) assert.match(f.link, /^\//);
    }
    assert.ok(fortunes.some((f) => typeof f.link === 'string'));
  });

  it('draws without repeats until the pool refills', () => {
    let remaining = [];
    const picks = new Set();
    for (let i = 0; i < 5; i++) {
      const d = drawFortune(remaining, 5, () => 0);
      remaining = d.remaining;
      picks.add(d.pick);
    }
    assert.equal(picks.size, 5);
    assert.deepEqual(remaining, []);
    // Exhausted pool refills and keeps dealing.
    const d = drawFortune(remaining, 5, () => 0.999);
    assert.equal(d.pick, 4);
    assert.equal(d.remaining.length, 4);
  });
});

describe('trivia', () => {
  const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'trivia.json');
  const trivia = JSON.parse(readFileSync(path, 'utf8'));

  it('ships human-scale facts that fit two terminal lines', () => {
    assert.ok(Array.isArray(trivia));
    assert.ok(trivia.length >= 12);
    for (const item of trivia) {
      assert.equal(typeof item.text, 'string');
      assert.ok(item.text.length > 0 && item.text.length <= 100, `fits 2 lines: ${item.text}`);
    }
    assert.ok(trivia.some((item) => item.text === 'Your heart beats roughly a billion times every 27 years.'));
  });
});

describe('scene picker', () => {
  it('never repeats a command within the previous three scenes', () => {
    const recent = [];
    for (let i = 0; i < 100; i++) {
      const pick = pickScene(recent, true, () => (i % 10) / 10);
      assert.ok(!recent.slice(-3).includes(pick), `${pick} repeated too soon at step ${i}`);
      recent.push(pick);
    }
  });

  it('omits history when no history events are available', () => {
    assert.notEqual(pickScene([], false, () => 0.999), 'history');
  });
});

describe('cal progress', () => {
  it('draws the year bar at fixed dates', () => {
    assert.equal(
      calProgressLine(new Date(2026, 0, 1).getTime()),
      '2026 ░░░░░░░░░░░░░░░░░░░░░░░░░ 0.0%',
    );
    // Mid-year shape only: DST shifts the exact fill by a block per zone.
    assert.match(calProgressLine(new Date(2026, 6, 2, 12).getTime()), /^2026 [█░]{25} 50\.0%$/);
    assert.equal(
      calProgressLine(new Date(2026, 11, 31, 23, 59, 59).getTime()),
      '2026 █████████████████████████ 100.0%',
    );
  });
});

describe('factor', () => {
  it('stamps today in local time', () => {
    assert.equal(yyyymmdd(new Date(2026, 9, 12, 15, 30).getTime()), '20261012');
    assert.equal(yyyymmdd(new Date(2026, 0, 5).getTime()), '20260105');
  });

  it('factors by trial division, verified example', () => {
    assert.deepEqual(primeFactors(12), [2, 2, 3]);
    assert.deepEqual(primeFactors(13), [13]);
    assert.deepEqual(primeFactors(20261012), [2, 2, 5065253]);
    assert.equal(
      primeFactors(20261012).reduce((a, b) => a * b, 1),
      20261012,
    );
    assert.equal(factorLine(20261012), '20261012: 2 2 5065253');
  });
});

describe('history', () => {
  it('keeps short readable events, drops the rest', () => {
    assert.deepEqual(
      pickHistoryEvents([
        { year: 1492, text: 'Columbus reaches the Bahamas' },
        { year: 1969, text: '  Apollo 11\nlands on the Moon  ' },
        { year: 2000, text: 'x'.repeat(71) },
        { year: '1066', text: 'Hastings' },
        { year: 1066, text: 42 },
        null,
        'nope',
      ]),
      [
        { year: 1492, text: 'Columbus reaches the Bahamas' },
        { year: 1969, text: 'Apollo 11 lands on the Moon' },
      ],
    );
    assert.deepEqual(pickHistoryEvents({ events: [] }), []);
    assert.deepEqual(pickHistoryEvents(null), []);
    assert.equal(historyLine({ year: 1492, text: 'Columbus reaches the Bahamas' }), '1492  Columbus reaches the Bahamas');
  });
});
