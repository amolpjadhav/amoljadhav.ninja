import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import {
  displayCompanyName,
  getStockCardData,
  normalizeTicker,
  quoteDayParam,
} from '@/lib/stocks';
import ShareButtons from '@/components/blog/ShareButtons';
import LikeButton from '@/components/blog/LikeButton';
import ViewCounter from '@/components/blog/ViewCounter';
import QuizModal from '@/components/blog/QuizModal';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import SubscribeForm from '@/components/blog/SubscribeForm';

export const revalidate = 60;

async function getBlogPost(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// www directly: the apex 308-redirects here, and strict crawlers (and their
// image fetches) can't be trusted to follow it for og:image.
const SITE_URL = 'https://www.amoljadhav.ai';
const STOCK_LOOKUP_SLUG = 'look-up-stock-and-company-details';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ticker?: string; v?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  const fallback: Metadata = {
    title: `${post.title} | Amol Jadhav`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };

  // Shared lookups (?ticker=NVDA) get a company-profile preview: a timeless
  // title (never a price — social caches hold cards for days) and the card
  // image, which carries the quote date (?d=...) so each session gets a
  // fresh card instead of last week's price. The share button mints a
  // per-share token (?v=...) that passes through to the image, busting X's
  // per-URL card cache on both layers at once; the canonical stays clean.
  // Tags come from the lean card loader (quote only): full getStockData
  // takes 20s+ cold and crawlers give up before reading og:image.
  if (slug !== STOCK_LOOKUP_SLUG) return fallback;
  const query = await searchParams;
  const ticker = normalizeTicker(query?.ticker ?? '');
  if (!ticker) return fallback;
  const rawV = query?.v ?? '';
  const v = /^[0-9a-z]{1,16}$/.test(rawV) ? rawV : null;

  try {
    const data = await getStockCardData(ticker);
    if (!data) return fallback;
    const name = displayCompanyName(data.companyName);
    const title = `${name} (${ticker}): Business, Financials & Filings`;
    const description = `${name} (${ticker}) — what the company does, financials, and SEC filings on one page.`;
    const day = data.quote ? quoteDayParam(data.quote.lastTrade) : null;
    const images = [
      {
        url: `${SITE_URL}/api/og/stock?ticker=${ticker}${day ? `&d=${day}` : ''}${v ? `&v=${v}` : ''}`,
        width: 1200,
        height: 630,
        alt: `${name} (${ticker}) company profile`,
      },
    ];
    return {
      title: `${title} | Amol Jadhav`,
      description,
      alternates: { canonical: `${SITE_URL}/blog/${slug}?ticker=${ticker}` },
      openGraph: { title, description, type: 'article', images },
      twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
    };
  } catch {
    return fallback;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { html: contentHtml, headings } = colorizeArticleSections(post.content);

  return (
    <>
      <Header />

      {/* Edge-to-edge on a phone. The page gutter and the card's own padding
          used to stack up to 40px a side, which is a fifth of a 390px screen
          spent on nothing. Below sm the gutter, the side borders and the
          rounded corners all go, leaving a single 16px reading margin. */}
      <main className="min-h-screen pt-24 pb-16 px-0 sm:px-4">
        <article className="container mx-auto max-w-3xl bg-[#1c1d20] border-y sm:border border-white/10 sm:rounded-lg p-4 sm:p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            {post.category && (
              <span
                className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
                style={{
                  color: categoryColor(post.category),
                  background: `${categoryColor(post.category)}22`,
                }}
              >
                {post.category}
              </span>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs text-white/50 border border-white/15 px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white/95 leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex gap-3 items-center text-white/45 text-sm">
              <span>{formatDate(post.created_at)}</span>
              {post.read_time && (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.read_time} min read</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mt-5">
              <ShareButtons title={post.title} slug={post.slug} />
              <LikeButton slug={post.slug} initialLikes={post.likes} />
              <ViewCounter slug={post.slug} initialViews={post.views ?? 0} />
            </div>
          </div>

          {post.quiz && post.quiz.length > 0 && (
            <QuizModal questions={post.quiz} accent={categoryColor(post.category)} title={post.title} slug={post.slug} />
          )}

          <TableOfContents headings={headings} accent={categoryColor(post.category)} />

          <ArticleContent html={contentHtml} category={post.category} />

          <div className="mt-10">
            <SubscribeForm accent={categoryColor(post.category)} />
          </div>
        </article>
      </main>
    </>
  );
}
