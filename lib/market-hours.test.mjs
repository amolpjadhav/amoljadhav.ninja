// Tests for the US equity session calendar. Run: npm test.
//
// Instants are written in UTC and asserted in ET, so every case also proves
// the DST conversion: 13:30Z is the opening bell in October (EDT, -4) but
// 14:30Z is the bell in January (EST, -5).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  closeMinute,
  etClock,
  formatSessionDate,
  holidaysFor,
  isTradingDay,
  lastSession,
  marketPhase,
  marketStatus,
  quoteTtlSeconds,
} from './market-hours.ts';

const at = (iso) => new Date(iso);

describe('etClock', () => {
  it('converts a UTC instant to ET wall clock during EDT', () => {
    assert.deepEqual(etClock(at('2026-10-13T15:04:00Z')), {
      year: 2026,
      month: 10,
      day: 13,
      weekday: 2,
      minutes: 11 * 60 + 4,
    });
  });

  it('converts during EST, where the same wall clock is an hour later in UTC', () => {
    assert.deepEqual(etClock(at('2026-01-13T16:04:00Z')), {
      year: 2026,
      month: 1,
      day: 13,
      weekday: 2,
      minutes: 11 * 60 + 4,
    });
  });

  it('reports ET midnight as minute 0, not minute 1440', () => {
    assert.equal(etClock(at('2026-10-13T04:00:00Z')).minutes, 0);
    assert.equal(etClock(at('2026-10-13T04:00:00Z')).day, 13);
  });

  it('keeps the ET date when UTC has already rolled over', () => {
    const clock = etClock(at('2026-10-14T02:30:00Z'));
    assert.equal(clock.day, 13);
    assert.equal(clock.minutes, 22 * 60 + 30);
  });
});

describe('holidaysFor', () => {
  it('matches the published NYSE calendar for 2025', () => {
    assert.deepEqual(
      [...holidaysFor(2025)],
      ['1-1', '1-20', '2-17', '4-18', '5-26', '6-19', '7-4', '9-1', '11-27', '12-25'],
    );
  });

  it('moves a Saturday holiday back to Friday (July 4, 2026)', () => {
    const h = holidaysFor(2026);
    assert.ok(h.has('7-3'), 'July 4 2026 is a Saturday, so the NYSE closes Friday July 3');
    assert.ok(!h.has('7-4'));
  });

  it('moves a Sunday holiday forward to Monday (July 4, 2027)', () => {
    const h = holidaysFor(2027);
    assert.ok(h.has('7-5'));
    assert.ok(!h.has('7-4'));
  });

  it('trades the Friday before a Saturday New Years Day', () => {
    // 2028 opens on a Saturday: unlike every other holiday, the NYSE does
    // not close the preceding Friday for it.
    assert.equal(new Date(Date.UTC(2028, 0, 1)).getUTCDay(), 6);
    assert.ok(!holidaysFor(2027).has('12-31'));
    assert.ok(!holidaysFor(2028).has('1-1'));
  });

  it('tracks Good Friday, the one holiday with no fixed date', () => {
    assert.ok(holidaysFor(2025).has('4-18')); // Easter Apr 20
    assert.ok(holidaysFor(2026).has('4-3')); // Easter Apr 5
    assert.ok(holidaysFor(2027).has('3-26')); // Easter Mar 28
  });
});

describe('isTradingDay', () => {
  it('rejects weekends and holidays, accepts ordinary weekdays', () => {
    assert.equal(isTradingDay({ year: 2026, month: 10, day: 13 }), true);
    assert.equal(isTradingDay({ year: 2026, month: 10, day: 17 }), false); // Saturday
    assert.equal(isTradingDay({ year: 2026, month: 11, day: 26 }), false); // Thanksgiving
  });
});

describe('closeMinute', () => {
  it('closes at 4:00 on a normal session', () => {
    assert.equal(closeMinute({ year: 2026, month: 10, day: 13 }), 16 * 60);
  });

  it('closes at 1:00 the Friday after Thanksgiving', () => {
    assert.equal(closeMinute({ year: 2026, month: 11, day: 27 }), 13 * 60);
  });

  it('closes at 1:00 on a midweek Christmas Eve', () => {
    assert.equal(closeMinute({ year: 2025, month: 12, day: 24 }), 13 * 60); // Wednesday
  });

  it('leaves a Friday Christmas Eve alone, since it is the holiday itself', () => {
    assert.equal(closeMinute({ year: 2027, month: 12, day: 24 }), 16 * 60);
    assert.ok(holidaysFor(2027).has('12-24'));
  });
});

