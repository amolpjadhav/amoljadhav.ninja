// Tests for the earnings calendar helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { beatVerdict, cleanTickers, countBeats, countDisagreements, earningsCardImageUrl, earningsSharePageUrl, earningsXIntentUrl, etTimeLabel, formatEps, formatMoneyShort, logoUrl, nextEarningsFor, parseEarnings, pickMove, popularity, previewShareText, quarterTip, rankDay, reportDateLabel, reportTimingLabel, resultShareText, shortName, toggleInList, upcomingAfterClose, visibleRows } from './earnings.ts';

const now = Date.parse('2026-10-20T12:00:00.000Z');

describe('parseEarnings', () => {
  it('keeps good rows with estimates', () => {
    const [e] = parseEarnings({
      earningsCalendar: [
        { symbol: 'nvda', date: '2026-10-28', hour: 'amc', quarter: 3, year: 2026, epsEstimate: 1.02, revenueEstimate: 50000000 },
      ],
    });
    assert.equal(e.symbol, 'NVDA');
    assert.equal(e.date, '2026-10-28');
    assert.equal(e.hour, 'amc');
    assert.equal(e.epsEstimate, 1.02);
    assert.equal(e.revenueEstimate, 50000000);
  });

  it('degrades unknown hours and null estimates instead of dropping rows', () => {
    const [e] = parseEarnings({
      earningsCalendar: [{ symbol: 'AAPL', date: '2026-10-29', hour: 'midday', epsEstimate: null, revenueEstimate: null }],
    });
    assert.equal(e.hour, '');
    assert.equal(e.epsEstimate, null);
    assert.equal(e.revenueEstimate, null);
  });

  it('drops rows without a date or symbol, and non-array payloads', () => {
    assert.deepEqual(parseEarnings({ earningsCalendar: [{ symbol: 'X', hour: 'bmo' }, { date: '2026-10-29' }, null, 7] }), []);
    assert.deepEqual(parseEarnings({}), []);
    assert.deepEqual(parseEarnings(null), []);
  });

  it('sorts by date, then symbol', () => {
    const syms = parseEarnings({
      earningsCalendar: [
        { symbol: 'B', date: '2026-10-22' },
        { symbol: 'A', date: '2026-10-22' },
        { symbol: 'C', date: '2026-10-21' },
      ],
    }).map((e) => e.symbol);
    assert.deepEqual(syms, ['C', 'A', 'B']);
  });
});

describe('nextEarningsFor', () => {
  const events = parseEarnings({
    earningsCalendar: [
      { symbol: 'NVDA', date: '2026-10-15' },
      { symbol: 'NVDA', date: '2026-10-28', hour: 'amc', epsEstimate: 1.02 },
      { symbol: 'NVDA', date: '2026-11-20' },
      { symbol: 'AAPL', date: '2026-10-29' },
    ],
  });

  it('picks the nearest future date and ignores the past', () => {
    assert.equal(nextEarningsFor(events, 'nvda', now)?.date, '2026-10-28');
  });

  it('returns null when nothing is scheduled', () => {
    assert.equal(nextEarningsFor(events, 'TSLA', now), null);
    assert.equal(nextEarningsFor([], 'NVDA', now), null);
  });
});

describe('countBeats', () => {
  it('counts actual > estimate over recent quarters, skipping gaps', () => {
    assert.deepEqual(countBeats([
      { actual: 1.5, estimate: 1.4 },
      { actual: 1.2, estimate: 1.3 },
      { actual: null, estimate: 1.0 },
      { actual: 0.9, estimate: null },
    ]), { wins: 1, total: 2 });
  });

  it('returns null when nothing is comparable', () => {
    assert.equal(countBeats([]), null);
    assert.equal(countBeats([{ actual: null, estimate: null }]), null);
    assert.equal(countBeats(null), null);
  });
});

