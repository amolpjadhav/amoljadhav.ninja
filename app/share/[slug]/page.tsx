import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ShareRedirect from '@/components/blog/ShareRedirect';

// Share landing: /share/chess-notation?score=16&total=20&acc=89&avg=1.8&best=1
// Crawlers read the score-card metadata below (that's the snapshot embedded in
// an X post). Humans get bounced to the article by <ShareRedirect />.
const SITE = 'https://amoljadhav.ai';

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function getTitle(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error || !data) return null;
  return data.title as string;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const postTitle = (await getTitle(slug)) ?? 'this chess drill';
  const score = first(sp.score) ?? '0';
  const total = first(sp.total) ?? '20';
  const cardParams = new URLSearchParams({
    score,
    total,
    ...(first(sp.acc) ? { acc: first(sp.acc) as string } : {}),
    ...(first(sp.avg) ? { avg: first(sp.avg) as string } : {}),
    ...(first(sp.pb) ? { pb: first(sp.pb) as string } : {}),
    ...(first(sp.secs) ? { secs: first(sp.secs) as string } : {}),
    ...(first(sp.best) === '1' ? { best: '1' } : {}),
  });
  const cardUrl = `${SITE}/api/og/score?${cardParams.toString()}`;
  const title = `I scored ${score}/${total} on ${postTitle}`;
  const description = 'Think you know your squares? Try the 30-second drill and beat my score.';

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE}/share/${slug}?${cardParams.toString()}`,
      images: [{ url: cardUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cardUrl],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if ((await getTitle(slug)) === null) notFound();
  return <ShareRedirect to={`/blog/${slug}`} />;
}
