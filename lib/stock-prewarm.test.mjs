// Tests for the nightly stock prewarm plan. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrewarmPlan } from './stock-prewarm.ts';

const UNI = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'JPM', 'XOM'];
const BLUE = ['AAPL', 'MSFT', 'TSLA', 'JPM'];

describe('buildPrewarmPlan', () => {
  it('puts earnings-week blue chips first, then universe order', () => {
    const plan = buildPrewarmPlan({ universe: UNI, earnings: ['TSLA', 'JPM', 'ZZZZ'], blueChips: BLUE });
    assert.deepEqual(plan.full.slice(0, 2), ['TSLA', 'JPM']);
    assert.deepEqual(plan.light.slice(0, 2), ['TSLA', 'JPM']);
    assert.ok(!plan.light.includes('ZZZZ'), 'non-blue-chip earnings reporters stay out');
  });

  it('dedupes, uppercases, and drops garbage', () => {
    const plan = buildPrewarmPlan({ universe: ['aapl', 'AAPL', '!!!', 'BRK.B'], earnings: [], blueChips: [] });
    assert.deepEqual(plan.light, ['AAPL', 'BRK.B']);
  });

  it('respects caps', () => {
    const plan = buildPrewarmPlan({ universe: UNI, earnings: [], blueChips: BLUE, lightLimit: 3, fullLimit: 2 });
    assert.equal(plan.light.length, 3);
    assert.equal(plan.full.length, 2);
  });
});
