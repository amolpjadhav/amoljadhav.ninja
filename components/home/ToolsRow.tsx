import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { currentMonth } from '@/lib/five-monthly';
import { genreBySlug } from '@/lib/books';
import { coverUrl } from '@/lib/books';
import { poolById } from '@/lib/book-pool';
import { formatPerHour } from '@/lib/podcasts';
import { stripHasMoves } from '@/lib/homepage';
import { fetchEarningsWeek, upcomingAfterClose } from '@/lib/earnings';
import { PINNED_SLUGS } from '@/components/RecentArticles';
import MarketStrip from './MarketStrip';
import Mag7Summary from './Mag7Summary';
import TickerLookup from './TickerLookup';
import { getEpisode, getStrip } from './heroData';

function ToolCard({
  slug,
  title,
  children,
  footer,
}: {
  slug: string;
  title: string;
  children: React.ReactNode;
  footer?: string;
}) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex min-w-0 flex-col bg-black border border-[#0aee3c]/20 rounded-lg p-3 transition-all hover:border-[#0aee3c]/50 hover:shadow-[0_0_16px_rgba(10,238,60,0.25)]"
    >
      <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-base mb-2">{title}</h3>
      {children}
      {footer && (
        <span className="mt-auto block pt-2 font-mono text-xs text-[#0aee3c]/70 group-hover:text-[#0aee3c] transition-colors">
          {footer} <span aria-hidden>→</span>
        </span>
      )}
    </Link>
  );
}

function cardFooter(slug: string): string | undefined {
  if (slug === 'monthly-book-spin') return 'Browse books';
  if (slug === 'trending-podcasts') return 'See all';
  if (slug === 'seattle-transit-next-bus') return 'Plan a trip';
  if (slug === 'ai-model-price-calculator') return 'Estimate cost';
  return undefined;
}

function Fallback({ excerpt }: { excerpt: string | null }) {
  if (!excerpt) return null;
  return <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{excerpt}</p>;
}

const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';

async function TonightLine() {
  // One cached calendar call (shared with the lookup page's hourly slot);
  // hides entirely when the feed is down or nothing is coming.
  let tonight: { label: string; tickers: string[]; total: number } | null = null;
  try {
    tonight = upcomingAfterClose((await fetchEarningsWeek()).events);
  } catch {
    tonight = null;
  }
  if (!tonight) return null;
  return (
    <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/45">
      <span className="text-white/60">{tonight.label}:</span>{' '}
      {tonight.tickers.map((t, i) => (
        <span key={t}>
          {i > 0 && <span aria-hidden> · </span>}
          <Link href={`${LOOKUP_PATH}?ticker=${encodeURIComponent(t)}`} className="text-[#0aee3c]/80 hover:text-[#0aee3c] hover:underline">
            {t}
          </Link>
        </span>
      ))}
      {tonight.total > tonight.tickers.length && <span> +{tonight.total - tonight.tickers.length} more</span>}
    </p>
  );
}

async function StockCard({ slug, title, excerpt }: { slug: string; title: string; excerpt: string | null }) {
  const strip = await getStrip();
  const live = strip !== null && strip.length >= 3 && stripHasMoves(strip);
  // A form can't live inside the card link, so this card is a plain shell
  // with a linked title instead of a whole-card link.
  return (
    <div className="group flex min-w-0 flex-col bg-black border border-[#0aee3c]/20 rounded-lg p-3 transition-all hover:border-[#0aee3c]/50 hover:shadow-[0_0_16px_rgba(10,238,60,0.25)]">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <Link href={`/blog/${slug}`}>
          <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-base">{title}</h3>
        </Link>
        <Link
          href={`/blog/${slug}`}
          className="shrink-0 font-mono text-[11px] text-[#0aee3c]/60 transition-colors hover:text-[#0aee3c]"
        >
          Open <span aria-hidden>→</span>
        </Link>
      </div>
      {live && strip ? <MarketStrip items={strip.slice(0, 3)} /> : <Fallback excerpt={excerpt} />}
      <div className="mt-2">
        <Mag7Summary />
      </div>
      <TonightLine />
      <div className="mt-auto pt-3">
        <TickerLookup />
      </div>
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
      const url = book ? coverUrl(book.coverId, 'M') : null;
      return book && url ? { id: book.id, title: book.title, url } : null;
    })
    .filter((c) => c !== null);

  return (
    <section id="tools" aria-label="Tools" className="relative mb-6 scroll-mt-20">
      <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-2">
        <span className="text-[#0aee3c]">$</span> Tools
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </h2>
      {/* Explicit minmax(0,1fr) columns on every breakpoint: the Mag 7
          tape is max-content wide, and an implicit auto column would size
          to it and blow the row (and the page) out on mobile. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((post) =>
          post.slug === 'look-up-stock-and-company-details' ? (
            <StockCard key={post.slug} slug={post.slug} title={post.title} excerpt={post.excerpt} />
          ) : (
            <ToolCard key={post.slug} slug={post.slug} title={post.title} footer={cardFooter(post.slug)}>
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
                    <div className="mt-3 flex max-w-full overflow-hidden">
                      {covers.slice(0, 4).map((c) => (
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
