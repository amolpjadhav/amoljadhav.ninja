import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { colorizeArticleSections } from '@/lib/blog-content';
import ShareButtons from '@/components/blog/ShareButtons';
import LikeButton from '@/components/blog/LikeButton';

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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-2xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
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
            </div>
          </div>

          <div
            className="article-content animate-fadeInUp"
            dangerouslySetInnerHTML={{ __html: colorizeArticleSections(post.content) }}
          />
        </article>
      </main>
    </>
  );
}
