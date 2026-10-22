// Tests for the news helpers. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractTickers, mentionsTicker, splitTrailingSource, stripGeneralRelated } from './news.ts';

const UNI = ['NVDA', 'AAPL', 'MSFT', 'META', 'TSLA'];

function item(headline, related = '', summary = '') {
  return { id: 1, headline, source: 'Reuters', url: 'https://x.test/1', datetime: 1, related, image: null, summary };
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

  it('tags company names, not just bare symbols', () => {
    assert.deepEqual(extractTickers(item('Meta lifts ad outlook on strong spend'), UNI), ['META']);
    assert.deepEqual(extractTickers(item('Apple and Nvidia rally into the close'), UNI), ['AAPL', 'NVDA']);
  });

  it('ignores provider related even when present', () => {
    // Corning story surfacing in META's own feed: no META pill.
    assert.deepEqual(extractTickers(item('Corning raises glass outlook', 'META'), UNI), []);
  });

  it('matches the summary when the headline names nobody', () => {
    const it1 = item('Glass outlook raised for the quarter', '', 'Corning expects stronger demand; Meta is a key buyer');
    assert.deepEqual(extractTickers(it1, UNI), ['META']);
  });

  it('uses caller-known names for tickers outside the alias map', () => {
    const it1 = item('Snap launches new Spectacles', '', '');
    assert.deepEqual(extractTickers(it1, ['SNAP'], { SNAP: ['Snapchat', 'Snap'] }), ['SNAP']);
    assert.deepEqual(extractTickers(it1, ['SNAP']), []);
  });

  it('matches a ticker page company by its full name', () => {
    const it1 = item('Physicians Realty declares quarterly dividend', '', '');
    assert.deepEqual(
      extractTickers(it1, ['NVDA', 'DOC'], { DOC: 'Physicians Realty Trust' }),
      ['DOC'],
    );
  });
});

describe('splitTrailingSource', () => {
  it('credits the outlet named in the byline', () => {
    assert.deepEqual(
      splitTrailingSource('Merger sparks insider concerns - Reuters'),
      { headline: 'Merger sparks insider concerns', source: 'Reuters' },
    );
    assert.deepEqual(
      splitTrailingSource('Why Tesla wins | Barron\u2019s'),
      { headline: 'Why Tesla wins', source: 'Barron’s' },
    );
  });

  it('leaves non-outlet endings alone', () => {
    assert.equal(splitTrailingSource('Markets today - Live updates'), null);
    assert.equal(splitTrailingSource('Plain headline with - a dash'), null);
    assert.equal(splitTrailingSource('Plain headline'), null);
  });
});

describe('mentionsTicker', () => {
  it('matches symbols, names, and summary text', () => {
    assert.equal(mentionsTicker(item('TSLA surges'), 'TSLA'), true);
    assert.equal(mentionsTicker(item('Tesla surges'), 'TSLA'), true);
    assert.equal(mentionsTicker(item('Ford surges'), 'TSLA'), false);
    assert.equal(mentionsTicker(item('Outlook raised', '', 'Tesla demand holds'), 'TSLA'), true);
  });

  it('never matches a bare single letter in prose', () => {
    assert.equal(mentionsTicker(item('A V-shaped recovery takes hold'), 'V'), false);
    assert.equal(mentionsTicker(item('Visa raises its dividend'), 'V'), true);
  });
});
