// Tests for the AI price calculator helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FLAGSHIPS,
  costForUsage,
  formatCents,
  formatTokens,
  formatUSD,
  mergeLivePrice,
  perMillion,
  tokensForChars,
  wordsForTokens,
} from './ai-pricing.ts';

describe('costForUsage', () => {
  it('prices input and output tokens separately', () => {
    // $2/1M in, $10/1M out: 100K in + 25K out = $0.20 + $0.25.
    assert.ok(Math.abs(costForUsage(0.000002, 0.00001, 100_000, 25_000) - 0.45) < 1e-9);
  });
  it('treats negative counts and prices as zero', () => {
    assert.equal(costForUsage(0.000002, 0.00001, -5, 100), 0.001);
    assert.equal(costForUsage(-1, 0.00001, 100, 100), 0.001);
  });
  it('floors fractional tokens', () => {
    assert.equal(costForUsage(0.000001, 0, 1.9, 0), 0.000001);
  });
});

describe('perMillion', () => {
  it('scales per-token prices to per-1M quotes', () => {
    assert.equal(perMillion(0.000002), 2);
    assert.ok(Math.abs(perMillion(0.0000001) - 0.1) < 1e-9);
  });
});

describe('formatUSD', () => {
  it('uses 2 decimals for dollar amounts', () => {
    assert.equal(formatUSD(1234.5), '$1,234.50');
  });
  it('uses 2 decimals for cent amounts, 4 below a cent', () => {
    assert.equal(formatUSD(0.45), '$0.45');
    assert.equal(formatUSD(0.0042), '$0.0042');
  });
  it('renders non-finite input as an em dash', () => {
    assert.equal(formatUSD(NaN), '—');
  });
});

describe('formatTokens', () => {
  it('compacts thousands and millions', () => {
    assert.equal(formatTokens(1500), '1.5K');
    assert.equal(formatTokens(2000000), '2M');
    assert.equal(formatTokens(250), '250');
  });
});

describe('FLAGSHIPS', () => {
  it('has unique ids with positive prices', () => {
    const ids = FLAGSHIPS.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const m of FLAGSHIPS) {
      assert.ok(m.promptPerToken > 0 && m.completionPerToken > 0, m.id);
    }
  });
});

describe('formatCents', () => {
  it('shows every per-request price in cents with the same precision', () => {
    assert.equal(formatCents(0.014), '1.40¢');
    assert.equal(formatCents(0.071), '7.10¢');
    assert.equal(formatCents(0.00027), '0.03¢');
  });
  it('switches to dollars at 10¢ and up', () => {
    assert.equal(formatCents(0.24), '$0.24');
    assert.equal(formatCents(1.5), '$1.50');
  });
});

describe('token/word estimates', () => {
  it('converts tokens to words and chars to tokens', () => {
    assert.equal(wordsForTokens(1000), 750);
    assert.equal(wordsForTokens(0), 0);
    assert.equal(tokensForChars(4000), 1000);
    assert.equal(tokensForChars(-3), 0);
  });
});

describe('reasoning flags', () => {
  it('marks thinking-capable models so the multiplier applies only to them', () => {
    const byId = new Map(FLAGSHIPS.map((m) => [m.id, m]));
    for (const id of ['openai/o3', 'deepseek/deepseek-r1', 'anthropic/claude-sonnet-5.5', 'google/gemini-2.5-pro']) {
      assert.equal(byId.get(id)?.reasoning, true, id);
    }
    for (const id of ['openai/gpt-4o', 'meta-llama/llama-3.3-70b-instruct', 'mistralai/mistral-large-2512']) {
      assert.ok(!byId.get(id)?.reasoning, id);
    }
  });
});

describe('prev-gen tags', () => {
  it('marks older flagships so the table reads honestly', () => {
    const tagged = FLAGSHIPS.filter((m) => m.tag === 'Prev gen').map((m) => m.id);
    assert.ok(tagged.includes('openai/gpt-4o'));
    assert.ok(tagged.includes('openai/o3'));
  });
});

describe('mergeLivePrice', () => {
  const base = FLAGSHIPS[0];
  it('prefers live prices when present and valid', () => {
    const merged = mergeLivePrice(base, {
      pricing: { prompt: '0.000003', completion: '0.000015' },
      context_length: 500000,
    });
    assert.equal(merged.live, true);
    assert.equal(merged.promptPerToken, 0.000003);
    assert.equal(merged.context, 500000);
  });
  it('falls back to curated prices when the live row is missing or bad', () => {
    assert.equal(mergeLivePrice(base, undefined).live, false);
    const bad = mergeLivePrice(base, { pricing: { prompt: 'free', completion: null } });
    assert.equal(bad.live, false);
    assert.equal(bad.promptPerToken, base.promptPerToken);
  });
});
