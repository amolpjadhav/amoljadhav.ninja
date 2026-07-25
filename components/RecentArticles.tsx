import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { categoryColor } from '@/lib/blog-content';

export default async function RecentArticles() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !posts || posts.length === 0) {
    return (
      <div className="bg-black/50 border border-[#0aee3c]/20 rounded-lg p-6">
        <p className="text-[#0aee3c]/80">No articles yet</p>
      </div>
    );
  }

  // Categories span the whole blog, not just these 10 recent posts, so the
  // chips need their own (cheap, column-only) query rather than deriving
  // from `posts` — otherwise a category with older-only articles would
  // never show up as a filter option here.
  const { data: categoryRows } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('published', true);

  const categories = Array.from(
    new Set((categoryRows || []).map((p) => p.category).filter(Boolean))
  ).sort();

  const [latest, ...rest] = posts;
  const heroAccent = categoryColor(latest.category);

  return (
    <div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            href="/blog"
            className="text-xs px-2.5 py-1 rounded-full border border-[#0aee3c]/20 text-[#0aee3c]/60 hover:text-[#0aee3c] hover:border-[#0aee3c]/40 transition-colors"
          >
            All
          </Link>
          {categories.map((cat) => {
            const color = categoryColor(cat);
            return (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors hover:brightness-125"
                style={{ borderColor: `${color}40`, color, background: `${color}0d` }}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={`/blog/${latest.slug}`}
        className="group block bg-black/40 border border-white/10 border-l-[3px] rounded-lg p-4 mb-4 transition-all hover:border-white/20 animate-fadeInUp"
        style={{ borderLeftColor: heroAccent, opacity: 0, animationFillMode: 'forwards' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
            style={{ color: heroAccent, background: `${heroAccent}22` }}
          >
            Latest
          </span>
          {latest.category && (
            <span className="text-[10px] uppercase tracking-wide text-white/40">{latest.category}</span>
          )}
        </div>

        <h3 className="text-[#0aee3c] group-hover:text-white transition-colors font-semibold text-base mb-1.5">
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

      {rest.map((post, index) => {
        const rowAccent = categoryColor(post.category);
        return (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block py-1.5 px-1.5 -mx-1.5 rounded border-l-2 border-b border-b-[#0aee3c]/10 last:border-b-0 hover:bg-[#0aee3c]/5 transition-colors animate-fadeInUp"
            style={{
              borderLeftColor: `${rowAccent}80`,
              animationDelay: `${(index + 1) * 0.08}s`,
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <div className="flex items-baseline justify-between gap-3 text-sm pl-1.5">
              <span className="text-[#0aee3c] group-hover:text-white transition-colors">
                <span className="inline-block w-6 text-[#0aee3c]/50 group-hover:text-[#0aee3c] mr-2 transition-colors">
                  {String(index + 2).padStart(2, '0')}
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

      <Link
        href="/blog"
        className="inline-block mt-2 text-xs text-[#0aee3c]/60 hover:text-[#0aee3c] transition-colors"
      >
        View all articles &rarr;
      </Link>
    </div>
  );
}
