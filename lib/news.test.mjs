// Tests for the news helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractTickers, stripGeneralRelated } from './news.ts';

const UNI = ['NVDA', 'AAPL', 'MSFT', 'META', 'TSLA'];

function item(headline, related = '') {
  return { id: 1, headline, source: 'Reuters', url: 'https://x.test/1', datetime: 1, related, image: null };
}

describe('stripGeneralRelated', () => {
  it('clears provider tags, keeps everything else', () => {
    const [out] = stripGeneralRelated([item('SpaceX launches new batch', 'MSFT')]);
    assert.equal(out.related, '');
    assert.equal(out.headline, 'SpaceX launches new batch');
  });

  it('leaves untagged items alone', () => {
    const [out] = stripGeneralRelated([item('Plain headline')]);
    assert.equal(out.related, '');
  });
});

describe('extractTickers', () => {
  it('tags tickers named in the headline', () => {
    assert.deepEqual(extractTickers(item('AAPL vs MSFT: cloud showdown'), UNI), ['AAPL', 'MSFT']);
  });

  it('never tags from provider related alone', () => {
    const [stripped] = stripGeneralRelated([item('SpaceX launches new batch', 'MSFT')]);
    assert.deepEqual(extractTickers(stripped, UNI), []);
  });

  it('caps at two, earliest mention first', () => {
    assert.deepEqual(extractTickers(item('TSLA AAPL MSFT rally together'), UNI), ['TSLA', 'AAPL']);
  });

  it('ignores substrings that are not the symbol', () => {
    assert.deepEqual(extractTickers(item('MSFTX files for a new fund'), UNI), []);
  });
});
