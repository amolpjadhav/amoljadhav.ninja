// Regression tests for Supabase text sanitizing. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cleanText } from './podcast-store.ts';

describe('cleanText', () => {
  it('replaces lone surrogates Postgres would reject', () => {
    assert.equal(cleanText('Tour \uD83C dates'), 'Tour � dates');
    assert.equal(cleanText('Best of \uDE00'), 'Best of �');
    // Well-formed pairs (emoji) pass through untouched.
    assert.equal(cleanText('Party \uD83C\uDF89 time'), 'Party \uD83C\uDF89 time');
    assert.equal(cleanText('plain title'), 'plain title');
  });

  it('survives a JSON round-trip like the PostgREST payload', () => {
    const dirty = 'Tour \uD83C just \uDE00 announced \uD83C\uDF89';
    assert.equal(JSON.parse(JSON.stringify({ t: cleanText(dirty) })).t, 'Tour � just � announced \uD83C\uDF89');
  });
});
