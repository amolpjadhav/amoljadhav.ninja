// Tests for the stock lookup helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFilingInsights,
  buildTtm,
  buildOverviewDescription,
  buildPsHistory,
  cagr,
  cikPad,
  cleanCompanyNameForSearch,
  cleanSpacing,
  buildDebtSeries,
  buildFcfSeries,
  buildFinancials,
  buildPeHistory,
  decodeHtmlEntities,
  cagrDetails,
  displayCompanyName,
  downsampleWeekly,
  deriveGrossProfit,
  firstSentence,
  fitName,
  fitPrice,
  getStockCardData,
  formatQuoteChange,
  ledeSentence,
  extractBusinessExcerpt,
  extractBusinessModel,
  extractCompetition,
  extractCustomerConcentration,
  extractEmployeeCount,
  extractItemSection,
  extractRiskHeadings,
  extractSegmentFinancials,
  extractSegmentNames,
  htmlToText,
  daysBetween,
  edgarFilingUrl,
  extractAnnualSeries,
  extractLatestPoint,
  extractQuarters,
  extractQuote,
  filingEventLabel,
  findAnnualFiling,
  findFormUrl,
  fiscalYearEndMonth,
  fiscalYearSpan,
  formatCompact,
  formatEps,
  formatFilingDate,
  formatHeadquarters,
  formatInt,
  formatMoney,
  formatPct,
  formatLastTrade,
  formatPrice,
  isMarketOpen,
  isOtherSegment,
  isSingleSegmentText,
  latestAcross,
  latestValue,
  normalizeTicker,
  parseNum,
  parseWikidataCompanyFacts,
  marginLine,
  peHistoryNote,
  periodReturn,
  pickCompanyName,
  pickFilings,
  pickLede,
  positionInRangeLabel,
  quoteCardFooter,
  quoteDayLabel,
  quoteDayParam,
  resolveSharesOutstanding,
  revenueLine,
  sparklinePoints,
  splitFactor,
  stockShareLinks,
  stockShareText,
  tableYears,
  tickerVariants,
  truncateLine,
  ttmDividendsPerShare,
  ttmSum,
  ttmValue,
  wikipediaRelevant,
  yoyGrowth,
} from './stocks.ts';

describe('normalizeTicker', () => {
  it('uppercases and trims', () => {
    assert.equal(normalizeTicker('  meta '), 'META');
  });

  it('strips a leading $', () => {
    assert.equal(normalizeTicker('$aapl'), 'AAPL');
  });

  it('unifies separators to dots for share classes', () => {
    assert.equal(normalizeTicker('brk.b'), 'BRK.B');
    assert.equal(normalizeTicker('bf-b'), 'BF.B');
    assert.equal(normalizeTicker('brk/b'), 'BRK.B');
  });

  it('rejects junk', () => {
    assert.equal(normalizeTicker(''), '');
    assert.equal(normalizeTicker('!!!'), '');
    assert.equal(normalizeTicker('TOOLONGTICKER'), '');
    assert.equal(normalizeTicker('M E T A!'), '');
  });
});

describe('cikPad', () => {
  it('pads to 10 digits', () => {
    assert.equal(cikPad(1326801), '0001326801');
    assert.equal(cikPad('320193'), '0000320193');
  });
});

