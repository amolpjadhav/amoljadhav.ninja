import { NextResponse } from 'next/server';
import { runSummaries } from '@/lib/podcast-summary';
import { getPool } from '@/lib/podcast-pool';
import { mostWatched, trendingNow } from '@/lib/podcasts';

// Daily summary generation trigger. Guarded by CRON_SECRET (set it in
// .env.local and wherever the scheduler runs): pass it as
// `?secret=` or `Authorization: Bearer`. No secret configured → refuse,
// so a default deploy never runs the job accidentally.
//   GET /api/podcasts/summarize?secret=...[&limit=20]
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'missing GEMINI_API_KEY' }, { status: 503 });
  }
  try {
    const limit = Math.max(1, Math.min(40, Number(url.searchParams.get('limit') ?? 20) || 20));
    const pool = await getPool();
    const now = Date.now();
    const episodes = [...trendingNow(pool, now), ...mostWatched(pool, now)].map((ep) => ({
      videoId: ep.videoId,
      title: ep.title,
      channel: ep.channel,
      publishedAt: ep.publishedAt,
      durationSec: ep.durationSec ?? undefined,
      description: ep.description ?? '',
    }));
    const stats = await runSummaries(apiKey, episodes, { limit });
    console.log('Podcast summarize run:', JSON.stringify(stats));
    return NextResponse.json({ ok: true, ...stats });
  } catch (error) {
    console.error('Podcast summarize error:', error);
    return NextResponse.json({ error: 'run failed' }, { status: 500 });
  }
}
