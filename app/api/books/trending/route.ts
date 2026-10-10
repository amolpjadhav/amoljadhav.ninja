import { NextResponse } from 'next/server';
import { trendingBooks, type TrendingPeriod } from '@/lib/books';

const PERIODS: TrendingPeriod[] = ['now', 'daily', 'weekly', 'monthly'];

// Trending books proxy (Open Library). Cached 30min; 200 with [] on blips.
// GET /api/books/trending?period=daily&limit=12
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('period') ?? 'daily';
  const period: TrendingPeriod = (PERIODS as string[]).includes(raw) ? (raw as TrendingPeriod) : 'daily';
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 12, 1), 24);
  try {
    const books = await trendingBooks(period, limit);
    return NextResponse.json(
      { books, period },
      { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=1800' } },
    );
  } catch (error) {
    console.error('Books trending API error:', error);
    return NextResponse.json(
      { books: [], period },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
