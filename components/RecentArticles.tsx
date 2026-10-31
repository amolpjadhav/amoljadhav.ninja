import { supabase } from '@/lib/supabase';
import { formatShortDate } from '@/lib/utils';
import { splitPinnedPosts } from '@/lib/blog-content';
import { viewCountLabel } from '@/lib/homepage';
import ArticleGrid, { type ArticleCardModel } from '@/components/home/ArticleGrid';

// Pinned utilities: rendered as the Tools row above, and excluded from the
// grid below so they never render twice. Unknown or unpublished slugs are
// silently skipped.
export const PINNED_SLUGS = [
  'look-up-stock-and-company-details',
  'monthly-book-spin',
  'trending-podcasts',
  'ai-model-price-calculator',
];

// Playable game articles: rendered as the Games strip, excluded here for
// the same no-duplicate reason.
export const GAMES_SLUGS = ['classic-games-revisited', 'chess-notation'];

export default async function RecentArticles() {
  // A generous limit rather than a second "top by views" query — this blog
  // has well under 50 posts, so one date-ordered fetch covers the grid and
  // the client-side category filters without a round trip each.
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
  // Newest first (query order). Display strings are built server-side so the
  // client grid stays dumb: short date (year only when not this year),
  // read time, and views only once they pass 500.
  const models: ArticleCardModel[] = rest.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    category: post.category ?? 'Writing',
    views: typeof post.views === 'number' ? post.views : 0,
    meta: [
      formatShortDate(post.created_at),
      post.read_time ? `${post.read_time} min read` : null,
      typeof post.views === 'number' && post.views >= 500 ? viewCountLabel(post.views) : null,
    ]
      .filter(Boolean)
      .join(' · '),
  }));

  return <ArticleGrid posts={models} />;
}
