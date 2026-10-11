import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { currentMonth } from '@/lib/five-monthly';
import { genreBySlug } from '@/lib/books';
import { coverUrl } from '@/lib/books';
import { poolById } from '@/lib/book-pool';
import { formatPerHour, trendingPodcasts } from '@/lib/podcasts';
import { formatPct, getMarketStrip } from '@/lib/stocks';
import { memoizeTtl, stripHasMoves, toStripItems, toTopEpisode } from '@/lib/homepage';
import { PINNED_SLUGS } from '@/components/RecentArticles';
import TickerLookup from './TickerLookup';

// Live snippets for the pinned-tool cards. The page revalidates every 60s;
// the caches below keep the YouTube fan-out hourly and the index strip to
// every 5 minutes regardless of traffic.
const getStrip = memoizeTtl(5 * 60 * 1000, async () => {
  const { strip } = await getMarketStrip({ timeoutMs: 6000 });
  return toStripItems(strip);
});

const getEpisode = memoizeTtl(60 * 60 * 1000, async () => {
  const { trending } = await trendingPodcasts(process.env.YOUTUBE_API_KEY);
  return toTopEpisode(trending[0]);
});

function ToolCard({ slug, title, children }: { slug: string; title: string; children: React.ReactNode }) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block bg-black border border-[#0aee3c]/20 rounded-lg p-4 transition-all hover:border-[#0aee3c]/50 hover:shadow-[0_0_16px_rgba(10,238,60,0.25)]"
    >
      <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-base mb-2">{title}</h3>
      {children}
    </Link>
  );
}

function Fallback({ excerpt }: { excerpt: string | null }) {
  if (!excerpt) return null;
  return <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{excerpt}</p>;
}

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (points.length < 2) return null;
  const w = 100;
  const h = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points
    .map(
      (p, i) =>
        `${((i / (points.length - 1)) * w).toFixed(1)},${(h - ((p - min) / range) * (h - 4) - 2).toFixed(1)}`,
    )
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={coords}
        fill="none"
        stroke={positive ? '#0aee3c' : '#f87171'}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

async function StockCard({ slug, title, excerpt }: { slug: string; title: string; excerpt: string | null }) {
  const strip = await getStrip();
  const live = strip !== null && strip.length >= 3 && stripHasMoves(strip);
  const featured = live && strip ? (strip.find((s) => s.label === 'S&P 500') ?? strip[0]) : null;
  // A form can't live inside the card link, so this card is a plain shell
  // with a linked title instead of a whole-card link.
  return (
    <div className="group block bg-black border border-[#0aee3c]/20 rounded-lg p-4 transition-all hover:border-[#0aee3c]/50 hover:shadow-[0_0_16px_rgba(10,238,60,0.25)]">
      <Link href={`/blog/${slug}`}>
        <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-base mb-2">
          {title}
        </h3>
      </Link>
      {live && strip ? (
        <>
          <div className="font-mono text-xs">
            {strip.slice(0, 4).map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-2 py-0.5">
                <span className="text-white/50">{s.label}</span>
                <span className={s.changePct !== null && s.changePct < 0 ? 'text-red-400' : 'text-[#0aee3c]'}>
                  {formatPct(s.changePct)}
                </span>
              </div>
            ))}
          </div>
          {featured && featured.spark.length >= 2 && (
            <div className="mt-2">
              <p className="font-mono text-[11px] text-white/40 mb-1">{featured.label}</p>
              <Sparkline points={featured.spark} positive={(featured.changePct ?? 0) >= 0} />
            </div>
          )}
        </>
      ) : (
        <Fallback excerpt={excerpt} />
      )}
      <TickerLookup />
    </div>
  );
}

export default async function ToolsRow() {
  const [{ data: posts }, episode] = await Promise.all([
    supabase.from('blog_posts').select('title, slug, excerpt').in('slug', PINNED_SLUGS).eq('published', true),
    getEpisode(),
  ]);
  const bySlug = new Map((posts ?? []).map((p) => [p.slug, p]));
  const cards = PINNED_SLUGS.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
  if (cards.length === 0) return null;

  const month = currentMonth();
  const monthGenres = month.genres.map((g) => genreBySlug(g)?.label ?? g);
  const covers = month.picks
    .map((p) => {
      const book = poolById(p.bookId);
      const url = book ? coverUrl(book.coverId, 'S') : null;
      return book && url ? { id: book.id, title: book.title, url } : null;
    })
    .filter((c) => c !== null);

  return (
    <section id="tools" aria-label="Tools" className="relative mb-6 scroll-mt-20">
      <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-2">
        <span className="text-[#0aee3c]">$</span> Tools
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((post) =>
          post.slug === 'look-up-stock-and-company-details' ? (
            <StockCard key={post.slug} slug={post.slug} title={post.title} excerpt={post.excerpt} />
          ) : (
            <ToolCard key={post.slug} slug={post.slug} title={post.title}>
              {post.slug === 'monthly-book-spin' && (
                <div>
                  <p className="text-white/40 text-xs mb-2">{month.label} picks:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {monthGenres.map((g) => (
                      <span
                        key={g}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-[#0aee3c]/25 text-[#0aee3c]/80"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  {covers.length > 0 && (
                    <div className="mt-3 flex">
                      {covers.map((c) => (
                        // eslint-disable-next-line @next/next/no-img-element -- external Open Library covers, sized by CSS
                        <img
                          key={c.id}
                          src={c.url}
                          alt={c.title}
                          title={c.title}
                          loading="lazy"
                          className="w-12 aspect-[2/3] object-cover rounded-[4px] border border-white/15 -ml-3 first:ml-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {post.slug === 'trending-podcasts' &&
                (episode ? (
                  <div>
                    {episode.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail, sized by CSS
                      <img
                        src={episode.thumbnail}
                        alt=""
                        loading="lazy"
                        className="w-full aspect-video object-cover rounded-md border border-white/10 mb-2"
                      />
                    )}
                    <p className="text-white/85 text-sm font-medium leading-snug line-clamp-1">{episode.title}</p>
                    <p className="text-white/40 text-xs mt-0.5 font-mono">
                      {episode.channel}
                      {formatPerHour(episode.viewsPerHour) ? ` · ${formatPerHour(episode.viewsPerHour)}` : ''}
                    </p>
                  </div>
                ) : (
                  <Fallback excerpt={post.excerpt} />
                ))}
              {post.slug !== 'look-up-stock-and-company-details' &&
                post.slug !== 'monthly-book-spin' &&
                post.slug !== 'trending-podcasts' && <Fallback excerpt={post.excerpt} />}
            </ToolCard>
          ),
        )}
      </div>
    </section>
  );
}
