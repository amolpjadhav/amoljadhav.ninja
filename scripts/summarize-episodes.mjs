// Full-episode summary generation: top episodes from shows with RSS
// transcripts get a map-reduce summary from Gemini (free tier), stored in
// Supabase forever. No audio or video is ever downloaded — only feed XML
// and transcript text files. Idempotent: skips videos already done.
//
// Usage:
//   node scripts/summarize-episodes.mjs [--dry-run] [--limit=10]
//
// Needs GEMINI_API_KEY + Supabase env in .env.local.

import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { mostWatched, trendingNow } from '../lib/podcasts.ts';
import { readPool } from '../lib/podcast-store.ts';
import { TRANSCRIPT_FEEDS, fetchTranscriptFor } from '../lib/podcast-transcript.ts';
import { summarizeFullEpisode } from '../lib/podcast-episode-summary.ts';

loadEnvLocal();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1];
const limit = Math.max(1, Math.min(25, Number(limitArg ?? 10) || 10));
const onlyArg = args.find((a) => a.startsWith('--only='))?.split('=')[1];
const onlyIds = new Set((onlyArg ?? '').split(',').map((s) => s.trim()).filter(Boolean));

const keys = { openRouterKey: process.env.OPENROUTER_API_KEY, geminiKey: process.env.GEMINI_API_KEY };
if (!keys.openRouterKey && !keys.geminiKey && !dryRun) {
  console.error('Missing OPENROUTER_API_KEY (or GEMINI_API_KEY) in .env.local.');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env in .env.local.');
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let pool;
try {
  pool = await readPool();
} catch (err) {
  console.error(`pool read failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
const hostsByChannel = JSON.parse(
  readFileSync(new URL('../config/podcast_hosts.json', import.meta.url), 'utf-8'),
);
const now = Date.now();
const seen = new Set();
const episodes = [...trendingNow(pool, now), ...mostWatched(pool, now)]
  .filter((ep) => TRANSCRIPT_FEEDS[ep.channel] && (seen.has(ep.videoId) ? false : (seen.add(ep.videoId), true)))
  .filter((ep) => onlyIds.size === 0 || onlyIds.has(ep.videoId))
  .slice(0, limit);

if (dryRun) {
  const { data, error } = await db.from('podcast_episode_summaries').select('video_id');
  if (error) console.warn(`lookup skipped: ${error.message}`);
  const have = new Set((data ?? []).map((r) => r.video_id));
  for (const ep of episodes) {
    console.log(`${have.has(ep.videoId) ? 'cached ' : 'would do'} ${ep.videoId} [${ep.channel}] ${ep.title.slice(0, 70)}`);
  }
  console.log('Dry run — nothing written, Gemini not called.');
  process.exit(0);
}

const { data, error } = await db.from('podcast_episode_summaries').select('video_id');
if (error) throw new Error(`lookup failed: ${error.message}`);
const have = new Set((data ?? []).map((r) => r.video_id));

let done = 0;
const failed = [];
for (const ep of episodes) {
  if (have.has(ep.videoId)) continue;
  try {
    const t = await fetchTranscriptFor(ep.channel, ep.title, ep.publishedAt, ep.durationSec);
    if (!t) throw new Error('no transcript match');
    const hosts = hostsByChannel[ep.channelId] ?? [];
    const { summary, usage, model } = await summarizeFullEpisode(keys, ep.channel, ep.title, t.segments, hosts);
    const { error: upErr } = await db.from('podcast_episode_summaries').upsert(
      {
        video_id: ep.videoId,
        show: ep.channel,
        title: ep.title,
        tldr: summary.hook,
        takeaways: summary.keyIdeas.map((k) => k.idea),
        hook: summary.hook,
        story: summary.story,
        story_sections: summary.sections,
        key_ideas: summary.keyIdeas,
        concepts: summary.concepts,
        worth_it_for: summary.worthItFor,
        chapters: summary.chapters,
        moments: summary.moments,
        people: summary.people,
        transcript_source: 'rss',
        model,
        prompt_tokens: usage.promptTokens,
        output_tokens: usage.outputTokens,
        chunks: usage.chunks,
      },
      { onConflict: 'video_id' },
    );
    if (upErr) throw new Error(upErr.message);
    done += 1;
    console.log(`saved ${ep.videoId} [${ep.channel}] chunks=${usage.chunks} tok=${usage.promptTokens}/${usage.outputTokens}`);
  } catch (err) {
    failed.push(`${ep.videoId} (${err instanceof Error ? err.message : 'unknown'})`);
  }
}
console.log(`episodes: ${episodes.length}, saved: ${done}`);
for (const f of failed) console.log(`  failed: ${f}`);

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
