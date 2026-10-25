import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getPool } from '@/lib/podcast-pool';
import { mostWatched, trendingNow } from '@/lib/podcasts';
import { TRANSCRIPT_FEEDS, fetchTranscriptFor } from '@/lib/podcast-transcript';
import { summarizeFullEpisode } from '@/lib/podcast-episode-summary';

// Daily full-episode generation trigger. Same CRON_SECRET guard as
// /api/podcasts/summarize. Max 10 episodes per run (each is ~10 model
// calls with pacing); skips videos already summarized.
//   GET /api/podcasts/summarize-episodes?secret=...[&limit=10]
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'summarizer not configured' }, { status: 503 });
  }
  const url = new URL(req.url);
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('secret');
  if (given !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const keys = { openRouterKey: process.env.OPENROUTER_API_KEY, geminiKey: process.env.GEMINI_API_KEY };
  if (!keys.openRouterKey && !keys.geminiKey) {
    return NextResponse.json({ error: 'no LLM provider configured' }, { status: 503 });
  }
  try {
    const limit = Math.max(1, Math.min(25, Number(url.searchParams.get('limit') ?? 10) || 10));
    const pool = await getPool();
    const now = Date.now();
    const seen = new Set<string>();
    const episodes = [...trendingNow(pool, now), ...mostWatched(pool, now)]
      .filter(
        (ep) => TRANSCRIPT_FEEDS[ep.channel] && (seen.has(ep.videoId) ? false : (seen.add(ep.videoId), true)),
      )
      .slice(0, limit);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const hostsByChannel: Record<string, { name: string; role: string }[]> = JSON.parse(
      readFileSync(join(process.cwd(), 'config', 'podcast_hosts.json'), 'utf-8'),
    );
    const { data } = await supabase.from('podcast_episode_summaries').select('video_id');
    const have = new Set((data ?? []).map((r: { video_id: string }) => r.video_id));
    let saved = 0;
    const failed: string[] = [];
    let promptTokens = 0;
    let outputTokens = 0;
    for (const ep of episodes) {
      if (have.has(ep.videoId)) continue;
      try {
        const t = await fetchTranscriptFor(ep.channel, ep.title, ep.publishedAt, ep.durationSec);
        if (!t) throw new Error('no transcript match');
        const hosts = hostsByChannel[ep.channelId] ?? [];
        const { summary, usage, model } = await summarizeFullEpisode(keys, ep.channel, ep.title, t.segments, hosts);
        const { error } = await supabase.from('podcast_episode_summaries').upsert(
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
        if (error) throw new Error(error.message);
        saved += 1;
        promptTokens += usage.promptTokens;
        outputTokens += usage.outputTokens;
      } catch (err) {
        failed.push(`${ep.videoId} (${err instanceof Error ? err.message : 'unknown'})`);
      }
    }
    const stats = { candidates: episodes.length, saved, failed, promptTokens, outputTokens };
    console.log('Podcast full-episode run:', JSON.stringify(stats));
    return NextResponse.json({ ok: true, ...stats });
  } catch (error) {
    console.error('Podcast full-episode error:', error);
    return NextResponse.json({ error: 'run failed' }, { status: 500 });
  }
}
