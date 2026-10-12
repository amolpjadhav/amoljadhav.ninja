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
  primeFactors,
  uptimeLine,
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

describe('uptime', () => {
  it('counts Earth kilometres with locale grouping', () => {
    assert.equal(uptimeLine(0, 1000), 'since you landed: Earth moved 29 km around the Sun');
    assert.equal(uptimeLine(0, 62000), 'since you landed: Earth moved 1,847 km around the Sun');
    assert.equal(uptimeLine(5000, 1000), 'since you landed: Earth moved 0 km around the Sun');
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
