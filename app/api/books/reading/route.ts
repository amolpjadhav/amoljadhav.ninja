import { NextResponse } from 'next/server';
import { fetchReadingCounts } from '@/lib/books';

// Batch currently-reading counts from Open Library reading logs. Cached 12h.
// GET /api/books/reading?keys=/works/OL1W,/works/OL2W (max 12)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keys = (searchParams.get('keys') ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 12);
  try {
    const counts = await fetchReadingCounts(keys);
    const ttl = keys.length > 0 && counts.size === 0 ? 60 : 43200;
    return NextResponse.json(
      { counts: Object.fromEntries(counts) },
      { headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}` } },
    );
  } catch (error) {
    console.error('Books reading API error:', error);
    return NextResponse.json(
      { counts: {} },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
