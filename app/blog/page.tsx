import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { categoryColor } from '@/lib/blog-content';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Blog | Amol Jadhav',
  description: 'Writing on AI, software engineering, and more.',
};

async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await getBlogPosts();

  const categories = Array.from(
    new Set(posts.map((post) => post.category).filter(Boolean))
  ).sort();

  const visiblePosts = category
    ? posts.filter((post) => post.category === category)
    : posts;

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white/95 mb-6 animate-fadeIn">
            Blog
          </h1>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 animate-fadeIn">
              <Link
                href="/blog"
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  !category
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                All
              </Link>
              {categories.map((cat) => {
                const color = categoryColor(cat);
                const active = category === cat;
                return (
                  <Link
                    key={cat}
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                    className="text-sm px-3 py-1.5 rounded-full border transition-colors"
                    style={
                      active
                        ? { borderColor: color, color, background: `${color}1a` }
                        : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          )}

          {visiblePosts.length === 0 ? (
            <div className="bg-[#1c1d20] border border-white/10 rounded-lg p-12 text-center animate-fadeInUp">
              <p className="text-white/70 text-xl">
                {posts.length === 0
                  ? 'No posts yet. Check back soon for new content!'
                  : 'No posts in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePosts.map((post, index) => {
                const accent = categoryColor(post.category);
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-[#1c1d20] border-y border-r border-white/10 border-l-[3px] rounded-lg p-6 transition-all hover:transform hover:scale-105 hover:border-l-[3px] animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s`, borderLeftColor: accent }}
                  >
                    {post.category && (
                      <span
                        className="inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-3"
                        style={{ color: accent, background: `${accent}22` }}
                      >
                        {post.category}
                      </span>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs text-white/50 border border-white/15 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-xl font-semibold mb-2" style={{ color: accent }}>
                      {post.title}
                    </h2>

                    <p className="text-white/60 text-sm mb-3 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex justify-between items-center text-xs text-white/40">
                      <span>{formatDate(post.created_at)}</span>
                      {post.read_time && <span>{post.read_time} min read</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
