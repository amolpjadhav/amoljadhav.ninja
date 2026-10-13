// Scorecard share line. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildScorecardLine } from './scorecard.ts';

describe('scorecard share line', () => {
  it('joins played games in article order', () => {
    assert.equal(
      buildScorecardLine({ fiveLettersBest: 4, codeBreakerBest: 5, minesweeperBest: 48, g2048Best: 1024 }),
      'Five Letters 4/6 · Swept in 48s · Cracked the code in 5 · 2048 best 1,024',
    );
  });

  it('omits games not played, with no placeholders', () => {
    assert.equal(
      buildScorecardLine({ fiveLettersBest: null, codeBreakerBest: 5, minesweeperBest: null, g2048Best: 0 }),
      'Cracked the code in 5',
    );
    assert.equal(
      buildScorecardLine({ fiveLettersBest: null, codeBreakerBest: null, minesweeperBest: null, g2048Best: 0 }),
      '',
    );
  });
});
