// Shared date formatting. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatShortDate } from './utils.ts';

describe('formatShortDate', () => {
  it('omits the year when it matches now', () => {
    const now = new Date('2026-10-30T12:00:00Z').getTime();
    assert.equal(formatShortDate('2026-08-28T00:00:00Z', now), 'Aug 28');
    assert.equal(formatShortDate('2025-07-06T00:00:00Z', now), 'Jul 6, 2025');
  });
});
