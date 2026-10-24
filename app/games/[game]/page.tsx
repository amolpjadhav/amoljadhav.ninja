import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PlayLoader from './PlayLoader';
import { GAME_BY_SLUG, GAME_ORDER, isGameSlug } from '@/components/games/registry';

export function generateStaticParams() {
  return GAME_ORDER.map((game) => ({ game }));
}

// The OG card route (/api/og/games) keys games by the legacy article id
// (notably game-2048); play slugs map onto it here. The query-param API
// is unchanged — each play page just points its share image at it.
const OG_GAME_ID: Record<string, string> = {
  'five-letters': 'five-letters',
  minesweeper: 'minesweeper',
  sudoku: 'sudoku',
  'code-breaker': 'code-breaker',
  '2048': 'game-2048',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  if (!isGameSlug(game)) return {};
  const meta = GAME_BY_SLUG[game];
  const url = `https://amoljadhav.ai/games/${meta.slug}`;
  const og = `https://amoljadhav.ai/api/og/games?g=${OG_GAME_ID[meta.slug] ?? meta.slug}`;
  return {
    title: `${meta.name} — Play online | Amol Jadhav`,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${meta.name} — Play online`,
      description: meta.description,
      type: 'website',
      url,
      images: [{ url: og, width: 1200, height: 630, alt: `${meta.name} — play online` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.name} — Play online`,
      description: meta.description,
      images: [og],
    },
  };
}

export default async function GamePlayPage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!isGameSlug(game)) notFound();
  const meta = GAME_BY_SLUG[game];
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-6xl mx-auto px-4 py-10" aria-busy="true" aria-label="Loading game">
          <div className="games-board-slot games-card" />
        </div>
      }
    >
      <PlayLoader slug={meta.slug} initialMode={meta.modes[0] as string} />
    </Suspense>
  );
}
