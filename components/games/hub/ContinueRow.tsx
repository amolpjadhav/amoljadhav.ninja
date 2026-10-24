'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GAME_ORDER, GAME_BY_SLUG } from '../registry';
import { readHubStore } from './hub-stats';

// Resume row: rendered only when a saved mid-game exists in
// localStorage['games:v1']. Client-only island (ssr:false), so the store
// is read during render and the section takes up no space otherwise.
export default function ContinueRow() {
  const [save] = useState(() => {
    const store = readHubStore();
    for (const slug of GAME_ORDER) {
      const entry = store.perGame[slug];
      if (entry?.inProgress) {
        return {
          slug,
          name: GAME_BY_SLUG[slug].name,
          label: entry.continueLabel,
        };
      }
    }
    return null;
  });

  if (!save) return null;

  return (
    <section aria-label="Continue playing">
      <Link
        href={`/games/${save.slug}`}
        className="games-press games-touch games-card flex items-center gap-3 px-5 no-underline"
        style={{ borderRadius: 'var(--r-lg)' }}
      >
        <span
          className="games-type-micro"
          style={{ color: 'var(--text-3)' }}
        >
          Continue
        </span>
        <span className="games-type-callout">
          {save.name}
          {save.label ? ` · ${save.label}` : ''}
        </span>
        <span
          className="games-type-micro ml-auto"
          style={{ color: 'var(--info)' }}
        >
          Resume
        </span>
      </Link>
    </section>
  );
}
