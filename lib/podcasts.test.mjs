// Tests for the podcast trending data layer (pure functions only — no network).
// Run: npm test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  formatViews,
  normalizeVideo,
  parseDuration,
  rankEpisodes,
  selectRecentIds,
  timeAgo,
  uploadsPlaylistId,
} from './podcasts.ts';

describe('uploadsPlaylistId', () => {
  it('swaps the UC prefix for UU', () => {
    assert.equal(uploadsPlaylistId('UCSHZKyawb77ixDdsGog4iWA'), 'UUSHZKyawb77ixDdsGog4iWA');
    assert.equal(uploadsPlaylistId('other'), 'other');
  });
});

describe('parseDuration', () => {
  it('converts ISO 8601 to seconds', () => {
    assert.equal(parseDuration('PT3H36M56S'), 3 * 3600 + 36 * 60 + 56);
    assert.equal(parseDuration('PT45M'), 2700);
    assert.equal(parseDuration('PT30S'), 30);
    assert.equal(parseDuration('nope'), null);
    assert.equal(parseDuration(undefined), null);
  });
});

describe('normalizeVideo', () => {
  it('reads string stats and rejects bare items', () => {
    const labels = new Map([['UCx', 'Seed Label']]);
    const ep = normalizeVideo(
      {
        id: 'abc123',
        snippet: {
          title: 'Great Episode',
          channelId: 'UCx',
          channelTitle: 'API Title',
          publishedAt: '2026-10-01T00:00:00Z',
          thumbnails: { medium: { url: 'https://img/mq.jpg' } },
        },
        statistics: { viewCount: '12345', likeCount: '678' },
        contentDetails: { duration: 'PT1H2M3S' },
      },
      labels,
    );
    assert.equal(ep?.views, 12345);
    assert.equal(ep?.likes, 678);
    assert.equal(ep?.durationSec, 3723);
    assert.equal(ep?.channel, 'Seed Label');
    assert.equal(ep?.url, 'https://www.youtube.com/watch?v=abc123');
    assert.equal(normalizeVideo({ id: 'x', snippet: {}, statistics: {} }, labels), null);
    assert.equal(normalizeVideo({ snippet: { title: 't' }, statistics: { viewCount: '1' } }, labels), null);
    const withDesc = normalizeVideo(
      {
        id: 'd1',
        snippet: { title: 't', description: 'Guest: Naval Ravikant joins us.' },
        statistics: { viewCount: '10' },
      },
      labels,
    );
    assert.equal(withDesc?.description, 'Guest: Naval Ravikant joins us.');
    const long = normalizeVideo(
      { id: 'd2', snippet: { title: 't', description: 'x'.repeat(5000) }, statistics: { viewCount: '10' } },
      labels,
    );
    assert.equal(long?.description?.length, 2000);
  });
});

describe('formatViews', () => {
  it('compacts thousands and millions', () => {
    assert.equal(formatViews(999), '999');
    assert.equal(formatViews(1500), '1.5K');
    assert.equal(formatViews(12000), '12K');
    assert.equal(formatViews(2500000), '2.5M');
    assert.equal(formatViews(-1), '0');
  });
});

describe('formatDuration', () => {
  it('renders compact lengths', () => {
    assert.equal(formatDuration(3723), '1h 2m');
    assert.equal(formatDuration(2700), '45m');
    assert.equal(formatDuration(undefined), null);
    assert.equal(formatDuration(0), null);
  });
});

describe('timeAgo', () => {
  it('renders relative ages', () => {
    const now = Date.parse('2026-10-10T12:00:00Z');
    assert.equal(timeAgo('2026-10-10T11:59:30Z', now), 'just now');
    assert.equal(timeAgo('2026-10-10T11:30:00Z', now), '30m ago');
    assert.equal(timeAgo('2026-10-10T09:00:00Z', now), '3h ago');
    assert.equal(timeAgo('2026-10-07T12:00:00Z', now), '3d ago');
    assert.equal(timeAgo('2026-08-10T12:00:00Z', now), '2mo ago');
    assert.equal(timeAgo('garbage', now), null);
  });
});

describe('rankEpisodes', () => {
  it('sorts by views desc without mutating', () => {
    const a = { videoId: 'a', views: 10 };
    const b = { videoId: 'b', views: 99 };
    const input = [a, b];
    assert.deepEqual(rankEpisodes(input).map((e) => e.videoId), ['b', 'a']);
    assert.deepEqual(input.map((e) => e.videoId), ['a', 'b']);
  });
});

