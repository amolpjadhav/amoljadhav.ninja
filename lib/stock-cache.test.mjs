// Tests for the stock lookup SWR cache. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createStockCache, stockFastUrl, stockFullUrl } from './stock-cache.ts';

describe('createStockCache', () => {
  it('round-trips fast and full under case-insensitive keys', () => {
    const cache = createStockCache();
    assert.equal(cache.get('meta'), null);
    cache.setFast('meta', { ticker: 'META' }, 100);
    cache.setFull('META', { ticker: 'META' }, 200);
    assert.deepEqual(cache.get('Meta'), {
      fast: { ticker: 'META' },
      full: { ticker: 'META' },
      fastAt: 100,
      fullAt: 200,
    });
  });

  it('keeps the other stage when one refreshes', () => {
    const cache = createStockCache();
    cache.setFull('NVDA', { v: 1 }, 50);
    cache.setFast('NVDA', { v: 2 }, 100);
    assert.deepEqual(cache.get('NVDA')?.full, { v: 1 });
    assert.deepEqual(cache.get('NVDA')?.fast, { v: 2 });
  });

  it('clears everything', () => {
    const cache = createStockCache();
    cache.setFast('AAPL', { v: 1 });
    cache.clear();
    assert.equal(cache.get('AAPL'), null);
  });
});

describe('stock urls', () => {
  it('builds prefetch endpoints for a ticker', () => {
    assert.equal(stockFastUrl('brk.b'), '/api/stocks/BRK.B/fast');
    assert.equal(stockFullUrl('brk.b'), '/api/stocks/BRK.B');
  });
});
