// Suggests the official monthly five from the curated pool using the
// selection score (weights are a starting point — tune after a month):
//
//   score = 0.6 * (weighted rating / 5) + 0.25 * finish rate + 0.15 * popularity
//   finish rate = already_read / (already_read + currently_reading)
//   popularity  = log10(readers + 1) / 5, readers = read + reading
//
// The stretch slot is exempt from finish rate (length is the point).
// Editorial, not automatic: prints one ranked table per ladder slot and a
// human picks the five. Counts are fetched live, so every run re-ranks on
// current numbers — run it when composing each month.
//
// Usage:
//   node scripts/suggest-five.mjs juvenile_fiction:quick mystery:medium horror:classic fantasy:stretch business:medium
// Each arg pairs a drawn genre with its ladder slot (1 quick, 2 medium,
// 1 classic, 1 stretch per month, hand-assigned across the drawn genres).

import { BOOK_POOL } from '../lib/book-pool.ts';
import { LADDER, WEIGHT_M, poolMeanRating, weightedRating } from '../lib/book-spins.ts';
import { SCORE_WEIGHTS, fetchReadingLogCounts, finishRate, selectionScore } from '../lib/books.ts';

export function buildSlotRows(candidates, logs, mean, slot) {
  return candidates
    .map((b) => {
      const weighted = b.rating === undefined ? mean : weightedRating(b.rating, b.ratingsCount ?? 0, mean, WEIGHT_M);
      const log = logs.get(b.workKey) ?? null;
      const finish = log ? finishRate(log) : null;
      const readers = log ? log.read + log.reading : 0;
      return {
        book: b,
        weighted,
        finish,
        readers,
        score: selectionScore({ weighted, finish, readers, exemptFinish: slot === 'stretch' }),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function pad(s, n) {
  return String(s).padEnd(n).slice(0, n);
}

const SLOTS = new Set(['quick', 'medium', 'classic', 'stretch']);

async function main() {
  const args = process.argv.slice(2);
  const pairs = args.map((a) => a.split(':'));
  if (
    args.length !== 5 ||
    pairs.some(([g, s]) => !g || !SLOTS.has(s) || !BOOK_POOL.some((b) => b.genre === g))
  ) {
    console.error('Usage: node scripts/suggest-five.mjs <genre:slot> x5 (e.g. mystery:medium horror:classic ...)');
    process.exit(1);
  }
  const mean = poolMeanRating(BOOK_POOL);
  const w = SCORE_WEIGHTS;
  console.log(`C=${mean.toFixed(2)} m=${WEIGHT_M} weights=${w.quality}/${w.finish}/${w.popularity}\n`);

  const slots = pairs.map(([genre, slot]) => ({
    genre,
    slot,
    candidates: BOOK_POOL.filter((b) => b.genre === genre && b.difficulty === slot),
  }));
  const ladderOk = LADDER.every((s) => slots.filter((x) => x.slot === s).length === LADDER.filter((x) => x === s).length);
  if (!ladderOk) console.error('warning: slots are not 1 quick / 2 medium / 1 classic / 1 stretch');
  for (const s of slots) {
    if (s.candidates.length === 0) console.error(`warning: no ${s.slot} candidates in ${s.genre}`);
  }
  const keys = [...new Set(slots.flatMap((s) => s.candidates.map((b) => b.workKey)))];
  const logs = await fetchReadingLogCounts(keys);

  for (const s of slots) {
    console.log(`--- ${s.slot} (${s.genre})${s.slot === 'stretch' ? ' — exempt from finish rate' : ''} ---`);
    for (const r of buildSlotRows(s.candidates, logs, mean, s.slot)) {
      const b = r.book;
      const fin = r.finish === null ? '   — ' : `${(r.finish * 100).toFixed(0).padStart(3)}%`;
      const flag = s.slot !== 'stretch' && r.finish !== null && r.finish < 0.5 ? ' stalls' : '';
      console.log(
        `  ${pad(b.title, 30)} ${String(b.pages).padStart(4)}p  w=${r.weighted.toFixed(2)}  fin=${fin}  readers=${String(r.readers).padStart(5)}  score=${r.score.toFixed(3)}${flag}`,
      );
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
