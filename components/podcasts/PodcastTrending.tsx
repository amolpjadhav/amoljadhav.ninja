'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flame, Play } from 'lucide-react';
import {
  PODCAST_GENRES,
  ageHours,
  formatDuration,
  formatPerHour,
  formatViews,
  timeAgo,
  type RankedEpisode,
} from '@/lib/podcasts';

const ACCENT = '#f59e0b';

type Tab = 'trending' | 'month';

const FOCUS =
  'focus:outline-none focus-visible:outline-2 focus-visible:outline-[#f59e0b] focus-visible:outline-offset-2';

function VelocityPill({ vph }: { vph: number | null }) {
  const label = formatPerHour(vph);
  if (!label) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums shrink-0"
      style={{ background: `${ACCENT}22`, color: ACCENT }}
    >
      <Flame size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function DurationBadge({ sec }: { sec: number | undefined }) {
  const d = formatDuration(sec);
  if (!d) return null;
  return (
    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-px font-mono text-[10px] font-bold text-white/90">
      {d}
    </span>
  );
}

function ChannelLine({ ep }: { ep: RankedEpisode }) {
  return (
    <span className="mt-1 flex items-center gap-1.5 font-sans text-xs text-white/45 truncate">
      {ep.channelThumb && (
        // eslint-disable-next-line @next/next/no-img-element -- external YouTube avatars; widget-img opts out of the article image hide
        <img src={ep.channelThumb} alt="" loading="lazy" className="widget-img h-4 w-4 rounded-full object-cover shrink-0" />
      )}
      <span className="truncate">
        {ep.channel}
        {ep.tag && <span className="text-white/35"> · {ep.tag}</span>}
      </span>
    </span>
  );
}

function ThumbImage({ ep, className }: { ep: RankedEpisode; className: string }) {
  if (!ep.thumbnail) return <div className={`${className} bg-white/5`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnails; widget-img opts out of the article image hide
    <img src={ep.thumbnail} alt="" loading="lazy" className={`widget-img object-cover bg-white/5 ${className}`} />
  );
}

function NewPill({ publishedAt }: { publishedAt: string }) {
  const h = ageHours(publishedAt);
  if (h === null || h >= 24) return null;
  return (
    <span
      className="ml-2 inline-block rounded px-1.5 py-px align-middle font-sans text-[10px] font-bold shrink-0"
      style={{ background: ACCENT, color: '#0a0a0a' }}
    >
      NEW
    </span>
  );
}

function cardAge(publishedAt: string) {
  const age = timeAgo(publishedAt);
  return age ? ` · ${age.replace(/ ago$/, '')}` : '';
}

function TopCards({ episodes }: { episodes: RankedEpisode[] }) {
  if (episodes.length === 0) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 mb-2">
      {episodes.map((ep, i) => (
        <a
          key={ep.videoId}
          href={ep.url}
          target="_blank"
          rel="noreferrer"
          className={`group flex min-w-[72%] snap-start flex-col sm:min-w-0 overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.03] transition-colors no-underline hover:bg-white/[0.06] ${FOCUS}`}
        >
          <span className="relative block aspect-video">
            <ThumbImage ep={ep} className="h-full w-full" />
            <span
              className="absolute bottom-2 left-2 rounded-md px-1.5 py-0.5 font-mono text-sm font-bold tabular-nums"
              style={{ background: 'rgba(0,0,0,0.75)', color: ACCENT }}
            >
              #{i + 1}
            </span>
            <DurationBadge sec={ep.durationSec} />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/70">
                <Play size={18} className="ml-0.5 text-white" fill="currentColor" />
              </span>
            </span>
          </span>
          <span className="flex flex-1 flex-col p-3">
            <span className="block font-sans text-sm font-semibold leading-snug text-white/90 line-clamp-2 group-hover:text-white">
              {ep.title}
            </span>
            <ChannelLine ep={ep} />
            <span className="mt-auto flex items-center justify-between gap-2 pt-2">
              <span
                className="min-w-0 truncate font-mono text-[11px] tabular-nums text-white/45"
                style={{ whiteSpace: 'nowrap' }}
              >
                {formatViews(ep.views)} views{cardAge(ep.publishedAt)}
              </span>
              <VelocityPill vph={ep.viewsPerHour} />
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

function EpisodeRows({
  episodes,
  topValue,
  max,
}: {
  episodes: RankedEpisode[];
  topValue: (ep: RankedEpisode) => number;
  max: number;
}) {
  return (
    <ol className="divide-y divide-white/5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {episodes.map((ep, i) => {
        const rank = i + 4;
        const pct = Math.max(2, Math.round((topValue(ep) / max) * 100));
        return (
          <li key={ep.videoId} style={{ marginBottom: 0 }}>
            <a
              href={ep.url}
              target="_blank"
              rel="noreferrer"
              className={`group flex gap-3 rounded-lg py-3 transition-colors no-underline hover:bg-white/[0.03] ${FOCUS}`}
            >
              <span
                className="w-8 shrink-0 pt-0.5 font-mono text-[28px] font-bold leading-none tabular-nums"
                style={{ color: rank <= 3 ? ACCENT : 'rgba(255,255,255,0.25)' }}
              >
                {rank}
              </span>
              {/* Inline width: rows size right even if utilities CSS is stale; min() ramps 120px → 200px */}
              <span className="relative block shrink-0 self-start" style={{ width: 'min(200px, 32vw)' }}>
                <span className="block aspect-video overflow-hidden rounded-[10px] border border-white/25">
                  <ThumbImage ep={ep} className="h-full w-full" />
                </span>
                <DurationBadge sec={ep.durationSec} />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70">
                    <Play size={15} className="ml-0.5 text-white" fill="currentColor" />
                  </span>
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0 font-sans text-sm font-semibold leading-snug text-white/85 line-clamp-2 group-hover:text-white">
                    {ep.title}
                    <NewPill publishedAt={ep.publishedAt} />
                  </span>
                  <VelocityPill vph={ep.viewsPerHour} />
                </span>
                <ChannelLine ep={ep} />
                <span className="mt-1 block font-mono text-[11px] tabular-nums text-white/45">
                  {formatViews(ep.views)} views · {timeAgo(ep.publishedAt)}
                </span>
                <span className="mt-2 block h-[3px] overflow-hidden rounded bg-white/10">
                  <span className="block h-full rounded" style={{ width: `${pct}%`, background: `${ACCENT}b3` }} />
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export default function PodcastTrending() {
  const [tab, setTab] = useState<Tab>('trending');
  const [genre, setGenre] = useState<string>('All');
  const [data, setData] = useState<{ trending: RankedEpisode[]; mostWatched: RankedEpisode[]; fetchedAt: string | null } | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    fetch('/api/podcasts/trending')
      .then((r) => r.json())
      .then((j) => {
        if (live) setData({ trending: j.trending ?? [], mostWatched: j.mostWatched ?? [], fetchedAt: j.fetchedAt ?? null });
      })
      .catch(() => {
        if (live) setData({ trending: [], mostWatched: [], fetchedAt: null });
      })
      .finally(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const list = useMemo(() => {
    const base = !data ? [] : tab === 'trending' ? data.trending : data.mostWatched;
    return genre === 'All' ? base : base.filter((ep) => ep.genre === genre);
  }, [data, tab, genre]);

  const genres = useMemo(() => {
    const base = !data ? [] : tab === 'trending' ? data.trending : data.mostWatched;
    const present = new Set(base.map((ep) => ep.genre));
    return PODCAST_GENRES.filter((g) => present.has(g));
  }, [data, tab]);

  const topMetric = tab === 'trending' ? (ep: RankedEpisode) => ep.viewsPerHour ?? 0 : (ep: RankedEpisode) => ep.views;
  const updated = data?.fetchedAt ? timeAgo(data.fetchedAt) : null;

  return (
    <>
      {/* Tucked just under the fixed header (57px mobile, 61px desktop); inline so it holds even if utilities CSS is stale */}
      <div
        className="sticky z-10 mb-3 rounded-lg border border-white/10 px-3 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
        style={{ background: '#101114', top: 56 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {(
              [
                { id: 'trending', label: 'Trending now' },
                { id: 'month', label: 'Most watched' },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setGenre('All');
                }}
                className={`rounded-full px-3 py-1.5 font-sans text-xs font-bold transition-colors ${FOCUS}`}
                style={
                  tab === t.id
                    ? { background: ACCENT, color: '#0a0a0a' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          {updated && <p className="shrink-0 font-mono text-[11px] tabular-nums text-white/40">Updated {updated}</p>}
        </div>
        {genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['All', ...genres].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`rounded-full border px-2.5 py-1 font-sans text-[11px] font-semibold transition-colors ${FOCUS}`}
                style={
                  genre === g
                    ? { background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'transparent' }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.5)',
                        borderColor: 'rgba(255,255,255,0.15)',
                      }
                }
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {!loaded ? (
        <div className="space-y-3 animate-pulse" aria-label="Loading trending podcasts">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="aspect-video rounded-[10px] bg-white/5" />
            ))}
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <div className="aspect-video rounded-[10px] bg-white/5 shrink-0" style={{ width: 'min(200px, 32vw)' }} />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 rounded bg-white/5 w-5/6" />
                <div className="h-3 rounded bg-white/5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !data || (data.trending.length === 0 && data.mostWatched.length === 0) ? (
        <p className="text-white/50 text-sm font-sans">Trending episodes are unavailable right now. Try again soon.</p>
      ) : list.length === 0 ? (
        <p className="text-white/50 text-sm font-sans">Nothing in this genre right now.</p>
      ) : (
        <>
          <p className="mb-3 font-sans text-xs text-white/40">
            {tab === 'trending' ? 'Ranked by views per hour · last 7 days' : 'Ranked by total views · last 30 days'}
          </p>
          <TopCards episodes={list.slice(0, 3)} />
          <EpisodeRows
            episodes={list.slice(3)}
            topValue={topMetric}
            max={Math.max(1, ...list.map(topMetric))}
          />
        </>
      )}
    </>
  );
}
