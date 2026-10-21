// Tests for the stock LLM overview cache helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { accessionFromFilingUrl, buildOverviewPrompt, validateOverviewSummary } from './stock-llm.ts';

describe('accessionFromFilingUrl', () => {
  it('pulls the undashed accession from an EDGAR filing URL', () => {
    assert.equal(
      accessionFromFilingUrl('https://www.sec.gov/Archives/edgar/data/1045810/000104581026012345/nvda-10k.htm'),
      '000104581026012345',
    );
  });

  it('rejects non-filing URLs', () => {
    assert.equal(accessionFromFilingUrl('https://example.com/10-k'), null);
    assert.equal(accessionFromFilingUrl(null), null);
    assert.equal(accessionFromFilingUrl(''), null);
  });
});

describe('buildOverviewPrompt', () => {
  it('carries the company context and caps the excerpt', () => {
    const prompt = buildOverviewPrompt({ ticker: 'NVDA', name: 'NVIDIA', form: '10-K', excerpt: `x`.repeat(5000) });
    assert.ok(prompt.includes('NVDA'));
    assert.ok(prompt.includes('10-K'));
    assert.ok(prompt.length < 5000);
  });
});

describe('validateOverviewSummary', () => {
  it('accepts a bounded overview', () => {
    const text = `NVIDIA designs graphics processors and AI systems sold to data centers and gamers for revenue.`;
    assert.deepEqual(validateOverviewSummary({ overview: `  ${text}  ` }), { overview: text });
  });

  it('rejects missing, tiny, or huge overviews', () => {
    assert.equal(validateOverviewSummary(null), null);
    assert.equal(validateOverviewSummary({}), null);
    assert.equal(validateOverviewSummary({ overview: 'too short' }), null);
    assert.equal(validateOverviewSummary({ overview: 'x'.repeat(901) }), null);
  });
});
