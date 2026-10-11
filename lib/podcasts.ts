// YouTube trending-podcasts data layer: latest long-form episodes across a
// curated channel list, ranked by view count. Runs server-side in
// /api/podcasts/* routes; the API key never leaves the server.
//
// Quota: ~1 unit per channel (uploads playlist) + 1 unit per 50 videos
// (batched statistics) per refresh — ~45 units for the current list.
// No search calls (100 units each) anywhere on this path.
export interface PodcastChannel {
  id: string; // UC... channel id
  label: string;
  genre: string;
}

export const PODCAST_GENRES = ['Tech', 'News', 'Comedy', 'Business', 'Crime', 'Health', 'Science', 'Interview'];

export interface PodcastEpisode {
  videoId: string;
  title: string;
  channelId: string;
  channel: string;
  publishedAt: string; // ISO date
  views: number;
  likes?: number;
  durationSec?: number;
  thumbnail?: string;
  url: string;
  description?: string; // first 2KB, server-side only: person matching reads it, routes strip it before responding
}

export interface RankedEpisode extends PodcastEpisode {
  viewsPerHour: number | null;
  tag?: string; // e.g. 'Essentials cut' for repackaged clip episodes
  genre: string;
  channelThumb?: string;
}

// Curated seed list: top podcast shows with native YouTube channels.
// Handles resolved to ids via channels/list?forHandle (2026-10-10).
export const CHANNELS: PodcastChannel[] = [
  { id: 'UCzQUP1qoWDoEbmsQxvdjxgQ', label: 'Joe Rogan Experience', genre: 'Interview' },
  { id: 'UCSHZKyawb77ixDdsGog4iWA', label: 'Lex Fridman', genre: 'Tech' },
  { id: 'UC2D2CMWXMOVWx7giW1n3LIg', label: 'Huberman Lab', genre: 'Health' },
  { id: 'UC-W8Qu2Zb407kjVhW-5U-SA', label: 'SmartLess', genre: 'Comedy' },
  { id: 'UC5AQEUAwCh1sGDvkQtkDWUQ', label: 'Theo Von', genre: 'Comedy' },
  { id: 'UC5PstSsGrRwj2o6asQpC4Rg', label: 'Flagrant', genre: 'Comedy' },
  { id: 'UC4woSp8ITBoYDmjkukhEhxg', label: 'Tim Dillon', genre: 'Comedy' },
  { id: 'UCGq-a57w-aPwyi3pW7XLiHw', label: 'Diary of a CEO', genre: 'Business' },
  { id: 'UCIaH-gZIVC432YRjNVvnyCA', label: 'Modern Wisdom', genre: 'Interview' },
  { id: 'UCyaN6mg5u8Cjy2ZI4ikWaug', label: 'My First Million', genre: 'Business' },
  { id: 'UCESLZhusAkFfsNsApnjF_Cg', label: 'All-In Podcast', genre: 'Tech' },
  { id: 'UCkoujZQZatbqy4KGcgjpVxQ', label: 'Shawn Ryan Show', genre: 'News' },
  { id: 'UClKP53RewJWK5s5WtLSg7Dg', label: 'Armchair Expert', genre: 'Interview' },
  { id: 'UCyGi3eCuxko37WB6uUr7LjA', label: 'Call Her Daddy', genre: 'Interview' },
  { id: 'UCnYMOamNKLGVlJgRUbamveA', label: 'Tom Bilyeu', genre: 'Business' },
  { id: 'UCDRIjKy6eZOvKtOELtTdeUA', label: 'Breaking Points', genre: 'News' },
  { id: 'UCKRoXz3hHAu2XL_k3Ef4vJQ', label: 'Pod Save America', genre: 'News' },
  { id: 'UCZcR2SVWaGWNlMqPxvQS3vw', label: 'Hard Fork', genre: 'Tech' },
  { id: 'UC6t1O76G0jYXOAoYCm153dA', label: "Lenny's Podcast", genre: 'Tech' },
  { id: 'UCyFqFYfTW2VoIQKylJ04Rtw', label: 'Acquired', genre: 'Business' },
  { id: 'UCwzCMiicL-hBUzyjWiJaseg', label: 'Kill Tony', genre: 'Comedy' },
  { id: 'UCRBpynZV0b7ww2XMCfC17qg', label: 'Bad Friends', genre: 'Comedy' },
  { id: 'UCtPrkXdtCM5DACLufB9jbsA', label: 'MrBallen', genre: 'Crime' },
  { id: 'UCpRiMGGX2hM9zqv6FgXXbKg', label: 'Crime Junkie', genre: 'Crime' },
  { id: 'UC9cn0TuPq4dnbTY-CBsm8XA', label: 'a16z', genre: 'Tech' },
  { id: 'UC8kGsMa0LygSX9nkBcBH1Sg', label: 'Peter Attia', genre: 'Health' },
  { id: 'UCWF8SqJVNlx-ctXbLswcTcA', label: 'FoundMyFitness', genre: 'Health' },
  { id: 'UCbV60AGIHKz2xIGvbk0LLvg', label: 'Jay Shetty', genre: 'Interview' },
  { id: 'UCznv7Vf9nBdJYvBagFdAHWw', label: 'Tim Ferriss', genre: 'Interview' },
  { id: 'UCamLstJyCa-t5gfZegxsFMw', label: 'Colin and Samir', genre: 'Business' },
  { id: 'UCRhV1rWIpm_pU19bBm_2RXw', label: 'Sean Carroll', genre: 'Science' },
  { id: 'UCqoAEDirJPjEUFcF2FklnBA', label: 'StarTalk', genre: 'Science' },
  { id: 'UCTb6Oy0TXI03iEUdRMR9dnw', label: 'Stuff You Should Know', genre: 'Science' },
  { id: 'UCIyIoM_Nd8HtY19fuR_ov2A', label: 'TigerBelly', genre: 'Comedy' },
  { id: 'UCLtREJY21xRfCuEKvdki1Kw', label: 'H3 Podcast', genre: 'Comedy' },
  { id: 'UCSJMy8XBtaSZGuV5xpCHWQw', label: 'Last Podcast On The Left', genre: 'Crime' },
  { id: 'UCBHGZpDF2fsqPIPi0pNyuTg', label: 'Pivot', genre: 'Tech' },
  { id: 'UCi7GJNg51C3jgmYTUwqoUXA', label: 'Team Coco', genre: 'Comedy' },
  { id: 'UCy2FPslt0LLPsIV0iukvHpQ', label: 'Founders Podcast', genre: 'Business' },
];