describe('two-list ranking', () => {
  it('windows, filters, caps, and orders each list', async () => {
    const { trendingNow, mostWatched, viewsPerHour, isReissue, clipTag } = await import('./podcasts.ts');
    const now = Date.parse('2026-10-10T12:00:00Z');
    const h = (n) => new Date(now - n * 3600000).toISOString();
    assert.equal(viewsPerHour(240, h(2), now), 120);
    assert.equal(viewsPerHour(100, h(-1), now), null);
    assert.equal(isReissue('RE-RELEASE: Ben Affleck'), true);
    assert.equal(isReissue('Best of 2025'), true);
    assert.equal(isReissue('Encore presentation'), true);
    assert.equal(isReissue('The Rerun Episode'), true);
    assert.equal(isReissue('A normal title'), false);
    assert.equal(clipTag('Tools | Huberman Lab Essentials'), 'Essentials cut');
    assert.equal(clipTag('Funniest moments vol 3'), 'Moments cut');
    assert.equal(clipTag('A normal title'), null);

    const mk = (id, ch, views, ageH, title = 'Ep') => ({
      videoId: id, title, channelId: ch, channel: ch, publishedAt: h(ageH),
      views, url: `https://www.youtube.com/watch?v=${id}`,
    });
    const eps = [
      mk('fast', 'A', 24000, 12), // 2000/hr, in window
      mk('slow', 'A', 24000, 72), // 333/hr, in window
      mk('newborn', 'B', 5000, 2), // too young for trending
      mk('old', 'B', 900000, 24 * 20), // month list only
      mk('ancient', 'B', 5000000, 24 * 60), // too old for both
      mk('re', 'C', 999999, 10, 'RE-RELEASE: Old Gold'), // excluded everywhere
      mk('ess', 'D', 999999, 10, 'Focus | Huberman Lab Essentials'), // month list only
      mk('a2', 'A', 10000, 20),
      mk('a3', 'A', 9000, 30),
      mk('a4', 'A', 8000, 40), // over the 3/show cap
    ];
    const trending = trendingNow(eps, now);
    assert.deepEqual(trending.map((e) => e.videoId), ['fast', 'a2']);
    assert.equal(trending[0].viewsPerHour, 2000);
    const monthly = mostWatched(eps, now);
    assert.ok(monthly[0].videoId === 'ess' || monthly[0].views === 999999);
    assert.ok(monthly.some((e) => e.videoId === 'old'));
    assert.ok(monthly.some((e) => e.videoId === 'ess' && e.tag === 'Essentials cut'));
    assert.ok(!monthly.some((e) => e.videoId === 're' || e.videoId === 'ancient'));
    assert.ok(monthly.filter((e) => e.channelId === 'A').length <= 2);
  });
});

describe('formatPerHour', () => {
  it('compacts velocity with a /hr suffix', async () => {
    const { formatPerHour } = await import('./podcasts.ts');
    assert.equal(formatPerHour(999), '999/hr');
    assert.equal(formatPerHour(28884), '28.9K/hr');
    assert.equal(formatPerHour(0), null);
    assert.equal(formatPerHour(null), null);
  });
});

describe('ageHours', () => {
  it('measures fractional age and rejects bad dates', async () => {
    const { ageHours } = await import('./podcasts.ts');
    const now = Date.parse('2026-10-10T12:00:00Z');
    assert.equal(ageHours('2026-10-10T06:00:00Z', now), 6);
    assert.equal(ageHours('2026-10-10T11:30:00Z', now), 0.5);
    assert.equal(ageHours('2026-10-11T12:00:00Z', now), null);
    assert.equal(ageHours('garbage', now), null);
  });
});

describe('selectRecentIds', () => {
  const NOW = Date.UTC(2026, 9, 11, 12);
  const day = 86400000;
  const iso = (ms) => new Date(ms).toISOString();
  const eps = [
    { videoId: 'fresh', publishedAt: iso(NOW - day) },
    { videoId: 'edge', publishedAt: iso(NOW - 35 * day) },
    { videoId: 'old', publishedAt: iso(NOW - 36 * day) },
    { videoId: 'future', publishedAt: iso(NOW + day) },
    { videoId: 'garbage', publishedAt: 'not-a-date' },
  ];

  it('selects the refresh window, edges included, garbage out', () => {
    assert.deepEqual(selectRecentIds(eps, NOW), ['fresh', 'edge', 'future']);
    assert.deepEqual(selectRecentIds(eps, NOW, 1), ['fresh', 'future']);
    assert.deepEqual(selectRecentIds([], NOW), []);
  });
});
