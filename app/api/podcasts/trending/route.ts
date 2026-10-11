import { NextResponse } from 'next/server';
import { mostWatched, trendingNow } from '@/lib/podcasts';
import { getPool, stripDescriptions } from '@/lib/podcast-pool';

// Trending podcast episodes across the curated channel list: Trending now
// (7-day velocity) plus Most watched (30-day volume). Shares one hourly
// pool fetch with the person route and homepage; cached 1h.
// GET /api/podcasts/trending
export async function GET() {
  try {
    const pool = await getPool();
    if (!pool) throw new Error('missing YouTube API key');
    const now = Date.now();
    const trending = stripDescriptions(trendingNow(pool, now));
    const mostWatchedList = stripDescriptions(mostWatched(pool, now));
    const ttl = trending.length === 0 && mostWatchedList.length === 0 ? 60 : 3600;
    return NextResponse.json(
      { trending, mostWatched: mostWatchedList, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}` } },
    );
  } catch (error) {
    console.error('Podcasts trending API error:', error);
    return NextResponse.json(
      { trending: [], mostWatched: [], fetchedAt: null, unavailable: process.env.YOUTUBE_API_KEY ? undefined : true },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
