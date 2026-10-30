import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { splitPinnedPosts } from '@/lib/blog-content';
import { viewCountLabel } from '@/lib/homepage';

// Pinned utilities: rendered as the Tools row above, and excluded from the
// Latest / Most Read / Recent pools below so they never render twice.
// Unknown or unpublished slugs are silently skipped.
export const PINNED_SLUGS = [
  'look-up-stock-and-company-details',
  'monthly-book-spin',
  'trending-podcasts',
  'ai-model-price-calculator',
];

// Playable game articles: rendered as the Games row, excluded from the
// article pools for the same no-duplicate reason.
export const GAMES_SLUGS = ['classic-games-revisited', 'chess-notation'];

export default async function RecentArticles() {
  // A generous limit rather than a second "top by views" query — this blog
  // has well under 50 posts, so one date-ordered fetch covers both the
  // "most read" ranking and the recent list without a round trip each.
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !posts || posts.length === 0) {
    return (
      <div className="bg-black/50 border border-[#0aee3c]/20 rounded-lg p-6">
        <p className="text-[#0aee3c]/80">No articles yet</p>
      </div>
    );
  }

  const { rest } = splitPinnedPosts(posts, [...PINNED_SLUGS, ...GAMES_SLUGS]);
  // No featured row: the grid covers everything (most-read first, then
  // recent) with no duplicates.
  const pool = rest;

  const mostRead = [...pool].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 3);
  const mostReadSlugs = new Set(mostRead.map((p) => p.slug));
  const recent = pool.filter((p) => !mostReadSlugs.has(p.slug)).slice(0, 6);
  const grid = [...mostRead, ...recent];

  return (
    <div>
      <div className="grid gap-6 min-[768px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1200px]:grid-cols-[repeat(3,minmax(0,1fr))]">
        {grid.map((post, index) => {
          const footer = [formatDate(post.created_at), viewCountLabel(post.views ?? 0), post.read_time ? `${post.read_time} min read` : null]
            .filter(Boolean)
            .join(' · ');
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex h-full min-w-0 flex-col rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] p-6 no-underline transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(120,255,140,0.28)] animate-fadeInUp"
              style={{
                opacity: 0,
                animationFillMode: 'forwards',
                animationDelay: `${(index + 1) * 0.08}s`,
              }}
            >
              <p className="font-mono text-xs text-white/40">{post.category ?? 'Writing'}</p>
              <h3 className="mt-2 font-sans text-xl font-semibold leading-snug text-white/90 transition-colors group-hover:text-white line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 font-sans text-sm leading-relaxed text-white/55 line-clamp-2 max-w-[60ch]">
                  {post.excerpt}
                </p>
              )}
              {footer && (
                <p className="mt-auto pt-3 font-sans text-sm text-white/45 tabular-nums">{footer}</p>
              )}
            </Link>
          );
        })}
      </div>

      <Link
        href="/blog"
        className="inline-block mt-4 font-sans text-sm font-semibold text-[#0aee3c] hover:underline"
      >
        View all articles &rarr;
      </Link>
    </div>
  );
}
