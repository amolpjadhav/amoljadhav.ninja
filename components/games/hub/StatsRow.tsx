'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GAMES } from '../registry';
import { readHubStore } from './hub-stats';

// Streak pill for the hub header. Client-only island (ssr:false): renders
// nothing when there is no streak yet, so no zero ever flashes.
export function StreakChip() {
  const [streak] = useState(() => readHubStore().streakDays);

  if (streak <= 0) return null;
  return (
    <p className="games-type-callout" aria-label={`${streak}-day streak`}>
      🔥 {streak}-day streak
    </p>
  );
}

// Compact per-game stats row. Client-only island (ssr:false): best values
// hydrate from localStorage; unknown games show "Not played yet". Each
// tile links to its play page.
export default function StatsRow() {
  const [store] = useState(() => readHubStore());

  return (
    <section aria-labelledby="games-stats">
      <h2
        id="games-stats"
        className="games-type-micro mb-3"
        style={{ color: 'var(--text-3)' }}
      >
        Your stats
      </h2>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {GAMES.map((g) => {
          const best = store.perGame[g.slug]?.best;
          return (
            <li key={g.slug}>
              <Link
                href={`/games/${g.slug}`}
                className="games-press block rounded-2xl px-4 py-3 no-underline"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--hairline)',
                }}
              >
                <span
                  className="games-type-micro block"
                  style={{ color: 'var(--text-3)' }}
                >
                  {g.name}
                </span>
                <span className="games-type-callout block mt-0.5">
                  {best ?? 'Not played yet'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
