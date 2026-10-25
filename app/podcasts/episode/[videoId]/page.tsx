import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPool } from '@/lib/podcast-pool';
import { formatDuration, formatViews, timeAgo } from '@/lib/podcasts';

export const revalidate = 3600;

interface FullEpisode {
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

function fmtT(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

async function getEpisode(videoId: string): Promise<FullEpisode | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.amoljadhav.ai';
  const res = await fetch(`${base}/api/podcasts/episodes?videoId=${videoId}`, {
    next: { revalidate: 3600 },
  }).catch(() => null);
  if (!res?.ok) return null;
  const j = await res.json().catch(() => null);
  return (j?.episode as FullEpisode) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ videoId: string }>;
}): Promise<Metadata> {
  const { videoId } = await params;
  const ep = await getEpisode(videoId);
  if (!ep) return { title: 'Episode summary' };
  return {
    title: `${ep.title} — summary`,
    description: ep.hook.slice(0, 160),
    openGraph: {
      title: `${ep.title} — summary`,
      description: ep.hook.slice(0, 200),
      images: [`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`],
    },
  };
}

export default async function EpisodeSummaryPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(videoId)) notFound();
  const ep = await getEpisode(videoId);
  if (!ep) notFound();

  const pool = await getPool().catch(() => []);
  const meta = pool.find((e) => e.videoId === videoId);
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <p className="font-mono text-xs text-white/40">
        <Link href="/blog/trending-podcasts" className="text-white/60 hover:text-white">
          Trending podcasts
        </Link>{' '}
        / {ep.show}
      </p>
      <h1 className="mt-3 font-sans text-2xl font-bold leading-tight text-white">{ep.title}</h1>
      <p className="mt-2 font-mono text-xs tabular-nums text-white/45">
        {ep.show}
        {meta?.durationSec ? ` · ${formatDuration(meta.durationSec)}` : ''}
        {typeof meta?.views === 'number' ? ` · ${formatViews(meta.views)} views` : ''}
        {meta?.publishedAt ? ` · ${timeAgo(meta.publishedAt)}` : ''}
      </p>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-sans text-xl leading-snug text-white/85">{ep.hook}</p>
      </section>

      {((ep.story_sections ?? []).length > 0
        ? ep.story_sections
        : [{ t_seconds: 0, heading: '', paragraphs: ep.story.split(/\n\n+/) }]
      ).map((s) => (
        <section key={s.t_seconds} className="mt-6">
          {s.heading && (
            <h2 className="font-sans text-base font-bold text-white">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}&t=${s.t_seconds}`}
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                <span className="mr-2 font-mono text-sm tabular-nums text-[#f59e0b]">
                  ▶ {fmtT(s.t_seconds)}
                </span>
                {s.heading}
              </a>
            </h2>
          )}
          {s.paragraphs.map((para, i) => (
            <p
              key={i}
              className="mt-2 font-sans text-white/85"
              style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '68ch' }}
            >
              {para}
            </p>
          ))}
        </section>
      ))}

      {ep.key_ideas.length > 0 && (
        <section className="mt-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/35">
            Key ideas
          </h2>
          <ul className="mt-2 space-y-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {ep.key_ideas.map((k, i) => (
              <li key={i} className="font-sans text-[15px] leading-relaxed">
                <span className="font-semibold text-white/90">{k.idea}</span>{' '}
                <span className="text-white/50">{k.why_it_matters}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ep.concepts.length > 0 && (
        <section className="mt-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/35">
            Concepts
          </h2>
          <ul className="mt-2 space-y-1.5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {ep.concepts.map((c, i) => (
              <li key={i} className="font-sans text-[15px] leading-relaxed text-white/80">
                <span className="font-semibold text-white/90">{c.term}:</span>{' '}
                <span className="text-white/65">{c.explanation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ep.chapters.length > 0 && (
        <section className="mt-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/35">Chapters</h2>
          <ol className="mt-2 divide-y divide-white/5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {ep.chapters.map((c) => (
              <li key={c.t_seconds}>
                <a
                  href={`${ytUrl}&t=${c.t_seconds}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-baseline gap-3 py-2 no-underline"
                >
                  <span className="shrink-0 font-mono text-[13px] tabular-nums text-[#f59e0b]">
                    {fmtT(c.t_seconds)}
                  </span>
                  <span className="font-sans text-[15px] text-white/80 group-hover:text-white group-hover:underline">
                    {c.title}
                    <span className="block text-sm text-white/45">{c.one_liner}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ep.moments.length > 0 && (
        <section className="mt-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/35">
            Notable moments
          </h2>
          <ul className="mt-2 space-y-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {ep.moments.map((m) => (
              <li key={m.t_seconds}>
                <a
                  href={`${ytUrl}&t=${m.t_seconds}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 no-underline hover:bg-white/[0.06]"
                >
                  <p className="font-sans text-[15px] italic leading-relaxed text-white/85">“{m.quote}”</p>
                  <p className="mt-1 font-mono text-xs text-white/45">
                    {m.speaker ? `${m.speaker} · ` : ''}{fmtT(m.t_seconds)}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ep.people.length > 0 && (
        <p className="mt-6 font-sans text-sm text-white/50">
          Who’s in it: {ep.people.map((p) => (p.role ? `${p.name} (${p.role})` : p.name)).join(', ')}
        </p>
      )}

      {ep.worth_it_for && (
        <p className="mt-4 rounded-2xl bg-white/[0.04] p-4 font-sans text-[15px] italic leading-relaxed text-white/75">
          Worth it for… {ep.worth_it_for}
        </p>
      )}

      <footer className="mt-8 border-t border-white/10 pt-4">
        <p className="font-mono text-xs text-white/35">AI summary from the episode transcript · may contain errors</p>
        <a
          href={ytUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block rounded-full bg-[#f59e0b] px-4 py-2 font-sans text-sm font-bold text-black no-underline"
        >
          Watch on YouTube →
        </a>
      </footer>
    </main>
  );
}
