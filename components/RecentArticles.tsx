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
  'seattle-transit-next-bus',
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
  const [latest, ...pool] = rest;

  const mostRead = [...pool].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 3);
  const mostReadSlugs = new Set(mostRead.map((p) => p.slug));
  const recent = pool.filter((p) => !mostReadSlugs.has(p.slug)).slice(0, 6);

  return (
    <div>
      <Link
        href={`/blog/${latest.slug}`}
        className="group block bg-black border border-white/10 rounded-lg p-4 mb-1 transition-all hover:border-white/20 animate-fadeInUp"
        style={{ opacity: 0, animationFillMode: 'forwards' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
            style={{ color: '#f59e0b', background: '#f59e0b22' }}
          >
            Latest
          </span>
          {latest.category && (
            <span className="text-[10px] uppercase tracking-wide text-white/40">{latest.category}</span>
          )}
        </div>

        <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-base mb-1.5">
          {latest.title}
        </h3>

        {latest.excerpt && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-2">{latest.excerpt}</p>
        )}

        <div className="flex items-center gap-2 text-[#0aee3c]/40 text-xs">
          <span>{formatDate(latest.created_at)}</span>
          {latest.read_time && (
            <>
              <span aria-hidden>·</span>
              <span>{latest.read_time} min read</span>
            </>
          )}
        </div>
      </Link>

      {mostRead.length > 0 && (
        <>
          <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mt-5 mb-2">
            <span className="text-[#0aee3c]">$</span> Most read
            <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {mostRead.map((post, index) => {
              const footer = [viewCountLabel(post.views ?? 0), post.read_time ? `${post.read_time} min read` : null]
                .filter(Boolean)
                .join(' · ');
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-black border border-white/10 rounded-lg p-4 transition-all hover:border-white/25 animate-fadeInUp"
                  style={{
                    opacity: 0,
                    animationFillMode: 'forwards',
                    animationDelay: `${(index + 1) * 0.08}s`,
                  }}
                >
                  <span className="font-mono text-2xl font-bold text-[#0aee3c]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-sm mt-1 mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="text-white/35 text-xs line-clamp-2 mb-2">{post.excerpt}</p>}
                  {footer && <p className="text-[#0aee3c]/40 text-xs font-mono">{footer}</p>}
                </Link>
              );
            })}
          </div>
        </>
      )}

      {recent.length > 0 && (
        <>
          <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mt-5 mb-2">
            <span className="text-[#0aee3c]">$</span> Recent
            <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
          </h2>
          {recent.map((post, index) => {
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block py-1.5 px-1.5 -mx-1.5 rounded border-b border-b-[#0aee3c]/10 last:border-b-0 hover:bg-[#0aee3c]/5 transition-colors animate-fadeInUp"
                style={{
                  animationDelay: `${(index + 1) * 0.08}s`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="flex items-baseline justify-between gap-3 text-sm pl-1.5">
                  <span className="text-white/85 group-hover:text-white transition-colors">
                    <span className="inline-block w-6 text-[#0aee3c]/50 group-hover:text-[#0aee3c] mr-2 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {post.title}
                  </span>
                  <span className="text-[#0aee3c]/40 text-xs whitespace-nowrap shrink-0">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                {post.excerpt && (
                  <p className="text-white/35 text-xs mt-0.5 ml-9 line-clamp-1">{post.excerpt}</p>
                )}
              </Link>
            );
          })}
        </>
      )}

      <Link
        href="/blog"
        className="inline-block mt-2 text-xs text-[#0aee3c]/60 hover:text-[#0aee3c] transition-colors"
      >
        View all articles &rarr;
      </Link>
    </div>
  );
}
