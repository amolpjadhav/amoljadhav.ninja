// Pure helpers behind the once-per-day view count. No DOM here so the
// day-rollover and v1-migration rules stay unit-testable (see
// view-dedup.test.mjs, run with `npm test`).

// Local day as YYYY-MM-DD. `at` exists only for tests.
export function dayString(offsetDays = 0, at: Date = new Date()): string {
  const d = new Date(at);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type CountedDays = Record<string, string>;

// Normalize whatever is in storage to slug -> last-counted-day.
// The v1 format was a plain slug list (once ever); those entries migrate as
// `fallbackDay` (yesterday in production) so each migrates into exactly one
// recount on its next visit. Garbage becomes an empty map.
export function normalizeStored(raw: unknown, fallbackDay: string): CountedDays {
  if (Array.isArray(raw)) {
    const migrated: CountedDays = {};
    for (const s of raw) {
      if (typeof s === 'string') migrated[s] = fallbackDay;
    }
    return migrated;
  }
  if (raw && typeof raw === 'object') {
    const clean: CountedDays = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'string') clean[k] = v;
    }
    return clean;
  }
  return {};
}

export function isCountedToday(seen: CountedDays, slug: string, today: string): boolean {
  return seen[slug] === today;
}

export function withCounted(seen: CountedDays, slug: string, today: string): CountedDays {
  return { ...seen, [slug]: today };
}
