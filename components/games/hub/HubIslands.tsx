'use client';

import dynamic from 'next/dynamic';

// Client-only island boundaries (same pattern as the play-view loaders):
// localStorage-backed hub sections never prerender — the server emits the
// static `loading` fallbacks so hub text stays server-rendered for SEO.
export const DailyStripIsland = dynamic(() => import('./DailyStrip'), {
  ssr: false,
  loading: () => (
    <div className="games-card p-5">
      <p className="games-type-caption" style={{ color: 'var(--text-2)' }}>
        Today&apos;s daily set — a fresh Five Letters, Sudoku and Minesweeper
        every midnight PT.
      </p>
    </div>
  ),
});

export const ContinueRowIsland = dynamic(() => import('./ContinueRow'), {
  ssr: false,
});

export const StatsRowIsland = dynamic(() => import('./StatsRow'), {
  ssr: false,
  loading: () => (
    <section aria-label="Your stats">
      <p className="games-type-caption" style={{ color: 'var(--text-2)' }}>
        Your best scores and streaks appear here once you play.
      </p>
    </section>
  ),
});

export const StreakChipIsland = dynamic(
  () => import('./StatsRow').then((m) => ({ default: m.StreakChip })),
  { ssr: false },
);

export const HubViewsIsland = dynamic(() => import('./HubViews'), {
  ssr: false,
});
