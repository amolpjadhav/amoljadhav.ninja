// One-time history backfill: deep upload listings per channel →
// podcast_episodes. The hourly refresh only reads page 1 afterward, so
// history costs quota exactly once.
//
// Idempotent: upserts on video_id, skips ids already stored — safe to
// re-run, and re-running with more pages deepens history.
//
// Usage:
//   node scripts/backfill-podcasts.mjs [--dry-run] [--pages=4]
//
// Cost: ~4 listing units + ~4 detail units per channel ≈ 320 units total.

import { readFileSync, existsSync } from 'fs';
import { CHANNELS, channelMeta, fetchChannelUploads, fetchVideoDetails } from '../lib/podcasts.ts';
import { countRows, existingIds, upsertEpisodes } from '../lib/podcast-store.ts';

loadEnvLocal();

const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.error('Missing YOUTUBE_API_KEY in .env.local.');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env in .env.local.');
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const pagesArg = args.find((a) => a.startsWith('--pages='))?.split('=')[1];
const pages = Math.max(1, Math.min(20, Number(pagesArg ?? 4) || 4));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const meta = await channelMeta(apiKey);
let channels = 0;
let listed = 0;
let stored = 0;
for (const c of CHANNELS) {
  let ids;
  try {
    ids = await fetchChannelUploads(apiKey, c.id, pages, meta.uploads.get(c.id));
  } catch (e) {
    console.error(`  ${c.label}: listing failed (${e.message}), skipping`);
    continue;
  }
  const known = dryRun ? new Set() : await existingIds(ids);
  const fresh = ids.filter((id) => !known.has(id));
  listed += ids.length;
  console.log(`${c.label}: ${ids.length} listed, ${fresh.length} new`);
  if (!dryRun && fresh.length > 0) {
    const eps = await fetchVideoDetails(apiKey, fresh, meta);
    await upsertEpisodes(eps);
    stored += eps.length;
  }
  channels++;
  await sleep(250);
}
console.log(`done: ${channels} channels, ${listed} ids listed, ${stored} episodes stored${dryRun ? ' (dry run)' : ''}`);
if (!dryRun) console.log(`reconciled table total: ${await countRows()} rows`);

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
