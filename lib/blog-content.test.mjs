// Focused test for the homepage pinned-post split.
// Run: npm test   (Node's built-in runner — no test framework dependency.)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { colorizeArticleSections, splitPinnedPosts } from './blog-content.ts';

const post = (slug) => ({ slug, title: slug });

describe('splitPinnedPosts', () => {
  it('pulls pinned slugs out of rest so they never render twice', () => {
    const posts = [post('look-up-stock-and-company-details'), post('a'), post('b')];
    const { pinned, rest } = splitPinnedPosts(posts, ['look-up-stock-and-company-details']);
    assert.deepEqual(
      pinned.map((p) => p.slug),
      ['look-up-stock-and-company-details'],
    );
    assert.deepEqual(
      rest.map((p) => p.slug),
      ['a', 'b'],
    );
  });

  it('orders pins by the pinned list, not by date', () => {
    const posts = [post('a'), post('b'), post('c')];
    const { pinned, rest } = splitPinnedPosts(posts, ['c', 'a']);
    assert.deepEqual(
      pinned.map((p) => p.slug),
      ['c', 'a'],
    );
    assert.deepEqual(
      rest.map((p) => p.slug),
      ['b'],
    );
  });

  it('ignores unknown slugs', () => {
    const posts = [post('a')];
    const { pinned, rest } = splitPinnedPosts(posts, ['missing']);
    assert.deepEqual(pinned, []);
    assert.deepEqual(
      rest.map((p) => p.slug),
      ['a'],
    );
  });

  it('falls back to the full list when every post is pinned', () => {
    const posts = [post('a'), post('b')];
    const { pinned, rest } = splitPinnedPosts(posts, ['a', 'b']);
    assert.equal(pinned.length, 2);
    assert.deepEqual(
      rest.map((p) => p.slug),
      ['a', 'b'],
    );
  });
});

describe('colorizeArticleSections headings', () => {
  it('decodes entities in titles so the jump menu shows plain text', () => {
    const { headings } = colorizeArticleSections(
      '<h3>You&rsquo;re counting the wrong thing</h3><p>x</p><h3>It&rsquo;s not about you</h3><p>y</p>',
    );
    assert.deepEqual(
      headings.map((h) => h.title),
      ['You’re counting the wrong thing', 'It’s not about you'],
    );
  });

  it('decodes numeric entities and ampersands in titles', () => {
    const { headings } = colorizeArticleSections(
      '<h3>Fish &amp; chips &#8212; tasty</h3><p>x</p>',
    );
    assert.equal(headings[0].title, 'Fish & chips — tasty');
  });

  it('keeps heading ids derived from the raw text so deep links never shift', () => {
    const { headings } = colorizeArticleSections('<h3>You&rsquo;re counting</h3><p>x</p>');
    assert.equal(headings[0].id, 'yoursquore-counting');
  });
});
