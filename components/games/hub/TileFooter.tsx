'use client';

import { useEffect, useState } from 'react';
import { Eye, Share2 } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import { gameShareLinks } from '@/lib/games/arcade';
import type { GameSlug } from '../registry';

// One cached read for all six cards: first footer fetches, the rest reuse.
let allViews: Promise<Record<string, number>> | null = null;
function readViews(): Promise<Record<string, number>> {
  if (!allViews) {
    allViews = fetch('/api/games/views')
      .then((res) => (res.ok ? res.json() : { views: {} }))
      .then((data) => data.views ?? {})
      .catch(() => ({}));
  }
  return allViews;
}

// Card footer (outside the tile link — buttons can't nest in anchors):
// lifetime views plus share-out for that game. Views count play-page
// visits only; hub impressions never increment.
export default function TileFooter({
  slug,
  name,
  initialViews,
}: {
  slug: GameSlug;
  name: string;
  initialViews?: number;
}) {
  const [views, setViews] = useState<number | null>(initialViews ?? null);
  const [copied, setCopied] = useState(false);
  const links = gameShareLinks(slug, name);

  useEffect(() => {
    let live = true;
    readViews().then((all) => {
      if (live && typeof all[slug] === 'number') setViews(all[slug]);
    });
    return () => {
      live = false;
    };
  }, [slug]);

  const share = async () => {
    const payload = { title: `${name} — Play online`, text: links.text, url: links.url };
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as Navigator & { share: (d: typeof payload) => Promise<void> }).share(payload);
        return;
      }
      throw new Error('no native share');
    } catch {
      try {
        await navigator.clipboard.writeText(`${links.text} ${links.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* clipboard unavailable — the X link still works */
      }
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-5 pb-5 pt-3 mt-3"
      style={{ borderTop: '1px solid var(--hairline)' }}
    >
      <span
        className="games-type-micro inline-flex items-center gap-1.5 tabular-nums"
        style={{ color: 'var(--text-3)' }}
        title={views === null ? 'Loading views' : `${views} plays`}
      >
        <Eye size={13} aria-hidden />
        {views === null ? '—' : formatCount(views)}
        <span className="sr-only">plays</span>
      </span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={share}
        aria-label={`Share ${name}`}
        className="games-press games-type-micro inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
      >
        <Share2 size={13} aria-hidden />
        {copied ? 'Copied' : 'Share'}
      </button>
      <a
        href={links.xUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Post ${name} to X`}
        className="games-press games-type-micro inline-flex items-center rounded-full px-3 py-1.5 font-bold"
        style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
      >
        𝕏
      </a>
    </div>
  );
}
