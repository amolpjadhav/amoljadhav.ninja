import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { splitPinnedPosts } from '@/lib/blog-content';
import { PINNED_SLUGS, GAMES_SLUGS } from '@/components/RecentArticles';

// Featured latest article: full-width card with a CSS visual (posts have
// no cover images) beside the text. Same pool as the articles grid, so the
// latest post never renders twice.
export default async function FeaturedArticle() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, category, created_at, read_time')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const { rest } = splitPinnedPosts(posts ?? [], [...PINNED_SLUGS, ...GAMES_SLUGS]);
  const latest = rest[0];
  if (!latest) return null;

  const eyebrow = `$ latest${latest.category ? ` · ${latest.category}` : ''} · ${formatDate(latest.created_at)}`;

  return (
    <section aria-label="Featured article" className="relative mt-12">
      <Link
        href={`/blog/${latest.slug}`}
        className="group grid grid-cols-12 gap-6 rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] p-6 no-underline transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(120,255,140,0.28)]"
      >
        <div
          aria-hidden
          className="relative col-span-12 min-h-44 overflow-hidden rounded-xl border border-white/10 min-[768px]:col-span-5"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(10,238,60,0.22),transparent_65%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <span className="font-mono text-2xl font-bold text-[#0aee3c]/80 break-all text-center leading-snug">
              $ {latest.category ?? latest.slug}
            </span>
          </div>
        </div>
        <div className="col-span-12 min-w-0 min-[768px]:col-span-7">
          <p className="font-mono text-xs text-white/40">{eyebrow}</p>
          <h2 className="mt-2 font-sans text-[28px] font-bold leading-tight text-white/90 transition-colors group-hover:text-white line-clamp-2">
            {latest.title}
          </h2>
          {latest.excerpt && (
            <p className="mt-2 font-sans text-base leading-relaxed text-white/55 line-clamp-2 max-w-[60ch]">
              {latest.excerpt}
            </p>
          )}
          <span className="mt-3 block font-sans text-sm font-semibold text-[#0aee3c]">
            Read <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </section>
  );
}
