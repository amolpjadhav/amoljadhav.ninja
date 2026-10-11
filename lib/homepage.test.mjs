// Focused checks for the homepage Tools data. Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VIEW_COUNT_THRESHOLD,
  buildTerminalScripts,
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

describe('buildTerminalScripts', () => {
  const NOW = Date.UTC(2026, 9, 13); // Tue Oct 13 2026
  const posts = [
    { title: 'Trending Podcasts', slug: 'trending-podcasts', createdAt: '2026-10-11T00:00:00Z', views: 156, category: 'Curiosity', readTime: 8 },
    { title: 'The Birthday Paradox', slug: 'birthday-paradox', createdAt: '2026-10-05T00:00:00Z', views: 1200, category: 'Science', readTime: 12 },
    { title: 'TFT Set 18 Comps', slug: 'tft', createdAt: '2026-09-20T00:00:00Z', views: 5400, category: 'Gaming', readTime: 10 },
    { title: 'Old Post', slug: 'old', createdAt: '2026-01-02T00:00:00Z', views: 39, category: 'Gaming', readTime: 5 },
  ];
  const full = {
    posts,
    latestAge: '2d ago',
    nowMs: NOW,
    quotes: [
      { label: 'S&P 500', pct: '+1.4%', changePct: 0.014 },
      { label: 'Nasdaq 100', pct: '-0.6%', changePct: -0.006 },
      { label: 'Dow', pct: '+0.0%', changePct: 0 },
      { label: 'Gold', pct: '+0.3%', changePct: 0.003 },
      { label: 'Bitcoin', pct: '+2.1%', changePct: 0.021 },
    ],
    topEp: { channel: 'MrBallen', vph: '27.8K/hr' },
    monthEp: { title: 'Roman Empire Rise and Fall', views: '2.1M views' },
    epCounts: { trending: 30, month: 37 },
    showCount: 39,
    genreCount: 8,
    books: {
      label: 'November',
      verdictDate: 'Nov 30',
      quick: { title: 'The Giver', pages: 208 },
      classic: { title: 'Frankenstein', pages: 280 },
      stretch: { title: 'The Name of the Wind', pages: 662 },
      totalPages: 2841,
      poolBooks: 320,
      poolGenres: 12,
    },
  };
  const out = (scripts, cmd) => scripts.find((s) => s[0].text === cmd)?.[1];

  it('keeps the big three first, one command plus one output each', () => {
    const scripts = buildTerminalScripts(full);
    assert.deepEqual(
      scripts.slice(0, 3).map((s) => s.map((l) => l.text)),
      [
        ['$ tail -1 blog', 'Trending Podcasts · 2d ago'],
        ['$ top podcasts', 'MrBallen · 27.8K/hr'],
        ['$ market', 'S&P 500 +1.4% today'],
      ],
    );
    assert.equal(scripts[0][1].href, '/blog/trending-podcasts');
    assert.equal(scripts[1][1].href, '/blog/trending-podcasts');
    assert.equal(scripts[2][1].href, '/blog/look-up-stock-and-company-details');
    assert.ok(scripts.every((s) => s.length === 2 && s[0].typed && !s[1].typed));
  });

  it('rotates a deep bench of unique commands with a true help count', () => {
    const scripts = buildTerminalScripts(full);
    assert.equal(scripts.length, 37);
    const cmds = scripts.map((s) => s[0].text);
    assert.equal(new Set(cmds).size, cmds.length);
    assert.equal(scripts[3][0].text, '$ help');
    assert.equal(scripts[3][1].text, `${scripts.length} commands · try: tail, top…`);
  });

  it('derives every post command from the one query', () => {
    const scripts = buildTerminalScripts(full);
    assert.equal(out(scripts, '$ tail -2 blog').text, 'The Birthday Paradox');
    assert.equal(out(scripts, '$ tail -3 blog').text, 'TFT Set 18 Comps');
    assert.equal(out(scripts, '$ head -1 blog').text, 'Old Post · 2026');
    assert.equal(out(scripts, '$ head -1 blog').href, '/blog/old');
    assert.equal(out(scripts, '$ top posts').text, 'TFT Set 18 Comps · 5.4K views');
    assert.equal(out(scripts, '$ top posts --2').text, 'The Birthday Paradox · 1.2K views');
    assert.equal(out(scripts, '$ top posts --3').text, 'Trending Podcasts · 156 views');
    assert.equal(out(scripts, '$ stats').text, '4 posts · 6.8K views');
    assert.equal(out(scripts, '$ stats').href, '/blog');
    assert.equal(out(scripts, '$ months').text, '3 months of writing');
    assert.equal(out(scripts, '$ this-month').text, '2 posts in Oct');
    assert.equal(out(scripts, '$ minutes').text, '35 min of reading');
    assert.equal(out(scripts, '$ ls Gaming').text, '2 posts');
    assert.equal(out(scripts, '$ ls Gaming').href, '/blog?category=Gaming');
    assert.equal(out(scripts, '$ ls Curiosity').text, '1 post');
    assert.equal(out(scripts, '$ ls AI'), undefined);
  });

  it('sorts posts itself and handles a single post', () => {
    const shuffled = buildTerminalScripts({ ...full, posts: [...posts].reverse() });
    assert.equal(out(shuffled, '$ tail -1 blog').href, '/blog/trending-podcasts');
    assert.equal(out(shuffled, '$ head -1 blog').href, '/blog/old');
    const one = buildTerminalScripts({ ...full, posts: [posts[0]] });
    assert.equal(out(one, '$ months').text, '1 month of writing');
    assert.equal(out(one, '$ fortune').href, '/blog/trending-podcasts');
    assert.equal(out(one, '$ head -1 blog'), undefined);
    assert.equal(out(one, '$ tail -2 blog'), undefined);
  });

  it('rotates fortune daily but deterministically', () => {
    const a = out(buildTerminalScripts(full), '$ fortune').text;
    const b = out(buildTerminalScripts(full), '$ fortune').text;
    assert.equal(a, b);
    const next = out(buildTerminalScripts({ ...full, nowMs: NOW + 86400000 }), '$ fortune').text;
    assert.notEqual(a, next);
    assert.ok(posts.some((p) => p.title === a));
  });

  it('drops flat quotes individually and the market family on a dead feed', () => {
    const scripts = buildTerminalScripts(full);
    assert.equal(out(scripts, '$ nasdaq').text, 'Nasdaq 100 -0.6% today');
    assert.equal(out(scripts, '$ dow'), undefined);
    assert.equal(out(scripts, '$ leader').text, 'Bitcoin +2.1% leads today');
    const flat = buildTerminalScripts({
      ...full,
      quotes: full.quotes.map((q) => ({ ...q, pct: '+0.0%', changePct: 0 })),
    });
    for (const cmd of ['$ market', '$ nasdaq', '$ dow', '$ gold', '$ btc', '$ leader']) {
      assert.equal(out(flat, cmd), undefined);
    }
    assert.equal(flat.length, 32);
  });

  it('lags the leader on an all-red day', () => {
    const scripts = buildTerminalScripts({
      ...full,
      quotes: [{ label: 'S&P 500', pct: '-0.2%', changePct: -0.002 }],
    });
    assert.equal(out(scripts, '$ leader').text, 'S&P 500 -0.2% lags today');
  });

  it('covers podcasts, books, and evergreen lines', () => {
    const scripts = buildTerminalScripts(full);
    assert.equal(out(scripts, '$ month').text, 'Roman Empire Rise and Fall · 2.1M views');
    assert.equal(out(scripts, '$ month').href, '/blog/trending-podcasts');
    assert.equal(out(scripts, '$ episodes').text, '30 trending · 37 this month');
    assert.equal(out(scripts, '$ shows').text, '39 shows tracked');
    assert.equal(out(scripts, '$ genres').text, '8 genres covered');
    assert.equal(out(scripts, '$ spin').text, 'November five · verdicts Nov 30');
    assert.equal(out(scripts, '$ spin').href, '/blog/monthly-book-spin');
    assert.equal(out(scripts, '$ pool').text, '320 books · 12 genres');
    assert.equal(out(scripts, '$ quick').text, 'The Giver · 208p');
    assert.equal(out(scripts, '$ classic').text, 'Frankenstein · 280p');
    assert.equal(out(scripts, '$ stretch').text, 'The Name of the Wind · 662p');
    assert.equal(out(scripts, '$ pages').text, '2841 pages this month');
    assert.equal(out(scripts, '$ whoami').text, "aj · this site's human");
    assert.equal(out(scripts, '$ uptime').text, 'writing since 2025');
    assert.equal(out(scripts, '$ date').text, 'Tue, 13 Oct 2026');
    assert.equal(out(scripts, '$ tools').href, '/#tools');
    assert.equal(out(scripts, '$ countdown').text, '80 days left in 2026');
  });

  it('falls back to a static floor when every feed is down', () => {
    const scripts = buildTerminalScripts({
      posts: null,
      latestAge: null,
      nowMs: NOW,
      quotes: null,
      topEp: null,
      monthEp: null,
      epCounts: null,
      showCount: 39,
      genreCount: 8,
      books: null,
    });
    assert.deepEqual(
      scripts.map((s) => s.map((l) => l.text)),
      [
        ['$ tail -1 blog', '(no posts yet)'],
        ['$ top podcasts', 'charts unavailable'],
        ['$ shows', '39 shows tracked'],
        ['$ help', '10 commands · try: tail, top…'],
        ['$ genres', '8 genres covered'],
        ['$ whoami', "aj · this site's human"],
        ['$ uptime', 'writing since 2025'],
        ['$ date', 'Tue, 13 Oct 2026'],
        ['$ tools', 'stock · books · podcasts'],
        ['$ countdown', '80 days left in 2026'],
      ],
    );
  });

  it('clamps every output to the one-line box', () => {
    const scripts = buildTerminalScripts({
      ...full,
      posts: [{ title: 'A'.repeat(100), slug: 'x', createdAt: '2026-10-01T00:00:00Z', views: 1, category: null, readTime: null }],
      latestAge: null,
      topEp: { channel: 'C'.repeat(60), vph: '99.9K/hr' },
      monthEp: { title: 'M'.repeat(80), views: '9.9M views' },
    });
    assert.ok(scripts.every((s) => s[1].text.length <= 44));
    assert.equal(out(scripts, '$ tail -1 blog').text, `${'A'.repeat(30)}…`);
    assert.ok(out(scripts, '$ top podcasts').text.endsWith('…'));
  });
});
