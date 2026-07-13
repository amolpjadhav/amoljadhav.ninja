'use client';

import { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { formatCount } from '@/lib/utils';

const STORAGE_KEY = 'viewed_posts';

function getViewedSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function addViewedSlug(slug: string) {
  const slugs = getViewedSlugs();
  if (!slugs.includes(slug)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs, slug]));
  }
}

export default function ViewCounter({
  slug,
  initialViews,
}: {
  slug: string;
  initialViews: number;
}) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    if (getViewedSlugs().includes(slug)) return;

    addViewedSlug(slug);

    fetch(`/api/posts/${slug}/view`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.views != null) setViews(data.views);
      })
      .catch(() => {
        // View count is best-effort; a failed request just leaves the
        // initial server-rendered count in place.
      });
  }, [slug]);

  return (
    <span
      className="flex items-center gap-2 text-sm text-white/60 border border-white/15 rounded-full px-3 py-1.5"
      title={`${views} view${views === 1 ? '' : 's'}`}
    >
      <BarChart2 size={16} />
      <span>{formatCount(views)}</span>
    </span>
  );
}
