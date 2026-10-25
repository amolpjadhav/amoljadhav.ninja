import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { HubShell } from '@/components/games/GameShell';
import AnchorRedirect from './AnchorRedirect';
import { GAMES } from '@/components/games/registry';
import { readGameViews } from '@/lib/game-views';
import TileArt from '@/components/games/hub/TileArt';
import TileStatus from '@/components/games/hub/TileStatus';
import TileFooter from '@/components/games/hub/TileFooter';
import {
  ContinueRowIsland as ContinueRow,
  DailyStripIsland as DailyStrip,
  HubViewsIsland as HubViews,
  StatsRowIsland as StatsRow,
  StreakChipIsland as StreakChip,
} from '@/components/games/hub/HubIslands';
import { DAILY_GAMES } from '@/components/games/hub/hub-stats';


export const metadata: Metadata = {
  title: 'Classic Games, Revisited | Amol Jadhav',
  description:
    'Six classics, rebuilt. One new daily set every midnight PT — free, no ads, daily puzzle.',
  alternates: { canonical: 'https://amoljadhav.ai/games' },
  openGraph: {
    title: 'Classic Games, Revisited',
    description: 'Six classics, rebuilt. One new daily set every midnight PT.',
    type: 'website',
    url: 'https://amoljadhav.ai/games',
    images: [
      {
        url: 'https://amoljadhav.ai/api/og/games?g=hub',
        width: 1200,
        height: 630,
        alt: 'Classic Games, Revisited — play online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classic Games, Revisited',
    description: 'Six classics, rebuilt. One new daily set every midnight PT.',
    images: ['https://amoljadhav.ai/api/og/games?g=hub'],
  },
};

const CONCEPTS = [
  {
    title: 'Splitting possibilities',
    body: 'Every guess rules out whole families of answers at once — the fastest wins come from guesses that eliminate the most.',
  },
  {
    title: 'Chaining constraints',
    body: 'One certain placement unlocks the next. Follow the chain and the board solves itself.',
  },
  {
    title: 'Planning ahead',
    body: 'Keep the big tile parked, flag the certain mines first, save hints for the endgame. Small plans compound.',
  },
];

// "NEW" badges show for 7 days after launch (spec section 3).
const LAUNCH_DATE = '2026-10-24';
const SHOW_NEW_BADGE =
  Date.now() - new Date(`${LAUNCH_DATE}T00:00:00-07:00`).getTime() <
  7 * 24 * 60 * 60 * 1000;

const DAILY_SET = new Set<string>(DAILY_GAMES);

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Classic Games, Revisited',
  description:
    'Six classics, rebuilt. One new daily set every midnight PT — free, no ads.',
  author: { '@type': 'Person', name: 'Amol Jadhav' },
  mainEntityOfPage: 'https://amoljadhav.ai/games',
  about: GAMES.map((g) => ({
    '@type': 'VideoGame',
    name: g.name,
    url: `https://amoljadhav.ai/games/${g.slug}`,
    description: g.description,
  })),
};

export default async function GamesHubPage() {
  // Server-rendered counts so footers paint numbers on first paint;
  // each footer still refreshes client-side for exactness.
  let initialViews: Record<string, number> = {};
  try {
    initialViews = await readGameViews();
  } catch {
    initialViews = {};
  }
  return (
    <HubShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* Legacy #anchor links (kept working after the article redirect). */}
      <Suspense fallback={null}>
        <AnchorRedirect />
      </Suspense>

      <section aria-labelledby="games-h1">
        <p className="mb-4">
          <Link href="/" className="games-type-callout no-underline" aria-label="Back home">
            <span aria-hidden>← </span>Home
          </Link>
        </p>
        <div className="flex items-baseline justify-between gap-4">
          <p
            className="games-type-micro"
            style={{ color: 'var(--text-3)' }}
          >
            Arcade
          </p>
          <span className="flex items-center gap-3">
            <Suspense fallback={null}>
              <HubViews />
            </Suspense>
            <Suspense fallback={null}>
              <StreakChip />
            </Suspense>
          </span>
        </div>
        <h1 id="games-h1" className="games-type-display mt-1">
          Classic Games, Revisited
        </h1>
        <p
          className="games-type-body mt-2 max-w-[60ch]"
          style={{ color: 'var(--text-2)' }}
        >
          Six classics, rebuilt. One new daily set every midnight PT — free,
          no ads.
        </p>
      </section>

      <Suspense
        fallback={
          <div className="games-card p-5">
            <p
              className="games-type-caption"
              style={{ color: 'var(--text-2)' }}
            >
              Loading today&apos;s daily set…
            </p>
          </div>
        }
      >
        <DailyStrip />
      </Suspense>

      <Suspense fallback={null}>
        <ContinueRow />
      </Suspense>

      <section aria-labelledby="games-all">
        <h2
          id="games-all"
          className="games-type-micro mb-3"
          style={{ color: 'var(--text-3)' }}
        >
          All games
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <li key={g.slug}>
              <div
                className="games-card games-tile h-full flex flex-col"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <Link
                  href={`/games/${g.slug}`}
                  className="games-press block no-underline flex-1"
                >
                <span
                  aria-hidden
                  className="games-tile-glow pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${g.accent}2E 0%, transparent 70%)`,
                  }}
                />
                <span className="games-tile-artwrap" aria-hidden>
                  <TileArt slug={g.slug} />
                </span>
                <span className="block px-5 pt-1 pb-1">
                  <span className="flex gap-1.5 mb-2.5" aria-hidden={false}>
                    {DAILY_SET.has(g.slug) && (
                      <span
                        className="games-type-micro px-2 py-0.5 rounded-full"
                        style={{
                          background: `color-mix(in srgb, var(${g.accentVar}) 18%, transparent)`,
                          // Badge text stays near-white: saturated accents
                          // (e.g. minesweeper purple) fail 4.5:1 on the tint.
                          color: 'var(--text-1)',
                        }}
                      >
                        Daily
                      </span>
                    )}
                    {SHOW_NEW_BADGE && (
                      <span
                        className="games-type-micro px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--surface-3)',
                          color: 'var(--text-1)',
                        }}
                      >
                        New
                      </span>
                    )}
                  </span>
                  <span className="games-type-headline block">{g.name}</span>
                  <span
                    className="games-type-callout block mt-1"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {g.pitch}
                  </span>
                  <TileStatus
                    slug={g.slug}
                    hasDaily={DAILY_SET.has(g.slug)}
                  />
                </span>
                </Link>
                <TileFooter slug={g.slug} name={g.name} initialViews={initialViews[g.slug]} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Suspense
        fallback={
          <section aria-label="Your stats">
            <p
              className="games-type-caption"
              style={{ color: 'var(--text-2)' }}
            >
              Loading your stats…
            </p>
          </section>
        }
      >
        <StatsRow />
      </Suspense>

      <section aria-labelledby="games-train">
        <h2
          id="games-train"
          className="games-type-micro mb-3"
          style={{ color: 'var(--text-3)' }}
        >
          What these games train
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CONCEPTS.map((c) => (
            <div key={c.title} className="games-card p-5">
              <h3 className="games-type-headline">{c.title}</h3>
              <p
                className="games-type-body mt-1.5"
                style={{ color: 'var(--text-2)' }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Credits">
        <p className="games-type-caption" style={{ color: 'var(--text-3)' }}>
          2048 original by Gabriele Cirulli (MIT). Five Letters, Minesweeper,
          Sudoku and Code Breaker are classic public-domain rules, rebuilt
          here. Chess plays against the Stockfish engine (GPL-3, unmodified).
          New sets and scores are announced on{' '}
          <Link href="/blog" className="underline underline-offset-2">
            the blog — subscribe there
          </Link>
          .
        </p>
      </section>
    </HubShell>
  );
}
