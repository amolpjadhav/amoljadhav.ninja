'use client';

import { useSyncExternalStore } from 'react';
import { GAME_BY_SLUG, type GameSlug } from '../registry';
import { readHubStore, tileStatusFor, type TileStatusValue } from './hub-stats';

// Stable per-tile snapshot for the external store (see tileStatusFor):
// the same entry must return the same object or React's hook invariant
// trips. Server snapshot is always the static default (SEO + clean
// hydrate); the stored state (Solved today ✓, In progress, Best …)
// resolves on the client.
function snapshotFor(slug: GameSlug, hasDaily: boolean): TileStatusValue {
  return tileStatusFor(slug, readHubStore().perGame[slug], hasDaily);
}

function serverSnapshot(hasDaily: boolean): TileStatusValue {
  return tileStatusFor(`server:${hasDaily ? 'daily' : 'play'}`, undefined, hasDaily);
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
    () => serverSnapshot(hasDaily),
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
