import Link from 'next/link';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { SECTION_ACCENTS } from '@/lib/blog-content';

export const revalidate = 60; // Revalidate every 60 seconds

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

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white/95 mb-8 animate-fadeIn">
            Blog
          </h1>

          {posts.length === 0 ? (
            <div className="bg-[#1c1d20] border border-white/10 rounded-lg p-12 text-center animate-fadeInUp">
              <p className="text-white/70 text-xl">
                No posts yet. Check back soon for new content!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => {
                const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length];
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-[#1c1d20] border-y border-r border-white/10 border-l-[3px] rounded-lg p-6 transition-all hover:transform hover:scale-105 hover:border-l-[3px] animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s`, borderLeftColor: accent }}
                  >
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