const YT = 'https://www.googleapis.com/youtube/v3';
const PER_CHANNEL = 50; // latest uploads fetched per channel before filtering (person search needs depth; listing costs the same 1 unit per channel either way)
const MIN_SECONDS = 20 * 60; // clips/shorts don't count as episodes

// A channel's uploads playlist id is its id with the UC prefix swapped to UU.
export function uploadsPlaylistId(channelId: string): string {
  return channelId.startsWith('UC') ? `UU${channelId.slice(2)}` : channelId;
}

// ISO 8601 durations (PT3H36M56S) to seconds; null when unparseable.
export function parseDuration(iso: unknown): number | null {
  if (typeof iso !== 'string') return null;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  return (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0);
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function normalizeVideo(item: Record<string, unknown>, channelLabel: Map<string, string>): PodcastEpisode | null {
  if (typeof item.id !== 'string' || !item.id) return null;
  const snippet = (item.snippet ?? {}) as Record<string, unknown>;
  const stats = (item.statistics ?? {}) as Record<string, unknown>;
  const details = (item.contentDetails ?? {}) as Record<string, unknown>;
  if (typeof snippet.title !== 'string' || !snippet.title) return null;
  const views = num(stats.viewCount);
  if (views === undefined) return null; // private/deleted videos carry no stats
  const thumbs = (snippet.thumbnails ?? {}) as Record<string, { url?: string }>;
  const channelId = typeof snippet.channelId === 'string' ? snippet.channelId : '';
  return {
    videoId: item.id,
    title: snippet.title,
    channelId,
    channel: channelLabel.get(channelId) ?? (typeof snippet.channelTitle === 'string' ? snippet.channelTitle : 'Unknown'),
    publishedAt: typeof snippet.publishedAt === 'string' ? snippet.publishedAt : '',
    views,
    likes: num(stats.likeCount),
    durationSec: parseDuration(details.duration) ?? undefined,
    thumbnail: thumbs.medium?.url ?? thumbs.default?.url,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    description:
      typeof snippet.description === 'string' && snippet.description ? snippet.description.slice(0, 2000) : undefined,
  };
}

export function formatViews(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1000) return String(Math.floor(n));
  if (n < 1_000_000) return `${parseFloat((n / 1000).toFixed(1))}K`;
  return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
}

