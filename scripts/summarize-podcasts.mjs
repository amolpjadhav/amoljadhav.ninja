// Daily summary generation: top episodes missing a cached AI summary get
// one from Gemini (free tier), stored in Supabase forever. Idempotent:
// skips videos that already have a summary and never exceeds 40/day.
//
// Usage:
//   node scripts/summarize-podcasts.mjs [--dry-run] [--limit=20]
//
// Needs GEMINI_API_KEY in .env.local (get one free at Google AI Studio).
// Dry run lists candidates without calling Gemini or writing anything.

import { readFileSync, existsSync } from 'fs';
import { runSummaries } from '../lib/podcast-summary.ts';
import { mostWatched, trendingNow } from '../lib/podcasts.ts';
import { readPool } from '../lib/podcast-store.ts';

loadEnvLocal();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1];
const limit = Math.max(1, Math.min(40, Number(limitArg ?? 20) || 20));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && !dryRun) {
  console.error('Missing GEMINI_API_KEY in .env.local (free at Google AI Studio).');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env in .env.local.');
  process.exit(1);
}

const pool = await readPool();
const now = Date.now();
const episodes = [...trendingNow(pool, now), ...mostWatched(pool, now)].map((ep) => ({
  videoId: ep.videoId,
  title: ep.title,
  channel: ep.channel,
  publishedAt: ep.publishedAt,
  durationSec: ep.durationSec ?? undefined,
  description: ep.description ?? '',
}));
const stats = await runSummaries(apiKey ?? 'dry-run', episodes, { limit, dryRun });
console.log(`candidates: ${stats.candidates}, already cached: ${stats.alreadyHad}, generated: ${stats.generated}`);
console.log(`tokens in/out: ${stats.promptTokens}/${stats.outputTokens}`);
for (const f of stats.failed) console.log(`  failed: ${f}`);
if (dryRun) console.log('Dry run — nothing written, Gemini not called.');

function loadEnvLocal() {
  const path = new URL('../.env.local', import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
