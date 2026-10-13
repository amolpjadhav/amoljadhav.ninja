import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { GAMES_SLUGS } from '@/components/RecentArticles';

const PUZZLE_GAMES = ['Five Letters', '2048', 'Code Breaker', 'Minesweeper'];

export default async function GamesRow() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt')
    .in('slug', GAMES_SLUGS)
    .eq('published', true);
  const bySlug = new Map((posts ?? []).map((p) => [p.slug, p]));
  const cards = GAMES_SLUGS.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
  if (cards.length === 0) return null;

  return (
    <section id="games" aria-label="Games" className="relative mb-6 scroll-mt-20">
      <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-2">
        <span className="text-[#0aee3c]">$</span> Games
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-black border border-[#0aee3c]/20 rounded-lg p-4 transition-all hover:border-[#0aee3c]/50 hover:shadow-[0_0_16px_rgba(10,238,60,0.25)]"
          >
            <h3 className="text-white/85 group-hover:text-white transition-colors font-medium text-base mb-2">
              {post.title}
            </h3>
            {post.slug === 'classic-games-revisited' ? (
              <div className="flex flex-wrap gap-1.5">
                {PUZZLE_GAMES.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-[#0aee3c]/25 text-[#0aee3c]/80"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : post.excerpt ? (
              <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{post.excerpt}</p>
            ) : null}
            <span className="mt-auto block pt-3 font-mono text-xs text-[#0aee3c]/70 group-hover:text-[#0aee3c] transition-colors">
              Play <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