describe('extractAnnualSeries', () => {
  const facts = {
    'us-gaap': {
      Revenues: {
        units: {
          USD: [
            { end: '2024-12-31', val: 100, accn: 'a', fy: 2024, fp: 'FY', form: '10-K', filed: '2025-01-01' },
            // Next year's 10-K repeats 2024 as a comparative column, carrying
            // the new filing's fy — the year must still come from the end date.
            // Its restated value wins by filed date.
            { end: '2024-12-31', val: 110, accn: 'b', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
            { end: '2025-12-31', val: 130, accn: 'b', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
            // Quarterly datapoint must be ignored.
            { end: '2025-03-31', val: 999, accn: 'd', fy: 2025, fp: 'Q1', form: '10-Q', filed: '2025-04-01' },
          ],
        },
      },
    },
  };

  it('years from period end, dedupes comparatives/restatements, oldest first', () => {
    const s = extractAnnualSeries(facts, 'us-gaap', ['Revenues'], 'USD', 'revenue', 'Revenue');
    assert.ok(s);
    assert.deepEqual(
      s.points.map((p) => [p.year, p.value]),
      [
        ['2024', 110],
        ['2025', 130],
      ],
    );
  });

  it('falls through the concept list', () => {
    const s = extractAnnualSeries(facts, 'us-gaap', ['Missing', 'Revenues'], 'USD', 'revenue', 'Revenue');
    assert.ok(s);
    assert.equal(s.key, 'revenue');
    assert.equal(s.points.length, 2);
  });

  it('merges years across concepts when a filer switches tags (NVDA revenue)', () => {
    const switched = {
      'us-gaap': {
        NewTag: {
          units: {
            USD: [
              { end: '2025-12-31', val: 200, accn: 'n', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
              { end: '2026-12-31', val: 220, accn: 'n', fy: 2026, fp: 'FY', form: '10-K', filed: '2027-01-01' },
            ],
          },
        },
        OldTag: {
          units: {
            USD: [
              { end: '2023-12-31', val: 100, accn: 'o', fy: 2023, fp: 'FY', form: '10-K', filed: '2024-01-01' },
              { end: '2024-12-31', val: 120, accn: 'o', fy: 2024, fp: 'FY', form: '10-K', filed: '2025-01-01' },
            ],
          },
        },
      },
    };
    const s = extractAnnualSeries(switched, 'us-gaap', ['NewTag', 'OldTag'], 'USD', 'revenue', 'Revenue');
    assert.ok(s);
    assert.deepEqual(
      s.points.map((p) => [p.year, p.value]),
      [
        ['2023', 100],
        ['2024', 120],
        ['2025', 200],
        ['2026', 220],
      ],
    );
  });

  it('returns null when nothing matches', () => {
    assert.equal(extractAnnualSeries(facts, 'us-gaap', ['Missing'], 'USD', 'x', 'X'), null);
    assert.equal(extractAnnualSeries(null, 'us-gaap', ['Revenues'], 'USD', 'x', 'X'), null);
  });

  it('keeps full-year durations and instants, drops stub periods', () => {
    const mixed = {
      'us-gaap': {
        Revenues: {
          units: {
            USD: [
              { start: '2025-01-01', end: '2025-12-31', val: 100, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
              // A 3-month stub tagged FY must not become a "year".
              { start: '2025-10-01', end: '2025-12-31', val: 999, accn: 'b', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
            ],
          },
        },
        Assets: {
          units: {
            USD: [
              // Point-in-time: no start, still counts.
              { end: '2025-12-31', val: 500, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
            ],
          },
        },
      },
    };
    const rev = extractAnnualSeries(mixed, 'us-gaap', ['Revenues'], 'USD', 'revenue', 'Revenue');
    assert.deepEqual(rev.points.map((p) => p.value), [100]);
    const assets = extractAnnualSeries(mixed, 'us-gaap', ['Assets'], 'USD', 'assets', 'Assets');
    assert.deepEqual(assets.points.map((p) => p.value), [500]);
  });

  it('collapses two period ends in one calendar year to the latest', () => {
    const changed = {
      'us-gaap': {
        Revenues: {
          units: {
            USD: [
              { end: '2025-01-31', val: 10, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2025-03-01' },
              { end: '2025-12-31', val: 20, accn: 'b', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-03-01' },
            ],
          },
        },
      },
    };
    const s = extractAnnualSeries(changed, 'us-gaap', ['Revenues'], 'USD', 'revenue', 'Revenue');
    assert.deepEqual(s.points.map((p) => [p.year, p.value]), [['2025', 20]]);
  });

  it('prefers the first concept per year when definitions overlap', () => {
    const cash = {
      'us-gaap': {
        Plain: {
          units: { USD: [{ end: '2025-12-31', val: 100, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' }] },
        },
        WithRestricted: {
          units: { USD: [{ end: '2025-12-31', val: 120, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-02-01' }] },
        },
      },
    };
    const s = extractAnnualSeries(cash, 'us-gaap', ['Plain', 'WithRestricted'], 'USD', 'cash', 'Cash');
    assert.deepEqual(s.points.map((p) => p.value), [100]);
  });

  it('picks up bank revenue tags', () => {
    const bank = {
      'us-gaap': {
        RevenuesNetOfInterestExpense: {
          units: {
            USD: [
              { end: '2025-12-31', val: 180, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
            ],
          },
        },
      },
    };
    const s = extractAnnualSeries(
      bank, 'us-gaap',
      ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'RevenuesNetOfInterestExpense'],
      'USD', 'revenue', 'Revenue',
    );
    assert.deepEqual(s.points.map((p) => p.value), [180]);
  });
});

describe('buildDebtSeries', () => {
  const annual = (end, val) => ({ end, val, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' });
  const factsWith = (concepts) => ({ 'us-gaap': Object.fromEntries(concepts.map(([c, v]) => [c, { units: { USD: [annual('2025-12-31', v)] } }])) });

  it('sums current parts plus noncurrent (AAPL-style)', () => {
    const s = buildDebtSeries(factsWith([
      ['LongTermDebtNoncurrent', 78000],
      ['CommercialPaper', 8000],
      ['LongTermDebtCurrent', 12000],
    ]));
    assert.equal(s.points[0].value, 98000);
  });

  it('lets all-inclusive current suppress detail legs, no double count', () => {
    const s = buildDebtSeries(factsWith([
      ['DebtCurrent', 20000],
      ['CommercialPaper', 8000],
      ['LongTermDebtNoncurrent', 78000],
    ]));
    assert.equal(s.points[0].value, 98000);
  });

  it('falls back to notes plus secured (REIT-style)', () => {
    const s = buildDebtSeries(factsWith([
      ['NotesPayable', 25000],
      ['SecuredDebt', 40],
    ]));
    assert.equal(s.points[0].value, 25040);
  });

  it('returns null with no debt tags at all', () => {
    assert.equal(buildDebtSeries({ 'us-gaap': {} }), null);
  });
});

describe('deriveGrossProfit', () => {
  const series = (key, points) => ({ key, label: key, unit: 'USD', points });
  const pt = (year, end, value) => ({ year, end, value, filed: '2026-01-01' });

  it('subtracts cost from revenue matched by fiscal year-end', () => {
    const out = deriveGrossProfit(
      series('revenue', [pt('2024', '2024-12-31', 100), pt('2025', '2025-12-31', 200)]),
      series('cost', [pt('2024', '2024-12-31', 30), pt('2025', '2025-12-31', 50)]),
    );
    assert.deepEqual(out.map((p) => [p.year, p.value]), [['2024', 70], ['2025', 150]]);
  });

  it('skips years missing either leg, null when nothing matches', () => {
    const out = deriveGrossProfit(
      series('revenue', [pt('2024', '2024-12-31', 100)]),
      series('cost', [pt('2025', '2025-12-31', 50)]),
    );
    assert.equal(out, null);
    assert.equal(deriveGrossProfit(null, series('cost', [])), null);
    assert.equal(deriveGrossProfit(series('revenue', []), null), null);
  });
});

describe('buildFinancials gross profit derivation', () => {
  const annual = (start, end, val) => ({ start, end, val, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' });
  const revCost = () => ({
    'us-gaap': {
      Revenues: { units: { USD: [annual('2024-01-01', '2024-12-31', 100), annual('2025-01-01', '2025-12-31', 200)] } },
      CostOfRevenue: { units: { USD: [annual('2024-01-01', '2024-12-31', 30), annual('2025-01-01', '2025-12-31', 50)] } },
    },
  });

  it('derives revenue − cost of revenue when no subtotal is filed (META case)', () => {
    const built = buildFinancials(revCost(), 'META');
    const gross = built.series.find((s) => s.key === 'grossProfit');
    assert.deepEqual(gross.points.map((p) => p.value), [70, 150]);
    assert.ok(!built.missing.includes('Gross profit'));
  });

  it('prefers the filed subtotal over derivation', () => {
    const facts = revCost();
    facts['us-gaap'].GrossProfit = {
      units: { USD: [annual('2024-01-01', '2024-12-31', 71), annual('2025-01-01', '2025-12-31', 151)] },
    };
    const built = buildFinancials(facts, 'META');
    assert.deepEqual(built.series.find((s) => s.key === 'grossProfit').points.map((p) => p.value), [71, 151]);
  });

  it('still reports missing without a total-cost concept (AMZN case)', () => {
    const facts = {
      'us-gaap': {
        Revenues: { units: { USD: [annual('2025-01-01', '2025-12-31', 200)] } },
        CostOfGoodsAndServicesSold: { units: { USD: [annual('2025-01-01', '2025-12-31', 50)] } },
      },
    };
    const built = buildFinancials(facts, 'AMZN');
    assert.equal(built.series.find((s) => s.key === 'grossProfit'), undefined);
    assert.ok(built.missing.includes('Gross profit'));
  });
});

describe('buildTtm gross profit derivation', () => {
  const q = (start, end, val) => ({ start, end, val, accn: 'a', fy: 2025, fp: 'Q', form: '10-Q', filed: '2025-01-01' });
  const quarters = (vals) => [
    q('2024-07-01', '2024-09-30', vals[0]),
    q('2024-10-01', '2024-12-31', vals[1]),
    q('2025-01-01', '2025-03-31', vals[2]),
    q('2025-04-01', '2025-06-30', vals[3]),
  ];

  it('derives TTM revenue − TTM cost of revenue without filed gross quarters', () => {
    const facts = {
      'us-gaap': {
        Revenues: { units: { USD: quarters([100, 100, 100, 100]) } },
        CostOfRevenue: { units: { USD: quarters([30, 30, 30, 30]) } },
      },
    };
    assert.equal(buildTtm(facts, 'META').grossProfit, 280);
  });

  it('prefers filed gross quarters over derivation', () => {
    const facts = {
      'us-gaap': {
        Revenues: { units: { USD: quarters([100, 100, 100, 100]) } },
        CostOfRevenue: { units: { USD: quarters([30, 30, 30, 30]) } },
        GrossProfit: { units: { USD: quarters([71, 71, 71, 71]) } },
      },
    };
    assert.equal(buildTtm(facts, 'META').grossProfit, 284);
  });
});

describe('buildFcfSeries', () => {
  const annual = (end, val) => ({ end, val, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' });
  const factsWith = (ocf, capex) => ({
    'us-gaap': {
      NetCashProvidedByUsedInOperatingActivities: { units: { USD: [annual('2025-12-31', ocf)] } },
      ...(capex === null ? {} : {
        PaymentsToAcquirePropertyPlantAndEquipment: { units: { USD: [annual('2025-12-31', capex)] } },
      }),
    },
  });

  it('subtracts capex whether filed negative or positive', () => {
    assert.equal(buildFcfSeries(factsWith(100, -12)).points[0].value, 88);
    assert.equal(buildFcfSeries(factsWith(100, 12)).points[0].value, 88);
  });

  it('needs both legs (banks have no capex tag)', () => {
    assert.equal(buildFcfSeries(factsWith(100, null)), null);
  });
});

describe('buildFinancials new rows', () => {
  it('split-adjusts share counts upward and tracks missing rows', () => {
    const facts = {
      'us-gaap': {
        WeightedAverageNumberOfDilutedSharesOutstanding: {
          units: { shares: [{ end: '2022-01-30', val: 2500, accn: 'a', fy: 2022, fp: 'FY', form: '10-K', filed: '2022-02-16' }] },
        },
      },
    };
    const built = buildFinancials(facts, 'NVDA');
    const shares = built.series.find((s) => s.key === 'shares');
    assert.equal(shares.points[0].value, 2500 * 10);
    assert.equal(built.splitAdjusted, true);
    assert.ok(built.missing.includes('Revenue'));
  });
});

describe('formatCompact', () => {
  it('scales unitless counts', () => {
    assert.equal(formatCompact(24100000000), '24.1B');
    assert.equal(formatCompact(946218033), '946.22M');
    assert.equal(formatCompact(null), '—');
  });
});

describe('daysBetween', () => {
  it('counts calendar days', () => {
    assert.equal(daysBetween('2025-01-01', '2025-12-31'), 364);
    assert.equal(daysBetween('2025-10-01', '2025-12-31'), 91);
  });
});

describe('splitFactor', () => {
  it('adjusts only points that predate the split in both period and filing', () => {
    // NVDA FY2022 ($3.85) from a pre-split filing: 10:1 applies.
    assert.equal(splitFactor('NVDA', '2022-01-30', '2024-02-21'), 10);
    // Same period restated by a post-split filing: already adjusted.
    assert.equal(splitFactor('NVDA', '2022-01-30', '2025-02-26'), 1);
    // Post-split periods need nothing.
    assert.equal(splitFactor('NVDA', '2025-01-26', '2025-02-26'), 1);
  });

  it('compounds multiple splits and ignores unknown tickers', () => {
    // Pre-dates both the 2021 4:1 and the 2024 10:1.
    assert.equal(splitFactor('NVDA', '2020-01-26', '2020-02-20'), 40);
    assert.equal(splitFactor('META', '2020-12-31', '2021-01-01'), 1);
  });
});

describe('buildPeHistory', () => {
  const eps = {
    key: 'eps',
    label: 'EPS',
    unit: 'USD/shares',
    points: [
      { year: '2024', end: '2024-12-31', value: 2.0, filed: 'x' },
      { year: '2025', end: '2025-12-31', value: -1.0, filed: 'x' },
    ],
  };

  it('uses the last close on or before year-end, n/a for losses', () => {
    // 2024-12-31 was a Tuesday; no year-end holiday gap here.
    const pe = buildPeHistory(eps, [
      { date: '2024-12-30', close: 40 },
      { date: '2024-12-31', close: 50 },
      { date: '2025-12-31', close: 60 },
    ]);
    assert.deepEqual(pe, [
      { year: '2024', value: 25 },
      { year: '2025', value: null },
    ]);
  });

  it('falls back to the prior trading day', () => {
    // FY ends Sunday 2026-01-25; latest close is Friday 2026-01-23.
    const nvda = {
      key: 'eps',
      label: 'EPS',
      unit: 'USD/shares',
      points: [
        { year: '2023', end: '2023-01-29', value: 0.17, filed: 'x' },
        { year: '2026', end: '2026-01-25', value: 4.9, filed: 'x' },
      ],
    };
    const pe = buildPeHistory(nvda, [
      { date: '2023-01-27', close: 20 },
      { date: '2026-01-23', close: 240 },
    ]);
    assert.equal(pe[0].year, '2023');
    assert.ok(Math.abs(pe[0].value - 20 / 0.17) < 1e-9);
    assert.equal(pe[1].year, '2026');
    assert.ok(Math.abs(pe[1].value - 240 / 4.9) < 1e-9);
  });

  it('returns null without EPS or closes', () => {
    assert.equal(buildPeHistory(undefined, [{ date: '2024-12-31', close: 1 }]), null);
    assert.equal(buildPeHistory(eps, []), null);
  });
});

describe('tickerVariants', () => {
  it('returns dot form first, dash form for the SEC directory', () => {
    assert.deepEqual(tickerVariants('BRK.B'), ['BRK.B', 'BRK-B']);
    assert.deepEqual(tickerVariants('META'), ['META']);
    assert.deepEqual(tickerVariants(''), []);
  });
});

describe('fiscal year labels', () => {
  it('names the month from MMDD', () => {
    assert.equal(fiscalYearEndMonth('1231'), 'December');
    assert.equal(fiscalYearEndMonth('0126'), 'January');
    assert.equal(fiscalYearEndMonth('0930'), 'September');
    assert.equal(fiscalYearEndMonth(null), null);
    assert.equal(fiscalYearEndMonth('bogus'), null);
  });

  it('spells out non-calendar fiscal years', () => {
    assert.equal(fiscalYearSpan('January', '2026'), 'February 2025–January 2026');
    assert.equal(fiscalYearSpan('September', '2025'), 'October 2024–September 2025');
    assert.equal(fiscalYearSpan('December', '2025'), 'January–December 2025');
    assert.equal(fiscalYearSpan(null, '2025'), null);
  });
});

describe('resolveSharesOutstanding', () => {
  it('prefers the filed count for single-class filers', () => {
    assert.deepEqual(resolveSharesOutstanding(15000, 14900 * 10, 10), { value: 15000, estimated: false });
  });

  it('uses the market-implied total when filings undercount (multi-class)', () => {
    assert.deepEqual(resolveSharesOutstanding(6000, 123000, 10), { value: 12300, estimated: true });
    assert.deepEqual(resolveSharesOutstanding(null, 25480000, 10), { value: 2548000, estimated: true });
  });

  it('returns null when nothing is known', () => {
    assert.deepEqual(resolveSharesOutstanding(null, null, null), { value: null, estimated: false });
  });
});

describe('latestValue', () => {
  it('takes the last point', () => {
    assert.equal(latestValue({ points: [{ value: 1 }, { value: 2.5 }] }), 2.5);
    assert.equal(latestValue(undefined), null);
    assert.equal(latestValue({ points: [] }), null);
  });
});

describe('extractLatestPoint', () => {
  it('takes the latest end date across units', () => {
    const facts = {
      dei: {
        EntityCommonStockSharesOutstanding: {
          units: {
            shares: [
              { end: '2025-06-30', val: 2500, accn: 'a', fy: 2025, fp: 'Q2', form: '10-Q', filed: '2025-07-01' },
              { end: '2025-12-31', val: 2400, accn: 'b', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' },
            ],
          },
        },
      },
    };
    assert.deepEqual(extractLatestPoint(facts, 'dei', 'EntityCommonStockSharesOutstanding'), {
      value: 2400,
      end: '2025-12-31',
      filed: '2026-01-01',
    });
  });
});

describe('filings', () => {
  it('builds EDGAR links for wanted forms only', () => {
    const recent = {
      form: ['4', '10-Q', '8-K'],
      filingDate: ['2026-01-01', '2026-02-01', '2026-03-01'],
      reportDate: ['', '2025-12-31', '2026-03-01'],
      accessionNumber: ['0001-2-3', '0001326801-26-000001', '0001326801-26-000002'],
      primaryDocument: ['x.xml', 'meta-20251231.htm', 'meta-8k.htm'],
    };
    const out = pickFilings(recent, '0001326801', ['10-K', '10-Q', '8-K'], 10);
    assert.equal(out.length, 2);
    assert.equal(out[0].form, '10-Q');
    assert.equal(out[0].url, 'https://www.sec.gov/Archives/edgar/data/1326801/000132680126000001/meta-20251231.htm');
  });

  it('edgarFilingUrl strips CIK padding and accession dashes', () => {
    assert.equal(
      edgarFilingUrl('0000320193', '0000320193-25-000001', 'aapl-20250927.htm'),
      'https://www.sec.gov/Archives/edgar/data/320193/000032019325000001/aapl-20250927.htm',
    );
  });
});

describe('tableYears', () => {
  const series = (key, years) => ({
    key,
    label: key,
    unit: 'USD',
    points: years.map((year) => ({ year, end: `${year}-12-31`, value: 1, filed: 'x' })),
  });

  it('unions years across series and keeps the latest five', () => {
    const years = tableYears([
      series('revenue', ['2018', '2019', '2020', '2021', '2022']),
      series('netIncome', ['2022', '2023', '2024', '2025', '2026']),
    ]);
    assert.deepEqual(years, ['2022', '2023', '2024', '2025', '2026']);
  });

  it('keeps fewer than five when that is all there is', () => {
    assert.deepEqual(tableYears([series('revenue', ['2024', '2025'])]), ['2024', '2025']);
  });

  it('drops years with neither revenue nor net income', () => {
    const years = tableYears([
      series('revenue', ['2024', '2025']),
      series('assets', ['2023', '2024', '2025']),
    ]);
    assert.deepEqual(years, ['2024', '2025']);
  });
});

describe('extractQuote', () => {
  const payload = {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation Common Stock',
    primaryData: {
      lastSalePrice: '$187.50',
      netChange: '+2.25',
      percentageChange: '+1.21%',
      lastTradeTimestamp: 'Oct 6, 2026',
      volume: '200,000,000',
    },
    marketStatus: 'Closed',
  };

  it('parses a Nasdaq quote payload', () => {
    assert.deepEqual(extractQuote(payload), {
      price: 187.5,
      change: 2.25,
      changePct: 0.0121,
      volume: 200000000,
      lastTrade: 'Oct 6, 2026',
      marketStatus: 'Closed',
    });
  });

  it('returns null for missing or N/A quotes', () => {
    assert.equal(extractQuote(null), null);
    assert.equal(extractQuote({}), null);
    assert.equal(extractQuote({ symbol: 'NVDA', primaryData: { lastSalePrice: 'N/A' } }), null);
  });
});

describe('share helpers', () => {
  it('builds post text with price and change', () => {
    assert.equal(
      stockShareText('NVDA', 'NVIDIA Corporation', { price: 187.5, changePct: 0.0121 }),
      '$NVDA $187.50 (+1.2%) — NVIDIA Corporation',
    );
  });

  it('falls back to names when the quote is missing', () => {
    assert.equal(stockShareText('NVDA', 'NVIDIA Corporation', null), '$NVDA — NVIDIA Corporation');
    assert.equal(
      stockShareText('NVDA', 'NVIDIA Corporation', { price: null, changePct: null }),
      '$NVDA — NVIDIA Corporation',
    );
  });

  it('builds encoded X and LinkedIn links', () => {
    const links = stockShareLinks('https://amoljadhav.ai/blog/x?ticker=NVDA', 'NVDA $187.50 — NVIDIA');
    assert.equal(
      links.x,
      'https://twitter.com/intent/tweet?text=NVDA%20%24187.50%20%E2%80%94%20NVIDIA&url=https%3A%2F%2Famoljadhav.ai%2Fblog%2Fx%3Fticker%3DNVDA',
    );
    assert.equal(
      links.linkedin,
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Famoljadhav.ai%2Fblog%2Fx%3Fticker%3DNVDA',
    );
  });
});

describe('yoyGrowth', () => {
  it('aligns growth with points, first is null', () => {
    const points = [
      { year: '2023', end: '2023-12-31', value: 100, filed: 'x' },
      { year: '2024', end: '2024-12-31', value: 120, filed: 'x' },
      { year: '2025', end: '2025-12-31', value: 90, filed: 'x' },
    ];
    const g = yoyGrowth(points);
    assert.equal(g[0], null);
    assert.ok(Math.abs(g[1] - 0.2) < 1e-9);
    assert.ok(Math.abs(g[2] - -0.25) < 1e-9);
  });
});

describe('formatting', () => {
  it('scales money adaptively', () => {
    assert.equal(formatMoney(1882301399528), '$1.88T');
    assert.equal(formatMoney(60800000000), '$60.8B');
    assert.equal(formatMoney(784000000), '$784M');
    assert.equal(formatMoney(-3200000000), '-$3.2B');
    assert.equal(formatMoney(16.86), '$16.86');
    assert.equal(formatMoney(null), '—');
  });

  it('formats EPS and percents', () => {
    assert.equal(formatEps(6.18), '$6.18');
    assert.equal(formatEps(-0.42), '-$0.42');
    assert.equal(formatPct(0.281), '+28.1%');
    assert.equal(formatPct(-0.0041), '-0.4%');
    assert.equal(formatPct(null), '—');
  });

  it('formats ints with commas', () => {
    assert.equal(formatInt(12563616), '12,563,616');
  });
});

describe('parseNum', () => {
  it('parses Nasdaq-style strings', () => {
    assert.equal(parseNum('$738.88'), 738.88);
    assert.equal(parseNum('1,882,301,399,528'), 1882301399528);
    assert.equal(parseNum('-0.41%'), -0.41);
    assert.equal(parseNum('N/A'), null);
    assert.equal(parseNum(null), null);
  });
});

describe('company name search', () => {
  it('strips stock-class suffixes but keeps legal suffix', () => {
    assert.equal(
      cleanCompanyNameForSearch('Meta Platforms, Inc. Class A Common Stock'),
      'Meta Platforms, Inc.',
    );
    assert.equal(cleanCompanyNameForSearch('Apple Inc.'), 'Apple Inc.');
  });

  it('accepts word overlap and acronyms', () => {
    assert.equal(wikipediaRelevant('Meta Platforms, Inc.', 'Meta Platforms'), true);
    assert.equal(wikipediaRelevant('International Business Machines Corp', 'IBM'), true);
    assert.equal(wikipediaRelevant('Apple Inc.', 'Orange (fruit)'), false);
    assert.equal(wikipediaRelevant('NVIDIA Corporation', 'Crayon Shin-chan'), false);
    assert.equal(wikipediaRelevant('Alphabet Inc.', 'Google'), false);
    assert.equal(wikipediaRelevant('Taiwan Semiconductor Manufacturing Company Limited', 'TSMC'), true);
  });
});

describe('displayCompanyName', () => {
  it('strips legal suffixes for headlines', () => {
    assert.equal(displayCompanyName('Tesla, Inc.'), 'Tesla');
    assert.equal(displayCompanyName('Meta Platforms, Inc.'), 'Meta Platforms');
    assert.equal(displayCompanyName('Apple Inc.'), 'Apple');
    assert.equal(displayCompanyName('NVIDIA Corporation'), 'NVIDIA');
    assert.equal(displayCompanyName('Energy Transfer LP'), 'Energy Transfer');
  });

  it('strips chained suffixes and leaves bare names alone', () => {
    assert.equal(
      displayCompanyName('Taiwan Semiconductor Manufacturing Company Limited'),
      'Taiwan Semiconductor Manufacturing',
    );
    assert.equal(displayCompanyName('Johnson & Johnson'), 'Johnson & Johnson');
    assert.equal(displayCompanyName('Block, Inc.'), 'Block');
    assert.equal(displayCompanyName('Webull Corporation Class A Ordinary Shares'), 'Webull');
    assert.equal(displayCompanyName('Meta Platforms, Inc. Class A Common Stock'), 'Meta Platforms');
    assert.equal(displayCompanyName('Alphabet Inc. Class C Capital Stock'), 'Alphabet');
    assert.equal(displayCompanyName('First Class Holdings'), 'First Class');
    assert.equal(displayCompanyName('PepsiCo, Inc. Common Stock'), 'PepsiCo');
  });

  it('never returns empty', () => {
    assert.equal(displayCompanyName('Inc.'), 'Inc.');
    assert.equal(displayCompanyName(''), '');
  });

  it('title-cases ALL-CAPS filers before stripping', () => {
    assert.equal(displayCompanyName('BERKSHIRE HATHAWAY INC'), 'Berkshire Hathaway');
    assert.equal(
      displayCompanyName('TAIWAN SEMICONDUCTOR MANUFACTURING COMPANY LIMITED'),
      'Taiwan Semiconductor Manufacturing',
    );
    assert.equal(displayCompanyName("MCDONALD'S CORPORATION"), "Mcdonald's");
  });

  it('drops .com-style suffixes', () => {
    assert.equal(displayCompanyName('Amazon.com, Inc.'), 'Amazon');
    assert.equal(displayCompanyName('Example.io Inc.'), 'Example');
    assert.equal(displayCompanyName('AMAZON COM INC'), 'Amazon');
  });
});

describe('ledeSentence', () => {
  it('skips mission fluff for the first substantive sentence', () => {
    assert.equal(
      ledeSentence('We seek to be Earth\u2019s most customer-centric company. We sell goods online and run AWS cloud computing.'),
      'We sell goods online and run AWS cloud computing.',
    );
    assert.equal(
      ledeSentence('Our mission is to build the future. We report results in two segments.'),
      'We report results in two segments.',
    );
  });

  it('falls back to the first sentence when everything matches', () => {
    assert.equal(ledeSentence('Our vision is bold. We strive daily.'), 'Our vision is bold.');
    assert.equal(ledeSentence(''), '');
  });

  it('skips values fluff but keeps "principal" substance', () => {
    assert.equal(
      ledeSentence('We are guided by four principles: customer obsession and passion for invention. We serve consumers, sellers, and developers.'),
      'We serve consumers, sellers, and developers.',
    );
    assert.equal(
      ledeSentence('Our principal products are widgets and gadgets. Second sentence here.'),
      'Our principal products are widgets and gadgets.',
    );
  });

  it('skips intent-framing openers', () => {
    assert.equal(
      ledeSentence('We are focused on bringing AI into the real world. We operate as two segments.'),
      'We operate as two segments.',
    );
    assert.equal(
      ledeSentence('We intend to leverage our operations to win. We sell widgets worldwide.'),
      'We sell widgets worldwide.',
    );
  });

  it('skips cross-references', () => {
    assert.equal(
      ledeSentence('See Item 7 for the discussion. We sell widgets worldwide.'),
      'We sell widgets worldwide.',
    );
  });

  it('skips disclaimer sentences', () => {
    assert.equal(
      ledeSentence('Additionally, we make certain voluntary disclosures in this report and on our website. Acme Corp designs and sells widgets.'),
      'Acme Corp designs and sells widgets.',
    );
  });
});

describe('pickLede', () => {
  it('prefers the overview when it has a clean sentence', () => {
    assert.equal(
      pickLede('Microsoft is a technology company. We do more things.', 'We operate in three segments.'),
      'Microsoft is a technology company.',
    );
  });

  it('falls through to the business model when the overview is fluff or overlong', () => {
    // TSLA shape: intent-framing openers, crisp segment line in the model text.
    assert.equal(
      pickLede(
        'We are focused on bringing AI into the real world through products and services. We intend to leverage our operations to achieve that objective.',
        'We operate as two reportable segments: automotive and energy.',
      ),
      'We operate as two reportable segments: automotive and energy.',
    );
    // One overlong overview sentence still falls through.
    const long = `We sell ${'widgets, '.repeat(30)}worldwide.`;
    assert.equal(pickLede(long, 'We operate in two segments.'), 'We operate in two segments.');
  });

  it('prefers a sentence enumerating segments', () => {
    assert.equal(
      pickLede(
        'In each of our segments, we serve consumers and sellers. We have organized our operations into three segments: North America, International, and AWS.',
        null,
      ),
      'We have organized our operations into three segments: North America, International, and AWS.',
    );
    // One adjective between the count and "segments" still matches.
    assert.equal(
      pickLede('We sell things. We operate as two reportable segments: cars and energy.', null),
      'We operate as two reportable segments: cars and energy.',
    );
  });

  it('keeps document order when no sentence enumerates segments', () => {
    assert.equal(pickLede('We sell widgets worldwide. We also sell gadgets.', null), 'We sell widgets worldwide.');
  });

  it('caps the overview as a last resort, blank when both are empty', () => {
    const long = `We sell ${'widgets, '.repeat(30)}worldwide.`;
    assert.equal(pickLede(long, null), ledeSentence(long));
    assert.ok(pickLede(long, null).endsWith('…'));
    assert.equal(pickLede('', ''), '');
    assert.equal(pickLede(null, null), '');
  });
});

describe('positionInRangeLabel', () => {
  it('labels the fifths of the range', () => {
    assert.equal(positionInRangeLabel(0.9), 'near the high');
    assert.equal(positionInRangeLabel(0.8), 'near the high');
    assert.equal(positionInRangeLabel(0.653), 'upper range');
    assert.equal(positionInRangeLabel(0.6), 'upper range');
    assert.equal(positionInRangeLabel(0.5), 'mid-range');
    assert.equal(positionInRangeLabel(0.4), 'mid-range');
    assert.equal(positionInRangeLabel(0.3), 'lower range');
    assert.equal(positionInRangeLabel(0.2), 'lower range');
    assert.equal(positionInRangeLabel(0.1), 'near the low');
    assert.equal(positionInRangeLabel(1.2), 'near the high');
    assert.equal(positionInRangeLabel(-0.1), 'near the low');
  });

  it('stays blank without a finite position', () => {
    assert.equal(positionInRangeLabel(null), null);
    assert.equal(positionInRangeLabel(undefined), null);
    assert.equal(positionInRangeLabel(NaN), null);
  });
});

describe('peHistoryNote', () => {
  it('positions the multiple against its range', () => {
    assert.equal(peHistoryNote(20.8, [32.2, 52.4]), 'below its 5-yr range (32.2–52.4)');
    assert.equal(peHistoryNote(60, [32.2, 52.4]), 'above its 5-yr range (32.2–52.4)');
    assert.equal(peHistoryNote(40, [32.2, 52.4]), 'within its 5-yr range (32.2–52.4)');
    assert.equal(peHistoryNote(32.2, [32.2, 52.4]), 'within its 5-yr range (32.2–52.4)');
  });

  it('stays blank without both legs', () => {
    assert.equal(peHistoryNote(null, [32.2, 52.4]), null);
    assert.equal(peHistoryNote(20.8, null), null);
    assert.equal(peHistoryNote(NaN, [32.2, 52.4]), null);
  });
});

describe('pickCompanyName', () => {
  it('prefers the Nasdaq display name over the SEC filing name', () => {
    assert.equal(
      pickCompanyName('AMAZON COM INC', 'Amazon.com, Inc. Common Stock', null, 'AMZN'),
      'Amazon.com, Inc.',
    );
    assert.equal(
      pickCompanyName('MICROSOFT CORP', 'Microsoft Corporation Common Stock', null, 'MSFT'),
      'Microsoft Corporation',
    );
  });

  it('falls back through SEC, ticker-list entry, then ticker', () => {
    assert.equal(pickCompanyName('AMAZON COM INC', null, null, 'AMZN'), 'AMAZON COM INC');
    assert.equal(pickCompanyName(null, null, 'Some Entry', 'XYZ'), 'Some Entry');
    assert.equal(pickCompanyName(null, '', null, 'XYZ'), 'XYZ');
  });
});

describe('formatPrice', () => {
  it('always shows two decimals with grouping', () => {
    assert.equal(formatPrice(287.2), '$287.20');
    assert.equal(formatPrice(196), '$196.00');
    assert.equal(formatPrice(712345), '$712,345.00');
  });

  it('stays blank without a finite price', () => {
    assert.equal(formatPrice(null), '—');
    assert.equal(formatPrice(undefined), '—');
    assert.equal(formatPrice(NaN), '—');
  });
});

describe('isMarketOpen', () => {
  it('matches open variants only', () => {
    assert.equal(isMarketOpen('Open'), true);
    assert.equal(isMarketOpen('OPEN'), true);
    assert.equal(isMarketOpen('Closed'), false);
    assert.equal(isMarketOpen(null), false);
    assert.equal(isMarketOpen(''), false);
  });
});

describe('formatLastTrade', () => {
  it('shows time only while open, the full stamp when closed', () => {
    assert.equal(formatLastTrade('Oct 7, 2026 11:07 AM ET', 'Open'), '11:07 AM ET');
    assert.equal(formatLastTrade('Oct 6, 2026', 'Closed'), 'Oct 6, 2026');
    assert.equal(formatLastTrade('Oct 6, 2026 4:00 PM ET', 'Closed'), 'Oct 6, 2026 4:00 PM ET');
  });

  it('passes unparseable stamps through, blank when missing', () => {
    assert.equal(formatLastTrade('yesterday-ish', 'Open'), 'yesterday-ish');
    assert.equal(formatLastTrade(null, 'Open'), '—');
  });
});

describe('cagrDetails', () => {
  const pt = (year, end, value) => ({ year, end, value, filed: '2026-01-01' });

  it('returns the rate with its endpoint years', () => {
    const d = cagrDetails([pt('2021', '2021-12-31', 100), pt('2025', '2025-12-31', 200)]);
    assert.ok(Math.abs(d.rate - (Math.pow(2, 1 / (1461 / 365.25)) - 1)) < 1e-12);
    assert.equal(d.startYear, '2021');
    assert.equal(d.endYear, '2025');
  });

  it('is null under the same conditions as cagr', () => {
    assert.equal(cagrDetails([pt('2025', '2025-12-31', 100)]), null);
    assert.equal(cagrDetails([pt('2024', '2024-12-31', 0), pt('2025', '2025-12-31', 100)]), null);
  });
});

describe('revenueLine', () => {
  it('builds the growing line with its span', () => {
    assert.deepEqual(revenueLine({ rate: 0.111, startYear: '2021', endYear: '2025' }), {
      word: 'Growing',
      detail: '+11.1% a year (2021–2025)',
      trend: 'up',
    });
  });

  it('names shrinking and flat bands', () => {
    assert.equal(revenueLine({ rate: -0.05, startYear: '2021', endYear: '2025' }).word, 'Shrinking');
    assert.equal(revenueLine({ rate: -0.05, startYear: '2021', endYear: '2025' }).trend, 'down');
    assert.equal(revenueLine({ rate: 0.003, startYear: '2021', endYear: '2025' }).word, 'Flat');
    assert.equal(revenueLine(null), null);
  });
});

describe('marginLine', () => {
  it('keeps cents and compares against the base year', () => {
    assert.deepEqual(marginLine(0.08, 0.02, '2022'), {
      text: 'Keeps 8¢ of every $1, up from 2¢ in 2022',
      trend: 'up',
    });
    assert.deepEqual(marginLine(0.08, 0.12, '2021'), {
      text: 'Keeps 8¢ of every $1, down from 12¢ in 2021',
      trend: 'down',
    });
  });

  it('handles losses, flat, missing base, and missing current', () => {
    assert.deepEqual(marginLine(-0.03, 0.05, '2021'), {
      text: 'Loses 3¢ of every $1, down from 5¢ in 2021',
      trend: 'down',
    });
    assert.deepEqual(marginLine(0.08, -0.05, '2022'), {
      text: 'Keeps 8¢ of every $1, up from losing 5¢ in 2022',
      trend: 'up',
    });
    assert.deepEqual(marginLine(0.08, 0.081, '2021'), {
      text: 'Keeps 8¢ of every $1, flat vs 8¢ in 2021',
      trend: 'flat',
    });
    assert.deepEqual(marginLine(0.08, null, null), { text: 'Keeps 8¢ of every $1', trend: null });
    assert.equal(marginLine(null, 0.02, '2022'), null);
  });
});

describe('firstSentence', () => {
  it('takes the opening sentence', () => {
    assert.equal(firstSentence('We sell widgets worldwide. Founded in 1993.'), 'We sell widgets worldwide.');
    assert.equal(firstSentence('What a business! Really.'), 'What a business!');
  });

  it('falls back to a capped prefix without sentence ends', () => {
    assert.equal(firstSentence('No ending here at all', 10), 'No ending…');
    assert.equal(firstSentence('Short', 10), 'Short');
  });

  it('caps long sentences at a word boundary', () => {
    assert.equal(firstSentence('Alpha beta gamma delta epsilon.', 22), 'Alpha beta gamma…');
  });

  it('skips abbreviation ends like Inc. and e.g.', () => {
    assert.equal(
      firstSentence('Berkshire Hathaway Inc. ("Berkshire") is a holding company. Next sentence here.'),
      'Berkshire Hathaway Inc. ("Berkshire") is a holding company.',
    );
    assert.equal(
      firstSentence('We sell stuff, e.g. widgets, worldwide. Second line here.'),
      'We sell stuff, e.g. widgets, worldwide.',
    );
    assert.equal(
      firstSentence('Offices at No. 8 Widget Road. Second line here.'),
      'Offices at No. 8 Widget Road.',
    );
  });
});

describe('formatQuoteChange', () => {
  it('shows both legs with units', () => {
    assert.equal(formatQuoteChange(1.9, 0.005), '+$1.90 (+0.5%)');
    assert.equal(formatQuoteChange(-3.02, -0.0041), '-$3.02 (-0.4%)');
  });

  it('degrades leg by leg', () => {
    assert.equal(formatQuoteChange(1.9, null), '+$1.90');
    assert.equal(formatQuoteChange(null, 0.005), '(+0.5%)');
    assert.equal(formatQuoteChange(null, null), '—');
    assert.equal(formatQuoteChange(undefined, undefined), '—');
  });

  it('groups thousands like the price does', () => {
    assert.equal(formatQuoteChange(1790, 0.002), '+$1,790.00 (+0.2%)');
  });
});

describe('quote day helpers', () => {
  it('labels the session, with close when shut', () => {
    assert.equal(quoteDayLabel('Oct 6, 2026', 'Closed'), 'Oct 6 close');
    assert.equal(quoteDayLabel('Oct 6, 2026', 'Open'), 'Oct 6');
    assert.equal(quoteDayLabel('October 6, 2026', null), 'Oct 6');
    assert.equal(quoteDayLabel('2026-10-06', 'Closed'), 'Oct 6 close');
  });

  it('returns null without a parseable date', () => {
    assert.equal(quoteDayLabel(null, 'Closed'), null);
    assert.equal(quoteDayLabel('sometime', 'Closed'), null);
  });

  it('builds the cache-busting day param', () => {
    assert.equal(quoteDayParam('Oct 6, 2026'), '2026-10-06');
    assert.equal(quoteDayParam('2026-01-05', 'Open'), '2026-01-05');
    assert.equal(quoteDayParam(null), null);
  });
});

describe('sparklinePoints', () => {
  it('scales values into the box, end dot on the last point', () => {
    const s = sparklinePoints([10, 20, 30], 100, 50);
    assert.ok(s.points.startsWith('8.0,42.0'));
    assert.ok(s.points.endsWith('92.0,8.0'));
    assert.equal(s.endX, 92);
    assert.equal(s.endY, 8);
  });

  it('draws flat series level and rejects thin input', () => {
    const flat = sparklinePoints([5, 5, 5], 100, 50);
    assert.deepEqual(flat.points.split(' ').map((p) => p.split(',')[1]), ['42.0', '42.0', '42.0']);
    assert.equal(sparklinePoints([5], 100, 50), null);
    assert.equal(sparklinePoints([null, undefined], 100, 50), null);
    assert.equal(sparklinePoints([1, 2], 0, 50), null);
  });
});

describe('extractQuarters', () => {
  const e = (start, end, val, filed, form = '10-Q') => ({ start, end, val, accn: 'a', fy: 2026, fp: 'Q', form, filed });
  const factsWith = (entries) => ({ 'us-gaap': { Revenues: { units: { USD: entries } } } });

  it('takes direct quarter slices, latest filing wins restatements', () => {
    const facts = factsWith([
      e('2026-01-01', '2026-03-31', 10, '2026-05-01'),
      e('2026-01-01', '2026-03-31', 11, '2026-05-02'),
      e('2026-04-01', '2026-06-30', 12, '2026-08-01'),
    ]);
    assert.deepEqual(
      extractQuarters(facts, 'us-gaap', ['Revenues'], 'USD').map((q) => [q.end, q.value]),
      [['2026-03-31', 11], ['2026-06-30', 12]],
    );
  });

  it('derives quarters from a YTD ladder, including Q4', () => {
    const facts = factsWith([
      e('2025-01-01', '2025-03-31', 10, '2025-05-01'), // Q1 YTD = Q1
      e('2025-01-01', '2025-06-30', 22, '2025-08-01'), // HY: Q2 = 12
      e('2025-01-01', '2025-09-30', 36, '2025-11-01'), // 9M: Q3 = 14
      e('2025-01-01', '2025-12-31', 52, '2026-02-01', '10-K'), // FY: Q4 = 16
    ]);
    assert.deepEqual(
      extractQuarters(facts, 'us-gaap', ['Revenues'], 'USD').map((q) => [q.end, q.value]),
      [['2025-03-31', 10], ['2025-06-30', 12], ['2025-09-30', 14], ['2025-12-31', 16]],
    );
  });

  it('drops a bare annual with no ladder to difference against', () => {
    const facts = factsWith([e('2025-01-01', '2025-12-31', 52, '2026-02-01', '10-K')]);
    assert.deepEqual(extractQuarters(facts, 'us-gaap', ['Revenues'], 'USD'), []);
  });

  it('prefers direct slices over ladder derivation for the same end', () => {
    const facts = factsWith([
      e('2025-04-01', '2025-06-30', 12, '2025-08-01'),
      e('2025-01-01', '2025-06-30', 22, '2025-08-01'),
    ]);
    assert.deepEqual(
      extractQuarters(facts, 'us-gaap', ['Revenues'], 'USD').map((q) => [q.end, q.value]),
      [['2025-06-30', 12]],
    );
  });
});

describe('ttmSum', () => {
  const q = (end, value) => ({ end, value, filed: 'x' });

  it('sums the last four quarters inside the window', () => {
    assert.equal(
      ttmSum([q('2025-09-30', 1), q('2025-12-31', 2), q('2026-03-31', 3), q('2026-06-30', 4), q('2023-01-01', 100)]),
      10,
    );
  });

  it('needs four quarters', () => {
    assert.equal(ttmSum([q('2026-03-31', 3), q('2026-06-30', 4)]), null);
  });
});

describe('latestAcross', () => {
  it('takes the newest end, concept order breaks ties', () => {
    const facts = {
      'us-gaap': {
        A: { units: { USD: [{ end: '2025-12-31', val: 1, accn: 'a', fy: 2025, fp: 'FY', form: '10-K', filed: '2026-01-01' }] } },
        B: { units: { USD: [{ end: '2026-06-30', val: 2, accn: 'a', fy: 2026, fp: 'Q2', form: '10-Q', filed: '2026-08-01' }] } },
      },
    };
    assert.deepEqual(latestAcross(facts, 'us-gaap', ['A', 'B'], 'USD'), { value: 2, end: '2026-06-30', filed: '2026-08-01' });
    assert.equal(latestAcross(null, 'us-gaap', ['A'], 'USD'), null);
  });
});

describe('ttmValue', () => {
  it('split-adjusts per-share quarters before summing', () => {
    const facts = {
      'us-gaap': {
        EarningsPerShareDiluted: {
          units: {
            'USD/shares': [
              // Pre-split quarters from pre-split filings: restated ÷10.
              { start: '2023-10-01', end: '2023-12-31', val: 5.0, accn: 'a', fy: 2024, fp: 'Q', form: '10-Q', filed: '2024-02-01' },
              { start: '2024-01-01', end: '2024-03-31', val: 6.0, accn: 'a', fy: 2024, fp: 'Q', form: '10-Q', filed: '2024-05-01' },
              { start: '2024-04-01', end: '2024-06-30', val: 0.7, accn: 'a', fy: 2024, fp: 'Q', form: '10-Q', filed: '2024-08-01' },
              { start: '2024-07-01', end: '2024-09-30', val: 0.8, accn: 'a', fy: 2024, fp: 'Q', form: '10-Q', filed: '2024-11-01' },
            ],
          },
        },
      },
    };
    // NVDA 10:1 ex 2024-06-10: (5 + 6) / 10 + 0.7 + 0.8 = 2.6.
    const v = ttmValue(facts, 'NVDA', [{ taxonomy: 'us-gaap', concepts: ['EarningsPerShareDiluted'] }], 'USD/shares', true);
    assert.ok(Math.abs(v - 2.6) < 1e-9);
  });
});

describe('ttmDividendsPerShare', () => {
  const divFacts = (entries) => ({
    'us-gaap': { CommonStockDividendsPerShareDeclared: { units: { 'USD/shares': entries } } },
  });
  const q = (start, end, val, filed) => ({ start, end, val, accn: 'a', fy: 2026, fp: 'Q', form: '10-Q', filed });

  it('sums quarterly slices, skipping YTD aggregates', () => {
    const facts = divFacts([
      q('2025-07-01', '2025-09-30', 1.5, '2025-11-01'),
      q('2025-10-01', '2025-12-31', 1.5, '2026-02-01'),
      q('2026-01-01', '2026-03-31', 1.5, '2026-05-01'),
      q('2026-04-01', '2026-06-30', 1.5, '2026-08-01'),
      // YTD aggregate for the same quarter-end: must not double-count.
      { start: '2026-01-01', end: '2026-06-30', val: 3.0, accn: 'b', fy: 2026, fp: 'Q2', form: '10-Q', filed: '2026-08-01' },
    ]);
    assert.equal(ttmDividendsPerShare(facts, 'JPM'), 6.0);
  });

  it('annualises partial histories and returns null without data', () => {
    const two = divFacts([
      q('2026-01-01', '2026-03-31', 0.5, '2026-05-01'),
      q('2026-04-01', '2026-06-30', 0.5, '2026-08-01'),
    ]);
    assert.equal(ttmDividendsPerShare(two, 'META'), 2.0);
    assert.equal(ttmDividendsPerShare({ 'us-gaap': {} }, 'RIVN'), null);
    assert.equal(ttmDividendsPerShare(null, 'RIVN'), null);
  });
});

describe('cagr', () => {
  it('annualises first-to-last growth over the calendar span', () => {
    const v = cagr([
      { year: '2022', end: '2022-12-31', value: 100, filed: 'x' },
      { year: '2024', end: '2024-12-31', value: 400, filed: 'x' },
    ]);
    // Quadrupled over ~2 years: ~100% a year.
    assert.ok(Math.abs(v - 1) < 0.005, `got ${v}`);
  });

  it('returns null without a measurable span', () => {
    assert.equal(cagr([{ year: '2024', end: '2024-12-31', value: 100, filed: 'x' }]), null);
    assert.equal(
      cagr([
        { year: '2023', end: '2023-12-31', value: -50, filed: 'x' },
        { year: '2024', end: '2024-12-31', value: 100, filed: 'x' },
      ]),
      null,
    );
    assert.equal(cagr([]), null);
  });
});

describe('buildPsHistory', () => {
  const revenue = {
    key: 'revenue',
    label: 'Revenue',
    unit: 'USD',
    points: [
      { year: '2024', end: '2024-12-31', value: 200, filed: 'x' },
      { year: '2025', end: '2025-12-31', value: 400, filed: 'x' },
    ],
  };
  const shares = {
    key: 'shares',
    label: 'Shares',
    unit: 'shares',
    points: [
      { year: '2024', end: '2024-12-31', value: 10, filed: 'x' },
      { year: '2025', end: '2025-12-31', value: 10, filed: 'x' },
    ],
  };

  it('divides year-end close by revenue per share', () => {
    const ps = buildPsHistory(revenue, shares, [
      { date: '2024-12-31', close: 100 }, // SPS 20 -> 5.0
      { date: '2025-12-31', close: 120 }, // SPS 40 -> 3.0
    ]);
    assert.deepEqual(
      ps.map((p) => [p.year, p.value]),
      [
        ['2024', 5],
        ['2025', 3],
      ],
    );
  });

  it('needs both legs and history', () => {
    assert.equal(buildPsHistory(undefined, shares, [{ date: '2024-12-31', close: 1 }]), null);
    assert.equal(buildPsHistory(revenue, undefined, [{ date: '2024-12-31', close: 1 }]), null);
    assert.equal(buildPsHistory(revenue, shares, []), null);
  });
});

describe('downsampleWeekly', () => {
  it('keeps the last close of each calendar week', () => {
    const out = downsampleWeekly([
      { date: '2024-01-01', close: 1 }, // Monday
      { date: '2024-01-03', close: 2 },
      { date: '2024-01-05', close: 3 }, // Friday wins
      { date: '2024-01-08', close: 4 }, // next Monday
    ]);
    assert.deepEqual(out, [
      { date: '2024-01-05', close: 3 },
      { date: '2024-01-08', close: 4 },
    ]);
  });
});

describe('periodReturn', () => {
  it('measures last close vs the first close on or after the cutoff', () => {
    const r = periodReturn(
      [
        { date: '2023-06-01', close: 50 },
        { date: '2024-01-02', close: 100 },
        { date: '2025-01-02', close: 150 },
      ],
      1,
    );
    assert.equal(r, 0.5);
  });

  it('measures from its own start when history is shorter than the window', () => {
    const r = periodReturn(
      [
        { date: '2024-06-01', close: 100 },
        { date: '2025-01-02', close: 120 },
      ],
      5,
    );
    assert.ok(Math.abs(r - 0.2) < 1e-9, `got ${r}`);
  });

  it('returns null without two points', () => {
    assert.equal(periodReturn([{ date: '2025-01-02', close: 1 }], 1), null);
    assert.equal(periodReturn([], 1), null);
  });
});

describe('filingEventLabel', () => {
  it('labels 8-Ks by their first mapped item', () => {
    assert.equal(filingEventLabel('8-K', '2.02,9.01'), 'Earnings');
    assert.equal(filingEventLabel('8-K', '5.02'), 'Management change');
  });

  it('stays null for other forms and unmapped items', () => {
    assert.equal(filingEventLabel('10-K', '2.02'), null);
    assert.equal(filingEventLabel('8-K', '9.01'), null);
    assert.equal(filingEventLabel('8-K', undefined), null);
  });
});

describe('findFormUrl', () => {
  it('returns the latest matching filing URL', () => {
    const recent = {
      form: ['8-K', 'DEF 14A', '10-Q'],
      accessionNumber: ['0001', '0001326801-26-000001', '0003'],
      primaryDocument: ['a.htm', 'meta-proxy.htm', 'c.htm'],
    };
    assert.equal(
      findFormUrl(recent, '0001326801', 'DEF 14A'),
      'https://www.sec.gov/Archives/edgar/data/1326801/000132680126000001/meta-proxy.htm',
    );
  });

  it('returns null when the form never appears', () => {
    assert.equal(findFormUrl({ form: ['8-K'] }, '0001326801', 'DEF 14A'), null);
    assert.equal(findFormUrl(null, '0001326801', 'DEF 14A'), null);
  });
});

describe('parseWikidataCompanyFacts', () => {
  it('reads title, founding year, HQ and CEO from one binding', () => {
    const out = parseWikidataCompanyFacts({
      article: { value: 'https://en.wikipedia.org/wiki/NVIDIA' },
      inception: { value: '1993-04-05T00:00:00Z' },
      hq: { value: 'Santa Clara' },
      ceo: { value: 'Jensen Huang' },
    });
    assert.deepEqual(out, { title: 'NVIDIA', founded: '1993', headquarters: 'Santa Clara', ceo: 'Jensen Huang' });
  });

  it('needs the article and tolerates missing facts', () => {
    assert.equal(parseWikidataCompanyFacts(undefined), null);
    assert.equal(parseWikidataCompanyFacts({}), null);
    const out = parseWikidataCompanyFacts({ article: { value: 'https://en.wikipedia.org/wiki/Some_Co' } });
    assert.deepEqual(out, { title: 'Some Co', founded: null, headquarters: null, ceo: null });
  });
});

describe('buildFinancials equity row', () => {
  it('builds a Total equity series from StockholdersEquity', () => {
    const facts = {
      'us-gaap': {
        StockholdersEquity: {
          units: { USD: [{ end: '2024-12-31', val: 500, accn: 'a', fy: 2024, fp: 'FY', form: '10-K', filed: '2025-01-01' }] },
        },
      },
    };
    const built = buildFinancials(facts, 'META');
    const equity = built.series.find((s) => s.key === 'equity');
    assert.equal(equity.label, 'Total equity');
    assert.equal(equity.points[0].value, 500);
  });
});

describe('htmlToText', () => {
  it('drops scripts and styles, keeps paragraphs and bold markers', () => {
    const text = htmlToText(
      '<html><head><style>.x{color:red}</style><script>alert(1)</script></head>' +
        '<body><p>First &amp; second.</p><p><b>Bold lead</b> continues here.</p></body></html>',
    );
    assert.equal(text, 'First & second.\n**Bold lead** continues here.');
  });

  it('decodes entities', () => {
    assert.equal(decodeHtmlEntities('A&nbsp;B&mdash;C&#39;D&#x27;E&unknown;'), 'A B—C\'D\'E&unknown;');
  });
});

describe('extractItemSection', () => {
  const items = ['1', '1A', '1B', '2'];
  const filler = 'All about the business operations and strategy across many regions. ';
  const body1 = `ITEM 1. BUSINESS\n${filler.repeat(8)}`;
  const body1a = `ITEM 1A. RISK FACTORS\n${'Every risk the lawyers could think of, listed in full detail here. '.repeat(8)}`;
  const text = ['TABLE OF CONTENTS', 'ITEM 1 Business 5', 'ITEM 1A Risk Factors 12', body1, body1a, 'ITEM 1B. NONE'].join('\n');

  it('picks the body over the table of contents', () => {
    const s = extractItemSection(text, items, '1');
    assert.ok(s.startsWith('ITEM 1. BUSINESS'));
    assert.ok(s.includes('All about the business'));
    assert.ok(!s.includes('TABLE OF CONTENTS'));
    assert.ok(!s.includes('Every risk'));
  });

  it('keeps ITEM 1 from matching ITEM 1A, 1B, or 10-plus', () => {
    assert.equal(extractItemSection('ITEM 1A. RISK FACTORS\n' + 'x'.repeat(300) + '\nITEM 10. STUFF', items, '1'), null);
    assert.ok(extractItemSection(text, items, '1A').startsWith('ITEM 1A. RISK FACTORS'));
  });

  it('returns null when the item never appears', () => {
    assert.equal(extractItemSection('no items here', items, '1A'), null);
  });

  it('starts at the true start past page-header reruns (MSFT layout)', () => {
    const rerun = `3\nPART I\nItem 1\n${filler.repeat(8)}`;
    const t = ['TABLE OF CONTENTS', 'ITEM 1 Business 5', 'ITEM 1A Risk Factors 12', body1, rerun, body1a, 'ITEM 1B. NONE'].join('\n');
    const s = extractItemSection(t, items, '1');
    assert.ok(s.startsWith('ITEM 1. BUSINESS'));
    assert.ok(s.includes('All about the business'));
  });
});

describe('extractBusinessExcerpt', () => {
  it('skips the heading and boilerplate, ends on a sentence', () => {
    const out = extractBusinessExcerpt(
      'ITEM 1. BUSINESS\nThis Annual Report contains forward-looking statements that involve risks.\n' +
        'Acme Corp designs and sells widgets worldwide to millions of customers. It also runs a small services arm. A third sentence follows here for length.',
      120,
    );
    assert.ok(out.startsWith('Acme Corp designs'));
    assert.ok(!out.includes('forward-looking'));
    assert.ok(out.endsWith('.'));
    assert.ok(out.length <= 121);
  });

  it('rejects disclaimer and definitional openers (AMD shape)', () => {
    const out = extractBusinessExcerpt(
      'ITEM 1. BUSINESS\n' +
      'Additionally, we make certain voluntary disclosures in this report and on our website for stakeholders.\n' +
      'References in this Annual Report on Form 10-K to "Acme," "we," and "our" mean Acme Corp.\n' +
      'Overview\n' +
      'Acme Corp designs and sells widgets worldwide to millions of customers. It also runs a small services arm for enterprises.',
    );
    assert.ok(out.startsWith('Acme Corp designs'));
    assert.ok(!out.includes('voluntary'));
  });

  it('returns null when only disclaimers survive', () => {
    assert.equal(
      extractBusinessExcerpt(
        'ITEM 1. BUSINESS\nAdditionally, we make voluntary disclosures on our website.\nFurthermore, this information may change.',
      ),
      null,
    );
  });

  it('collapses spaces before punctuation', () => {
    const out = extractBusinessExcerpt(
      'ITEM 1. BUSINESS\nWe enrich life for all .\nWe also sell many fine widgets worldwide to customers.\nOur factories run day and night to meet demand.',
    );
    assert.ok(out.includes('life for all.'));
    assert.ok(!out.includes(' .'));
  });
});

describe('extractSegmentNames', () => {
  it('parses inline colon lists', () => {
    assert.deepEqual(
      extractSegmentNames(
        null,
        'We have organized our operations into three segments: North America, International, and Amazon Web Services ("AWS").',
      ),
      ['North America', 'International', 'Amazon Web Services ("AWS")'],
    );
  });

  it('splits marker lists without commas', () => {
    assert.deepEqual(
      extractSegmentNames('We operate as two reportable segments: (i) automotive and (ii) energy generation and storage.', null),
      ['Automotive', 'Energy Generation and Storage'],
    );
  });

  it('reads "The X segment" lead-ins', () => {
    assert.deepEqual(
      extractSegmentNames(
        'We report our business results in two segments. The Compute & Networking segment includes data center platforms. The Graphics segment includes GeForce GPUs.',
        null,
      ),
      ['Compute & Networking', 'Graphics'],
    );
  });

  it('reads bullet lists after a trailing colon', () => {
    assert.deepEqual(
      extractSegmentNames(
        null,
        'Our reportable segments are:\n• Data Center\n• Client\n• Embedded\nWe sell chips.',
      ),
      ['Data Center', 'Client', 'Embedded'],
    );
  });

  it('reads business-unit bullets without the word segment', () => {
    assert.deepEqual(
      extractSegmentNames(
        null,
        'We have the following four business units, which are our reportable segments:\n' +
        '• Cloud Memory Business Unit ("CMBU"): Focused on memory for hyperscalers.\n' +
        '• Mobile and Client Business Unit ("MCBU"): Focused on memory for phones.\n' +
        '7 | 2025 10-K',
      ),
      ['Cloud Memory', 'Mobile and Client'],
    );
  });

  it('returns [] when nothing parses', () => {
    assert.deepEqual(extractSegmentNames(null, null), []);
    assert.deepEqual(extractSegmentNames('We sell widgets.', 'We sell widgets worldwide.'), []);
  });
});

describe('extractEmployeeCount', () => {
  it('reads headcount with and without qualifiers', () => {
    assert.deepEqual(
      extractEmployeeCount('As of December 27, 2025, we had approximately 31,000 employees in our global workforce.'),
      { count: 31000, approximate: true },
    );
    assert.deepEqual(
      extractEmployeeCount('We employed approximately 1,576,000 full-time and part-time employees worldwide.'),
      { count: 1576000, approximate: true },
    );
    assert.deepEqual(extractEmployeeCount('We have 500 employees.'), { count: 500, approximate: false });
  });

  it('reads workforce, headcount, and qualified-people shapes', () => {
    assert.deepEqual(
      extractEmployeeCount('We had a global workforce of 78,865 employees as of December 31, 2025.'),
      { count: 78865, approximate: false },
    );
    assert.deepEqual(
      extractEmployeeCount('As of December 31, 2025, our employee headcount worldwide was 134,785.'),
      { count: 134785, approximate: false },
    );
    assert.deepEqual(
      extractEmployeeCount('We employed approximately 223,000 people on a full-time basis.'),
      { count: 223000, approximate: true },
    );
  });

  it('ignores subset and culture mentions', () => {
    assert.equal(extractEmployeeCount('With over 29,000 employees globally advancing their careers.'), null);
    assert.equal(extractEmployeeCount('Our employees are driven by our vision.'), null);
    assert.equal(extractEmployeeCount('We employed 200 people in our Austin office.'), null);
    assert.equal(extractEmployeeCount(null), null);
  });
});

describe('formatHeadquarters', () => {
  it('keeps city and region from SEC addresses', () => {
    assert.equal(formatHeadquarters('2485 AUGUSTINE DRIVE, SANTA CLARA, CA, 95054'), 'Santa Clara, CA');
    assert.equal(formatHeadquarters('SANTA CLARA, CA, 95054'), 'Santa Clara, CA');
    assert.equal(formatHeadquarters('AUSTIN, TX'), 'Austin, TX');
    assert.equal(formatHeadquarters('DUBLIN, IRELAND'), 'Dublin, Ireland');
  });

  it('passes through or blanks the rest', () => {
    assert.equal(formatHeadquarters('CUPERTINO'), 'Cupertino');
    assert.equal(formatHeadquarters('One Apple Park Way, Cupertino, California'), 'Cupertino, California');
    assert.equal(formatHeadquarters(null), null);
    assert.equal(formatHeadquarters(''), null);
  });
});

describe('cleanSpacing', () => {
  it('collapses spaces before closing punctuation', () => {
    assert.equal(cleanSpacing('enrich life for all .'), 'enrich life for all.');
    assert.equal(cleanSpacing('it costs $ 5 ( ex-quay ) .'), 'it costs $ 5 (ex-quay).');
    assert.equal(cleanSpacing('say "hi" to them'), 'say "hi" to them');
  });
});

describe('extractSegmentFinancials', () => {
  const REV = 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax';
  const OP = 'us-gaap:OperatingIncomeLoss';
  function ctx(id, start, end, member) {
    const dim = member
      ? `<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">${member}</xbrli:explicitMember></xbrli:segment>`
      : '';
    return `<xbrli:context id="${id}"><xbrli:period><xbrli:startDate>${start}</xbrli:startDate><xbrli:endDate>${end}</xbrli:endDate></xbrli:period>${dim}</xbrli:context>`;
  }
  function fact(name, ctxId, value, extra = '') {
    return `<ix:nonFraction name="${name}" contextRef="${ctxId}" unitRef="usd" scale="6" decimals="-6"${extra}>${value}</ix:nonFraction>`;
  }
  const UNITS = '<xbrli:unit id="usd"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
    '<xbrli:unit id="shares"><xbrli:measure>xbrli:shares</xbrli:measure></xbrli:unit>';
  const CONTEXTS =
    ctx('c0', '2024-01-01', '2024-12-31') + ctx('c1', '2025-01-01', '2025-12-31') +
    ctx('a4', '2024-01-01', '2024-12-31', 'acme:AlphaSegmentMember') +
    ctx('a5', '2025-01-01', '2025-12-31', 'acme:AlphaSegmentMember') +
    ctx('b4', '2024-01-01', '2024-12-31', 'acme:BetaMember') +
    ctx('b5', '2025-01-01', '2025-12-31', 'acme:BetaMember') +
    ctx('o4', '2024-01-01', '2024-12-31', 'acme:AllOtherMember') +
    ctx('o5', '2025-01-01', '2025-12-31', 'acme:AllOtherMember') +
    '<xbrli:context id="i5"><xbrli:period><xbrli:instant>2025-12-31</xbrli:instant></xbrli:period>' +
    '<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">acme:AlphaSegmentMember</xbrli:explicitMember></xbrli:segment></xbrli:context>' +
    '<xbrli:context id="m5"><xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period>' +
    '<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">acme:AlphaSegmentMember</xbrli:explicitMember></xbrli:segment>' +
    '<xbrli:scenario><xbrli:explicitMember dimension="us-gaap:ProductOrServiceAxis">acme:WidgetMember</xbrli:explicitMember></xbrli:scenario></xbrli:context>';
  const html =
    `<html><body><div style="display:none">${UNITS}${CONTEXTS}</div><p>` +
    // Non-USD fact first: unit exclusion must beat first-wins.
    `<ix:nonFraction name="${REV}" contextRef="a5" unitRef="shares" scale="6">777</ix:nonFraction>` +
    fact(REV, 'a4', '60') + fact(REV, 'a5', '16,635') +
    fact(REV, 'b4', '40') + fact(REV, 'b5', '30') +
    fact(REV, 'o4', '8') + fact(REV, 'o5', '5') +
    fact(REV, 'c0', '108') + fact(REV, 'c1', '16670') +
    fact(OP, 'a5', '20') + `<ix:nonFraction name="${OP}" contextRef="b5" unitRef="usd" scale="6" sign="-">5</ix:nonFraction>` +
    `<ix:nonFraction name="${OP}" contextRef="b4" unitRef="usd" scale="6" format="ixt:fixed-zero">&#8212;</ix:nonFraction>` +
    fact(OP, 'c1', '15') +
    fact(REV, 'i5', '111') + fact(REV, 'm5', '999') +
    '</p></body></html>';

  it('builds revenue and op-income series with humanized members', () => {
    const out = extractSegmentFinancials(html);
    assert.equal(out.revenue.concept, 'RevenueFromContractWithCustomerExcludingAssessedTax');
    assert.deepEqual(out.revenue.years, [2024, 2025]);
    assert.deepEqual(out.revenue.members, ['Alpha', 'Beta', 'All Other']);
    assert.deepEqual(out.revenue.values[0], [60e6, 16635e6]);
    assert.deepEqual(out.revenue.totals, [108e6, 16670e6]);
    assert.deepEqual(out.opIncome.members, ['Alpha', 'Beta']);
    assert.deepEqual(out.opIncome.years, [2024, 2025]);
    assert.deepEqual(out.opIncome.values, [[null, 20e6], [0, -5e6]]);
  });

  it('returns nulls without segment data or on mismatch', () => {
    assert.deepEqual(extractSegmentFinancials(null), { revenue: null, opIncome: null });
    assert.deepEqual(extractSegmentFinancials('<html></html>'), { revenue: null, opIncome: null });
    const bad = html.replace('16670', '99999');
    assert.equal(extractSegmentFinancials(bad).revenue, null);
  });

  it('accepts consolidation-typed contexts and expands acronyms', () => {
    function tctx(id, member) {
      return `<xbrli:context id="${id}"><xbrli:period><xbrli:startDate>2024-08-31</xbrli:startDate><xbrli:endDate>2025-08-28</xbrli:endDate></xbrli:period>` +
        `<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">${member}</xbrli:explicitMember></xbrli:segment>` +
        '<xbrli:scenario><xbrli:explicitMember dimension="us-gaap:ConsolidationItemsAxis">us-gaap:OperatingSegmentsMember</xbrli:explicitMember></xbrli:scenario></xbrli:context>';
    }
    const typed =
      '<html><body><div><xbrli:unit id="u"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
      '<xbrli:context id="c"><xbrli:period><xbrli:startDate>2024-08-31</xbrli:startDate><xbrli:endDate>2025-08-28</xbrli:endDate></xbrli:period></xbrli:context>' +
      tctx('s1', 'mu:CMBUMember') + tctx('s2', 'mu:CDBUMember') + '</div><p>' +
      `<ix:nonFraction name="${REV}" contextRef="s1" unitRef="u" scale="6">13524</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="s2" unitRef="u" scale="6">7229</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="c" unitRef="u" scale="6">20753</ix:nonFraction>` +
      '</p></body></html>';
    const out = extractSegmentFinancials(
      typed,
      'Cloud Memory Business Unit (“CMBU”) and Core Data Center Business Unit (“CDBU”) are units.',
    );
    assert.deepEqual(out.revenue.members, ['Cloud Memory', 'Core Data Center']);
    assert.deepEqual(out.revenue.values, [[13524e6], [7229e6]]);
  });

  it('adds consolidation buckets and strips plural suffixes', () => {
    const R = 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax';
    const per = '<xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period>';
    const segCtx = (id, member) =>
      `<xbrli:context id="${id}">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">${member}</xbrli:explicitMember></xbrli:segment></xbrli:context>`;
    const html =
      '<html><body><div><xbrli:unit id="u"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
      `<xbrli:context id="c">${per}</xbrli:context>` +
      segCtx('a', 'acme:AlphaSegmentMember') + segCtx('o', 'acme:AllOtherSegmentsMember') +
      '<xbrli:context id="e">' + per +
      '<xbrli:segment><xbrli:explicitMember dimension="us-gaap:ConsolidationItemsAxis">us-gaap:ConsolidationEliminationsMember</xbrli:explicitMember></xbrli:segment></xbrli:context>' +
      '</div><p>' +
      `<ix:nonFraction name="${R}" contextRef="a" unitRef="u">90</ix:nonFraction>` +
      `<ix:nonFraction name="${R}" contextRef="o" unitRef="u">20</ix:nonFraction>` +
      `<ix:nonFraction name="${R}" contextRef="e" unitRef="u" sign="-">10</ix:nonFraction>` +
      `<ix:nonFraction name="${R}" contextRef="c" unitRef="u">100</ix:nonFraction>` +
      '</p></body></html>';
    const out = extractSegmentFinancials(html);
    assert.deepEqual(out.revenue.members, ['Alpha', 'All Other', 'Eliminations']);
    assert.deepEqual(out.revenue.values, [[90], [20], [-10]]);
  });

  it('signed reconciling copy wins over unsigned magnitude (AMD shape)', () => {
    const per = '<xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period>';
    const segCtx = (id, member) =>
      `<xbrli:context id="${id}">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">${member}</xbrli:explicitMember></xbrli:segment></xbrli:context>`;
    const corpCtx = (id, member) =>
      `<xbrli:context id="${id}">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:ConsolidationItemsAxis">${member}</xbrli:explicitMember></xbrli:segment></xbrli:context>`;
    const html =
      '<html><body><div><xbrli:unit id="u"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
      `<xbrli:context id="c">${per}</xbrli:context>` +
      segCtx('a', 'acme:AlphaSegmentMember') + segCtx('b', 'acme:BetaMember') +
      corpCtx('r', 'us-gaap:MaterialReconcilingItemsMember') +
      corpCtx('s', 'us-gaap:OperatingSegmentsMember') +
      '</div><p>' +
      `<ix:nonFraction name="${OP}" contextRef="a" unitRef="u">3603</ix:nonFraction>` +
      `<ix:nonFraction name="${OP}" contextRef="b" unitRef="u">2855</ix:nonFraction>` +
      `<ix:nonFraction name="${OP}" contextRef="r" unitRef="u">4007</ix:nonFraction>` +
      `<ix:nonFraction name="${OP}" contextRef="s" unitRef="u" sign="-">4007</ix:nonFraction>` +
      `<ix:nonFraction name="${OP}" contextRef="c" unitRef="u">2451</ix:nonFraction>` +
      '</p></body></html>';
    const out = extractSegmentFinancials(html);
    assert.deepEqual(out.opIncome.members, ['Alpha', 'Beta', 'Corporate and Other']);
    assert.deepEqual(out.opIncome.values, [[3603], [2855], [-4007]]);
    assert.deepEqual(out.opIncome.totals, [2451]);
  });

  it('drops all-zero members (MU zero Corporate revenue)', () => {
    const per = '<xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period>';
    const segCtx = (id, member) =>
      `<xbrli:context id="${id}">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">${member}</xbrli:explicitMember></xbrli:segment></xbrli:context>`;
    const html =
      '<html><body><div><xbrli:unit id="u"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
      `<xbrli:context id="c">${per}</xbrli:context>` +
      segCtx('a', 'acme:AlphaSegmentMember') + segCtx('b', 'acme:BetaMember') +
      `<xbrli:context id="z">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:ConsolidationItemsAxis">us-gaap:CorporateNonSegmentMember</xbrli:explicitMember></xbrli:segment></xbrli:context>` +
      '</div><p>' +
      `<ix:nonFraction name="${REV}" contextRef="a" unitRef="u">9000</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="b" unitRef="u">2000</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="z" unitRef="u" format="ixt:fixed-zero">&#8212;</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="c" unitRef="u">11000</ix:nonFraction>` +
      '</p></body></html>';
    const out = extractSegmentFinancials(html);
    assert.deepEqual(out.revenue.members, ['Alpha', 'Beta']);
    assert.deepEqual(out.revenue.values, [[9000], [2000]]);
  });

  it('retries without buckets that break reconciliation', () => {
    const per = '<xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period>';
    const segCtx = (id, member) =>
      `<xbrli:context id="${id}">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">${member}</xbrli:explicitMember></xbrli:segment></xbrli:context>`;
    const html =
      '<html><body><div><xbrli:unit id="u"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
      `<xbrli:context id="c">${per}</xbrli:context>` +
      segCtx('a', 'acme:AlphaSegmentMember') + segCtx('b', 'acme:BetaMember') +
      `<xbrli:context id="e">${per}<xbrli:segment><xbrli:explicitMember dimension="us-gaap:ConsolidationItemsAxis">us-gaap:ConsolidationEliminationsMember</xbrli:explicitMember></xbrli:segment></xbrli:context>` +
      '</div><p>' +
      `<ix:nonFraction name="${REV}" contextRef="a" unitRef="u">90</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="b" unitRef="u">20</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="e" unitRef="u">50</ix:nonFraction>` +
      `<ix:nonFraction name="${REV}" contextRef="c" unitRef="u">110</ix:nonFraction>` +
      '</p></body></html>';
    const out = extractSegmentFinancials(html);
    assert.deepEqual(out.revenue.members, ['Alpha', 'Beta']);
    assert.deepEqual(out.revenue.totals, [110]);
  });

  it('ignores quarterly contexts', () => {
    const q =
      '<html><body><div><xbrli:unit id="u"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>' +
      '<xbrli:context id="q"><xbrli:period><xbrli:startDate>2025-09-28</xbrli:startDate><xbrli:endDate>2025-12-27</xbrli:endDate></xbrli:period>' +
      '<xbrli:segment><xbrli:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">acme:AlphaSegmentMember</xbrli:explicitMember></xbrli:segment></xbrli:context>' +
      '</div><p>' +
      `<ix:nonFraction name="${REV}" contextRef="q" unitRef="u" scale="6">999</ix:nonFraction>` +
      '</p></body></html>';
    assert.deepEqual(extractSegmentFinancials(q), { revenue: null, opIncome: null });
  });
});

describe('isSingleSegmentText', () => {
  it('detects single-segment reporters but not mergers', () => {
    assert.equal(isSingleSegmentText('We operate in one reportable segment.'), true);
    assert.equal(isSingleSegmentText('We have a single operating segment.'), true);
    assert.equal(isSingleSegmentText('We combined the Client and Gaming segments into one reportable segment.'), false);
    assert.equal(isSingleSegmentText('We operate in three segments.'), false);
    assert.equal(isSingleSegmentText(null), false);
  });
});

describe('isOtherSegment', () => {
  it('flags residual buckets', () => {
    assert.equal(isOtherSegment('All Other'), true);
    assert.equal(isOtherSegment('Unallocated'), true);
    assert.equal(isOtherSegment('Data Center'), false);
  });
});

describe('extractCustomerConcentration', () => {
  it('reads named and anonymous concentrations', () => {
    assert.deepEqual(
      extractCustomerConcentration('Apple Inc. accounted for approximately 12% of net sales in 2025.'),
      { who: 'Apple Inc.', pct: 12 },
    );
    assert.deepEqual(
      extractCustomerConcentration('One customer represented 15.5% of revenue.'),
      { who: 'One customer', pct: 15.5 },
    );
    assert.deepEqual(
      extractCustomerConcentration('Our top two customers accounted for 30% of revenue.'),
      { who: 'Top Two Customers', pct: 30 },
    );
  });

  it('returns null for non-findings and missing data', () => {
    assert.equal(extractCustomerConcentration('No single customer accounted for more than 10% of revenue.'), null);
    assert.equal(extractCustomerConcentration('We sell to many customers worldwide.'), null);
    assert.equal(extractCustomerConcentration(null), null);
  });

  it('reads MD&A phrasing with adjectives and total revenue (NVDA shape)', () => {
    assert.deepEqual(
      extractCustomerConcentration('For fiscal year 2026, sales to one direct customer represented 22% of total revenue.'),
      { who: 'One customer', pct: 22 },
    );
    assert.deepEqual(
      extractCustomerConcentration('Sales to two direct customers each represented 11% of total revenue.'),
      { who: 'Two customers', pct: 11 },
    );
    assert.deepEqual(
      extractCustomerConcentration('Apple Inc. accounted for 12% of total revenue.'),
      { who: 'Apple Inc.', pct: 12 },
    );
  });

  it('rejects receivables, geographic splits, and threshold non-findings', () => {
    assert.equal(extractCustomerConcentration('One customer represented 15% of accounts receivable.'), null);
    assert.equal(
      extractCustomerConcentration(
        'Revenue from sales to customers headquartered outside of the United States accounted for 31% of total revenue.',
      ),
      null,
    );
    assert.equal(
      extractCustomerConcentration('No customer accounted for 10% or more of total revenue in 2023.'),
      null,
    );
  });
});

describe('formatFilingDate', () => {
  it('renders SEC ISO dates readably', () => {
    assert.equal(formatFilingDate('2025-11-20'), 'Nov 20, 2025');
    assert.equal(formatFilingDate('2026-02-05'), 'Feb 5, 2026');
  });

  it('returns null when unparseable', () => {
    assert.equal(formatFilingDate('2025-13-01'), null);
    assert.equal(formatFilingDate('Nov 20, 2025'), null);
    assert.equal(formatFilingDate(null), null);
  });
});

describe('extractCompetition', () => {
  it('reads the subsection and stops at the next subheading', () => {
    const out = extractCompetition(
      'ITEM 1. BUSINESS\nWe make things.\nCompetition\nWe compete with Globex and Initech in every market where we operate, and the field keeps growing each year.\nGovernment Regulations\nMany rules apply to our operations.',
    );
    assert.ok(out.includes('Globex and Initech'));
    assert.ok(!out.includes('Government Regulations'));
  });

  it('handles a bold lead-in on the first line', () => {
    const out = extractCompetition('ITEM 1. BUSINESS\n**Competition.** Rivals include Hooli and massive incumbents with deep pockets, long histories, and global reach.\nEmployees\nWe employ many people worldwide.');
    assert.ok(out.includes('Hooli'));
  });

  it('returns null without a competition subsection', () => {
    assert.equal(extractCompetition('ITEM 1. BUSINESS\nWe make things and sell them widely.'), null);
  });
});

describe('extractBusinessModel', () => {
  const tslaStyle = [
    'ITEM 1. BUSINESS',
    'Overview',
    'We are focused on bringing artificial intelligence into the real world through robots and cars.',
    'Segment Information',
    'We operate as two reportable segments: automotive and energy.',
    'The automotive segment includes vehicle sales and leasing as well as sales of automotive regulatory credits.',
    'Our Products and Services',
    'Automotive',
    'We currently manufacture five different consumer vehicles, the Model 3, Y, S, X and Cybertruck.',
    '2',
    'Table of Contents',
    'Energy Generation and Storage',
    'Powerwall and Megapack are our battery energy storage products for homes and utilities.',
    'Sales and Marketing',
    'We sell through our website and a global network of company-owned stores.',
    'Competition',
    'We compete with legacy automakers in every market where we operate today.',
  ].join('\n');

  it('reads segments, products, and sales — skipping the mission fluff and page reruns', () => {
    const out = extractBusinessModel(tslaStyle);
    assert.ok(out.startsWith('We operate as two reportable segments'), `got: ${out}`);
    assert.ok(out.includes('regulatory credits'));
    assert.ok(out.includes('Model 3'));
    assert.ok(out.includes('company-owned stores'));
    assert.ok(!out.includes('artificial intelligence into the real world'));
    assert.ok(!out.includes('Table of Contents'));
    assert.ok(!out.includes('legacy automakers'));
    assert.ok(out.endsWith('.'));
  });

  it('orders by priority, not document order', () => {
    const flipped = [
      'ITEM 1. BUSINESS',
      'Sales and Marketing',
      'We sell through our website and a global network of company-owned stores.',
      'Segment Information',
      'We operate as two reportable segments: automotive and energy generation and storage.',
    ].join('\n');
    const out = extractBusinessModel(flipped);
    assert.ok(out.startsWith('We operate as two reportable segments'), `got: ${out}`);
  });

  it('reads a 20-F Business Overview past its enumerator', () => {
    const out = extractBusinessModel(
      'ITEM 4. INFORMATION ON THE COMPANY\nA. History and Development\nFounded long ago in a distant land, growing ever since.\nB. Business Overview\nWe design and sell widgets worldwide to millions of customers across every continent and region. Our factories run day and night to meet demand.',
    );
    assert.ok(out.startsWith('We design and sell widgets'), `got: ${out}`);
  });

  it('matches fully bold headings too', () => {
    const out = extractBusinessModel(
      'ITEM 1. BUSINESS\n**Our Businesses**\nWe report results in two segments, widgets and gadgets, selling both worldwide to millions of customers. Each segment runs its own factories and stores.',
    );
    assert.ok(out.startsWith('We report results in two segments'), `got: ${out}`);
  });

  it('ignores support, warranty, and development lookalikes', () => {
    const none = extractBusinessModel(
      'ITEM 1. BUSINESS\nWe make things and sell them widely to many happy customers.\nService and Warranty\nWe service what we sell at our own locations.\nCustomer Service\nCall us any time, day or night, for help with products.\nProduct Development\nOur engineers invent the future in our many research laboratories.',
    );
    assert.equal(none, null);
  });
});

describe('extractRiskHeadings', () => {
  it('collects bold risk titles, deduped and capped', () => {
    const out = extractRiskHeadings(
      'ITEM 1A. RISK FACTORS\n**Our revenue depends on a single customer that may leave at any time.** Details follow here.\n' +
        '**Our revenue depends on a single customer that may leave at any time.** Repeated on next page.\n**Supply chain shocks could halt production for many months at a time.** More detail.',
      5,
    );
    assert.deepEqual(out, [
      'Our revenue depends on a single customer that may leave at any time.',
      'Supply chain shocks could halt production for many months at a time.',
    ]);
  });

  it('keeps the text after the last bullet and drops TOC prefixes', () => {
    const out = extractRiskHeadings(
      'ITEM 1A. RISK FACTORS\n**Risk Factors Summary Risks Related to Markets • Failure to meet demand may hurt results badly.**\n**12 Table of Contents • Supply shocks could halt production for many long months.**',
      5,
    );
    assert.deepEqual(out, [
      'Failure to meet demand may hurt results badly.',
      'Supply shocks could halt production for many long months.',
    ]);
  });

  it('falls back to opening sentences when nothing is bold', () => {
    const out = extractRiskHeadings(
      'ITEM 1A. RISK FACTORS\nLosing our largest customer would cut revenue sharply and force painful restructuring across the company.\nA second material risk paragraph follows with enough length to qualify here.',
      5,
    );
    assert.equal(out.length, 2);
    assert.ok(out[0].startsWith('Losing our largest customer'));
  });
});

describe('buildFilingInsights', () => {
  it('carves business, competition, and risks out of a 10-K', () => {
    const html =
      '<html><body><p>TABLE OF CONTENTS</p><p>ITEM 1 Business</p><p>ITEM 1A Risk Factors</p>' +
      '<p>ITEM 1. BUSINESS</p>' +
      '<p>Acme Corp designs, manufactures, and sells premium widgets to customers in over forty countries worldwide.</p>' +
      '<p>Additional background on operations, history, and strategy fills out this section at length.</p>' +
      '<p>Competition</p>' +
      '<p>We compete with Globex Corporation and Initech LLC, both larger rivals with broader sales networks.</p>' +
      '<p>ITEM 1A. RISK FACTORS</p>' +
      '<p><b>Losing our largest distributor would cut revenue sharply for several quarters running.</b> ' +
      'The distributor relationship spans many years and covers most regions where we currently sell products.</p>' +
      '<p>ITEM 1B. UNRESOLVED STAFF COMMENTS</p></body></html>';
    const out = buildFilingInsights(html, '10-K', 'https://example.com/10k.htm');
    assert.ok(out.business.startsWith('Acme Corp designs'));
    assert.ok(out.competition.includes('Globex Corporation'));
    assert.deepEqual(out.risks, ['Losing our largest distributor would cut revenue sharply for several quarters running.']);
    assert.equal(out.form, '10-K');
    assert.deepEqual(out.segments, []);
    assert.equal(out.employeeCount, null);
  });

  it('maps a 20-F onto Items 4 and 3', () => {
    const html =
      '<html><body><p>ITEM 3. KEY INFORMATION</p><p>A. Selected data and other figures appear here first, with several more sentences of financial summary detail.</p>' +
      '<p>D. Risk Factors</p>' +
      '<p><b>Chip demand is cyclical and a downturn would hurt our revenue badly this year.</b> Detail.</p>' +
      '<p>ITEM 4. INFORMATION ON THE COMPANY</p>' +
      '<p>Taiwan Semi makes chips for the whole world and has done so for decades with great success.</p>' +
      '<p>More history and description of fabs, nodes, and customers across many fine paragraphs.</p>' +
      '<p>ITEM 5. OPERATING AND FINANCIAL REVIEW</p></body></html>';
    const out = buildFilingInsights(html, '20-F', 'https://example.com/20f.htm');
    assert.ok(out.business.startsWith('Taiwan Semi makes chips'));
    assert.equal(out.competition, null);
    assert.deepEqual(out.risks, ['Chip demand is cyclical and a downturn would hurt our revenue badly this year.']);
  });

  it('returns null when no item parses', () => {
    assert.equal(buildFilingInsights('<html><body><p>Nothing here.</p></body></html>', '10-K', 'u'), null);
  });

  it('carries the filing date through', () => {
    const html =
      '<html><body><p>ITEM 1. BUSINESS</p>' +
      '<p>Acme Corp designs and sells widgets worldwide to millions of customers across dozens of countries and regions.</p>' +
      '<p>Additional background on operations, history, and strategy fills out this section at considerable length here.</p>' +
      '<p>ITEM 1A. RISK FACTORS</p></body></html>';
    assert.equal(buildFilingInsights(html, '10-K', 'u', '2025-11-20').filingDate, '2025-11-20');
    assert.equal(buildFilingInsights(html, '10-K', 'u').filingDate, null);
  });

  it('carves a business model out of Item 1 money subsections', () => {
    const html =
      '<html><body><p>ITEM 1. BUSINESS</p>' +
      '<p>Overview</p>' +
      '<p>Acme Corp is on a mission to bring abundance to the world through innovation and excellence.</p>' +
      '<p>Segment Information</p>' +
      '<p>We operate as two reportable segments: widgets and gadgets, selling both worldwide.</p>' +
      '<p>Our Products and Services</p>' +
      '<p>We manufacture premium widgets and budget gadgets for homes and businesses everywhere.</p>' +
      '<p>ITEM 1A. RISK FACTORS</p>' +
      '<p><b>Losing our largest distributor would cut revenue sharply for several quarters running.</b></p>' +
      '<p>ITEM 1B. UNRESOLVED STAFF COMMENTS</p></body></html>';
    const out = buildFilingInsights(html, '10-K', 'u');
    assert.ok(out.business.startsWith('Acme Corp is on a mission'));
    assert.ok(out.businessModel.startsWith('We operate as two reportable segments'), `got: ${out.businessModel}`);
    assert.ok(out.businessModel.includes('premium widgets'));
    assert.notEqual(out.businessModel, out.business);
  });

  it('leaves businessModel null when Item 1 has no money subsection', () => {
    const html =
      '<html><body><p>ITEM 1. BUSINESS</p>' +
      '<p>Acme Corp designs, manufactures, and sells premium widgets to customers in over forty countries worldwide.</p>' +
      '<p>Additional background on operations, history, and strategy fills out this section at length.</p>' +
      '<p>ITEM 1A. RISK FACTORS</p>' +
      '<p><b>Losing our largest distributor would cut revenue sharply for several quarters running.</b></p>' +
      '<p>ITEM 1B. UNRESOLVED STAFF COMMENTS</p></body></html>';
    const out = buildFilingInsights(html, '10-K', 'u');
    assert.ok(out.business.startsWith('Acme Corp designs'));
    assert.equal(out.businessModel, null);
  });
});

describe('filing excerpt polish', () => {
  it('drops leading subheads like Overview', () => {
    const out = extractBusinessExcerpt(
      'ITEM 1. BUSINESS\nBUSINESS\nOverview\nAcme Corp designs and sells widgets worldwide to millions of happy customers everywhere, every single day of the year.',
    );
    assert.ok(out.startsWith('Acme Corp designs'));
  });

  it('walks truncation back past abbreviations', () => {
    const out = extractBusinessExcerpt(
      'ITEM 1. BUSINESS\nAcme Corp was founded long ago and grew steadily ever since that day. Our principal office is located at No. 8, Widget Road, Springfield, in a large campus we own outright.',
      150,
    );
    assert.ok(!out.includes('No.'), `got: ${out}`);
    assert.ok(out.endsWith('day.'));
  });

  it('filters boilerplate from risk fallback sentences', () => {
    const out = extractRiskHeadings(
      'ITEM 1A. RISK FACTORS\nYou should carefully consider the risks described below together with all other information in this report.\nLosing our largest customer would cut revenue sharply and force painful restructuring across the company.',
      5,
    );
    assert.equal(out.length, 1);
    assert.ok(out[0].startsWith('Losing our largest customer'));
  });

  it('cleans bullets and TOC prefixes from fallback risks too', () => {
    const out = extractRiskHeadings(
      'ITEM 1A. RISK FACTORS\nRisk Factors Summary Risks Related to Markets\n• Failure to meet demand may hurt results badly and for a long time.\n12 Table of Contents • Supply shocks could halt production for many long months at a time.',
      5,
    );
    assert.deepEqual(out, [
      'Failure to meet demand may hurt results badly and for a long time.',
      'Supply shocks could halt production for many long months at a time.',
    ]);
  });

  it('rejoins hard-wrapped lines before reading fallback risks', () => {
    const out = extractRiskHeadings(
      'ITEM 1A. RISK FACTORS\nWe wish to caution readers that the following factors\ncould cause results to differ materially from our hopes.\nLosing our largest customer would cut revenue\nsharply and force painful restructuring across the company.',
      5,
    );
    assert.equal(out.length, 1);
    assert.ok(out[0].startsWith('Losing our largest customer would cut revenue sharply'));
  });

  it('ends competition excerpts on a sentence, not a wrapped line', () => {
    const out = extractCompetition(
      'ITEM 1. BUSINESS\nCompetition\nWe compete with Globex Corporation in every market where we operate today worldwide. Our rivals keep\nInvestor Relations\nMore text down here that should never appear in the excerpt at all, not ever.',
    );
    assert.ok(out.endsWith('worldwide.'));
    assert.ok(!out.includes('rivals keep'));
  });
});

describe('findAnnualFiling', () => {
  it('finds the annual report past a wall of Form 4s', () => {
    const recent = {
      form: ['4', '4', '8-K', '10-K'],
      accessionNumber: ['a', 'b', 'c', '0001045810-26-000021'],
      primaryDocument: ['a.xml', 'b.xml', 'c.htm', 'nvda-20260125.htm'],
      filingDate: ['2026-01-01', '2026-01-02', '2026-01-03', '2026-02-25'],
    };
    assert.deepEqual(findAnnualFiling(recent, '0001045810'), {
      form: '10-K',
      url: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
      filingDate: '2026-02-25',
    });
  });

  it('returns null without an annual form', () => {
    assert.equal(findAnnualFiling({ form: ['4'], accessionNumber: ['a'], primaryDocument: ['a'] }, '0001045810'), null);
    assert.equal(findAnnualFiling(null, '0001045810'), null);
  });
});

describe('pickFilings event labels', () => {
  it('carries the 8-K event label through to the filing', () => {
    const recent = {
      form: ['8-K', '10-Q'],
      filingDate: ['2026-03-01', '2026-02-01'],
      reportDate: ['2026-03-01', '2025-12-31'],
      accessionNumber: ['0001326801-26-000002', '0001326801-26-000001'],
      primaryDocument: ['meta-8k.htm', 'meta-20251231.htm'],
      items: ['2.02,9.01', ''],
    };
    const out = pickFilings(recent, '0001326801', ['10-K', '10-Q', '8-K'], 10);
    assert.equal(out[0].eventLabel, 'Earnings');
    assert.equal(out[1].eventLabel, null);
  });
});

describe('buildOverviewDescription', () => {
  it('prefers the 10-K business excerpt with the filing URL', () => {
    const out = buildOverviewDescription(
      'Acme Corp designs and sells widgets worldwide.',
      'https://www.sec.gov/Archives/edgar/data/123/abc.htm',
      'Acme Corp',
      'SEC submissions description that should lose.',
      '0000000123',
    );
    assert.deepEqual(out, {
      extract: 'Acme Corp designs and sells widgets worldwide.',
      url: 'https://www.sec.gov/Archives/edgar/data/123/abc.htm',
      title: 'Acme Corp',
      source: 'sec',
      founded: null,
      headquarters: null,
      ceo: null,
    });
  });

  it('falls back to the SEC submissions description for filers with no Item 1', () => {
    const out = buildOverviewDescription(null, null, 'Some Fund', 'A fund that tracks an index.', '0000000456');
    assert.equal(out.extract, 'A fund that tracks an index.');
    assert.equal(out.url, 'https://www.sec.gov/edgar/browse/?CIK=456&owner=exclude');
    assert.equal(out.source, 'sec');
  });

  it('returns null when neither the filing nor submissions describe the company', () => {
    assert.equal(buildOverviewDescription(null, null, 'Acme', null, '0000000123'), null);
    assert.equal(buildOverviewDescription(null, null, 'Acme', 'Has words.', null), null);
  });

  it('rides Wikidata facts along when available', () => {
    const out = buildOverviewDescription(
      'Acme Corp designs and sells widgets worldwide.',
      'https://www.sec.gov/Archives/edgar/data/123/abc.htm',
      'Acme Corp',
      null,
      '0000000123',
      { title: 'Acme Corp', founded: '1969', headquarters: 'Santa Clara', ceo: 'Jane Doe' },
    );
    assert.equal(out.founded, '1969');
    assert.equal(out.headquarters, 'Santa Clara');
    assert.equal(out.ceo, 'Jane Doe');
  });
});

describe('OG card text fitting', () => {
  it('truncates at word boundaries and counts CJK double', () => {
    assert.equal(truncateLine('Short line', 50), 'Short line');
    assert.equal(truncateLine('Taiwan Semiconductor Manufacturing Company', 24), 'Taiwan Semiconductor…');
    assert.equal(truncateLine('台積電股份有限公司半導體製造', 10), '台積電股份…');
  });

  it('fits long ticker+name pairs without clipping', () => {
    const fitted = fitName('TSM', 'Taiwan Semiconductor Manufacturing Company', 1080, 96);
    assert.ok(fitted.px >= 24 && fitted.px <= 40);
    const width = 3 * 96 * 0.68 + 20 + [...fitted.text].length * fitted.px * 0.62;
    assert.ok(width <= 1080, `estimated width ${width} exceeds column`);
  });

  it('keeps the price hero big but shrinks BRK.A-length quotes into the column', () => {
    assert.equal(fitPrice('$187.42'), 150);
    assert.equal(fitPrice('$1,234.56'), 150);
    const brk = fitPrice('$712,345.00');
    assert.ok(brk < 150 && brk >= 72);
    for (const s of ['$187.42', '$1,234.56', '$712,345.00', 'Quote unavailable']) {
      const width = [...s].length * fitPrice(s) * 0.62;
      assert.ok(width <= 1080, `${s} at ${fitPrice(s)}px estimates ${width}`);
    }
  });

  it('sizes the square-card price for its narrower column', () => {
    assert.equal(fitPrice('$5.80', 230, 860), 230);
    const brk = fitPrice('$712,345.00', 230, 860);
    assert.ok(brk < 230 && brk >= 72);
    for (const s of ['$5.80', '$187.42', '$712,345.00']) {
      const width = [...s].length * fitPrice(s, 230, 860) * 0.62;
      assert.ok(width <= 900, `${s} estimates ${width}`);
    }
  });

  it('dates the square footer with close only once final', () => {
    assert.equal(quoteCardFooter('Oct 7, 2026 04:00 PM ET', 'Closed'), 'Oct 7, 2026 close');
    assert.equal(quoteCardFooter('Oct 8, 2026 11:00 AM ET', 'Open'), 'Oct 8, 2026');
    assert.equal(quoteCardFooter('Oct 8 11:00 AM ET', 'Open'), 'Oct 8');
    assert.equal(quoteCardFooter(null, 'Closed'), null);
    assert.equal(quoteCardFooter('n/a', 'Closed'), null);
  });
});

describe('getStockCardData', () => {
  const infoData = {
    symbol: 'PEP',
    companyName: 'PepsiCo, Inc. Common Stock',
    marketStatus: 'Closed',
    primaryData: {
      lastSalePrice: '$126.04',
      netChange: '+2.35',
      percentageChange: '+1.90%',
      volume: '12,345',
      lastTradeTimestamp: 'Oct 8, 2026 04:00 PM ET',
    },
  };
  async function withFetch(stub, fn) {
    const real = globalThis.fetch;
    globalThis.fetch = stub;
    try {
      return await fn();
    } finally {
      globalThis.fetch = real;
    }
  }

  it('maps Nasdaq info and degrades to empty history when it fails', async () => {
    await withFetch(async (url) => {
      if (String(url).includes('/historical')) throw new Error('down');
      return { ok: true, json: async () => ({ data: infoData }) };
    }, async () => {
      const d = await getStockCardData('PEP', { history: true });
      assert.equal(d.ticker, 'PEP');
      assert.equal(d.companyName, 'PepsiCo, Inc. Common Stock');
      assert.equal(d.quote.price, 126.04);
      assert.ok(Math.abs((d.quote.changePct ?? 0) - 0.019) < 1e-12);
      assert.deepEqual(d.priceHistory, []);
    });
  });

  it('returns null without a usable quote', async () => {
    await withFetch(async () => ({ ok: true, json: async () => ({ data: { symbol: 'NOPE' } }) }), async () => {
      assert.equal(await getStockCardData('NOPE'), null);
    });
    await withFetch(async () => { throw new Error('down'); }, async () => {
      assert.equal(await getStockCardData('PEP'), null);
    });
  });
});
