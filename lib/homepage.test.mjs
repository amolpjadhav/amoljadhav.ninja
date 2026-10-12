// Focused checks for the homepage Tools data. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VIEW_COUNT_THRESHOLD,
  compactCount,
  memoizeTtl,
  stripHasMoves,
  toStripItems,
  toTopEpisode,
  viewCountLabel,
} from './homepage.ts';
import { formatCount } from './utils.ts';

describe('viewCountLabel', () => {
  it('hides counts below the threshold', () => {
    assert.equal(VIEW_COUNT_THRESHOLD, 10);
    assert.equal(viewCountLabel(null), null);
    assert.equal(viewCountLabel(undefined), null);
    assert.equal(viewCountLabel(NaN), null);
    assert.equal(viewCountLabel(0), null);
    assert.equal(viewCountLabel(9), null);
  });

  it('labels counts at and above the threshold', () => {
    assert.equal(viewCountLabel(10), '10 views');
    assert.equal(viewCountLabel(156), '156 views');
    assert.equal(viewCountLabel(1500), '1.5K views');
    assert.equal(viewCountLabel(2000000), '2M views');
  });
});

describe('memoizeTtl', () => {
  it('shares one flight and caches the value', async () => {
    let calls = 0;
    const load = memoizeTtl(60_000, async () => {
      calls += 1;
      return 'v';
    });
    const [a, b] = await Promise.all([load(), load()]);
    assert.equal(a, 'v');
    assert.equal(b, 'v');
    assert.equal(calls, 1);
  });

  it('refetches once the ttl expires', async () => {
    let calls = 0;
    const load = memoizeTtl(-1, async () => {
      calls += 1;
      return calls;
    });
    assert.equal(await load(), 1);
    assert.equal(await load(), 2);
  });

  it('serves stale on failure, null when nothing cached', async () => {
    let fail = false;
    const load = memoizeTtl(-1, async () => {
      if (fail) throw new Error('upstream down');
      return 'fresh';
    });
    assert.equal(await load(), 'fresh');
    fail = true;
    assert.equal(await load(), 'fresh');
    const cold = memoizeTtl(60_000, async () => {
      throw new Error('upstream down');
    });
    assert.equal(await cold(), null);
  });
});

describe('card mappers', () => {
  it('maps the top episode and tolerates absence', () => {
    assert.equal(toTopEpisode(undefined), null);
    assert.deepEqual(
      toTopEpisode({
        title: 'Ep',
        channel: 'Show',
        thumbnail: 'https://img/t.jpg',
        viewsPerHour: 1234,
        url: 'https://youtube.com/watch?v=x',
      }),
      {
        title: 'Ep',
        channel: 'Show',
        thumbnail: 'https://img/t.jpg',
        viewsPerHour: 1234,
        url: 'https://youtube.com/watch?v=x',
      },
    );
  });

  it('maps strip quotes, keeping null changes', () => {
    assert.deepEqual(
      toStripItems([
        { label: 'S&P 500', changePct: -0.004, spark: [1, 2] },
        { label: 'Bitcoin', changePct: null, spark: [] },
      ]),
      [
        { label: 'S&P 500', changePct: -0.004, spark: [1, 2] },
        { label: 'Bitcoin', changePct: null, spark: [] },
      ],
    );
  });

  it('treats an all-flat strip as a dead feed', () => {
    assert.equal(stripHasMoves([]), false);
    assert.equal(stripHasMoves([{ label: 'A', changePct: null, spark: [] }]), false);
    assert.equal(
      stripHasMoves([
        { label: 'A', changePct: 0, spark: [] },
        { label: 'B', changePct: 0.0001, spark: [] },
      ]),
      false,
    );
    assert.equal(stripHasMoves([{ label: 'A', changePct: 0.004, spark: [] }]), true);
    assert.equal(stripHasMoves([{ label: 'A', changePct: -0.002, spark: [] }]), true);
  });

  it('matches formatCount so the two formatters never drift', () => {
    for (const n of [0, 9, 10, 156, 999, 1000, 1500, 999499, 1000000, 2500000]) {
      assert.equal(compactCount(n), formatCount(n), `compactCount(${n})`);
    }
  });
});