describe('popularity', () => {
  it('ranks big blue-chips above unknown small caps, and never NaNs on nulls', () => {
    const big = { marketCap: 3e12, blueChip: true };
    const small = { marketCap: 5e7, blueChip: false };
    const unknown = { marketCap: null, blueChip: false };
    assert.ok(popularity(big) > popularity(small));
    assert.ok(popularity(small) > popularity(unknown));
    assert.ok(Number.isFinite(popularity(unknown)));
  });
});

describe('rankDay', () => {
  it('sorts biggest-first without mutating the input', () => {
    const rows = [
      { symbol: 'ZZZ', marketCap: 1e8, blueChip: false },
      { symbol: 'AAA', marketCap: 2e12, blueChip: true },
    ];
    assert.deepEqual(rankDay(rows).map((r) => r.symbol), ['AAA', 'ZZZ']);
    assert.equal(rows[0].symbol, 'ZZZ');
  });
});

describe('upcomingAfterClose', () => {
  // Oct 21 2026 is a Wednesday. Noon ET = before the 4pm cutoff.
  const noonEt = Date.parse('2026-10-21T16:00:00.000Z');
  const lateEt = Date.parse('2026-10-21T21:00:00.000Z');
  const events = parseEarnings({
    earningsCalendar: [
      { symbol: 'ZZZZ', date: '2026-10-21', hour: 'amc' },
      { symbol: 'TSLA', date: '2026-10-21', hour: 'amc' },
      { symbol: 'ABT', date: '2026-10-21', hour: 'bmo' },
      { symbol: 'IBM', date: '2026-10-22', hour: 'amc' },
    ],
  });

  it('names tonight before the close, blue-chips first', () => {
    assert.deepEqual(upcomingAfterClose(events, noonEt), {
      label: 'Tonight after the close',
      tickers: ['TSLA', 'ZZZZ'],
      total: 2,
    });
  });

  it('rolls to the next reporting day after the close', () => {
    const got = upcomingAfterClose(events, lateEt);
    assert.equal(got?.label, 'Thursday after the close');
    assert.deepEqual(got?.tickers, ['IBM']);
  });

  it('returns null when nothing is coming', () => {
    assert.equal(upcomingAfterClose([], noonEt), null);
    assert.equal(upcomingAfterClose(events, Date.parse('2026-10-23T21:00:00.000Z')), null);
  });
});

describe('watchlist helpers', () => {
  it('toggles tickers case-insensitively, most recent first', () => {
    assert.deepEqual(toggleInList([], 'nvda'), ['NVDA']);
    assert.deepEqual(toggleInList(['NVDA'], 'nvda'), []);
    assert.deepEqual(toggleInList(['AAPL'], 'TSLA'), ['TSLA', 'AAPL']);
    assert.deepEqual(toggleInList(['AAPL'], '  '), ['AAPL']);
    assert.deepEqual(cleanTickers(['nvda', 'NVDA', 7, null, ' tsla ']), ['NVDA', 'TSLA']);
    assert.deepEqual(cleanTickers('nope'), []);
  });
});

describe('surprise-based beats', () => {
  it('prefers the provider surprise over naive actual > estimate', () => {
    // GAAP actual below an adjusted estimate, but the provider calls it a beat.
    assert.deepEqual(countBeats([{ actual: 1.2, estimate: 1.3, surprise: 0.05 }]), { wins: 1, total: 1 });
    assert.deepEqual(countBeats([{ actual: 1.4, estimate: 1.3, surprise: -0.02 }]), { wins: 0, total: 1 });
  });

  it('falls back to actual > estimate without surprise, and flags disagreements', () => {
    assert.deepEqual(countBeats([{ actual: 1.4, estimate: 1.3 }]), { wins: 1, total: 1 });
    assert.equal(countDisagreements([
      { actual: 1.2, estimate: 1.3, surprise: 0.05 },
      { actual: 1.4, estimate: 1.3, surprise: 0.02 },
      { actual: 1.4, estimate: 1.3 },
    ]), 1);
    assert.equal(countDisagreements([]), 0);
  });
});