export function formatDuration(sec: number | undefined): string | null {
  if (sec === undefined || !Number.isFinite(sec) || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function timeAgo(iso: string, nowMs: number = Date.now()): string | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const mins = Math.max(0, Math.floor((nowMs - t) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function rankEpisodes(episodes: PodcastEpisode[]): PodcastEpisode[] {
  return [...episodes].sort((a, b) => b.views - a.views);
}

export function formatPerHour(vph: number | null): string | null {
  if (vph === null || !Number.isFinite(vph) || vph <= 0) return null;
  if (vph < 1000) return `${Math.round(vph)}/hr`;
  return `${formatViews(Math.round(vph))}/hr`;
}

// --- Two-list ranking: Trending now (velocity) vs Most watched (volume) ---

const TREND_MIN_HOURS = 6; // brand-new uploads can't spike the velocity list
const TREND_MAX_DAYS = 7;
const MONTH_MAX_DAYS = 30;
const PER_SHOW = 2; // no show takes over a list

export function ageHours(publishedAt: string, nowMs: number = Date.now()): number | null {
  const t = Date.parse(publishedAt);
  if (Number.isNaN(t)) return null;
  const hours = (nowMs - t) / 3600000;
  return hours < 0 ? null : hours;
}

export function viewsPerHour(views: number, publishedAt: string, nowMs: number = Date.now()): number | null {
  const hours = ageHours(publishedAt, nowMs);
  if (hours === null) return null;
  return views / Math.max(hours, 1 / 60); // floor at 1 minute to avoid div-by-zero
}

// Re-releases are old content with a new date — excluded from both lists.
export function isReissue(title: string): boolean {
  return /re-?release|rerun|encore|\bbest of\b/i.test(title);
}

// Repackaged clip cuts (Huberman Essentials and kin): tagged, kept out of
// Trending, allowed in Most watched with the tag shown.
export function clipTag(title: string): string | null {
  if (/essentials/i.test(title)) return 'Essentials cut';
  if (/(best|funniest|top) moments/i.test(title)) return 'Moments cut';
  return null;
}

function capPerShow(sorted: RankedEpisode[], cap: number = PER_SHOW): RankedEpisode[] {
  const seen = new Map<string, number>();
  return sorted.filter((ep) => {
    const n = seen.get(ep.channelId) ?? 0;
    if (n >= cap) return false;
    seen.set(ep.channelId, n + 1);
    return true;
  });
}

export type ScoredInput = PodcastEpisode & { genre: string; channelThumb?: string };

function attach(ep: ScoredInput, nowMs: number): RankedEpisode {
  return { ...ep, viewsPerHour: viewsPerHour(ep.views, ep.publishedAt, nowMs), tag: clipTag(ep.title) ?? undefined };
}

// Last 7 days (at least 6h old), no reissues or clip cuts, by views/hour.
export function trendingNow(episodes: ScoredInput[], nowMs: number = Date.now()): RankedEpisode[] {
  const ranked = episodes
    .map((ep) => attach(ep, nowMs))
    .filter((ep) => {
      const h = ageHours(ep.publishedAt, nowMs);
      return h !== null && h >= TREND_MIN_HOURS && h <= TREND_MAX_DAYS * 24 && !isReissue(ep.title) && !ep.tag;
    })
    .sort((a, b) => (b.viewsPerHour ?? 0) - (a.viewsPerHour ?? 0));
  return capPerShow(ranked);
}

// Last 30 days by total views; reissues out, tagged clip cuts stay.
export function mostWatched(episodes: ScoredInput[], nowMs: number = Date.now()): RankedEpisode[] {
  const ranked = episodes
    .map((ep) => attach(ep, nowMs))
    .filter((ep) => {
      const h = ageHours(ep.publishedAt, nowMs);
      return h !== null && h <= MONTH_MAX_DAYS * 24 && !isReissue(ep.title);
    })
    .sort((a, b) => b.views - a.views);
  return capPerShow(ranked);
}

async function ytJson(path: string, key: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${YT}${path}&key=${encodeURIComponent(key)}`, {
    signal: AbortSignal.timeout(15000),
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`YouTube API ${res.status} on ${path.split('?')[0]}`);
  return (await res.json()) as Record<string, unknown>;
}

export interface ChannelMeta {
  labels: Map<string, string>;
  genres: Map<string, string>;
  thumbs: Map<string, string | undefined>;
  uploads: Map<string, string>;
}

export async function channelMeta(apiKey: string): Promise<ChannelMeta> {
  const { thumbs, uploads } = await fetchChannelMeta(
    CHANNELS.map((c) => c.id),
    apiKey,
  );
  return {
    labels: new Map(CHANNELS.map((c) => [c.id, c.label])),
    genres: new Map(CHANNELS.map((c) => [c.id, c.genre])),
    thumbs,
    uploads,
  };
}

// One uploads page: 50 video ids, newest first. 1 quota unit.
async function fetchUploadsPage(
  apiKey: string,
  playlistId: string,
  pageToken?: string,
): Promise<{ ids: string[]; nextPageToken?: string }> {
  const data = await ytJson(
    `/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${PER_CHANNEL}${pageToken ? `&pageToken=${pageToken}` : ''}`,
    apiKey,
  );
  const items = (data.items ?? []) as Record<string, unknown>[];
  const ids = items
    .map((it) => ((it.snippet ?? {}) as Record<string, unknown>).resourceId as Record<string, unknown> | undefined)
    .filter((r): r is Record<string, unknown> => r?.videoId !== undefined)
    .map((r) => String(r.videoId));
  const next = data.nextPageToken;
  return { ids, nextPageToken: typeof next === 'string' && next ? next : undefined };
}

// Upload listing for one channel, newest first: page 1 for the hourly
// refresh, deeper for the one-time history backfill. 1 unit per page.
// Prefers the resolved uploads playlist (the UC→UU derivation 404s for
// some channels); derivation stays the fallback.
export async function fetchChannelUploads(
  apiKey: string,
  channelId: string,
  maxPages = 1,
  uploadsId?: string,
): Promise<string[]> {
  const playlist = uploadsId ?? uploadsPlaylistId(channelId);
  const ids: string[] = [];
  let token: string | undefined;
  for (let p = 0; p < maxPages; p++) {
    const page = await fetchUploadsPage(apiKey, playlist, token);
    ids.push(...page.ids);
    if (!page.nextPageToken || page.ids.length === 0) break;
    token = page.nextPageToken;
  }
  return [...new Set(ids)];
}

// Batched video details → normalized long-form episodes. 1 unit per 50 ids.
export async function fetchVideoDetails(apiKey: string, ids: string[], meta: ChannelMeta): Promise<ScoredInput[]> {
  const episodes: ScoredInput[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const data = await ytJson(
      `/videos?part=snippet,statistics,contentDetails&id=${ids.slice(i, i + 50).join(',')}`,
      apiKey,
    );
    for (const item of (data.items ?? []) as Record<string, unknown>[]) {
      const ep = normalizeVideo(item, meta.labels);
      if (ep && (ep.durationSec ?? 0) >= MIN_SECONDS) {
        episodes.push({
          ...ep,
          genre: meta.genres.get(ep.channelId) ?? 'Interview',
          channelThumb: meta.thumbs.get(ep.channelId),
        });
      }
    }
  }
  return episodes;
}

// Fresh view counts only (person pages re-rank live): 1 unit per 50 ids.
export async function fetchViewCounts(apiKey: string, ids: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (let i = 0; i < ids.length; i += 50) {
    const data = await ytJson(`/videos?part=statistics&id=${ids.slice(i, i + 50).join(',')}`, apiKey);
    for (const item of (data.items ?? []) as Record<string, unknown>[]) {
      const id = item.id;
      const views = Number(((item.statistics ?? {}) as Record<string, unknown>).viewCount);
      if (typeof id === 'string' && Number.isFinite(views)) counts.set(id, views);
    }
  }
  return counts;
}

// Ids published within the window: the hourly refresh re-fetches views for
// these (trending windows only ever read recent episodes), while older rows
// keep stored counts until a person page refreshes them live.
export function selectRecentIds(
  episodes: { videoId: string; publishedAt: string }[],
  nowMs: number,
  days = 35,
): string[] {
  const cutoff = nowMs - days * 86400000;
  return episodes.filter((ep) => Date.parse(ep.publishedAt) >= cutoff).map((ep) => ep.videoId);
}

// Full long-form pool across all channels: the raw material every podcast
// surface ranks from (trending lists, person search, homepage). Server
// routes share one hourly fetch via lib/podcast-pool so the fan-out runs
// once no matter how many endpoints read it.
export async function fetchEpisodePool(apiKey: string | undefined): Promise<ScoredInput[]> {
  if (!apiKey) throw new Error('missing YouTube API key');
  const meta = await channelMeta(apiKey);
  const perChannel = await Promise.all(
    CHANNELS.map(async (c) => {
      try {
        return await fetchChannelUploads(apiKey, c.id, 1, meta.uploads.get(c.id));
      } catch {
        return [] as string[];
      }
    }),
  );
  const ids = [...new Set(perChannel.flat())];
  if (ids.length === 0) return [];
  return fetchVideoDetails(apiKey, ids, meta);
}

// Latest long-form episodes across all channels, split into the two lists:
// Trending now (7-day velocity) and Most watched (30-day volume).
export async function trendingPodcasts(
  apiKey: string | undefined,
): Promise<{ trending: RankedEpisode[]; mostWatched: RankedEpisode[] }> {
  const episodes = await fetchEpisodePool(apiKey);
  const now = Date.now();
  return { trending: trendingNow(episodes, now), mostWatched: mostWatched(episodes, now) };
}

// One batched call for every channel avatar; rows render without on failure.
async function fetchChannelMeta(
  ids: string[],
  apiKey: string,
): Promise<{ thumbs: Map<string, string>; uploads: Map<string, string> }> {
  const thumbs = new Map<string, string>();
  const uploads = new Map<string, string>();
  try {
    const data = await ytJson(`/channels?part=snippet,contentDetails&id=${ids.join(',')}`, apiKey);
    for (const item of (data.items ?? []) as Record<string, unknown>[]) {
      if (typeof item.id !== 'string') continue;
      const thumbsObj = ((item.snippet ?? {}) as Record<string, unknown>).thumbnails as
        | Record<string, { url?: string }>
        | undefined;
      const url = thumbsObj?.default?.url ?? thumbsObj?.medium?.url;
      if (url) thumbs.set(item.id, url);
      const related = ((item.contentDetails ?? {}) as Record<string, unknown>).relatedPlaylists as
        | Record<string, unknown>
        | undefined;
      if (typeof related?.uploads === 'string' && related.uploads) uploads.set(item.id, related.uploads);
    }
  } catch {
    // decoration only — never fail the feed for avatars
  }
  return { thumbs, uploads };
}
