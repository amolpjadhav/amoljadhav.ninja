// Focused test for the homepage pinned-post split.
// Run: npm test   (Node's built-in runner — no test framework dependency.)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { splitPinnedPosts } from './blog-content.ts';

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