describe('display helpers', () => {
  it('shortens corporate names without mangling real words', () => {
    assert.equal(shortName('Meta Platforms Inc'), 'Meta Platforms');
    assert.equal(shortName('Tesla, Inc.'), 'Tesla');
    assert.equal(shortName('Berkshire Hathaway Inc'), 'Berkshire Hathaway');
    assert.equal(shortName('Foo Holdings Inc'), 'Foo');
    assert.equal(shortName('Block'), 'Block');
    assert.equal(shortName(null), null);
  });

  it('picks the after-hours move first, then today, then nothing', () => {
    assert.deepEqual(pickMove({ priceChangePct: 0.01, ahChangePct: 0.062 }), { v: 0.062, label: 'after hours' });
    assert.deepEqual(pickMove({ priceChangePct: 0.01, ahChangePct: null }), { v: 0.01, label: 'today' });
    assert.equal(pickMove({ priceChangePct: null }), null);
  });

  it('writes quarter tooltips', () => {
    assert.equal(quarterTip({ q: 'Q3', year: 2026, actual: 5.89, estimate: 5.92, beat: false }), "Q3 '26: EPS $5.89 vs $5.92 est");
    assert.equal(quarterTip({ q: 'Q1', year: null, actual: null, estimate: 1.0, beat: null }), 'Q1: no estimate');
  });

  it('builds deterministic logo URLs and verdicts', () => {
    assert.equal(logoUrl('aapl'), 'https://finnhub.io/api/logo?symbol=AAPL');
    assert.equal(beatVerdict(0.52, 0.44), 'BEAT');
    assert.equal(beatVerdict(0.4, 0.44), 'MISS');
    assert.equal(beatVerdict(0.441, 0.44), 'INLINE');
    assert.equal(beatVerdict(0.5, null), 'REPORTED');
    assert.equal(beatVerdict(null, 0.44), 'REPORTED');
    assert.equal(formatMoneyShort(1.5e12), '$1.5T');
    assert.equal(formatMoneyShort(2.84e10), '$28.4B');
    assert.equal(formatEps(-0.22), '−$0.22');
    assert.equal(formatEps(null), null);
  });

  it('labels timing and ET times honestly', () => {
    // Local-noon construction: the same local calendar day in every tz.
    const wed = new Date(2026, 9, 21, 12, 0);
    const noon = wed.getTime();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const plus = (n) => iso(new Date(2026, 9, 21 + n, 12, 0));
    assert.equal(reportTimingLabel(plus(0), 'amc', noon), 'tonight');
    assert.equal(reportTimingLabel(plus(0), 'bmo', new Date(2026, 9, 21, 9, 0).getTime()), 'this morning');
    assert.equal(reportTimingLabel(plus(0), 'bmo', noon), 'today before the open');
    assert.equal(reportTimingLabel(plus(1), 'amc', noon), 'tomorrow after the close');
    assert.equal(reportTimingLabel(plus(5), 'amc', noon), 'Monday after the close');
    assert.equal(reportTimingLabel(plus(15), 'amc', noon), 'Nov 5 after the close');
    assert.equal(etTimeLabel('2026-10-21T16:00:00.000Z'), '12:00 PM ET');
    assert.equal(etTimeLabel('junk'), '');
  });

  it('calls a next-day-ET report "tomorrow" on a US-west evening', () => {
    // Oct 20 9pm Seattle = already Oct 21 in ET. Reader-local days win.
    const seattleEvening = new Date(2026, 9, 20, 21, 0).getTime();
    const theNextDay = (() => {
      const d = new Date(2026, 9, 20, 21, 0);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate() + 1).padStart(2, '0')}`;
    })();
    assert.equal(reportTimingLabel(theNextDay, 'amc', seattleEvening), 'tomorrow after the close');
  });

  it('writes cashtagged share text', () => {
    const preview = previewShareText({ symbol: 'TSLA', date: '2026-10-21', hour: 'amc', epsEstimate: 0.44, revenueEstimate: 2.84e10, beats: { wins: 2, total: 4 } });
    // Timing label uses real now; check the stable parts.
    assert.ok(preview.startsWith('$TSLA reports '));
    assert.ok(preview.includes('EPS est $0.44, rev est $28.4B'));
    assert.ok(preview.endsWith('Beat 2 of last 4.'));
    assert.equal(
      resultShareText({ symbol: 'TSLA', epsActual: 0.52, epsEstimate: 0.44, priceChangePct: 0.062 }),
      '$TSLA beats: EPS $0.52 vs $0.44 est (+18%), stock +6.2% today.',
    );
    assert.equal(
      resultShareText({ symbol: 'TSLA', epsActual: 0.52, epsEstimate: 0.44, priceChangePct: 0.01, ahChangePct: 0.062 }),
      '$TSLA beats: EPS $0.52 vs $0.44 est (+18%), stock +6.2% after hours.',
    );
    assert.equal(
      resultShareText({ symbol: 'TSLA', epsActual: 0.52, epsEstimate: null, priceChangePct: null }),
      '$TSLA reports: EPS $0.52 reported.',
    );
  });
});

describe('visibleRows', () => {
  const rows = [
    { symbol: 'NVDA', companyName: 'NVIDIA Corp', epsEstimate: 1.02 },
    { symbol: 'ZZZZ', companyName: 'ZZZZ Micro', epsEstimate: null },
  ];

  it('hides estimateless rows until expanded', () => {
    assert.deepEqual(visibleRows(rows, '', false).map((r) => r.symbol), ['NVDA']);
    assert.deepEqual(visibleRows(rows, '', true).map((r) => r.symbol), ['NVDA', 'ZZZZ']);
  });

  it('filters by ticker or company name', () => {
    assert.deepEqual(visibleRows(rows, 'nvid', true).map((r) => r.symbol), ['NVDA']);
    assert.deepEqual(visibleRows(rows, 'zzzz', false).map((r) => r.symbol), []);
    assert.deepEqual(visibleRows(rows, 'zzzz', true).map((r) => r.symbol), ['ZZZZ']);
  });
});

describe('reportDateLabel', () => {
  it('prints the absolute date, never a relative word', () => {
    assert.equal(reportDateLabel('2026-10-21', 'amc'), 'Wed Oct 21 after the close');
    assert.equal(reportDateLabel('2026-10-22', 'bmo'), 'Thu Oct 22 before the open');
    assert.equal(reportDateLabel('2026-10-21', ''), 'Wed Oct 21 time not announced');
  });
});

describe('earnings share URLs', () => {
  it('shares the landing page, never the raw image URL', () => {
    assert.equal(
      earningsSharePageUrl('preview', { ticker: 'META' }),
      'https://amoljadhav.ai/share/earnings?type=preview&ticker=META',
    );
    assert.equal(
      earningsSharePageUrl('tonight', { date: '2026-10-21' }),
      'https://amoljadhav.ai/share/earnings?type=tonight&date=2026-10-21',
    );
  });

  it('passes the per-share nonce through to both URLs', () => {
    assert.equal(
      earningsSharePageUrl('preview', { ticker: 'META', v: 'abc123' }),
      'https://amoljadhav.ai/share/earnings?type=preview&ticker=META&v=abc123',
    );
    assert.equal(
      earningsCardImageUrl('preview', { ticker: 'META', v: 'abc123' }),
      'https://amoljadhav.ai/api/og/earnings?type=preview&ticker=META&v=abc123',
    );
    assert.equal(
      earningsCardImageUrl('preview', { ticker: 'META' }),
      'https://amoljadhav.ai/api/og/earnings?type=preview&ticker=META',
    );
  });

  it('points the X intent at the landing page with the text', () => {
    const page = earningsSharePageUrl('preview', { ticker: 'META' });
    const url = earningsXIntentUrl('preview', '$META reports tonight', { ticker: 'META' });
    assert.ok(url.startsWith('https://twitter.com/intent/tweet?'));
    assert.ok(url.includes(`text=${encodeURIComponent('$META reports tonight')}`));
    assert.ok(url.includes(`url=${encodeURIComponent(page)}`));
  });
});
