// Full-episode transcripts from podcast RSS feeds — no audio or video is
// ever downloaded. Shows whose feeds carry <podcast:transcript> tags get
// real transcript summaries; everyone else keeps the description fallback.
// Only the summary is stored and shown, never the raw transcript.
//
// Pure helpers (parsers, matching) live here so node tests pin them;
// network lives in the server-only functions below.

/** Show label (matches CHANNELS in ./podcasts) → RSS feed URL. */
export const TRANSCRIPT_FEEDS: Record<string, string> = {
  'Breaking Points':
    'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/e7fd5ae7-7621-4e41-9b85-b0ab0164b634/4c1a5135-4197-47c9-b19b-b0ab0164b667/podcast.rss',
  'Diary of a CEO': 'https://rss2.flightcast.com/xmsftuzjjykcmqwolaqn6mdn',
};

export interface TranscriptSegment {
  /** Start time in seconds. */
  t: number;
  text: string;
}

export interface FeedItem {
  title: string;
  pubDate: string;
  transcriptUrl: string | null;
  transcriptType: string | null;
}

/** "00:12:40.000" / "12:40.000" / "75.5" → seconds. */
export function cueTimeToSec(raw: string): number {
  const m = raw.trim().match(/^(?:(\d+):)?([0-5]?\d):([0-5]?\d(?:[.,]\d+)?)$|^(\d+(?:\.\d+)?)$/);
  if (!m) return NaN;
  if (m[4] !== undefined) return Number(m[4]);
  return (m[1] ? Number(m[1]) * 3600 : 0) + Number(m[2]) * 60 + Number(m[3].replace(',', '.'));
}

function cleanCueText(line: string): string {
  return line
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/** WebVTT → segments. Cue headers may carry settings after the end stamp. */
export function parseVtt(body: string): TranscriptSegment[] {
  const out: TranscriptSegment[] = [];
  const blocks = body.replace(/^\uFEFF/, '').split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const head = lines.findIndex((l) => l.includes('-->'));
    if (head === -1) continue;
    const start = cueTimeToSec(lines[head].split('-->')[0]);
    if (!Number.isFinite(start) || start < 0) continue;
    const text = lines
      .slice(head + 1)
      .map(cleanCueText)
      .filter((l) => l && !l.includes('-->'))
      .join(' ');
    if (text) out.push({ t: Math.floor(start), text });
  }
  return dedupeSegments(out);
}

/** SubRip → segments ("00:12:40,000 --> 00:12:45,000", numeric cue ids). */
export function parseSrt(body: string): TranscriptSegment[] {
  return parseVtt(body.replace(/,/g, '.'));
}

function dedupeSegments(segs: TranscriptSegment[]): TranscriptSegment[] {
  const out: TranscriptSegment[] = [];
  let last = '';
  for (const s of segs) {
    // Live-caption feeds repeat the rolling line; keep it once.
    if (s.text === last) continue;
    last = s.text;
    out.push(s);
  }
  return out;
}

/** Best-effort JSON transcript: [{start|t_seconds|startTime, text|line}]. */
export function parseTranscriptJson(body: string): TranscriptSegment[] {
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return [];
  }
  const arr = Array.isArray(json) ? json : (json as Record<string, unknown>)?.segments;
  if (!Array.isArray(arr)) return [];
  const out: TranscriptSegment[] = [];
  for (const row of arr) {
    if (typeof row !== 'object' || row === null) continue;
    const r = row as Record<string, unknown>;
    const raw = r.start ?? r.t_seconds ?? r.startTime ?? r.t;
    const t = typeof raw === 'string' ? cueTimeToSec(raw) : Number(raw);
    const text = typeof r.text === 'string' ? r.text : typeof r.line === 'string' ? r.line : '';
    if (Number.isFinite(t) && (t as number) >= 0 && text.trim()) {
      out.push({ t: Math.floor(t as number), text: cleanCueText(text) });
    }
  }
  return dedupeSegments(out);
}

/** Pick a parser by transcript MIME/type or URL suffix. */
export function parseTranscript(body: string, type: string | null, url: string): TranscriptSegment[] {
  const hint = `${type ?? ''} ${url}`.toLowerCase();
  if (hint.includes('json')) return parseTranscriptJson(body);
  if (hint.includes('srt')) return parseSrt(body);
  return parseVtt(body);
}

function tagInner(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() || null;
}

/** Lightweight RSS parse: items with any <podcast:transcript url …> link. */
export function parseFeedItems(xml: string): FeedItem[] {
  const out: FeedItem[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const item = m[0];
    const title = tagInner(item, 'title');
    const pubDate = tagInner(item, 'pubDate');
    if (!title || !pubDate) continue;
    const t = item.match(/<podcast:transcript\b[^>]*url="([^"]+)"[^>]*>/i);
    out.push({
      title,
      pubDate,
      transcriptUrl: t?.[1] ? decodeXmlEntities(t[1]) : null,
      transcriptType: t?.[0].match(/type="([^"]+)"/i)?.[1] ?? null,
    });
  }
  return out;
}

function decodeXmlEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

