// Focused checks for the crypto lookup data layer. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COIN_RANK_CUTOFF,
  coinShareText,
  formatCryptoPrice,
  normalizeCoin,
  normalizeCoinId,
  pickCoinResult,
  supplyEmittedPct,
} from './crypto.ts';

describe('normalizeCoinId', () => {
  it('lowercases direct ids and rejects symbols-with-junk', () => {
    assert.equal(normalizeCoinId('Bitcoin'), 'bitcoin');
    assert.equal(normalizeCoinId('  staked-ether  '), 'staked-ether');
    assert.equal(normalizeCoinId('bit coin!'), '');
    assert.equal(normalizeCoinId(''), '');
    assert.equal(normalizeCoinId('a'.repeat(81)), '');
  });
});

describe('pickCoinResult', () => {
  const coins = [
    { id: 'solana', name: 'Solana', symbol: 'SOL', market_cap_rank: 7 },
    { id: 'solana-copycat', name: 'Solana Copycat', symbol: 'SOL', market_cap_rank: 4000 },
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', market_cap_rank: 1 },
    { id: 'unranked-coin', name: 'Unranked Coin', symbol: 'UNC', market_cap_rank: null },
  ];

  it('resolves exact symbols to the lowest rank', () => {
    assert.deepEqual(pickCoinResult('SOL', coins), { id: 'solana' });
    assert.deepEqual(pickCoinResult('sol', coins), { id: 'solana' });
  });

  it('resolves exact ids and names', () => {
    assert.deepEqual(pickCoinResult('bitcoin', coins), { id: 'bitcoin' });
    assert.deepEqual(pickCoinResult('Solana Copycat', coins), { id: 'solana-copycat' });
  });

  it('prefers rank across match kinds, not the memecoin ticker', () => {
    const tricky = [
      { id: 'harrypotterobamasonic10in', name: 'HarryPotterObamaSonic10Inu', symbol: 'BITCOIN', market_cap_rank: 3000 },
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', market_cap_rank: 1 },
    ];
    assert.deepEqual(pickCoinResult('bitcoin', tricky), { id: 'bitcoin' });
    const garbage = [
      { id: 'btc', name: 'Garbage BTC', symbol: 'GBTC', market_cap_rank: 9000 },
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', market_cap_rank: 1 },
    ];
    assert.deepEqual(pickCoinResult('btc', garbage), { id: 'bitcoin' });
  });

  it('suggests the top three ranked coins otherwise', () => {
    assert.deepEqual(pickCoinResult('o', coins), {
      suggestions: [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'solana', name: 'Solana', symbol: 'SOL' },
        { id: 'solana-copycat', name: 'Solana Copycat', symbol: 'SOL' },
      ],
    });
  });

  it('returns null on empty input', () => {
    assert.equal(pickCoinResult('', coins), null);
    assert.equal(pickCoinResult('btc', []), null);
  });
});

describe('formatCryptoPrice', () => {
  it('formats majors with commas and cents', () => {
    assert.equal(formatCryptoPrice(83608.5), '$83,608.50');
    assert.equal(formatCryptoPrice(1), '$1.00');
  });

  it('keeps four significant digits below a dollar, never scientific', () => {
    assert.equal(formatCryptoPrice(0.5), '$0.50');
    assert.equal(formatCryptoPrice(0.1), '$0.10');
    assert.equal(formatCryptoPrice(0.00001234), '$0.00001234');
    assert.ok(!formatCryptoPrice(0.0000001234).includes('e'));
  });

  it('dashes broken data', () => {
    assert.equal(formatCryptoPrice(null), '—');
    assert.equal(formatCryptoPrice(undefined), '—');
    assert.equal(formatCryptoPrice(NaN), '—');
    assert.equal(formatCryptoPrice(0), '—');
    assert.equal(formatCryptoPrice(-5), '—');
  });
});

describe('supplyEmittedPct', () => {
  it('returns the emitted fraction', () => {
    assert.ok(Math.abs(supplyEmittedPct(20096750, 21000000) - 0.95699) < 0.00001);
  });

  it('returns null without a max supply and clamps overruns', () => {
    assert.equal(supplyEmittedPct(120000000, null), null);
    assert.equal(supplyEmittedPct(10, 0), null);
    assert.equal(supplyEmittedPct(-1, 100), null);
    assert.equal(supplyEmittedPct(110, 100), 1);
  });
});

