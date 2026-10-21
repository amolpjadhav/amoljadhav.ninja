// Tests for the podcast summary helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrompt,
  parseChapters,
  stripPromos,
  validateSummary,
} from './podcast-summary.ts';

describe('parseChapters', () => {
  it('reads mm:ss and h:mm:ss chapter lines', () => {
    assert.deepEqual(parseChapters('12:40 Kirk set\n1:02:03 Golden ticket'), [
      { t: 760, label: 'Kirk set' },
      { t: 3723, label: 'Golden ticket' },
    ]);
  });
  it('ignores scores, dates, and bare timestamps', () => {
    assert.deepEqual(parseChapters('Episode 204\n2026-01-04\n10:5x oops\n12:40'), []);
  });
});

describe('stripPromos', () => {
  it('drops sponsor, code, and social lines but keeps the rest', () => {
    const out = stripPromos(
      'A great night of comedy\nUse code TONY for 10% off\n@killtony\n12:40 Kirk set\nhttps://example.com/x',
    );
    assert.ok(out.includes('A great night of comedy'));
    assert.ok(out.includes('12:40 Kirk set'));
    assert.ok(!out.includes('Use code'));
    assert.ok(!out.includes('@killtony'));
    assert.ok(!out.includes('https://'));
  });
  it('drops tour, ticket, and advertiser lines', () => {
    const out = stripPromos(
      'Recorded live in Austin\nTour dates at example.com\nGet tickets Friday\nAdvertise with us here',
    );
    assert.ok(out.includes('Recorded live in Austin'));
    assert.ok(!out.includes('Tour dates'));
    assert.ok(!out.includes('tickets'));
    assert.ok(!out.includes('Advertise'));
  });
});

describe('buildPrompt', () => {
  it('embeds title, channel, chapters, and the neutrality rules', () => {
    const p = buildPrompt({
      videoId: 'x',
      title: 'Kill Tony #700',
      channel: 'Kill Tony',
      publishedAt: '2026-10-01',
      description: 'Big night\n12:40 Kirk set',
    });
    assert.ok(p.includes('Kill Tony #700'));
    assert.ok(p.includes('12:40 Kirk set'));
    assert.ok(p.includes('attribute opinions'));
    assert.ok(p.includes('JSON only'));
  });
});

describe('validateSummary', () => {
  const good = {
    tldr: 'Tim Dillon riffs on politics and a cookie empire.',
    bullets: ['Politics opener', 'Cookie empire', 'Live-stream bit'],
    moments: [{ t_seconds: 760, label: 'Kirk set' }],
  };
  it('accepts a well-formed summary', () => {
    const v = validateSummary(good);
    assert.ok(v && v.source === 'description' && v.moments[0].t_seconds === 760);
  });
  it('rejects missing or oversized fields', () => {
    assert.equal(validateSummary(null), null);
    assert.equal(validateSummary({ ...good, tldr: 'x'.repeat(201) }), null);
    assert.equal(validateSummary({ ...good, bullets: [] }), null);
    assert.equal(validateSummary({ ...good, moments: [{ t_seconds: -5, label: 'x' }] }), null);
    assert.equal(validateSummary({ ...good, moments: [{ t_seconds: 5 }] }), null);
  });
});
