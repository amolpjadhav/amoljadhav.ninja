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

// Presentation-only display copy: short titles (≤3 words) + one-line
// descriptions. Links and data sources are untouched.
const CARD_META: Record<string, { title: string; description?: string }> = {
  'look-up-stock-and-company-details': { title: 'Stock Lookup' },
  'monthly-book-spin': { title: 'Book Spin' },
  'trending-podcasts': { title: 'Trending Podcasts' },
  'ai-model-price-calculator': {
    title: 'AI Price Calculator',
    description: 'What that prompt actually costs.',
  },
};

const CARD =
  'group flex h-full min-w-0 flex-col rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(120,255,140,0.28)]';

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-sans text-lg font-semibold text-white/90 transition-colors group-hover:text-white line-clamp-2">
      {children}
    </h3>
  );
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 font-sans text-sm leading-relaxed text-white/55 line-clamp-1 max-w-[60ch]">{children}</p>;
}

function CardCta() {
  return (
    <span className="mt-auto block pt-4 font-sans text-sm font-semibold text-[#0aee3c]">
      Open <span aria-hidden>→</span>
    </span>
  );
}

// Fixed-height live preview zone shared by every card.
function Preview({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 h-40 overflow-hidden">{children}</div>;
}

function ToolCard({
  slug,
  title,
  description,
  children,
}: {
  slug: string;
  title: string;
  description: string | null;
  children: React.ReactNode;
}) {
  return (
    <Link href={`/blog/${slug}`} className={CARD}>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      <Preview>{children}</Preview>
      <CardCta />
    </Link>
  );
}

function Fallback({ excerpt }: { excerpt: string | null }) {
  if (!excerpt) return null;
  return <p className="font-sans text-sm leading-relaxed text-white/55 line-clamp-4 max-w-[60ch]">{excerpt}</p>;
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
    <p className="mt-2 font-sans text-sm leading-relaxed text-white/45">
      <span className="text-white/60">{tonight.label}:</span>{' '}
      {tonight.tickers.map((t, i) => (
        <span key={t}>
          {i > 0 && <span aria-hidden> · </span>}
          <Link href={`${LOOKUP_PATH}?ticker=${encodeURIComponent(t)}`} className="text-[#0aee3c] hover:underline">
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
  // with a linked title and a bottom-left CTA instead of a whole-card link.
  return (
    <div className={CARD}>
      <Link href={`/blog/${slug}`} className="no-underline">
        <CardTitle>{title}</CardTitle>
      </Link>
      {excerpt && <CardDescription>{excerpt}</CardDescription>}
      <Preview>
        {live && strip ? <MarketStrip items={strip.slice(0, 3)} /> : <Fallback excerpt={excerpt} />}
        <div className="mt-2">
          <Mag7Summary />
        </div>
        <TonightLine />
        <div className="mt-2">
          <TickerLookup />
        </div>
      </Preview>
      <Link href={`/blog/${slug}`} className="mt-auto block pt-4 font-sans text-sm font-semibold text-[#0aee3c] no-underline">
        Open <span aria-hidden>→</span>
      </Link>
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
    <section id="tools" aria-label="Tools" className="relative mt-12 scroll-mt-20">
      <h2 className="flex items-center gap-2 font-mono text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-4">
        <span className="text-[#0aee3c]">$</span> Tools
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </h2>
      {/* Explicit minmax(0,1fr) columns on every breakpoint: the Mag 7
          tape is max-content wide, and an implicit auto column would size
          to it and blow the row (and the page) out on mobile. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 min-[768px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1200px]:grid-cols-[repeat(4,minmax(0,1fr))]">
        {cards.map((post) => {
          const meta = CARD_META[post.slug];
          const title = meta?.title ?? post.title;
          const description = meta?.description ?? post.excerpt;
          if (post.slug === 'look-up-stock-and-company-details') {
            return <StockCard key={post.slug} slug={post.slug} title={title} excerpt={description} />;
          }
          return (
            <ToolCard key={post.slug} slug={post.slug} title={title} description={description}>
              {post.slug === 'monthly-book-spin' && (
                <div>
                  <p className="font-sans text-sm text-white/55 mb-2">{month.label} picks:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {monthGenres.map((g) => (
                      <span
                        key={g}
                        className="font-sans text-xs px-2 py-0.5 rounded-full border border-[#0aee3c]/25 text-[#0aee3c]/80"
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
                    <p className="font-sans text-sm font-medium text-white/85 leading-snug line-clamp-2">{episode.title}</p>
                    <p className="font-sans text-sm text-white/45 mt-1 tabular-nums">
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
          );
        })}
      </div>
    </section>
  );
}
