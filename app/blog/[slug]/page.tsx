import { notFound } from 'next/navigation';
import MatrixBackground from '@/components/layout/MatrixBackground';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <MatrixBackground />
      <Header />

      <main className="min-h-screen pt-24 pb-12 px-4">
        <article className="container mx-auto max-w-4xl">
          <div className="mb-8 animate-fadeIn">
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-sm text-[#0aee3c]/60 border border-[#0aee3c]/20 px-3 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#0aee3c] mb-4">
              {post.title}
            </h1>

            <div className="flex gap-4 text-[#0aee3c]/60 text-sm">
              <span>{formatDate(post.created_at)}</span>
              {post.read_time && <span>{post.read_time} min read</span>}
            </div>
          </div>

          <div className="prose prose-invert prose-green max-w-none animate-fadeInUp">
            <div
              className="text-[#0aee3c]/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </main>
    </>
  );
}
