'use client';

import { useState } from 'react';
import { GAME_BY_SLUG, type GameSlug } from '../registry';
import { readHubStore } from './hub-stats';

// Per-tile status chip. Server-rendered with the static default (Daily
// ready / Play →) for SEO; on the client the stored state wins (Solved
// today ✓, In progress, Best …). The chip carries suppressHydrationWarning
// because that swap is expected — it is scoped to this chip only.
export default function TileStatus({
  slug,
  hasDaily,
}: {
  slug: GameSlug;
  hasDaily: boolean;
}) {
  const [status] = useState(() => {
    const fallback = {
      text: hasDaily ? 'Daily ready' : 'Play →',
      tone: 'accent' as const,
    };
    if (typeof window === 'undefined') return fallback;
    const entry = readHubStore().perGame[slug];
    if (entry?.solvedToday)
      return { text: 'Solved today ✓', tone: 'success' as const };
    if (entry?.inProgress)
      return { text: 'In progress · Resume', tone: 'info' as const };
    if (entry?.best)
      return { text: `Best ${entry.best}`, tone: 'info' as const };
    return fallback;
  });

  const color =
    status.tone === 'success'
      ? 'var(--success)'
      : status.tone === 'info'
        ? 'var(--text-2)'
        : `var(${GAME_BY_SLUG[slug].accentVar})`;

  return (
    <span
      suppressHydrationWarning
      className="games-type-micro inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full"
      style={{ background: 'var(--surface-2)', color }}
    >
      {status.tone === 'accent' && (
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: 'currentColor' }}
        />
      )}
      {status.text}
    </span>
  );
}
