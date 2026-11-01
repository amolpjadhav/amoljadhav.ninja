// Tests for the AI price calculator helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FLAGSHIPS,
  barWidths,
  costForUsage,
  costPer1k,
  displayName,
  formatCents,
  formatPer1k,
  formatTokens,
  formatUSD,
  mergeLivePrice,
  perMillion,
  pickPreviewTrio,
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
  it('carries the live versioned name when present', () => {
    const merged = mergeLivePrice(base, {
      pricing: { prompt: '0.000003', completion: '0.000015' },
      name: 'Anthropic: Claude Opus 4.5',
    });
    assert.equal(merged.liveName, 'Anthropic: Claude Opus 4.5');
    assert.equal(displayName(merged), 'Claude Opus 4.5');
    assert.equal(displayName({ ...base, live: false }), base.label);
  });
});

describe('home-card preview', () => {
  it('prices 1k sample replies (500 in + 500 out)', () => {
    // $2/1M in, $10/1M out: one reply = $0.006, ×1000 = $6.
    assert.equal(costPer1k({ promptPerToken: 0.000002, completionPerToken: 0.00001 }), 6);
  });
  it('formats whole dollars without decimals, cents with two', () => {
    assert.equal(formatPer1k(17.5), '$18');
    assert.equal(formatPer1k(6), '$6');
    assert.equal(formatPer1k(0.21), '$0.21');
    assert.equal(formatPer1k(NaN), '—');
  });
  it('picks cheap/mid/premium tiers from distinct vendors', () => {
    const mk = (id, vendor, per1k) => ({
      id,
      label: id,
      vendor,
      promptPerToken: per1k / 1000 / 1000,
      completionPerToken: 0,
      context: 1000,
      live: false,
    });
    const models = [
      mk('cheap-a', 'A', 0.2),
      mk('mid-a', 'A', 6),
      mk('mid-b', 'B', 7),
      mk('rich-b', 'B', 18),
      mk('rich-c', 'C', 20),
    ];
    const [cheap, mid, premium] = pickPreviewTrio(models);
    assert.equal(cheap.id, 'cheap-a');
    assert.equal(premium.id, 'rich-c');
    assert.ok(mid.vendor !== cheap.vendor && mid.vendor !== premium.vendor);
    assert.equal(new Set([cheap, mid, premium].map((m) => m.vendor)).size, 3);
  });
  it('returns short tables as-is', () => {
    assert.equal(pickPreviewTrio([]).length, 0);
    assert.equal(pickPreviewTrio(FLAGSHIPS.slice(0, 2)).length, 2);
  });
  it('scales bars logarithmically from 4% to 100%', () => {
    const [lo, mid, hi] = barWidths([0.21, 6, 17.5]);
    assert.equal(lo, 4);
    assert.equal(hi, 100);
    assert.ok(mid > lo && mid < hi);
    assert.deepEqual(barWidths([5, 5]), [100, 100]);
    assert.deepEqual(barWidths([]), []);
  });
  it('strips the OpenRouter provider prefix from display names', () => {
    const live = { ...FLAGSHIPS[1], live: true, liveName: 'Anthropic: Claude Sonnet 4.5' };
    assert.equal(displayName(live), 'Claude Sonnet 4.5');
    assert.equal(displayName({ ...FLAGSHIPS[2], live: false }), 'GPT-5.5');
  });
});