describe('marketPhase', () => {
  it('opens at 9:30 ET, not 9:29', () => {
    assert.equal(marketPhase(at('2026-10-13T13:29:00Z')), 'pre');
    assert.equal(marketPhase(at('2026-10-13T13:30:00Z')), 'open');
  });

  it('closes at 4:00 ET', () => {
    assert.equal(marketPhase(at('2026-10-13T19:59:00Z')), 'open');
    assert.equal(marketPhase(at('2026-10-13T20:00:00Z')), 'post');
  });

  it('honors the 1:00 close on a half day', () => {
    assert.equal(marketPhase(at('2026-11-27T17:59:00Z')), 'open');
    assert.equal(marketPhase(at('2026-11-27T18:00:00Z')), 'post');
  });

  it('never calls a weekend or a holiday open', () => {
    assert.equal(marketPhase(at('2026-10-17T15:00:00Z')), 'weekend');
    assert.equal(marketPhase(at('2026-11-26T15:00:00Z')), 'holiday');
  });
});

describe('lastSession', () => {
  it('is today once the bell has rung', () => {
    assert.deepEqual(lastSession(at('2026-10-13T15:00:00Z')), { year: 2026, month: 10, day: 13 });
  });

  it('is yesterday before the bell', () => {
    assert.deepEqual(lastSession(at('2026-10-13T12:00:00Z')), { year: 2026, month: 10, day: 12 });
  });

  it('skips back over a weekend', () => {
    assert.deepEqual(lastSession(at('2026-10-18T15:00:00Z')), { year: 2026, month: 10, day: 16 });
  });

  it('skips back over a holiday and the weekend behind it', () => {
    // Good Friday Apr 3 2026 — the last session is Thursday Apr 2.
    assert.deepEqual(lastSession(at('2026-04-05T15:00:00Z')), { year: 2026, month: 4, day: 2 });
  });

  it('crosses a year boundary', () => {
    assert.deepEqual(lastSession(at('2026-01-01T15:00:00Z')), { year: 2025, month: 12, day: 31 });
  });
});

describe('marketStatus', () => {
  it('reads live during the session', () => {
    assert.deepEqual(marketStatus(at('2026-10-13T15:00:00Z')), {
      live: true,
      text: 'Live · 15 min delay',
      endLabel: 'now',
    });
  });

  it('names the last session when closed', () => {
    assert.deepEqual(marketStatus(at('2026-10-17T15:00:00Z')), {
      live: false,
      text: 'Closed · Oct 16',
      endLabel: '4:00',
    });
  });

  it('labels the chart 1:00 when the last session was a half day', () => {
    assert.deepEqual(marketStatus(at('2026-11-28T15:00:00Z')), {
      live: false,
      text: 'Closed · Nov 27',
      endLabel: '1:00',
    });
  });
});

describe('formatSessionDate', () => {
  it('prints a short month and an unpadded day', () => {
    assert.equal(formatSessionDate({ year: 2026, month: 10, day: 6 }), 'Oct 6');
    assert.equal(formatSessionDate({ year: 2026, month: 12, day: 31 }), 'Dec 31');
  });
});

describe('quoteTtlSeconds', () => {
  it('is seconds while the market is open', () => {
    // Wed Oct 21 2026 15:00 UTC = 11:00 ET, mid-session.
    assert.equal(quoteTtlSeconds(Date.parse('2026-10-21T15:00:00Z')), 15);
  });

  it('caches hard when closed: pre, post, weekend, holiday', () => {
    // 08:00 ET pre-market, 17:00 ET post-close, Saturday, Thanksgiving.
    assert.equal(quoteTtlSeconds(Date.parse('2026-10-21T12:00:00Z')), 3600);
    assert.equal(quoteTtlSeconds(Date.parse('2026-10-21T21:00:00Z')), 3600);
    assert.equal(quoteTtlSeconds(Date.parse('2026-10-24T15:00:00Z')), 3600);
    assert.equal(quoteTtlSeconds(Date.parse('2026-11-26T15:00:00Z')), 3600);
  });
});
