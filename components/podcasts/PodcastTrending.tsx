'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText, Flame, Search } from 'lucide-react';
import {
  PODCAST_GENRES,
  ageHours,
  formatDuration,
  formatPerHour,
  formatViews,
  timeAgo,
  type RankedEpisode,
} from '@/lib/podcasts';
import { PEOPLE, PERSON_GROUPS, personById, personByQuery, type Person, type PersonStats } from '@/lib/people';

const ACCENT = '#f59e0b';

type Tab = 'trending' | 'month' | 'people';

const FOCUS =
  'focus:outline-none focus-visible:outline-2 focus-visible:outline-[#f59e0b] focus-visible:outline-offset-2';

function VelocityPill({ vph }: { vph: number | null }) {
  const label = formatPerHour(vph);
  if (!label) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] font-bold tabular-nums shrink-0"
      style={{ background: 'rgba(255,159,10,0.14)', color: '#FF9F0A' }}
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
    <span className="absolute bottom-1.5 right-1.5 rounded-[7px] bg-black/60 px-1.5 py-px text-[11px] font-semibold text-white/90 backdrop-blur-md">
      {d}
    </span>
  );
}

// Shelf + row meta line: "{show} · 🔥 {views/hr}" or "{show} · {views} views · {age}".
function MetaLine({ ep, metric }: { ep: RankedEpisode; metric: 'velocity' | 'views' }) {
  const vph = metric === 'velocity' ? formatPerHour(ep.viewsPerHour) : null;
  return (
    <span className="block truncate text-sm" style={{ color: 'rgba(235,235,245,0.6)' }}>
      {ep.channel}
      {vph ? (
        <>
          {' · '}
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums" style={{ color: '#FF9F0A' }}>
            <Flame size={13} strokeWidth={2.5} aria-hidden />
            {vph}
          </span>
        </>
      ) : (
        <span className="tabular-nums">
          {' · '}
          {formatViews(ep.views)} views{cardAge(ep.publishedAt)}
        </span>
      )}
      {ep.tag && <span style={{ color: 'rgba(235,235,245,0.3)' }}> · {ep.tag}</span>}
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
      className="ml-2 inline-block rounded-md px-1.5 py-px align-middle text-[11px] font-bold shrink-0"
      style={{ background: '#0A84FF', color: '#fff' }}
    >
      NEW
    </span>
  );
}

function cardAge(publishedAt: string) {
  const age = timeAgo(publishedAt);
  return age ? ` · ${age.replace(/ ago$/, '')}` : '';
}

export interface FullEpisodeData {
  video_id: string;
  show: string;
  title: string;
  hook: string;
  story: string;
  story_sections: { t_seconds: number; heading: string; paragraphs: string[] }[];
  key_ideas: { idea: string; why_it_matters: string }[];
  concepts: { term: string; explanation: string }[];
  worth_it_for: string;
  chapters: { t_seconds: number; title: string; one_liner: string }[];
  moments: { t_seconds: number; quote: string; speaker?: string }[];
  people: { name: string; role: string }[];
}

const SPEAKER_COLORS = ['#f59e0b', '#38bdf8', '#f472b6', '#a3e635', '#c084fc', '#fb923c'];

function speakerColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SPEAKER_COLORS[h % SPEAKER_COLORS.length];
}

