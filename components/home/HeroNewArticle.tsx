import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { splitPinnedPosts } from '@/lib/blog-content';
import { PINNED_SLUGS, GAMES_SLUGS } from '@/components/RecentArticles';
import { isFreshArticle } from './heroData';

// "New:" line under the hero tagline. Shows only when the latest article is
// fresh (≤ 21 days old); otherwise the hero carries no article promo.
const FRESH_DAYS = 21;
const TITLE_CHARS = 70;

export default async function HeroNewArticle() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const { rest } = splitPinnedPosts(posts ?? [], [...PINNED_SLUGS, ...GAMES_SLUGS]);
  const latest = rest[0];
  if (!latest || !isFreshArticle(latest.created_at, FRESH_DAYS)) return null;

  const title = latest.title.length > TITLE_CHARS ? `${latest.title.slice(0, TITLE_CHARS)}…` : latest.title;

  return (
    <p className="mt-3">
      <Link
        href={`/blog/${latest.slug}`}
        className="block truncate font-sans text-[15px] text-[#0aee3c] hover:underline"
      >
        ✦ New: {title} <span aria-hidden>→</span>
      </Link>
    </p>
  );
}
