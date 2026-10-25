'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import { dayString, isCountedToday, normalizeStored, withCounted } from '@/lib/view-dedup';

// View counter for the Classic Games article itself. Same once-per-day
// rule as blog views (separate storage key so game plays never collide
// with article reads); failures leave the pill hidden, never broken.
const STORAGE_KEY = 'viewed_games';

export default function HubViews() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let stored: ReturnType<typeof normalizeStored> = {};
    try {
      stored = normalizeStored(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'), dayString(-1));
    } catch {
      return;
    }
    if (isCountedToday(stored, 'hub', dayString())) {
      fetch('/api/games/views')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (typeof data?.views?.hub === 'number') setViews(data.views.hub);
        })
        .catch(() => {});
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withCounted(stored, 'hub', dayString())));
    } catch {
      return;
    }
    fetch('/api/games/hub/view', { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.views != null) setViews(data.views);
      })
      .catch(() => {});
  }, []);

  if (views === null) return null;
  return (
    <span
      className="games-type-micro inline-flex items-center gap-1.5 tabular-nums"
      style={{ color: 'var(--text-3)' }}
      title={`${views} article views`}
    >
      <Eye size={13} aria-hidden />
      {formatCount(views)}
      <span className="sr-only">article views</span>
    </span>
  );
}
