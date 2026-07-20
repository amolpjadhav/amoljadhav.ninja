import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ShareButtons from '@/components/blog/ShareButtons';
import LikeButton from '@/components/blog/LikeButton';
import ViewCounter from '@/components/blog/ViewCounter';
import QuizModal from '@/components/blog/QuizModal';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import SubscribeForm from '@/components/blog/SubscribeForm';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Amol Jadhav`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { html: contentHtml, headings } = colorizeArticleSections(post.content);

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-2xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            {post.category && (
              <span
                className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
                style={{
                  color: categoryColor(post.category),
                  background: `${categoryColor(post.category)}22`,
                }}
              >
                {post.category}
              </span>
            )}

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
              <ViewCounter slug={post.slug} initialViews={post.views ?? 0} />
            </div>
          </div>

          {post.quiz && post.quiz.length > 0 && (
            <QuizModal questions={post.quiz} accent={categoryColor(post.category)} title={post.title} slug={post.slug} />
          )}

          <TableOfContents headings={headings} accent={categoryColor(post.category)} />

          <ArticleContent html={contentHtml} category={post.category} />

          <div className="mt-10">
            <SubscribeForm accent={categoryColor(post.category)} />
          </div>
        </article>
      </main>
    </>
  );
}