/** Wrap known speaker names in colored chips so readers track who is talking. */
function RichText({ text, names }: { text: string; names: string[] }) {
  const terms = [...new Set(names.filter((n) => n.length > 2))].sort((a, b) => b.length - a.length);
  if (terms.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        terms.includes(part) ? (
          <span key={i} className="whitespace-nowrap font-semibold text-white">
            <span
              aria-hidden="true"
              className="mr-1 inline-block h-2 w-2 rounded-full align-baseline"
              style={{ background: speakerColor(part) }}
            />
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function SummaryModal({ ep, onClose }: { ep: RankedEpisode; onClose: () => void }) {
  const [data, setData] = useState<FullEpisodeData | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    // Fresh mount per episode (parent keys by videoId), so no reset needed.
    let live = true;
    fetch(`/api/podcasts/episodes?videoId=${ep.videoId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (live) {
          if (j?.episode) setData(j.episode);
          else setFailed(true);
        }
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [ep.videoId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const ytUrl = `https://www.youtube.com/watch?v=${ep.videoId}`;
  const speakerNames = data ? [...new Set([...data.people.map((p) => p.name)])] : [];
  const readMin = data
    ? Math.max(
        1,
        Math.round(
          [...(data.story_sections ?? []).flatMap((s) => s.paragraphs), ...data.key_ideas.map((k) => k.idea)]
            .join(' ')
            .trim()
            .split(/\s+/).length / 200,
        ),
      )
    : null;
  const durMin = typeof ep.durationSec === 'number' ? Math.round(ep.durationSec / 60) : null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Episode summary: ${ep.title}`}
        className="max-h-[85vh] w-full overflow-y-auto rounded-3xl border border-white/10 bg-[#141518] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{ maxWidth: 760 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 border-b border-white/10 px-5 pb-3 pt-4 sm:px-6"
          style={{ background: 'rgba(20,21,24,0.92)', backdropFilter: 'blur(24px)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 font-mono text-[11px] uppercase tracking-widest text-white/35">
              {ep.channel} · full-episode summary
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={ytUrl}
                target="_blank"
                rel="noreferrer"
                className={`rounded-full bg-[#f59e0b] px-3.5 py-1.5 font-sans text-[13px] font-bold text-black no-underline ${FOCUS}`}
              >
                ▶ Watch
              </a>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close summary"
                autoFocus
                className={`rounded-full bg-white/10 px-3 py-1.5 font-sans text-sm text-white/70 hover:bg-white/20 hover:text-white ${FOCUS}`}
              >
                ✕
              </button>
            </div>
          </div>
          <h2 className="mt-1 font-sans text-2xl font-bold leading-tight text-white">{ep.title}</h2>
          <p className="mt-1 font-mono text-xs tabular-nums text-white/40">
            {durMin ? `${durMin} min episode · ` : ''}
            {readMin ? `${readMin} min read · ` : ''}AI summary from transcript
          </p>
        </div>
        <div className="px-5 pb-6 sm:px-6" style={{ maxWidth: '68ch' }}>
        {!data && !failed && (
          <p className="mt-4 animate-pulse font-sans text-sm text-white/50">Loading summary…</p>
        )}
        {failed && (
          <p className="mt-4 font-sans text-sm text-white/60">
            Couldn’t load this summary.{' '}
            <a href={ytUrl} target="_blank" rel="noreferrer" className="underline">
              Watch on YouTube →
            </a>
          </p>
        )}
        {data && (
          <>
            <p
              className="mt-4 font-sans leading-relaxed"
              style={{ fontSize: 20, fontWeight: 400, color: 'rgba(235,235,245,0.8)' }}
            >
              <RichText text={data.hook} names={speakerNames} />
            </p>
            {(data.story_sections ?? []).length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {(data.story_sections ?? []).map((s) => (
                  <a
                    key={s.t_seconds}
                    href={`#sumsec-${s.t_seconds}`}
                    className={`shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-xs tabular-nums text-white/70 no-underline hover:border-white/30 hover:text-white ${FOCUS}`}
                  >
                    {fmtClock(s.t_seconds)} · {s.heading}
                  </a>
                ))}
              </div>
            )}
            {((data.story_sections ?? []).length > 0
              ? data.story_sections
              : [{ t_seconds: 0, heading: '', paragraphs: data.story.split(/\n\n+/) }]
            ).map((s) => (
              <section key={s.t_seconds} id={`sumsec-${s.t_seconds}`} className="mt-6 scroll-mt-32">
                {s.heading && (
                  <h3 className="font-sans text-base font-bold text-white">
                    <a
                      href={`${ytUrl}&t=${s.t_seconds}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`no-underline hover:underline ${FOCUS}`}
                    >
                      <span className="mr-2 font-mono text-sm tabular-nums text-[#f59e0b]">
                        ▶ {fmtClock(s.t_seconds)}
                      </span>
                      {s.heading}
                    </a>
                  </h3>
                )}
                {s.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="mt-2 font-sans text-white/85"
                    style={{ fontSize: 17, lineHeight: 1.6 }}
                  >
                    <RichText text={para} names={speakerNames} />
                  </p>
                ))}
              </section>
            ))}
            {data.key_ideas.length > 0 && (
              <>
                <h3 className="mt-8 font-sans text-xs font-bold uppercase tracking-widest text-white/35">
                  Key ideas
                </h3>
                <ol className="mt-2 space-y-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {data.key_ideas.map((k, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-2xl bg-white/[0.05] p-3.5"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] font-sans text-[13px] font-bold text-black"
                      >
                        {i + 1}
                      </span>
                      <span>
                        <span className="block font-sans text-white/90" style={{ fontSize: 17, fontWeight: 600 }}>
                          <RichText text={k.idea} names={speakerNames} />
                        </span>
                        <span className="mt-0.5 block font-sans text-[15px] text-white/50">
                          {k.why_it_matters}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {data.concepts.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-white/35">
                  Concepts
                </h3>
                <ul className="mt-2 space-y-1.5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {data.concepts.map((c, i) => (
                    <li key={i} className="font-sans text-sm leading-relaxed text-white/80">
                      <span className="font-semibold text-white/90">{c.term}:</span>{' '}
                      <span className="text-white/65">{c.explanation}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {data.chapters.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-white/35">
                  Chapters
                </h3>
                <ol className="mt-1 divide-y divide-white/5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {data.chapters.map((c) => (
                    <li key={c.t_seconds}>
                      <a
                        href={`${ytUrl}&t=${c.t_seconds}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-baseline gap-3 py-1.5 no-underline"
                      >
                        <span className="shrink-0 font-mono text-[13px] tabular-nums text-[#f59e0b]">
                          {fmtClock(c.t_seconds)}
                        </span>
                        <span className="font-sans text-sm text-white/80 group-hover:text-white group-hover:underline">
                          {c.title}
                          <span className="block text-[13px] text-white/45">{c.one_liner}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {data.moments.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-widest text-white/35">
                  Notable moments
                </h3>
                <ul className="mt-2 space-y-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {data.moments.map((m) => (
                    <li key={m.t_seconds}>
                      <a
                        href={`${ytUrl}&t=${m.t_seconds}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 no-underline hover:bg-white/[0.06]"
                      >
                        <p className="font-sans text-sm italic leading-relaxed text-white/85">
                          “{m.quote}”
                        </p>
                        <p className="mt-1 font-mono text-xs text-white/45">
                          {m.speaker ? `${m.speaker} · ` : ''}
                          {fmtClock(m.t_seconds)}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {data.people.length > 0 && (
              <p className="mt-4 font-sans text-[13px] text-white/50">
                Who’s in it:{' '}
                {data.people.map((p) => (p.role ? `${p.name} (${p.role})` : p.name)).join(', ')}
              </p>
            )}
            {data.worth_it_for && (
              <p className="mt-3 rounded-xl bg-white/[0.04] p-3 font-sans text-sm italic leading-relaxed text-white/75">
                Worth it for… {data.worth_it_for}
              </p>
            )}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <p className="font-mono text-[11px] text-white/35">
                AI summary from the episode transcript · may contain errors
              </p>
              <a
                href={ytUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-[#f59e0b] px-4 py-1.5 font-sans text-[13px] font-bold text-black no-underline"
              >
                Watch on YouTube →
              </a>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

// Round icon button opening the full-episode summary. Icon-only everywhere:
// the row and shelf already link to YouTube, so this must not look like nav.
function RowSummaryButton({ ep, onOpen }: { ep: RankedEpisode; onOpen: (ep: RankedEpisode) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // The row itself opens YouTube; the button must not.
        e.preventDefault();
        e.stopPropagation();
        onOpen(ep);
      }}
      aria-label="Read summary"
      className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/55 transition-colors hover:bg-white/[0.12] hover:text-white ${FOCUS}`}
    >
      <FileText size={14} aria-hidden className="shrink-0" />
    </button>
  );
}

// Top-3 shelf: no boxes — rounded thumbnails with soft shadows, the bold
// rank next to the title, meta below. Mobile keeps the snap scroll.
function TopCards({
  episodes,
  fullIds = new Set(),
  onOpenSummary,
  metric,
}: {
  episodes: RankedEpisode[];
  fullIds?: Set<string>;
  onOpenSummary?: (ep: RankedEpisode) => void;
  metric: 'velocity' | 'views';
}) {
  if (episodes.length === 0) return null;
  return (
    <div className="flex gap-6 overflow-x-auto pb-2 snap-x sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
      {episodes.map((ep, i) => (
        <div key={ep.videoId} className="group min-w-[72%] snap-start sm:min-w-0">
          <a href={ep.url} target="_blank" rel="noreferrer" className={`block no-underline ${FOCUS}`}>
            <span className="relative block aspect-video">
              <span className="pod-thumb block h-full w-full overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-[1.03]">
                <ThumbImage ep={ep} className="h-full w-full" />
              </span>
              <DurationBadge sec={ep.durationSec} />
            </span>
            <span className="mt-3 flex items-start gap-2">
              <span className="shrink-0 text-[22px] font-extrabold leading-none text-white">{i + 1}</span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold leading-snug text-white/90 line-clamp-2 group-hover:text-white">
                  {ep.title}
                  <NewPill publishedAt={ep.publishedAt} />
                </span>
                <span className="mt-1 block">
                  <MetaLine ep={ep} metric={metric} />
                </span>
              </span>
              {fullIds.has(ep.videoId) && onOpenSummary && (
                <span className="ml-auto shrink-0 pt-0.5">
                  <RowSummaryButton ep={ep} onOpen={onOpenSummary} />
                </span>
              )}
            </span>
          </a>
        </div>
      ))}
    </div>
  );
}

function EpisodeRows({
  episodes,
  fullIds = new Set(),
  onOpenSummary,
  metric,
}: {
  episodes: RankedEpisode[];
  fullIds?: Set<string>;
  onOpenSummary?: (ep: RankedEpisode) => void;
  metric: 'velocity' | 'views';
}) {
  return (
    <ol
      className="podcast-rows"
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {episodes.map((ep, i) => {
        const rank = i + 4;
        return (
          <li key={ep.videoId} style={{ marginBottom: 0 }}>
            <a
              href={ep.url}
              target="_blank"
              rel="noreferrer"
              className={`group flex items-center gap-3 rounded-xl py-2 transition-colors no-underline hover:bg-white/[0.04] ${FOCUS}`}
            >
              <span
                className="w-7 shrink-0 text-right text-[20px] font-bold leading-none tabular-nums"
                style={{ color: 'rgba(235,235,245,0.3)' }}
              >
                {rank}
              </span>
              <span className="relative block w-[120px] shrink-0 self-center sm:w-40">
                <span className="pod-thumb block aspect-video overflow-hidden rounded-xl">
                  <ThumbImage ep={ep} className="h-full w-full" />
                </span>
                <DurationBadge sec={ep.durationSec} />
              </span>
              {/* Divider starts at the text column, not the row edge. */}
              <span className="flex min-w-0 flex-1 items-center gap-2 self-stretch border-b py-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-semibold leading-snug text-white/85 line-clamp-2 group-hover:text-white">
                    {ep.title}
                    <NewPill publishedAt={ep.publishedAt} />
                  </span>
                  <span className="mt-0.5 block">
                    <span className="block truncate text-sm tabular-nums" style={{ color: 'rgba(235,235,245,0.6)' }}>
                      {ep.channel} · {formatViews(ep.views)} views · {timeAgo(ep.publishedAt)}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <VelocityPill vph={metric === 'velocity' ? ep.viewsPerHour : null} />
                  {metric === 'views' && (
                    <span className="shrink-0 text-[13px] font-bold tabular-nums" style={{ color: '#FF9F0A' }}>
                      {formatViews(ep.views)}
                    </span>
                  )}
                  {fullIds.has(ep.videoId) && onOpenSummary && (
                    <RowSummaryButton ep={ep} onOpen={onOpenSummary} />
                  )}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

type DirPerson = Person & { stats: PersonStats };

const WEEK_MS = 7 * 24 * 3600 * 1000;

function PeopleView({
  query,
  onQuery,
  directory,
  countsReady,
  person,
  data,
  loaded,
  onSelect,
  fullIds,
  onOpenSummary,
}: {
  query: string;
  onQuery: (q: string) => void;
  directory: DirPerson[] | null;
  countsReady: boolean;
  person: Person | null;
  data: { episodes: RankedEpisode[] } | null;
  loaded: boolean;
  onSelect: (id: string) => void;
  fullIds: Set<string>;
  onOpenSummary: (ep: RankedEpisode) => void;
}) {
  const shows = data ? new Set(data.episodes.map((ep) => ep.channelId)).size : 0;
  const q = query.trim();
  const visible = useMemo(() => {
    if (!directory) return [];
    if (q) {
      const hits = new Set(personByQuery(q).map((p) => p.id));
      return directory.filter((p) => hits.has(p.id));
    }
    if (!countsReady) return directory;
    return directory.filter((p) => p.group === 'Classic Talks' || p.stats.appearances >= 3);
  }, [directory, q, countsReady]);
  const [nowMs] = useState(() => Date.now());
  const active = useMemo(() => {
    if (!directory || !countsReady) return [];
    return directory
      .filter((p) => p.stats.latest && nowMs - new Date(p.stats.latest.at).getTime() < WEEK_MS)
      .sort((a, b) => (b.stats.latest?.at ?? '').localeCompare(a.stats.latest?.at ?? ''))
      .slice(0, 6);
  }, [directory, countsReady, nowMs]);
  return (
    <>
      <form
        className="relative mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (visible.length === 1) onSelect(visible[0].id);
        }}
      >
        <label htmlFor="person-search" className="sr-only">
          Find a person
        </label>
        <Search
          size={16}
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
        <input
          id="person-search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Find a person — Naval, Elon, Feynman…"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className={`w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 transition-colors ${FOCUS}`}
        />
      </form>

      {!directory ? (
        <p className="text-white/50 text-sm font-sans animate-pulse">Loading directory…</p>
      ) : (
        <>
          {!q && active.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-white/35">
                Active this week
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {active.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelect(p.id)}
                    className={`rounded-lg border border-white/10 bg-white/[0.03] p-2 text-left transition-colors hover:bg-white/[0.06] ${FOCUS}`}
                  >
                    {/* No avatar: the show's thumbnail next to a guest's name
                        reads as their portrait, which is wrong. */}
                    <span className="block min-w-0">
                      <span className="block truncate font-sans text-sm font-semibold text-white/85">{p.name}</span>
                      <span className="block truncate font-mono text-[11px] text-white/40">
                        new · {p.stats.latest?.show}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {visible.length === 0 ? (
            <p className="text-white/50 text-sm font-sans">
              Nobody tracked by that name yet — clear the search to browse.
            </p>
          ) : (
            <>
              {!q && countsReady && (
                <p className="mb-3 font-mono text-[11px] tabular-nums text-white/40">
                  {visible.length} of {directory.length} · all-time appearances
                </p>
              )}
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {PERSON_GROUPS.map((g) => {
                  const members = visible
                    .filter((p) => p.group === g)
                    .sort(
                      (a, b) =>
                        b.stats.appearances - a.stats.appearances || a.name.localeCompare(b.name),
                    );
                  if (members.length === 0) return null;
                  return (
                    <div key={g}>
                      <p className="mb-1 font-sans text-xs font-bold uppercase tracking-widest text-white/35">
                        {g}
                      </p>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {members.map((p) => {
                          const selected = person?.id === p.id;
                          return (
                            <li key={p.id}>
                              <button
                                type="button"
                                onClick={() => onSelect(p.id)}
                                aria-label={
                                  countsReady ? `${p.name}, ${p.stats.appearances} appearances` : p.name
                                }
                                className={`group flex h-8 w-full items-center justify-between gap-2 text-left ${FOCUS}`}
                              >
                                <span
                                  className={`truncate font-sans text-[15px] transition-colors group-hover:underline ${
                                    selected ? 'underline' : 'text-white/80 group-hover:text-[#f59e0b]'
                                  }`}
                                  style={selected ? { color: ACCENT } : undefined}
                                >
                                  {p.name}
                                </span>
                                {countsReady && (
                                  <span className="shrink-0 font-mono text-xs tabular-nums text-white/35">
                                    {p.stats.appearances}
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {person && (
        <div className="mt-5">
          <h3 className="font-sans text-lg font-bold text-white/90">{person.name}</h3>
          <p className="font-sans text-sm text-white/55">
            {person.blurb}
            {person.ownShow ? ` Hosts ${person.ownShow}.` : ''}
          </p>
          {loaded && data && (
            <p className="mt-1 font-mono text-[11px] tabular-nums text-white/40">
              {data.episodes.length} appearances · {shows} shows
            </p>
          )}

          {person.essentials.length > 0 && (
            <div className="mt-4 mb-4">
              <p className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-white/40">Start here</p>
              <ul className="space-y-1.5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {person.essentials.map((e) => (
                  <li key={e.url}>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-sans text-sm text-white/80 hover:text-white no-underline ${FOCUS}`}
                    >
                      {e.title} <span aria-hidden>↗</span>
                    </a>
                    {e.note && <p className="font-sans text-xs text-white/45">{e.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loaded ? (
            <p className="text-white/50 text-sm font-sans animate-pulse">Loading appearances…</p>
          ) : !data || data.episodes.length === 0 ? (
            <p className="text-white/50 text-sm font-sans">
              No recent appearances across tracked shows. The essentials above are the way in.
            </p>
          ) : (
            <>
              <p className="mb-3 font-sans text-xs text-white/40">Ranked by total views</p>
              <TopCards episodes={data.episodes.slice(0, 3)} fullIds={fullIds} onOpenSummary={onOpenSummary} metric="views" />
              <EpisodeRows
                episodes={data.episodes.slice(3)}
                fullIds={fullIds}
                onOpenSummary={onOpenSummary}
                metric="views"
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

export default function PodcastTrending() {
  const [tab, setTab] = useState<Tab>('trending');
  const [genre, setGenre] = useState<string>('All');
  const [data, setData] = useState<{ trending: RankedEpisode[]; mostWatched: RankedEpisode[]; fetchedAt: string | null } | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [personId, setPersonId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [personData, setPersonData] = useState<{ episodes: RankedEpisode[] } | null>(null);
  const [personLoaded, setPersonLoaded] = useState(false);
  const [directory, setDirectory] = useState<DirPerson[] | null>(null);
  const [countsReady, setCountsReady] = useState(false);
  const [fullIds, setFullIds] = useState<Set<string>>(new Set());
  const [modalEp, setModalEp] = useState<RankedEpisode | null>(null);
  // Frosted glass only once the bar sticks: at rest it is transparent, not a
  // dark rectangle. The sentinel sits right above the bar; the -56px margin
  // matches the sticky top offset so stuck flips exactly when it pins.
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), {
      rootMargin: '-56px 0px 0px 0px',
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

  const selectPerson = (id: string | null) => {
    setPersonId(id);
    setPersonData(null);
    setPersonLoaded(false);
    if (id) {
      setTab('people');
      router.replace(`${pathname}?person=${id}`, { scroll: false });
    } else {
      router.replace(pathname, { scroll: false });
    }
  };

  useEffect(() => {
    // Shared ?person= links open straight into the person view.
    // Deferred so the first render commits before the tab setStates run.
    const id = setTimeout(() => {
      const person = searchParams.get('person') ?? '';
      if (person && personById(person)) {
        setTab('people');
        setPersonId(person);
      }
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!personId) return;
    let live = true;
    fetch(`/api/podcasts/person?id=${encodeURIComponent(personId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (live) setPersonData({ episodes: j.episodes ?? [] });
      })
      .catch(() => {
        if (live) setPersonData(null);
      })
      .finally(() => {
        if (live) setPersonLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [personId]);

  useEffect(() => {
    // Directory stats load lazily on first visit to People; the static
    // PEOPLE list stands in when counts are unavailable.
    if (tab !== 'people' || directory) return;
    const fallback = () =>
      PEOPLE.map((p) => ({ ...p, stats: { appearances: 0, shows: 0, latest: null } }));
    let live = true;
    fetch('/api/podcasts/people')
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        setDirectory(Array.isArray(j.people) && j.people.length > 0 ? j.people : fallback());
        setCountsReady(!j.unavailable);
      })
      .catch(() => {
        if (!live) return;
        setDirectory(fallback());
        setCountsReady(false);
      });
    return () => {
      live = false;
    };
  }, [tab, directory]);

  const list = useMemo(() => {
    const base = !data ? [] : tab === 'trending' ? data.trending : data.mostWatched;
    return genre === 'All' ? base : base.filter((ep) => ep.genre === genre);
  }, [data, tab, genre]);

  useEffect(() => {
    // Which episodes have a full summary (the only ones that get a link).
    if (!data) return;
    let live = true;
    fetch('/api/podcasts/episodes')
      .then((r) => r.json())
      .then((j) => {
        if (live && Array.isArray(j.ids)) setFullIds(new Set(j.ids));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [data]);

  const genres = useMemo(() => {
    const base = !data ? [] : tab === 'trending' ? data.trending : data.mostWatched;
    const present = new Set(base.map((ep) => ep.genre));
    return PODCAST_GENRES.filter((g) => present.has(g));
  }, [data, tab]);

  const metric = tab === 'trending' ? 'velocity' : 'views';
  const updated = data?.fetchedAt ? timeAgo(data.fetchedAt) : null;
  const subline =
    tab === 'trending'
      ? 'The fastest-rising episodes on YouTube, ranked by views per hour'
      : tab === 'month'
        ? 'The most-watched episodes of the last month, ranked by total views'
        : 'The people behind the conversations — search the directory';

  return (
    <div className="podcasts-ui">
      <div className="mb-4 mt-1">
        <p className="text-[13px] font-semibold uppercase" style={{ color: '#0AEE3C', letterSpacing: '0.06em' }}>
          Curiosity
        </p>
        <h2 className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.025em] text-white sm:text-[40px]">
          Trending Podcasts
        </h2>
        <p className="mt-2 text-base" style={{ color: 'rgba(235,235,245,0.6)' }}>
          {subline}
          {updated ? ` · updated ${updated}` : ''}
        </p>
      </div>
      {/* Sticky nav tucked under the fixed site header (inline top holds even if
          utilities CSS is stale). Transparent at rest; the frosted glass and
          hairline arrive only once it sticks while scrolling. */}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
      <div
        className="sticky z-10 mb-5"
        style={
          stuck
            ? {
                top: 56,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }
            : { top: 56, background: 'transparent' }
        }
      >
        <div className="flex items-center gap-3 py-2">
          <div
            className="flex gap-0.5 rounded-[10px] p-[3px]"
            style={{ background: 'rgba(118,118,128,0.24)' }}
            role="tablist"
            aria-label="Podcast lists"
          >
            {(
              [
                { id: 'trending', label: 'Trending' },
                { id: 'month', label: 'Most watched' },
                { id: 'people', label: 'People' },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setGenre('All');
                  if (t.id !== 'people') selectPerson(null);
                }}
                className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${FOCUS}`}
                style={tab === t.id ? { background: '#636366', color: '#fff' } : { color: 'rgba(255,255,255,0.65)' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {tab !== 'people' && genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2.5">
            {['All', ...genres].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`rounded-full px-3 py-1 text-[13px] font-semibold transition-colors ${FOCUS}`}
                style={
                  genre === g
                    ? { background: '#fff', color: '#000' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }
                }
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'people' ? (
        <PeopleView
          query={query}
          onQuery={setQuery}
          directory={directory}
          countsReady={countsReady}
          person={personId ? (personById(personId) ?? null) : null}
          data={personData}
          loaded={personLoaded}
          onSelect={selectPerson}
          fullIds={fullIds}
          onOpenSummary={setModalEp}
        />
      ) : !loaded ? (
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
          <TopCards episodes={list.slice(0, 3)} fullIds={fullIds} onOpenSummary={setModalEp} metric={metric} />
          <h2 className="mb-2 mt-8 text-[22px] font-bold text-white">
            {tab === 'trending' ? 'More trending' : 'More most-watched'}
          </h2>
          <EpisodeRows
            episodes={list.slice(3)}
            fullIds={fullIds}
            onOpenSummary={setModalEp}
            metric={metric}
          />
        </>
      )}
      {modalEp && (
        <SummaryModal key={modalEp.videoId} ep={modalEp} onClose={() => setModalEp(null)} />
      )}
    </div>
  );
}