const STOP = new Set(
  'the a an and of to in on for with full episode hd official video podcast show live'.split(' '),
);

function stem(word: string): string {
  // Light suffix strip so "houthis"/"houthi" and "cowers"/"cowering" meet.
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))
      .map(stem),
  );
}

/** Episode-number match (#318, ep 318) is the strongest signal. */
export function episodeNumber(title: string): string | null {
  const m = title.match(/(?:^|\s)(?:#|e(?=\d)|ep\.?\s*|episode\s*)(\d{1,4})(?:\s|$|[:\-–])/i);
  return m ? m[1].replace(/^0+/, '') || '0' : null;
}

/**
 * YouTube title → RSS item. Number match wins; otherwise word overlap ≥ 0.35
 * with a pub date within 3 days of the video.
 */
export function matchFeedItem(ytTitle: string, ytPublishedAt: string, items: FeedItem[]): FeedItem | null {
  const ytNum = episodeNumber(ytTitle);
  const ytDate = Date.parse(ytPublishedAt);
  const ytTokens = titleTokens(ytTitle);
  const scored: { item: FeedItem; overlap: number; dayGap: number }[] = [];
  for (const item of items) {
    if (!item.transcriptUrl) continue;
    const itemNum = episodeNumber(item.title);
    if (ytNum && itemNum && ytNum === itemNum) return item;
    if (ytTokens.size === 0 || !Number.isFinite(ytDate)) continue;
    const itTokens = titleTokens(item.title);
    let overlap = 0;
    for (const w of ytTokens) if (itTokens.has(w)) overlap += 1;
    scored.push({ item, overlap, dayGap: Math.abs(Date.parse(item.pubDate) - ytDate) / 86400000 });
  }
  // Strict pass: symmetric overlap. Relaxed pass: coverage of the YouTube
  // title (multi-topic show titles dilute the symmetric score), needing 2+
  // shared words on the same day so one generic word never matches alone.
  // This lets a same-day full-show item cover a clip with a rewritten title.
  let best: FeedItem | null = null;
  let bestScore = 0;
  for (const s of scored) {
    const denom = Math.max(ytTokens.size, titleTokens(s.item.title).size);
    const score = denom === 0 ? 0 : s.overlap / denom;
    if (score >= 0.35 && s.dayGap <= 3 && score > bestScore) {
      best = s.item;
      bestScore = score;
    }
  }
  if (best) return best;
  best = null;
  bestScore = 0;
  for (const s of scored) {
    const coverage = ytTokens.size === 0 ? 0 : s.overlap / ytTokens.size;
    if (coverage >= 0.25 && s.overlap >= 2 && s.dayGap <= 1 && coverage > bestScore) {
      best = s.item;
      bestScore = coverage;
    }
  }
  return best;
}

// --- Server-only fetchers (never imported by node tests) ---

const feedCache = new Map<string, { at: number; items: FeedItem[] }>();

async function fetchText(url: string, timeoutMs = 20000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'amoljadhav-ai-summary/1.0 (+https://www.amoljadhav.ai)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Feed items for a show, cached 1h so a daily batch fetches each feed once. */
export async function fetchShowItems(show: string): Promise<FeedItem[]> {
  const url = TRANSCRIPT_FEEDS[show];
  if (!url) return [];
  const hit = feedCache.get(show);
  if (hit && Date.now() - hit.at < 3600000) return hit.items;
  const items = parseFeedItems(await fetchText(url));
  feedCache.set(show, { at: Date.now(), items });
  return items;
}

export interface FetchedTranscript {
  segments: TranscriptSegment[];
  transcriptUrl: string;
  feedTitle: string;
}

/**
 * A transcript 2× the video's length is a different edit (e.g. a clip
 * matched to its full show): its timestamps would point past the end of
 * the video. Accept only transcripts within [0.5×, 1.4×] of the video.
 * Unknown duration skips the check.
 */
export function transcriptFitsVideo(spanSec: number, durationSec: number | undefined): boolean {
  if (durationSec === undefined || !Number.isFinite(durationSec) || durationSec <= 0) return true;
  const ratio = spanSec / durationSec;
  return ratio >= 0.5 && ratio <= 1.4;
}

/**
 * Full transcript segments for a YouTube episode, or null when the show has
 * no feed or no matching item. Text only — callers store summaries, never this.
 */
export async function fetchTranscriptFor(
  show: string,
  ytTitle: string,
  ytPublishedAt: string,
  durationSec?: number,
): Promise<FetchedTranscript | null> {
  const items = await fetchShowItems(show).catch(() => []);
  const match = matchFeedItem(ytTitle, ytPublishedAt, items);
  if (!match?.transcriptUrl) return null;
  const body = await fetchText(match.transcriptUrl).catch(() => null);
  if (!body) return null;
  const segments = parseTranscript(body, match.transcriptType, match.transcriptUrl);
  if (segments.length < 10) return null;
  const span = segments[segments.length - 1].t - segments[0].t;
  if (!transcriptFitsVideo(span, durationSec)) return null;
  return { segments, transcriptUrl: match.transcriptUrl, feedTitle: match.title };
}