describe('coinShareText', () => {
  it('builds the post text with preformatted figures', () => {
    assert.equal(coinShareText('BTC', 'Bitcoin', '$83,608.50', '+0.8%'), '$BTC $83,608.50 (+0.8%) — Bitcoin');
    assert.equal(coinShareText('BTC', 'Bitcoin', '$83,608.50', null), '$BTC $83,608.50 — Bitcoin');
    assert.equal(coinShareText('BTC', 'Bitcoin', null, null), '$BTC — Bitcoin');
  });
});

describe('normalizeCoin', () => {
  const payload = {
    symbol: 'btc',
    name: 'Bitcoin',
    image: { large: 'https://x/large.png' },
    market_cap_rank: 1,
    market_data: {
      current_price: { usd: 83608 },
      price_change_24h: 700,
      price_change_percentage_24h: 0.84,
      price_change_percentage_7d: -2.5,
      price_change_percentage_30d: 12.1,
      price_change_percentage_1y: 64.2,
      high_24h: { usd: 84000 },
      low_24h: { usd: 82000 },
      ath: { usd: 126080 },
      ath_change_percentage: -33.7,
      ath_date: '2025-10-06T14:00:00Z',
      atl: { usd: 67 },
      atl_change_percentage: 124000,
      atl_date: '2013-07-06T00:00:00Z',
      market_cap: { usd: 1681000000000 },
      fully_diluted_valuation: { usd: 1756000000000 },
      total_volume: { usd: 42000000000 },
      circulating_supply: 20096750,
      total_supply: 20096750,
      max_supply: 21000000,
      sparkline_7d: { price: [83000, 83100, 'x', null, 83608] },
      last_updated: '2026-10-11T19:00:00Z',
    },
    description: { en: '<p>Bitcoin is digital money.</p>\n\nSecond paragraph here.' },
    genesis_date: '2009-01-03',
    categories: ['Layer 1', 'PoW'],
    links: {
      homepage: ['https://bitcoin.org', ''],
      whitepaper: 'https://w.pdf',
      blockchain_site: ['https://mempool.space', '', 'https://blockchair.com'],
    },
    sentiment_votes_up_percentage: 77.5,
  };

  it('maps the coin payload with fractions, not percents', () => {
    const c = normalizeCoin('bitcoin', payload);
    assert.equal(c.symbol, 'BTC');
    assert.equal(c.name, 'Bitcoin');
    assert.equal(c.price, 83608);
    assert.equal(c.changePct24h, 0.0084);
    assert.equal(c.changePct7d, -0.025);
    assert.equal(c.athChangePct, -0.337);
    assert.equal(c.athDate, '2025-10-06');
    assert.deepEqual(c.spark7d, [83000, 83100, 83608]);
    assert.equal(c.lowRank, false);
    assert.equal(c.degraded, false);
  });

  it('cleans the description and links', () => {
    const c = normalizeCoin('bitcoin', payload);
    assert.equal(c.description, 'Bitcoin is digital money.');
    assert.equal(c.links.homepage, 'https://bitcoin.org');
    assert.equal(c.links.whitepaper, 'https://w.pdf');
    assert.deepEqual(c.links.explorers, ['https://mempool.space', 'https://blockchair.com']);
  });

  it('flags low-rank coins at the cutoff', () => {
    assert.equal(COIN_RANK_CUTOFF, 500);
    assert.equal(normalizeCoin('x', { ...payload, market_cap_rank: 501 }).lowRank, true);
    assert.equal(normalizeCoin('x', { ...payload, market_cap_rank: null }).lowRank, true);
    assert.equal(normalizeCoin('x', { ...payload, market_cap_rank: 500 }).lowRank, false);
  });

  it('degrades to nulls on thin payloads', () => {
    assert.equal(normalizeCoin('x', null), null);
    assert.equal(normalizeCoin('x', 42), null);
    const thin = normalizeCoin('mystery', {});
    assert.equal(thin.symbol, 'MYSTERY');
    assert.equal(thin.name, 'mystery');
    assert.equal(thin.price, null);
    assert.deepEqual(thin.spark7d, []);
    assert.deepEqual(thin.links.explorers, []);
  });
});
