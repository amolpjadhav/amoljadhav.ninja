// Refresh-throttle decision for the podcast pool. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { REFRESH_WINDOW_MS, shouldRefresh } from './refresh-guard.ts';

describe('shouldRefresh', () => {
  const now = Date.parse('2026-10-12T06:00:00.000Z');

  it('refreshes when never refreshed or timestamp is garbage', () => {
    assert.equal(shouldRefresh(null, now), true);
    assert.equal(shouldRefresh('', now), true);
    assert.equal(shouldRefresh('not-a-date', now), true);
  });

  it('skips within the window, refreshes once past it', () => {
    assert.equal(REFRESH_WINDOW_MS, 6 * 3600 * 1000);
    assert.equal(shouldRefresh('2026-10-12T05:00:00.000Z', now), false);
    assert.equal(shouldRefresh('2026-10-12T00:00:00.001Z', now), false);
    assert.equal(shouldRefresh('2026-10-12T00:00:00.000Z', now), true);
    assert.equal(shouldRefresh('2026-10-11T23:59:59.999Z', now), true);
  });
});
