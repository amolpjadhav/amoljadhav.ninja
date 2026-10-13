// Homepage Tools row helpers. Self-contained like the other lib modules:
// the server component wires these to the real data libs (stocks, podcasts,
// books), which node --test can't resolve extensionless.
export const VIEW_COUNT_THRESHOLD = 10;

// Compact 1.5K/2M formatting, mirroring formatCount in lib/utils (which the
// Tools row can't import without breaking node resolution). A parity test
// below guards drift.
export function compactCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

// Null below the threshold so new posts don't wear a "1 views" badge.
export function viewCountLabel(views: number | null | undefined): string | null {
  if (typeof views !== 'number' || !Number.isFinite(views) || views < VIEW_COUNT_THRESHOLD) return null;
  return `${compactCount(Math.floor(views))} views`;
}

// Memoizes an async loader for ttlMs; concurrent callers share one flight,
// and a failure serves the last good value (or null) instead of throwing.
export function memoizeTtl<T>(ttlMs: number, fn: () => Promise<T>): () => Promise<T | null> {
  let cachedAt = 0;
  let value: T | null = null;
  let pending: Promise<T | null> | null = null;
  return () => {
    if (value !== null && Date.now() - cachedAt < ttlMs) return Promise.resolve(value);
    if (!pending) {
      pending = fn().then(
        (v) => {
          value = v;
          cachedAt = Date.now();
          pending = null;
          return v;
        },
        () => {
          pending = null;
          return value;
        },
      );
    }
    return pending;
  };
}

export interface StripQuote {
  label: string;
  changePct: number | null;
  spark: number[];
  prevClose: number | null;
}

export interface StripItem {
  label: string;
  changePct: number | null;
  spark: number[];
  /** Baseline for the card's intraday chart: where the day started. */
  prevClose: number | null;
}

export function toStripItems(strip: StripQuote[]): StripItem[] {
  return strip.map((q) => ({
    label: q.label,
    changePct: q.changePct,
    spark: q.spark,
    prevClose: q.prevClose,
  }));
}

export type ChangeTone = 'up' | 'down' | 'flat';

// Honest move formatting for the Tools card. Two rules, both about not
// overclaiming: a move too small to round to anything is flat and gray
// (green "+0.0%" says "up" about a number that isn't), and a move under a
// tenth of a percent gets a second decimal so the color has something real
// to describe. changePct arrives as a fraction: -0.001 is -0.1%.
export function formatChangePct(x: number | null | undefined): { text: string; tone: ChangeTone } {
  if (x === null || x === undefined || !Number.isFinite(x)) return { text: '—', tone: 'flat' };
  const pct = x * 100;
  if (Math.abs(pct) < 0.005) return { text: '0.00%', tone: 'flat' };
  const text = `${pct > 0 ? '+' : '-'}${Math.abs(pct).toFixed(Math.abs(pct) < 0.1 ? 2 : 1)}%`;
  return { text, tone: pct > 0 ? 'up' : 'down' };
}

// A strip where every quote rounds to 0.0% is a dead feed (seen on
// weekends), not real data — the card should fall back instead of printing
// a wall of +0.0%.
export function stripHasMoves(strip: Array<{ changePct: number | null }>): boolean {
  return strip.some(
    (q) => q.changePct !== null && Number.isFinite(q.changePct) && Math.abs(q.changePct * 100) >= 0.05,
  );
}

export interface EpisodeSource {
  title: string;
  channel: string;
  thumbnail?: string | null;
  viewsPerHour: number | null;
  url: string;
}

export interface TopEpisode {
  title: string;
  channel: string;
  thumbnail: string | null;
  viewsPerHour: number | null;
  url: string;
}

export function toTopEpisode(ep: EpisodeSource | undefined): TopEpisode | null {
  if (!ep) return null;
  return {
    title: ep.title,
    channel: ep.channel,
    thumbnail: ep.thumbnail ?? null,
    viewsPerHour: ep.viewsPerHour,
    url: ep.url,
  };
}
