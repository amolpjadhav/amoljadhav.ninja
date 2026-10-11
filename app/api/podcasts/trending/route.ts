import { NextResponse } from 'next/server';
import { trendingPodcasts } from '@/lib/podcasts';

// Trending podcast episodes across the curated channel list: Trending now
// (7-day velocity) plus Most watched (30-day volume). Cached 1h.
// GET /api/podcasts/trending
export async function GET() {
  try {
    const { trending, mostWatched } = await trendingPodcasts(process.env.YOUTUBE_API_KEY);
    const ttl = trending.length === 0 && mostWatched.length === 0 ? 60 : 3600;
    return NextResponse.json(
      { trending, mostWatched, fetchedAt: new Date().toISOString() },
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
