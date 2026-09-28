'use client';

import { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import {
  dayString,
  normalizeStored,
  isCountedToday,
  withCounted,
} from '@/lib/view-dedup';

const STORAGE_KEY = 'viewed_posts';

function readCountedDays(): ReturnType<typeof normalizeStored> {
  try {
    return normalizeStored(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
      dayString(-1),
    );
  } catch {
    return {};
  }
}

function markCountedToday(slug: string): boolean {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(withCounted(readCountedDays(), slug, dayString())),
    );
    return true;
  } catch {
    // Private mode etc: storage unwritable. Bail without counting so one
    // reader can't mint a view on every single page load.
    return false;
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
    if (isCountedToday(readCountedDays(), slug, dayString())) return;

    if (!markCountedToday(slug)) return;

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
