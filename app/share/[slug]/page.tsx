import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ShareRedirect from '@/components/blog/ShareRedirect';
import { ARTICLE_SLUG, ARTICLE_TITLE, buildCardParams, encodeMarks, parseCardParams } from '@/lib/games/share';

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

  // Classic-games cards: /share/classic-games-revisited?g=code-breaker&big=4/10&…
  // Same convention as the chess card below, via lib/games/share.
  if (slug === ARTICLE_SLUG) {
    const card = parseCardParams((k) => first(sp[k]) ?? null);
    if (card) {
      const cardParams = buildCardParams({
        game: card.game,
        big: card.big,
        line: card.line,
        text: '',
        stats: card.stats,
        grid: card.grid.length > 0 ? encodeMarks(card.grid) : undefined,
      });
      const cardUrl = `${SITE}/api/og/games?${cardParams.toString()}`;
      const title = `${card.label}: ${card.big}${card.line ? ` — ${card.line}` : ''} · ${ARTICLE_TITLE}`;
      const description = `My ${card.label} result from ${ARTICLE_TITLE}. Can you beat it?`;
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
        twitter: { card: 'summary_large_image', title, description, images: [cardUrl] },
      };
    }
  }

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
    ...(first(sp.seq) ? { seq: first(sp.seq) as string } : {}),
    ...(first(sp.beat) ? { beat: first(sp.beat) as string } : {}),
    ...(first(sp.d) ? { d: first(sp.d) as string } : {}),
    ...(first(sp.r) ? { r: first(sp.r) as string } : {}),
  });
  const cardUrl = `${SITE}/api/og/score?${cardParams.toString()}`;
  // Challenge links (?beat=&d=) get a short caption that survives X's
  // overlay; legacy links keep the old title rather than guessing.
  const beatN = Number(first(sp.beat));
  const dN = Number(first(sp.d) ?? first(sp.secs));
  const title =
    Number.isFinite(beatN) &&
    first(sp.beat) !== undefined &&
    [15, 30, 60].includes(dN)
      ? `Can you beat ${Math.min(999, Math.max(0, Math.round(beatN)))}? The ${dN}-second chessboard test`
      : `I scored ${score}/${total} on ${postTitle}`;
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
  // The games article may still be a draft: its share links should bounce
  // to the article slug regardless of publish state.
  if (slug !== ARTICLE_SLUG && (await getTitle(slug)) === null) notFound();
  return <ShareRedirect to={`/blog/${slug}`} />;
}
