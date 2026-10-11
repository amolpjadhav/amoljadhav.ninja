// Suggests the official monthly five from the curated pool, blending quality
// (weighted rating) with live popularity (currently-reading counts).
//
// Editorial, not automatic: prints one ranked table per ladder slot and a
// human picks the five. Popularity is a signal, never a gate — counts swing
// day to day, so a quiet book can still win on quality.
//
// Usage:
//   node scripts/suggest-five.mjs kids mystery horror fantasy business
// Genres map to ladder slots in order: quick, medium, medium, classic, stretch.

import { BOOK_POOL } from '../lib/book-pool.ts';
import { LADDER, WEIGHT_M, poolMeanRating, weightedRating } from '../lib/book-spins.ts';
import { fetchReadingCounts } from '../lib/books.ts';

export function buildSlotRows(candidates, counts, mean) {
  return candidates
    .map((b) => ({
      book: b,
      weighted:
        b.rating === undefined ? null : weightedRating(b.rating, b.ratingsCount ?? 0, mean, WEIGHT_M),
      readingNow: counts.get(b.workKey) ?? null,
    }))
    .sort((a, b) => (b.readingNow ?? -1) - (a.readingNow ?? -1));
}

function pad(s, n) {
  return String(s).padEnd(n).slice(0, n);
}

async function main() {
  const genres = process.argv.slice(2);
  if (genres.length !== 5) {
    console.error('Usage: node scripts/suggest-five.mjs <genre> x5 (quick, medium, medium, classic, stretch)');
    process.exit(1);
  }
  const mean = poolMeanRating(BOOK_POOL);
  console.log(`Pool mean rating C=${mean.toFixed(2)}, m=${WEIGHT_M}\n`);

  const slots = genres.map((genre, i) => ({
    genre,
    slot: LADDER[i],
    candidates: BOOK_POOL.filter((b) => b.genre === genre && b.difficulty === LADDER[i]),
  }));
  for (const s of slots) {
    if (s.candidates.length === 0) console.error(`warning: no ${s.slot} candidates in ${s.genre}`);
  }
  const keys = [...new Set(slots.flatMap((s) => s.candidates.map((b) => b.workKey)))];
  const counts = await fetchReadingCounts(keys);

  for (const s of slots) {
    console.log(`--- ${s.slot} (${s.genre}) ---`);
    for (const r of buildSlotRows(s.candidates, counts, mean)) {
      const b = r.book;
      const w = r.weighted === null ? '   — ' : r.weighted.toFixed(2);
      const now = r.readingNow === null ? '  ?' : String(r.readingNow).padStart(3);
      const flag = r.readingNow === null || r.readingNow === 0 ? ' quiet' : '';
      console.log(`  ${pad(b.title, 34)} ${String(b.pages).padStart(4)}p  w=${w}  now=${now}${flag}`);
    }
    console.log('');
  }
}

const isMain = process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
