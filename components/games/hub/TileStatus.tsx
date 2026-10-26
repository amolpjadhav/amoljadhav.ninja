'use client';

import { useSyncExternalStore } from 'react';
import { GAME_BY_SLUG, type GameSlug } from '../registry';
import { readHubStore } from './hub-stats';

type Tone = 'accent' | 'success' | 'info';

function fallbackFor(hasDaily: boolean): { text: string; tone: Tone } {
  return { text: hasDaily ? 'Daily ready' : 'Play →', tone: 'accent' };
}

// Cached snapshot: referentially stable until the stored entry changes,
// so the external-store read never loops. Server snapshot is always the
// static default (SEO + clean hydrate); the stored state
// (Solved today ✓, In progress, Best …) resolves on the client.
let cache: { slug: GameSlug; hasDaily: boolean; key: string; status: { text: string; tone: Tone } } | null =
  null;

function snapshotFor(slug: GameSlug, hasDaily: boolean): { text: string; tone: Tone } {
  const entry = readHubStore().perGame[slug];
  const key = entry
    ? `${entry.solvedToday ? 1 : 0}|${entry.inProgress ? 1 : 0}|${entry.best ?? ''}`
    : 'none';
  if (!cache || cache.slug !== slug || cache.hasDaily !== hasDaily || cache.key !== key) {
    let status = fallbackFor(hasDaily);
    if (entry?.solvedToday) status = { text: 'Solved today ✓', tone: 'success' };
    else if (entry?.inProgress) status = { text: 'In progress · Resume', tone: 'info' };
    else if (entry?.best) status = { text: `Best ${entry.best}`, tone: 'info' };
    cache = { slug, hasDaily, key, status };
  }
  return cache.status;
}

function subscribeStore(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

// Per-tile status chip.
export default function TileStatus({
  slug,
  hasDaily,
}: {
  slug: GameSlug;
  hasDaily: boolean;
}) {
  const status = useSyncExternalStore(
    subscribeStore,
    () => snapshotFor(slug, hasDaily),
    () => fallbackFor(hasDaily),
  );

  const color =
    status.tone === 'success'
      ? 'var(--success)'
      : status.tone === 'info'
        ? 'var(--text-2)'
        : `var(${GAME_BY_SLUG[slug].accentVar})`;

  return (
    <span
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
