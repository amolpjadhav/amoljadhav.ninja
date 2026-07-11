import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default async function RecentArticles() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('title, slug, created_at')
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

  return (
    <div>
      {posts.map((post, index) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group flex items-baseline justify-between gap-3 py-1.5 px-1.5 -mx-1.5 rounded text-sm border-b border-[#0aee3c]/10 last:border-0 hover:bg-[#0aee3c]/5 transition-colors animate-fadeInUp"
          style={{ animationDelay: `${index * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}
        >
          <span className="text-[#0aee3c] group-hover:text-white transition-colors">
            <span className="inline-block w-6 text-[#0aee3c]/50 group-hover:text-[#0aee3c] mr-2 transition-colors">
              {String(index + 1).padStart(2, '0')}
            </span>
            {post.title}
          </span>
          <span className="text-[#0aee3c]/40 text-xs whitespace-nowrap shrink-0">
            {formatDate(post.created_at)}
          </span>
        </Link>
      ))}
      <Link
        href="/blog"
        className="inline-block mt-2 text-xs text-[#0aee3c]/60 hover:text-[#0aee3c] transition-colors"
      >
        View all articles &rarr;
      </Link>
    </div>
  );
}
